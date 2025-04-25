
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export function AnimatedGradientBackground({ 
  className, 
  children 
}: AnimatedGradientBackgroundProps) {
  return (
    <div className={cn(
      "relative overflow-hidden",
      className
    )}>
      <div className="absolute inset-0 w-full h-full bg-kage-gray-darker opacity-90" />
      
      <div className="absolute inset-0 blur-3xl opacity-30">
        <div className="absolute -top-40 -left-20 h-96 w-96 rounded-full bg-kage-purple/20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-20 -right-20 h-64 w-64 rounded-full bg-kage-accent/20 animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute -bottom-40 left-1/2 transform -translate-x-1/2 h-80 w-80 rounded-full bg-kage-purple-light/20 animate-pulse" style={{ animationDuration: '12s' }} />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
