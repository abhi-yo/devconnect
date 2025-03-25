import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure, protectedProcedure } from "@/lib/trpc/trpc"
import { createNotification } from "./notification"

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// Helper function to truncate text
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export const postRouter = router({
  getInfiniteFeed: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const userId = ctx.session?.user ? (ctx.session.user as SessionUser).id : undefined

      const posts = await ctx.prisma.post.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
      }

      let postsWithLikedStatus = []

      if (userId) {
        const postIds = posts.map((post) => post.id)
        const likes = await ctx.prisma.like.findMany({
          where: {
            postId: { in: postIds },
            userId,
          },
          select: {
            postId: true,
          },
        })

        const likedPostIds = new Set(likes.map((like) => like.postId))

        postsWithLikedStatus = posts.map((post) => ({
          ...post,
          likedByMe: likedPostIds.has(post.id),
        }))
      } else {
        postsWithLikedStatus = posts.map((post) => ({
          ...post,
          likedByMe: false,
        }))
      }

      return {
        items: postsWithLikedStatus,
        nextCursor,
      }
    }),

  getUserPosts: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input
      const currentUserId = ctx.session?.user ? (ctx.session.user as SessionUser).id : undefined

      const posts = await ctx.prisma.post.findMany({
        where: { authorId: userId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (posts.length > limit) {
        const nextItem = posts.pop()
        nextCursor = nextItem!.id
      }

      let postsWithLikedStatus = []

      if (currentUserId) {
        const postIds = posts.map((post) => post.id)
        const likes = await ctx.prisma.like.findMany({
          where: {
            postId: { in: postIds },
            userId: currentUserId,
          },
          select: {
            postId: true,
          },
        })

        const likedPostIds = new Set(likes.map((like) => like.postId))

        postsWithLikedStatus = posts.map((post) => ({
          ...post,
          likedByMe: likedPostIds.has(post.id),
        }))
      } else {
        postsWithLikedStatus = posts.map((post) => ({
          ...post,
          likedByMe: false,
        }))
      }

      return {
        items: postsWithLikedStatus,
        nextCursor,
      }
    }),

  getUserLikedPosts: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId, limit, cursor } = input
      const currentUserId = ctx.session?.user ? (ctx.session.user as SessionUser).id : undefined

      const likes = await ctx.prisma.like.findMany({
        where: { userId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        include: {
          post: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (likes.length > limit) {
        const nextItem = likes.pop()
        nextCursor = nextItem!.id
      }

      const posts = likes.map((like) => like.post)

      let postsWithLikedStatus = []

      if (currentUserId) {
        const postIds = posts.map((post) => post.id)
        const userLikes = await ctx.prisma.like.findMany({
          where: {
            postId: { in: postIds },
            userId: currentUserId,
          },
          select: {
            postId: true,
          },
        })

        const likedPostIds = new Set(userLikes.map((like) => like.postId))

        postsWithLikedStatus = posts.map((post) => ({
          ...post,
          likedByMe: likedPostIds.has(post.id),
        }))
      } else {
        postsWithLikedStatus = posts.map((post) => ({
          ...post,
          likedByMe: false,
        }))
      }

      return {
        items: postsWithLikedStatus,
        nextCursor,
      }
    }),

  create: protectedProcedure
    .input(z.object({ content: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const { content } = input
      const userId = ctx.user.id

      const post = await ctx.prisma.post.create({
        data: {
          content,
          authorId: userId,
        },
      })

      return post
    }),

  toggleLike: protectedProcedure.input(z.object({ postId: z.string() })).mutation(async ({ ctx, input }) => {
    const { postId } = input
    const userId = ctx.user.id

    const existingLike = await ctx.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

    if (existingLike) {
      // Unlike - just delete the like, no notification needed
      await ctx.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      })
      return { liked: false }
    } else {
      // Get post and author details for new like
      const [post, user] = await Promise.all([
        ctx.prisma.post.findUnique({
          where: { id: postId },
          include: { 
            author: {
              select: {
                id: true,
                name: true,
                username: true,
              }
            }
          },
        }),
        ctx.prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            username: true,
          }
        })
      ])

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        })
      }

      // Create like
      await ctx.prisma.like.create({
        data: {
          userId,
          postId,
        },
      })

      // Create notification for post author (if it's not their own post)
      if (post.authorId !== userId) {
        await createNotification(ctx.prisma, {
          userId: post.authorId,
          title: "New Like",
          body: `${user?.name || user?.username || 'Someone'} liked your post`,
          link: `/post/${postId}`,
          read: false
        });
      }

      return { liked: true }
    }
  }),

  getComments: publicProcedure.input(z.object({ postId: z.string() })).query(async ({ ctx, input }) => {
    const { postId } = input

    const comments = await ctx.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    })

    return comments
  }),

  addComment: protectedProcedure
    .input(z.object({ postId: z.string(), content: z.string().min(1).max(500) }))
    .mutation(async ({ ctx, input }) => {
      const { postId, content } = input
      const userId = ctx.user.id
      
      const post = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      })
      
      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        })
      }
      
      const comment = await ctx.prisma.comment.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      })
      
      // Only send notification if the post author is not the commenter
      if (post.authorId !== userId) {
        await createNotification(ctx.prisma, {
          userId: post.authorId,
          title: "New Comment",
          body: `${ctx.user.name || 'Someone'} commented on your post`,
          link: `/post/${postId}`,
          read: false
        });
      }
      
      return comment
    }),

  deletePost: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { postId } = input
      const userId = ctx.user.id

      // First check if the post exists and belongs to the user
      const post = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      })

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        })
      }

      if (post.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own posts",
        })
      }

      // Delete the post and all related data (likes and comments will be cascade deleted if set up in the schema)
      await ctx.prisma.post.delete({
        where: { id: postId },
      })

      return { success: true }
    }),

  editPost: protectedProcedure
    .input(z.object({ 
      postId: z.string(),
      content: z.string().min(1).max(500)
    }))
    .mutation(async ({ ctx, input }) => {
      const { postId, content } = input
      const userId = ctx.user.id

      // First check if the post exists and belongs to the user
      const post = await ctx.prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true }
      })

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        })
      }

      if (post.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own posts",
        })
      }

      // Update the post
      const updatedPost = await ctx.prisma.post.update({
        where: { id: postId },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      })

      return updatedPost
    }),

  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input
      const userId = ctx.user.id

      // First check if the comment exists and belongs to the user
      const comment = await ctx.prisma.comment.findUnique({
        where: { id: commentId },
        select: { authorId: true, postId: true }
      })

      if (!comment) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Comment not found",
        })
      }

      if (comment.authorId !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        })
      }

      // Delete the comment
      await ctx.prisma.comment.delete({
        where: { id: commentId },
      })

      return { success: true, postId: comment.postId }
    }),
})

