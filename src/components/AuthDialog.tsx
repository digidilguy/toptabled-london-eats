
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  
  const { login, signup } = useAuth();

  const handleClose = () => {
    setLoginEmail('');
    setLoginPassword('');
    setSignupName('');
    setSignupEmail('');
    setSignupPassword('');
    setError('');
    setValidationErrors({});
    onClose();
  };

  // Enhanced email validation function
  const validateEmail = (email: string): boolean => {
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
  };

  const validateSignupForm = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
    } = {};
    
    if (!signupName || signupName.trim() === '') {
      errors.name = 'Name is required';
    }
    
    const cleanEmail = signupEmail.trim();
    if (!cleanEmail) {
      errors.email = 'Email is required';
    } else if (!validateEmail(cleanEmail)) {
      errors.email = 'Please use a valid email with a proper domain (like gmail.com or outlook.com)';
    }
    
    if (!signupPassword) {
      errors.password = 'Password is required';
    } else if (signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLoginForm = (): boolean => {
    const errors: {
      email?: string;
      password?: string;
    } = {};
    
    const cleanEmail = loginEmail.trim();
    if (!cleanEmail) {
      errors.email = 'Email is required';
    } else if (!validateEmail(cleanEmail)) {
      errors.email = 'Please enter a valid email address with a proper domain';
    }
    
    if (!loginPassword) {
      errors.password = 'Password is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await login(loginEmail, loginPassword);
      handleClose();
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
    
    if (!validateSignupForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log("Form validated, submitting signup with:", {
        name: signupName.trim(),
        email: signupEmail.trim().toLowerCase()
      });
      
      await signup(signupName, signupEmail, signupPassword);
      handleClose();
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
          <DialogTitle className="text-center text-2xl font-bold">
            Welcome to LeaderEats
          </DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue="login" 
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value as "login" | "signup");
            setError('');
            setValidationErrors({});
          }}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@gmail.com"
                  className={validationErrors.email ? "border-red-500" : ""}
                  required
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className={validationErrors.password ? "border-red-500" : ""}
                  required
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>
              
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm ml-2">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-xs text-neutral">
                Demo accounts: user@example.com / password, admin@example.com / password
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input 
                  id="signup-name"
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your Name"
                  className={validationErrors.name ? "border-red-500" : ""}
                  required
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input 
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="you@gmail.com" 
                  className={validationErrors.email ? "border-red-500" : ""}
                  required
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input 
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  className={validationErrors.password ? "border-red-500" : ""}
                  required
                  minLength={6}
                />
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>
              
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm ml-2">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200 mb-2">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Use a proper email like <span className="font-mono">yourname@gmail.com</span> or <span className="font-mono">yourname@outlook.com</span>
                </p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
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
