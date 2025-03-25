import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { ChatMessage } from '@/types/message';

let notificationSocket: typeof Socket | null = null;

export function ChatNotifications() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user?.email) return;

    // Initialize notification socket if not already done
    if (!notificationSocket) {
      notificationSocket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
        path: '/api/socket',
        reconnection: true,
      });
    }

    // Listen for new messages
    notificationSocket.on('new-message', (data: ChatMessage) => {
      // If message is not from current user, increment unread count
      if (data.message.senderId !== session?.user?.email) {
        setUnreadCount((count) => count + 1);
      }
    });

    // Handle connection events
    notificationSocket.on('connect', () => {
      console.log('Notification socket connected');
    });

    notificationSocket.on('disconnect', () => {
      console.log('Notification socket disconnected');
    });

    // Clean up on unmount
    return () => {
      if (notificationSocket) {
        notificationSocket.off('new-message');
        notificationSocket.off('connect');
        notificationSocket.off('disconnect');
      }
    };
  }, [session?.user?.email]);

  const handleClick = () => {
    // Reset unread count and navigate to chat
    setUnreadCount(0);
    router.push('/chat');
  };

  return (
    <Button
      variant="ghost" 
      size="icon"
      onClick={handleClick}
      className="relative"
    >
      <MessageCircle size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
} 