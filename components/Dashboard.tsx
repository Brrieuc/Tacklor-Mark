import React from 'react';
import { CatchRecord, Language, Theme, WeatherData } from '../types';
import { GlassCard } from './GlassCard';
import { translations } from '../i18n';

interface DashboardProps {
  catches: CatchRecord[];
  onAddNew: () => void;
  lang: Language;
  theme: Theme;
  weather: WeatherData | null;
  locationError: boolean;
}

// Helper for Species Badges Colors
const getSpeciesBadgeColor = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes('bar') || s.includes('bass')) return 'bg-blue-600/80 text-white border-blue-400';
  if (s.includes('brochet') || s.includes('pike')) return 'bg-emerald-600/80 text-white border-emerald-400';
  if (s.includes('truite') || s.includes('trout')) return 'bg-pink-600/80 text-white border-pink-400';
  return 'bg-gray-700/80 text-white border-gray-500'; 
};

const StatusBadge: React.FC<{ status: CatchRecord['complianceStatus']; lang: Language }> = ({ status, lang }) => {
  const t = translations[lang].dashboard.status;
  
  const colors = {
    pending: 'bg-yellow-500/90 text-black border-yellow-600',
    compliant: 'bg-green-500/90 text-black border-green-600',
    to_declare: 'bg-red-500/90 text-white border-red-600',
    legal_declaration_required: 'bg-purple-500/90 text-white border-purple-600'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${colors[status]}`}>
      {t[status]}
    </span>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ catches, onAddNew, lang, theme, weather, locationError }) => {
  const t = translations[lang].dashboard;
  const tWeather = translations[lang].weather;
  const isDark = theme === 'dark';

  // Ombre portée adoucie : Alpha 0.5 au lieu de 0.8
  const textShadowClass = "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]";
  
  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-8 pb-24">
      {/* Fixed Header with Weather & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-2">
        <div className="px-2">
          <h1 className={`text-5xl font-extrabold tracking-tight text-white ${textShadowClass}`}>
            {t.title}
          </h1>
          <p className={`text-white/90 mt-2 text-xl font-medium ${textShadowClass}`}>{t.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
            {/* Weather Widget */}
            <GlassCard theme={theme} className="!p-3 flex items-center gap-4 min-w-[180px] !rounded-full shadow-lg backdrop-blur-md">
                {locationError ? (
                    <div className={`flex items-center gap-2 text-red-400 ${textShadowClass}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className="text-xs font-bold">Loc. Désactivée</span>
                    </div>
                ) : !weather ? (
                    <div className="flex items-center gap-2 animate-pulse">
                         <div className="w-5 h-5 rounded-full bg-white/20"></div>
                         <span className="text-xs text-white/70">Chargement...</span>
                    </div>
                ) : (
                    <>
                        <div className={`flex items-center gap-2 ${textShadowClass}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-bold text-white">{Math.round(weather.temp)}°C</span>
                                <span className="text-[10px] text-white/80">{tWeather.temp}</span>
                            </div>
                        </div>
                        <div className="w-px h-6 bg-white/30"></div>
                        <div className={`flex items-center gap-2 ${textShadowClass}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="flex flex-col leading-none">
                                <span className="text-sm font-bold text-white">{Math.round(weather.wind)} <span className="text-[9px]">km/h</span></span>
                                <span className="text-[10px] text-white/80">{tWeather.wind}</span>
                            </div>
                        </div>
                    </>
                )}
            </GlassCard>

            <button
            onClick={onAddNew}
            className={`group relative px-6 py-3 rounded-full border transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95 bg-white/20 hover:bg-white/30 border-white/30 text-white ${textShadowClass}`}
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
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${textShadowClass}`}>
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl font-extrabold text-white">{catches.length}</span>
          <span className="text-sm font-bold uppercase tracking-widest mt-2 text-white/70">{t.totalCatches}</span>
        </GlassCard>
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl font-extrabold text-white">
            {catches.reduce((acc, curr) => acc + curr.weight_kg, 0).toFixed(1)} <span className="text-2xl font-normal opacity-60">kg</span>
          </span>
          <span className="text-sm font-bold uppercase tracking-widest mt-2 text-white/70">{t.totalWeight}</span>
        </GlassCard>
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl font-extrabold text-green-400">
            {catches.filter(c => c.complianceStatus === 'compliant').length}
          </span>
          <span className="text-sm font-bold uppercase tracking-widest mt-2 text-white/70">{t.verifiedCompliant}</span>
        </GlassCard>
      </div>

      {/* Catches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catches.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <GlassCard theme={theme} className="border-2 shadow-xl backdrop-blur-xl bg-white/20 border-white/30">
              <div className={`flex flex-col items-center p-6 text-white ${textShadowClass}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 animate-bounce opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <h3 className="text-xl font-bold mb-2">Bienvenue sur Tacklor Mark !</h3>
                <p className="text-lg opacity-90">Enregistrez votre première prise pour commencer l'aventure.</p>
                <button 
                    onClick={onAddNew}
                    className="mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-colors shadow-lg border border-white/20"
                >
                    Ajouter une prise
                </button>
              </div>
            </GlassCard>
          </div>
        ) : (
          catches.map((catchItem) => (
            <GlassCard key={catchItem.id} theme={theme} className="group hover:-translate-y-1 transition-transform p-0 overflow-hidden flex flex-col h-full">
              {/* Image Section */}
              <div className="relative h-56 w-full overflow-hidden">
                <img 
                  src={catchItem.imageUrl} 
                  alt={catchItem.species} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Species Badge Overlay */}
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm ${getSpeciesBadgeColor(catchItem.species)}`}>
                   {catchItem.species}
                </div>

                <div className="absolute top-3 right-3">
                  <StatusBadge status={catchItem.complianceStatus} lang={lang} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-xs text-white/90 font-medium">{new Date(catchItem.date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}</p>
                </div>
              </div>

              {/* Data Section */}
              <div className={`p-5 flex-grow flex flex-col justify-between space-y-4 ${textShadowClass}`}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block text-white/60">{t.labels.length}</span>
                    <span className="text-xl font-bold text-white">{catchItem.length_cm} cm</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider block text-white/60">{t.labels.weight}</span>
                    <span className="text-xl font-bold text-white">{catchItem.weight_kg} kg</span>
                  </div>
                </div>

                {/* Additional Info (Technique/Spot) */}
                {(catchItem.technique || catchItem.spot_type) && (
                    <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 border-white/20 text-white/80">
                        {catchItem.technique && <div><span className="opacity-60 block font-semibold">{t.labels.technique}</span>{catchItem.technique}</div>}
                        {catchItem.spot_type && <div><span className="opacity-60 block font-semibold">{t.labels.spot}</span>{catchItem.spot_type}</div>}
                    </div>
                )}
                
                {/* Legal Action Button for Restricted Species */}
                {catchItem.complianceStatus === 'legal_declaration_required' && (
                    <button className="w-full py-2 bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm border border-purple-400/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t.actions.declare}
                    </button>
                )}

                {/* AI Advice Snippet */}
                {catchItem.aiAdvice && (
                    <div className="p-3 rounded-lg border bg-black/20 border-white/10">
                        <div className="flex items-center gap-1.5 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200/80">Tacklor AI</span>
                        </div>
                        <p className="text-xs italic text-white/90">"{catchItem.aiAdvice}"</p>
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