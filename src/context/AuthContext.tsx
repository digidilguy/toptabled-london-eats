
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Set up auth state listener and check for existing session
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        if (currentSession?.user) {
          const { id, email } = currentSession.user;
          
          // Map Supabase user to our application user format
          const user: AuthUser = {
            id,
            email: email || 'unknown',
            name: email?.split('@')[0] || 'User',
            isPremium: email === 'premium@example.com',
            isAdmin: email === 'admin@example.com',
          };
          
          setAuthUser(user);
          console.log('Auth state changed:', event, user);
        } else {
          setAuthUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        const { id, email } = currentSession.user;
        
        // Map Supabase user to our application user format
        const user: AuthUser = {
          id,
          email: email || 'unknown',
          name: email?.split('@')[0] || 'User',
          isPremium: email === 'premium@example.com',
          isAdmin: email === 'admin@example.com',
        };
        
        setAuthUser(user);
        console.log('Existing session found:', user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Mock users for demo - kept here for reference
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
    try {
      // Trim email to prevent whitespace issues
      const trimmedEmail = email.trim();
      
      // Basic email validation
      if (!isValidEmail(trimmedEmail)) {
        toast({
          title: "Invalid email format",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        throw new Error("Invalid email format");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail, 
        password
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password. Try user@example.com / password",
          variant: "destructive",
        });
        throw error;
      }
      
      // Success notifications handled by onAuthStateChange
      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      // Trim email to prevent whitespace issues
      const trimmedEmail = email.trim();
      
      // Basic email validation
      if (!isValidEmail(trimmedEmail)) {
        toast({
          title: "Invalid email format",
          description: "Please enter a valid email address",
          variant: "destructive",
        });
        throw new Error("Invalid email format");
      }
      
      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        throw new Error("Password too short");
      }
      
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message || "Could not create account",
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Signup successful",
        description: `Welcome to TopTabled, ${name}!`,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    // State is updated by onAuthStateChange
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Helper email validation function
  const isValidEmail = (email: string): boolean => {
    // Simple regex for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isAuthenticated = !!authUser;
  const isAdmin = authUser?.isAdmin || false;
  const isPremium = authUser?.isPremium || false;

  console.log('Auth state:', { isAuthenticated, isAdmin, isPremium });

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
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
