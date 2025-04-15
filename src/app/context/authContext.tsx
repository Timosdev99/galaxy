"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any | null;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

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
  const [user, setUser] = useState<any | null>(null);
  const router = useRouter();

 
  useEffect(() => {
    const validateToken = async () => {
      setIsLoading(true);
      
      try {
        // Make a request to a protected endpoint that verifies the token
        // The cookies will be sent automatically with the request
        const response = await fetch('http://localhost:3000/user/v1/validate-token', {
          method: 'GET',
          credentials: 'include', // Important for sending cookies with the request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData.user);
          setIsAuthenticated(true);
        } else {
          // Token is invalid or expired
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);


  const login = (token: string, userData: any) => {
   
    setIsAuthenticated(true);
    setUser(userData || null);
  };

  
  const logout = async () => {
    try {
     
      await fetch('http://localhost:3000/user/v1/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

   
    setIsAuthenticated(false);
    setUser(null);
    router.push('/'); 
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};