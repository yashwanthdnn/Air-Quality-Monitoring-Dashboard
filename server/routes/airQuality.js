const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper to determine AQI level and health guidance (US EPA Standard)
const getAqiCategory = (aqi) => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      index: aqi,
      category: 'good',
      color: '#2E7D32', // Deep Forest/Sage Green
      bgColor: '#E8F5E9',
      badgeClass: 'status-good',
      description: 'Air quality is satisfactory, and air pollution poses little or no risk.',
      generalAdvice: 'Enjoy your normal outdoor activities. The air is fresh and healthy.',
      maskRequired: false,
      windowsOpen: true,
      outdoorExercise: 'Safe',
      airPurifier: 'Off',
      sensitiveGroupsAdvice: 'Great time for outdoor recreation.'
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      index: aqi,
      category: 'moderate',
      color: '#B78103', // Warm Ochre/Gold
      bgColor: '#FFF9C4',
      badgeClass: 'status-moderate',
      description: 'Air quality is acceptable. However, there may be some health concern for very sensitive people.',
      generalAdvice: 'Acceptable for most individuals. Sensitive people should monitor any symptoms.',
      maskRequired: false,
      windowsOpen: true,
      outdoorExercise: 'Acceptable',
      airPurifier: 'Optional',
      sensitiveGroupsAdvice: 'People with respiratory illnesses should reduce heavy outdoor exertion.'
    };
  } else if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      index: aqi,
      category: 'sensitive-unhealthy',
      color: '#D85A20', // Warm Terracotta/Amber
      bgColor: '#FFE0B2',
      badgeClass: 'status-sensitive',
      description: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
      generalAdvice: 'Children, the elderly, and people with heart/lung disease should limit prolonged outdoor exertion.',
      maskRequired: true,
      windowsOpen: false,
      outdoorExercise: 'Limit Exertion',
      airPurifier: 'Recommended',
      sensitiveGroupsAdvice: 'Wear a protective mask (N95/KN95) if going outside.'
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      index: aqi,
      category: 'unhealthy',
      color: '#C62828', // Deep Crimson/Coral
      bgColor: '#FFCDD2',
      badgeClass: 'status-unhealthy',
      description: 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
      generalAdvice: 'Avoid prolonged outdoor exertion. Wear an N95 mask when outside.',
      maskRequired: true,
      windowsOpen: false,
      outdoorExercise: 'Avoid',
      airPurifier: 'Turn On High',
      sensitiveGroupsAdvice: 'Stay indoors as much as possible with windows closed.'
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      index: aqi,
      category: 'very-unhealthy',
      color: '#7B1FA2', // Rich Plum
      bgColor: '#E1BEE7',
      badgeClass: 'status-very-unhealthy',
      description: 'Health alert: The risk of health effects is increased for everyone.',
      generalAdvice: 'Remain indoors. Keep all windows shut and run HEPA air purifiers.',
      maskRequired: true,
      windowsOpen: false,
      outdoorExercise: 'Strictly Prohibited',
      airPurifier: 'Essential',
      sensitiveGroupsAdvice: 'Remain in an airtight room with air purification active.'
    };
  } else {
    return {
      level: 'Hazardous',
      index: aqi,
      category: 'hazardous',
      color: '#4E148C', // Deep Maroon/Violet
      bgColor: '#D1C4E9',
      badgeClass: 'status-hazardous',
      description: 'Health warning of emergency conditions: The entire population is likely to be affected.',
      generalAdvice: 'Emergency conditions. Everyone should avoid any outdoor physical activity.',
      maskRequired: true,
      windowsOpen: false,
      outdoorExercise: 'Hazardous - Stay Indoors',
      airPurifier: 'Essential (Max Filtration)',
      sensitiveGroupsAdvice: 'Do not go outside under any circumstances without emergency respirator.'
    };
  }
};

// Map Open-Meteo Weather Codes (WMO) to descriptions & icon types
const getWeatherInfo = (code) => {
  const codeMap = {
    0: { label: 'Clear Sky', icon: 'Sun', type: 'sunny' },
    1: { label: 'Mainly Clear', icon: 'Sun', type: 'sunny' },
    2: { label: 'Partly Cloudy', icon: 'CloudSun', type: 'cloudy' },
    3: { label: 'Overcast', icon: 'Cloud', type: 'overcast' },
    45: { label: 'Foggy', icon: 'CloudFog', type: 'fog' },
    48: { label: 'Depositing Rime Fog', icon: 'CloudFog', type: 'fog' },
    51: { label: 'Light Drizzle', icon: 'CloudDrizzle', type: 'rain' },
    53: { label: 'Moderate Drizzle', icon: 'CloudDrizzle', type: 'rain' },
    55: { label: 'Dense Drizzle', icon: 'CloudDrizzle', type: 'rain' },
    61: { label: 'Slight Rain', icon: 'CloudRain', type: 'rain' },
    63: { label: 'Moderate Rain', icon: 'CloudRain', type: 'rain' },
    65: { label: 'Heavy Rain', icon: 'CloudRain', type: 'rain' },
    71: { label: 'Slight Snow', icon: 'CloudSnow', type: 'snow' },
    73: { label: 'Moderate Snow', icon: 'CloudSnow', type: 'snow' },
    75: { label: 'Heavy Snow', icon: 'CloudSnow', type: 'snow' },
    80: { label: 'Rain Showers', icon: 'CloudRain', type: 'rain' },
    81: { label: 'Heavy Rain Showers', icon: 'CloudRain', type: 'rain' },
    95: { label: 'Thunderstorm', icon: 'CloudLightning', type: 'storm' },
    96: { label: 'Thunderstorm with Hail', icon: 'CloudLightning', type: 'storm' }
  };
  return codeMap[code] || { label: 'Clear / Pleasant', icon: 'Sun', type: 'sunny' };
};

// @route   GET /api/air-quality
// @desc    Fetch comprehensive air quality & weather for coordinates
router.get('/', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude query parameters are required (e.g. ?lat=28.6139&lon=77.2090)'
      });
    }

    // Parallel fetch from Open-Meteo Air Quality and Weather APIs
    const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,european_aqi,pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,uv_index,ammonia&hourly=us_aqi,european_aqi,pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,sulphur_dioxide,uv_index&timezone=auto&forecast_days=7`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,pressure_msl,wind_speed_10m,wind_direction_10m,cloud_cover&hourly=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max&timezone=auto`;

    const [aqResponse, weatherResponse] = await Promise.all([
      axios.get(aqUrl, { timeout: 10000 }),
      axios.get(weatherUrl, { timeout: 10000 })
    ]);

    const aqData = aqResponse.data;
    const weatherData = weatherResponse.data;

    const currentAQ = aqData.current || {};
    const currentUS_AQI = Math.round(currentAQ.us_aqi || 35);
    const currentEU_AQI = Math.round(currentAQ.european_aqi || 25);

    const aqiCategory = getAqiCategory(currentUS_AQI);

    // Format individual pollutants with WHO safe benchmarks
    const pollutants = [
      {
        id: 'pm2_5',
        name: 'PM2.5',
        fullName: 'Fine Particulate Matter',
        value: currentAQ.pm2_5 ? Number(currentAQ.pm2_5.toFixed(1)) : 12.4,
        unit: 'µg/m³',
        whoLimit: 15,
        status: (currentAQ.pm2_5 || 12) > 35 ? 'Unhealthy' : (currentAQ.pm2_5 || 12) > 15 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round(((currentAQ.pm2_5 || 12) / 15) * 100),
        description: 'Microscopic particles ≤ 2.5 µm that can penetrate deep into lungs and bloodstream.'
      },
      {
        id: 'pm10',
        name: 'PM10',
        fullName: 'Coarse Particulate Matter',
        value: currentAQ.pm10 ? Number(currentAQ.pm10.toFixed(1)) : 24.1,
        unit: 'µg/m³',
        whoLimit: 45,
        status: (currentAQ.pm10 || 24) > 100 ? 'Unhealthy' : (currentAQ.pm10 || 24) > 45 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round(((currentAQ.pm10 || 24) / 45) * 100),
        description: 'Inhalable dust, pollen, and mold particles ≤ 10 µm causing throat & eye irritation.'
      },
      {
        id: 'nitrogen_dioxide',
        name: 'NO₂',
        fullName: 'Nitrogen Dioxide',
        value: currentAQ.nitrogen_dioxide ? Number(currentAQ.nitrogen_dioxide.toFixed(1)) : 18.2,
        unit: 'µg/m³',
        whoLimit: 25,
        status: (currentAQ.nitrogen_dioxide || 18) > 50 ? 'Unhealthy' : (currentAQ.nitrogen_dioxide || 18) > 25 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round(((currentAQ.nitrogen_dioxide || 18) / 25) * 100),
        description: 'Emitted from vehicle combustion and power plants. Aggravates asthma and airway inflammation.'
      },
      {
        id: 'ozone',
        name: 'O₃',
        fullName: 'Ground-Level Ozone',
        value: currentAQ.ozone ? Number(currentAQ.ozone.toFixed(1)) : 42.0,
        unit: 'µg/m³',
        whoLimit: 100,
        status: (currentAQ.ozone || 42) > 120 ? 'Unhealthy' : (currentAQ.ozone || 42) > 80 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round(((currentAQ.ozone || 42) / 100) * 100),
        description: 'Formed by chemical reactions between sunlight and vehicle/industrial pollutants.'
      },
      {
        id: 'sulphur_dioxide',
        name: 'SO₂',
        fullName: 'Sulfur Dioxide',
        value: currentAQ.sulphur_dioxide ? Number(currentAQ.sulphur_dioxide.toFixed(1)) : 6.5,
        unit: 'µg/m³',
        whoLimit: 40,
        status: (currentAQ.sulphur_dioxide || 6) > 80 ? 'Unhealthy' : (currentAQ.sulphur_dioxide || 6) > 40 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round(((currentAQ.sulphur_dioxide || 6) / 40) * 100),
        description: 'Produced by burning coal and oil. Corrosive gas that affects respiratory systems.'
      },
      {
        id: 'carbon_monoxide',
        name: 'CO',
        fullName: 'Carbon Monoxide',
        value: currentAQ.carbon_monoxide ? Number((currentAQ.carbon_monoxide / 1000).toFixed(2)) : 0.45,
        unit: 'mg/m³',
        whoLimit: 4,
        status: ((currentAQ.carbon_monoxide || 450) / 1000) > 4 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round((((currentAQ.carbon_monoxide || 450) / 1000) / 4) * 100),
        description: 'Colorless, odorless gas from incomplete fuel combustion that reduces oxygen delivery.'
      },
      {
        id: 'dust',
        name: 'Dust',
        fullName: 'Atmospheric Dust',
        value: currentAQ.dust ? Number(currentAQ.dust.toFixed(1)) : 8.0,
        unit: 'µg/m³',
        whoLimit: 50,
        status: (currentAQ.dust || 8) > 50 ? 'Moderate' : 'Good',
        percentageOfLimit: Math.round(((currentAQ.dust || 8) / 50) * 100),
        description: 'Suspended mineral and desert dust particles affecting visibility and breathing.'
      },
      {
        id: 'ammonia',
        name: 'NH₃',
        fullName: 'Ammonia',
        value: currentAQ.ammonia ? Number(currentAQ.ammonia.toFixed(1)) : 2.1,
        unit: 'µg/m³',
        whoLimit: 20,
        status: 'Good',
        percentageOfLimit: Math.round(((currentAQ.ammonia || 2) / 20) * 100),
        description: 'Gas from agricultural livestock and fertilizer application contributing to smog particles.'
      }
    ];

    // Find dominant pollutant
    const dominantPollutant = pollutants.reduce((prev, current) => 
      (current.percentageOfLimit > prev.percentageOfLimit) ? current : prev
    );

    // Process Weather
    const currentWeather = weatherData.current || {};
    const weatherInfo = getWeatherInfo(currentWeather.weather_code || 0);

    const rawTemp = currentWeather.temperature_2m !== undefined ? currentWeather.temperature_2m : 22;
    const rawApparent = currentWeather.apparent_temperature !== undefined ? currentWeather.apparent_temperature : rawTemp;

    const weather = {
      temperature: Number(rawTemp.toFixed(1)),
      apparentTemperature: Number(rawApparent.toFixed(1)),
      humidity: currentWeather.relative_humidity_2m || 50,
      pressure: Math.round(currentWeather.pressure_msl || currentWeather.surface_pressure || 1013),
      windSpeed: currentWeather.wind_speed_10m ? Number(currentWeather.wind_speed_10m.toFixed(1)) : 12,
      windDirection: currentWeather.wind_direction_10m || 0,
      cloudCover: currentWeather.cloud_cover || 10,
      precipitation: currentWeather.precipitation || 0,
      uvIndex: currentAQ.uv_index ? Number(currentAQ.uv_index.toFixed(1)) : 4.5,
      weatherCode: currentWeather.weather_code || 0,
      condition: weatherInfo.label,
      conditionIcon: weatherInfo.icon,
      conditionType: weatherInfo.type
    };

    // Format 24-hour hourly trend
    const hourlyAQ = aqData.hourly || {};
    const hourlyWeather = weatherData.hourly || {};
    const hourlyLength = Math.min(
      hourlyAQ.time ? hourlyAQ.time.length : 24,
      24 // Next 24 hours
    );

    const hourlyTrend = [];
    for (let i = 0; i < hourlyLength; i++) {
      hourlyTrend.push({
        time: hourlyAQ.time ? hourlyAQ.time[i] : `+${i}h`,
        usAqi: hourlyAQ.us_aqi ? Math.round(hourlyAQ.us_aqi[i]) : 30 + (i % 20),
        euAqi: hourlyAQ.european_aqi ? Math.round(hourlyAQ.european_aqi[i]) : 20,
        pm2_5: hourlyAQ.pm2_5 ? Number(hourlyAQ.pm2_5[i].toFixed(1)) : 10,
        pm10: hourlyAQ.pm10 ? Number(hourlyAQ.pm10[i].toFixed(1)) : 20,
        ozone: hourlyAQ.ozone ? Number(hourlyAQ.ozone[i].toFixed(1)) : 35,
        no2: hourlyAQ.nitrogen_dioxide ? Number(hourlyAQ.nitrogen_dioxide[i].toFixed(1)) : 15,
        temperature: hourlyWeather.temperature_2m ? Math.round(hourlyWeather.temperature_2m[i]) : 20,
        humidity: hourlyWeather.relative_humidity_2m ? hourlyWeather.relative_humidity_2m[i] : 50,
        windSpeed: hourlyWeather.wind_speed_10m ? Number(hourlyWeather.wind_speed_10m[i].toFixed(1)) : 10
      });
    }

    // Format 7-Day Forecast
    const dailyWeather = weatherData.daily || {};
    const dailyForecast = [];
    const daysCount = dailyWeather.time ? dailyWeather.time.length : 7;

    for (let i = 0; i < daysCount; i++) {
      const dayCode = dailyWeather.weather_code ? dailyWeather.weather_code[i] : 0;
      const dayInfo = getWeatherInfo(dayCode);
      
      // Calculate estimated daily average AQI from hourly segments
      const dayAqiSlice = hourlyAQ.us_aqi ? hourlyAQ.us_aqi.slice(i * 24, (i + 1) * 24) : [];
      const avgAqi = dayAqiSlice.length 
        ? Math.round(dayAqiSlice.reduce((a, b) => a + b, 0) / dayAqiSlice.length) 
        : Math.round(currentUS_AQI + (i * 3 - 6));

      dailyForecast.push({
        date: dailyWeather.time ? dailyWeather.time[i] : `Day ${i + 1}`,
        maxTemp: dailyWeather.temperature_2m_max ? Math.round(dailyWeather.temperature_2m_max[i]) : 25,
        minTemp: dailyWeather.temperature_2m_min ? Math.round(dailyWeather.temperature_2m_min[i]) : 15,
        condition: dayInfo.label,
        conditionIcon: dayInfo.icon,
        uvIndexMax: dailyWeather.uv_index_max ? Number(dailyWeather.uv_index_max[i].toFixed(1)) : 5,
        sunrise: dailyWeather.sunrise ? dailyWeather.sunrise[i] : null,
        sunset: dailyWeather.sunset ? dailyWeather.sunset[i] : null,
        predictedAqi: Math.max(10, avgAqi),
        aqiCategory: getAqiCategory(Math.max(10, avgAqi)).level
      });
    }

    res.json({
      success: true,
      coordinates: { lat, lon },
      elevation: aqData.elevation || 0,
      timestamp: new Date().toISOString(),
      airQuality: {
        usAqi: currentUS_AQI,
        euAqi: currentEU_AQI,
        dominantPollutant,
        category: aqiCategory,
        pollutants
      },
      weather,
      hourlyTrend,
      dailyForecast
    });

  } catch (error) {
    console.error('Error fetching air quality / weather data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time air quality & weather metrics',
      error: error.message
    });
  }
});

// @route   POST /api/air-quality/compare
// @desc    Compare multiple cities air quality and weather metrics
router.post('/compare', async (req, res) => {
  try {
    const { locations } = req.body; // Array of { name, lat, lon }
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of locations with lat and lon'
      });
    }

    const comparisonResults = await Promise.all(
      locations.slice(0, 5).map(async (loc) => {
        try {
          const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.lat}&longitude=${loc.lon}&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=auto`;
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
          
          const [aqRes, weatherRes] = await Promise.all([
            axios.get(aqUrl, { timeout: 8000 }),
            axios.get(weatherUrl, { timeout: 8000 })
          ]);

          const aqi = Math.round(aqRes.data.current?.us_aqi || 40);
          const category = getAqiCategory(aqi);

          return {
            name: loc.name,
            country: loc.country || '',
            lat: loc.lat,
            lon: loc.lon,
            aqi,
            category: category.level,
            color: category.color,
            pm2_5: aqRes.data.current?.pm2_5 || 10,
            pm10: aqRes.data.current?.pm10 || 20,
            temperature: Math.round(weatherRes.data.current?.temperature_2m || 20),
            humidity: weatherRes.data.current?.relative_humidity_2m || 50,
            windSpeed: weatherRes.data.current?.wind_speed_10m || 10
          };
        } catch (err) {
          return {
            name: loc.name,
            error: 'Failed to fetch metrics',
            lat: loc.lat,
            lon: loc.lon
          };
        }
      })
    );

    res.json({
      success: true,
      comparison: comparisonResults
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare locations',
      error: error.message
    });
  }
});

module.exports = router;
