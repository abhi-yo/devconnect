'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';

function ChatContent() {
  const searchParams = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    const chatId = searchParams.get('id');
    if (chatId) {
      setSelectedChatId(chatId);
    }
  }, [searchParams]);

  return (
    <div className="flex gap-4">
      <ChatList
        onSelectChat={(chatId) => setSelectedChatId(chatId)}
        selectedChatId={selectedChatId || undefined}
      />
      {selectedChatId ? (
        <ChatWindow chatId={selectedChatId} />
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
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ChatContent />
      </Suspense>
    </div>
  );
} 