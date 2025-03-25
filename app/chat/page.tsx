'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

function ChatContent() {
  const searchParams = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now());

  // Update selected chat ID when URL changes
  useEffect(() => {
    const chatId = searchParams?.get('id');
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, [searchParams]);

  // Handle chat selection
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // Update URL without navigation
    window.history.pushState({}, '', `/chat?id=${chatId}`);
  };

  // Function for manual refresh
  const refreshAll = () => {
    setKey(Date.now());
  };

  return (
    <div className="flex gap-4">
      <ChatList
        onSelectChat={handleSelectChat}
        selectedChatId={selectedChatId || undefined}
        key={`chat-list-${key}`}
      />
      {selectedChatId ? (
        <ChatWindow 
          chatId={selectedChatId} 
          key={`chat-window-${selectedChatId}-${key}`}
          onMessageSent={refreshAll}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            Select a chat to start messaging
          </p>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());
  
  const handleRefresh = () => {
    setRefreshKey(Date.now());
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      <ChatContent key={`chat-content-${refreshKey}`} />
    </div>
  );
} 