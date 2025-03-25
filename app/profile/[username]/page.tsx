import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileHeader from "@/components/profile/profile-header"
import ProfileTabs from "@/components/profile/profile-tabs"
import ClientProfilePage from "./client-page"

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

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
      _count: {
        select: {
          followers: true,
          following: true,
        },
      },
    },
  })

  if (!user) {
    notFound()
  }

  const isCurrentUser = session?.user && 'id' in session.user ? session.user.id === user.id : false;

  // Check if the current user is following this profile
  let isFollowing = false;
  if (session?.user && 'id' in session.user && !isCurrentUser) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: (session.user as SessionUser).id,
          followingId: user.id,
        },
      },
    });
    isFollowing = !!follow;
  }

  return <ClientProfilePage user={user} isCurrentUser={isCurrentUser} initialIsFollowing={isFollowing} />
}

