import { router } from "./trpc"
import { postRouter } from "./routers/post"
import { userRouter } from "./routers/user"
import { topicRouter } from "./routers/topic"
import { notificationRouter } from "./routers/notification"

export function createRouter() {
  return router({
    post: postRouter,
    user: userRouter,
    topic: topicRouter,
    notification: notificationRouter,
  })
} 