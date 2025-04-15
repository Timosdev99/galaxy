"use client";
import React, { useState, useEffect } from "react";
import { X, Send, CheckCircle, User, Mail, Lock, LogIn, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from '../context/authContext';
import { useRouter } from 'next/navigation';

interface AuthField {
  name: string;
  id: string;
  type: string;
  icon: React.ReactNode;
  placeholder: string;
}

const LoginFields: AuthField[] = [
  { 
    name: "Email", 
    id: "email", 
    type: "email",
    icon: <Mail className="text-gray-500" size={18} />,
    placeholder: "Enter your email"
  },
  { 
    name: "Password", 
    id: "password", 
    type: "password",
    icon: <Lock className="text-gray-500" size={18} />,
    placeholder: "Enter your password"
  },
];

const RegisterFields: AuthField[] = [
  { 
    name: "Name", 
    id: "name", 
    type: "text",
    icon: <User className="text-gray-500" size={18} />,
    placeholder: "Enter your full name"
  },
  { 
    name: "Email", 
    id: "email", 
    type: "email",
    icon: <Mail className="text-gray-500" size={18} />,
    placeholder: "Enter your email"
  },
  { 
    name: "Password", 
    id: "password", 
    type: "password",
    icon: <Lock className="text-gray-500" size={18} />,
    placeholder: "Create a password"
  },
];

interface AuthDisplayProps {
  fields: AuthField[];
  onInputChange: (id: string, value: string) => void;
}

const AuthDisplay = ({ fields, onInputChange }: AuthDisplayProps) => {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col">
          <label
            htmlFor={field.id}
            className="text-sm font-medium text-gray-700 mb-1"
          >
            {field.name}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {field.icon}
            </div>
            <input
              className="w-full border text-black border-gray-300 rounded-md p-2 pl-10 
                       focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all"
              type={field.type}
              name={field.id}
              id={field.id}
              onChange={(e) => onInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

interface FormData {
  [key: string]: string | undefined;
}

const SignupModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState<FormData>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const { login: authLogin, logout: authLogout, user, isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleModal = () => {
    if (!isModalOpen) {
      setIsModalOpen(true);
      setTimeout(() => setIsModalVisible(true), 10);
    } else {
      setIsModalVisible(false);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSubmitted(false);
        setFormData({});
        setError(null);
      }, 300);
    }
  };

  const handleInputChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(null); 
  };

  const toggleAuthMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({});
    setError(null);
  };

  const signUp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/signUp', {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'user' // user is default role 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to sign up');
      }

     
      const data = await response.json();
      
      
      authLogin("", data.user);

      setIsSubmitted(true);
      setTimeout(() => {
        toggleModal();
        
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://galaxy-backend-imkz.onrender.com/user/v1/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
      }

    
      const data = await response.json();
      
   
      authLogin("", data.user);

      setIsSubmitted(true);
      setTimeout(() => {
        toggleModal();
        
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setIsProfileDropdownOpen(false);
  };

  const handleSubmit = () => {
    const relevantFields = isRegistering ? RegisterFields : LoginFields;
    const isValid = relevantFields.every((field) => 
      formData[field.id] && formData[field.id]!.trim() !== ""
    );

    if (isValid) {
      if (isRegistering) {
        signUp();
      } else {
        handleLogin();
      }
    } else {
      setError("Please fill in all fields");
    }
  };

  const navigateToDashboard = () => {
    router.push('/dashboard');
    setIsProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  
  const getUserInitial = () => {
    return user && user.name ? user.name.charAt(0).toUpperCase() : "";
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button 
          onClick={toggleModal}
          className="bg-gradient-to-r from-blue-600 cursor-pointer lg:font-bold to-indigo-600 text-white lg:text-xl sm:py-4 sm:px-3 sm:rounded-sm px-5 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
        >
          Login / Register
        </button>
      ) : (
        <div className="relative">
          <button 
            onClick={toggleProfileDropdown}
            className="flex items-center space-x-2 focus:outline-none"
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">{getUserInitial()}</span>
            </div>
            <ChevronDown className="h-5 w-5 text-gray-700" />
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm font-medium text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {user?.id}</p>
              </div>
              <div className="py-1">
                <button 
                  onClick={navigateToDashboard}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div
          className={`fixed inset-0 bg-transparent transition-all duration-300 ease-in-out backdrop-blur-sm flex justify-center items-center z-50 p-4 ${
            isModalVisible ? "pointer-events-auto" : "pointer-events-none opacity-0"
          }`}
          onClick={toggleModal}
        >
          <div
            className={`bg-white/95 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 relative transition-all duration-300 ease-in-out transform ${
              isModalVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {!isSubmitted ? (
              <>
                <div className="mb-6">
                  <button 
                    onClick={toggleModal}
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                  >
                    <X size={24} />
                  </button>
                  
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isRegistering ? "Create an Account" : "Welcome Back"}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {isRegistering 
                      ? "Sign up to get started with our services" 
                      : "Sign in to access your account"}
                  </p>
                </div>

                <div className="space-y-6">
                  <AuthDisplay 
                    fields={isRegistering ? RegisterFields : LoginFields}
                    onInputChange={handleInputChange} 
                  />

                  {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                      <p>{error}</p>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className={`w-full ${isLoading ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'} text-white font-bold py-3 rounded-md transition-colors flex items-center justify-center space-x-2`}
                  >
                    {isLoading ? (
                      <span>Processing...</span>
                    ) : (
                      <>
                        {isRegistering ? <Send size={20} /> : <LogIn size={20} />}
                        <span>{isRegistering ? "Sign Up" : "Sign In"}</span>
                      </>
                    )}
                  </button>
                  
                  <div className="text-center pt-2">
                    <button 
                      onClick={toggleAuthMode}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      {isRegistering 
                        ? "Already have an account? Sign in" 
                        : "Don't have an account? Sign up"}
                    </button>
                  </div>
                </div>
              </>
            ) 
            : (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <CheckCircle
                  size={64}
                  className="text-green-500 animate-bounce"
                />
                <h3 className="text-2xl font-bold text-gray-800">
                  {isRegistering ? "Registration Successful!" : "Login Successful!"}
                </h3>
                <p className="text-gray-600 text-center">
                  {isRegistering 
                    ? "Your account has been created. Welcome aboard!" 
                    : "Welcome back! You're now signed in."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupModal;