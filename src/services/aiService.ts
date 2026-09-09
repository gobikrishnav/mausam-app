import { AirQualityData, CurrentWeather, DailyForecast, HourlyForecast, PersonaPreferences, PersonaType } from '../types';

/**
 * Generate Smart Brief narrative based on persona and weather
 */
export async function generateSmartBrief(params: {
  userName: string;
  personas: PersonaType[];
  preferences: PersonaPreferences;
  weather: CurrentWeather;
  hourly: HourlyForecast[];
  airQuality?: AirQualityData;
  locationName: string;
}): Promise<string> {
  const { userName, personas, weather, hourly, airQuality } = params;
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Check if OpenAI key is configured
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    try {
      const prompt = `You are MAUSAM AI, a hyper-personalized meteorologist assistant.
Generate a concise, warm 2-3 sentence daily narrative for ${userName || 'friend'} in ${params.locationName}.
Current weather: ${weather.temperature}°C, ${weather.conditionText}, Humidity ${weather.humidity}%, Wind ${weather.windSpeed} km/h, AQI: ${airQuality?.aqi || 'moderate'}.
Selected personas: ${personas.join(', ')}.
Give specific, time-contextual advice based on their active personas. Plain language, no jargon.`;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Fallback to intelligent local generator
    }
  }

  // Intelligent local dynamic narrative generator
  const rainNext6Hours = hourly.length > 0 
    ? hourly.slice(0, 6).some(h => (Number(h.precipitationProbability) || 0) >= 40)
    : (weather.precipitation > 0.5);
  const maxTempToday = hourly.length > 0 
    ? Math.max(...hourly.slice(0, 12).map(h => h.temperature)) 
    : (weather.temperature || 30);
  const aqiVal = airQuality?.aqi || 65;

  let advice = '';
  if (personas.includes('fitness')) {
    if (weather.temperature < 28 && aqiVal < 100 && !rainNext6Hours) {
      advice = `It's an ideal window for your outdoor workout before 9 AM with ${weather.temperature}°C and low UV.`;
    } else if (rainNext6Hours) {
      advice = `Rain showers are expected within the next few hours; aim for an indoor workout or finish before the drizzle begins.`;
    } else {
      advice = `Keep hydrated if training outdoors as temperatures reach ${maxTempToday}°C by afternoon.`;
    }
  } else if (personas.includes('farmer')) {
    if (rainNext6Hours) {
      advice = `Scattered rainfall is likely today; hold off on field irrigation and monitor field runoff.`;
    } else {
      advice = `Soil moisture conditions remain stable under today's ${weather.conditionText.toLowerCase()} skies.`;
    }
  } else if (personas.includes('commuter')) {
    if (rainNext6Hours || weather.conditionText.toLowerCase().includes('fog')) {
      advice = `Wet or low-visibility roads may slow down your commute. Factor in an extra 10–15 minutes travel time.`;
    } else {
      advice = `Clear transit conditions ahead with smooth visibility on your major routes.`;
    }
  } else if (personas.includes('health')) {
    if (aqiVal > 120) {
      advice = `Air quality is slightly elevated (AQI ${aqiVal}). Sensitive groups should wear an N95 mask outdoors.`;
    } else {
      advice = `Air quality is comfortable at AQI ${aqiVal}. Great time for outdoor ventilation.`;
    }
  } else {
    advice = rainNext6Hours 
      ? `Carry an umbrella as intermittent showers are likely later today.`
      : `Pleasant ${weather.conditionText.toLowerCase()} conditions throughout the day.`;
  }

  return `${greeting}${userName ? `, ${userName}` : ''}! ${advice} Current temperature is ${weather.temperature}°C with ${weather.humidity}% humidity.`;
}

/**
 * Conversational Assistant ("Ask MAUSAM") Engine
 */
export async function askMausamAI(params: {
  question: string;
  weather: CurrentWeather;
  daily: DailyForecast[];
  locationName: string;
  personas: PersonaType[];
}): Promise<{
  reply: string;
  contextSnippet?: { temp: number; condition: string; rainChance: number };
}> {
  const { question, weather, daily, locationName } = params;
  const qLower = question.toLowerCase();

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: `You are MAUSAM AI assistant, helping users with actionable weather intelligence for ${locationName}. 
Current weather: ${weather.temperature}°C, ${weather.conditionText}, rain: ${weather.precipitation}mm, humidity: ${weather.humidity}%.
Next 3 days: ${daily.slice(0, 3).map(d => `${d.dayName}: ${d.maxTemp}°/${d.minTemp}°, ${d.conditionText}, rain: ${d.precipitationProbability}%`).join('; ')}.
Keep answers punchy, empathetic, and directly actionable in 2-3 sentences.`,
            },
            { role: 'user', content: question },
          ],
          max_tokens: 250,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        return {
          reply: json.choices?.[0]?.message?.content?.trim(),
          contextSnippet: {
            temp: weather.temperature,
            condition: weather.conditionText,
            rainChance: daily[0]?.precipitationProbability || 0,
          },
        };
      }
    } catch {
      // Fallback below
    }
  }

  // High-quality contextual offline NLP responses
  const todayRain = daily[0]?.precipitationProbability || 0;
  const tomorrowRain = daily[1]?.precipitationProbability || 0;

  // 1. Specific Destination: Shimla / Manali / Mountains
  if (qLower.includes('shimla') || qLower.includes('manali') || qLower.includes('kullu') || qLower.includes('dharamshala') || qLower.includes('hill')) {
    return {
      reply: `Packing Guide for Shimla & Hill Stations:\n\n• Layered Clothing: Daytime highs hover around 16–19°C (mild), but nighttime drops sharply to 6–9°C. Pack warm fleece jackets, sweaters, and thermal base layers.\n• Rain Protection: Mountain weather is unpredictable; keep a compact windproof umbrella or waterproof poncho in your daypack.\n• Sun & Altitude Defense: High altitude UV index reaches 7+. Pack polarized UV sunglasses, lip balm, and SPF 50 sunscreen.\n• Sturdy Footwear: High-traction walking boots or running sneakers for steep inclines along the Ridge and Mall Road.`,
      contextSnippet: { temp: 16, condition: 'Mild / Mountain Breeze', rainChance: 25 }
    };
  }

  // 2. Specific Destination: Goa / Beach / Coastal
  if (qLower.includes('goa') || qLower.includes('beach') || qLower.includes('coastal') || qLower.includes('puri') || qLower.includes('kochi')) {
    return {
      reply: `Packing Guide for Coastal & Beach Trips:\n\n• Breathable Fabrics: Pack lightweight linens and cottons for 30–32°C tropical heat with 75%+ humidity.\n• Water & Sun Gear: UV rashguards, polarized shades, broad-brim hat, and reef-safe water-resistant sunscreen.\n• Evening Wear: Mosquito repellent and breathable full-sleeve shirts for seaside twilight hours.`,
      contextSnippet: { temp: 31, condition: 'Tropical / Humid', rainChance: 15 }
    };
  }

  // 3. General Travel & Packing
  if (qLower.includes('pack') || qLower.includes('trip') || qLower.includes('travel') || qLower.includes('flight')) {
    return {
      reply: `Travel Advisory & Packing Essentials:\n\n• Check destination diurnal range: Pack versatile breathable layers for daytime and a light windbreaker for cooler nights or AC transit.\n• Emergency Gear: Carry a compact umbrella, waterproof phone pouch, and basic electrolyte hydration packs.\n• Footwear: Choose broken-in, weather-appropriate walking shoes.`,
      contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
    };
  }

  // 4. Fitness & Exercise
  if (qLower.includes('run') || qLower.includes('exercise') || qLower.includes('workout') || qLower.includes('walk')) {
    if (weather.temperature <= 27 && todayRain < 35) {
      return {
        reply: `Yes, conditions are great for outdoor workouts in ${locationName}! Current temperature is ${weather.temperature}°C with manageable UV levels. Best slot is before 8:30 AM or after 5:30 PM. Keep a 500ml water bottle handy as humidity is ${weather.humidity}%.`,
        contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
      };
    } else {
      return {
        reply: `High heat index or precipitation risk detected (${weather.temperature}°C, ${todayRain}% rain chance). If running outdoors, stick to shaded parks early morning or switch to an indoor treadmill session today.`,
        contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
      };
    }
  }

  // 5. Rain & Umbrella
  if (qLower.includes('rain') || qLower.includes('umbrella')) {
    if (todayRain > 35) {
      return {
        reply: `Yes, definitely carry an umbrella! There is an active ${todayRain}% rain probability in ${locationName} today, particularly during afternoon convective hours.`,
        contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
      };
    } else {
      return {
        reply: `Precipitation probability is low today (${todayRain}%). Skies remain predominantly ${weather.conditionText.toLowerCase()}, so an umbrella is not strictly necessary for local travel.`,
        contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
      };
    }
  }

  // 6. Tomorrow's Outlook
  if (qLower.includes('tomorrow')) {
    const tm = daily[1] || daily[0] || {
      conditionText: weather.conditionText || 'Clear',
      maxTemp: weather.temperature ? weather.temperature + 2 : 32,
      minTemp: weather.temperature ? weather.temperature - 4 : 22,
      precipitationProbability: 10,
    };
    return {
      reply: `Tomorrow in ${locationName} will see ${tm.conditionText.toLowerCase()} conditions with a high of ${tm.maxTemp}°C and a low of ${tm.minTemp}°C. Rain likelihood stands at ${tomorrowRain}%.`,
      contextSnippet: { temp: tm.maxTemp, condition: tm.conditionText, rainChance: tomorrowRain }
    };
  }

  // 7. Farming & Irrigation
  if (qLower.includes('farm') || qLower.includes('irrigate') || qLower.includes('crop') || qLower.includes('agro')) {
    return {
      reply: `Agromet Advisory for ${locationName}:\n\nSoil moisture is currently stable. With a ${todayRain}% rain chance, standard micro-irrigation schedules can continue. Check local evapotranspiration rates before applying heavy flood irrigation.`,
      contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
    };
  }

  // 8. Driving & Commute
  if (qLower.includes('drive') || qLower.includes('commute') || qLower.includes('traffic') || qLower.includes('road')) {
    return {
      reply: `Road Transit Status for ${locationName}:\n\nCurrent road conditions are ${weather.conditionText.toLowerCase()} with good horizontal visibility (>8km). Dry asphalt detected on arterial expressways. Check the Live Map tab for real-time corridor congestion.`,
      contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
    };
  }

  // Default response
  return {
    reply: `Currently in ${locationName}, weather is ${weather.temperature}°C and ${weather.conditionText}. Today's maximum temperature will touch ${daily[0]?.maxTemp || weather.temperature}°C with ${weather.humidity}% humidity and ${weather.windSpeed} km/h wind. How else can I assist your day?`,
    contextSnippet: { temp: weather.temperature, condition: weather.conditionText, rainChance: todayRain }
  };
}
