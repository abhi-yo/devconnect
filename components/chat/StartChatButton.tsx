import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface StartChatButtonProps {
  targetUserId: string;
  className?: string;
}

export function StartChatButton({ targetUserId, className }: StartChatButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    if (!session?.user?.email) return;
    
    try {
      setIsLoading(true);
      
      // Create the chat
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
        // Give Redis some time to update before redirecting
        // Fetch chats to refresh before navigation
        await fetch(`/api/chats?userId=${session.user.email}`);
        
        // Short delay to ensure everything is updated
        setTimeout(() => {
          // Navigate to the chat page
          router.push(`/chat?id=${data.chatId}`);
          router.refresh(); // Force refresh router cache
        }, 300);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStartChat}
      variant="secondary"
      size="sm"
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Starting...
        </>
      ) : (
        'Message'
      )}
    </Button>
  );
} 