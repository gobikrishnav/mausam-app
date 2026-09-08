import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AirQualityData, 
  CurrentWeather, 
  CustomAlertRule, 
  DailyForecast, 
  HourlyForecast, 
  MarineData, 
  NotificationLog, 
  PersonaPreferences, 
  PersonaType, 
  SavedLocation, 
  SevereAlert, 
  UserProfile 
} from '../types';
import { 
  DEFAULT_INDIAN_LOCATIONS, 
  fetchAirQualityData, 
  fetchMarineData, 
  fetchWeatherData 
} from '../services/weatherApi';

interface AppState {
  // Auth & Profile
  user: UserProfile | null;
  isAuthenticated: boolean;
  hasCompletedTutorial: boolean;
  
  // Personas & Preferences
  selectedPersonas: PersonaType[];
  preferences: PersonaPreferences;
  
  // Location
  currentLocation: SavedLocation;
  savedLocations: SavedLocation[];
  liveGpsEnabled: boolean;
  
  // Weather & Environmental Cache
  weather: CurrentWeather | null;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  airQuality: AirQualityData | null;
  marine: MarineData | null;
  isLoadingWeather: boolean;
  weatherError: string | null;
  lastUpdated: string | null;
  
  // Alerts & Notifications
  activeAlerts: SevereAlert[];
  customAlerts: CustomAlertRule[];
  notifications: NotificationLog[];
  unreadAlertsCount: number;
  
  // Settings
  themeMode: 'light' | 'dark' | 'system';
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'kmh' | 'mph';
  precipitationUnit: 'mm' | 'inches';
  language: string;
  animationsEnabled: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  logout: () => void;
  setSelectedPersonas: (personas: PersonaType[]) => void;
  togglePersona: (persona: PersonaType) => void;
  updatePreferences: (prefs: Partial<PersonaPreferences>) => void;
  setCurrentLocation: (loc: SavedLocation) => void;
  addSavedLocation: (loc: SavedLocation) => void;
  removeSavedLocation: (id: string) => void;
  setLiveGpsEnabled: (enabled: boolean) => void;
  setTutorialCompleted: (val: boolean) => void;
  refreshWeather: () => Promise<void>;
  addCustomAlert: (rule: Omit<CustomAlertRule, 'id'>) => void;
  toggleCustomAlert: (id: string) => void;
  deleteCustomAlert: (id: string) => void;
  markNotificationRead: (id: string) => void;
  dismissSevereAlert: (id: string) => void;
  triggerSimulatedAlert: (category?: SevereAlert['category']) => void;
  updateSettings: (settings: Partial<{
    themeMode: 'light' | 'dark' | 'system';
    temperatureUnit: 'celsius' | 'fahrenheit';
    windSpeedUnit: 'kmh' | 'mph';
    precipitationUnit: 'mm' | 'inches';
    language: string;
    animationsEnabled: boolean;
  }>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Defaults
      user: {
        id: 'user_default',
        email: 'user@mausam.in',
        fullName: 'Rohit Sharma',
        bio: 'Outdoor runner & agriculture enthusiast',
        selectedPersonas: ['fitness', 'commuter', 'farmer'],
        preferences: {
          workoutTime: 'morning',
          activityType: 'running',
          commuteMode: 'car',
          commuteTime: 'morning',
          cropTypes: ['Wheat', 'Rice'],
          aqiSensitivity: 'normal',
        },
        hasCompletedTutorial: false,
      },
      isAuthenticated: true,
      hasCompletedTutorial: false,
      
      selectedPersonas: ['fitness', 'commuter', 'farmer'],
      preferences: {
        workoutTime: 'morning',
        activityType: 'running',
        commuteMode: 'car',
        commuteTime: 'morning',
        cropTypes: ['Wheat', 'Mustard'],
        aqiSensitivity: 'normal',
      },

      currentLocation: DEFAULT_INDIAN_LOCATIONS[0], // New Delhi
      savedLocations: DEFAULT_INDIAN_LOCATIONS.slice(0, 4),
      liveGpsEnabled: false,

      weather: null,
      hourly: [],
      daily: [],
      airQuality: null,
      marine: null,
      isLoadingWeather: false,
      weatherError: null,
      lastUpdated: null,

      activeAlerts: [
        {
          id: 'alert_heatwave_01',
          title: 'HEATWAVE ADVISORY',
          severity: 'Advisory',
          category: 'heatwave',
          affectedArea: 'North & Central Plain Regions',
          headline: 'Daytime temperatures peaking 4–6°C above normal',
          description: 'High heat index anticipated during peak solar hours (12:00 PM to 4:00 PM). Vulnerable demographics are advised to stay hydrated.',
          safetyInstructions: [
            'Avoid direct sunlight exposure between 12:00 PM and 3:30 PM.',
            'Maintain continuous hydration with electrolyte fluids.',
            'Schedule outdoor exercise strictly before 8:30 AM or after 6:30 PM.'
          ],
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
          source: 'Open-Meteo & IMD Threshold Alert Engine',
          isActive: true,
        }
      ],
      customAlerts: [
        {
          id: 'rule_1',
          parameter: 'aqi',
          operator: 'greater_than',
          threshold: 150,
          locationId: 'delhi',
          locationName: 'New Delhi',
          pushEnabled: true,
          isActive: true,
        },
        {
          id: 'rule_2',
          parameter: 'rain_prob',
          operator: 'greater_than',
          threshold: 60,
          locationId: 'delhi',
          locationName: 'New Delhi',
          pushEnabled: true,
          activeFromTime: '17:00',
          activeToTime: '21:00',
          isActive: true,
        }
      ],
      notifications: [
        {
          id: 'notif_1',
          title: 'Morning Weather Brief',
          message: 'Clear sky today, highs around 32°C. Excellent morning run window before 9 AM.',
          severity: 'Advisory',
          timestamp: 'Just now',
          isRead: false,
          linkRoute: '/home',
        },
        {
          id: 'notif_2',
          title: 'Heatwave Advisory Active',
          message: 'Heatwave alert in effect for your region. Hydration reminders enabled.',
          severity: 'Watch',
          timestamp: '2 hours ago',
          isRead: true,
          linkRoute: '/alerts',
        }
      ],
      unreadAlertsCount: 1,

      themeMode: 'dark',
      temperatureUnit: 'celsius',
      windSpeedUnit: 'kmh',
      precipitationUnit: 'mm',
      language: 'English',
      animationsEnabled: true,

      // Action implementations
      setUser: (user) => set({ user, isAuthenticated: Boolean(user) }),
      updateProfile: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null,
      })),
      logout: () => set({ user: null, isAuthenticated: false }),
      setSelectedPersonas: (personas) => set({ selectedPersonas: personas }),
      togglePersona: (persona) => set((state) => {
        const exists = state.selectedPersonas.includes(persona);
        const next = exists 
          ? state.selectedPersonas.filter(p => p !== persona)
          : [...state.selectedPersonas, persona];
        return { selectedPersonas: next.length > 0 ? next : [persona] };
      }),
      updatePreferences: (prefs) => set((state) => ({
        preferences: { ...state.preferences, ...prefs }
      })),
      setCurrentLocation: (loc) => {
        set({ currentLocation: loc });
        get().refreshWeather();
      },
      addSavedLocation: (loc) => set((state) => ({
        savedLocations: state.savedLocations.some(l => l.id === loc.id)
          ? state.savedLocations
          : [...state.savedLocations, loc]
      })),
      removeSavedLocation: (id) => set((state) => ({
        savedLocations: state.savedLocations.filter(l => l.id !== id)
      })),
      setLiveGpsEnabled: (enabled) => set({ liveGpsEnabled: enabled }),
      setTutorialCompleted: (val) => set({ hasCompletedTutorial: val }),

      refreshWeather: async () => {
        const { currentLocation } = get();
        set({ isLoadingWeather: true, weatherError: null });

        try {
          const [weatherRes, aqiRes, marineRes] = await Promise.all([
            fetchWeatherData(currentLocation.latitude, currentLocation.longitude),
            fetchAirQualityData(currentLocation.latitude, currentLocation.longitude),
            fetchMarineData(currentLocation.latitude, currentLocation.longitude),
          ]);

          set({
            weather: weatherRes.current,
            hourly: weatherRes.hourly,
            daily: weatherRes.daily,
            airQuality: aqiRes,
            marine: marineRes,
            isLoadingWeather: false,
            lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to fetch weather data';
          set({
            isLoadingWeather: false,
            weatherError: message,
          });
        }
      },

      addCustomAlert: (rule) => set((state) => ({
        customAlerts: [
          ...state.customAlerts,
          { ...rule, id: `rule_${Date.now()}` }
        ]
      })),
      toggleCustomAlert: (id) => set((state) => ({
        customAlerts: state.customAlerts.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
      })),
      deleteCustomAlert: (id) => set((state) => ({
        customAlerts: state.customAlerts.filter(r => r.id !== id)
      })),
      markNotificationRead: (id) => set((state) => {
        const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        return {
          notifications: updated,
          unreadAlertsCount: updated.filter(n => !n.isRead).length
        };
      }),
      dismissSevereAlert: (id) => set((state) => ({
        activeAlerts: state.activeAlerts.filter(a => a.id !== id)
      })),
      triggerSimulatedAlert: (category = 'storm') => set((state) => {
        const newAlert: SevereAlert = {
          id: `alert_sim_${Date.now()}`,
          title: category === 'cyclone' ? '⚠️ CYCLONE EMERGENCY' : category === 'storm' ? '⛈️ SEVERE THUNDERSTORM WARNING' : '⚠️ SEVERE WEATHER ALERT',
          severity: category === 'cyclone' ? 'Emergency' : 'Warning',
          category,
          affectedArea: state.currentLocation.name + ' & Surrounding Metro Region',
          headline: 'Immediate precautionary measures advised by meteorological safety desk',
          description: 'High velocity winds, heavy rainfall, and potential flash waterlogging expected within the next 2 to 4 hours.',
          safetyInstructions: [
            'Stay indoors and keep away from glass windows and loose structures.',
            'Charge emergency battery packs and disconnect sensitive electronic appliances.',
            'Do not drive through waterlogged subways or low-lying roads.'
          ],
          issuedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 18000000).toISOString(),
          source: 'MAUSAM Rapid Emergency Dispatch System',
          isActive: true,
        };

        const newNotif: NotificationLog = {
          id: `notif_${Date.now()}`,
          title: newAlert.title,
          message: newAlert.headline,
          severity: newAlert.severity,
          timestamp: 'Just now',
          isRead: false,
          linkRoute: `/alerts`,
        };

        return {
          activeAlerts: [newAlert, ...state.activeAlerts],
          notifications: [newNotif, ...state.notifications],
          unreadAlertsCount: state.unreadAlertsCount + 1,
        };
      }),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'mausam_app_storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedPersonas: state.selectedPersonas,
        preferences: state.preferences,
        currentLocation: state.currentLocation,
        savedLocations: state.savedLocations,
        customAlerts: state.customAlerts,
        themeMode: state.themeMode,
        temperatureUnit: state.temperatureUnit,
        windSpeedUnit: state.windSpeedUnit,
        precipitationUnit: state.precipitationUnit,
        language: state.language,
        hasCompletedTutorial: state.hasCompletedTutorial,
      }),
    }
  )
);
