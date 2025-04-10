import { createContext, useContext, useEffect, useState, Dispatch, SetStateAction } from "react"
import { useSession } from "next-auth/react"
import { Socket } from "socket.io-client"
import { connect } from "socket.io-client"
import { trpc } from "@/lib/trpc/client"
import { toast } from "sonner"
import type { ServerToClientEvents, ClientToServerEvents } from "@/types/socket"

interface NotificationContextType {
  unreadCount: number
  setUnreadCount: Dispatch<SetStateAction<number>>
  socket: ReturnType<typeof connect> | null
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  setUnreadCount: () => {},
  socket: null,
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const [socket, setSocket] = useState<ReturnType<typeof connect> | null>(null)
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
    if (!session?.user?.email) return

    const socketInstance = connect(process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000", {
      auth: {
        userEmail: session.user.email,
      },
    })

    socketInstance.on("notification", (notification: { title: string; body: string; link?: string }) => {
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
  }, [session?.user?.email])

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, socket }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  return useContext(NotificationContext)
} 