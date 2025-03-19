export interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
}

export interface ChatMessage {
  chatId: string;
  message: Message;
} 