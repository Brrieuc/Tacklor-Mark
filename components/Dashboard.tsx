import React, { useState } from 'react';
import { CatchRecord, Language, Theme, WeatherData } from '../types';
import { GlassCard } from './GlassCard';
import { translations } from '../i18n';
import { User } from 'firebase/auth';
import { TrophyModal, TrophyStats } from './TrophyModal';

interface DashboardProps {
  catches: CatchRecord[];
  onAddNew: () => void;
  onEdit: (record: CatchRecord) => void;
  onDelete: (id: string) => void;
  onLogin: () => void;
  user: User | null;
  lang: Language;
  theme: Theme;
  weather: WeatherData | null;
  locationError: boolean;
  isScrolled: boolean;
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

export const Dashboard: React.FC<DashboardProps> = ({ catches, onAddNew, onEdit, onDelete, onLogin, user, lang, theme, weather, locationError, isScrolled }) => {
  const [selectedCatch, setSelectedCatch] = useState<CatchRecord | null>(null);
  
  // State for Trophy Modals
  const [trophyModalType, setTrophyModalType] = useState<'weight' | 'length' | 'gallery' | null>(null);

  const t = translations[lang].dashboard;
  const tWeather = translations[lang].weather;
  const isDark = theme === 'dark';

  // Ombre portée adoucie
  const textShadowClass = "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]";
  
  // Calculs statistiques
  const totalLengthCm = catches.reduce((acc, curr) => acc + curr.length_cm, 0);
  const totalWeightKg = catches.reduce((acc, curr) => acc + curr.weight_kg, 0);
  
  // Calculs pour les nouveaux badges
  const totalCount = catches.length;
  // Set des espèces normalisées (lowercase + trim)
  const uniqueSpeciesCount = new Set(catches.map(c => c.species.toLowerCase().trim())).size;
  // Prises de nuit (entre 22h et 5h du matin)
  const nightCatchCount = catches.filter(c => {
      const h = new Date(c.date).getHours();
      return h >= 22 || h < 5;
  }).length;

  // Objet stats complet pour la modale
  const trophyStats: TrophyStats = {
      weight: totalWeightKg,
      length: totalLengthCm,
      count: totalCount,
      speciesCount: uniqueSpeciesCount,
      nightCount: nightCatchCount
  };

  const totalLengthDisplay = totalLengthCm >= 100 
    ? `${(totalLengthCm / 100).toFixed(2)} m` 
    : `${totalLengthCm} cm`;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-8 pb-24">
      
      {/* Trophy Modals Integration */}
      {trophyModalType && (
          <TrophyModal 
            isOpen={true}
            onClose={() => setTrophyModalType(null)}
            stats={trophyStats}
            type={trophyModalType}
            lang={lang}
            theme={theme}
          />
      )}

      {/* Sticky Header Area */}
      <div 
        className={`sticky top-[72px] sm:top-[80px] z-40 w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-x-2 gap-y-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] rounded-2xl overflow-hidden ${
            isScrolled 
            ? 'bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1 shadow-lg' 
            : 'px-1 py-2 bg-transparent border-transparent'
        }`}
      >
        {/* Left Side: Title Area */}
        <div className={`flex flex-col justify-center transition-all duration-500 min-w-0 flex-shrink ${
            isScrolled ? 'w-auto' : 'w-full md:w-auto'
        }`}>
          <h1 className={`font-extrabold tracking-tight text-white ${textShadowClass} transition-all duration-500 whitespace-nowrap origin-left ${
              isScrolled 
              ? 'text-lg md:text-xl mb-0' 
              : 'text-3xl md:text-5xl'
          }`}>
            {t.title}
          </h1>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isScrolled 
              ? 'max-h-0 opacity-0 mt-0' 
              : 'max-h-10 opacity-100 mt-1 md:mt-2'
          }`}>
            <p className={`text-white/90 font-medium ${textShadowClass} text-sm md:text-xl truncate`}>
                {t.subtitle}
            </p>
          </div>
        </div>
        
        {/* Right Side: Widgets Area */}
        <div className={`flex items-center gap-2 md:gap-3 flex-shrink-0 transition-all duration-500 ${
            isScrolled ? 'w-auto' : 'w-full md:w-auto justify-start md:justify-end'
        }`}>
            {/* Weather Widget */}
            <GlassCard theme={theme} className={`flex items-center !rounded-full shadow-lg backdrop-blur-md transition-all duration-500 border border-white/20 ${
                isScrolled 
                ? 'w-auto !py-1 !px-2 gap-1 bg-black/20' 
                : '!p-2 md:!p-3 gap-2 md:gap-4 bg-black/20 md:min-w-[180px]'
            }`}>
                {locationError ? (
                    <div className={`flex items-center justify-center text-red-400 ${textShadowClass}`}>
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                        <span className={`hidden md:inline text-xs font-bold ml-2 transition-all duration-500 ${isScrolled ? 'max-w-0 opacity-0 !ml-0' : 'max-w-[100px] opacity-100'}`}>Loc. Off</span>
                    </div>
                ) : !weather ? (
                    <div className="flex items-center gap-2 animate-pulse">
                         <div className="w-5 h-5 rounded-full bg-white/20"></div>
                    </div>
                ) : (
                    <>
                        {/* Temp Section */}
                        <div className={`flex items-center justify-center transition-all duration-500 ${textShadowClass}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`text-yellow-300 transition-all duration-500 flex-shrink-0 ${isScrolled ? 'h-5 w-5' : 'h-6 w-6'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <div className={`flex flex-col leading-none overflow-hidden transition-all duration-500 ease-in-out ${
                                isScrolled 
                                ? 'max-w-0 opacity-0 ml-0' 
                                : 'max-w-[80px] md:max-w-[100px] opacity-100 ml-1.5 md:ml-2'
                            }`}>
                                <span className="text-sm font-bold text-white whitespace-nowrap">{Math.round(weather.temp)}°C</span>
                                <span className="text-[10px] text-white/80 truncate hidden sm:block">
                                    {weather.locationName || tWeather.temp}
                                </span>
                            </div>
                        </div>
                        <div className={`w-px bg-white/30 transition-all duration-500 ${isScrolled ? 'h-3 mx-0.5' : 'h-6 mx-0 md:mx-1'}`}></div>
                        <div className={`flex items-center justify-center transition-all duration-500 ${textShadowClass}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`text-blue-300 transition-all duration-500 flex-shrink-0 ${isScrolled ? 'h-4 w-4' : 'h-5 w-4'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                             <div className={`flex flex-col leading-none overflow-hidden transition-all duration-500 ease-in-out ${
                                 isScrolled 
                                 ? 'max-w-0 opacity-0 ml-0' 
                                 : 'max-w-[80px] md:max-w-[100px] opacity-100 ml-1.5 md:ml-2'
                             }`}>
                                <span className="text-sm font-bold text-white whitespace-nowrap">{Math.round(weather.wind)} <span className="text-[9px]">km/h</span></span>
                                <span className="text-[10px] text-white/80 truncate hidden sm:block">{weather.desc}</span>
                            </div>
                        </div>
                    </>
                )}
            </GlassCard>

            {/* Action Button: New Catch OR Login */}
            <button
            onClick={user ? onAddNew : onLogin}
            className={`group relative rounded-full border transition-all duration-500 backdrop-blur-md shadow-lg hover:shadow-xl active:scale-95 bg-white/20 hover:bg-white/30 border-white/30 text-white ${textShadowClass} ${
                isScrolled 
                ? 'p-1.5 aspect-square flex items-center justify-center w-8 h-8 md:w-9 md:h-9' 
                : 'px-4 py-2 md:px-6 md:py-3 h-auto'
            }`}
            >
            <div className={`flex items-center justify-center h-full transition-all duration-500`}>
                {user ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-5 h-5'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`flex-shrink-0 transition-all duration-500 ${isScrolled ? 'w-5 h-5' : 'w-5 h-5'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
                <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${
                    isScrolled 
                    ? 'max-w-0 opacity-0 ml-0' 
                    : 'max-w-[200px] opacity-100 ml-2'
                }`}>
                    {user ? t.newCatch : t.connectToStart}
                </span>
            </div>
            </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-2 ${textShadowClass}`}>
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-6 md:py-8">
          <span className="text-4xl md:text-5xl font-extrabold text-white">{catches.length}</span>
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-2 text-white/70 text-center">{t.totalCatches}</span>
        </GlassCard>
        
        {/* Total Length - CLICKABLE FOR TROPHY ROAD */}
        <div onClick={() => setTrophyModalType('length')} className="cursor-pointer group transform transition-transform hover:scale-[1.02]">
            <GlassCard theme={theme} className="flex flex-col items-center justify-center py-6 md:py-8 relative overflow-hidden group-hover:bg-black/30 transition-colors border-2 border-transparent group-hover:border-white/20">
              {/* Shine Effect Hint */}
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <span className="text-3xl md:text-4xl font-extrabold text-white truncate max-w-full">
                {totalLengthDisplay}
              </span>
              <div className="flex items-center gap-2 mt-2">
                 <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/70 text-center">{t.totalLength}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
              </div>
            </GlassCard>
        </div>

        {/* Total Weight - CLICKABLE FOR TROPHY ROAD */}
        <div onClick={() => setTrophyModalType('weight')} className="cursor-pointer group transform transition-transform hover:scale-[1.02]">
            <GlassCard theme={theme} className="flex flex-col items-center justify-center py-6 md:py-8 relative overflow-hidden group-hover:bg-black/30 transition-colors border-2 border-transparent group-hover:border-white/20">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-400/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <span className="text-3xl md:text-4xl font-extrabold text-white truncate max-w-full">
                {totalWeightKg.toFixed(3)} <span className="text-lg md:text-2xl font-normal opacity-60">kg</span>
              </span>
              <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/70 text-center">{t.totalWeight}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                 </svg>
              </div>
            </GlassCard>
        </div>
        
        <GlassCard theme={theme} className="flex flex-col items-center justify-center py-6 md:py-8">
          <span className="text-4xl md:text-5xl font-extrabold text-green-400">
            {catches.filter(c => c.complianceStatus === 'compliant').length}
          </span>
          <span className="text-xs md:text-sm font-bold uppercase tracking-widest mt-2 text-white/70 text-center">{t.verifiedCompliant}</span>
        </GlassCard>
      </div>
      
      {/* Button to view all badges (Gallery) */}
      <div className="flex justify-center mb-6">
          <button 
            onClick={() => setTrophyModalType('gallery')}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all text-white/80 hover:text-white text-sm font-bold uppercase tracking-wide shadow-md"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t.actions.viewAllBadges}
          </button>
      </div>

      {/* Catches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catches.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <GlassCard theme={theme} className="border-2 shadow-xl backdrop-blur-xl bg-white/20 border-white/30">
              <div className={`flex flex-col items-center p-6 text-white ${textShadowClass}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 animate-bounce opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {user ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  )}
                </svg>
                <h3 className="text-xl font-bold mb-2">Bienvenue sur Tacklor Mark !</h3>
                <p className="text-lg opacity-90 mb-4">
                    {user ? t.emptyState : t.guestState}
                </p>
                <button 
                    onClick={user ? onAddNew : onLogin}
                    className={`mt-2 px-8 py-3 font-bold rounded-full transition-colors shadow-lg border border-white/20 flex items-center gap-2 ${
                        user 
                        ? 'bg-blue-600 hover:bg-blue-500 text-white'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                >
                    {user ? (
                        <>
                            <span>Ajouter une prise</span>
                        </>
                    ) : (
                        <>
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                            <span>Connexion Google</span>
                        </>
                    )}
                </button>
              </div>
            </GlassCard>
          </div>
        ) : (
          catches.map((catchItem) => (
            <GlassCard 
                key={catchItem.id} 
                theme={theme} 
                className="group hover:-translate-y-1 transition-transform p-0 overflow-hidden flex flex-col h-full relative cursor-pointer"
            >
              <div onClick={() => setSelectedCatch(catchItem)} className="flex flex-col h-full">
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

                    {/* Status Badge */}
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
                        <span className="text-xl font-bold text-white">{catchItem.weight_kg.toFixed(3)} kg</span>
                    </div>
                    </div>

                    {/* Additional Info (Location, Technique, Spot) */}
                    {(catchItem.location || catchItem.technique || catchItem.spot_type) && (
                        <div className="grid grid-cols-2 gap-2 text-xs border-t pt-3 border-white/20 text-white/80">
                            {/* Location (Full width if available) */}
                            {catchItem.location && (
                                <div className="col-span-2 flex items-center gap-1 text-white/90 mb-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-red-300" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-bold truncate">{catchItem.location}</span>
                                </div>
                            )}
                            {catchItem.technique && <div><span className="opacity-60 block font-semibold">{t.labels.technique}</span>{catchItem.technique}</div>}
                            {catchItem.spot_type && <div><span className="opacity-60 block font-semibold">{t.labels.spot}</span>{catchItem.spot_type}</div>}
                        </div>
                    )}
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Details Modal */}
      {selectedCatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedCatch(null)}>
            <div 
                className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gray-900 border border-white/20 shadow-2xl relative flex flex-col md:flex-row animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={() => setSelectedCatch(null)}
                    className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Left: Image (Full height on desktop, top on mobile) */}
                <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                    <img 
                        src={selectedCatch.imageUrl} 
                        alt={selectedCatch.species} 
                        className="w-full h-full object-cover"
                    />
                     <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent p-6 md:hidden">
                        <h2 className="text-3xl font-bold text-white drop-shadow-md">{selectedCatch.species}</h2>
                     </div>
                </div>

                {/* Right: Details */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col text-white">
                    <h2 className="text-3xl font-bold mb-1 hidden md:block">{selectedCatch.species}</h2>
                    <p className="text-white/60 text-sm mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(selectedCatch.date).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US', { dateStyle: 'long', timeStyle: 'short' })}
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">{t.labels.length}</span>
                            <span className="text-2xl font-bold">{selectedCatch.length_cm} cm</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <span className="text-xs uppercase tracking-wider text-white/50 block mb-1">{t.labels.weight}</span>
                            <span className="text-2xl font-bold">{selectedCatch.weight_kg.toFixed(3)} kg</span>
                        </div>
                    </div>
                    
                    <div className="space-y-4 mb-8 flex-grow">
                         {selectedCatch.location && (
                            <div className="flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <span className="block text-sm font-semibold text-white/60">{t.labels.location}</span>
                                    <span className="text-lg">{selectedCatch.location}</span>
                                </div>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <span className="block text-sm font-semibold text-white/60">{t.labels.technique}</span>
                                <span className="text-base">{selectedCatch.technique || "-"}</span>
                             </div>
                             <div>
                                <span className="block text-sm font-semibold text-white/60">{t.labels.spot}</span>
                                <span className="text-base">{selectedCatch.spot_type || "-"}</span>
                             </div>
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <span className="block text-sm font-semibold text-white/60 mb-2">Statut</span>
                            <StatusBadge status={selectedCatch.complianceStatus} lang={lang} />
                        </div>

                         {selectedCatch.aiAdvice && (
                            <div className="mt-4 p-4 rounded-xl bg-blue-900/20 border border-blue-500/30 text-sm italic text-blue-100/90">
                                "{selectedCatch.aiAdvice}"
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 mt-auto">
                        <button 
                            onClick={() => {
                                if (window.confirm(t.actions.confirmDelete)) {
                                    onDelete(selectedCatch.id);
                                    setSelectedCatch(null);
                                }
                            }}
                            className="px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold transition-colors border border-red-500/20"
                        >
                            {t.actions.delete}
                        </button>
                        <button 
                            onClick={() => {
                                onEdit(selectedCatch);
                                setSelectedCatch(null);
                            }}
                            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg border border-white/10 flex justify-center items-center gap-2"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                           </svg>
                           {t.actions.edit}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};