
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

// Enhanced email validation function
const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  
  // Basic format check
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  if (!validFormat) return false;
  
  // Extract domain
  const domain = email.trim().split('@')[1];
  
  // Check for commonly rejected test/fake domains
  const invalidDomains = ['asd.com', 'test.com', 'example.com', 'invalid.com'];
  if (invalidDomains.includes(domain)) return false;
  
  // Ensure domain has a valid TLD
  const validTLDs = ['.com', '.org', '.net', '.edu', '.gov', '.co', '.io', '.ai', '.dev'];
  return validTLDs.some(tld => domain.endsWith(tld));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Setting up auth state listener...");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user);
        setSession(currentSession);
        
        if (currentSession?.user) {
          const { id, email } = currentSession.user;
          
          const user: AuthUser = {
            id,
            email: email || 'unknown',
            name: email?.split('@')[0] || 'User',
            isPremium: email === 'premium@example.com',
            isAdmin: email === 'admin@example.com',
          };
          
          setAuthUser(user);
          console.log('User set after auth change:', user);
        } else {
          setAuthUser(null);
          console.log('User cleared after auth change');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Existing session check:', currentSession?.user);
      setSession(currentSession);
      
      if (currentSession?.user) {
        const { id, email } = currentSession.user;
        
        const user: AuthUser = {
          id,
          email: email || 'unknown',
          name: email?.split('@')[0] || 'User',
          isPremium: email === 'premium@example.com',
          isAdmin: email === 'admin@example.com',
        };
        
        setAuthUser(user);
        console.log('User set from existing session:', user);
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []);

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
      if (!email || email.trim() === '') {
        toast({
          title: "Email Required",
          description: "Please enter your email address",
          variant: "destructive",
        });
        throw new Error("Email is required");
      }
      
      const cleanEmail = email.trim().toLowerCase();
      
      if (!isValidEmail(cleanEmail)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address with a proper domain (e.g. gmail.com, outlook.com)",
          variant: "destructive",
        });
        throw new Error("Email address is invalid");
      }
      
      if (!password) {
        toast({
          title: "Password Required",
          description: "Please enter your password",
          variant: "destructive",
        });
        throw new Error("Password is required");
      }
      
      console.log("Attempting login with email:", cleanEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail, 
        password
      });
      
      if (error) {
        console.error("Supabase login error:", error);
        toast({
          title: "Login failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
        throw error;
      }
      
      console.log("Login successful, auth data:", data);
      
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
      if (!name || name.trim() === '') {
        toast({
          title: "Name Required",
          description: "Please enter your name",
          variant: "destructive",
        });
        throw new Error("Name is required");
      }
      
      if (!email || email.trim() === '') {
        toast({
          title: "Email Required",
          description: "Please enter your email address",
          variant: "destructive",
        });
        throw new Error("Email is required");
      }
      
      const cleanEmail = email.trim().toLowerCase();
      
      if (!isValidEmail(cleanEmail)) {
        toast({
          title: "Invalid Email Format",
          description: "Please use a valid email with a proper domain (e.g. gmail.com, outlook.com)",
          variant: "destructive",
        });
        throw new Error("Email address is invalid");
      }
      
      if (!password) {
        toast({
          title: "Password Required",
          description: "Please enter a password",
          variant: "destructive",
        });
        throw new Error("Password is required");
      }
      
      if (password.length < 6) {
        toast({
          title: "Password too short",
          description: "Password must be at least 6 characters long",
          variant: "destructive",
        });
        throw new Error("Password too short");
      }
      
      console.log("Attempting signup with email:", cleanEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            name: name.trim()
          }
        }
      });
      
      if (error) {
        console.error("Supabase signup error:", error);
        
        // Provide more specific error messages based on the error
        if (error.message.includes('invalid')) {
          toast({
            title: "Signup failed",
            description: "Please use a valid email address with a common domain (like gmail.com or outlook.com)",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Signup failed",
            description: error.message || "Could not create account",
            variant: "destructive",
          });
        }
        throw error;
      }
      
      console.log("Signup successful:", data);
      
      toast({
        title: "Signup successful",
        description: `Welcome to TopTabled, ${name.trim()}!`,
      });
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    console.log("Logging out...");
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
    
    // Explicitly clear the auth state
    setAuthUser(null);
    setSession(null);
    
    console.log("Logged out successfully");
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const isAuthenticated = !!authUser;
  const isAdmin = authUser?.isAdmin || false;
  const isPremium = authUser?.isPremium || false;

  console.log('Auth state in provider:', { isAuthenticated, isAdmin, isPremium, user: authUser });

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
