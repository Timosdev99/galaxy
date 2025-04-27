// "use client";

// import { useEffect, useState, useRef } from 'react';
// import { Send, X, ArrowLeft, Ticket, Package  } from 'lucide-react';
// import axios from 'axios';
// import { io } from 'socket.io-client';
// import Image from 'next/image';


// interface Message {
//   _id: string;
//   senderId: string;
//   senderRole: 'user' | 'admin';
//   message: string;
//   timestamp: Date;
//   read: boolean;
// }

// interface Chat {
//   _id: string;
//   orderId: string;
//   customerId: string;
//   messages: Message[];
//   lastMessage: Date;
//   open: boolean;
// }

// export default function Page() {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [socket, setSocket] = useState<any>(null);
//   const [isMobileView, setIsMobileView] = useState(true);
//   const [showChatList, setShowChatList] = useState(true);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobileView(window.innerWidth < 768);
//       if (window.innerWidth >= 768) {
//         setShowChatList(true);
//       }
//     };
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!token) return;

//     const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
//       auth: { token },
//     });

//     socketInstance.on('connect', () => {
//       console.log('Socket connected');
//       setSocket(socketInstance);
//     });

//     socketInstance.on('new-message', (data: { chatId: string; sender: { id: any; role: any; }; message: any; timestamp: string | number | Date; }) => {
//         setChats(prevChats =>
//             prevChats.map(chat => {
//               if (chat._id === data.chatId) {
//                 return { ...chat, messages: [...chat.messages], lastMessage: new Date(data.timestamp) };
//               } else {
//                 return chat;
//               }
//             })
//           );
          
          

//       if (selectedChat && selectedChat._id === data.chatId) {
//         setSelectedChat(prevChat => {
//           if (!prevChat) return null;
          
//           const newMessage = {
//             _id: Date.now().toString(),
//             senderId: data.sender.id,
//             senderRole: data.sender.role,
//             message: data.message,
//             timestamp: new Date(data.timestamp),
//             read: false
//           };

//           return { ...prevChat, messages: [...prevChat.messages, newMessage], lastMessage: new Date(data.timestamp) };
//         });
//       }
//     });

//     socketInstance.on('disconnect', () => {
//       console.log('Socket disconnected');
//     });

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, []);

//   useEffect(() => {
//     const fetchChats = async () => {
//       try {
//         setLoading(true);
//         const token = localStorage.getItem('token');
//         const userRole = localStorage.getItem('userRole');
        
//         const endpoint = userRole === 'admin' ? '/chat/v1/admin' : '/chat/v1/user';
        
//         const response = await axios.get(endpoint, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         setChats(response.data.chats);
//         setLoading(false);
//       } catch (err: any) {
//         setError(err.response?.data?.message || 'Failed to fetch chats');
//         setLoading(false);
//       }
//     };

//     fetchChats();
//   }, []);

//   const handleSelectChat = async (chat: Chat) => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`/chat/v1/${chat._id}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
      
//       setSelectedChat(response.data.chat);
      
//       if (isMobileView) setShowChatList(false);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to fetch chat details');
//     }
//   };

//   const handleSendMessage = async () => {
//     if (!message.trim() || !selectedChat) return;

//     try {
//       const token = localStorage.getItem('token');
//       const userRole = localStorage.getItem('userRole');
//       let response;

//       if (userRole === 'admin') {
//         response = await axios.post('/api/chat/reply', {
//           chatId: selectedChat._id,
//           message: message.trim()
//         }, { headers: { Authorization: `Bearer ${token}` } });
//       } else {
//         response = await axios.post('/api/chat/start', {
//           orderId: selectedChat.orderId,
//           message: message.trim()
//         }, { headers: { Authorization: `Bearer ${token}` } });
//       }

//       setSelectedChat(response.data.chat);
//       socket.emit('send-message', {
//         chatId: selectedChat._id,
//         orderId: selectedChat.orderId,
//         message: message.trim(),
//         customerId: selectedChat.customerId
//       });

//       setMessage('');
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to send message');
//     }
//   };

//   const formatTime = (timestamp: Date) => new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   const formatDate = (timestamp: Date) => new Date(timestamp).toLocaleDateString();

//   const backToList = () => setShowChatList(true);

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       <div className="px-4 py-4 bg-white shadow-sm">
//         <h1 className="text-2xl font-semibold text-gray-800">Support Chats</h1>
//       </div>

//       <div className="flex flex-1 overflow-hidden">
//         {/* Chat List */}
//         {(showChatList || !isMobileView) && (
//           <div className={`${isMobileView ? 'w-full' : 'w-1/3 border-r'} bg-white overflow-y-auto`}>
//             {loading ? (
//               <div className="flex items-center justify-center h-full">
//                 <p>Loading chats...</p>
//               </div>
//             ) : chats.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                 <Package className="w-12 h-12 mb-2" />
//                 <p>No chats found</p>
//               </div>
//             ) : (
//               <ul className="divide-y divide-gray-200">
//                 {chats.map(chat => (
//                   <li 
//                     key={chat._id}
//                     className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedChat?._id === chat._id ? 'bg-blue-50' : ''}`}
//                     onClick={() => handleSelectChat(chat)}
//                   >
//                     <div className="flex justify-between items-start">
//                       <div className="flex items-center">
//                         <div className="mr-3">
//                           <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600">
//                             {chat.open ? <Ticket className="w-5 h-5" /> : <X className="w-5 h-5" />}
//                           </div>
//                         </div>
//                         <div>
//                           <p className="font-medium">Order #{chat.orderId}</p>
//                           <p className="text-sm text-gray-500">
//                             {chat.messages.length > 0 
//                               ? chat.messages[chat.messages.length - 1].message
//                               : 'No messages yet'}
//                           </p>
//                         </div>
//                       </div>
//                       <div className="text-sm text-gray-500">{formatDate(chat.lastMessage)}</div>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}

//         {/* Chat Window */}
//         {selectedChat && (
//           <div className="flex-1 flex flex-col bg-white overflow-hidden">
//             <div className="flex justify-between items-center p-4 bg-gray-200 border-b">
//               <button onClick={backToList} className="flex items-center text-gray-700">
//                 <ArrowLeft className="mr-2" />
//                 Back
//               </button>
//               <p className="text-lg font-semibold">Chat with {selectedChat.customerId}</p>
//             </div>

//             <div className="flex-1 p-4 overflow-y-auto">
//               {selectedChat.messages.map((msg, index) => (
//                 <div key={msg._id} className={`mb-4 ${msg.senderRole === 'admin' ? 'text-right' : ''}`}>
//                   <div className={`inline-block max-w-lg p-3 rounded-lg ${msg.senderRole === 'admin' ? 'bg-blue-100' : 'bg-gray-200'} shadow-sm`}>
//                     <p className="text-sm">{msg.message}</p>
//                     <div className="text-xs text-gray-500 mt-1">{formatTime(msg.timestamp)}</div>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             <div className="p-4 border-t bg-gray-50">
//               <textarea
//                 className="w-full p-3 border rounded-lg"
//                 placeholder="Type your message..."
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 rows={2}
//               />
//               <button
//                 className="w-full bg-blue-500 text-white mt-2 py-3 rounded-lg"
//                 onClick={handleSendMessage}
//                 disabled={loading || !message.trim()}
//               >
//                 {loading ? 'Sending...' : 'Send'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
