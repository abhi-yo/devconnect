import { useEffect, useState, useCallback, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { Message, ChatMessage } from '@/types/message';

// Global socket instance to be reused across hook instances
let globalSocket: any = null;

export const useChat = (chatId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    // Function to initialize socket connection
    const initSocket = async () => {
      // First, make a request to the socket.io API route to initialize the server
      await fetch('/api/socketio');
      
      // If we already have a global socket connection, reuse it
      if (!globalSocket) {
        try {
          console.log('Creating new global socket connection...');
          
          // Create socket connection
          globalSocket = io({
            path: '/api/socketio',
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 10,
            timeout: 30000, // Increase timeout
            transports: ['websocket', 'polling'],
          });
        } catch (error) {
          console.error('Error initializing socket:', error);
          setIsConnected(false);
          return;
        }
      }
      
      // Use the global socket
      socketRef.current = globalSocket;
      
      // Handle connection events
      const handleConnect = () => {
        console.log('Socket connected with ID:', socketRef.current?.id);
        setIsConnected(true);
        
        // Join the chat room for this chat ID
        if (socketRef.current) {
          socketRef.current.emit('join-chat', chatId);
        }
      };
      
      const handleConnectError = (error: Error) => {
        console.error('Socket connection error:', error.message);
        setIsConnected(false);
      };
      
      const handleDisconnect = (reason: string) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);
      };
      
      const handleNewMessage = (data: ChatMessage) => {
        if (data.chatId === chatId) {
          console.log('Received new message:', data.message);
          setMessages(prev => {
            // Check if we already have this message (prevent duplicates)
            if (prev.some(msg => msg.id === data.message.id)) {
              return prev;
            }
            return [data.message, ...prev];
          });
        }
      };

      // Set up event listeners
      socketRef.current.on('connect', handleConnect);
      socketRef.current.on('connect_error', handleConnectError);
      socketRef.current.on('disconnect', handleDisconnect);
      socketRef.current.on('new-message', handleNewMessage);

      // Set initial connection state
      setIsConnected(socketRef.current.connected);
      
      // Connect if not already connected
      if (!socketRef.current.connected) {
        console.log('Socket not connected, attempting to connect...');
        socketRef.current.connect();
      } else {
        // If already connected, manually join the chat
        socketRef.current.emit('join-chat', chatId);
      }
      
      // Cleanup function stored in a variable to reference the event handlers
      return () => {
        if (socketRef.current) {
          console.log('Leaving chat room:', chatId);
          socketRef.current.emit('leave-chat', chatId);
          
          // Remove our specific event listeners
          socketRef.current.off('connect', handleConnect);
          socketRef.current.off('connect_error', handleConnectError);
          socketRef.current.off('disconnect', handleDisconnect);
          socketRef.current.off('new-message', handleNewMessage);
        }
      };
    };

    // Initialize socket connection with error handling and store cleanup function
    const cleanup = initSocket().catch(error => {
      console.error('Failed to initialize socket:', error);
      return () => {}; // Return empty cleanup if initialization fails
    });

    // Return the cleanup function
    return () => {
      // Execute the cleanup function returned by initSocket
      if (cleanup && typeof cleanup.then === 'function') {
        cleanup.then(cleanupFn => {
          if (typeof cleanupFn === 'function') {
            cleanupFn();
          }
        });
      }
    };
  }, [chatId]);

  // Function to send a message
  const sendMessage = useCallback(async (content: string, senderId: string) => {
    // Generate a message
    const message: Message = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content,
      senderId,
      timestamp: Date.now(),
    };
    
    // First try WebSocket
    if (socketRef.current && socketRef.current.connected) {
      console.log('Sending message via WebSocket:', message);
      socketRef.current.emit('send-message', {
        chatId,
        message,
      });
      
      // Optimistically add message to local state
      setMessages(prev => [message, ...prev]);
    } else {
      // Fallback to REST API if WebSocket is not connected
      console.log('WebSocket not connected, using REST API fallback');
      try {
        const response = await fetch(`/api/chats/${chatId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        
        const data = await response.json();
        // Add message to local state
        setMessages(prev => [data.message, ...prev]);
      } catch (error) {
        console.error('Error sending message via REST API:', error);
      }
    }
  }, [chatId]);

  return {
    messages,
    isConnected,
    sendMessage,
  };
}; 