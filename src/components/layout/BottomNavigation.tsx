import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, CalendarDays, Map, Bell, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';

export const BottomNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const unreadAlertsCount = useAppStore(state => state.unreadAlertsCount);
  const { t } = useTranslation();

  // Hidden on onboarding, splash, and auth screens
  const isHidden = ['/splash', '/onboarding', '/auth', '/login', '/signup', '/forgot-password'].some(p => location.pathname.startsWith(p));
  if (isHidden) return null;

  const tabs = [
    { label: t('nav_home', 'Home'), path: '/home', icon: Home },
    { label: t('nav_map', 'Live Map'), path: '/map', icon: Map },
    { label: t('nav_ask_ai', 'Ask AI'), path: '/assistant', icon: Sparkles, isFab: true },
    { label: t('nav_forecast', 'Forecast'), path: '/forecast', icon: CalendarDays },
    { label: t('nav_warnings', 'Warnings'), path: '/alerts', icon: Bell, badge: unreadAlertsCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div 
        className="w-full max-w-md pointer-events-auto bg-white/95 backdrop-blur-xl border-t border-slate-200/90 sm:border-x sm:rounded-t-2xl px-2 xs:px-3 pt-2 flex items-center justify-between shadow-2xl"
        style={{ paddingBottom: 'max(0.6rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          if (tab.isFab) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative -top-5 flex flex-col items-center group focus:outline-none cursor-pointer touch-manipulation"
                aria-label="Ask MAUSAM"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#082046] to-[#0E468A] p-[2px] shadow-lg shadow-[#0E468A]/30 group-hover:scale-105 active:scale-95 transition-transform">
                  <div className="w-full h-full rounded-full bg-[#082046] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#082046] mt-0.5">Ask AI</span>
              </button>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors relative cursor-pointer touch-manipulation active:scale-95 ${
                isActive ? 'text-[#0E468A]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px] text-[#0E468A]' : 'stroke-2'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#C62828] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-white shadow-2xs">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className={`text-[10px] mt-0.5 font-bold leading-none ${isActive ? 'text-[#0E468A]' : 'text-slate-500'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E468A] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
