import React, { useState } from 'react';
import { Globe, Check, X, Sparkles } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInitialPrompt?: boolean;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({
  isOpen,
  onClose,
  isInitialPrompt = false,
}) => {
  const { supportedLanguages, currentLangKey, setLanguage, t } = useTranslation();
  const [tempSelected, setTempSelected] = useState<string>(currentLangKey);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setLanguage(tempSelected);
    try {
      localStorage.setItem('mausam_language_selected', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with MAUSAM Crest & Title */}
        <div className="bg-gradient-to-r from-[#061938] via-[#082046] to-[#0E468A] text-white p-5 relative">
          {!isInitialPrompt && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1 shadow-md border border-white/20 shrink-0">
              <img 
                src="/images/mausam_logo.png" 
                alt="MAUSAM Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-300" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-200">
                  {t('language', 'Language')} • भाषा • மொழி • భాష
                </span>
              </div>
              <h3 className="text-base font-black tracking-tight text-white mt-0.5">
                {t('choose_language', 'Choose Your Language')}
              </h3>
            </div>
          </div>

          <p className="text-xs text-sky-100/90 mt-2 font-medium leading-relaxed">
            {t('choose_language_sub', 'Select your preferred regional language for weather forecasts, warnings, and destination guides.')}
          </p>
        </div>

        {/* 10 Indian Languages Grid */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            {supportedLanguages.map((lang) => {
              const isSelected = tempSelected === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setTempSelected(lang.id)}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'border-[#0E468A] bg-blue-50/80 ring-2 ring-[#0E468A]/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      {lang.code}
                    </span>
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#0E468A] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="text-base font-black text-[#082046] block leading-tight">
                      {lang.nativeName}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 block mt-0.5">
                      {lang.name}
                    </span>
                  </div>

                  <span className="text-[9px] text-slate-400 font-medium block mt-1.5 truncate">
                    {lang.region}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Confirm Action */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Switch anytime in Settings</span>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="py-3 px-6 rounded-2xl bg-[#082046] hover:bg-[#0E468A] active:scale-[0.98] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            {t('confirm_language', 'Confirm & Continue')} →
          </button>
        </div>
      </div>
    </div>
  );
};
