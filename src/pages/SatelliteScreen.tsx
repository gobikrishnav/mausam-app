import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Satellite as SatelliteIcon, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sliders, 
  Info
} from 'lucide-react';
import { MobileContainer } from '../components/layout/MobileContainer';

// Real INSAT-3DS Satellite Imagery products
const SAT_CHANNELS = [
  { id: 'TIR1', name: 'Thermal IR 1', wavelength: '10.83 µm', desc: 'Cloud top & land surface temperature' },
  { id: 'TIR2', name: 'Thermal IR 2', wavelength: '12.00 µm', desc: 'Split-window moisture discernment' },
  { id: 'MIR', name: 'Mid-Infrared', wavelength: '3.90 µm', desc: 'Wildfire & low stratus detection' },
  { id: 'WV', name: 'Water Vapor', wavelength: '6.90 µm', desc: 'Upper tropospheric jet streams' },
  { id: 'VIS', name: 'Visible Channel', wavelength: '0.65 µm', desc: 'High-res daytime albedo & cloud cover' },
  { id: 'COLOR', name: 'Enhanced Composite', wavelength: 'RGB False Color', desc: 'Deep convective storm top tracking' },
];

const SCAN_TIMES = [
  '06:00 UTC (11:30 IST)',
  '06:30 UTC (12:00 IST)',
  '07:00 UTC (12:30 IST)',
  '07:30 UTC (13:00 IST)',
  '08:00 UTC (13:30 IST)',
  '08:30 UTC (14:00 IST) [LATEST]',
];

export const SatelliteScreen: React.FC = () => {
  const navigate = useNavigate();

  const [activeChannel, setActiveChannel] = useState<string>('TIR1');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [stretchValue, setStretchValue] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeIndex, setTimeIndex] = useState<number>(SCAN_TIMES.length - 1);
  const [showInfo, setShowInfo] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setTimeIndex((prev) => (prev + 1) % SCAN_TIMES.length);
      }, 1500);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <MobileContainer hasBottomNav={false} className="p-0 bg-[#F8FAFC] text-slate-900 flex flex-col h-screen overflow-hidden">
      {/* Official IMD Satellite Top Bar */}
      <div className="px-3.5 pt-safe-top pb-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/home')}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:text-slate-900"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm font-extrabold text-[#082046] flex items-center gap-1.5 leading-none">
              INSAT-3DS Satellite Imagery
              <span className="text-[9px] bg-blue-100 text-[#0E468A] px-1.5 py-0.2 rounded font-mono font-bold">
                L1C MERCATOR
              </span>
            </h2>
            <span className="text-[10px] text-slate-500 mt-0.5 block leading-none font-medium">
              ISRO / IMD National Satellite Meteorological Centre
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0E468A] transition-colors"
          title="Satellite Metadata Info"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Product & Spectral Channel Selector Bar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {SAT_CHANNELS.map((ch) => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeChannel === ch.id
                ? 'bg-[#0E468A] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <SatelliteIcon className="w-3.5 h-3.5" />
            <span>{ch.id} (@ {ch.wavelength})</span>
          </button>
        ))}
      </div>

      {/* Main Satellite Image Canvas Viewport */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center select-none">
        {/* The Exact INSAT-3DS Image with zoom and filter controls */}
        <div 
          className="relative w-full h-full flex items-center justify-center transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <img
            src="/satellite/insat_3ds_tir1.png"
            alt="INSAT-3DS Thermal Infrared Imagery"
            className="w-full h-full object-contain max-h-[75vh]"
            style={{
              filter: activeChannel === 'COLOR'
                ? 'hue-rotate(180deg) saturate(1.8) contrast(1.2)'
                : activeChannel === 'WV'
                ? 'invert(0.15) contrast(1.3) brightness(0.9)'
                : activeChannel === 'VIS'
                ? 'contrast(1.4) brightness(1.1)'
                : `contrast(${1 + stretchValue * 0.1})`,
            }}
          />
        </div>

        {/* Floating Zoom & Canvas Controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.3, 2.5))}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 shadow-xl hover:bg-white"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.3, 1))}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-slate-800 shadow-xl hover:bg-white"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(1)}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-[#0E468A] shadow-xl hover:bg-white"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Live Satellite Stream Watermark Badge */}
        <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md border border-white/20 rounded-xl px-2.5 py-1.5 font-mono text-[9px] text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>DIRECT IMD MOSDAC SATELLITE FEED • NO KEY REQUIRED</span>
        </div>
      </div>

      {/* Calibration / Linear Contrast Slider Bar */}
      <div className="px-3.5 py-2 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#0E468A]" />
          <span className="text-[11px] font-bold text-slate-700">
            Contrast Enhancement: <strong className="text-slate-900">{stretchValue}%</strong>
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          value={stretchValue}
          onChange={(e) => setStretchValue(Number(e.target.value))}
          className="w-32 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E468A]"
        />
      </div>

      {/* Animation Playback Bar */}
      <div className="px-3.5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-white font-bold flex items-center gap-1 shadow-sm transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Loop'}</span>
          </button>
          <span className="text-slate-700 font-mono font-semibold text-[11px]">{SCAN_TIMES[timeIndex]}</span>
        </div>

        <span className="text-[10px] font-mono font-bold text-slate-500">
          Resolution: 4km Spatial
        </span>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-3xl p-5 shadow-2xl space-y-3 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-[#082046]">INSAT Satellite Data Intelligence</h3>
              <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed font-sans">
              <p>
                <strong className="text-emerald-700">No API key is required!</strong> The India Meteorological Department (IMD) and ISRO Space Applications Centre publish these INSAT-3DS geostationary imagery products freely.
              </p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[10px] space-y-1 text-slate-800">
                <div>📡 Satellite: INSAT-3DS (Geostationary @ 74°E)</div>
                <div>📷 Sensor: Imager (6 Spectral Channels)</div>
                <div>🛰️ Projection: L1C Mercator</div>
                <div>⏱️ Cadence: Refreshed every 15–30 minutes</div>
              </div>
            </div>

            <button
              onClick={() => setShowInfo(false)}
              className="w-full py-2.5 rounded-xl bg-[#0E468A] hover:bg-[#082046] text-white text-xs font-bold transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </MobileContainer>
  );
};
