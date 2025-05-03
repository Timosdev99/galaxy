"use client"

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

// Define types for better type safety
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

interface Chat {
  _id: string;
  orderId: string;
  customerId: string;
  adminId?: string;
  messages: Message[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

interface Order {
  orderNumber: string;
  status: string;
  _id: string;
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

// Custom hook for managing socket connection
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
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      setConnectionError(null);

      // Authenticate and join room
      socketInstance.emit('authenticate', { userId, role, orderId });
      socketInstance.emit('join-order-chat', orderId);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      setConnectionError('Failed to connect to chat server. Please refresh the page.');
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
      
      // Re-authenticate and join room after reconnection
      socketInstance.emit('authenticate', { userId, role, orderId });
      socketInstance.emit('join-order-chat', orderId);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.emit('leave-order-chat', orderId);
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
  const [chat, setChat] = useState<Chat | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<string[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use our custom socket hook
  const { socket, isConnected, connectionError } = useSocketConnection(socketUrl, userId, role, orderId);

  // Handle incoming messages from socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      const newMsg: Message = {
        ...message,
        timestamp: new Date(message.timestamp),
        _id: message._id || `temp-${Date.now()}`
      };
      
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(msg => msg._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });

      if (onNewMessage) {
        onNewMessage(newMsg);
      }

      // If the message is from someone else, mark it as read
      if (message.sender !== role) {
        markMessageAsRead(message._id);
      }
    };

    const handleTyping = (data: any) => {
      if (data.userId !== userId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    };

    const handleMessageStatus = (data: any) => {
      setMessages(prev => 
        prev.map(msg => 
          msg._id === data.messageId 
            ? { ...msg, status: data.status } 
            : msg
        )
      );
    };

    socket.on('new-message', handleNewMessage);
    socket.on('typing', handleTyping);
    socket.on('message-status-update', handleMessageStatus);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.off('message-status-update', handleMessageStatus);
    };
  }, [socket, userId, role, orderId, onNewMessage]);

  // Fetch initial chat data
  useEffect(() => {
    const fetchChatData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const token = localStorage.getItem('authToken'); // Get your auth token from wherever you store it
        const response = await axios.get(`${apiBaseUrl}/chats/v1/order/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: 1, limit: 50 }
        });
        
        if (response.data && response.data.chat) {
          setChat(response.data.chat);
          setMessages(response.data.chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
          setOrder(response.data.order);
          setHasMoreMessages(response.data.chat.messages.length >= 50);
        }
      } catch (error) {
        console.error('Failed to load chat data:', error);
        setLoadError('Failed to load chat messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
    
    // Mark messages as read when component mounts
    if (orderId) {
      markAllMessagesAsRead();
    }
  }, [apiBaseUrl, orderId]);

  // Auto-scroll to bottom with new messages
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle loading more messages when scrolling up
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoading) return;
    
    try {
      setIsLoading(true);
      const nextPage = page + 1;
      
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${apiBaseUrl}/chats/v1/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: nextPage, limit: 50 }
      });
      
      if (response.data && response.data.chat && response.data.chat.messages.length > 0) {
        const newMessages = response.data.chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMessages(prev => [...newMessages, ...prev]);
        setPage(nextPage);
        setHasMoreMessages(newMessages.length >= 50);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, orderId, page, hasMoreMessages, isLoading]);

  // Setup scroll handler for infinite loading
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (container.scrollTop < 100 && hasMoreMessages && !isLoading) {
        loadMoreMessages();
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMoreMessages, isLoading, loadMoreMessages]);

  // Mark all messages as read
  const markAllMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.patch(`${apiBaseUrl}/chats/v1/read/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Mark single message as read
  const markMessageAsRead = (messageId: string) => {
    if (!socket || !messageId) return;
    
    socket.emit('message-read', { 
      orderId,
      messageId 
    });
  };

  // Handle sending a new message
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !socket || isSending) return;
    
    try {
      setIsSending(true);
      
      // Create a temporary ID for optimistic UI update
      const tempId = `temp-${Date.now()}`;
      
      // Optimistically add message to UI
      const tempMessage: Message = {
        _id: tempId,
        sender: role,
        content: newMessage,
        timestamp: new Date(),
        read: false,
        status: 'sent'
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      setIsTyping(false);
      clearTypingTimeout();
      
      // Clear attachment selection
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        formData.append('orderId', orderId);
        formData.append('content', newMessage.trim() || '');
        
        selectedFiles.forEach(file => {
          formData.append('attachments', file);
        });
        
        const token = localStorage.getItem('authToken');
        const response = await axios.post(
          `${apiBaseUrl}/chats/v1/send-with-attachment`, 
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // Update message with server response
        if (response.data && response.data.chat) {
          // Replace temp message with real one from server
          const serverMessage = response.data.chat.messages[response.data.chat.messages.length - 1];
          
          setMessages(prev => prev.map(msg => 
            msg._id === tempId ? { 
              ...serverMessage, 
              timestamp: new Date(serverMessage.timestamp) 
            } : msg
          ));
        }
        
        setSelectedFiles([]);
        setAttachmentPreview([]);
      } else {
        // Regular text message
        socket.emit('new-message', {
          orderId,
          content: newMessage,
          ...(role === 'admin' && chat?.customerId && { receiverId: chat.customerId })
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Remove temporary message on error
      setMessages(prev => prev.filter(msg => msg._id !== `temp-${Date.now()}`));
      
      // Show error to user
      setMessages(prev => [...prev, {
        _id: `error-${Date.now()}`,
        sender: 'system',
        content: 'Failed to send message. Please try again.',
        timestamp: new Date(),
        read: true
      }]);
    } finally {
      setIsSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = (isCurrentlyTyping: boolean) => {
    if (isTyping !== isCurrentlyTyping) {
      setIsTyping(isCurrentlyTyping);
      
      if (socket) {
        socket.emit('typing', {
          orderId,
          isTyping: isCurrentlyTyping
        });
      }
      
      // Clear existing timeout
      clearTypingTimeout();
      
      // Set new timeout if typing
      if (isCurrentlyTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
          if (socket) {
            socket.emit('typing', { orderId, isTyping: false });
          }
        }, 3000);
      }
    }
  };

  // Clear typing timeout
  const clearTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Check file count
    if (files.length > 3) {
      alert('You can only upload up to 3 files at once.');
      return;
    }
    
    // Check file size (5MB per file)
    const oversizedFiles = Array.from(files).filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert(`These files exceed the 5MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    setSelectedFiles(Array.from(files));
    
    // Create previews for images
    const previews: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            setAttachmentPreview([...previews]);
          }
        };
        reader.readAsDataURL(file);
      } else {
        // For non-image files, just add the file name
        previews.push(`File: ${file.name}`);
        setAttachmentPreview([...previews]);
      }
    });
  };

  // Remove a selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setAttachmentPreview(prev => prev.filter((_, i) => i !== index));
  };

  // Render typing indicator
  const renderTypingIndicator = () => {
    if (typingUsers.size === 0) return null;
    
    const typingNames = Array.from(typingUsers).join(', ');
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none max-w-xs">
          <div className="flex items-center">
            <span className="mr-2">{typingNames} is typing</span>
            <span className="flex">
              <span className="animate-bounce mx-0.5">.</span>
              <span className="animate-bounce mx-0.5 animation-delay-200">.</span>
              <span className="animate-bounce mx-0.5 animation-delay-400">.</span>
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render message with attachments
  const renderMessage = (msg: Message, index: number) => {
    const isOwnMessage = msg.sender === role;
    
    return (
      <div
        key={msg._id || index}
        className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isOwnMessage
              ? 'bg-indigo-500 text-white rounded-br-none'
              : msg.sender === 'admin'
                ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                : msg.sender === 'system'
                  ? 'bg-yellow-100 text-gray-800'
                  : 'bg-blue-100 text-gray-800 rounded-bl-none'
          }`}
        >
          <div className="font-medium text-xs mb-1">
            {msg.sender === 'user' 
              ? (role === 'user' ? 'You' : 'Customer') 
              : msg.sender === 'admin' 
                ? (role === 'admin' ? 'You' : 'Support') 
                : 'System'}
          </div>
          
          {/* Message content */}
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          
          {/* Attachments */}
          {msg.attachments && msg.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {msg.attachments.map((attachment, i) => (
                <div key={i} className="flex items-center">
                  <a
                    href={attachment.url || `${apiBaseUrl}/chats/v1/${orderId}/messages/${msg._id}/attachments/${i}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-sm underline ${isOwnMessage ? 'text-white' : 'text-blue-600'}`}
                  >
                    {attachment.filename} ({(attachment.size / 1024).toFixed(1)} KB)
                  </a>
                </div>
              ))}
            </div>
          )}
          
          {/* Message timestamp and status */}
          <div className="flex justify-between items-center text-xs mt-1 opacity-70">
            <span>
              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {isOwnMessage && msg.status && (
              <span className="ml-2">
                {msg.status === 'sent' && '✓'}
                {msg.status === 'delivered' && '✓✓'}
                {msg.status === 'read' && '✓✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-[500px] border rounded-lg shadow-lg bg-white ${className}`}>
      {/* Chat header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">
              {order ? `Order #${order.orderNumber}` : `Order #${orderId}`}
            </h2>
            <p className="text-sm opacity-80">
              {role === 'admin' ? 'Support Chat' : 'Chat with Support'}
              {order && ` • Status: ${order.status}`}
            </p>
          </div>
          {isConnected ? (
            <span className="flex items-center text-xs">
              <span className="h-2 w-2 rounded-full bg-green-400 mr-1"></span> Connected
            </span>
          ) : (
            <span className="flex items-center text-xs">
              <span className="h-2 w-2 rounded-full bg-red-400 mr-1"></span> Disconnected
            </span>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50 relative"
      >
        {isLoading && page === 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
        
        {isLoading && page > 1 && (
          <div className="text-center py-2">
            <div className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500 mr-2"></div>
            Loading older messages...
          </div>
        )}
        
        {loadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {loadError}
            <button 
              onClick={() => window.location.reload()}
              className="underline ml-2"
            >
              Refresh
            </button>
          </div>
        )}
        
        {connectionError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
            {connectionError}
          </div>
        )}
        
        {messages.length === 0 && !isLoading && !loadError && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <svg 
              className="w-12 h-12 mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              ></path>
            </svg>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {messages.map((msg, index) => renderMessage(msg, index))}
        
        {renderTypingIndicator()}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Selected files preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pt-2 space-y-2">
          <p className="text-sm font-medium text-gray-700">Selected files:</p>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center bg-gray-100 rounded-lg p-2 text-sm">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button 
                  onClick={() => removeFile(index)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-indigo-600 transition-colors p-2"
            disabled={selectedFiles.length >= 3}
            title={selectedFiles.length >= 3 ? "Maximum 3 files allowed" : "Attach files"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
            accept="image/*,application/pdf,text/plain,.doc,.docx,.xls,.xlsx"
          />
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping(e.target.value.length > 0);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={isConnected ? "Type your message..." : "Connecting..."}
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            disabled={!isConnected || isSending}
          />
          
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && selectedFiles.length === 0) || !isConnected || isSending}
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
            {isSending ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-white"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;