import React from 'react';
import { translations } from '../i18n';
import { Language, Theme } from '../types';
import { GlassCard } from './GlassCard';

interface TrophyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValue: number; // La valeur actuelle (kg ou cm)
  type: 'weight' | 'length';
  lang: Language;
  theme: Theme;
}

interface Trophy {
  id: string;
  threshold: number; // Valeur seuil pour débloquer
  iconKey: string; // Clé pour l'icone SVG
  translationKey: string; // Clé i18n
}

// Définition des trophées et de leurs seuils
const WEIGHT_TROPHIES: Trophy[] = [
  { id: 'w1', threshold: 5, iconKey: 'bag', translationKey: 'bag' },
  { id: 'w2', threshold: 30, iconKey: 'dog', translationKey: 'dog' },
  { id: 'w3', threshold: 100, iconKey: 'person', translationKey: 'person' },
  { id: 'w4', threshold: 300, iconKey: 'piano', translationKey: 'piano' },
  { id: 'w5', threshold: 750, iconKey: 'f1', translationKey: 'f1' },
  { id: 'w6', threshold: 1000, iconKey: 'shark', translationKey: 'shark' },
];

// Note: Length is in cm in the DB, but displayed in m for trophies if large, 
// let's stick to CM for thresholds to match DB data. 100m = 10000cm
const LENGTH_TROPHIES: Trophy[] = [
  { id: 'l1', threshold: 30, iconKey: 'ruler', translationKey: 'ruler' }, // 30cm
  { id: 'l2', threshold: 420, iconKey: 'rod', translationKey: 'rod' }, // 4.2m
  { id: 'l3', threshold: 1200, iconKey: 'bus', translationKey: 'bus' }, // 12m
  { id: 'l4', threshold: 5000, iconKey: 'pool', translationKey: 'pool' }, // 50m
  { id: 'l5', threshold: 10000, iconKey: 'football', translationKey: 'football' }, // 100m
  { id: 'l6', threshold: 30000, iconKey: 'eiffel', translationKey: 'eiffel' }, // 300m
];

// SVG Icons Component Helper
const TrophyIcon = ({ iconKey, className }: { iconKey: string, className?: string }) => {
  switch (iconKey) {
    case 'bag': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
    case 'dog': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A4.335 4.335 0 0 1 1.55 9.5c-.445-1.413-.566-4.08.36-6.403C2.88 1.15 4.63.163 6.327.933c1.78.806 2.508 2.562 2.895 4.675"/><path d="M19.58 11.247a4.335 4.335 0 0 0 2.87-1.747c.445-1.413.566-4.08-.36-6.403C21.12 1.15 19.37.163 17.673.933c-1.78.806-2.508 2.562-2.895 4.675"/></svg>;
    case 'person': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="5" r="1"/><path d="M9 20l-1-6-2.5-1.5a4 4 0 0 1 1-6.5h3a4 4 0 0 1 1 6.5l-2.5 1.5-1 6z"/></svg>;
    case 'piano': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Z"/><path d="M16 14v4"/><path d="M8 14v4"/><path d="M12 14v4"/><path d="M6 10h12"/><path d="M6 10v4"/><path d="M18 10v4"/></svg>;
    case 'f1': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2Z"/><path d="M20 14h-2a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2Z"/><path d="M6 12h12"/><path d="M12 12v-4"/><path d="M12 8H8"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>;
    case 'shark': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M7 16v-4c0-2.5 2-5 5-5s5 2.5 5 5v4"/><path d="M12 7V3"/></svg>;
    
    case 'ruler': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20"/><path d="M6 12v-2"/><path d="M10 12v-3"/><path d="M14 12v-2"/><path d="M18 12v-3"/></svg>;
    case 'rod': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 2l20 20"/><path d="M17 12l-5 5"/><path d="M7 17l5 5"/></svg>;
    case 'bus': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4a2 2 0 0 0-2 2v10h2"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>;
    case 'pool': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20c.5-1 2.5-1 3-3s2.5-1 3 0 2.5 2 3 3 2.5 1 3 0 2.5-1 3-3 2.5-1 3 0"/><path d="M22 16c-3 0-4-3-6-3s-4 1-6 1-4-3-6-3"/><path d="M18 6h2"/><path d="M19 6v6"/></svg>;
    case 'football': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="12" y1="4" x2="12" y2="20"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M22 10h-4"/><path d="M22 14h-4"/></svg>;
    case 'eiffel': return <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8"/><path d="M12 2v19"/><path d="M9 21l-4-15"/><path d="M15 21l4-15"/><path d="M6 12h12"/><path d="M8 8h8"/></svg>;
    
    default: return <div className="w-full h-full bg-white/20 rounded-full" />;
  }
};

export const TrophyModal: React.FC<TrophyModalProps> = ({ isOpen, onClose, currentValue, type, lang, theme }) => {
  if (!isOpen) return null;

  const t = translations[lang].trophies;
  const list = type === 'weight' ? WEIGHT_TROPHIES : LENGTH_TROPHIES;

  return (
    // Z-Index increased to 150 to stay above navigation bar (z-100)
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <GlassCard theme={theme} className="w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col relative border-2 border-yellow-500/20 shadow-yellow-900/20" onClick={(e: any) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 z-10 bg-inherit">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-sm flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                {t.title}
            </h2>
            <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        {/* Current Stat */}
        <div className="mb-6 text-center z-10">
            <div className="text-sm uppercase tracking-widest text-white/60 font-bold mb-1">{t.progress}</div>
            <div className="text-4xl font-black text-white drop-shadow-md">
                {type === 'length' 
                    ? (currentValue >= 100 ? `${(currentValue / 100).toFixed(2)} m` : `${currentValue} cm`)
                    : `${currentValue.toFixed(3)} kg`
                }
            </div>
        </div>

        {/* Timeline */}
        <div className="overflow-y-auto pr-2 pb-4 scrollbar-hide flex-grow relative">
            
            <div className="space-y-4">
              {list.map((trophy, index) => {
                  const isUnlocked = currentValue >= trophy.threshold;
                  const isNext = !isUnlocked && (index === 0 || currentValue >= list[index - 1].threshold);
                  const isHidden = !isUnlocked && !isNext;
                  
                  // Check if next item exists and if it is unlocked
                  const isNotLast = index < list.length - 1;
                  const nextTrophy = isNotLast ? list[index + 1] : null;
                  const isNextUnlocked = nextTrophy ? currentValue >= nextTrophy.threshold : false;

                  // Calculate fill percentage for the connector line towards the next item
                  let progressToNext = 0;
                  if (isUnlocked && nextTrophy) {
                     if (isNextUnlocked) {
                         progressToNext = 100;
                     } else {
                         // Partial progress calculation
                         const range = nextTrophy.threshold - trophy.threshold;
                         const progress = currentValue - trophy.threshold;
                         progressToNext = Math.min(100, Math.max(0, (progress / range) * 100));
                     }
                  }

                  return (
                      <div 
                          key={trophy.id} 
                          className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 z-10 ${
                              isHidden ? 'opacity-40 blur-[2px] scale-95 grayscale' : ''
                          } ${
                              isUnlocked 
                              ? 'bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]' 
                              : 'bg-black/20 border-white/5'
                          }`}
                      >
                          {/* Vertical Connector Line (Background Track + Fill) */}
                          {isNotLast && (
                             <div className="absolute left-[2rem] top-16 h-[calc(100%+1rem)] w-1 -z-10 -ml-0.5">
                                 {/* Background Track (Gray) */}
                                 <div className="absolute inset-0 bg-white/10 w-0.5 mx-auto rounded-full"></div>
                                 
                                 {/* Colored Fill (Yellow) */}
                                 <div 
                                     className="absolute top-0 left-0 right-0 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_8px_rgba(250,204,21,0.6)] w-0.5 mx-auto rounded-full transition-all duration-1000 ease-out"
                                     style={{ height: `${progressToNext}%` }}
                                 ></div>
                             </div>
                          )}

                          {/* Icon Circle */}
                          <div className={`relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-lg transition-all duration-500 z-20 ${
                              isUnlocked 
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-300 text-black shadow-yellow-500/30 scale-110' 
                              : isNext 
                                  ? 'bg-gray-800 border-gray-600 text-gray-400'
                                  : 'bg-gray-900 border-gray-800 text-gray-700'
                          }`}>
                              {isHidden ? (
                                  <span className="text-2xl font-bold">?</span>
                              ) : (
                                  <TrophyIcon iconKey={trophy.iconKey} className="w-8 h-8" />
                              )}
                              
                              {/* Checkmark for unlocked */}
                              {isUnlocked && (
                                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-black text-white shadow-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                  </div>
                              )}
                          </div>

                          {/* Text Content */}
                          <div className="flex-grow min-w-0">
                              {isHidden ? (
                                  <div className="space-y-1">
                                      <h3 className="font-bold text-white/50">{t.locked}</h3>
                                      <p className="text-xs text-white/30">{t.lockedDesc}</p>
                                  </div>
                              ) : (
                                  <div className="space-y-1">
                                      <div className="flex justify-between items-center">
                                          <h3 className={`font-bold text-lg ${isUnlocked ? 'text-yellow-100' : 'text-white'}`}>
                                              {(t.badges as any)[trophy.translationKey]}
                                          </h3>
                                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${isUnlocked ? 'bg-yellow-500/20 text-yellow-200' : 'bg-white/10 text-white/50'}`}>
                                              {type === 'length' 
                                                  ? (trophy.threshold >= 100 ? `${trophy.threshold / 100}m` : `${trophy.threshold}cm`)
                                                  : `${trophy.threshold}kg`
                                              }
                                          </span>
                                      </div>
                                      <p className={`text-sm ${isUnlocked ? 'text-yellow-200/70' : 'text-white/60'}`}>
                                          {(t.badges as any)[trophy.translationKey + 'Desc']}
                                      </p>
                                      
                                      {/* Small Progress Bar inside item for current step */}
                                      {isNext && (
                                          <div className="w-full h-1.5 bg-gray-700 rounded-full mt-2 overflow-hidden">
                                              <div 
                                                  className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                                                  style={{ width: `${progressToNext}%` }} // Reuse the calculated progress
                                              />
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      </div>
                  );
              })}
            </div>
        </div>

      </GlassCard>
    </div>
  );
};