import { Server as NetServer } from "http"
import { NextApiResponse } from "next"
import { Server as ServerIO } from "socket.io"
import { Socket } from "socket.io-client"

export interface ServerToClientEvents {
  notification: (notification: {
    title: string
    body: string
    link?: string | null
  }) => void
}

export interface ClientToServerEvents {
  join: (userId: string) => void
  leave: (userId: string) => void
}

export interface InterServerEvents {
  ping: () => void
}

export interface SocketData {
  userId: string
}

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: ServerIO
    }
  }
}

declare module "socket.io-client" {
  export interface Socket {
    auth: {
      userId?: string
    }
  }
} 