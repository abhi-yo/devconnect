import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

// Singleton socket instance to be shared across the application
let socketInstance: any = null;

/**
 * Hook for using Socket.IO connection
 * @returns Socket.IO connection state and instance
 */
export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);

  // Initialize socket connection
  useEffect(() => {
    // First ensure the Socket.IO server is initialized
    const init = async () => {
      try {
        // This endpoint initializes the Socket.IO server if it's not already running
        await fetch('/api/socketio');
        
        // Create a singleton socket instance if it doesn't exist
        if (!socketInstance) {
          console.log('Creating new socket instance...');
          
          socketInstance = io({
            path: '/api/socketio',
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
          });
          
          // Log the connection events for debugging
          socketInstance.on('connect', () => {
            console.log('Socket connected');
          });
          
          socketInstance.on('disconnect', () => {
            console.log('Socket disconnected');
          });
          
          socketInstance.on('connect_error', (err: any) => {
            console.error('Socket connection error:', err.message);
          });
        }
        
        // Store reference to singleton
        socketRef.current = socketInstance;
        
        // Update connected state
        setIsConnected(socketInstance.connected);
        
        // Setup connect/disconnect handlers
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        
        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);
        
        // Connect if not already connected
        if (!socketInstance.connected) {
          socketInstance.connect();
        } else {
          // Ensure we reflect current connection state
          setIsConnected(true);
        }
        
        // Cleanup event handlers on unmount
        return () => {
          socketInstance.off('connect', onConnect);
          socketInstance.off('disconnect', onDisconnect);
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        return () => {};
      }
    };
    
    init();
  }, []);
  
  return {
    socket: socketRef.current,
    isConnected,
  };
}

/**
 * Hook for joining and listening to a specific chat room
 * @param chatId The chat room to join
 * @returns Messages and functions to interact with the chat
 */
export function useChatRoom(chatId: string) {
  const { socket, isConnected } = useSocket();
  const [messages, setMessages] = useState<any[]>([]);
  
  // Join/leave chat room on mount/unmount
  useEffect(() => {
    if (!socket || !chatId) return;
    
    // Join the chat room
    console.log(`Joining chat room: ${chatId}`);
    socket.emit('join-chat', chatId);
    
    // Listen for new messages
    const handleNewMessage = (data: any) => {
      if (data.chatId === chatId) {
        console.log('New message received:', data.message);
        setMessages(prev => {
          // Check if we already have this message to avoid duplicates
          if (prev.some(msg => msg.id === data.message.id)) {
            return prev;
          }
          return [data.message, ...prev];
        });
      }
    };
    
    // Setup message listener
    socket.on('new-message', handleNewMessage);
    
    // Cleanup on unmount
    return () => {
      console.log(`Leaving chat room: ${chatId}`);
      socket.emit('leave-chat', chatId);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, chatId]);
  
  // Function to send a message
  const sendMessage = (content: string, senderId: string) => {
    if (!socket || !isConnected || !chatId) {
      console.error('Cannot send message: Socket not connected');
      return false;
    }
    
    // Create message object
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      content,
      senderId,
      timestamp: Date.now(),
    };
    
    // Send via socket
    socket.emit('send-message', {
      chatId,
      message,
    });
    
    // Return the message for local use (optimistic UI)
    return message;
  };
  
  // Function to load initial messages via REST API
  const loadInitialMessages = async () => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`);
      
      if (!response.ok) throw new Error('Failed to load messages');
      
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages);
        return data.messages;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading initial messages:', error);
      return [];
    }
  };
  
  return {
    messages,
    isConnected,
    sendMessage,
    loadInitialMessages,
  };
} 