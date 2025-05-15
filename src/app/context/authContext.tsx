"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  token: null,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
    
    checkAuth(storedToken);
  }, []);
  
  const checkAuth = async (existingToken: string | null) => {
    setIsLoading(true);
    
    if (!existingToken) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }
    
    try {
      //console.log('checking authentication status with token:', existingToken);
      
      
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/validate-token', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${existingToken}`  
        },
      });
      
     // console.log('auth check response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
       // console.log('User authenticated:', userData);
        
        if (userData && userData.user) {
          setUser(userData.user);
          setIsAuthenticated(true);
        } else {
          console.warn('Valid response but missing user data');
          handleAuthFailure();
        }
      } else {
        console.log('Not authenticated:', response.status);
        handleAuthFailure();
      }
    } catch (error) {
      console.error('Auth check error:', error);
      handleAuthFailure();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAuthFailure = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };
  
  const login = (newToken: string, userData: User) => {
    console.log('Login successful, setting user data and token');
    
    if (newToken && userData) {
      
      setToken(newToken);
      localStorage.setItem('auth_token', newToken);
      
      
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      console.error('Login attempted with invalid token or user data');
    }
  };
  
  const logout = async () => {
    try {
      if (token) {
        const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  
          },
        });
        
        console.log('Logout response:', response.status);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
     
      handleAuthFailure();
      router.push('/');
    }
  };
  
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};