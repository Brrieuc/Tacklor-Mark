import React, { useEffect, useState } from 'react';
import { GlassCard } from './GlassCard';
import { LeaderboardEntry, Language, Theme } from '../types';
import { translations } from '../i18n';
import { fetchLeaderboard } from '../services/storageService';

interface LeaderboardProps {
  lang: Language;
  theme: Theme;
  userCurrentId?: string;
}

type SortCategory = 'length' | 'weight' | 'count';

export const Leaderboard: React.FC<LeaderboardProps> = ({ lang, theme, userCurrentId }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<SortCategory>('length');
  
  const t = translations[lang].leaderboard;
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      let sortField: 'total_length_cm' | 'total_weight_kg' | 'catch_count';
      switch (category) {
          case 'weight': sortField = 'total_weight_kg'; break;
          case 'count': sortField = 'catch_count'; break;
          case 'length':
          default: sortField = 'total_length_cm'; break;
      }

      const data = await fetchLeaderboard(sortField);
      setEntries(data);
      setLoading(false);
    };
    loadData();
  }, [category]);

  const getMetricDisplay = (entry: LeaderboardEntry, type: SortCategory) => {
      switch (type) {
          case 'weight': return `${(entry.total_weight_kg || 0).toFixed(2)} kg`;
          case 'count': return `${entry.catch_count} ${t.catches}`;
          case 'length': 
          default: return `${(entry.total_length_cm / 100).toFixed(2)} m`;
      }
  };

  // Podium rendering helper
  const renderPodiumStep = (entry: LeaderboardEntry | undefined, rank: 1 | 2 | 3) => {
    if (!entry) return <div className="flex-1"></div>;

    const isCurrentUser = entry.userId === userCurrentId;
    
    let heightClass = "h-32";
    let colorClass = "bg-yellow-600/20 border-yellow-500/50"; // Bronze default
    let icon = "🥉";
    let scale = "scale-90";
    let order = "order-3"; // Rank 3 on right

    if (rank === 1) {
      heightClass = "h-40";
      colorClass = "bg-yellow-400/20 border-yellow-300/60 shadow-[0_0_20px_rgba(253,224,71,0.3)]";
      icon = "🥇";
      scale = "scale-105 z-10";
      order = "order-2"; // Rank 1 in center
    } else if (rank === 2) {
      heightClass = "h-36";
      colorClass = "bg-gray-300/20 border-gray-300/50";
      icon = "🥈";
      scale = "scale-95";
      order = "order-1"; // Rank 2 on left
    }

    return (
      <div className={`flex flex-col items-center justify-end ${order} w-1/3 transition-all duration-500 animate-scale-in`}>
        {/* Avatar */}
        <div className={`relative mb-3 ${scale}`}>
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 overflow-hidden ${isCurrentUser ? 'border-blue-500 shadow-blue-500/50' : 'border-white/20'}`}>
                <img 
                    src={entry.photoURL || `https://ui-avatars.com/api/?name=${entry.displayName}&background=random`} 
                    alt={entry.displayName} 
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute -top-3 -right-3 text-3xl filter drop-shadow-md">{icon}</div>
        </div>

        {/* Podium Step */}
        <div className={`w-full ${heightClass} ${colorClass} rounded-t-xl border-t border-l border-r backdrop-blur-md flex flex-col items-center justify-start pt-4 px-2 text-center`}>
            <span className={`font-bold text-white truncate w-full px-1 ${rank === 1 ? 'text-lg' : 'text-sm'}`}>
                {entry.displayName}
            </span>
            <span className="text-yellow-400 font-black text-xl md:text-2xl mt-1">
                {getMetricDisplay(entry, category)}
            </span>
            {/* Show secondary stats for context */}
            <span className="text-xs text-white/50 mt-1 uppercase tracking-wide">
                {category !== 'count' && `${entry.catch_count} ${t.catches}`}
                {category === 'count' && entry.level}
            </span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-20">
      
      <div className="text-center mb-6 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 drop-shadow-sm mb-2">
            {t.title}
        </h2>
        <p className="text-white/60 mb-6">{t.subtitle}</p>

        {/* Category Switcher */}
        <div className="inline-flex bg-black/30 backdrop-blur-lg p-1 rounded-full border border-white/10 shadow-lg">
             {[
                 { id: 'length', label: t.categories.length },
                 { id: 'weight', label: t.categories.weight },
                 { id: 'count', label: t.categories.count }
             ].map((cat) => (
                 <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id as SortCategory)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        category === cat.id 
                        ? 'bg-yellow-500 text-black shadow-md' 
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                 >
                     {cat.label}
                 </button>
             ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : entries.length === 0 ? (
        <GlassCard theme={theme} className="text-center py-12">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-xl text-white/80 font-medium mb-2">{t.empty}</p>
            <p className="text-sm text-white/50">{t.join}</p>
        </GlassCard>
      ) : (
        <>
            {/* Top 3 Podium */}
            <div className="flex items-end justify-center gap-2 md:gap-4 mb-8 max-w-lg mx-auto">
                {renderPodiumStep(entries[1], 2)}
                {renderPodiumStep(entries[0], 1)}
                {renderPodiumStep(entries[2], 3)}
            </div>

            {/* List 4-10 */}
            {entries.length > 3 && (
                <GlassCard theme={theme} className="overflow-hidden p-0">
                    <div className="divide-y divide-white/10">
                        {entries.slice(3).map((entry, idx) => {
                            const rank = idx + 4;
                            const isCurrentUser = entry.userId === userCurrentId;
                            
                            return (
                                <div key={entry.userId} className={`flex items-center p-4 transition-colors ${isCurrentUser ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}>
                                    <div className="w-8 font-bold text-white/50 text-lg">#{rank}</div>
                                    <div className="flex items-center gap-3 flex-grow">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                                             <img 
                                                src={entry.photoURL || `https://ui-avatars.com/api/?name=${entry.displayName}&background=random`} 
                                                alt={entry.displayName} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`font-bold ${isCurrentUser ? 'text-blue-200' : 'text-white'}`}>
                                                {entry.displayName}
                                            </span>
                                            <span className="text-xs text-white/40">
                                                {entry.level}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-yellow-400 text-lg">
                                            {getMetricDisplay(entry, category)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </GlassCard>
            )}
        </>
      )}
    </div>
  );
};
