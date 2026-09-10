import { DISCOVER_LOCATIONS_CATALOG, DiscoverLocationItem } from './weatherApi';
import { SavedLocation } from '../types';

export interface DestinationTelemetry extends DiscoverLocationItem {
  state?: string;
  temperature: number;
  feelsLike: number;
  minTemp: number;
  maxTemp: number;
  condition: string;
  conditionIcon: string;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  precipitationProb: number;
  uvIndex: number;
  pressure: number;
  visibilityKm: number;
  warningLevel: 'green' | 'yellow' | 'orange' | 'red';
  warningMessage: string;
  
  // Air Quality (AQI for all locations)
  aqi: number;
  aqiCategory: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  aqiColor: string;
  pm25: number;
  pm10: number;
  aqiAdvisory: string;
}

export interface TransitJourneyAdvisory {
  source: { name: string; lat: number; lng: number; temp: number; aqi: number; condition: string };
  destination: DestinationTelemetry;
  distanceKm: number;
  estimatedHours: number;
  tempDelta: number;
  aqiDelta: number;
  climateShift: string;
  clothingAdvice: string;
  roadAdvisory: string;
  healthAdvisory: string;
  bestTravelWindow: string;
  routeCoordinates: [number, number][];
}

// Compute AQI category & color
export function computeAqiCategory(aqi: number) {
  if (aqi <= 50) return { category: 'Good' as const, color: '#16A34A', advisory: 'Air quality is pristine and healthy for outdoor recreation.' };
  if (aqi <= 100) return { category: 'Satisfactory' as const, color: '#65A30D', advisory: 'Minor breathing discomfort to sensitive people only.' };
  if (aqi <= 200) return { category: 'Moderate' as const, color: '#EAB308', advisory: 'Noticeable haze. People with asthma should carry inhalers.' };
  if (aqi <= 300) return { category: 'Poor' as const, color: '#EA580C', advisory: 'Breathing discomfort on prolonged exposure. Wear N95 outdoors.' };
  if (aqi <= 400) return { category: 'Very Poor' as const, color: '#DC2626', advisory: 'Respiratory illness on prolonged exposure. Avoid strenuous outdoor exercise.' };
  return { category: 'Severe' as const, color: '#7F1D1D', advisory: 'Health emergency: severe impacts on lungs. Keep windows shut.' };
}

// Calculate Geodesic Distance via Haversine
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Detailed Telemetry Database for all 26 curated destinations
export const ALL_DESTINATIONS_TELEMETRY: DestinationTelemetry[] = DISCOVER_LOCATIONS_CATALOG.map((dest) => {
  // Altitude temperature lapse rate: ~6.5°C per 1000m
  const elevation = dest.elevationMeters || (dest.category === 'coastal' ? 15 : dest.category === 'pilgrimage' ? 250 : 180);
  let baseTemp = 33;
  let condition = 'Partly Cloudy';
  let icon = 'cloud-sun';
  let aqiVal = 68;
  let warning: 'green' | 'yellow' | 'orange' | 'red' = 'green';
  let warningMsg = 'Normal synoptic atmospheric conditions.';

  if (dest.category === 'hill_stations') {
    baseTemp = Math.round(30 - (elevation * 0.0065));
    condition = elevation > 3000 ? 'Chilly Mountain Air' : 'Pleasant Mountain Mist';
    icon = 'mountain';
    aqiVal = Math.round(20 + Math.random() * 25); // Pristine hill air
    if (elevation > 2500) {
      warning = 'yellow';
      warningMsg = 'High UV exposure and cold evening wind chill at high altitude.';
    }
  } else if (dest.category === 'coastal') {
    baseTemp = Math.round(31 + (Math.random() * 3));
    condition = 'Maritime Breeze & Humidity';
    icon = 'waves';
    aqiVal = Math.round(35 + Math.random() * 30); // Clean sea breeze
    warning = 'yellow';
    warningMsg = 'Moderate swell and coastal gusty winds. INCOIS wave advisory active.';
  } else if (dest.category === 'cyclone_zones') {
    baseTemp = 29;
    condition = 'Squally Wind & Rain Influx';
    icon = 'wind';
    aqiVal = 45;
    warning = 'orange';
    warningMsg = 'High moisture convergence and isolated intense cloudburst risk.';
  } else if (dest.category === 'agriculture') {
    baseTemp = Math.round(34 + Math.random() * 4);
    condition = 'Sunny Warm Agricultural Belt';
    icon = 'sun';
    aqiVal = Math.round(110 + Math.random() * 60);
  } else if (dest.category === 'pilgrimage') {
    baseTemp = dest.elevationMeters ? 14 : Math.round(32 + Math.random() * 4);
    condition = dest.elevationMeters ? 'Sub-alpine Holy Valley' : 'Humid River Basin';
    icon = 'cloud';
    aqiVal = Math.round(90 + Math.random() * 70);
  }

  const aqiInfo = computeAqiCategory(aqiVal);

  return {
    ...dest,
    temperature: baseTemp,
    feelsLike: dest.category === 'coastal' ? baseTemp + 4 : baseTemp - 1,
    minTemp: baseTemp - 7,
    maxTemp: baseTemp + 3,
    condition,
    conditionIcon: icon,
    humidity: dest.category === 'coastal' ? 82 : dest.category === 'hill_stations' ? 58 : 65,
    windSpeed: dest.category === 'coastal' ? 26 : dest.category === 'cyclone_zones' ? 34 : 14,
    windDirection: Math.round(180 + Math.random() * 90),
    precipitationProb: dest.category === 'cyclone_zones' ? 75 : dest.category === 'hill_stations' ? 40 : 15,
    uvIndex: elevation > 2000 ? 9 : 6,
    pressure: Math.round(1013 - (elevation * 0.11)),
    visibilityKm: dest.category === 'hill_stations' && elevation > 2000 ? 14 : 8,
    warningLevel: warning,
    warningMessage: warningMsg,
    aqi: aqiVal,
    aqiCategory: aqiInfo.category,
    aqiColor: aqiInfo.color,
    pm25: Math.round(aqiVal * 0.45),
    pm10: Math.round(aqiVal * 0.85),
    aqiAdvisory: aqiInfo.advisory,
  };
});

// Generate Source-to-Destination Transit Advisory
export function generateTransitAdvisory(
  sourceLocation: SavedLocation,
  destination: DestinationTelemetry,
  sourceTempInput?: number,
  sourceAqiInput?: number
): TransitJourneyAdvisory {
  const dist = calculateDistanceKm(
    sourceLocation.latitude,
    sourceLocation.longitude,
    destination.latitude,
    destination.longitude
  );

  // Source weather benchmark (fallback if source is not in catalog)
  const sourceTemp = sourceTempInput ?? 34;
  const sourceAqi = sourceAqiInput ?? 145;
  const tempDelta = destination.temperature - sourceTemp;
  const aqiDelta = destination.aqi - sourceAqi;

  // Road travel speed estimate: ~55 km/h avg in India accounting for ghats/expressways
  const estHours = parseFloat((dist / 55).toFixed(1));

  let climateShift = '';
  if (tempDelta < -10) {
    climateShift = `Sharp temperature drop of ${Math.abs(tempDelta)}°C from source. Transitioning from warm plains to cold alpine air.`;
  } else if (tempDelta > 5) {
    climateShift = `Warm thermal surge of +${tempDelta}°C. Prepare for higher heat and sun exposure.`;
  } else {
    climateShift = `Mild thermal difference (${Math.abs(tempDelta)}°C). Climate resembles your origin station.`;
  }

  let clothingAdvice = '';
  if (destination.category === 'hill_stations' || (destination.elevationMeters && destination.elevationMeters > 1500)) {
    clothingAdvice = 'Pack thermal innerwear, heavy fleece jackets, woolen caps, and windbreakers for sub-20°C temperatures.';
  } else if (destination.category === 'coastal') {
    clothingAdvice = 'Pack breathable light cotton wear, sunglasses, UV 50+ sunscreen, and quick-drying rain gear.';
  } else {
    clothingAdvice = 'Standard seasonal cotton garments, UV protection, and hydration bottles.';
  }

  let roadAdvisory = '';
  if (destination.category === 'hill_stations') {
    roadAdvisory = 'Ghat section curves and hairpin bends. Watch for sudden mountain mist and fog reducing visibility below 200m.';
  } else if (destination.category === 'cyclone_zones') {
    roadAdvisory = 'Coastal gale warnings. Drive cautiously on bridges and coastal causeways due to crosswind gusts.';
  } else {
    roadAdvisory = 'National Highway expressways are largely free-flowing. Moderate congestion near toll plazas and urban bypasses.';
  }

  let healthAdvisory = '';
  if (aqiDelta < -50) {
    healthAdvisory = `Significant air quality improvement! Destination has ${Math.abs(aqiDelta)} points cleaner AQI (${destination.aqi} vs ${sourceAqi}). Ideal for outdoor fitness.`;
  } else {
    healthAdvisory = `Destination AQI is ${destination.aqi} (${destination.aqiCategory}). Drink plenty of fluids.`;
  }

  // Generate intermediate route path for map line (smooth Bezier / arc interpolation)
  const numSteps = 8;
  const routeCoordinates: [number, number][] = [];
  for (let i = 0; i <= numSteps; i++) {
    const fraction = i / numSteps;
    // Slight curvature offset to represent highway routing
    const lat = sourceLocation.latitude + (destination.latitude - sourceLocation.latitude) * fraction;
    const lngOffset = Math.sin(fraction * Math.PI) * 0.35; // gentle geographic arc
    const lng = sourceLocation.longitude + (destination.longitude - sourceLocation.longitude) * fraction + lngOffset;
    routeCoordinates.push([parseFloat(lat.toFixed(4)), parseFloat(lng.toFixed(4))]);
  }

  return {
    source: {
      name: sourceLocation.name,
      lat: sourceLocation.latitude,
      lng: sourceLocation.longitude,
      temp: sourceTemp,
      aqi: sourceAqi,
      condition: 'Sunny / Hot',
    },
    destination,
    distanceKm: dist,
    estimatedHours: estHours,
    tempDelta,
    aqiDelta,
    climateShift,
    clothingAdvice,
    roadAdvisory,
    healthAdvisory,
    bestTravelWindow: destination.precipitationProb > 50 ? 'Early Morning (05:00 - 09:00 AM) before convective afternoon showers' : 'Morning or Late Afternoon (comfortable thermal conditions)',
    routeCoordinates,
  };
}
