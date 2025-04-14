
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Terminal, Users, MessageSquare, Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [
    { path: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },
    { path: '/project-manager', label: 'Project Manager', icon: <Users className="h-4 w-4 mr-2" /> },
    { path: '/code-assistant', label: 'Code Assistant', icon: <Terminal className="h-4 w-4 mr-2" /> },
    { path: '/ai-chat', label: 'AI Chat', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ];
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-kage-purple text-white font-bold">K</div>
          <span className="font-heading font-semibold text-lg sm:text-xl">KAGE</span>
        </Link>
        
        <div className="hidden md:flex md:items-center md:space-x-4">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
                ${location.pathname === link.path 
                  ? 'bg-kage-purple/20 text-kage-purple-light' 
                  : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
        
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMenu}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-border">
          <div className="py-2 space-y-1 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
                  ${location.pathname === link.path 
                    ? 'bg-kage-purple/20 text-kage-purple-light' 
                    : 'hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
