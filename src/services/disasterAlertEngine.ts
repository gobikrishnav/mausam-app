/**
 * disasterAlertEngine.ts  –  MAUSAM v3.4.0
 * ──────────────────────────────────────────────────────────────────────────
 * Automatically evaluates real-time weather data against Indian meteorological
 * thresholds and generates SevereAlert objects for all major calamity types:
 *   • Cyclone / Tropical Storm
 *   • Flash Flood / Extreme Rain
 *   • Thunderstorm
 *   • Heatwave
 *   • Cold Wave
 *   • Dense Fog
 *   • Dust Storm / Sand Storm
 *   • Severe Air Quality (AQI ≥ 200)
 *   • Coastal / Marine Hazard
 *   • Strong Wind / Gale
 *
 * Reference: IMD Colour-code warning criteria (2023 guidelines)
 * ──────────────────────────────────────────────────────────────────────────
 */

import {
  AirQualityData,
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  MarineData,
  SavedLocation,
  SevereAlert,
} from '../types';

// ─── helpers ────────────────────────────────────────────────────────────────

const now = () => new Date().toISOString();

const expiry = (hoursAhead: number) =>
  new Date(Date.now() + hoursAhead * 3_600_000).toISOString();

let _idCounter = 0;
const makeId = (tag: string) =>
  `auto_${tag}_${Date.now()}_${++_idCounter}`;

// WMO weather-code groups
const THUNDERSTORM_CODES = new Set([95, 96, 99]);
const HEAVY_RAIN_CODES   = new Set([65, 82]);
const RAIN_CODES         = new Set([51, 53, 55, 61, 63, 65, 80, 81, 82]);
const FOG_CODES          = new Set([45, 48]);
const SNOW_CODES         = new Set([71, 73, 75, 77, 85, 86]);

// Indian coastal-belt rough bbox – latitude 8–23 N, longitude 70–88 E
const isCoastal = (loc: SavedLocation) =>
  loc.latitude >= 8 && loc.latitude <= 23 &&
  loc.longitude >= 70 && loc.longitude <= 88;

// Arid / dust-storm prone zones (Rajasthan, Gujarat, parts of Haryana/UP)
const isAridZone = (loc: SavedLocation) =>
  (loc.latitude >= 23 && loc.latitude <= 32 &&
   loc.longitude >= 68 && loc.longitude <= 79);

// ─── main engine function ────────────────────────────────────────────────────

export function generateDisasterAlerts(
  weather: CurrentWeather,
  hourly: HourlyForecast[],
  daily: DailyForecast[],
  airQuality: AirQualityData | null,
  marine: MarineData | null,
  location: SavedLocation,
  dismissedIds: string[],
): SevereAlert[] {
  const alerts: SevereAlert[] = [];
  const area = `${location.name}, ${location.region}`;

  // Convenience slices
  const next6h  = hourly.slice(0, 6);
  const next12h = hourly.slice(0, 12);
  const next24h = hourly.slice(0, 24);

  // Max/sum helpers with safe coercion
  const maxVal = (arr: number[]) => arr.length ? Math.max(...arr) : 0;
  const safeNum = (v: unknown, fallback = 0) =>
    isFinite(Number(v)) ? Number(v) : fallback;

  const maxHourlyRain   = maxVal(next6h.map(h  => safeNum(h.precipitationMm)));
  const maxRainProb6h   = maxVal(next6h.map(h  => safeNum(h.precipitationProbability)));
  const maxRainProb24h  = maxVal(next24h.map(h => safeNum(h.precipitationProbability)));
  const maxWind12h      = maxVal(next12h.map(h => safeNum(h.windSpeed)));
  const currentWind     = safeNum(weather.windSpeed);
  const currentTemp     = safeNum(weather.temperature);
  const currentCode     = safeNum(weather.weatherCode);
  const currentPrecip   = safeNum(weather.precipitation);
  const maxTempToday    = daily.length > 0 ? safeNum(daily[0].maxTemp) : currentTemp;
  const minTempToday    = daily.length > 0 ? safeNum(daily[0].minTemp) : currentTemp;

  // ── 1. CYCLONE ──────────────────────────────────────────────────────────
  // IMD: Cyclonic Storm ≥63 km/h, Severe CS ≥88 km/h, Very Severe ≥118 km/h
  const effectiveWind = Math.max(currentWind, safeNum(weather.windGusts, 0), maxWind12h);
  if (isCoastal(location) && effectiveWind >= 63) {
    const severity: SevereAlert['severity'] =
      effectiveWind >= 118 ? 'Emergency' :
      effectiveWind >= 88  ? 'Warning'   : 'Watch';
    const label =
      effectiveWind >= 118 ? 'Very Severe Cyclonic Storm' :
      effectiveWind >= 88  ? 'Severe Cyclonic Storm'      : 'Cyclonic Storm';
    alerts.push({
      id: makeId('cyclone'),
      title: `🌀 ${label}`,
      severity,
      category: 'cyclone',
      affectedArea: area,
      headline: `Cyclone-force winds of ${Math.round(effectiveWind)} km/h detected`,
      description: `IMD-grade ${label} conditions are active over ${area}. ` +
        `Sustained winds of ${Math.round(effectiveWind)} km/h with gusts possible. ` +
        `Coastal flooding, storm surge, and structural damage likely.`,
      safetyInstructions: [
        'Move away from the coast immediately to a safe shelter.',
        'Do not venture into the sea or low-lying coastal areas.',
        'Secure all loose outdoor objects and board up windows.',
        'Follow official IMD and NDMA evacuation advisories.',
        'Keep emergency contacts, water, and dry food ready for 72 hours.',
      ],
      issuedAt: now(),
      expiresAt: expiry(24),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 2. THUNDERSTORM ────────────────────────────────────────────────────
  const hasThunderstorm =
    THUNDERSTORM_CODES.has(currentCode) ||
    next6h.some(h => THUNDERSTORM_CODES.has(safeNum(h.weatherCode)));
  if (hasThunderstorm) {
    alerts.push({
      id: makeId('storm'),
      title: '⛈️ Thunderstorm Warning',
      severity: 'Warning',
      category: 'storm',
      affectedArea: area,
      headline: 'Severe thunderstorm with lightning expected',
      description: `Active or imminent thunderstorm detected over ${area}. ` +
        `Lightning, gusty winds, and heavy rain bursts are likely in the next 1–3 hours.`,
      safetyInstructions: [
        'Stay indoors and away from windows and tall trees.',
        'Avoid using electrical appliances and landline phones.',
        'Do not shelter under isolated trees or metal structures.',
        'Keep vehicles off exposed roads until the storm passes.',
        'Postpone outdoor and agricultural activities.',
      ],
      issuedAt: now(),
      expiresAt: expiry(6),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 3. FLASH FLOOD / EXTREME RAIN ──────────────────────────────────────
  // IMD: Extremely Heavy Rain >204.4 mm/day; Heavy Rain 64.5–115.5 mm
  // For hourly: >20 mm/hr → Flash flood risk
  const extremeRain = currentPrecip > 20 || maxHourlyRain > 20;
  const heavyRain   = !extremeRain && (
    maxRainProb6h >= 80 && (maxHourlyRain >= 5 || HEAVY_RAIN_CODES.has(currentCode))
  );
  if (extremeRain) {
    alerts.push({
      id: makeId('flood'),
      title: '🌊 Flash Flood Warning',
      severity: 'Emergency',
      category: 'flood',
      affectedArea: area,
      headline: `Extreme rainfall of ${Math.round(Math.max(currentPrecip, maxHourlyRain))} mm/hr — Flash flood risk`,
      description: `Extremely heavy rainfall is occurring over ${area}. ` +
        `Flash floods may develop rapidly in low-lying areas, near rivers, and urban drains. ` +
        `IMD criteria for extremely heavy rainfall exceeded.`,
      safetyInstructions: [
        'Evacuate low-lying, flood-prone, and riverbank areas immediately.',
        'Never attempt to drive through flooded roads.',
        'Move to higher ground and await official all-clear.',
        'Disconnect electrical mains if water enters premises.',
        'Contact NDRF helpline 011-23438252 if trapped.',
      ],
      issuedAt: now(),
      expiresAt: expiry(12),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  } else if (heavyRain) {
    alerts.push({
      id: makeId('flood'),
      title: '🌧️ Heavy Rain Advisory',
      severity: 'Watch',
      category: 'flood',
      affectedArea: area,
      headline: `${Math.round(maxRainProb6h)}% rain probability in next 6 hours`,
      description: `Heavy rainfall is expected over ${area} in the next 6 hours. ` +
        `Waterlogging and traffic disruptions possible. ` +
        `People in low-lying areas should remain alert.`,
      safetyInstructions: [
        'Keep drains clear around your property.',
        'Avoid underpasses and low-lying areas when waterlogging is likely.',
        'Carry rain gear and allow extra travel time.',
        'Keep children and elderly indoors during peak rainfall.',
      ],
      issuedAt: now(),
      expiresAt: expiry(8),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 4. HEATWAVE ────────────────────────────────────────────────────────
  // IMD: Heatwave ≥40°C (plains) or 5°C above normal; Severe Heatwave ≥45°C
  if (maxTempToday >= 40) {
    const severity: SevereAlert['severity'] = maxTempToday >= 45 ? 'Emergency' :
      maxTempToday >= 43 ? 'Warning' : 'Watch';
    alerts.push({
      id: makeId('heatwave'),
      title: '🔥 Heatwave Warning',
      severity,
      category: 'heatwave',
      affectedArea: area,
      headline: `Max temperature ${Math.round(maxTempToday)}°C — IMD Heatwave threshold exceeded`,
      description: `A ${severity === 'Emergency' ? 'severe heatwave' : 'heatwave'} is in progress over ${area}. ` +
        `Daytime high of ${Math.round(maxTempToday)}°C with heat index significantly higher. ` +
        `Heat exhaustion and heat stroke risk is ${severity === 'Emergency' ? 'very high' : 'high'}.`,
      safetyInstructions: [
        'Stay indoors between 12 PM and 4 PM.',
        'Drink water frequently — at least 2–3 litres per day.',
        'Wear light-coloured, loose cotton clothing and use a hat outdoors.',
        'Do not leave children, elderly, or pets in parked vehicles.',
        'Watch for heat stroke symptoms: confusion, seizures, no sweating.',
        'Cool water, ORS, and thin cotton sheets can help manage heat exposure.',
      ],
      issuedAt: now(),
      expiresAt: expiry(24),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 5. COLD WAVE ───────────────────────────────────────────────────────
  // IMD: Cold Wave ≤10°C (plains), Severe ≤4°C; North India: ≤4°C plains
  if (minTempToday <= 10 && location.latitude >= 20) {
    const isSevere = minTempToday <= 4;
    alerts.push({
      id: makeId('snow'),
      title: isSevere ? '🥶 Severe Cold Wave Warning' : '❄️ Cold Wave Advisory',
      severity: isSevere ? 'Warning' : 'Advisory',
      category: 'snow',
      affectedArea: area,
      headline: `Min temperature ${Math.round(minTempToday)}°C — Cold wave conditions`,
      description: `Cold wave conditions are prevailing over ${area}. ` +
        `Minimum temperature of ${Math.round(minTempToday)}°C poses risk of hypothermia, ` +
        `especially for homeless, elderly, and outdoor workers.`,
      safetyInstructions: [
        'Wear multiple layers of warm clothing and cover extremities.',
        'Stay indoors during night and early morning hours.',
        'Ensure adequate heating for elderly and infants.',
        'Avoid alcohol which can cause false warmth while lowering body temperature.',
        'Keep pets inside and provide warm shelter for stray animals.',
      ],
      issuedAt: now(),
      expiresAt: expiry(24),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 6. DENSE FOG ───────────────────────────────────────────────────────
  // Visibility < 200 m = Dense Fog; < 50 m = Very Dense Fog
  const hasFog = FOG_CODES.has(currentCode) || next6h.some(h => FOG_CODES.has(safeNum(h.weatherCode)));
  if (hasFog) {
    alerts.push({
      id: makeId('storm'),
      title: '🌫️ Dense Fog Advisory',
      severity: 'Advisory',
      category: 'storm',
      affectedArea: area,
      headline: 'Dense fog expected — severely reduced visibility',
      description: `Dense fog conditions are active or imminent over ${area}. ` +
        `Visibility may drop below 200 metres, causing significant hazards for road and rail traffic.`,
      safetyInstructions: [
        'Use fog lights and drive at reduced speed.',
        'Maintain a safe following distance of at least 5 seconds.',
        'Avoid driving in fog if possible; allow extra time for travel.',
        'Watch for delays in trains and flights.',
        'Pedestrians should wear reflective clothing near roads.',
      ],
      issuedAt: now(),
      expiresAt: expiry(8),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 7. DUST STORM / SAND STORM ─────────────────────────────────────────
  // IMD: Dust Storm when winds >50 km/h in arid areas with loose soil
  if (isAridZone(location) && effectiveWind >= 50 && !RAIN_CODES.has(currentCode)) {
    alerts.push({
      id: makeId('storm'),
      title: '🌪️ Dust Storm Warning',
      severity: effectiveWind >= 80 ? 'Warning' : 'Watch',
      category: 'storm',
      affectedArea: area,
      headline: `Wind speed ${Math.round(effectiveWind)} km/h — Dust storm likely`,
      description: `High winds of ${Math.round(effectiveWind)} km/h in arid conditions over ${area} ` +
        `are likely to cause a dust/sand storm. Visibility may drop sharply and respiratory health may be affected.`,
      safetyInstructions: [
        'Stay indoors and seal gaps in doors and windows.',
        'Wear a dust mask (N95) or cover your nose and mouth with a wet cloth.',
        'Park vehicles under cover to protect from sand abrasion.',
        'Postpone outdoor work, especially farming and construction.',
        'Respiratory patients should keep inhalers accessible.',
      ],
      issuedAt: now(),
      expiresAt: expiry(8),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── 8. AIR QUALITY / SMOG ──────────────────────────────────────────────
  // CPCB: AQI 201–300 = Poor; 301–400 = Very Poor; 401+ = Severe
  if (airQuality && airQuality.aqi >= 200) {
    const severity: SevereAlert['severity'] =
      airQuality.aqi >= 401 ? 'Emergency' :
      airQuality.aqi >= 301 ? 'Warning'   :
      airQuality.aqi >= 201 ? 'Watch'     : 'Advisory';
    const label =
      airQuality.aqi >= 401 ? 'Severe (CPCB Emergency)' :
      airQuality.aqi >= 301 ? 'Very Poor'               :
      'Poor';
    alerts.push({
      id: makeId('air_quality'),
      title: '😷 Poor Air Quality Alert',
      severity,
      category: 'air_quality',
      affectedArea: area,
      headline: `AQI ${airQuality.aqi} (${label}) — Health risk elevated`,
      description: `Air Quality Index has reached ${airQuality.aqi} (${label}) over ${area}. ` +
        `PM2.5: ${airQuality.pm2_5} µg/m³, PM10: ${airQuality.pm10} µg/m³. ` +
        `Prolonged outdoor exposure is harmful, especially for children, elderly, and respiratory patients.`,
      safetyInstructions: [
        'Avoid outdoor activities especially jogging, cycling, and heavy outdoor work.',
        'Wear an N95/P100 respirator mask when going outdoors.',
        'Keep windows and doors closed; use air purifiers indoors.',
        'Respiratory patients should consult a doctor and keep medication ready.',
        'Do not burn garbage, biomass, or firecrackers.',
      ],
      issuedAt: now(),
      expiresAt: expiry(12),
      source: 'MAUSAM Auto-Alert (CPCB AQI Threshold)',
      isActive: true,
    });
  }

  // ── 9. COASTAL / MARINE HAZARD ─────────────────────────────────────────
  // Wave height >2 m = caution; >3.5 m = dangerous
  if (marine && isCoastal(location)) {
    if (marine.waveHeight >= 2.0) {
      const isSevere = marine.waveHeight >= 3.5;
      alerts.push({
        id: makeId('flood'),
        title: isSevere ? '🌊 Severe Marine Hazard' : '⚠️ High Wave Advisory',
        severity: isSevere ? 'Warning' : 'Watch',
        category: 'flood',
        affectedArea: area,
        headline: `Wave height ${marine.waveHeight.toFixed(1)} m — ${marine.swimSafety} for swimming`,
        description: `Sea conditions off ${area} are ${isSevere ? 'very rough' : 'rough'} ` +
          `with wave heights of ${marine.waveHeight.toFixed(1)} m. ` +
          `Swimming conditions rated: ${marine.swimSafety}. ` +
          `Fishing boats and small vessels should avoid venturing into the sea.`,
        safetyInstructions: [
          'Do not swim or wade in the sea until conditions improve.',
          'Fishing boats should return to harbour immediately.',
          'Stay at least 50 m away from the shoreline during high waves.',
          'Watch for rip currents — swim parallel to shore if caught.',
          'Monitor coast guard advisories and harbour bulletins.',
        ],
        issuedAt: now(),
        expiresAt: expiry(12),
        source: 'MAUSAM Auto-Alert (Marine Threshold)',
        isActive: true,
      });
    }
  }

  // ── 10. STRONG WIND (standalone, non-cyclone) ──────────────────────────
  // IMD: Gale warning ≥63 km/h; Strong wind advisory 40–62 km/h
  // Only fire if cyclone alert was NOT already issued
  const hasCycloneAlert = alerts.some(a => a.category === 'cyclone');
  if (!hasCycloneAlert && effectiveWind >= 40) {
    const isSevere = effectiveWind >= 63;
    alerts.push({
      id: makeId('storm'),
      title: isSevere ? '💨 Gale Force Wind Warning' : '💨 Strong Wind Advisory',
      severity: isSevere ? 'Warning' : 'Advisory',
      category: 'storm',
      affectedArea: area,
      headline: `Wind speed ${Math.round(effectiveWind)} km/h — ${isSevere ? 'Gale warning' : 'Strong wind advisory'}`,
      description: `Strong winds of ${Math.round(effectiveWind)} km/h are expected over ${area}. ` +
        `Branches, loose signboards, and outdoor objects may become projectiles. ` +
        `${isSevere ? 'Power outages and structural damage are possible.' : 'Outdoor activities should be approached with caution.'}`,
      safetyInstructions: [
        'Secure loose objects — furniture, signboards, and garden items.',
        'Avoid parking under trees or near weak structures.',
        'Two-wheelers and cyclists should exercise extreme caution.',
        'Postpone open-air events and elevated construction work.',
      ],
      issuedAt: now(),
      expiresAt: expiry(8),
      source: 'MAUSAM Auto-Alert (IMD Threshold)',
      isActive: true,
    });
  }

  // ── Filter out already-dismissed alerts ──────────────────────────────
  // We cannot match by ID (new IDs every run), so we match by category+severity
  // within a short window; simple approach: just return all, let user dismiss.
  // To avoid re-flooding, deduplicate by category — keep highest severity only.
  const byCategory = new Map<string, SevereAlert>();
  for (const a of alerts) {
    const existing = byCategory.get(a.category);
    if (!existing) {
      byCategory.set(a.category, a);
    } else {
      const order: Record<string, number> = { Advisory: 0, Watch: 1, Warning: 2, Emergency: 3 };
      if ((order[a.severity] ?? 0) > (order[existing.severity] ?? 0)) {
        byCategory.set(a.category, a);
      }
    }
  }

  return Array.from(byCategory.values());
}
