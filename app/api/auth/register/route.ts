import { NextResponse } from "next/server"
import { hash } from "bcrypt"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Resend } from 'resend'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const userSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name is too long" })
    .regex(/^[a-zA-Z\s]*$/, { message: "Name can only contain letters and spaces" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(30, { message: "Username is too long" })
    .regex(/^[a-zA-Z0-9_]+$/, { 
      message: "Username can only contain letters, numbers, and underscores" 
    }),
  email: z
    .string()
    .min(1, "Email is required")
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password is too long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character",
      }
    ),
})

async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `https://devconnect-social.vercel.app/auth/verify?token=${token}`
  const isDevelopment = process.env.NODE_ENV === 'development'

  try {
    // In development or if no domain is verified, always send to your email
    const toEmail = isDevelopment || !process.env.NEXT_PUBLIC_APP_URL 
      ? 'akshatsing11@gmail.com' 
      : email

    const data = await resend.emails.send({
      from: 'DevConnect <onboarding@resend.dev>',
      to: toEmail,
      subject: 'Verify your DevConnect account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: system-ui, -apple-system, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #2563eb;">Welcome to DevConnect!</h1>
              ${isDevelopment && email !== toEmail 
                ? `<p style="color: #ef4444; padding: 10px; background: #fee2e2; border-radius: 4px;">
                    Development Mode: Email would be sent to ${email} in production.
                   </p>` 
                : ''}
              <p>Please verify your email address by clicking the link below:</p>
              <a href="${verificationUrl}" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Verify Email
              </a>
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 24 hours.<br>
                If you didn't create an account, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
      text: `Welcome to DevConnect! Please verify your email by clicking: ${verificationUrl}`,
    })

    if (data.error) {
      console.error('Resend API error:', {
        error: data.error,
        email: toEmail,
        timestamp: new Date().toISOString()
      })
      throw new Error(data.error.message || 'Failed to send verification email')
    }

    // If in development and emails are redirected, still return success
    if (isDevelopment && email !== toEmail) {
      console.log(`Development: Email would be sent to ${email}. Currently sent to ${toEmail}`)
    }

    return data
  } catch (error) {
    console.error('Email sending error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      email,
      timestamp: new Date().toISOString()
    })
    throw new Error('Failed to send verification email')
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, username, email, password } = userSchema.parse(body)

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, 
    })

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Check if username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (existingUserByUsername) {
      return NextResponse.json(
        { message: "Username is already taken" },
        { status: 409 }
      )
    }

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Hash password with a cost factor of 12
    const hashedPassword = await hash(password, 12)

    // Create user with transaction to ensure atomicity
    const user = await prisma.$transaction(async (tx) => {
      // Create the user
      const user = await tx.user.create({
        data: {
          name,
          username,
          email,
          password: hashedPassword,
          emailVerified: null,
          profile: {
            create: {
              bio: null,
              location: null,
              website: null,
              github: null,
              twitter: null,
            },
          },
          verificationTokens: {
            create: {
              token: verificationToken,
              expires: tokenExpiry,
            },
          },
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          createdAt: true,
        },
      })

      // Send verification email
      await sendVerificationEmail(email, verificationToken)

      return user
    })

    return NextResponse.json(
      { 
        message: "User created successfully. Please check your email to verify your account.", 
        user 
      }, 
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          message: "Invalid data", 
          errors: error.errors.map(e => ({
            field: e.path.join("."),
            message: e.message
          }))
        }, 
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === 'Failed to send verification email') {
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Internal server error" }, 
      { status: 500 }
    )
  }
}

