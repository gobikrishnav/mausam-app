export type PersonaType = 
  | 'fitness' 
  | 'commuter' 
  | 'farmer' 
  | 'traveler' 
  | 'parent' 
  | 'beachgoer' 
  | 'event_planner' 
  | 'health';

export interface PersonaPreferences {
  // Fitness
  workoutTime?: 'morning' | 'afternoon' | 'evening';
  activityType?: 'running' | 'cycling' | 'yoga' | 'walking';
  
  // Commuter
  commuteMode?: 'car' | 'bike' | 'public_transport' | 'walk';
  commuteTime?: 'morning' | 'evening' | 'both';
  
  // Farmer
  cropTypes?: string[];
  farmLocationName?: string;
  
  // Traveler
  travelRegions?: string[];
  unitPreference?: 'metric' | 'imperial';
  
  // Parent
  childrenCount?: number;
  schoolSchedule?: 'weekday' | 'weekend';
  
  // Beachgoer
  beachActivity?: 'swimming' | 'surfing' | 'sunbathing' | 'walking';
  
  // Event Planner
  eventType?: 'outdoor' | 'indoor_outdoor';
  typicalDurationHours?: number;
  
  // Health
  conditions?: Array<'allergies' | 'respiratory' | 'migraines' | 'joint_pain'>;
  aqiSensitivity?: 'normal' | 'sensitive' | 'very_sensitive';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  bio?: string;
  dob?: string;
  avatarUrl?: string;
  selectedPersonas: PersonaType[];
  preferences: PersonaPreferences;
  hasCompletedTutorial: boolean;
}

export interface SavedLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  type: 'home' | 'office' | 'farm' | 'travel' | 'custom';
  isCurrent?: boolean;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts?: number;
  uvIndex: number;
  weatherCode: number;
  conditionText: string;
  isDay: boolean;
  pressure: number;
  dewPoint: number;
  precipitation: number;
  timestamp: string;
}

export interface HourlyForecast {
  time: string;
  formattedTime: string;
  temperature: number;
  precipitationProbability: number;
  precipitationMm: number;
  weatherCode: number;
  conditionText: string;
  uvIndex: number;
  windSpeed: number;
}

export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  precipitationProbability: number;
  precipitationMm: number;
  weatherCode: number;
  conditionText: string;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
  aiInsight?: string;
}

export interface AirQualityData {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  color: string;
  pm2_5: number;
  pm10: number;
  o3: number;
  no2: number;
  so2?: number;
  co: number;
  pollenTree: number; // 0-5
  pollenGrass: number;
  pollenWeed: number;
}

export interface MarineData {
  waveHeight: number; // meters
  waveDirection: number;
  waterTemperature: number;
  tideStatus: 'Rising' | 'High' | 'Falling' | 'Low';
  swimSafety: 'Safe' | 'Caution' | 'Dangerous';
}

export type AlertSeverity = 'Advisory' | 'Watch' | 'Warning' | 'Emergency';

export interface SevereAlert {
  id: string;
  title: string;
  severity: AlertSeverity;
  category: 'storm' | 'cyclone' | 'heatwave' | 'flood' | 'snow' | 'air_quality';
  affectedArea: string;
  headline: string;
  description: string;
  safetyInstructions: string[];
  issuedAt: string;
  expiresAt: string;
  source: string;
  isActive: boolean;
}

export interface CustomAlertRule {
  id: string;
  parameter: 'aqi' | 'uv' | 'temperature' | 'rain_prob' | 'wind_speed' | 'frost';
  operator: 'greater_than' | 'less_than';
  threshold: number;
  locationId: string;
  locationName: string;
  pushEnabled: boolean;
  activeFromTime?: string;
  activeToTime?: string;
  isActive: boolean;
}

export interface NotificationLog {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  isRead: boolean;
  linkRoute?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  weatherContext?: {
    temp: number;
    condition: string;
    rainChance: number;
  };
}

export interface ExploreArticle {
  id: string;
  title: string;
  category: 'Farming' | 'Fitness' | 'Travel' | 'Health' | 'Safety' | 'Seasonal';
  thumbnailUrl: string;
  readTime: string;
  publishedDate: string;
  author: string;
  summary: string;
  content: string[];
  tags: string[];
}
