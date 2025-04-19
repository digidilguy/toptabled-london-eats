import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';

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

  const checkAdminRole = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('has_role', { _user_id: userId, _role: 'admin' });
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking admin role:', error);
      return false;
    }
  };

  const mockUsers = [
    { id: '1', email: 'user@example.com', password: 'password', name: 'Regular User', isPremium: false, isAdmin: false },
    { id: '2', email: 'premium@example.com', password: 'password', name: 'Premium User', isPremium: true, isAdmin: false },
    { id: '3', email: 'admin@example.com', password: 'password', name: 'Admin User', isPremium: true, isAdmin: true },
    { id: '4', email: 'user2@example.com', password: 'password', name: 'Second User', isPremium: false, isAdmin: false },
    { id: '5', email: 'user3@example.com', password: 'password', name: 'Third User', isPremium: false, isAdmin: false }
  ];

  const login = async (email: string, password: string) => {
    const foundMockUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (foundMockUser) {
      const { password, ...userWithoutPassword } = foundMockUser;
      setUser(userWithoutPassword);
      localStorage.setItem('toptabled-user', JSON.stringify(userWithoutPassword));
      toast({
        title: "Login successful",
        description: `Welcome back, ${userWithoutPassword.name}!`,
      });
      return;
    }
    
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (supabaseUser) {
        const isAdmin = await checkAdminRole(supabaseUser.id);
        
        const userData = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: supabaseUser.user_metadata?.name || email.split('@')[0],
          isPremium: supabaseUser.user_metadata?.isPremium || false,
          isAdmin
        };
        
        setUser(userData);
        localStorage.setItem('toptabled-user', JSON.stringify(userData));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Try user@example.com / password",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    if (mockUsers.some(u => u.email === email)) {
      toast({
        title: "Signup failed",
        description: "Email already in use",
        variant: "destructive",
      });
      throw new Error('Email already in use');
    }

    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      
      if (supabaseUser) {
        const userData = {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          name: name || email.split('@')[0],
          isPremium: false,
          isAdmin: false
        };
        
        setUser(userData);
        localStorage.setItem('toptabled-user', JSON.stringify(userData));
        
        toast({
          title: "Signup successful",
          description: `Welcome to TopTabled, ${name}!`,
        });
      } else {
        toast({
          title: "Signup successful",
          description: "Please check your email to verify your account",
        });
      }
    } catch (error) {
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
    }
  };

  const logout = () => {
    supabase.auth.signOut().catch(error => {
      console.error('Error signing out:', error);
    });
    
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
