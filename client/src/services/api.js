import axios from 'axios';

// Backend API Base URL
// In Production on Render (unified deployment): requests will resolve relatively to '/api'
// In Development: falls back to 'http://localhost:5000/api'
// If custom backend URL is configured: uses import.meta.env.VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token automatically to every request if present
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aeropulse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Direct fallback in case backend is offline or loading
const fetchDirectAirQualityAndWeather = async (lat, lon) => {
  const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,ammonia&hourly=us_aqi,european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide,uv_index&timezone=auto&forecast_days=7`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,cloud_cover&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;

  const [aqRes, weatherRes] = await Promise.all([
    axios.get(aqUrl),
    axios.get(weatherUrl)
  ]);

  const currentAQ = aqRes.data.current || {};
  const currentUS_AQI = Math.round(currentAQ.us_aqi || 42);
  const currentEU_AQI = Math.round(currentAQ.european_aqi || 28);

  const getAqiCategory = (aqi) => {
    if (aqi <= 50) return { level: 'Good', index: aqi, category: 'good', color: '#2E7D32', bgColor: '#E8F5E9', badgeClass: 'badge-good', description: 'Air quality is clean and healthy. Little to no risk for any group.', generalAdvice: 'Ideal for all outdoor activities and exercise.', maskRequired: false, windowsOpen: true, outdoorExercise: 'Safe', airPurifier: 'Off' };
    if (aqi <= 100) return { level: 'Moderate', index: aqi, category: 'moderate', color: '#B78103', bgColor: '#FFF9C4', badgeClass: 'badge-moderate', description: 'Air quality is acceptable. Very sensitive individuals may experience minor irritation.', generalAdvice: 'Enjoy normal activities. Sensitive groups should monitor for symptoms.', maskRequired: false, windowsOpen: true, outdoorExercise: 'Acceptable', airPurifier: 'Optional' };
    if (aqi <= 150) return { level: 'Unhealthy for Sensitive Groups', index: aqi, category: 'sensitive-unhealthy', color: '#D85A20', bgColor: '#FFE0B2', badgeClass: 'badge-sensitive', description: 'Sensitive groups (asthma, children, elderly) may experience health effects.', generalAdvice: 'Sensitive individuals should limit prolonged outdoor exertion.', maskRequired: true, windowsOpen: false, outdoorExercise: 'Limit Exertion', airPurifier: 'Recommended' };
    if (aqi <= 200) return { level: 'Unhealthy', index: aqi, category: 'unhealthy', color: '#C62828', bgColor: '#FFCDD2', badgeClass: 'badge-unhealthy', description: 'Everyone may begin to experience health effects; sensitive groups more severely.', generalAdvice: 'Avoid outdoor exercise. Wear a protective mask if going outside.', maskRequired: true, windowsOpen: false, outdoorExercise: 'Avoid', airPurifier: 'Turn On High' };
    if (aqi <= 300) return { level: 'Very Unhealthy', index: aqi, category: 'very-unhealthy', color: '#7B1FA2', bgColor: '#E1BEE7', badgeClass: 'badge-very-unhealthy', description: 'Health alert: Significant health effects for the entire population.', generalAdvice: 'Stay indoors with windows tightly sealed and air purifiers operating.', maskRequired: true, windowsOpen: false, outdoorExercise: 'Strictly Prohibited', airPurifier: 'Essential' };
    return { level: 'Hazardous', index: aqi, category: 'hazardous', color: '#4E148C', bgColor: '#D1C4E9', badgeClass: 'badge-hazardous', description: 'Emergency conditions: The entire population is likely to be affected.', generalAdvice: 'Avoid all outdoor activity. Remain inside with air filtration.', maskRequired: true, windowsOpen: false, outdoorExercise: 'Hazardous', airPurifier: 'Essential (Max)' };
  };

  const pollutants = [
    { id: 'pm2_5', name: 'PM2.5', fullName: 'Fine Particulate Matter', value: currentAQ.pm2_5 ? Number(currentAQ.pm2_5.toFixed(1)) : 14.2, unit: 'µg/m³', whoLimit: 15, status: (currentAQ.pm2_5 || 14) > 35 ? 'Unhealthy' : (currentAQ.pm2_5 || 14) > 15 ? 'Moderate' : 'Good', percentageOfLimit: Math.round(((currentAQ.pm2_5 || 14) / 15) * 100), description: 'Microscopic particles ≤ 2.5 µm that penetrate deep into lungs.' },
    { id: 'pm10', name: 'PM10', fullName: 'Coarse Particulate Matter', value: currentAQ.pm10 ? Number(currentAQ.pm10.toFixed(1)) : 28.5, unit: 'µg/m³', whoLimit: 45, status: (currentAQ.pm10 || 28) > 100 ? 'Unhealthy' : (currentAQ.pm10 || 28) > 45 ? 'Moderate' : 'Good', percentageOfLimit: Math.round(((currentAQ.pm10 || 28) / 45) * 100), description: 'Inhalable dust and pollen particles ≤ 10 µm causing airway irritation.' },
    { id: 'nitrogen_dioxide', name: 'NO₂', fullName: 'Nitrogen Dioxide', value: currentAQ.nitrogen_dioxide ? Number(currentAQ.nitrogen_dioxide.toFixed(1)) : 19.4, unit: 'µg/m³', whoLimit: 25, status: (currentAQ.nitrogen_dioxide || 19) > 25 ? 'Moderate' : 'Good', percentageOfLimit: Math.round(((currentAQ.nitrogen_dioxide || 19) / 25) * 100), description: 'Emitted from vehicle combustion and industrial facilities.' },
    { id: 'ozone', name: 'O₃', fullName: 'Ground-Level Ozone', value: currentAQ.ozone ? Number(currentAQ.ozone.toFixed(1)) : 48.0, unit: 'µg/m³', whoLimit: 100, status: 'Good', percentageOfLimit: Math.round(((currentAQ.ozone || 48) / 100) * 100), description: 'Formed when pollutants react in sunlight.' },
    { id: 'sulphur_dioxide', name: 'SO₂', fullName: 'Sulfur Dioxide', value: currentAQ.sulphur_dioxide ? Number(currentAQ.sulphur_dioxide.toFixed(1)) : 7.2, unit: 'µg/m³', whoLimit: 40, status: 'Good', percentageOfLimit: Math.round(((currentAQ.sulphur_dioxide || 7) / 40) * 100), description: 'Combustion gas affecting respiratory health.' },
    { id: 'carbon_monoxide', name: 'CO', fullName: 'Carbon Monoxide', value: currentAQ.carbon_monoxide ? Number((currentAQ.carbon_monoxide / 1000).toFixed(2)) : 0.42, unit: 'mg/m³', whoLimit: 4, status: 'Good', percentageOfLimit: Math.round((((currentAQ.carbon_monoxide || 420) / 1000) / 4) * 100), description: 'Gas from fuel combustion reducing blood oxygen.' },
    { id: 'dust', name: 'Dust', fullName: 'Atmospheric Dust', value: currentAQ.dust ? Number(currentAQ.dust.toFixed(1)) : 9.5, unit: 'µg/m³', whoLimit: 50, status: 'Good', percentageOfLimit: Math.round(((currentAQ.dust || 9.5) / 50) * 100), description: 'Fine mineral dust suspended in the atmosphere.' },
    { id: 'ammonia', name: 'NH₃', fullName: 'Ammonia', value: currentAQ.ammonia ? Number(currentAQ.ammonia.toFixed(1)) : 2.4, unit: 'µg/m³', whoLimit: 20, status: 'Good', percentageOfLimit: Math.round(((currentAQ.ammonia || 2.4) / 20) * 100), description: 'Agricultural emissions forming secondary particles.' }
  ];

  const dominantPollutant = pollutants.reduce((prev, curr) => curr.percentageOfLimit > prev.percentageOfLimit ? curr : prev);

  const currentWeather = weatherRes.data.current || {};
  const hourlyAQ = aqRes.data.hourly || {};
  const hourlyWeather = weatherRes.data.hourly || {};

  const hourlyTrend = [];
  for (let i = 0; i < 24; i++) {
    hourlyTrend.push({
      time: hourlyAQ.time ? hourlyAQ.time[i] : `+${i}h`,
      usAqi: hourlyAQ.us_aqi ? Math.round(hourlyAQ.us_aqi[i]) : 35 + (i % 15),
      euAqi: hourlyAQ.european_aqi ? Math.round(hourlyAQ.european_aqi[i]) : 25,
      pm2_5: hourlyAQ.pm2_5 ? Number(hourlyAQ.pm2_5[i].toFixed(1)) : 12,
      pm10: hourlyAQ.pm10 ? Number(hourlyAQ.pm10[i].toFixed(1)) : 22,
      ozone: hourlyAQ.ozone ? Number(hourlyAQ.ozone[i].toFixed(1)) : 38,
      temperature: hourlyWeather.temperature_2m ? Math.round(hourlyWeather.temperature_2m[i]) : 22,
      humidity: hourlyWeather.relative_humidity_2m ? hourlyWeather.relative_humidity_2m[i] : 50,
      windSpeed: hourlyWeather.wind_speed_10m ? Number(hourlyWeather.wind_speed_10m[i].toFixed(1)) : 10
    });
  }

  const dailyWeather = weatherRes.data.daily || {};
  const dailyForecast = [];
  for (let i = 0; i < 7; i++) {
    dailyForecast.push({
      date: dailyWeather.time ? dailyWeather.time[i] : `Day ${i+1}`,
      maxTemp: dailyWeather.temperature_2m_max ? Math.round(dailyWeather.temperature_2m_max[i]) : 26,
      minTemp: dailyWeather.temperature_2m_min ? Math.round(dailyWeather.temperature_2m_min[i]) : 16,
      condition: 'Pleasant / Clear',
      conditionIcon: 'Sun',
      uvIndexMax: dailyWeather.uv_index_max ? Number(dailyWeather.uv_index_max[i].toFixed(1)) : 5.0,
      sunrise: dailyWeather.sunrise ? dailyWeather.sunrise[i] : null,
      sunset: dailyWeather.sunset ? dailyWeather.sunset[i] : null,
      predictedAqi: Math.max(15, currentUS_AQI + (i % 3 === 0 ? 5 : -4)),
      aqiCategory: getAqiCategory(Math.max(15, currentUS_AQI + (i % 3 === 0 ? 5 : -4))).level
    });
  }

  return {
    success: true,
    coordinates: { lat, lon },
    timestamp: new Date().toISOString(),
    airQuality: {
      usAqi: currentUS_AQI,
      euAqi: currentEU_AQI,
      dominantPollutant,
      category: getAqiCategory(currentUS_AQI),
      pollutants
    },
    weather: {
      temperature: Number((currentWeather.temperature_2m || 23).toFixed(1)),
      apparentTemperature: Number((currentWeather.apparent_temperature || currentWeather.temperature_2m || 23).toFixed(1)),
      humidity: currentWeather.relative_humidity_2m || 52,
      pressure: Math.round(currentWeather.pressure_msl || currentWeather.surface_pressure || 1014),
      windSpeed: currentWeather.wind_speed_10m ? Number(currentWeather.wind_speed_10m.toFixed(1)) : 11,
      windDirection: currentWeather.wind_direction_10m || 120,
      cloudCover: currentWeather.cloud_cover || 15,
      precipitation: currentWeather.precipitation || 0,
      uvIndex: currentAQ.uv_index ? Number(currentAQ.uv_index.toFixed(1)) : 4.5,
      condition: 'Clear Sky',
      conditionIcon: 'Sun'
    },
    hourlyTrend,
    dailyForecast
  };
};

export const apiService = {
  // Air Quality & Weather API
  getAirQuality: async (lat, lon) => {
    try {
      const res = await apiClient.get(`/air-quality?lat=${lat}&lon=${lon}`);
      return res.data;
    } catch (err) {
      console.warn('Backend proxy unavailable, fetching directly from Open-Meteo API...', err.message);
      return await fetchDirectAirQualityAndWeather(lat, lon);
    }
  },

  // City Autocomplete Search
  searchLocations: async (query) => {
    try {
      const res = await apiClient.get(`/geocoding/search?q=${encodeURIComponent(query)}`);
      return res.data.results || [];
    } catch (err) {
      // Direct Geocoding fallback
      const directUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
      const res = await axios.get(directUrl);
      return (res.data.results || []).map(item => ({
        id: item.id || `${item.latitude}-${item.longitude}`,
        name: item.name,
        admin1: item.admin1 || '',
        country: item.country || '',
        lat: item.latitude,
        lon: item.longitude,
        formattedName: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`
      }));
    }
  },

  // Reverse Geocoding
  reverseGeocode: async (lat, lon) => {
    try {
      const res = await apiClient.get(`/geocoding/reverse?lat=${lat}&lon=${lon}`);
      return res.data.location;
    } catch (err) {
      try {
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12`;
        const res = await axios.get(nomUrl);
        const addr = res.data?.address || {};
        const name = addr.city || addr.town || addr.village || addr.county || 'Map Location';
        return {
          name,
          admin1: addr.state || '',
          country: addr.country || '',
          lat,
          lon,
          formattedName: `${name}${addr.country ? ', ' + addr.country : ''}`
        };
      } catch (e) {
        return {
          name: `Point (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          admin1: '',
          country: '',
          lat,
          lon,
          formattedName: `Point (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
        };
      }
    }
  },

  // Featured World Cities
  getFeaturedCities: async () => {
    try {
      const res = await apiClient.get('/geocoding/featured');
      return res.data.cities;
    } catch (err) {
      return [
        { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
        { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
        { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
        { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
        { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 }
      ];
    }
  },

  // City Comparison
  compareCities: async (locations) => {
    try {
      const res = await apiClient.post('/air-quality/compare', { locations });
      return res.data.comparison;
    } catch (err) {
      // Fallback comparative fetching
      return await Promise.all(
        locations.map(async (loc) => {
          const aq = await fetchDirectAirQualityAndWeather(loc.lat, loc.lon);
          return {
            name: loc.name,
            country: loc.country || '',
            lat: loc.lat,
            lon: loc.lon,
            aqi: aq.airQuality.usAqi,
            category: aq.airQuality.category.level,
            color: aq.airQuality.category.color,
            pm2_5: aq.airQuality.pollutants[0]?.value || 10,
            pm10: aq.airQuality.pollutants[1]?.value || 20,
            temperature: aq.weather.temperature,
            humidity: aq.weather.humidity,
            windSpeed: aq.weather.windSpeed
          };
        })
      );
    }
  },

  // Authentication & MongoDB User Operations
  login: async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    return res.data;
  },

  register: async (name, email, password) => {
    const res = await apiClient.post('/auth/register', { name, email, password });
    return res.data;
  },

  getProfile: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },

  // Favorites & Alerts
  getSavedLocations: async () => {
    const res = await apiClient.get('/user/saved-locations');
    return res.data.savedLocations;
  },

  addSavedLocation: async (location) => {
    const res = await apiClient.post('/user/saved-locations', location);
    return res.data.savedLocations;
  },

  removeSavedLocation: async (locationId) => {
    const res = await apiClient.delete(`/user/saved-locations/${locationId}`);
    return res.data.savedLocations;
  },

  updateAlertSettings: async (settings) => {
    const res = await apiClient.put('/user/alert-settings', settings);
    return res.data.alertSettings;
  }
};
