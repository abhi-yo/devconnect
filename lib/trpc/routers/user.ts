import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure, protectedProcedure, type AuthenticatedContext } from "@/lib/trpc/trpc"
import { hash, compare } from "bcrypt"
import type { User as AuthUser } from "next-auth"

// Define a type that mirrors ExtendedUser from auth.ts for assertion
interface SessionUser extends AuthUser {
  id: string
  username?: string // username might not always be present depending on provider/token
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().nullable(),
  location: z.string().nullable(),
  website: z.string().url().nullable(),
  github: z.string().nullable(),
  twitter: z.string().nullable(),
  image: z.string().url().nullable(),
  banner: z.string().url().nullable(),
})

const accountSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "Password must be at least 8 characters").optional(),
})

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  mentionNotifications: z.boolean(),
  followNotifications: z.boolean(),
  messageNotifications: z.boolean(),
  browserNotifications: z.boolean(),
})

const privacySettingsSchema = z.object({
  profileVisibility: z.enum(["public", "private", "hidden"]),
  showEmail: z.boolean(),
  showLocation: z.boolean(),
  allowMessaging: z.boolean(),
})

const appearanceSettingsSchema = z.object({
  theme: z.enum(["system", "light", "dark"]),
  fontSize: z.enum(["small", "medium", "large"]),
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
})

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  loginNotifications: z.boolean(),
  trustedDevices: z.array(z.string()),
})

const deleteAccountSchema = z.object({
  password: z.string(),
  reason: z.string().optional(),
})

export const userRouter = router({
  getPublicProfile: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ ctx, input }) => {
      const { username } = input;
      const sessionUser = ctx.session?.user as SessionUser | undefined;
      const currentUserId = sessionUser?.id;

      const user = await ctx.prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          createdAt: true, // For Joined Date
          profile: {
            select: {
              bio: true,
              location: true,
              website: true,
              banner: true,
              github: true, // Include github/twitter if needed
              twitter: true,
            },
          },
          _count: {
            select: {
              followers: true,
              following: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `User with username "${username}" not found.`,
        });
      }

      // Check if the current session user is following this profile user
      let isFollowing = false;
      if (currentUserId && currentUserId !== user.id) {
        const follow = await ctx.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: user.id,
            },
          },
          select: { id: true }, // Only need to know if it exists
        });
        isFollowing = !!follow;
      }

      // Combine results into the expected structure
      return {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        joinedDate: user.createdAt.toISOString(), // Send as ISO string
        bio: user.profile?.bio,
        location: user.profile?.location,
        website: user.profile?.website,
        banner: user.profile?.banner,
        github: user.profile?.github,
        twitter: user.profile?.twitter,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        isFollowing,
      };
    }),

  getSuggestedUsers: publicProcedure.query(async ({ ctx }) => {
    // Assert the type if user exists
    const sessionUser = ctx.session?.user as SessionUser | undefined;
    const userId = sessionUser?.id;

    // If user is logged in, exclude them and users they follow
    let excludeUserIds: string[] = []
    let following: { followingId: string }[] = []

    if (userId) {
      following = await ctx.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      })

      excludeUserIds = [userId]
    }

    const users = await ctx.prisma.user.findMany({
      where: {
        id: { notIn: excludeUserIds },
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    })

    // Add isFollowing status to each user
    return users.map(user => ({
      ...user,
      isFollowing: following.some(f => f.followingId === user.id)
    }))
  }),

  searchUsers: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const { query } = input;
      if (query.length < 2) {
        // Return empty array if query is too short to avoid excessive searching
        return [];
      }

      const users = await ctx.prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query,
                mode: 'insensitive', // Case-insensitive search
              },
            },
            {
              username: {
                contains: query,
                mode: 'insensitive',
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
        },
        take: 10, // Limit the number of results
      });

      return users;
    }),

  toggleFollow: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input
      const currentUserId = ctx.user.id

      if (userId === currentUserId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot follow yourself",
        })
      }

      const existingFollow = await ctx.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      })

      if (existingFollow) {
        await ctx.prisma.follow.delete({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: userId,
            },
          },
        })
        return { following: false }
      } else {
        await ctx.prisma.follow.create({
          data: {
            followerId: currentUserId,
            followingId: userId,
          },
        })
        return { following: true }
      }
    }),

  updateProfile: protectedProcedure.input(profileSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id

    const updatedUser = await ctx.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        image: input.image,
        profile: {
          upsert: {
            create: {
              bio: input.bio,
              location: input.location,
              website: input.website,
              github: input.github,
              twitter: input.twitter,
              banner: input.banner,
            },
            update: {
              bio: input.bio,
              location: input.location,
              website: input.website,
              github: input.github,
              twitter: input.twitter,
              banner: input.banner,
            },
          },
        },
      },
      include: {
        profile: true,
      },
    })

    return updatedUser
  }),

  updateAccount: protectedProcedure.input(accountSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.user.id

    // Check if email is already taken by another user
    const existingUserByEmail = await ctx.prisma.user.findFirst({
      where: {
        email: input.email,
        NOT: {
          id: userId,
        },
      },
    })

    if (existingUserByEmail) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email is already taken",
      })
    }

    // Check if username is already taken by another user
    const existingUserByUsername = await ctx.prisma.user.findFirst({
      where: {
        username: input.username,
        NOT: {
          id: userId,
        },
      },
    })

    if (existingUserByUsername) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Username is already taken",
      })
    }

    // If changing password, verify current password
    if (input.currentPassword && input.newPassword) {
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (!user?.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No password set for this account",
        })
      }

      const isPasswordValid = await compare(input.currentPassword, user.password)

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current password is incorrect",
        })
      }
    }

    // Update user data
    const updateData: any = {
      email: input.email,
      username: input.username,
    }

    if (input.newPassword) {
      updateData.password = await hash(input.newPassword, 10)
    }

    const updatedUser = await ctx.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
      },
    })

    return updatedUser
  }),

  updateNotificationSettings: protectedProcedure
    .input(notificationSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      return input
    }),

  getSettings: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    const user = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    })

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    return {
      profile: {
        name: user.name,
        bio: user.profile?.bio,
        location: user.profile?.location,
        website: user.profile?.website,
        github: user.profile?.github,
        twitter: user.profile?.twitter,
        image: user.image,
        banner: user.profile?.banner,
      },
      account: {
        email: user.email,
        username: user.username,
      },
      notifications: {
        emailNotifications: true,
        mentionNotifications: true,
        followNotifications: true,
        messageNotifications: true,
        browserNotifications: true,
      },
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showLocation: true,
        allowMessaging: true,
      },
      appearance: {
        theme: "system",
        fontSize: "medium",
        reducedMotion: false,
        highContrast: false,
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true,
        trustedDevices: [],
      },
    }
  }),

  updatePrivacySettings: protectedProcedure
    .input(privacySettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      return input
    }),

  updateAppearanceSettings: protectedProcedure
    .input(appearanceSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      return input
    }),

  updateSecuritySettings: protectedProcedure
    .input(securitySettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      return input
    }),

  deleteAccount: protectedProcedure
    .input(deleteAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id
      const { password, reason } = input

      // Verify password
      const user = await ctx.prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (!user?.password) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No password set for this account",
        })
      }

      const isPasswordValid = await compare(password, user.password)

      if (!isPasswordValid) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Incorrect password",
        })
      }

      // Delete user data
      await ctx.prisma.user.delete({
        where: { id: userId },
      })

      return { success: true }
    }),

  exportUserData: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id

    // Fetch all user data
    const userData = await ctx.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        posts: {
          include: {
            likes: true,
            comments: true,
          },
        },
        comments: true,
        likes: true,
        followers: true,
        following: true
      },
    })

    if (!userData) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      })
    }

    // Remove sensitive information
    const { password, ...userDataWithoutPassword } = userData

    return userDataWithoutPassword
  }),
})

