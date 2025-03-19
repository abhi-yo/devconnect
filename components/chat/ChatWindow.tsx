import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useChat } from '@/hooks/useChat';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ChatWindowProps {
  chatId: string;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const { messages, isConnected, sendMessage } = useChat(chatId);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`);
        const data = await response.json();
        if (data.messages) {
          // The useChat hook will handle setting the messages
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.email || !messageInput.trim()) return;

    sendMessage(messageInput.trim(), session.user.email);
    setMessageInput('');
  };

  if (isLoading) {
    return (
      <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading messages...</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-2xl mx-auto">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold">Chat</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col-reverse gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.senderId === session?.user?.email ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.senderId === session?.user?.email
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="break-words">{message.content}</p>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {format(message.timestamp, 'HH:mm')}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!isConnected || !messageInput.trim()}>
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
} 