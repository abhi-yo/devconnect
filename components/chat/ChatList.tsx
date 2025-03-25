import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';

interface ChatListProps {
  onSelectChat: (chatId: string) => void;
  selectedChatId?: string;
}

export function ChatList({ onSelectChat, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Function to fetch chats from the server
  const fetchChats = useCallback(async () => {
    if (!session?.user?.email) return;
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/chats?userId=${encodeURIComponent(session.user.email)}`);
      
      if (!response.ok) {
        console.error('Failed to fetch chats:', response.status);
        return;
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse response JSON:', jsonError);
        return;
      }
      
      if (data && data.chats && Array.isArray(data.chats)) {
        console.log("Loaded chats:", data.chats);
        setChats(data.chats);
      } else {
        console.error('Unexpected response format');
        setChats([]);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  // Load chats when the component mounts or session changes
  useEffect(() => {
    if (session?.user?.email) {
      fetchChats();
    }
  }, [session?.user?.email, fetchChats]);

  // Format the chat display date
  const formatChatDisplay = (chatId: string) => {
    try {
      const date = new Date(parseInt(chatId));
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return `Chat ${chatId.substring(0, 8)}...`;
      }
      
      return `Chat - ${date.toLocaleDateString()}`;
    } catch (error) {
      return `Chat ${chatId.substring(0, 8)}...`;
    }
  };

  return (
    <Card className="w-64 h-[600px] flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chats</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchChats}
          disabled={isLoading}
          className="text-xs flex items-center gap-1"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          {isLoading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading && chats.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading chats...
              </p>
            </div>
          ) : chats.length > 0 ? (
            chats.map((chatId) => (
              <Button
                key={chatId}
                variant={selectedChatId === chatId ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => onSelectChat(chatId)}
              >
                {formatChatDisplay(chatId)}
              </Button>
            ))
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground">
                No chats available
              </p>
              <p className="text-xs text-muted-foreground">
                Message someone to start a chat
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
} 