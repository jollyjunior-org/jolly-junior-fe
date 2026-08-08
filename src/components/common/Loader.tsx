import React from 'react';
import { BrandLogo } from './BrandLogo';

interface LoaderProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ 
  text = 'Loading...', 
  className = '',
  size = 'md'
}) => {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 py-12 ${className}`}>
      <BrandLogo size={size} showSubtitle={false} className="animate-mascot-bounce" />
      
      {text && (
        <span className="text-sm font-bold text-[#0798AE] animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};
