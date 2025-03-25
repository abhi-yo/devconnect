import { router } from "./trpc"
import { postRouter } from "./routers/post"
import { userRouter } from "./routers/user"
import { topicRouter } from "./routers/topic"
import { notificationRouter } from "./routers/notification"

export const appRouter = router({
  post: postRouter,
  user: userRouter,
  topic: topicRouter,
  notification: notificationRouter,
})

export type AppRouter = typeof appRouter 