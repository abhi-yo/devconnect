import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<string[]>([]);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchChats = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/chats?userId=${session.user.id}`);
        const data = await response.json();
        setChats(data.chats);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, [session?.user?.id]);

  return (
    <Card className="w-64 h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {chats.map((chatId) => (
            <Button
              key={chatId}
              variant={selectedChatId === chatId ? "secondary" : "ghost"}
              className="w-full justify-start mb-1"
              onClick={() => onSelectChat(chatId)}
            >
              Chat {chatId.slice(0, 8)}...
            </Button>
          ))}
          {chats.length === 0 && (
            <p className="text-sm text-muted-foreground text-center p-4">
              No chats available
            </p>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
} 