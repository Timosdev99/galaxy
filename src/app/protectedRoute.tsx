"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/authContext';
import { div } from 'framer-motion/client';


export default function ProtectedRoute({ children }: any) {
  const { isAuthenticated, isLoading }: any  = useAuth();
  const router = useRouter();


  

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
    
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
        
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500">
        </div>
        </div>
    
    );
  }

 
  return isAuthenticated ? children : null;
}