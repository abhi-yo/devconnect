import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getChatMembers } from '@/lib/redis';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Access the chatId directly from the params object
    const chatId = params.chatId;
    console.log("GET members for chatId:", chatId);

    // Get member IDs from Redis
    const memberIds = await getChatMembers(chatId);
    
    if (!memberIds.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'You are not a member of this chat' },
        { status: 403 }
      );
    }

    // Fetch user details from database
    const members = await Promise.all(
      memberIds.map(async (email: string) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              username: true,
            },
          });
          return user;
        } catch (error) {
          console.error(`Error fetching user details for ${email}:`, error);
          // Return basic info if we can't get user details
          return { email };
        }
      })
    );

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching chat members:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 