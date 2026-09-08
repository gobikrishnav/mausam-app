import React, { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  hasBottomNav?: boolean;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ 
  children, 
  className = '',
  hasBottomNav = true 
}) => {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-[#0E468A] selection:text-white">
      {/* Mobile Frame (Constrained to max-w-md for smartphone experience on desktop) */}
      <div 
        className={`w-full max-w-md min-h-screen relative flex flex-col bg-[#F8FAFC] text-slate-900 border-x border-slate-200/80 shadow-2xl overflow-x-hidden ${className}`}
        style={{
          paddingBottom: hasBottomNav ? 'calc(5.75rem + env(safe-area-inset-bottom, 0px))' : 'max(1.5rem, env(safe-area-inset-bottom, 0px))'
        }}
      >
        {children}
      </div>
    </div>
  );
};
