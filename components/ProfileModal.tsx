import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GlassCard } from './GlassCard';
import { User } from 'firebase/auth';
import { Language, Theme } from '../types';
import { translations } from '../i18n';
import { fetchUserProfile, saveUserProfile } from '../services/storageService';
import { logoutUser } from '../services/firebaseConfig';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: Language;
  theme: Theme;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, lang, theme }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [birthDate, setBirthDate] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showAge, setShowAge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const t = translations[lang].profile;
  const isDark = theme === 'dark';
  
  // Styles
  const inputClass = 'w-full rounded-xl px-4 py-3 bg-black/20 border-white/20 text-white focus:ring-blue-500/50 placeholder-white/40 shadow-inner focus:outline-none focus:ring-2 transition-all';
  const labelClass = 'text-white/80 font-semibold mb-2 block text-sm';

  // Load profile data from Firestore on mount
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      fetchUserProfile(user).then((profile) => {
        setDisplayName(profile.displayName);
        setPhotoURL(profile.photoURL);
        setIsPublic(profile.isPublic);
        setBirthDate(profile.birthDate || '');
        setShowAge(profile.showAge || false);
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsSaving(true);
    setStatusMessage('');
    try {
      await saveUserProfile(user, {
        displayName,
        photoURL,
        isPublic,
        birthDate,
        showAge
      });
      setStatusMessage(t.saved);
      // Fermer après un court délai pour montrer le succès
      setTimeout(() => {
        onClose();
        setStatusMessage('');
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatusMessage("Erreur lors de la sauvegarde.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <GlassCard theme={theme} className="w-full max-w-md relative flex flex-col gap-6 max-h-[90vh] overflow-y-auto" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
               <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            {t.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Avatar Preview & URL */}
            <div className="flex flex-col items-center gap-4">
               <div className="w-24 h-24 rounded-full border-4 border-blue-500/50 shadow-lg overflow-hidden bg-black/40">
                  <img 
                    src={photoURL || `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=random`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=random`;
                    }}
                  />
               </div>
               <div className="w-full">
                  <label className={labelClass}>{t.photoUrl}</label>
                  <input 
                    type="text" 
                    value={photoURL} 
                    onChange={(e) => setPhotoURL(e.target.value)} 
                    placeholder="https://..." 
                    className={inputClass}
                  />
               </div>
            </div>

            {/* Display Name */}
            <div>
              <label className={labelClass}>{t.displayName}</label>
              <input 
                type="text" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                className={inputClass}
              />
            </div>

            {/* Date of Birth & Show Age Switch */}
            <div className="grid grid-cols-1 gap-4">
                 <div>
                    <label className={labelClass}>{t.birthDate}</label>
                    <input 
                        type="date" 
                        value={birthDate} 
                        onChange={(e) => setBirthDate(e.target.value)} 
                        className={`${inputClass} [color-scheme:dark]`}
                    />
                </div>
                
                {/* Age Visibility Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                     <span className="text-sm font-medium text-white/80">{t.showAge}</span>
                     <button 
                        onClick={() => setShowAge(!showAge)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${showAge ? 'bg-blue-500' : 'bg-gray-600'}`}
                    >
                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${showAge ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                </div>
            </div>

            {/* Privacy Switch (Public Profile) */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
               <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white">{t.privacyTitle}</span>
                  
                  {/* Toggle Switch */}
                  <button 
                    onClick={() => setIsPublic(!isPublic)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${isPublic ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${isPublic ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
               </div>
               <div className="flex items-start gap-2 text-sm text-white/70">
                   <div className="mt-0.5 min-w-[1rem]">
                      {isPublic ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                             <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                             <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                      ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                             <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                      )}
                   </div>
                   <div>
                       <p className="font-medium text-white">{t.publicProfile}</p>
                       {!isPublic && <p className="text-xs text-yellow-200/80 mt-1">{t.publicDesc}</p>}
                   </div>
               </div>
            </div>

            {statusMessage && (
                <div className={`p-3 rounded-lg text-center font-bold text-sm ${statusMessage.includes('Erreur') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                    {statusMessage}
                </div>
            )}

            {/* Actions */}
            <div className="pt-4 flex gap-4">
               <button 
                 onClick={handleLogout}
                 className="px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold transition-colors"
               >
                 {t.logout}
               </button>
               <button 
                 onClick={handleSave}
                 disabled={isSaving}
                 className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg transition-all disabled:opacity-50"
               >
                 {isSaving ? '...' : t.save}
               </button>
            </div>

          </div>
        )}
      </GlassCard>
    </div>,
    document.body
  );
};