import React, { ReactNode } from 'react';
import { Theme } from '../types';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  theme?: Theme; 
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', theme = 'dark' }) => {
  const isDark = theme === 'dark';

  // Fond assombri pour les deux modes afin de garantir la lisibilité du texte blanc
  // avec une ombre portée plus légère.
  // Mode Jour : Noir à 20% (laisse bien voir le fond tropical)
  // Mode Nuit : Noir à 40% (plus profond)
  const baseClasses = isDark 
    ? 'bg-black/40 backdrop-blur-xl border border-white/10 text-white shadow-2xl'
    : 'bg-black/20 backdrop-blur-xl border border-white/20 text-white shadow-xl';

  return (
    <div className={`${baseClasses} rounded-3xl p-6 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
};