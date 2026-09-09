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
import { deriveNameFromEmail } from '../utils/userUtils';
import { generateDisasterAlerts } from '../services/disasterAlertEngine';

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
  dismissedAlertIds: string[];
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
  loginAsGuest: () => void;
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
      // Defaults - Starts unauthenticated so Login / Welcome screen is shown
      user: null,
      isAuthenticated: false,
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

      activeAlerts: [],
      dismissedAlertIds: [],
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
        const { currentLocation, dismissedAlertIds } = get();
        set({ isLoadingWeather: true, weatherError: null });

        try {
          const [weatherRes, aqiRes, marineRes] = await Promise.all([
            fetchWeatherData(currentLocation.latitude, currentLocation.longitude),
            fetchAirQualityData(currentLocation.latitude, currentLocation.longitude),
            fetchMarineData(currentLocation.latitude, currentLocation.longitude),
          ]);

          // Run disaster alert engine against fresh data
          let generatedAlerts: SevereAlert[] = [];
          try {
            generatedAlerts = generateDisasterAlerts(
              weatherRes.current,
              weatherRes.hourly,
              weatherRes.daily,
              aqiRes,
              marineRes,
              currentLocation,
              dismissedAlertIds || [],
            );
          } catch (_engineErr) {
            // Non-fatal: continue without auto-alerts if engine throws
            generatedAlerts = [];
          }

          set({
            weather: weatherRes.current,
            hourly: weatherRes.hourly,
            daily: weatherRes.daily,
            airQuality: aqiRes,
            marine: marineRes,
            activeAlerts: generatedAlerts,
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
      dismissSevereAlert: (id) => set((state) => {
        const nextActive = state.activeAlerts.filter(a => a.id !== id);
        const nextDismissed = Array.from(new Set([...(state.dismissedAlertIds || []), id]));
        return {
          activeAlerts: nextActive,
          dismissedAlertIds: nextDismissed,
        };
      }),
      triggerSimulatedAlert: () => {},
      loginAsGuest: () => set({
        user: {
          id: 'citizen_guest',
          email: 'citizen@mausam.in',
          fullName: 'Citizen',
          bio: 'Weather & outdoor lifestyle observer',
          selectedPersonas: ['fitness', 'commuter', 'farmer'],
          preferences: {
            workoutTime: 'morning',
            activityType: 'running',
            commuteMode: 'car',
            commuteTime: 'morning',
            cropTypes: ['Wheat', 'Mustard'],
            aqiSensitivity: 'normal',
          },
          hasCompletedTutorial: true,
        },
        isAuthenticated: true,
        hasCompletedTutorial: true,
      }),
      updateSettings: (settings) => set((state) => ({ ...state, ...settings })),
    }),
    {
      name: 'mausam_app_storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Auto-purge any legacy simulated test alerts or dismissed alerts from storage
          // Auto-purge legacy simulated test alerts only; keep real auto-alerts
          if (Array.isArray(state.activeAlerts)) {
            state.activeAlerts = state.activeAlerts.filter(
              a => !a.id.startsWith('alert_sim_') &&
                   !(state.dismissedAlertIds || []).includes(a.id)
            );
          } else {
            state.activeAlerts = [];
          }
          if (!Array.isArray(state.dismissedAlertIds)) {
            state.dismissedAlertIds = [];
          }
          if (state.user) {
            if (!state.user.fullName || state.user.fullName.toLowerCase().includes('rohit')) {
              state.user.fullName = state.user.email && !state.user.email.toLowerCase().includes('rohit')
                ? deriveNameFromEmail(state.user.email)
                : 'Citizen';
            }
          }
        }
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        selectedPersonas: state.selectedPersonas,
        preferences: state.preferences,
        currentLocation: state.currentLocation,
        savedLocations: state.savedLocations,
        customAlerts: state.customAlerts,
        dismissedAlertIds: state.dismissedAlertIds,
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
