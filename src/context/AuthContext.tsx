
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

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
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('toptabled-user');
      }
    }
  }, []);

  // Mock users for demo
  const mockUsers = [
    { id: '1', email: 'user@example.com', password: 'password', name: 'Regular User', isPremium: false, isAdmin: false },
    { id: '2', email: 'premium@example.com', password: 'password', name: 'Premium User', isPremium: true, isAdmin: false },
    { id: '3', email: 'admin@example.com', password: 'password', name: 'Admin User', isPremium: true, isAdmin: true }
  ];

  const login = async (email: string, password: string) => {
    // Mock authentication logic
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('toptabled-user', JSON.stringify(userWithoutPassword));
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

    // In a real app, you would make an API call to create the user
    // For this demo, we'll just simulate a successful signup
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      email,
      name,
      isPremium: false,
      isAdmin: false
    };

    setUser(newUser);
    localStorage.setItem('toptabled-user', JSON.stringify(newUser));
    
    toast({
      title: "Signup successful",
      description: `Welcome to TopTabled, ${name}!`,
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('toptabled-user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin || false,
        isPremium: user?.isPremium || false,
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
