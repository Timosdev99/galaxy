"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/layout/dashboardLayout';
//import ChatUI from './chatUI'; 
import { useAuth } from '../context/authContext';
import ChatUI from './chatUI';
import ChatInterface from './chatUI';

export default function ChatPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const {token, user} = useAuth()
const id = user?.id
  
//   useEffect(() => {
    
//     if (!token) {
//       router.push('/');
//     } else {
//       setIsLoading(false);
//     }
//   }, [router, token]);

//   if (isLoading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center min-h-screen">
        
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
//         </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

  return (
    <DashboardLayout>
      
      <ChatInterface orderId={''}  userId={id}  role="user"  />
      
{/* <div className="min-h-screen flex justify-center items-center bg-blue-950 text-white text-center p-5 w-full">
      <div className="container w-full min-h-screen flex justify-center items-center">
        <div className="bg-blue-900 p-6 rounded-xl shadow-lg max-w-lg w-full">
          <p className="text-lg mb-6 leading-relaxed">We are currently working on our chat system. In the meantime, please contact us on Signal.</p>
          <div className="font-bold mb-5 text-sm md:text-base">
            📱 contact us on Signal:<br />
           <button className="w-40 py-3 rounded-lg shadow-lg shadow-blue-500 bg-gradient-to-r from-indigo-500 to-purple-500">
           <a
              href="https://signal.me/#eu/ZPC2JVhP6HOFJnnJ3n-7PjYdS2CDWj10-0Dngt2CYlnPiIMLO3ZCa66AMfFMJKTp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-cyan-400 hover:underline font-semibold break-words"
            >
              Message us
            </a>
           </button>
          </div>
          <br/>
        </div>
      </div>
    </div> */}
    </DashboardLayout>
  );
}