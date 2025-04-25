
import React from 'react';

interface SectionHeadingProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionHeading({ title, description, className = '' }: SectionHeadingProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight font-heading">{title}</h2>
      {description && (
        <p className="text-muted-foreground max-w-3xl">{description}</p>
      )}
    </div>
  );
}
