import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CloudSun, 
  Zap, 
  CalendarDays, 
  AlertTriangle, 
  Map, 
  Satellite, 
  Sprout, 
  Activity 
} from 'lucide-react';

interface ImdFeatureGridProps {
  onNowcastClick?: () => void;
  onWarningsClick?: () => void;
}

export const ImdFeatureGrid: React.FC<ImdFeatureGridProps> = ({ 
  onNowcastClick,
  onWarningsClick 
}) => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'current',
      title: 'Current Weather',
      sub: 'Station Met Data',
      icon: CloudSun,
      color: 'bg-blue-50 text-[#0E468A] border-[#0E468A]/20',
      badge: 'LIVE',
      badgeColor: 'bg-emerald-600 text-white',
      onClick: () => {
        window.scrollTo({ top: 180, behavior: 'smooth' });
      },
    },
    {
      id: 'nowcast',
      title: 'Nowcast',
      sub: '3-Hour Alert',
      icon: Zap,
      color: 'bg-amber-50 text-[#E65100] border-[#E65100]/20',
      badge: '3H',
      badgeColor: 'bg-amber-500 text-slate-950',
      onClick: onNowcastClick || (() => navigate('/alerts')),
    },
    {
      id: 'forecast',
      title: 'City Forecast',
      sub: '7-Day Outlook',
      icon: CalendarDays,
      color: 'bg-sky-50 text-[#1976D2] border-[#1976D2]/20',
      badge: '7D',
      badgeColor: 'bg-blue-600 text-white',
      onClick: () => navigate('/forecast'),
    },
    {
      id: 'warnings',
      title: 'Warnings',
      sub: 'Color Matrix',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-[#C62828] border-[#C62828]/20',
      badge: 'ALERT',
      badgeColor: 'bg-rose-600 text-white',
      onClick: onWarningsClick || (() => navigate('/alerts')),
    },
    {
      id: 'live_map',
      title: 'Live Map',
      sub: 'Multi-Layer Grid',
      icon: Map,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      badge: 'MAP',
      badgeColor: 'bg-indigo-600 text-white',
      onClick: () => navigate('/map'),
    },
    {
      id: 'satellite',
      title: 'Satellite',
      sub: 'INSAT-3D Loop',
      icon: Satellite,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      badge: 'SAT',
      badgeColor: 'bg-purple-600 text-white',
      onClick: () => navigate('/satellite'),
    },
    {
      id: 'agromet',
      title: 'Agromet Advisory',
      sub: 'Meghdoot Crops',
      icon: Sprout,
      color: 'bg-emerald-50 text-[#2E7D32] border-emerald-200',
      badge: 'AGRI',
      badgeColor: 'bg-emerald-600 text-white',
      onClick: () => navigate('/explore'),
    },
    {
      id: 'air_quality',
      title: 'Air Quality',
      sub: 'CPCB AQI Index',
      icon: Activity,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      badge: 'AQI',
      badgeColor: 'bg-teal-600 text-white',
      onClick: () => navigate('/environment'),
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-[#082046] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#0E468A]" />
          IMD Meteorological Products
        </h3>
        <span className="text-[10px] text-slate-500 font-medium">Official Services</span>
      </div>

      {/* 4x2 Grid of Feature Hub Buttons */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              className="bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-all text-center relative group min-h-[88px] sm:min-h-[92px] overflow-hidden cursor-pointer"
            >
              {/* Badge */}
              <span className={`absolute top-1 right-1 px-1.5 py-0.2 rounded-md text-[7px] sm:text-[8px] font-black tracking-tight ${item.badgeColor} shadow-2xs`}>
                {item.badge}
              </span>

              {/* Icon Container */}
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${item.color} mt-1.5 group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              {/* Title & Sub */}
              <div className="mt-1 w-full px-0.5">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-900 leading-tight block truncate">
                  {item.title}
                </span>
                <span className="text-[8px] sm:text-[9px] text-slate-500 block truncate leading-none mt-0.5">
                  {item.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
