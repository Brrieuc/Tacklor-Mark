import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { NewCatchForm } from './components/NewCatchForm';
import { Leaderboard } from './components/Leaderboard';
import { ProfileModal } from './components/ProfileModal'; // Import ProfileModal
import { CatchRecord, ViewState, Language, Theme, WeatherData } from './types';
import { translations } from './i18n';
import { fetchUserCaptures, saveCapture, deleteCapture, updateCapture } from './services/storageService';
import { fetchCurrentWeather } from './services/weatherService';
import { auth, signInWithGoogle, logoutUser } from './services/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  
  const [catches, setCatches] = useState<CatchRecord[]>([]);
  const [editingCatch, setEditingCatch] = useState<CatchRecord | null>(null);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const [lang, setLang] = useState<Language>('fr');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isScrolled, setIsScrolled] = useState(false);

  // Weather State
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  // Background Images
  const bgDay = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiYWwMD27VB-_OQ7OrwaiBqJ-7lNELdUS4CYyrelQi_0blK4duusIiPywZlzSoLPCGjK6p0YfV55PcwkgafWvtJOi3MTmpHwYfhravhXRLRCCa2Mq0YaVfMdGTYT1tKB3whMRbQdQVt0RERB1UnOO1NepeTof4Ti7_k7GzZO53n4e3NfwuEPgXucIZPjDI/s16000/Fond%20Tropical.png';
  const bgNight = 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj20dNTvoUjjdxI39uKfSeA6UnGif5MhnMkTYrdK40ly6IGTIqXrXUY6_dfFBNd5kYsi_7EeXSAyAiBAuAPTikKnyrgneFcAcX6vPoaYzJN84YlzdaTOAE19jm6ElAd2oMt3g5y37FH9eGhpsOaUQce2hhJjIwMb8cC9DiQcYRYsrxYwHlbtNyjK3MAmgk/s16000/Fond%20Nuit.png';

  // 1. Initialize Auth Listener & Data Fetching
  useEffect(() => {
    let unsubscribe = () => {};

    const init = async () => {
        // NETTOYAGE DE SÉCURITÉ : On supprime tout brouillon potentiellement corrompu
        // pour empêcher l'application de boucler sur un écran noir.
        localStorage.removeItem('tacklor_catch_draft');

        const weather = await fetchCurrentWeather();
        if (weather) {
            setWeatherData(weather);
            setLocationError(false);
        } else {
            setLocationError(true);
        }

        if (auth) {
            unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                setUser(currentUser);
                setAuthLoading(false);
                
                if (currentUser) {
                    setDataLoading(true);
                    try {
                        const data = await fetchUserCaptures(currentUser.uid);
                        setCatches(data);
                    } catch (err) {
                        console.error("Error fetching initial data", err);
                    } finally {
                        setDataLoading(false);
                    }
                } else {
                    setCatches([]);
                }
            });
        } else {
            setAuthLoading(false);
            setCatches([]);
        }
    };

    init();

    const handleScroll = () => {
        const currentY = window.scrollY;
        setIsScrolled(prevIsScrolled => {
            const shrinkThreshold = 60;
            const expandThreshold = 10;
            if (!prevIsScrolled && currentY > shrinkThreshold) return true;
            if (prevIsScrolled && currentY < expandThreshold) return false;
            return prevIsScrolled;
        });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
        window.removeEventListener('scroll', handleScroll);
        unsubscribe();
    };
  }, []);

  const handleSaveCatch = async (record: CatchRecord) => {
    if (!user) {
        alert("Veuillez vous connecter pour sauvegarder votre prise.");
        return;
    }

    setDataLoading(true);
    try {
        let updatedLogbook;
        if (editingCatch) {
            updatedLogbook = await updateCapture(record, user);
        } else {
            updatedLogbook = await saveCapture(record, user);
        }
        
        setCatches(updatedLogbook);
        setView(ViewState.DASHBOARD);
        setEditingCatch(null);
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la sauvegarde sur le cloud.");
    } finally {
        setDataLoading(false);
    }
  };
  
  const handleEditRequest = (record: CatchRecord) => {
      setEditingCatch(record);
      setView(ViewState.NEW_CATCH);
  };

  const handleDeleteCatch = async (id: string) => {
    if (!user) return;
    
    try {
        await deleteCapture(id, user);
        setCatches(prev => prev.filter(c => c.id !== id));
    } catch (error) {
        console.error("Failed to delete", error);
        alert("Erreur lors de la suppression de la prise.");
    }
  };

  const handleLogin = async () => {
      try {
          await signInWithGoogle();
      } catch (e: any) {
          console.error("Login Error:", e);
          alert(`Erreur de connexion Google : ${e.message || e.code || "Erreur inconnue"}`);
      }
  };

  const t = translations[lang];
  const isDark = theme === 'dark';
  const textShadowClass = "drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]";

  return (
    <div 
      className="min-h-screen pb-10 relative transition-all duration-700 ease-in-out"
      style={{
        backgroundImage: `url('${isDark ? bgNight : bgDay}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-[100] px-4 sm:px-6 py-4 mb-2">
        <div className="max-w-7xl mx-auto">
          {/* Navbar Background */}
          <div 
            className={`
                rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between backdrop-blur-xl transition-all duration-500
                ${isDark ? 'bg-black/40 border-white/10' : 'bg-black/20 border-white/20'}
                ${isScrolled ? 'shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b' : 'shadow-2xl border'}
            `}
          >
            {/* Logo + Title */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setView(ViewState.DASHBOARD); setEditingCatch(null); }}>
               <img 
                 src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh1ebB7GZWegRbYq-_RKqU2d8qHqK0m6asNfhQDg5nEdQnwPE9X-duj2FXOEcxa0jBMRdQqH_jWzYOdGGlxUNqv21wqVk_15n5kAAqdcqB9X6JX1B5qeKL0gzGE_hy4o1LzM4MA0_o3k0sEfk2ZawNhyz6efj9QoU4u8xcpJkljzhFQYwChLXUrp4ya9LA/s320/Logo%20Tacklor%20Mark.png" 
                 alt="Tacklor Mark" 
                 className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" 
               />
               <span className={`hidden sm:inline text-xl font-bold tracking-tight text-white ${textShadowClass}`}>{t.appTitle}</span>
            </div>
            
            {/* Navigation Actions */}
            <div className="flex items-center gap-2 md:gap-3">
              
              <button 
                onClick={() => setView(ViewState.LEADERBOARD)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border text-white ${textShadowClass} ${view === ViewState.LEADERBOARD ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
              >
                 <span className="text-lg">🏆</span>
                 <span className={`text-xs font-bold uppercase tracking-wider hidden md:inline`}>Classement</span>
              </button>

              <div className="h-6 w-px bg-white/20 mx-1"></div>

              <button 
                onClick={() => setLang(prev => prev === 'fr' ? 'en' : 'fr')}
                className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors uppercase tracking-wider border bg-white/20 hover:bg-white/30 text-white border-white/30 ${textShadowClass}`}
              >
                {lang}
              </button>
              
              <button 
                onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
                className={`p-1.5 rounded-full border backdrop-blur-md transition-all bg-white/20 hover:bg-white/30 border-white/30 text-white/90 ${textShadowClass}`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
              </button>

               {/* Authentication UI */}
               {authLoading ? (
                   <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse"></div>
               ) : user ? (
                 <>
                    {/* User Avatar - CLICK to open Profile Modal */}
                    <button 
                        onClick={() => setIsProfileOpen(true)}
                        className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 shadow-md transition-transform hover:scale-105 cursor-pointer"
                    >
                        <img src={user.photoURL || "https://ui-avatars.com/api/?name=" + user.displayName} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                    </button>
                    
                    {/* Profile Modal */}
                    <ProfileModal 
                        isOpen={isProfileOpen}
                        onClose={() => setIsProfileOpen(false)}
                        user={user}
                        lang={lang}
                        theme={theme}
                    />
                 </>
               ) : (
                 <button 
                    onClick={handleLogin}
                    className="flex items-center gap-2 bg-white text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg hover:bg-gray-100 transition-colors"
                 >
                     <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="G" />
                     <span className="hidden sm:inline">Connexion</span>
                 </button>
               )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="transition-all duration-500 ease-in-out relative z-0">
        {/* Loading Indicator for Data */}
        {dataLoading && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
                 <div className="bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-white/10 shadow-xl">
                    <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synchronisation...
                 </div>
            </div>
        )}

        {view === ViewState.DASHBOARD && (
          <Dashboard 
            catches={catches} 
            user={user}
            onAddNew={() => {
                if(user) {
                    setEditingCatch(null);
                    setView(ViewState.NEW_CATCH);
                }
            }} 
            onEdit={handleEditRequest}
            onDelete={handleDeleteCatch}
            onLogin={handleLogin}
            lang={lang}
            theme={theme}
            weather={weatherData}
            locationError={locationError}
            isScrolled={isScrolled}
          />
        )}
        
        {view === ViewState.NEW_CATCH && (
          <NewCatchForm 
            onSave={handleSaveCatch} 
            onCancel={() => {
                setEditingCatch(null);
                setView(ViewState.DASHBOARD);
            }}
            lang={lang}
            theme={theme}
            weather={weatherData}
            initialData={editingCatch}
          />
        )}

        {view === ViewState.LEADERBOARD && (
            <Leaderboard 
                lang={lang} 
                theme={theme}
                userCurrentId={user?.uid}
            />
        )}
      </main>
    </div>
  );
}