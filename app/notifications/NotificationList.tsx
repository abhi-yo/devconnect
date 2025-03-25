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
  image: string | null
  link: string | null
  isRead: boolean
  createdAt: string
  userId: string
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
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  )

  const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      setUnreadCount((prev: number) => Math.max(0, prev - 1))
      utils.notification.getAll.invalidate()
    },
  })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, fetchNextPage])

  if (isLoading) return null

  // Remove duplicate notifications by id
  const notifications = Array.from(
    new Map(
      data?.pages
        .flatMap((page) => page.notifications)
        .map((notification) => [notification.id, notification])
    ).values()
  ) ?? []

  if (notifications.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
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
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4">
          {notifications.map((notification) => (
            <div
              key={`${notification.id}-${notification.createdAt}`}
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
      </div>
    </div>
  )
} 