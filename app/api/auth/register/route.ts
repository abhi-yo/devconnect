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
  // Always use the production URL when deployed
  const verificationUrl = `https://devconnect-social.vercel.app/auth/verify?token=${token}`

  try {
    const data = await resend.emails.send({
      from: 'DevConnect <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to DevConnect - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your DevConnect Account</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f4f4f5;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <h1 style="color: #18181b; margin: 0 0 20px 0; font-size: 24px;">Welcome to DevConnect!</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0;">
                        <p style="color: #3f3f46; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                          Thanks for joining DevConnect! Please verify your email address to get started.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td align="center" style="padding: 20px 0;">
                        <a href="${verificationUrl}" 
                           style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: 500;">
                          Verify Email Address
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 0; border-top: 1px solid #e4e4e7;">
                        <p style="color: #71717a; font-size: 14px; margin: 0;">
                          This verification link will expire in 24 hours. If you didn't create a DevConnect account, you can safely ignore this email.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
      text: `Welcome to DevConnect! Please verify your email by clicking this link: ${verificationUrl} (Link expires in 24 hours)`,
    })

    if (data.error) {
      console.error('Resend API error:', {
        error: data.error,
        email,
        timestamp: new Date().toISOString()
      })
      throw new Error('Failed to send verification email')
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

