import type { NextAuthOptions, Session } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import { compare } from "bcrypt"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { Adapter } from "next-auth/adapters"

interface ExtendedUser {
  id: string
  name: string
  email: string
  username: string
  image?: string
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
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "github") {
        // Generate a username from the GitHub profile
        const baseUsername = (profile as any)?.login || user.name?.toLowerCase().replace(/\s+/g, '') || user.email?.split('@')[0] || 'user'
        let username = baseUsername
        let counter = 1

        // Check if username exists and append number if needed
        while (true) {
          const existingUser = await prisma.user.findUnique({
            where: { username }
          })

          if (!existingUser) {
            break
          }

          username = `${baseUsername}${counter}`
          counter++
        }

        (user as ExtendedUser).username = username
      }
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        const extendedSession = session as ExtendedSession
        extendedSession.user = {
          id: token.id as string,
          username: token.username as string,
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || undefined,
        }
        return extendedSession
      }
      return session
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as ExtendedUser).id
        token.username = (user as ExtendedUser).username
      }

      if (trigger === "update" && session) {
        // Handle session updates if needed
        token.name = (session as ExtendedSession).user.name
        token.username = (session as ExtendedSession).user.username
      }

      return token
    },
  },
}

