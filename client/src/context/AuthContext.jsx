import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('aeropulse_token') || null);
  const [loading, setLoading] = useState(true);
  const [savedLocations, setSavedLocations] = useState(() => {
    try {
      const cached = localStorage.getItem('aeropulse_saved_locs');
      return cached ? JSON.parse(cached) : [
        { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, customLabel: 'Tokyo HQ' },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, customLabel: 'Manhattan' },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278, customLabel: 'City Center' }
      ];
    } catch {
      return [];
    }
  });

  // Verify and fetch authenticated profile on start
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await apiService.getProfile();
          setUser(profile);
          if (profile.savedLocations && profile.savedLocations.length > 0) {
            setSavedLocations(profile.savedLocations);
            localStorage.setItem('aeropulse_saved_locs', JSON.stringify(profile.savedLocations));
          }
        } catch (err) {
          console.warn('Session expired or offline profile verification fallback.');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Sync saved locations to localStorage
  useEffect(() => {
    localStorage.setItem('aeropulse_saved_locs', JSON.stringify(savedLocations));
  }, [savedLocations]);

  const login = async (email, password) => {
    const data = await apiService.login(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('aeropulse_token', data.token);
    if (data.user.savedLocations) {
      setSavedLocations(data.user.savedLocations);
    }
    return data;
  };

  const register = async (name, email, password) => {
    const data = await apiService.register(name, email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('aeropulse_token', data.token);
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aeropulse_token');
  };

  const addLocation = async (location) => {
    if (user && token) {
      try {
        const updated = await apiService.addSavedLocation(location);
        setSavedLocations(updated);
        return updated;
      } catch (err) {
        console.warn('Could not sync with MongoDB, saving locally:', err.message);
      }
    }
    
    // Local state fallback
    const exists = savedLocations.some(
      l => Math.abs(l.lat - location.lat) < 0.05 && Math.abs(l.lon - location.lon) < 0.05
    );
    if (!exists) {
      const updated = [...savedLocations, { ...location, _id: Date.now().toString() }];
      setSavedLocations(updated);
      return updated;
    }
    return savedLocations;
  };

  const removeLocation = async (locationId) => {
    if (user && token) {
      try {
        const updated = await apiService.removeSavedLocation(locationId);
        setSavedLocations(updated);
        return updated;
      } catch (err) {
        console.warn('Could not remove from MongoDB, removing locally:', err.message);
      }
    }

    const updated = savedLocations.filter(
      l => (l._id || `${l.lat}-${l.lon}`) !== locationId && l.name !== locationId
    );
    setSavedLocations(updated);
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      savedLocations,
      login,
      register,
      logout,
      addLocation,
      removeLocation
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
