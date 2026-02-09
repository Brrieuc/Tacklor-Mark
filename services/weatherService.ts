import { WeatherData } from "../types";

const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';

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
    if (!navigator.geolocation) {
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

    const response = await fetch(
      `${OPEN_METEO_URL}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,surface_pressure,wind_speed_10m,weather_code&wind_speed_unit=kmh&timezone=auto`
    );

    if (!response.ok) throw new Error("Erreur Open-Meteo");

    const data = await response.json();
    return {
      temp: data.current.temperature_2m,
      wind: data.current.wind_speed_10m,
      pressure: data.current.surface_pressure,
      code: data.current.weather_code,
      desc: getWMODescription(data.current.weather_code),
      lat: latitude,
      lon: longitude
    };
  } catch (error) {
    console.error("Météo erreur:", error);
    return null;
  }
};