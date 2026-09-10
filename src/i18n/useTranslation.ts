import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageItem } from './translations';

export function useTranslation() {
  const language = useAppStore(state => state.language);
  const updateSettings = useAppStore(state => state.updateSettings);

  // Normalize language string to valid key (en, hi, ta, te, bn, mr, gu, kn, ml, pa)
  const langKey = useMemo(() => {
    if (!language) return 'en';
    const lower = language.toLowerCase();
    const found = SUPPORTED_LANGUAGES.find(
      l => l.id.toLowerCase() === lower || 
           l.code.toLowerCase() === lower || 
           l.name.toLowerCase() === lower || 
           l.nativeName.toLowerCase() === lower
    );
    return found ? found.id : 'en';
  }, [language]);

  const currentLanguageItem: LanguageItem = useMemo(() => {
    return SUPPORTED_LANGUAGES.find(l => l.id === langKey) || SUPPORTED_LANGUAGES[0];
  }, [langKey]);

  // Translate helper function
  const t = (key: string, fallback?: string): string => {
    const langDict = TRANSLATIONS[langKey] || TRANSLATIONS['en'];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English dictionary
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return fallback || key;
  };

  const setLanguage = (langIdOrName: string) => {
    const found = SUPPORTED_LANGUAGES.find(
      l => l.id.toLowerCase() === langIdOrName.toLowerCase() ||
           l.name.toLowerCase() === langIdOrName.toLowerCase() ||
           l.code.toLowerCase() === langIdOrName.toLowerCase()
    );
    const targetName = found ? found.name : 'English';
    updateSettings({ language: targetName });
    try {
      localStorage.setItem('mausam_language_selected', 'true');
      localStorage.setItem('mausam_app_lang', found ? found.id : 'en');
    } catch {}
  };

  return {
    t,
    currentLangKey: langKey,
    currentLanguageItem,
    supportedLanguages: SUPPORTED_LANGUAGES,
    setLanguage,
  };
}
