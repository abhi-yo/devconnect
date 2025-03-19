import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { io, Socket } from "socket.io-client"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"

type NotificationContextType = {
  unreadCount: number
  setUnreadCount: (count: number) => void
  socket: Socket | null
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  socket: null,
})

export const useNotification = () => useContext(NotificationContext)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const { data: initialUnreadCount } = trpc.notification.getUnreadCount.useQuery(undefined, {
    enabled: !!session,
  })

  useEffect(() => {
    if (initialUnreadCount !== undefined) {
      setUnreadCount(initialUnreadCount)
    }
  }, [initialUnreadCount])

  useEffect(() => {
    if (!session?.user?.id) return

    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      auth: {
        userId: session.user.id,
      },
    })

    socketInstance.on("notification", (notification) => {
      setUnreadCount((prev) => prev + 1)
      toast(notification.title, {
        description: notification.body,
        action: notification.link
          ? {
              label: "View",
              onClick: () => window.location.href = notification.link!,
            }
          : undefined,
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [session?.user?.id])

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, socket }}>
      {children}
    </NotificationContext.Provider>
  )
} 