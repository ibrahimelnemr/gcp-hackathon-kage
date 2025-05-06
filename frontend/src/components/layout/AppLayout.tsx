
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="py-4 border-t border-border">
        <div className="container flex flex-col items-center justify-center px-4 mx-auto space-y-2">
          {/* <div className="text-sm text-muted-foreground">
          </div> */}
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Deloitte Innovation Hub
          </div>
        </div>
      </footer>
    </div>
  );
}
