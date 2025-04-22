import type { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';
import { addMessage } from '@/lib/redis';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponse) => {
  // Skip if server has already been initialized
  if ((res as any).socket.server.io) {
    console.log('Socket server already initialized');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');
  
  // Create Socket.IO server
  const io = new Server((res as any).socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });
  
  // Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    
    // Join a chat room
    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });
    
    // Leave a chat room
    socket.on('leave-chat', (chatId: string) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left chat: ${chatId}`);
    });
    
    // Send a message to a chat room
    socket.on('send-message', async (data: { chatId: string; message: any }) => {
      try {
        // Save message to Redis
        await addMessage(data.chatId, data.message);
        
        // Broadcast message to all clients in the chat room
        io.to(data.chatId).emit('new-message', {
          chatId: data.chatId,
          message: data.message,
        });
        
        console.log(`Message sent to chat ${data.chatId}`);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // Disconnect event
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
  
  // Save io instance to reuse on subsequent calls
  (res as any).socket.server.io = io;
  
  res.end();
};

export default SocketHandler; 