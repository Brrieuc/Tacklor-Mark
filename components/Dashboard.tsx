import React from 'react';
import { CatchRecord, Language, Theme } from '../types';
import { GlassCard } from './GlassCard';
import { translations } from '../i18n';

interface DashboardProps {
  catches: CatchRecord[];
  onAddNew: () => void;
  lang: Language;
  theme: Theme;
  onToggleTheme: () => void;
}

// Helper for Species Badges Colors
const getSpeciesBadgeColor = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes('bar') || s.includes('bass')) return 'bg-blue-500/20 text-blue-100 border-blue-500/30';
  if (s.includes('brochet') || s.includes('pike')) return 'bg-emerald-500/20 text-emerald-100 border-emerald-500/30';
  if (s.includes('truite') || s.includes('trout')) return 'bg-pink-500/20 text-pink-100 border-pink-500/30';
  return 'bg-white/10 text-white border-white/20'; // Default
};

const StatusBadge: React.FC<{ status: CatchRecord['complianceStatus']; lang: Language }> = ({ status, lang }) => {
  const t = translations[lang].dashboard.status;
  
  const colors = {
    pending: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30',
    compliant: 'bg-green-500/20 text-green-200 border-green-500/30',
    to_declare: 'bg-red-500/20 text-red-200 border-red-500/30',
    legal_declaration_required: 'bg-purple-500/20 text-purple-200 border-purple-500/30'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${colors[status]}`}>
      {t[status]}
    </span>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ catches, onAddNew, lang, theme, onToggleTheme }) => {
  const t = translations[lang].dashboard;
  const tWeather = translations[lang].weather;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-8 pb-24">
      {/* Fixed Header with Weather & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
            {t.title}
          </h1>
          <p className="text-white/60 mt-2">{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Minimalist Weather Widget */}
            <GlassCard theme={theme} className="!p-3 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-bold">18°C</span>
                        <span className="text-[10px] opacity-60">{tWeather.temp}</span>
                    </div>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex flex-col leading-none">
                        <span className="text-sm font-bold">12 km/h</span>
                        <span className="text-[10px] opacity-60">{tWeather.wind}</span>
                    </div>
                </div>
            </GlassCard>

            {/* Theme Toggle */}
            <button 
                onClick={onToggleTheme}
                className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all"
            >
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-200" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>

            <button
            onClick={onAddNew}
            className="group relative px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
            >
            <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{t.newCatch}</span>
            </div>
            </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl font-bold">{catches.length}</span>
          <span className="text-sm text-white/50 uppercase tracking-widest mt-2">{t.totalCatches}</span>
        </GlassCard>
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl font-bold">
            {catches.reduce((acc, curr) => acc + curr.weight_kg, 0).toFixed(1)} <span className="text-xl font-normal">kg</span>
          </span>
          <span className="text-sm text-white/50 uppercase tracking-widest mt-2">{t.totalWeight}</span>
        </GlassCard>
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-8">
          <span className="text-4xl font-bold">
            {catches.filter(c => c.complianceStatus === 'compliant').length}
          </span>
          <span className="text-sm text-white/50 uppercase tracking-widest mt-2">{t.verifiedCompliant}</span>
        </GlassCard>
      </div>

      {/* Catches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catches.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <GlassCard theme={theme} className="!bg-white/10 border-2 border-white/20 shadow-xl backdrop-blur-xl">
              <div className="flex flex-col items-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-300 mb-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="text-xl font-bold mb-2 text-white">Bienvenue sur Tacklor Mark !</h3>
                <p className="text-lg text-white/80">Enregistrez votre première prise pour commencer l'aventure.</p>
                <button 
                    onClick={onAddNew}
                    className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors shadow-lg"
                >
                    Ajouter une prise
                </button>
              </div>
            </GlassCard>
          </div>
        ) : (
          catches.map((catchItem) => (
            <GlassCard key={catchItem.id} theme={theme} className="group hover:bg-white/10 transition-colors p-0 overflow-hidden flex flex-col h-full">
              {/* Image Section */}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={catchItem.imageUrl} 
                  alt={catchItem.species} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Species Badge Overlay */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${getSpeciesBadgeColor(catchItem.species)}`}>
                   {catchItem.species}
                </div>

                <div className="absolute top-3 right-3">
                  <StatusBadge status={catchItem.complianceStatus} lang={lang} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-xs text-white/70">{new Date(catchItem.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
                </div>
              </div>

              {/* Data Section */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-white/40 block">{t.labels.length}</span>
                    <span className="text-lg font-medium">{catchItem.length_cm} cm</span>
                  </div>
                  <div>
                    <span className="text-xs text-white/40 block">{t.labels.weight}</span>
                    <span className="text-lg font-medium">{catchItem.weight_kg} kg</span>
                  </div>
                </div>

                {/* Additional Info (Technique/Spot) */}
                {(catchItem.technique || catchItem.spot_type) && (
                    <div className="grid grid-cols-2 gap-2 text-xs text-white/60 border-t border-white/10 pt-2">
                        {catchItem.technique && <div><span className="opacity-50 block">{t.labels.technique}</span>{catchItem.technique}</div>}
                        {catchItem.spot_type && <div><span className="opacity-50 block">{t.labels.spot}</span>{catchItem.spot_type}</div>}
                    </div>
                )}
                
                {/* Legal Action Button for Restricted Species */}
                {catchItem.complianceStatus === 'legal_declaration_required' && (
                    <button className="w-full py-2 bg-purple-600/80 hover:bg-purple-500/80 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.actions.declare}
                    </button>
                )}

                {/* AI Advice Snippet */}
                {catchItem.aiAdvice && (
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Tacklor AI</span>
                        </div>
                        <p className="text-xs text-white/80 italic">"{catchItem.aiAdvice}"</p>
                    </div>
                )}
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
