import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await getServerSession(authOptions)
  const { username } = params

  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
    },
  })

  if (!user) {
    notFound()
  }

  const isCurrentUser = session?.user && 'id' in session.user ? session.user.id === user.id : false;

  return (
    <div className="w-full">
      <ProfileHeader user={user} isCurrentUser={isCurrentUser} />
      <ProfileTabs user={user} isCurrentUser={isCurrentUser} />
    </div>
  )
}

