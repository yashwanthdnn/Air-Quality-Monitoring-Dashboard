import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Info, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { apiService } from '../services/api';

const AirQualityMap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const worldMarkersGroupRef = useRef(null);

  const { currentLocation, data, fetchMetrics } = useLocation();
  const [featuredCities, setFeaturedCities] = useState([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = currentLocation?.lat || 28.6139;
    const initialLon = currentLocation?.lon || 77.2090;

    // Create Map with light CartoDB Positron tiles (Warm, clean, non-blue)
    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 6,
      zoomControl: false,
      attributionControl: false
    });

    // CartoDB Positron Light Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Group for other world cities
    const worldGroup = L.layerGroup().addTo(map);
    worldMarkersGroupRef.current = worldGroup;

    // Click anywhere on map handler
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;
      
      // Temporary marker while fetching
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }

      try {
        const locationInfo = await apiService.reverseGeocode(lat, lng);
        fetchMetrics(lat, lng, locationInfo);
      } catch (err) {
        fetchMetrics(lat, lng);
      }
    });

    mapInstanceRef.current = map;
    setIsMapLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [fetchMetrics]);

  // Update Current Location Active Marker
  useEffect(() => {
    if (!mapInstanceRef.current || !currentLocation) return;

    const { lat, lon, name } = currentLocation;
    const aqi = data?.airQuality?.usAqi || 40;
    const aqiColor = data?.airQuality?.category?.color || '#2E7D32';

    // Fly to new center smoothly
    mapInstanceRef.current.flyTo([lat, lon], mapInstanceRef.current.getZoom(), {
      duration: 1.2,
      easeLinearity: 0.25
    });

    // Custom HTML Pin Marker with animated pulse ring
    const customIcon = L.divIcon({
      className: 'custom-aqi-marker',
      html: `
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: ${aqiColor};
            opacity: 0.25;
            animation: pulse-ring 1.8s infinite ease-out;
          "></div>
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${aqiColor};
            color: #FFFFFF;
            font-weight: 800;
            font-size: 13px;
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          ">
            ${aqi}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]).setIcon(customIcon);
    } else {
      markerRef.current = L.marker([lat, lon], { icon: customIcon }).addTo(mapInstanceRef.current);
    }

    // Popup content
    const popupContent = `
      <div style="padding: 6px; text-align: center; min-width: 140px;">
        <strong style="font-size: 14px; color: #1E232A;">${name}</strong>
        <div style="margin: 4px 0; font-size: 12px; color: #4F5D6B;">
          AQI: <strong style="color: ${aqiColor};">${aqi}</strong> (${data?.airQuality?.category?.level || 'Active'})
        </div>
        <div style="font-size: 11px; color: #8291A0;">
          Temp: ${data?.weather?.temperature || '--'}°C
        </div>
      </div>
    `;
    markerRef.current.bindPopup(popupContent);
  }, [currentLocation, data]);

  // Load World Cities Hotspots on Map
  useEffect(() => {
    const loadHotspots = async () => {
      if (!worldMarkersGroupRef.current) return;
      const cities = await apiService.getFeaturedCities();
      setFeaturedCities(cities);

      worldMarkersGroupRef.current.clearLayers();

      cities.forEach((city) => {
        // Simple subtle circular city node
        const cityIcon = L.divIcon({
          className: 'city-hotspot-pin',
          html: `
            <div style="
              width: 14px;
              height: 14px;
              background: #2E7D32;
              border-radius: 50%;
              border: 2px solid #FFFFFF;
              box-shadow: 0 2px 6px rgba(0,0,0,0.2);
              cursor: pointer;
            "></div>
          `,
          iconSize: [14, 14],
          iconAnchor: [7, 7]
        });

        const m = L.marker([city.lat, city.lon], { icon: cityIcon });
        m.bindTooltip(`<b>${city.name}</b>, ${city.country}<br/><span style="font-size: 10px; color: #666;">Click to inspect</span>`, {
          direction: 'top'
        });
        m.on('click', () => {
          fetchMetrics(city.lat, city.lon, city);
        });

        worldMarkersGroupRef.current.addLayer(m);
      });
    };

    if (isMapLoaded) {
      loadHotspots();
    }
  }, [isMapLoaded, fetchMetrics]);

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Interactive Global Air Quality Map
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Click anywhere across continents, oceans, or cities to instantly sample atmospheric metrics
          </p>
        </div>

        {/* Map Legend */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--bg-card)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--aqi-good)' }} /> Good
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--aqi-moderate)' }} /> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--aqi-sensitive)' }} /> Sensitive
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--aqi-unhealthy)' }} /> Unhealthy
          </span>
        </div>
      </div>

      {/* Map Card Container */}
      <div className="glass-card" style={{ padding: 6, position: 'relative', overflow: 'hidden' }}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '420px',
            borderRadius: 'var(--radius-md)',
            zIndex: 10
          }}
        />

        {/* Floating Instruction Pill */}
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          padding: '8px 14px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <MapPin size={14} color="var(--brand-primary)" />
          <span>Click anywhere on the map to inspect live AQI</span>
        </div>
      </div>
    </section>
  );
};

export default AirQualityMap;
