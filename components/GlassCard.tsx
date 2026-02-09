import React, { ReactNode } from 'react';
import { Theme } from '../types';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  theme?: Theme; 
  dark?: boolean; // Legacy override
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', theme = 'dark', dark }) => {
  // If 'dark' prop is explicitly passed, it overrides theme. Otherwise use theme.
  const isDark = dark !== undefined ? dark : theme === 'dark';

  return (
    <div className={`${isDark ? 'liquid-glass-dark' : 'liquid-glass'} rounded-3xl p-6 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};
