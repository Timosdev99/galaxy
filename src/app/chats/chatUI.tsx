"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Message {
  _id: string;
  sender: 'user' | 'admin' | 'system';
  content: string;
  timestamp: Date;
  read: boolean;
  status?: 'sent' | 'delivered' | 'read';
  attachments?: {
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }[];
}

interface ChatInterfaceProps {
  orderId: string;
  userId: string;
  role: 'user' | 'admin';
  apiBaseUrl?: string;
  socketUrl?: string;
  onNewMessage?: (message: Message) => void;
  className?: string;
}

const useSocketConnection = (socketUrl: string, userId: string, role: string, orderId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      query: { userId, role, orderId }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      
      // Authenticate and join room
      socketInstance.emit('authenticate', { userId, role, orderId });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setConnectionError('Failed to connect to chat server. Please refresh the page.');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
      socketInstance.emit('authenticate', { userId, role, orderId });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [socketUrl, userId, role, orderId]);

  return { socket, isConnected, connectionError };
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  orderId,
  userId,
  role,
  apiBaseUrl = 'https://galaxy-backend-imkz.onrender.com',
  socketUrl = 'wss://galaxy-backend-imkz.onrender.com',
  onNewMessage,
  className = ''
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, isConnected, connectionError } = useSocketConnection(socketUrl, userId, role, orderId);

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`${apiBaseUrl}/chats/v1/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.chat?.messages) {
          setMessages(response.data.chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        }
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [apiBaseUrl, orderId]);

  // Handle incoming socket messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp),
        _id: message._id || `temp-${Date.now()}`
      }]);

      if (onNewMessage) {
        onNewMessage(message);
      }
    };

    const handleTyping = (data: any) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (data.isTyping) {
          newSet.add(data.userId);
        } else {
          newSet.delete(data.userId);
        }
        return newSet;
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
    };
  }, [socket, onNewMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending messages
  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !socket || isSending) return;

    try {
      setIsSending(true);
      
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('content', newMessage);
        selectedFiles.forEach(file => formData.append('attachments', file));

        const token = localStorage.getItem('authToken');
        await axios.post(`${apiBaseUrl}/chats/v1/send-with-attachment`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setSelectedFiles([]);
      } else {
        socket.emit('new-message', { orderId, content: newMessage });
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Render UI (same as before)
  return (
    <div className={`flex flex-col h-[500px] border rounded-lg shadow-lg bg-white ${className}`}>
      {/* Chat header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Order #{orderId}</h2>
          <span className="flex items-center text-xs">
            <span className={`h-2 w-2 rounded-full mr-1 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div key={msg._id || index} className={`mb-4 flex ${msg.sender === role ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender === role 
                ? 'bg-indigo-500 text-white rounded-br-none' 
                : 'bg-gray-200 text-gray-800 rounded-bl-none'
            }`}>
              <p>{msg.content}</p>
              <div className="text-xs opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))}
            multiple
            className="hidden"
            accept="image/*,application/pdf"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-indigo-600 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={!isConnected || isSending}
          />
          
          <button
            onClick={sendMessage}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || !isConnected || isSending}
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;