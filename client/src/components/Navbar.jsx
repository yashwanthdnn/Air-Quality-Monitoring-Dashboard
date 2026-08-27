import React, { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  MapPin, 
  Search, 
  Navigation, 
  Bookmark, 
  BookmarkCheck, 
  User, 
  Layers, 
  HeartHandshake, 
  SlidersHorizontal,
  X,
  Check,
  Image as ImageIcon,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import confetti from 'canvas-confetti';

const Navbar = ({ onOpenAuth, onOpenCompare, onOpenHealthTips, onOpenAtmosphere }) => {
  const { 
    currentLocation, 
    setLocation, 
    detectUserLocation, 
    isAutoLocating,
    aqiStandard,
    setAqiStandard,
    tempUnit,
    setTempUnit,
    bgTheme
  } = useLocation();

  const { user, isAuthenticated, savedLocations, addLocation, removeLocation, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const searchRef = useRef(null);

  // Check if current location is saved in favorites
  useEffect(() => {
    if (!currentLocation) return;
    const found = savedLocations.some(
      loc => (Math.abs(loc.lat - currentLocation.lat) < 0.05 && Math.abs(loc.lon - currentLocation.lon) < 0.05) ||
             loc.name.toLowerCase() === currentLocation.name.toLowerCase()
    );
    setIsSaved(found);
  }, [currentLocation, savedLocations]);

  // Debounced search query
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await apiService.searchLocations(searchQuery);
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLocation = (loc) => {
    setLocation(loc);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleToggleFavorite = async () => {
    if (!currentLocation) return;

    if (isSaved) {
      const match = savedLocations.find(
        l => (Math.abs(l.lat - currentLocation.lat) < 0.05 && Math.abs(l.lon - currentLocation.lon) < 0.05) ||
             l.name.toLowerCase() === currentLocation.name.toLowerCase()
      );
      if (match) {
        await removeLocation(match._id || match.name);
      }
    } else {
      await addLocation({
        name: currentLocation.name,
        country: currentLocation.country,
        admin1: currentLocation.admin1,
        lat: currentLocation.lat,
        lon: currentLocation.lon,
        customLabel: currentLocation.name
      });
      // Fire subtle celebratory confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.1, x: 0.8 },
        colors: ['#2E7D32', '#D97706', '#D96B43']
      });
    }
  };

  return (
    <header className="glass-card" style={{ margin: '14px 0 20px 0', padding: '12px 20px', position: 'sticky', top: 12, zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2E7D32 0%, #43A047 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.25)',
            color: '#FFFFFF'
          }}>
            <Wind size={24} strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Aero<span style={{ color: 'var(--brand-primary)' }}>Pulse</span>
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
                Live
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              Atmospheric & Air Quality Intelligence
            </p>
          </div>
        </div>

        {/* Global Search Bar with Autocomplete */}
        <div ref={searchRef} style={{ position: 'relative', flex: '1 1 320px', maxWidth: 460 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: '#FFFFFF',
            borderRadius: 'var(--radius-full)',
            padding: '8px 16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: 10 }} />
            <input
              type="text"
              placeholder="Search city, region, or capital worldwide..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setShowSearchDropdown(true)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.92rem',
                color: 'var(--text-primary)',
                background: 'transparent'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-muted)' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {showSearchDropdown && (
            <div className="glass-card" style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              background: '#FFFFFF',
              maxHeight: 280,
              overflowY: 'auto',
              zIndex: 100,
              padding: 6
            }}>
              {isSearching ? (
                <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Searching global meteorological nodes...
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleSelectLocation(result)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <MapPin size={16} color="var(--brand-primary)" />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {result.name}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                        {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  No locations found. Try another city name.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          
          {/* Auto-Detect Geolocation Button */}
          <button
            onClick={detectUserLocation}
            disabled={isAutoLocating}
            className="btn btn-secondary"
            title="Auto-detect my current GPS coordinates"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Navigation size={15} color="var(--brand-primary)" style={{ animation: isAutoLocating ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isAutoLocating ? 'Detecting...' : 'My Location'}</span>
          </button>

          {/* Save/Favorite Location Button */}
          <button
            onClick={handleToggleFavorite}
            className="btn btn-secondary"
            title={isSaved ? "Saved to Favorites" : "Save location to favorites"}
            style={{
              fontSize: '0.85rem',
              padding: '8px 14px',
              borderColor: isSaved ? 'var(--brand-primary)' : 'var(--border-subtle)',
              color: isSaved ? 'var(--brand-primary)' : 'var(--text-primary)'
            }}
          >
            {isSaved ? <BookmarkCheck size={16} color="var(--brand-primary)" /> : <Bookmark size={16} />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* Quick Compare Trigger */}
          <button
            onClick={onOpenCompare}
            className="btn btn-secondary"
            title="Compare multiple cities"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <TrendingUp size={15} color="var(--brand-warm)" />
            <span>Compare</span>
          </button>

          {/* Health Tips Trigger */}
          <button
            onClick={onOpenHealthTips}
            className="btn btn-secondary"
            title="Air quality health guidelines"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <HeartHandshake size={15} color="var(--brand-terracotta)" />
            <span>Advisory</span>
          </button>

          {/* Atmosphere Scenery Background Trigger */}
          <button
            onClick={onOpenAtmosphere}
            className="btn btn-secondary"
            title="Switch realistic background scenery & atmosphere"
            style={{ fontSize: '0.85rem', padding: '8px 14px', gap: 6 }}
          >
            <ImageIcon size={15} color="var(--brand-primary)" />
            <span>Scenery</span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              background: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
              padding: '1px 6px',
              borderRadius: 'var(--radius-full)',
              textTransform: 'capitalize'
            }}>
              {bgTheme || 'Auto'}
            </span>
          </button>

          {/* AQI Standard Toggle (US vs EU) */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: 3,
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setAqiStandard('US')}
              style={{
                padding: '4px 9px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: aqiStandard === 'US' ? '#FFFFFF' : 'transparent',
                color: aqiStandard === 'US' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: aqiStandard === 'US' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              US AQI
            </button>
            <button
              onClick={() => setAqiStandard('EU')}
              style={{
                padding: '4px 9px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: aqiStandard === 'EU' ? '#FFFFFF' : 'transparent',
                color: aqiStandard === 'EU' ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: aqiStandard === 'EU' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              EU CAQI
            </button>
          </div>

          {/* Temp Unit Toggle (°C / °F) */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: 3,
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => setTempUnit('C')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: tempUnit === 'C' ? '#FFFFFF' : 'transparent',
                color: tempUnit === 'C' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: tempUnit === 'C' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              °C
            </button>
            <button
              onClick={() => setTempUnit('F')}
              style={{
                padding: '4px 8px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: tempUnit === 'F' ? '#FFFFFF' : 'transparent',
                color: tempUnit === 'F' ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.75rem',
                cursor: 'pointer',
                boxShadow: tempUnit === 'F' ? 'var(--shadow-sm)' : 'none'
              }}
            >
              °F
            </button>
          </div>

          {/* User Auth Profile / Login Button */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '8px 14px' }}
              >
                <User size={15} />
                <span>{user?.name?.split(' ')[0] || 'Account'}</span>
              </button>

              {showUserMenu && (
                <div className="glass-card" style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: 220,
                  background: '#FFFFFF',
                  padding: 10,
                  zIndex: 100
                }}>
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  <div style={{ padding: '8px 0' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px' }}>
                      SAVED FAVORITES ({savedLocations.length})
                    </div>
                    {savedLocations.slice(0, 4).map((fav, idx) => (
                      <div
                        key={idx}
                        onClick={() => { setLocation(fav); setShowUserMenu(false); }}
                        style={{
                          padding: '6px 10px',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-subtle)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <span>{fav.name}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fav.country}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--aqi-unhealthy)',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      borderRadius: 6
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--aqi-unhealthy-bg)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 16px' }}
            >
              <User size={15} />
              <span>Sign In</span>
            </button>
          )}

        </div>
      </div>

      {/* Featured / Favorite Quick Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
        paddingTop: 8,
        borderTop: '1px solid rgba(232, 226, 217, 0.6)',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none'
      }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Quick Hubs:
        </span>
        {savedLocations.map((fav, i) => (
          <button
            key={i}
            onClick={() => setLocation(fav)}
            style={{
              background: (currentLocation && currentLocation.name.toLowerCase() === fav.name.toLowerCase()) ? 'var(--brand-primary-light)' : 'var(--bg-card)',
              color: (currentLocation && currentLocation.name.toLowerCase() === fav.name.toLowerCase()) ? 'var(--brand-primary)' : 'var(--text-secondary)',
              border: `1px solid ${(currentLocation && currentLocation.name.toLowerCase() === fav.name.toLowerCase()) ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              padding: '3px 12px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease'
            }}
          >
            <MapPin size={11} />
            <span>{fav.name}</span>
          </button>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
