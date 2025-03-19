import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { router, publicProcedure, protectedProcedure } from "@/lib/trpc/trpc"

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
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

  getUserPosts: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const { userId } = input
    const currentUserId = ctx.session?.user ? (ctx.session.user as SessionUser).id : undefined

    const posts = await ctx.prisma.post.findMany({
      where: { authorId: userId },
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

    return postsWithLikedStatus
  }),

  getUserLikedPosts: publicProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const { userId } = input
    const currentUserId = ctx.session?.user ? (ctx.session.user as SessionUser).id : undefined

    const likes = await ctx.prisma.like.findMany({
      where: { userId },
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

    return postsWithLikedStatus
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
      await ctx.prisma.like.create({
        data: {
          userId,
          postId,
        },
      })
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

      const comment = await ctx.prisma.comment.create({
        data: {
          content,
          postId,
          authorId: userId,
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

