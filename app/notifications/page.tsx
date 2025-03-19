import { Suspense } from "react"
import { Metadata } from "next"
import { NotificationList } from "./NotificationList"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = {
  title: "Notifications",
  description: "View and manage your notifications",
}

export default function NotificationsPage() {
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Notifications</h1>
      <Suspense
        fallback={
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4 rounded-lg border p-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <NotificationList />
      </Suspense>
    </div>
  )
} 