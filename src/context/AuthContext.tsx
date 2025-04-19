import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user || null);

      if (currentSession?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', currentSession.user.id)
          .single();

        setIsAdmin(roleData?.role === 'admin');
      }
    };

    initializeSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', newSession.user.id)
          .single()
          .then(({ data: roleData }) => {
            setIsAdmin(roleData?.role === 'admin');
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user?.email}!`,
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('user_roles')
          .insert({ 
            user_id: data.user.id, 
            role: 'user' 
          });

        toast({
          title: "Signup successful",
          description: `Welcome to the app, ${name}!`,
        });

        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Registration unsuccessful",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Logout failed",
        description: error instanceof Error ? error.message : "Could not log out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: !!user,
        isAdmin,
        isPremium: false,
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
