import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import AuthDialog from './AuthDialog';
import { Menu, X, User } from 'lucide-react';
import SubmitRestaurantForm from './SubmitRestaurantForm';

const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isSubmitFormOpen, setIsSubmitFormOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">LeaderEats</span>
              <span className="text-xs ml-2 bg-accent text-white px-1.5 py-0.5 rounded">London</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <Button 
                variant="outline" 
                onClick={() => setIsSubmitFormOpen(true)}
              >
                Submit Restaurant
              </Button>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-neutral" />
                  <span className="text-sm font-medium">
                    {user?.name}
                    {isAdmin && <span className="ml-1 text-xs text-primary">(Admin)</span>}
                  </span>
                </div>
                <Button variant="ghost" onClick={logout}>Logout</Button>
              </div>
            ) : (
              <Button variant="default" onClick={() => setIsAuthDialogOpen(true)}>
                Login / Sign Up
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t mt-3">
            <div className="flex flex-col gap-2">
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => {
                    setIsSubmitFormOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Submit Restaurant
                </Button>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="py-2 px-3 flex items-center gap-2">
                    <User size={16} className="text-neutral" />
                    <span className="text-sm font-medium">
                      {user?.name}
                      {isAdmin && <span className="ml-1 text-xs text-primary">(Admin)</span>}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button 
                  variant="default" 
                  className="justify-start"
                  onClick={() => {
                    setIsAuthDialogOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Login / Sign Up
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <AuthDialog 
        isOpen={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />

      <SubmitRestaurantForm
        isOpen={isSubmitFormOpen}
        onClose={() => setIsSubmitFormOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
