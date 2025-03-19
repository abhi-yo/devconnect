import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';
import { Message, ChatMessage } from '@/types/message';

let socket: typeof Socket | null = null;

export const useChat = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initSocket = async () => {
      if (!socket) {
        // Create socket connection
        socket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
          path: '/api/socket',
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });
      }

      // Handle connection events
      socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
        setIsConnected(true);
        socket?.emit('join-chat', chatId);
      });

      socket.on('connect_error', () => {
        console.error('Socket connection error');
        setIsConnected(false);
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Handle chat messages
      socket.on('new-message', (data: ChatMessage) => {
        if (data.chatId === chatId) {
          setMessages(prev => [data.message, ...prev]);
        }
      });

      // Connect if not already connected
      if (!socket.connected) {
        socket.connect();
      }
    };

    initSocket().catch(console.error);

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave-chat', chatId);
        socket.off('new-message');
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
      }
    };
  }, [chatId]);

  const sendMessage = useCallback((content: string, senderId: string) => {
    if (socket && isConnected) {
      const message: Message = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content,
        senderId,
        timestamp: Date.now(),
      };

      socket.emit('send-message', {
        chatId,
        message,
      });
    }
  }, [chatId, isConnected]);

  return {
    messages,
    isConnected,
    sendMessage,
  };
}; 