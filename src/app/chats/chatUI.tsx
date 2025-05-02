
import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatInterface = ({ orderId, userId, role }: { orderId: string; userId: string; role: 'user' | 'admin' }) => {
  const [messages, setMessages] = useState<Array<{
    sender: 'user' | 'admin' | 'system';
    content: string;
    timestamp: Date;
  }>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState('');
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io('wss://galaxy-backend-imkz.onrender.com', {
      path: '/socket.io',
      transports: ['websocket'],
    });

    socketRef.current = socket;

    // Authenticate with the server
    socket.emit('authenticate', { userId, role, orderId });

    // Join the order chat room
    socket.emit('join-order-chat', orderId);

    // Set up event listeners
    socket.on('new-message', (message: any) => {
      setMessages(prev => [...prev, {
        sender: message.senderId.startsWith('admin_') ? 'admin' : 'user',
        content: message.content,
        timestamp: new Date(message.timestamp)
      }]);
    });

    socket.on('typing', (data: any) => {
      if (data.userId !== userId) {
        setTypingIndicator(data.isTyping ? `${data.userId} is typing...` : '');
      }
    });

    // Load message history
    const fetchMessages = async () => {
      try {
        const response = await fetch(`https://galaxy-backend-imkz.onrender.com/chats/v1/order/${orderId}`);
        const data = await response.json();
        setMessages(data.chat || []);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    fetchMessages();

    return () => {
      socket.emit('leave-order-chat', orderId);
      socket.disconnect();
    };
  }, [orderId, userId, role]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    socketRef.current.emit('new-message', {
      orderId,
      content: newMessage,
      ...(role === 'admin' && { receiverId: userId }) // Admin needs to specify receiver
    });

    // Optimistically update UI
    setMessages(prev => [...prev, {
      sender: role,
      content: newMessage,
      timestamp: new Date()
    }]);

    setNewMessage('');
    setIsTyping(false);
  };

  const handleTyping = (typing: boolean) => {
    setIsTyping(typing);
    socketRef.current.emit('typing', {
      orderId,
      isTyping: typing
    });
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg shadow-lg bg-white">
      {/* Chat header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Order #{orderId} Support</h2>
        <p className="text-sm opacity-80">
          {role === 'admin' ? 'Support Chat' : 'Chat with Support'}
        </p>
      </div>

      {/* Messages container */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-4 flex ${msg.sender === role ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === role
                ? 'bg-indigo-500 text-white rounded-br-none'
                : msg.sender === 'admin'
                  ? 'bg-gray-200 text-gray-800 rounded-bl-none'
                  : 'bg-yellow-100 text-gray-800 rounded-bl-none'
                }`}
            >
              <div className="font-medium text-xs mb-1">
                {msg.sender === 'user' ? 'You' : msg.sender === 'admin' ? 'Support' : 'System'}
              </div>
              <p>{msg.content}</p>
              <div className="text-right text-xs mt-1 opacity-70">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {typingIndicator && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg rounded-bl-none">
              {typingIndicator}
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