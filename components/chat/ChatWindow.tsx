import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { Message } from '@/types/message';
import { useChatRoom } from '@/hooks/useSocket';

interface ChatWindowProps {
  chatId: string;
  onMessageSent?: () => void;
}

export function ChatWindow({ chatId, onMessageSent }: ChatWindowProps) {
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [partnerName, setPartnerName] = useState<string>('Chat');
  const { data: session } = useSession();
  
  // Use the new socket-based chat room hook
  const { messages, isConnected, sendMessage, loadInitialMessages } = useChatRoom(chatId);
  
  // Load initial data when the component mounts
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // Load initial messages from the server
        await loadInitialMessages();
        
        // Load chat member info
        try {
          const membersResponse = await fetch(`/api/chats/${chatId}/members`);
          if (membersResponse.ok) {
            const membersData = await membersResponse.json();
            
            if (membersData.members && Array.isArray(membersData.members)) {
              // Find the member that isn't the current user
              const partner = membersData.members.find(
                (member: any) => member.email !== session?.user?.email
              );
              
              if (partner) {
                setPartnerName(partner.name || partner.email || 'Chat Partner');
              }
            }
          }
        } catch (error) {
          console.log('Could not load chat members');
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session?.user?.email && chatId) {
      loadData();
    }
  }, [chatId, session?.user?.email, loadInitialMessages]);

  // Function to handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email || !messageInput.trim() || !chatId) return;
    
    // Send the message using our socket hook
    const sentMessage = sendMessage(messageInput.trim(), session.user.email);
    
    // Clear the input
    setMessageInput('');
    
    // Notify parent component if needed
    if (sentMessage && onMessageSent) {
      onMessageSent();
    }
  };

  // Function to refresh messages
  const handleRefresh = () => {
    loadInitialMessages();
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
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">{partnerName}</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col-reverse gap-4">
          {messages.length > 0 ? (
            messages.map((message) => (
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
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start a conversation!</p>
            </div>
          )}
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
          <Button type="submit" disabled={!messageInput.trim() || !isConnected}>
            Send
          </Button>
        </div>
        {!isConnected && (
          <p className="text-xs text-red-500 mt-2">
            Not connected to chat server. Messages can't be sent right now.
          </p>
        )}
      </form>
    </Card>
  );
} 