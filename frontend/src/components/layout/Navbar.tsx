import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Terminal, Users, MessageSquare, Home, GitBranch, Settings } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const navLinks = [

    { path: '/', label: 'Home', icon: <Home className="h-4 w-4 mr-2" /> },

    { path: '/project-manager', label: 'Project Manager', icon: <Users className="h-4 w-4 mr-2" /> },

    { path: '/projects', label: 'Projects', icon: <Users className="h-4 w-4 mr-2" /> },

    // { path: 'https://console.cloud.google.com/vertex-ai/studio/multimodal?endpointId=7663865425947525120&region=us-central1&cloudshell=true&invt=AbuvLg&project=nse-gcp-ema-tt-ec0b4-sbx-1&pli=1', label: 'Code Assistant', icon: <Terminal className="h-4 w-4 mr-2" /> },

    { path: '/github', label: 'Git Integration', icon: <GitBranch className="h-4 w-4 mr-2" /> }, 

    { path: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4 mr-2" /> },
    
  ];
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-kage-purple text-white font-bold">K
          </div>
          {/*<span className="font-heading font-semibold text-lg sm:text-xl">KAGE    </span>*/}
          <img src="/public/dwv1.svg" alt="KAGE Logo" className="h-4 w-auto"/>
        </Link>
        {/*<img*/}
        {/*    src="public/dwv1.svg"*/}
        {/*    alt="KAGE Logo"*/}
        {/*    className="h-8 w-auto ml-4"*/}
        {/*/>*/}

        {/*<div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">*/}
        {/*  <img src="public/dwv1.svg" alt="Logo" className="h-6 w-auto"/>*/}
        {/*</div>*/}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {navLinks.map((link) => (
              <Link
                  key={link.path}
                  to={link.path}
                  target={link.path.startsWith('http') ? '_blank' : undefined}
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
                <X className="h-6 w-6"/>
            ) : (
                <Menu className="h-6 w-6"/>
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
