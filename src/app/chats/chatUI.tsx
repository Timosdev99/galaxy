"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/authContext';

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
  orderId?: string;
  subject?: string;
  isOrderChat: boolean;
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

interface ChatInterfaceProps {
  apiBaseUrl?: string;
  socketUrl?: string;
  className?: string;
}

const useSocketConnection = (socketUrl: string, userId: string, role: string, chatId?: string, orderId?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !role) return;

    const socketInstance = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      query: { userId, role, chatId, orderId }
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
      socketInstance.emit('authenticate', { userId, role, chatId, orderId });
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
      socketInstance.emit('authenticate', { userId, role, chatId, orderId });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [socketUrl, userId, role, chatId, orderId]);

  return { socket, isConnected, connectionError };
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  apiBaseUrl = 'https://galaxy-backend-imkz.onrender.com',
  socketUrl = 'wss://galaxy-backend-imkz.onrender.com',
  className = ''
}) => {
  const { token, user } = useAuth();
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isCreatingNewChat, setIsCreatingNewChat] = useState(false);
  const [newChatSubject, setNewChatSubject] = useState('');
  const [showChatListOnMobile, setShowChatListOnMobile] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { socket, isConnected, connectionError } = useSocketConnection(
    socketUrl, 
    user?.id || '', 
    user?.role || 'user',
    activeChat?._id,
    activeChat?.orderId
  );

  
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await axios.get(`${apiBaseUrl}/chats/v1/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.chats) {
        setChats(response.data.chats);
        if (response.data.chats.length > 0 && !activeChat) {
          setActiveChat(response.data.chats[0]);
          if (isMobile) setShowChatListOnMobile(false);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, activeChat, token, isMobile]);

  
  const fetchMessages = useCallback(async () => {
    if (!activeChat || !token) return;

    try {
      setIsLoading(true);
      let response;

      if (activeChat.isOrderChat && activeChat.orderId) {
        response = await axios.get(`${apiBaseUrl}/chats/v1/order/${activeChat.orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get(`${apiBaseUrl}/chats/v1/${activeChat._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
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
  }, [apiBaseUrl, activeChat, token]);

  useEffect(() => {
    if (user?.id && token) {
      fetchChats();
    }
  }, [user?.id, token, fetchChats]);

  useEffect(() => {
    if (activeChat && token) {
      fetchMessages();
    }
  }, [activeChat, fetchMessages, token]);

  // Handle incoming socket messages
  useEffect(() => {
    if (!socket || !activeChat) return;

    const handleNewMessage = (message: any) => {
      if ((activeChat.orderId && message.orderId === activeChat.orderId) || 
          (!activeChat.orderId && message.chatId === activeChat._id)) {
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(message.timestamp),
          _id: message._id || `temp-${Date.now()}`
        }]);
      }

      setChats(prev => prev.map(chat => {
        if ((chat.orderId && message.orderId === chat.orderId) || 
            (!chat.orderId && message.chatId === chat._id)) {
          return {
            ...chat,
            lastMessage: {
              ...message,
              timestamp: new Date(message.timestamp)
            }
          };
        }
        return chat;
      }));
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
  }, [socket, activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  
  const sendMessage = async () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !socket || isSending || !activeChat || !token) return;

    try {
      setIsSending(true);
      
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        if (activeChat.orderId) {
          formData.append('orderId', activeChat.orderId);
        } else {
          formData.append('chatId', activeChat._id);
        }
        formData.append('content', newMessage);
        selectedFiles.forEach(file => formData.append('attachments', file));

        const endpoint = activeChat.orderId ? 
          `${apiBaseUrl}/chats/v1/send-with-attachment` : 
          `${apiBaseUrl}/chats/v1/${activeChat._id}/message`;

        await axios.post(endpoint, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        setSelectedFiles([]);
      } else {
        if (activeChat.orderId) {
          await axios.post(`${apiBaseUrl}/chats/v1/send`, {
            orderId: activeChat.orderId,
            content: newMessage
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } else {
          await axios.post(`${apiBaseUrl}/chats/v1/${activeChat._id}/message`, {
            content: newMessage
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
      }

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const createNewChat = async () => {
    if (!newChatSubject.trim() || !token) return;
  
    try {
      setIsLoading(true);
      const response = await axios.post(`${apiBaseUrl}/chats/v1/create`, {
        subject: newChatSubject,
        message: newMessage.trim() || "New chat started" // Default message if empty
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (response.data.chat) {
        setChats(prev => [response.data.chat, ...prev]);
        setActiveChat(response.data.chat);
        setIsCreatingNewChat(false);
        setNewChatSubject('');
        setNewMessage(''); // Clear the message input
        if (isMobile) setShowChatListOnMobile(false);
      }
    } catch (error: any) {
      console.error('Failed to create chat:', {
        error: error.response?.data || error.message,
        status: error.response?.status
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket || !activeChat) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', {
      chatId: activeChat._id,
      orderId: activeChat.orderId,
      isTyping
    });

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 3000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleChatSelect = (chat: Chat) => {
    setActiveChat(chat);
    if (isMobile) setShowChatListOnMobile(false);
  };

  const handleBackToChatList = () => {
    setShowChatListOnMobile(true);
  };

  return (
    <div className={`flex h-[calc(100vh-150px)] rounded-lg shadow-lg bg-white ${className}`}>
      {/* Chat sidebar - shown on desktop or when in list view on mobile */}
      {(showChatListOnMobile || !isMobile) && (
        <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r border-gray-200 bg-gray-50 flex flex-col`}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              {isMobile && !showChatListOnMobile ? (
                <button 
                  onClick={handleBackToChatList}
                  className="mr-2 text-gray-600 hover:text-indigo-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : null}
              <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
              <button 
                onClick={() => setIsCreatingNewChat(true)}
                className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {isCreatingNewChat && (
            <div className="p-4 border-b border-gray-200 bg-white">
              <input
                type="text"
                value={newChatSubject}
                onChange={(e) => setNewChatSubject(e.target.value)}
                placeholder="Chat subject..."
                className="w-full border rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Initial message..."
                className="w-full border rounded-lg px-4 py-2 mb-2 focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
                rows={3}
              />
              <div className="flex gap-2">
                <button
                  onClick={createNewChat}
                  disabled={!newChatSubject.trim() || !newMessage.trim()}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                    !newChatSubject.trim() || !newMessage.trim()
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreatingNewChat(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-gray-500">No chats yet. Start a new conversation!</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                    activeChat?._id === chat._id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-gray-800">
                      {chat.isOrderChat ? `Order #${chat.orderId?.slice(-6)}` : chat.subject || 'General Chat'}
                    </h3>
                    <span className="text-xs text-gray-500">
                      {chat.lastMessage ? formatTime(new Date(chat.lastMessage.timestamp)) : ''}
                    </span>
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {chat.lastMessage.sender === 'admin' ? 'Admin: ' : 'You: '}
                      {chat.lastMessage.content || 'Attachment'}
                    </p>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {chat.lastMessage ? formatDate(new Date(chat.lastMessage.timestamp)) : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main chat area - hidden on mobile when showing chat list */}
      {(!showChatListOnMobile || !isMobile) && (
        <div className={`flex-1 flex flex-col ${isMobile ? 'w-full' : ''}`}>
          {activeChat ? (
            <>
              {/* Chat header */}
              <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
                <div className="flex items-center">
                  {isMobile && (
                    <button 
                      onClick={handleBackToChatList}
                      className="mr-2 text-white hover:text-indigo-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <div>
                    <h2 className="text-lg font-semibold">
                      {activeChat.isOrderChat ? `Order #${activeChat.orderId?.slice(-6)}` : activeChat.subject || 'General Chat'}
                    </h2>
                    <div className="flex items-center mt-1">
                      <span className={`h-2 w-2 rounded-full mr-1 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                      <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
                      {connectionError && (
                        <span className="text-xs ml-2 text-yellow-300">{connectionError}</span>
                      )}
                    </div>
                  </div>
                </div>
                {typingUsers.size > 0 && (
                  <div className="text-sm italic">
                    {Array.from(typingUsers).join(', ')} is typing...
                  </div>
                )}
              </div>

              {/* Messages container */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {isLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isCurrentUser = msg.sender === user?.role;
                    const showDate = index === 0 || 
                      new Date(msg.timestamp).toDateString() !== 
                      new Date(messages[index - 1].timestamp).toDateString();

                    return (
                      <div key={msg._id || index} className="mb-4">
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                              {formatDate(new Date(msg.timestamp))}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-indigo-500 text-white rounded-br-none' 
                              : 'bg-gray-200 text-gray-800 rounded-bl-none'
                          }`}>
                            <p className="break-words">{msg.content}</p>
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="mt-2">
                                {msg.attachments.map((attachment, idx) => (
                                  <div key={idx} className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                                    <a 
                                      href={`${apiBaseUrl}/chats/v1/${activeChat._id}/messages/${msg._id}/attachments/${idx}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm flex items-center hover:underline"
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                      {attachment.filename} ({Math.round(attachment.size / 1024)} KB)
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="text-xs opacity-70 flex justify-end items-center mt-1">
                              {formatTime(new Date(msg.timestamp))}
                              {isCurrentUser && (
                                <span className="ml-1">
                                  {msg.read ? (
                                    <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.707 14.707a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 12.586l7.293-7.293a1 1 0 011.414 1.414l-8 8z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.707 14.707a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 12.586l7.293-7.293a1 1 0 011.414 1.414l-8 8z" />
                                    </svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-4 border-t bg-white rounded-b-lg">
                {selectedFiles.length > 0 && (
                  <div className="mb-2 p-2 bg-gray-100 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Attachments ({selectedFiles.length})</span>
                      <button 
                        onClick={() => setSelectedFiles([])}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-xs bg-white p-1 rounded border flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate max-w-xs">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && setSelectedFiles(Array.from(e.target.files))}
                    multiple
                    className="hidden"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-500 hover:text-indigo-600 p-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type your message..."
                    className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all"
                    disabled={!isConnected || isSending}
                  />
                  
                  <button
                    onClick={sendMessage}
                    disabled={(!newMessage.trim() && selectedFiles.length === 0) || !isConnected || isSending}
                    className={`p-2 rounded-full transition-colors ${
                      (!newMessage.trim() && selectedFiles.length === 0) || !isConnected || isSending
                        ? 'bg-indigo-300 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
              <div className="text-center max-w-md">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No chat selected</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Select a chat from the sidebar or create a new one to start messaging.
                </p>
                <button
                  onClick={() => setIsCreatingNewChat(true)}
                  className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatInterface;