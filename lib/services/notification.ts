import { NotificationType, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { emitNotification } from '@/lib/websocket'

export class NotificationService {
  static async create({
    type,
    userId,
    fromUserId,
    title,
    body,
    link,
    image,
    postId,
    commentId,
  }: {
    type: NotificationType
    userId: string
    fromUserId?: string
    title: string
    body: string
    link?: string
    image?: string
    postId?: string
    commentId?: string
  }) {
    // Check user's notification preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        followNotifications: true,
        messageNotifications: true,
        commentNotifications: true,
        likeNotifications: true,
      },
    })

    if (!user) return null

    // Check if the user has enabled this type of notification
    const shouldNotify = this.shouldSendNotification(type, user)
    if (!shouldNotify) return null

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        body,
        link,
        image,
        userId,
        fromUserId,
        postId,
        commentId,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Emit real-time notification
    emitNotification(userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      link: notification.link || undefined,
      image: notification.image || undefined,
      fromUser: notification.fromUser || undefined,
      createdAt: notification.createdAt,
    })

    return notification
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        isRead: true,
      },
    })
  }

  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    })
  }

  static async delete(notificationId: string, userId: string) {
    return prisma.notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    })
  }

  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    })
  }

  static async getUserNotifications(
    userId: string,
    {
      limit = 20,
      cursor,
      includeRead = false,
    }: {
      limit?: number
      cursor?: string
      includeRead?: boolean
    }
  ) {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(includeRead ? {} : { isRead: false }),
    }

    if (cursor) {
      where.id = { lt: cursor }
    }

    return prisma.notification.findMany({
      where,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })
  }

  private static shouldSendNotification(type: NotificationType, userPreferences: {
    emailNotifications: boolean
    pushNotifications: boolean
    mentionNotifications: boolean
    followNotifications: boolean
    messageNotifications: boolean
    commentNotifications: boolean
    likeNotifications: boolean
  }) {
    if (!userPreferences.pushNotifications) return false

    switch (type) {
      case 'MENTION':
        return userPreferences.mentionNotifications
      case 'FOLLOW':
        return userPreferences.followNotifications
      case 'MESSAGE':
        return userPreferences.messageNotifications
      case 'COMMENT':
        return userPreferences.commentNotifications
      case 'LIKE':
        return userPreferences.likeNotifications
      case 'POST':
      case 'SYSTEM':
        return true
      default:
        return false
    }
  }
} 