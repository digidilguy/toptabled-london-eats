
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import AuthDialog from './AuthDialog';
import { Menu, X, User } from 'lucide-react';

const Navbar = ({ onSubmitRestaurantClick }: { onSubmitRestaurantClick?: () => void }) => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <span
                className="text-xl font-bold text-foreground rounded-md px-4 py-2"
              >
                LeaderEats
              </span>
              <span className="text-xs ml-2 bg-green-500 text-white px-1.5 py-0.5 rounded">London</span>
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <Button 
                variant="outline" 
                onClick={onSubmitRestaurantClick}
                className="border-green-500 text-green-500 hover:bg-upvote/10 hover:text-upvote"
              >
                Submit Restaurant
              </Button>
            )}
            
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {displayName}
                    {isAdmin && <span className="ml-1 text-xs text-green-500">(Admin)</span>}
                  </span>
                </div>
                <Button variant="ghost" onClick={logout} className="text-foreground hover:bg-secondary">
                  Logout
                </Button>
              </div>
            ) : (
              <Button variant="default" onClick={() => setIsAuthDialogOpen(true)} className="bg-green-500 text-white hover:bg-green-600">
                Login / Sign Up
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-foreground"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-3 border-t border-green-700/30 mt-3">
            <div className="flex flex-col gap-2">
              {isAuthenticated && (
                <Button 
                  variant="outline" 
                  className="justify-start border-green-500 text-green-500 hover:bg-upvote/10 hover:text-upvote"
                  onClick={() => {
                    if (onSubmitRestaurantClick) {
                      onSubmitRestaurantClick();
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  Submit Restaurant
                </Button>
              )}
              
              {isAuthenticated ? (
                <>
                  <div className="py-2 px-3 flex items-center gap-2">
                    <User size={16} className="text-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      {displayName}
                      {isAdmin && <span className="ml-1 text-xs text-green-500">(Admin)</span>}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="justify-start text-foreground hover:bg-secondary"
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
                  className="justify-start bg-green-500 text-white hover:bg-green-600"
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
    </nav>
  );
};

export default Navbar;
