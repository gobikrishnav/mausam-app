import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Navigation, 
  Plus, 
  Minus, 
  Car, 
  Thermometer, 
  Wind, 
  CloudRain, 
  Activity,
  Satellite as SatelliteIcon,
  Play,
  Pause,
  Sliders,
  Route,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Shirt,
  AlertTriangle,
  Layers,
  Clock,
  HeartPulse,
  X,
  Droplets,
  Sun
} from 'lucide-react';
import L from 'leaflet';
import { MobileContainer } from '../components/layout/MobileContainer';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../i18n/useTranslation';
import { 
  ALL_DESTINATIONS_TELEMETRY, 
  DestinationTelemetry, 
  generateTransitAdvisory, 
  TransitJourneyAdvisory
} from '../services/destinationService';

type WeatherLayerType = 'traffic' | 'precipitation' | 'satellite' | 'temperature' | 'wind' | 'aqi';
type MapViewMode = 'layers' | 'destinations';
type DestinationCategoryFilter = 'all' | 'hill_stations' | 'coastal' | 'pilgrimage' | 'agriculture' | 'cyclone_zones';

export const MapScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentLocation, savedLocations, weather, airQuality } = useAppStore();
  const { t } = useTranslation();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const destinationLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const satelliteOverlayRef = useRef<L.ImageOverlay | null>(null);
  const rainViewerTileLayerRef = useRef<L.TileLayer | null>(null);
  const tomtomTileLayerRef = useRef<L.TileLayer | null>(null);
  const carouselScrollRef = useRef<HTMLDivElement>(null);

  // Core Screen State
  const [viewMode, setViewMode] = useState<MapViewMode>('destinations');
  const [activeLayer, setActiveLayer] = useState<WeatherLayerType>('precipitation');
  const [satOpacity, setSatOpacity] = useState<number>(0.85);
  const [tomtomApiKey] = useState<string>(() => localStorage.getItem('mausam_tomtom_key') || import.meta.env.VITE_TOMTOM_API_KEY || '0VGms4e2HWfXZ767rZ1weQR64LyEqgI6');
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const [rainViewerHost, setRainViewerHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [currentPrecipIndex, setCurrentPrecipIndex] = useState<number>(0);

  // Destination & Journey Routing State
  const [selectedCategory, setSelectedCategory] = useState<DestinationCategoryFilter>('all');
  const [selectedDestination, setSelectedDestination] = useState<DestinationTelemetry | null>(null);
  const [transitAdvisory, setTransitAdvisory] = useState<TransitJourneyAdvisory | null>(null);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState<boolean>(false);
  const [mapPinDisplay, setMapPinDisplay] = useState<'aqi' | 'temp'>('aqi');

  // Filtered destination list
  const filteredDestinations = useMemo(() => {
    if (selectedCategory === 'all') return ALL_DESTINATIONS_TELEMETRY;
    return ALL_DESTINATIONS_TELEMETRY.filter(d => d.category === selectedCategory);
  }, [selectedCategory]);

  // Handle Destination Selection & Route Drawing
  const handleSelectDestination = useCallback((dest: DestinationTelemetry) => {
    setSelectedDestination(dest);
    
    // Generate Source-to-Destination Transit Telemetry & Advice
    const sourceLoc = currentLocation;
    const advisory = generateTransitAdvisory(
      sourceLoc, 
      dest, 
      weather?.temperature, 
      airQuality?.aqi
    );
    setTransitAdvisory(advisory);

    // Render Route on Map
    const map = mapInstanceRef.current;
    const routeLg = routeLayerGroupRef.current;
    if (!map || !routeLg) return;

    routeLg.clearLayers();

    // Animated glow polyline
    L.polyline(advisory.routeCoordinates, {
      color: '#0E468A',
      weight: 5,
      opacity: 0.9,
      dashArray: '6, 8',
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(routeLg);

    // Glowing casing line
    L.polyline(advisory.routeCoordinates, {
      color: '#38BDF8',
      weight: 10,
      opacity: 0.35,
    }).addTo(routeLg);

    // Destination Pin with Flag
    const destPinIcon = L.divIcon({
      className: 'dest-flag-pin',
      html: `
        <div class="flex items-center gap-1 bg-red-600 text-white px-2 py-1 rounded-full shadow-lg border-2 border-white text-xs font-black animate-bounce">
          <span>🏁</span>
          <span>${dest.name}</span>
        </div>
      `,
      iconSize: [80, 26],
      iconAnchor: [40, 26],
    });

    L.marker([dest.latitude, dest.longitude], { icon: destPinIcon }).addTo(routeLg);

    // Fit bounds to display both origin and destination comfortably
    const bounds = L.latLngBounds([
      [sourceLoc.latitude, sourceLoc.longitude],
      [dest.latitude, dest.longitude]
    ]);
    map.flyToBounds(bounds, {
      padding: [70, 70],
      duration: 1.2,
      maxZoom: 9,
    });
  }, [currentLocation, weather, airQuality]);

  const handleClearRoute = () => {
    setSelectedDestination(null);
    setTransitAdvisory(null);
    setIsAdvisoryModalOpen(false);
    if (routeLayerGroupRef.current) {
      routeLayerGroupRef.current.clearLayers();
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentLocation.latitude, currentLocation.longitude], 6, { duration: 1.0 });
    }
  };

  // 1. Initialize Map Base
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.latitude, currentLocation.longitude],
      zoom: 6,
      zoomControl: false,
    });

    // Clean light base tile layer (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CartoDB & OpenStreetMap &copy; IMD / ISRO',
      maxZoom: 19,
    }).addTo(map);

    // Layer groups
    const lg = L.layerGroup().addTo(map);
    layerGroupRef.current = lg;

    const destLg = L.layerGroup().addTo(map);
    destinationLayerGroupRef.current = destLg;

    const routeLg = L.layerGroup().addTo(map);
    routeLayerGroupRef.current = routeLg;

    // INSAT-3DS Mercator Satellite Overlay
    const imageBounds: L.LatLngBoundsExpression = [
      [-2.0, 48.0],
      [42.0, 106.0]
    ];
    satelliteOverlayRef.current = L.imageOverlay('/satellite/insat_3ds_tir1.png', imageBounds, {
      opacity: satOpacity,
      interactive: false,
    });

    // Custom pulsing user marker icon
    const pulsingIcon = L.divIcon({
      className: 'custom-gps-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="w-4 h-4 rounded-full bg-[#0E468A] ring-4 ring-[#0E468A]/30"></div>
          <div class="absolute w-8 h-8 rounded-full bg-[#0E468A]/20 animate-ping"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    L.marker([currentLocation.latitude, currentLocation.longitude], {
      icon: pulsingIcon,
    }).addTo(map).bindPopup(`
      <div class="p-1 text-slate-900">
        <b class="text-sm text-[#082046]">${currentLocation.name}</b><br/>
        <span class="text-xs text-slate-600">${t('source')} (Observation Station)</span><br/>
        <span class="text-xs font-bold text-[#0E468A]">${weather ? weather.temperature + '°C • ' + weather.conditionText : ''}</span>
      </div>
    `);

    // Add saved locations markers
    savedLocations.forEach((loc) => {
      if (loc.id !== currentLocation.id) {
        L.marker([loc.latitude, loc.longitude])
          .addTo(map)
          .bindPopup(`<b>${loc.name}</b><br/><span class="text-xs uppercase text-slate-500">${loc.type}</span>`);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [currentLocation, savedLocations, weather, t, satOpacity]);

  // 2. Fetch RainViewer live precipitation metadata
  useEffect(() => {
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.radar && data.radar.past) {
          if (data.host) setRainViewerHost(data.host);
          const allFrames: Array<{ time: number; path: string }> = [...data.radar.past];
          if (data.radar.nowcast) {
            allFrames.push(...data.radar.nowcast);
          }
          if (allFrames.length > 0) {
            setRadarFrames(allFrames);
            setCurrentPrecipIndex(allFrames.length - 1);
          }
        }
      })
      .catch((err) => {
        console.warn('RainViewer API offline or unavailable:', err);
      });
  }, []);

  // Auto-playback loop for timeline
  useEffect(() => {
    if (!isTimelinePlaying || radarFrames.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentPrecipIndex(prev => (prev + 1) % radarFrames.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isTimelinePlaying, radarFrames.length]);

  // 3. Render and switch GIS Layers dynamically (when in layers mode)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const lg = layerGroupRef.current;
    if (!map || !lg) return;

    lg.clearLayers();

    if (satelliteOverlayRef.current && map.hasLayer(satelliteOverlayRef.current)) {
      map.removeLayer(satelliteOverlayRef.current);
    }
    if (rainViewerTileLayerRef.current && map.hasLayer(rainViewerTileLayerRef.current)) {
      map.removeLayer(rainViewerTileLayerRef.current);
      rainViewerTileLayerRef.current = null;
    }
    if (tomtomTileLayerRef.current && map.hasLayer(tomtomTileLayerRef.current)) {
      map.removeLayer(tomtomTileLayerRef.current);
      tomtomTileLayerRef.current = null;
    }

    if (viewMode !== 'layers') {
      return;
    }

    // SATELLITE
    if (activeLayer === 'satellite') {
      if (satelliteOverlayRef.current) {
        satelliteOverlayRef.current.addTo(map);
        satelliteOverlayRef.current.setOpacity(satOpacity);
      }
    }

    // PRECIPITATION
    else if (activeLayer === 'precipitation') {
      const frame = radarFrames[currentPrecipIndex] || radarFrames[radarFrames.length - 1];
      if (frame && frame.path) {
        const precipTileUrl = `${rainViewerHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
        const precipLayer = L.tileLayer(precipTileUrl, {
          opacity: satOpacity,
          maxZoom: 18,
          attribution: '&copy; RainViewer Live Precipitation Network',
        }).addTo(map);
        rainViewerTileLayerRef.current = precipLayer;
      }

      // IMD Radar Stations
      const imdDwrStations = [
        { name: 'Mumbai (Colaba & Veravali DWR)', lat: 18.9067, lng: 72.8147, rangeKm: 250, dbz: 48, status: 'Active Coastal Rain Echoes' },
        { name: 'Delhi (Mausam Bhawan DWR)', lat: 28.5886, lng: 77.2208, rangeKm: 250, dbz: 32, status: 'Light Precipitation Trace' },
        { name: 'Chennai (Port DWR)', lat: 13.0827, lng: 80.2707, rangeKm: 250, dbz: 42, status: 'Coastal Convective Cell Activity' },
        { name: 'Kolkata (Alipore DWR)', lat: 22.5326, lng: 88.3283, rangeKm: 250, dbz: 52, status: 'Active Thunderstorm Cluster' },
        { name: 'Bengaluru (Peenya DWR)', lat: 13.0334, lng: 77.5140, rangeKm: 250, dbz: 28, status: 'Isolated Cumulus Clouds' },
        { name: 'Hyderabad (Begumpet DWR)', lat: 17.4531, lng: 78.4677, rangeKm: 250, dbz: 35, status: 'Trace Rain Cell Movement' },
        { name: 'Bhubaneswar (IMD DWR)', lat: 20.3255, lng: 85.8199, rangeKm: 250, dbz: 45, status: 'Bay of Bengal Moisture Convergence' },
        { name: 'Srinagar (Pir Panjal DWR)', lat: 34.0837, lng: 74.7973, rangeKm: 250, dbz: 38, status: 'Western Disturbance Cloud Mass' },
        { name: 'Nagpur (Airport DWR)', lat: 21.0922, lng: 79.0472, rangeKm: 250, dbz: 30, status: 'Mild Echo Trace' },
        { name: 'Agartala (Airport DWR)', lat: 23.8864, lng: 91.2404, rangeKm: 250, dbz: 46, status: 'Monsoonal Heavy Showers' },
      ];

      imdDwrStations.forEach(st => {
        L.circle([st.lat, st.lng], {
          radius: st.rangeKm * 1000,
          color: st.dbz > 45 ? '#DC2626' : st.dbz > 35 ? '#F59E0B' : '#0E468A',
          weight: 1.5,
          dashArray: '4, 8',
          fillColor: st.dbz > 45 ? '#EF4444' : st.dbz > 35 ? '#FBBF24' : '#38BDF8',
          fillOpacity: 0.12,
        }).addTo(lg).bindPopup(`
          <div class="p-2 text-xs text-slate-900">
            <b class="text-sm font-black text-[#082046]">${st.name}</b><br/>
            <span class="text-slate-600">IMD Doppler Weather Radar (S-Band)</span><br/>
            <div class="mt-1 flex items-center gap-1.5">
              <span class="font-bold text-amber-700">Reflectivity: ${st.dbz} dBZ</span>
              <span>•</span>
              <span class="text-slate-700 font-semibold">${st.status}</span>
            </div>
            <span class="text-[10px] text-slate-500 mt-0.5 block">Coverage Radius: ${st.rangeKm} km</span>
          </div>
        `);
      });
    }

    // TRAFFIC
    else if (activeLayer === 'traffic') {
      if (tomtomApiKey.trim()) {
        const tomtomUrl = `https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${tomtomApiKey.trim()}`;
        const tomtomLayer = L.tileLayer(tomtomUrl, {
          opacity: 0.85,
          maxZoom: 19,
          attribution: 'Traffic Flow &copy; TomTom NV',
        }).addTo(map);
        tomtomTileLayerRef.current = tomtomLayer;
      }
    }

    // TEMPERATURE
    else if (activeLayer === 'temperature') {
      ALL_DESTINATIONS_TELEMETRY.forEach(c => {
        const isHot = c.temperature >= 35;
        const isCool = c.temperature < 20;
        const color = isHot ? '#DC2626' : isCool ? '#0284C7' : '#D97706';

        L.circle([c.latitude, c.longitude], {
          radius: 40000,
          color: color,
          fillColor: color,
          fillOpacity: 0.22,
          weight: 1.5,
        }).addTo(lg);

        const badgeIcon = L.divIcon({
          className: 'temp-station-pin',
          html: `
            <div class="px-2 py-0.5 rounded-full text-[11px] font-black text-white shadow-md flex items-center justify-center gap-0.5" style="background-color: ${color}; border: 2px solid white;">
              <span>${c.temperature}°</span>
            </div>
          `,
          iconSize: [40, 24],
          iconAnchor: [20, 12],
        });

        L.marker([c.latitude, c.longitude], { icon: badgeIcon })
          .addTo(lg)
          .bindPopup(`
            <div class="p-1">
              <b class="text-sm text-slate-900">${c.name} Met Station</b><br/>
              <span class="text-base font-extrabold" style="color: ${color}">${c.temperature}°C</span>
              <span class="text-xs text-slate-500">(${c.condition})</span><br/>
              <span class="text-xs text-slate-600">Min: ${c.minTemp}°C • Max: ${c.maxTemp}°C • Feels: ${c.feelsLike}°C</span>
            </div>
          `);
      });
    }

    // WIND
    else if (activeLayer === 'wind') {
      ALL_DESTINATIONS_TELEMETRY.forEach(w => {
        const isHigh = w.windSpeed >= 28;
        const color = isHigh ? '#C026D3' : '#0284C7';

        const windIcon = L.divIcon({
          className: 'wind-vector-pin',
          html: `
            <div class="flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-full border border-slate-300 shadow-md text-[10px] font-bold text-slate-800">
              <span style="transform: rotate(${w.windDirection}deg); display: inline-block;">➔</span>
              <span style="color: ${color}; font-weight: 800;">${w.windSpeed} km/h</span>
            </div>
          `,
          iconSize: [85, 24],
          iconAnchor: [42, 12],
        });

        L.marker([w.latitude, w.longitude], { icon: windIcon })
          .addTo(lg)
          .bindPopup(`
            <div class="p-1">
              <b class="text-xs text-slate-900">${w.name}</b><br/>
              <span class="text-xs text-slate-600">Velocity: <b>${w.windSpeed} km/h</b></span><br/>
              <span class="text-xs text-slate-500">Heading: ${w.windDirection}° Direction</span>
            </div>
          `);
      });
    }

    // AQI (CPCB Air Quality Index for All Locations)
    else if (activeLayer === 'aqi') {
      ALL_DESTINATIONS_TELEMETRY.forEach(s => {
        const aqiPin = L.divIcon({
          className: 'aqi-pin',
          html: `
            <div class="px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-md flex items-center justify-center gap-1" style="background-color: ${s.aqiColor}; border: 1.5px solid white;">
              <span>AQI ${s.aqi}</span>
            </div>
          `,
          iconSize: [60, 22],
          iconAnchor: [30, 11],
        });

        L.marker([s.latitude, s.longitude], { icon: aqiPin })
          .addTo(lg)
          .bindPopup(`
            <div class="p-1">
              <b class="text-sm text-slate-900">${s.name}, ${s.region}</b><br/>
              <span class="text-sm font-black" style="color: ${s.aqiColor}">AQI ${s.aqi} (${s.aqiCategory})</span><br/>
              <span class="text-xs text-slate-600">PM2.5: ${s.pm25} µg/m³ • PM10: ${s.pm10} µg/m³</span><br/>
              <p class="text-[11px] text-slate-500 mt-1 italic">${s.aqiAdvisory}</p>
            </div>
          `);
      });
    }

  }, [activeLayer, viewMode, satOpacity, tomtomApiKey, radarFrames, currentPrecipIndex, rainViewerHost]);

  // 4. Render All 26 Interactive Destination Markers (Pins) on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const destLg = destinationLayerGroupRef.current;
    if (!map || !destLg) return;

    destLg.clearLayers();

    // When in Destinations mode OR AQI layer, display rich interactive destination pins
    if (viewMode === 'destinations' || activeLayer === 'aqi') {
      filteredDestinations.forEach(dest => {
        const isSelected = selectedDestination?.id === dest.id;
        
        let pinHtml = '';
        if (mapPinDisplay === 'aqi') {
          pinHtml = `
            <div class="cursor-pointer transition-transform transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
              <div class="px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-md flex items-center gap-1 border-2 ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-white'}" style="background-color: ${dest.aqiColor};">
                <span>${dest.aqi}</span>
                <span class="text-[8px] opacity-90 uppercase">${dest.aqiCategory.slice(0, 3)}</span>
              </div>
            </div>
          `;
        } else {
          pinHtml = `
            <div class="cursor-pointer transition-transform transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
              <div class="px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow-md flex items-center gap-1 border-2 ${isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-white'} bg-[#0E468A]">
                <span>${dest.temperature}°</span>
                <span class="text-[8px] opacity-80 font-normal">${dest.name.slice(0, 4)}</span>
              </div>
            </div>
          `;
        }

        const markerIcon = L.divIcon({
          className: 'dest-interactive-pin',
          html: pinHtml,
          iconSize: [50, 24],
          iconAnchor: [25, 12],
        });

        const marker = L.marker([dest.latitude, dest.longitude], { icon: markerIcon }).addTo(destLg);
        
        marker.on('click', () => {
          handleSelectDestination(dest);
        });

        marker.bindPopup(`
          <div class="p-1 min-w-[180px]">
            <div class="flex items-center justify-between gap-2">
              <b class="text-sm text-[#082046]">${dest.name}</b>
              <span class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 uppercase">${dest.category.replace('_', ' ')}</span>
            </div>
            <div class="text-xs text-slate-500 font-medium">${dest.region}</div>
            <div class="mt-1.5 flex items-center justify-between border-t border-slate-100 pt-1">
              <div>
                <span class="text-base font-black text-slate-900">${dest.temperature}°C</span>
                <span class="text-[10px] text-slate-500 block">${dest.condition}</span>
              </div>
              <div class="text-right">
                <span class="text-xs font-black px-1.5 py-0.5 rounded text-white" style="background-color: ${dest.aqiColor}">
                  AQI ${dest.aqi}
                </span>
                <span class="text-[10px] text-slate-500 block mt-0.5">PM2.5: ${dest.pm25}</span>
              </div>
            </div>
            <button 
              id="popup-btn-${dest.id}"
              class="w-full mt-2 py-1 px-2 rounded-lg bg-[#0E468A] text-white text-[10px] font-bold tracking-wide hover:bg-[#0A3266] transition-colors"
            >
              Plan Trip & Route ➔
            </button>
          </div>
        `);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`popup-btn-${dest.id}`);
          if (btn) {
            btn.onclick = () => {
              handleSelectDestination(dest);
              setIsAdvisoryModalOpen(true);
            };
          }
        });
      });
    }
  }, [viewMode, activeLayer, filteredDestinations, selectedDestination, mapPinDisplay, handleSelectDestination]);

  // Center on User GPS
  const handleLocateMe = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([currentLocation.latitude, currentLocation.longitude], 9, {
        duration: 1.2,
      });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleFitIndia = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([22.5, 82.0], 5, { duration: 1.2 });
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Layer details configuration
  const getLayerMeta = () => {
    switch (activeLayer) {
      case 'traffic':
        return {
          title: 'Live Road Traffic & Arterial Corridors',
          sub: tomtomApiKey ? 'Live TomTom Commercial Traffic Tiles Active' : 'High-Fidelity Highway Vector Corridors Active',
          legendColors: [
            { label: 'Fast (75+ km/h)', color: '#16A34A' },
            { label: 'Moderate (30-50)', color: '#F59E0B' },
            { label: 'Heavy Jam (<15)', color: '#DC2626' },
          ],
        };
      case 'precipitation':
        const curFrame = radarFrames[currentPrecipIndex];
        const timeStr = curFrame?.time ? new Date(curFrame.time * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live';
        return {
          title: 'RainViewer Live Doppler Precipitation & IMD Radar',
          sub: `Frame: ${timeStr} • ${radarFrames.length > 0 ? radarFrames.length : 1} Live Radar Sweeps & 10 IMD DWR Stations Active`,
          legendColors: [
            { label: 'Light Drizzle (<1 mm/h)', color: '#60A5FA' },
            { label: 'Moderate Rain (5-15 mm/h)', color: '#10B981' },
            { label: 'Heavy Downpour (30+ mm/h)', color: '#EF4444' },
          ],
        };
      case 'satellite':
        return {
          title: 'INSAT-3DS Thermal Infrared (10.83 µm)',
          sub: 'ISRO & IMD Space Applications Centre (SAC)',
          legendColors: [
            { label: 'Warm Clear Ground', color: '#1E293B' },
            { label: 'Mid-Level Cloud', color: '#94A3B8' },
            { label: 'Severe Storm Top', color: '#FFFFFF' },
          ],
        };
      case 'temperature':
        return {
          title: 'Surface Temperature (°C) Heat Grid',
          sub: 'Open-Meteo & IMD Station Network',
          legendColors: [
            { label: 'Cool (<20°C)', color: '#0284C7' },
            { label: 'Comfortable (20-32°C)', color: '#D97706' },
            { label: 'Heat Alert (35°C+)', color: '#DC2626' },
          ],
        };
      case 'wind':
        return {
          title: 'Surface Wind Speed & Direction Streamlines',
          sub: 'Coastal & Oceanic Velocity Observations',
          legendColors: [
            { label: 'Calm (<15 km/h)', color: '#38BDF8' },
            { label: 'Moderate (15-30)', color: '#0284C7' },
            { label: 'Gale Warning (35+)', color: '#C026D3' },
          ],
        };
      case 'aqi':
        return {
          title: 'Air Quality Index (CPCB AQI Standard)',
          sub: 'Central Pollution Control Board Grid across All Locations',
          legendColors: [
            { label: 'Good (0-50)', color: '#16A34A' },
            { label: 'Moderate (101-200)', color: '#EAB308' },
            { label: 'Poor / Severe (200+)', color: '#EA580C' },
          ],
        };
    }
  };

  const meta = getLayerMeta();

  return (
    <MobileContainer hasBottomNav={false} className="h-screen overflow-hidden relative p-0 bg-slate-100">
      {/* Full-bleed Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Top Floating Control Deck */}
      <div className="absolute top-2 left-3 right-3 z-10 space-y-2 pointer-events-none pt-safe-top">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl shadow-md border border-slate-200/90">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/home')}
              className="p-1.5 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
              aria-label="Back to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-xs font-black uppercase tracking-wider text-[#082046]">
                  {t('map_title')}
                </h2>
              </div>
              <span className="text-[10px] text-slate-500 font-medium truncate max-w-[170px] inline-block">
                {currentLocation.name} Met Zone
              </span>
            </div>
          </div>

          {/* Mode Switcher Toggle Pill */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('destinations')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                viewMode === 'destinations'
                  ? 'bg-[#0E468A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Route className="w-3 h-3" />
              <span>{t('destination')}</span>
            </button>
            <button
              onClick={() => setViewMode('layers')}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all ${
                viewMode === 'layers'
                  ? 'bg-[#0E468A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>GIS</span>
            </button>
          </div>
        </div>

        {/* Floating Controls Row: Category Filter or GIS Layers */}
        {viewMode === 'destinations' ? (
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200/90 flex items-center justify-between gap-1">
            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1 py-0.5">
              {[
                { id: 'all' as const, label: t('all_destinations') },
                { id: 'hill_stations' as const, label: `🏔️ ${t('cat_hill_stations')}` },
                { id: 'coastal' as const, label: `🏖️ ${t('cat_coastal')}` },
                { id: 'pilgrimage' as const, label: `🛕 ${t('cat_pilgrimage')}` },
                { id: 'agriculture' as const, label: `🌾 ${t('cat_agriculture')}` },
                { id: 'cyclone_zones' as const, label: `⚠️ ${t('cat_cyclone')}` },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-[#0E468A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Pin display toggle: AQI vs Temp */}
            <button
              onClick={() => setMapPinDisplay(prev => prev === 'aqi' ? 'temp' : 'aqi')}
              className="flex-shrink-0 px-2 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-black"
              title="Toggle Map Pin Badge: AQI or Temperature"
            >
              {mapPinDisplay === 'aqi' ? 'AQI Mode' : 'Temp °C'}
            </button>
          </div>
        ) : (
          /* GIS Layer Selector Pills */
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'precipitation' as const, label: t('layer_precipitation'), icon: CloudRain },
              { id: 'aqi' as const, label: t('layer_aqi'), icon: Activity },
              { id: 'traffic' as const, label: t('layer_traffic'), icon: Car },
              { id: 'temperature' as const, label: t('layer_temp'), icon: Thermometer },
              { id: 'satellite' as const, label: t('layer_satellite'), icon: SatelliteIcon },
              { id: 'wind' as const, label: t('layer_wind'), icon: Wind },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = activeLayer === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveLayer(item.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#0E468A] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Floating Quick Tools */}
      <div className="absolute right-3 top-36 z-10 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleLocateMe}
          className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-[#0E468A] shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Locate Current Observation"
        >
          <Navigation className="w-4 h-4" />
        </button>

        <button
          onClick={handleFitIndia}
          className="px-2 py-2 rounded-xl bg-white/95 backdrop-blur-md text-[10px] font-black text-[#082046] shadow-md border border-slate-200 hover:bg-slate-50 transition-colors text-center"
          title="Fit Indian Subcontinent"
        >
          IND
        </button>

        {selectedDestination && (
          <button
            onClick={handleClearRoute}
            className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md hover:bg-rose-600 transition-colors"
            title="Clear Route"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <div className="flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors border-b border-slate-200"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: Destination Slides Carousel OR GIS Layer Telemetry Drawer */}
      {viewMode === 'destinations' ? (
        <div 
          className="absolute left-0 right-0 z-10 pointer-events-auto"
          style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="px-3">
            {/* Header with scroll buttons */}
            <div className="flex items-center justify-between mb-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-[#082046] tracking-wide">
                  {t('destinations_title')}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#0E468A]/10 text-[#0E468A]">
                  {filteredDestinations.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-1 rounded-lg bg-white/90 shadow border border-slate-200 text-slate-600 hover:text-slate-900"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-1 rounded-lg bg-white/90 shadow border border-slate-200 text-slate-600 hover:text-slate-900"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Horizontal Snap Slides Carousel */}
            <div 
              ref={carouselScrollRef}
              className="flex items-stretch gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory"
            >
              {filteredDestinations.map((dest) => {
                const isSelected = selectedDestination?.id === dest.id;
                return (
                  <div
                    key={dest.id}
                    onClick={() => handleSelectDestination(dest)}
                    className={`snap-start flex-shrink-0 w-[290px] rounded-2xl p-3.5 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'bg-white shadow-xl ring-2 ring-[#0E468A] border-transparent'
                        : 'bg-white/95 backdrop-blur-xl shadow-lg border border-slate-200/90 hover:border-[#0E468A]/50'
                    }`}
                  >
                    {/* Slide Header: Name, Region, Elevation */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-black text-[#082046] tracking-tight">
                            {dest.name}
                          </h3>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                            {dest.category.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {dest.region} • {dest.elevationMeters ? `${dest.elevationMeters}m MSL` : 'Sea Level'}
                        </p>
                      </div>

                      {/* Warning Chip if applicable */}
                      {dest.warningLevel !== 'green' && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                          dest.warningLevel === 'red' ? 'bg-rose-100 text-rose-700' :
                          dest.warningLevel === 'orange' ? 'bg-amber-100 text-amber-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>Alert</span>
                        </span>
                      )}
                    </div>

                    {/* Temperature & Weather Condition Row */}
                    <div className="mt-2 flex items-center justify-between bg-slate-50/80 rounded-xl p-2 border border-slate-100">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900 tracking-tight">
                            {dest.temperature}°C
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            Feels {dest.feelsLike}°
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-[#0E468A] block truncate max-w-[130px]">
                          {dest.condition}
                        </span>
                      </div>

                      {/* AQI Pill for this Location */}
                      <div className="text-right">
                        <div 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[10px] font-black shadow-xs"
                          style={{ backgroundColor: dest.aqiColor }}
                        >
                          <Activity className="w-3 h-3" />
                          <span>AQI {dest.aqi}</span>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
                          {dest.aqiCategory} (PM2.5: {dest.pm25})
                        </span>
                      </div>
                    </div>

                    {/* Meteorological Detail Metrics (Grid of 4) */}
                    <div className="grid grid-cols-4 gap-1 mt-2 text-center">
                      <div className="bg-slate-50 rounded-lg p-1">
                        <div className="flex items-center justify-center text-sky-600 mb-0.5">
                          <Droplets className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{dest.humidity}%</span>
                        <span className="text-[8px] text-slate-500 block">Humidity</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-1">
                        <div className="flex items-center justify-center text-teal-600 mb-0.5">
                          <Wind className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{dest.windSpeed} km/h</span>
                        <span className="text-[8px] text-slate-500 block">Wind</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-1">
                        <div className="flex items-center justify-center text-blue-600 mb-0.5">
                          <CloudRain className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{dest.precipitationProb}%</span>
                        <span className="text-[8px] text-slate-500 block">Rain</span>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-1">
                        <div className="flex items-center justify-center text-amber-600 mb-0.5">
                          <Sun className="w-3 h-3" />
                        </div>
                        <span className="text-[10px] font-black text-slate-800">{dest.uvIndex}</span>
                        <span className="text-[8px] text-slate-500 block">UV Index</span>
                      </div>
                    </div>

                    {/* Action Button: Select and View Route Telemetry */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500">
                        {dest.minTemp}° / {dest.maxTemp}°C
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectDestination(dest);
                          setIsAdvisoryModalOpen(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#0E468A] text-white text-[10px] font-black hover:bg-[#0A3266] transition-colors shadow-xs"
                      >
                        <Route className="w-3 h-3" />
                        <span>{t('route_preview')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* GIS Layer Telemetry Drawer */
        <div 
          className="absolute left-3 right-3 z-10 pointer-events-auto"
          style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
        >
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3.5 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#082046] flex items-center gap-1.5">
                  <span>{meta.title}</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  {meta.sub}
                </span>
              </div>

              {/* Precipitation timeline playback toggle */}
              {activeLayer === 'precipitation' && (
                <button
                  onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs transition-all ${
                    isTimelinePlaying ? 'bg-amber-500 text-slate-950' : 'bg-[#0E468A] text-white'
                  }`}
                >
                  {isTimelinePlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isTimelinePlaying ? 'Pause' : 'Loop'}</span>
                </button>
              )}

              {/* Satellite / Precipitation Opacity Slider */}
              {(activeLayer === 'satellite' || activeLayer === 'precipitation') && (
                <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-xl">
                  <Sliders className="w-3 h-3 text-slate-500" />
                  <input
                    type="range"
                    min="0.2"
                    max="1"
                    step="0.05"
                    value={satOpacity}
                    onChange={(e) => setSatOpacity(parseFloat(e.target.value))}
                    className="w-16 h-1 accent-[#0E468A] cursor-pointer"
                    title="Layer Transparency"
                  />
                </div>
              )}
            </div>

            {/* Color Legend Bar */}
            <div className="grid grid-cols-3 gap-1.5 pt-1.5 border-t border-slate-100">
              {meta.legendColors.map((leg, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-700 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-xs" style={{ backgroundColor: leg.color }} />
                  <span className="truncate">{leg.label}</span>
                </div>
              ))}
            </div>

            {/* Official Meteorological Data Attribution */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100">
              <span>India Meteorological Department • MoES</span>
              <span className="font-semibold text-[#0E468A]">Live GIS Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* TRANSIT JOURNEY ADVISORY MODAL / SLIDE-UP SHEET */}
      {isAdvisoryModalOpen && transitAdvisory && selectedDestination && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto flex flex-col">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0E468A]/10 text-[#0E468A] flex items-center justify-center">
                  <Route className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#082046]">
                    {t('transit_advisory')}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {currentLocation.name} ➔ {selectedDestination.name}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsAdvisoryModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4 text-slate-800">
              
              {/* Origin vs Destination Comparison Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Source Station */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase mb-1">
                    <MapPin className="w-3 h-3 text-[#0E468A]" />
                    <span>{t('source')}</span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 truncate">
                    {currentLocation.name}
                  </h4>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-800">
                      {weather ? `${weather.temperature}°C` : '34°C'}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                      AQI {airQuality?.aqi || 145}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {weather?.conditionText || 'Baseline Station'}
                  </span>
                </div>

                {/* Destination Station */}
                <div className="bg-blue-50/60 rounded-2xl p-3 border border-blue-200">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase mb-1">
                    <Navigation className="w-3 h-3 text-blue-600" />
                    <span>{t('destination')}</span>
                  </div>
                  <h4 className="text-xs font-black text-[#082046] truncate">
                    {selectedDestination.name}
                  </h4>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black text-[#082046]">
                      {selectedDestination.temperature}°C
                    </span>
                    <span 
                      className="text-[10px] font-bold text-white px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: selectedDestination.aqiColor }}
                    >
                      AQI {selectedDestination.aqi}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 block mt-1 truncate">
                    {selectedDestination.condition}
                  </span>
                </div>
              </div>

              {/* Transit Distance & Telemetry Highlights */}
              <div className="grid grid-cols-4 gap-2 bg-gradient-to-br from-[#082046] to-[#0E468A] text-white rounded-2xl p-3 shadow-md">
                <div className="text-center">
                  <span className="text-[10px] text-slate-300 font-semibold block">{t('distance')}</span>
                  <span className="text-sm font-black mt-0.5 block">{transitAdvisory.distanceKm} km</span>
                </div>
                <div className="text-center border-l border-white/20">
                  <span className="text-[10px] text-slate-300 font-semibold block">{t('travel_time')}</span>
                  <span className="text-sm font-black mt-0.5 block">~{transitAdvisory.estimatedHours}h</span>
                </div>
                <div className="text-center border-l border-white/20">
                  <span className="text-[10px] text-slate-300 font-semibold block">{t('temp_delta')}</span>
                  <span className={`text-sm font-black mt-0.5 block ${transitAdvisory.tempDelta < 0 ? 'text-sky-300' : 'text-amber-300'}`}>
                    {transitAdvisory.tempDelta > 0 ? `+${transitAdvisory.tempDelta}` : transitAdvisory.tempDelta}°C
                  </span>
                </div>
                <div className="text-center border-l border-white/20">
                  <span className="text-[10px] text-slate-300 font-semibold block">{t('aqi_shift')}</span>
                  <span className={`text-sm font-black mt-0.5 block ${transitAdvisory.aqiDelta < 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {transitAdvisory.aqiDelta < 0 ? `${transitAdvisory.aqiDelta}` : `+${transitAdvisory.aqiDelta}`}
                  </span>
                </div>
              </div>

              {/* Actionable Packing & Clothing Recommendation */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/90 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#082046]">
                  <Shirt className="w-4 h-4 text-[#0E468A]" />
                  <span>{t('travel_recommendation')}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {transitAdvisory.clothingAdvice}
                </p>
                <p className="text-[11px] text-slate-500 font-medium italic pt-1 border-t border-slate-200">
                  {transitAdvisory.climateShift}
                </p>
              </div>

              {/* Road & Transit Conditions */}
              <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <Car className="w-4 h-4 text-amber-700" />
                  <span>{t('road_conditions')}</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {transitAdvisory.roadAdvisory}
                </p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 pt-1">
                  <Clock className="w-3 h-3 text-amber-700" />
                  <span>Best departure window: {transitAdvisory.bestTravelWindow}</span>
                </div>
              </div>

              {/* Destination Air Quality & Health Advisory */}
              <div className="bg-emerald-50/70 rounded-2xl p-3.5 border border-emerald-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                    <HeartPulse className="w-4 h-4 text-emerald-700" />
                    <span>Air Quality Health Impact</span>
                  </div>
                  <span 
                    className="text-[10px] font-black text-white px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: selectedDestination.aqiColor }}
                  >
                    AQI {selectedDestination.aqi} • {selectedDestination.aqiCategory}
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  {transitAdvisory.healthAdvisory}
                </p>
                <div className="text-[10px] text-emerald-800 flex items-center justify-between pt-1 border-t border-emerald-200/60 font-semibold">
                  <span>PM2.5: {selectedDestination.pm25} µg/m³</span>
                  <span>PM10: {selectedDestination.pm10} µg/m³</span>
                  <span>CPCB Air Standard</span>
                </div>
              </div>

            </div>

            {/* Modal Footer CTA */}
            <div className="sticky bottom-0 bg-white px-4 py-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => setIsAdvisoryModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0E468A] text-white text-xs font-black shadow-md hover:bg-[#0A3266] transition-colors text-center"
              >
                {t('view_on_map')}
              </button>
              <button
                onClick={handleClearRoute}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Clear
              </button>
            </div>

          </div>
        </div>
      )}

    </MobileContainer>
  );
};
