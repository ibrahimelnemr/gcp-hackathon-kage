import { ReactNode } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Popup({ isOpen, onClose, children }: PopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-card text-card-foreground rounded-lg shadow-lg p-6 w-full max-w-md animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}