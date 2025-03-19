import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

interface StartChatButtonProps {
  targetUserId: string;
  className?: string;
}

export function StartChatButton({ targetUserId, className }: StartChatButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleStartChat = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participants: [targetUserId, session.user.email],
        }),
      });

      const data = await response.json();
      
      if (data.chatId) {
        router.push(`/chat?id=${data.chatId}`);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <Button
      onClick={handleStartChat}
      variant="secondary"
      size="sm"
      className={className}
    >
      Message
    </Button>
  );
} 