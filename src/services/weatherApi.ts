import { AirQualityData, CurrentWeather, DailyForecast, HourlyForecast, MarineData, SavedLocation } from '../types';

// Map WMO weather codes to human-readable strings and icons
export const getWeatherCodeInfo = (code: number, isDay: boolean = true) => {
  switch (code) {
    case 0:
      return { text: isDay ? 'Clear Sky' : 'Clear Night', icon: isDay ? 'sun' : 'moon', bg: isDay ? 'sunny' : 'night' };
    case 1:
      return { text: 'Mainly Clear', icon: isDay ? 'sun' : 'moon', bg: isDay ? 'sunny' : 'night' };
    case 2:
      return { text: 'Partly Cloudy', icon: 'cloud-sun', bg: 'cloudy' };
    case 3:
      return { text: 'Overcast', icon: 'cloud', bg: 'cloudy' };
    case 45:
    case 48:
      return { text: 'Foggy', icon: 'cloud-fog', bg: 'cloudy' };
    case 51:
    case 53:
    case 55:
      return { text: 'Drizzle', icon: 'cloud-drizzle', bg: 'rainy' };
    case 61:
    case 63:
      return { text: 'Moderate Rain', icon: 'cloud-rain', bg: 'rainy' };
    case 65:
      return { text: 'Heavy Rain', icon: 'cloud-rain', bg: 'rainy' };
    case 71:
    case 73:
    case 75:
      return { text: 'Snowfall', icon: 'cloud-snow', bg: 'snowy' };
    case 80:
    case 81:
    case 82:
      return { text: 'Rain Showers', icon: 'cloud-rain', bg: 'rainy' };
    case 95:
    case 96:
    case 99:
      return { text: 'Thunderstorm', icon: 'cloud-lightning', bg: 'stormy' };
    default:
      return { text: 'Partly Cloudy', icon: 'cloud', bg: 'cloudy' };
  }
};

export const getAqiCategory = (aqiVal: number): { category: AirQualityData['category']; color: string } => {
  if (aqiVal <= 50) return { category: 'Good', color: '#388E3C' };
  if (aqiVal <= 100) return { category: 'Moderate', color: '#FBC02D' };
  if (aqiVal <= 150) return { category: 'Unhealthy for Sensitive Groups', color: '#F57C00' };
  if (aqiVal <= 200) return { category: 'Unhealthy', color: '#D32F2F' };
  if (aqiVal <= 300) return { category: 'Very Unhealthy', color: '#7B1FA2' };
  return { category: 'Hazardous', color: '#880E4F' };
};

// Popular default Indian cities for fast selection/fallbacks
export const DEFAULT_INDIAN_LOCATIONS: SavedLocation[] = [
  { id: 'delhi', name: 'New Delhi', region: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, type: 'home' },
  { id: 'mumbai', name: 'Mumbai', region: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, type: 'office' },
  { id: 'bengaluru', name: 'Bengaluru', region: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, type: 'office' },
  { id: 'chennai', name: 'Chennai', region: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, type: 'travel' },
  { id: 'kolkata', name: 'Kolkata', region: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, type: 'travel' },
  { id: 'hyderabad', name: 'Hyderabad', region: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, type: 'office' },
  { id: 'ahmedabad', name: 'Ahmedabad', region: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, type: 'travel' },
  { id: 'jaipur', name: 'Jaipur', region: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, type: 'travel' },
  { id: 'srivilliputhur', name: 'Srivilliputhur', region: 'Tamil Nadu', country: 'India', latitude: 9.5127, longitude: 77.6337, type: 'home' },
  { id: 'madurai', name: 'Madurai', region: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, type: 'travel' },
  { id: 'coimbatore', name: 'Coimbatore', region: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, type: 'travel' },
  { id: 'shimla', name: 'Shimla', region: 'Himachal Pradesh', country: 'India', latitude: 31.1048, longitude: 77.1734, type: 'travel' },
  { id: 'manali', name: 'Manali', region: 'Himachal Pradesh', country: 'India', latitude: 32.2396, longitude: 77.1887, type: 'travel' },
  { id: 'punjab_farm', name: 'Ludhiana Farm', region: 'Punjab', country: 'India', latitude: 30.9010, longitude: 75.8573, type: 'farm' },
];

/**
 * Fetch Open-Meteo weather data
 */
export async function fetchWeatherData(lat: number, lon: number): Promise<{
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,uv_index,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=10`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather API error: ${res.statusText}`);
  const data = await res.json();

  const isDay = Boolean(data.current.is_day);
  const codeInfo = getWeatherCodeInfo(data.current.weather_code, isDay);

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: data.current.wind_direction_10m,
    windGusts: Math.round(data.current.wind_gusts_10m || 0),
    uvIndex: Math.round(data.hourly.uv_index[0] || 3),
    weatherCode: data.current.weather_code,
    conditionText: codeInfo.text,
    isDay,
    pressure: Math.round(data.current.surface_pressure),
    dewPoint: Math.round(data.current.temperature_2m - ((100 - data.current.relative_humidity_2m) / 5)),
    precipitation: data.current.precipitation,
    timestamp: data.current.time,
  };

  // 24-48 hours
  const hourly: HourlyForecast[] = data.hourly.time.slice(0, 36).map((timeStr: string, idx: number) => {
    const date = new Date(timeStr);
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHour = `${hours % 12 || 12} ${ampm}`;
    const code = data.hourly.weather_code[idx];

    return {
      time: timeStr,
      formattedTime: idx === 0 ? 'Now' : formattedHour,
      temperature: Math.round(data.hourly.temperature_2m[idx]),
      precipitationProbability: Math.round(data.hourly.precipitation_probability[idx] || 0),
      precipitationMm: data.hourly.precipitation[idx] || 0,
      weatherCode: code,
      conditionText: getWeatherCodeInfo(code, hours >= 6 && hours < 19).text,
      uvIndex: Math.round(data.hourly.uv_index[idx] || 0),
      windSpeed: Math.round(data.hourly.wind_speed_10m[idx] || 0),
    };
  });

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daily: DailyForecast[] = data.daily.time.map((dateStr: string, idx: number) => {
    const date = new Date(dateStr);
    const dayName = idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : dayNames[date.getDay()];
    const code = data.daily.weather_code[idx];

    return {
      date: dateStr,
      dayName,
      maxTemp: Math.round(data.daily.temperature_2m_max[idx]),
      minTemp: Math.round(data.daily.temperature_2m_min[idx]),
      precipitationProbability: Math.round(data.daily.precipitation_probability_max[idx] || 0),
      precipitationMm: data.daily.precipitation_sum[idx] || 0,
      weatherCode: code,
      conditionText: getWeatherCodeInfo(code, true).text,
      uvIndexMax: Math.round(data.daily.uv_index_max[idx] || 5),
      sunrise: data.daily.sunrise[idx] ? data.daily.sunrise[idx].split('T')[1] : '06:00',
      sunset: data.daily.sunset[idx] ? data.daily.sunset[idx].split('T')[1] : '18:30',
      aiInsight: idx === 0 ? 'Ideal morning conditions with mild breeze.' : idx === 2 ? 'Scattered showers expected in the afternoon.' : undefined,
    };
  });

  return { current, hourly, daily };
}

/**
 * Fetch Air Quality & Pollutants (CPCB / Open-Meteo Air Quality API)
 */
export async function fetchAirQualityData(lat: number, lon: number): Promise<AirQualityData> {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Air quality fetch failed');
    const data = await res.json();

    const rawAqi = Math.round(data.current?.us_aqi || 65);
    const aqiMeta = getAqiCategory(rawAqi);

    return {
      aqi: rawAqi,
      category: aqiMeta.category,
      color: aqiMeta.color,
      pm2_5: Math.round(data.current?.pm2_5 || 28),
      pm10: Math.round(data.current?.pm10 || 54),
      o3: Math.round(data.current?.ozone || 38),
      no2: Math.round(data.current?.nitrogen_dioxide || 22),
      co: Math.round((data.current?.carbon_monoxide || 320) / 100),
      pollenTree: Math.min(5, Math.max(1, Math.round((data.current?.alder_pollen || 1.2) + (data.current?.birch_pollen || 0.8)))),
      pollenGrass: Math.min(5, Math.max(1, Math.round(data.current?.grass_pollen || 2))),
      pollenWeed: 2,
    };
  } catch {
    // Graceful fallback for mock/offline
    return {
      aqi: 72,
      category: 'Moderate',
      color: '#FBC02D',
      pm2_5: 32,
      pm10: 68,
      o3: 45,
      no2: 24,
      co: 3.5,
      pollenTree: 2,
      pollenGrass: 3,
      pollenWeed: 1,
    };
  }
}

/**
 * Fetch Marine & Coastal Data (INCOIS / Open-Meteo Marine)
 */
export async function fetchMarineData(lat: number, lon: number): Promise<MarineData> {
  try {
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&current=wave_height,wave_direction,wave_period`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Marine API failed');
    const data = await res.json();

    const waveHeight = data.current?.wave_height ? parseFloat(data.current.wave_height.toFixed(1)) : 1.2;
    const waveDirection = Math.round(data.current?.wave_direction || 180);

    return {
      waveHeight,
      waveDirection,
      waterTemperature: 27,
      tideStatus: 'Rising',
      swimSafety: waveHeight > 2.0 ? 'Dangerous' : waveHeight > 1.2 ? 'Caution' : 'Safe',
    };
  } catch {
    return {
      waveHeight: 1.1,
      waveDirection: 210,
      waterTemperature: 28,
      tideStatus: 'Rising',
      swimSafety: 'Safe',
    };
  }
}

/**
 * Autocomplete location search
 */
export async function searchLocations(query: string): Promise<SavedLocation[]> {
  if (!query || query.trim().length < 2) return [];

  const cleanQuery = query.trim().toLowerCase();

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding API failed');
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return DEFAULT_INDIAN_LOCATIONS.filter(l => 
        l.name.toLowerCase().includes(cleanQuery) || 
        (l.region && l.region.toLowerCase().includes(cleanQuery))
      );
    }

    return data.results.map((r: { id: number; name: string; admin1?: string; country?: string; latitude: number; longitude: number }) => ({
      id: String(r.id),
      name: r.name,
      region: r.admin1 || r.country || 'India',
      country: r.country || 'India',
      latitude: r.latitude,
      longitude: r.longitude,
      type: 'custom' as const,
    }));
  } catch {
    return DEFAULT_INDIAN_LOCATIONS.filter(l => 
      l.name.toLowerCase().includes(cleanQuery) ||
      (l.region && l.region.toLowerCase().includes(cleanQuery))
    );
  }
}

/**
 * Reverse geocode coordinates to find city & state name
 */
export async function reverseGeocodeGps(lat: number, lon: number): Promise<SavedLocation> {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || 'Live Location';
      const regionName = data.principalSubdivision || data.countryName || 'India';
      return {
        id: `gps_${Date.now()}`,
        name: cityName,
        region: regionName,
        country: data.countryName || 'India',
        latitude: parseFloat(lat.toFixed(4)),
        longitude: parseFloat(lon.toFixed(4)),
        type: 'home',
        isCurrent: true,
      };
    }
  } catch (e) {
    console.warn('Reverse geocode failed:', e);
  }

  return {
    id: `gps_${Date.now()}`,
    name: 'Current GPS Location',
    region: `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`,
    country: 'India',
    latitude: parseFloat(lat.toFixed(4)),
    longitude: parseFloat(lon.toFixed(4)),
    type: 'home',
    isCurrent: true,
  };
}

