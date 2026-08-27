import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const LocationContext = createContext(null);

// Default starting location (Clean international capital / New Delhi / London)
const DEFAULT_LOCATION = {
  name: 'New Delhi',
  admin1: 'Delhi',
  country: 'India',
  lat: 28.6139,
  lon: 77.2090,
  formattedName: 'New Delhi, Delhi, India'
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aqiStandard, setAqiStandard] = useState('US'); // 'US' | 'EU'
  const [tempUnit, setTempUnit] = useState('C'); // 'C' | 'F'
  const [isAutoLocating, setIsAutoLocating] = useState(false);
  const [locationPermission, setLocationPermission] = useState('prompt');

  // Background Scenery Preferences
  const [bgTheme, setBgThemeState] = useState(() => {
    return localStorage.getItem('aeropulse_bg_theme') || 'auto';
  });
  const [bgBlur, setBgBlurState] = useState(() => {
    const saved = localStorage.getItem('aeropulse_bg_blur');
    return saved !== null ? Number(saved) : 2;
  });
  const [bgDim, setBgDimState] = useState(() => {
    const saved = localStorage.getItem('aeropulse_bg_dim');
    return saved !== null ? Number(saved) : 0.42;
  });

  const setBgTheme = (theme) => {
    setBgThemeState(theme);
    localStorage.setItem('aeropulse_bg_theme', theme);
  };

  const setBgBlur = (blur) => {
    setBgBlurState(blur);
    localStorage.setItem('aeropulse_bg_blur', blur);
  };

  const setBgDim = (dim) => {
    setBgDimState(dim);
    localStorage.setItem('aeropulse_bg_dim', dim);
  };

  // Fetch AQI & Weather for a specific coordinate
  const fetchMetrics = useCallback(async (lat, lon, locationInfo = null) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAirQuality(lat, lon);
      
      let finalLocation = locationInfo;
      if (!finalLocation || !finalLocation.name) {
        const reverseLoc = await apiService.reverseGeocode(lat, lon);
        finalLocation = reverseLoc;
      }

      setCurrentLocation({
        name: finalLocation.name || 'Selected Location',
        admin1: finalLocation.admin1 || '',
        country: finalLocation.country || '',
        lat,
        lon,
        formattedName: finalLocation.formattedName || `${finalLocation.name || 'Location'}`
      });

      setData(response);
    } catch (err) {
      console.error('Failed to load air quality:', err);
      setError('Unable to fetch air quality data. Please check connection or try another location.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Automatic Geolocation Detection
  const detectUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsAutoLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const locInfo = await apiService.reverseGeocode(latitude, longitude);
          await fetchMetrics(latitude, longitude, locInfo);
          setLocationPermission('granted');
        } catch (err) {
          await fetchMetrics(latitude, longitude);
        } finally {
          setIsAutoLocating(false);
        }
      },
      (geoError) => {
        console.warn('Geolocation access rejected/failed:', geoError.message);
        setLocationPermission('denied');
        setIsAutoLocating(false);
        // Fallback to default location
        fetchMetrics(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [fetchMetrics]);

  // Initial load: Attempt auto-location detection, fallback cleanly to default
  useEffect(() => {
    detectUserLocation();
  }, [detectUserLocation]);

  const setLocation = (loc) => {
    fetchMetrics(loc.lat, loc.lon, loc);
  };

  const refreshData = () => {
    if (currentLocation) {
      fetchMetrics(currentLocation.lat, currentLocation.lon, currentLocation);
    }
  };

  return (
    <LocationContext.Provider value={{
      currentLocation,
      data,
      loading,
      error,
      aqiStandard,
      setAqiStandard,
      tempUnit,
      setTempUnit,
      isAutoLocating,
      locationPermission,
      detectUserLocation,
      setLocation,
      fetchMetrics,
      refreshData,
      bgTheme,
      setBgTheme,
      bgBlur,
      setBgBlur,
      bgDim,
      setBgDim
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
