"use client"

import { useEffect } from "react"
import { useInView } from "react-intersection-observer"
import { trpc } from "@/lib/trpc/client"
import { useNotification } from "@/app/providers/NotificationProvider"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Notification {
  id: string
  title: string
  body: string
  image?: string
  link?: string
  isRead: boolean
  createdAt: string
}

export function NotificationList() {
  const { setUnreadCount } = useNotification()
  const { ref, inView } = useInView()
  const utils = trpc.useContext()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.notification.getAll.useInfiniteQuery(
    { limit: 20 },
    {
      getNextPageParam: (lastPage: { notifications: Notification[]; nextCursor?: string }) => lastPage.nextCursor,
    }
  )

  const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      setUnreadCount((prev) => Math.max(0, prev - 1))
      utils.notification.getAll.invalidate()
    },
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) return null

  const notifications = data?.pages.flatMap((page: { notifications: Notification[] }) => page.notifications) ?? []

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg font-medium text-muted-foreground">
          No notifications yet
        </p>
        <p className="text-sm text-muted-foreground">
          When you get notifications, they'll show up here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification: Notification) => (
        <div
          key={notification.id}
          className={`flex gap-4 rounded-lg border p-4 transition-colors ${
            !notification.isRead ? "bg-muted/50" : ""
          }`}
        >
          {notification.image && (
            <img
              src={notification.image}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <div className="text-sm">{notification.title}</div>
            <div className="text-sm text-muted-foreground">
              {notification.body}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
              })}
            </div>
            <div className="mt-2 flex gap-2">
              {notification.link && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead({ id: notification.id })
                    }
                    window.location.href = notification.link!
                  }}
                >
                  View
                </Button>
              )}
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAsRead({ id: notification.id })}
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  )
} 