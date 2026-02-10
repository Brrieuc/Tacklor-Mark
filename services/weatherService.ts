import { WeatherData } from "../types";

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/reverse';

const getWMODescription = (code: number): string => {
  const codes: Record<number, string> = {
    0: "Ciel dégagé",
    1: "Peu nuageux", 2: "Nuageux", 3: "Couvert",
    45: "Brouillard", 48: "Brouillard givrant",
    51: "Bruine légère", 53: "Bruine modérée", 55: "Bruine dense",
    61: "Pluie faible", 63: "Pluie modérée", 65: "Pluie forte",
    71: "Neige faible", 73: "Neige modérée", 75: "Neige forte",
    95: "Orage", 96: "Orage et grêle", 99: "Orage violent"
  };
  return codes[code] || "Variable";
};

export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error("Géolocalisation non supportée"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    });
  });
};

export const fetchCurrentWeather = async (): Promise<WeatherData | null> => {
  try {
    const position = await getCurrentLocation();
    const { latitude, longitude } = position.coords;

    // 1. Fetch Weather Data
    const weatherResponse = await fetch(
      `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,surface_pressure,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
    );

    if (!weatherResponse.ok) throw new Error("Erreur Open-Meteo");
    const weatherData = await weatherResponse.json();
    
    // 2. Fetch Location Name (Reverse Geocoding)
    let locationName = "Position GPS";
    try {
        const geoResponse = await fetch(`${GEOCODING_URL}?latitude=${latitude}&longitude=${longitude}&count=1&language=fr`);
        if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            if (geoData.results && geoData.results.length > 0) {
                locationName = geoData.results[0].name;
            }
        }
    } catch (e) {
        console.warn("Geocoding failed", e);
    }

    if (!weatherData || !weatherData.current) {
        throw new Error("Données météo incomplètes");
    }

    return {
      temp: weatherData.current.temperature_2m,
      wind: weatherData.current.wind_speed_10m,
      pressure: weatherData.current.surface_pressure,
      code: weatherData.current.weather_code,
      desc: getWMODescription(weatherData.current.weather_code),
      lat: latitude,
      lon: longitude,
      locationName: locationName
    };
  } catch (error) {
    // Log silencieux pour ne pas spammer la console en production si l'utilisateur refuse la geoloc
    console.warn("Météo indisponible:", error);
    return null;
  }
};