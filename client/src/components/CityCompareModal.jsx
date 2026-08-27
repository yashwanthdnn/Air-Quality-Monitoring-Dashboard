import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, TrendingUp } from 'lucide-react';
import { apiService } from '../services/api';
import { useLocation } from '../context/LocationContext';

const CityCompareModal = ({ isOpen, onClose }) => {
  const { currentLocation, setLocation } = useLocation();
  const [selectedCities, setSelectedCities] = useState([]);
  const [comparisonData, setComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Initialize with Current Location + 2 defaults
  useEffect(() => {
    if (isOpen) {
      const initial = [
        { name: currentLocation?.name || 'Tokyo', country: currentLocation?.country || 'Japan', lat: currentLocation?.lat || 35.6762, lon: currentLocation?.lon || 139.6503 },
        { name: 'London', country: 'United Kingdom', lat: 51.5074, lon: -0.1278 },
        { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060 }
      ];
      setSelectedCities(initial);
      runComparison(initial);
    }
  }, [isOpen, currentLocation]);

  const runComparison = async (cities) => {
    setLoading(true);
    try {
      const res = await apiService.compareCities(cities);
      setComparisonData(res);
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const results = await apiService.searchLocations(query);
    setSearchResults(results);
  };

  const handleAddCity = (city) => {
    if (selectedCities.length >= 4) return;
    const updated = [...selectedCities, city];
    setSelectedCities(updated);
    setSearchQuery('');
    setSearchResults([]);
    runComparison(updated);
  };

  const handleRemoveCity = (idx) => {
    if (selectedCities.length <= 1) return;
    const updated = selectedCities.filter((_, i) => i !== idx);
    setSelectedCities(updated);
    runComparison(updated);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(30, 35, 42, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: 20
    }}>
      <div className="glass-card" style={{
        background: '#FFFFFF',
        width: '100%',
        maxWidth: 860,
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <TrendingUp size={22} color="var(--brand-warm)" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Global Air Quality Comparison
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Compare real-time pollution metrics, PM2.5, and temperatures across global cities
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: 36, height: 36 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Add City Search Bar */}
        {selectedCities.length < 4 && (
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{
              display: 'flex',
              background: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              border: '1px solid var(--border-subtle)'
            }}>
              <input
                type="text"
                placeholder="Add another city to compare (e.g. Paris, Delhi, Sydney)..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: '0.88rem',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {searchResults.length > 0 && (
              <div className="glass-card" style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: '#FFFFFF',
                zIndex: 10,
                maxHeight: 180,
                overflowY: 'auto',
                padding: 4
              }}>
                {searchResults.map((res) => (
                  <div
                    key={res.id}
                    onClick={() => handleAddCity(res)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '0.86rem',
                      fontWeight: 600,
                      borderRadius: 6
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {res.name}, {res.country}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison Cards Grid */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Comparing meteorological nodes in real-time...
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.max(selectedCities.length, 1)}, 1fr)`,
            gap: 16
          }}>
            {comparisonData.map((city, idx) => (
              <div
                key={idx}
                className="solid-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${city.color || 'var(--brand-primary)'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {city.name}
                      </h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {city.country}
                      </div>
                    </div>

                    {selectedCities.length > 1 && (
                      <button
                        onClick={() => handleRemoveCity(idx)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* AQI Big Display */}
                  <div style={{ margin: '14px 0 10px 0' }}>
                    <div style={{
                      fontSize: '2.8rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      color: city.color || 'var(--brand-primary)',
                      lineHeight: 1
                    }}>
                      {city.aqi}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: city.color }}>
                      {city.category}
                    </div>
                  </div>

                  {/* Metrics Table */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>PM2.5</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{city.pm2_5} µg/m³</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>PM10</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{city.pm10} µg/m³</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', paddingBottom: 6, borderBottom: '1px solid var(--border-subtle)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Temp</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{city.temperature}°C</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Wind</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{city.windSpeed} km/h</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLocation(city);
                    onClose();
                  }}
                  className="btn btn-secondary"
                  style={{ marginTop: 18, fontSize: '0.82rem', padding: '8px 12px', width: '100%' }}
                >
                  <span>Select City</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityCompareModal;
