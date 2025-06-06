
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthDialog = ({ isOpen, onClose, onSuccess }: AuthDialogProps) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();

  const handleClose = () => {
    // Reset form state
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setError('');
    onClose();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      handleClose();
      // Call onSuccess callback if it exists
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await signup(signupName, signupEmail, signupPassword);
      handleClose();
      // Call onSuccess callback if it exists
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            LeaderEats
          </DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue="login" 
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "signup")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
            <TabsTrigger 
              value="login" 
              className="data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-foreground/60"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              className="data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:text-foreground/60"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground">Email</Label>
                <Input 
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="text-foreground placeholder:text-foreground/60"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-foreground">Password</Label>
                <Input 
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-foreground placeholder:text-foreground/60"
                />
              </div>
              
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full text-primary-foreground" 
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-foreground">Name</Label>
                <Input 
                  id="signup-name"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your Name"
                  required
                  className="text-foreground placeholder:text-foreground/60"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                <Input 
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="text-foreground placeholder:text-foreground/60"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                <Input 
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="text-foreground placeholder:text-foreground/60"
                />
              </div>
              
              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}
              
              <Button 
                type="submit" 
                className="w-full text-primary-foreground" 
                disabled={isLoading}
                variant="default"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
