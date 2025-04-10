import type { NextAuthOptions, Session, User } from "next-auth"
import type { JWT } from "next-auth/jwt"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"
import { rateLimit } from "@/lib/rate-limit"

interface ExtendedUser extends User {
  id: string
  username: string
}

interface ExtendedSession extends Session {
  user: ExtendedUser
}

// Create a custom adapter from PrismaAdapter to fix the bio field issue
const customPrismaAdapter = (): Adapter => {
  const adapter = PrismaAdapter(prisma)
  
  // Override the getUserByAccount method to handle the bio field issue
  const originalGetUserByAccount = adapter.getUserByAccount
  adapter.getUserByAccount = async function (providerAccount) {
    try {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: providerAccount.provider,
            providerAccountId: providerAccount.providerAccountId,
          },
        },
        select: {
          userId: true,
        },
      })

      if (!account) return null

      const user = await prisma.user.findUnique({
        where: { id: account.userId },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          emailVerified: true,
          password: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return user
    } catch (error) {
      console.error("Custom adapter getUserByAccount error:", error)
      return null
    }
  }

  return adapter
}

export const authOptions: NextAuthOptions = {
  adapter: customPrismaAdapter(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing credentials")
        }

        // Rate limiting
        const identifier = `auth_${credentials.email}`
        const { success } = await rateLimit(identifier)
        if (!success) {
          throw new Error("Too many attempts. Please try again later.")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            username: true,
            emailVerified: true,
          },
        })

        if (!user || !user.password) {
          throw new Error("No user found")
        }

        if (!user.emailVerified) {
          throw new Error("Please verify your email before signing in")
        }

        const passwordValid = await compare(credentials.password, user.password)

        if (!passwordValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Always allow GitHub sign in
      if (account?.provider === "github") {
        return true
      }

      // For credentials, check if email is verified
      if (account?.provider === "credentials") {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { emailVerified: true }
        })
        return Boolean(dbUser?.emailVerified)
      }

      return true
    },
    async session({ session, token }): Promise<ExtendedSession> {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          username: token.username as string,
        },
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.username = (user as ExtendedUser).username
      }
      if (trigger === "update" && session) {
        token.name = session.user.name
        token.username = (session.user as ExtendedUser).username
      }
      return token
    }
  },
}

