
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  // Check if user is logged in on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('toptabled-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('User loaded from localStorage:', parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('toptabled-user');
      }
    } else {
      console.log('No user found in localStorage');
    }
  }, []);

  // Mock users for demo with UUID-format IDs
  const mockUsers = [
    { 
      id: '550e8400-e29b-41d4-a716-446655440000', 
      email: 'user@example.com', 
      password: 'password', 
      name: 'Regular User', 
      isPremium: false, 
      isAdmin: false 
    },
    { 
      id: '550e8400-e29b-41d4-a716-446655440001', 
      email: 'premium@example.com', 
      password: 'password', 
      name: 'Premium User', 
      isPremium: true, 
      isAdmin: false 
    },
    { 
      id: '550e8400-e29b-41d4-a716-446655440002', 
      email: 'admin@example.com', 
      password: 'password', 
      name: 'Admin User', 
      isPremium: true, 
      isAdmin: true 
    }
  ];

  const login = async (email: string, password: string) => {
    // Mock authentication logic
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('toptabled-user', JSON.stringify(userWithoutPassword));
      console.log('User logged in:', userWithoutPassword);
      toast({
        title: "Login successful",
        description: `Welcome back, ${userWithoutPassword.name}!`,
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Try user@example.com / password",
        variant: "destructive",
      });
      throw new Error('Invalid email or password');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    // Check if user already exists
    if (mockUsers.some(u => u.email === email)) {
      toast({
        title: "Signup failed",
        description: "Email already in use",
        variant: "destructive",
      });
      throw new Error('Email already in use');
    }

    // Generate a UUID for the new user
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 
      '550e8400-e29b-41d4-a716-' + Math.floor(Math.random() * 10000000000).toString().padStart(12, '0');

    // In a real app, you would make an API call to create the user
    // For this demo, we'll just simulate a successful signup
    const newUser = {
      id: uuid,
      email,
      name,
      isPremium: false,
      isAdmin: false
    };

    setUser(newUser);
    localStorage.setItem('toptabled-user', JSON.stringify(newUser));
    console.log('New user signed up:', newUser);
    
    toast({
      title: "Signup successful",
      description: `Welcome to TopTabled, ${name}!`,
    });
  };

  const logout = () => {
    console.log('User logged out');
    setUser(null);
    localStorage.removeItem('toptabled-user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin || false;
  const isPremium = user?.isPremium || false;

  console.log('isAdmin:', isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        isPremium,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
