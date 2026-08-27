const express = require('express');
const router = express.Router();
const axios = require('axios');

// Popular global cities for instant map exploration
const FEATURED_CITIES = [
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'New Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 }
];

// @route   GET /api/geocoding/featured
// @desc    Get featured world cities
router.get('/featured', (req, res) => {
  res.json({ success: true, cities: FEATURED_CITIES });
});

// @route   GET /api/geocoding/search
// @desc    Search for cities / locations globally with autocomplete
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    // Use Open-Meteo Geocoding API (Fast, Free, accurate)
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=10&language=en&format=json`;
    
    const response = await axios.get(url, { timeout: 7000 });
    const results = (response.data.results || []).map(item => ({
      id: item.id || `${item.latitude}-${item.longitude}`,
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || '',
      countryCode: item.country_code || '',
      lat: item.latitude,
      lon: item.longitude,
      timezone: item.timezone || 'auto',
      formattedName: `${item.name}${item.admin1 ? ', ' + item.admin1 : ''}${item.country ? ', ' + item.country : ''}`
    }));

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Geocoding search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search locations',
      error: error.message
    });
  }
});

// @route   GET /api/geocoding/reverse
// @desc    Reverse geocode coordinates into a human-readable location name
router.get('/reverse', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required'
      });
    }

    // Try Nominatim reverse geocode (with custom user agent)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12&addressdetails=1`;
    
    const response = await axios.get(nominatimUrl, {
      headers: {
        'User-Agent': 'AirQualityDashboardApp/1.0'
      },
      timeout: 6000
    });

    const data = response.data || {};
    const address = data.address || {};
    
    const cityName = address.city || address.town || address.village || address.municipality || address.county || address.suburb || 'Location Point';
    const stateName = address.state || address.region || '';
    const countryName = address.country || '';

    res.json({
      success: true,
      location: {
        name: cityName,
        admin1: stateName,
        country: countryName,
        lat,
        lon,
        formattedName: `${cityName}${stateName ? ', ' + stateName : ''}${countryName ? ', ' + countryName : ''}`
      }
    });
  } catch (error) {
    // Fallback if reverse geocode fails or rate limited
    res.json({
      success: true,
      location: {
        name: `Coordinates (${parseFloat(req.query.lat).toFixed(2)}°, ${parseFloat(req.query.lon).toFixed(2)}°)`,
        admin1: '',
        country: 'Global Map',
        lat: parseFloat(req.query.lat),
        lon: parseFloat(req.query.lon),
        formattedName: `Point (${parseFloat(req.query.lat).toFixed(2)}°, ${parseFloat(req.query.lon).toFixed(2)}°)`
      }
    });
  }
});

module.exports = router;
