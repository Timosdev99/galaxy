import { useState, useEffect, useRef, useCallback } from 'react';
import { Socket, io } from 'socket.io-client';
import { useAuth } from '../context/authContext';

interface ChatMessage {
  _id?: string;
  sender: 'user' | 'admin' | 'system';
  content: string;
  timestamp: Date;
  read?: boolean;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size: number;
    url?: string;
  }>;
}

interface ChatInterfaceProps {
  orderId: string;
}

const ChatInterface = ({ orderId }: ChatInterfaceProps) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io('wss://galaxy-backend-imkz.onrender.com', {
      withCredentials: true,
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection handlers
    socket.on('connect', () => {
      console.log('Connected to chat server');
      socket.emit('join-chat', { orderId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to chat server');
    });

    // Message handlers
    socket.on('new-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
    });

    socket.on('typing-start', (userId: string) => {
      if (userId !== user?.id) {
        setTypingUser(userId);
      }
    });

    socket.on('typing-stop', () => {
      setTypingUser('');
    });

    // Load initial messages
    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `https://galaxy-backend-imkz.onrender.com/chats/v1/order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.ok) throw new Error('Failed to load messages');
        
        const data = await response.json();
        setMessages(data.chat?.messages?.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 30000);

    return () => {
      clearInterval(pingInterval);
      socket.emit('leave-chat', { orderId });
      socket.disconnect();
    };
  }, [orderId, token, user?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(
        'https://galaxy-backend-imkz.onrender.com/chats/v1/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId,
            content: newMessage
          })
        }
      );

      if (!response.ok) throw new Error('Failed to send message');

      setNewMessage('');
      
      // Notify typing stopped
      if (isTyping) {
        socketRef.current?.emit('typing-stop');
        setIsTyping(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);
    
    // Handle typing indicators
    if (value && !isTyping) {
      socketRef.current?.emit('typing-start', user?.id);
      setIsTyping(true);
    } else if (!value && isTyping) {
      socketRef.current?.emit('typing-stop');
      setIsTyping(false);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        socketRef.current?.emit('typing-stop');
        setIsTyping(false);
      }
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const downloadAttachment = async (attachmentUrl: string, filename: string) => {
    try {
      const response = await fetch(attachmentUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to download attachment');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download attachment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              onClick={() => setError('')}
              className="mt-2 text-sm text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px] border rounded-lg shadow-lg bg-white">
      {/* Chat header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Order #{orderId} Support</h2>
        <p className="text-sm opacity-80">
          {user?.role === 'admin' ? 'Support Chat' : 'Chat with Support'}
        </p>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={msg._id || index}
            className={`mb-4 flex ${msg.sender === user?.role ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === user?.role
                  ? 'bg-indigo-500 text-white rounded-br-none'
                  : msg.sender === 'admin'
                  ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                  : 'bg-yellow-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="font-medium text-xs mb-1">
                {msg.sender === 'user' ? 'You' : msg.sender === 'admin' ? 'Support' : 'System'}
                {!msg.read && msg.sender !== user?.role && (
                  <span className="ml-2 text-xs text-gray-500">(unread)</span>
                )}
              </div>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              
              {/* Display attachments if any */}
              {msg.attachments?.map((attachment, idx) => (
                <div key={idx} className="mt-2">
                  <button
                    onClick={() => downloadAttachment(
                      attachment.url || '',
                      attachment.filename
                    )}
                    className="text-blue-600 hover:underline text-sm flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    {attachment.filename} ({Math.round(attachment.size / 1024)} KB)
                  </button>
                </div>
              ))}
              
              <div className="text-right text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {typingUser && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
              {typingUser === user?.id ? 'You are typing...' : 'Support is typing...'}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
          >
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
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;