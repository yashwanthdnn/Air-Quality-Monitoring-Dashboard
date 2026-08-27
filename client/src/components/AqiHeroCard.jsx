import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Wind, 
  Smile, 
  Frown, 
  Activity, 
  DoorOpen, 
  DoorClosed, 
  Home,
  RefreshCw
} from 'lucide-react';
import ThreeAtmosphere from './ThreeAtmosphere';
import { useLocation } from '../context/LocationContext';

const AqiHeroCard = ({ data, loading, onRefresh }) => {
  const { currentLocation, aqiStandard } = useLocation();

  if (loading || !data) {
    return (
      <div className="glass-card" style={{ padding: '36px', minHeight: 340, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: '4px solid var(--border-subtle)',
          borderTopColor: 'var(--brand-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: 16, color: 'var(--text-muted)', fontWeight: 600 }}>
          Synthesizing real-time atmospheric & particulate sensor streams...
        </p>
      </div>
    );
  }

  const { airQuality, weather } = data;
  const aqiValue = aqiStandard === 'US' ? airQuality.usAqi : airQuality.euAqi;
  const category = airQuality.category;
  const dominant = airQuality.dominantPollutant;

  // Calculate circular gauge offset (max 300 scale)
  const maxScale = aqiStandard === 'US' ? 300 : 100;
  const strokeDashoffset = Math.max(0, 440 - (440 * Math.min(aqiValue, maxScale)) / maxScale);

  return (
    <div className="glass-card hero-grid" style={{
      padding: '28px 32px',
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 30,
      position: 'relative',
      overflow: 'hidden',
      borderTop: `4px solid ${category.color}`
    }}>
      {/* Left Column: AQI Metrics & Advisories */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        
        {/* Top Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${category.badgeClass}`} style={{ fontSize: '0.88rem', padding: '6px 16px' }}>
                <span className="pulse-dot" style={{ background: category.color }} />
                {category.level}
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, background: 'var(--bg-card-subtle)', padding: '4px 10px', borderRadius: 'var(--radius-full)' }}>
                {aqiStandard === 'US' ? 'US EPA Standard' : 'European CAQI'}
              </span>
            </div>

            <button
              onClick={onRefresh}
              className="btn btn-secondary btn-icon"
              title="Refresh real-time data"
              style={{ width: 34, height: 34 }}
            >
              <RefreshCw size={15} color="var(--text-muted)" />
            </button>
          </div>

          {/* Location Title & AQI Number Display */}
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            {currentLocation?.name || 'Selected Location'}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: 20 }}>
            {currentLocation?.admin1 ? `${currentLocation.admin1}, ` : ''}{currentLocation?.country || 'Earth'} • Coordinates: {currentLocation?.lat.toFixed(3)}°N, {currentLocation?.lon.toFixed(3)}°E
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 16 }}>
            <div style={{
              fontSize: '4.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              lineHeight: 1,
              color: category.color,
              letterSpacing: '-0.04em'
            }}>
              {aqiValue}
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Air Quality Index (AQI)
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Primary Factor: <strong style={{ color: 'var(--text-primary)' }}>{dominant?.name} ({dominant?.fullName})</strong>
              </div>
            </div>
          </div>

          {/* General Summary Text */}
          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            borderLeft: `4px solid ${category.color}`,
            marginBottom: 22
          }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5, fontWeight: 500 }}>
              {category.generalAdvice}
            </p>
          </div>
        </div>

        {/* 4 Actionable Health Guidance Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: 12
        }}>
          {/* Tile 1: Mask */}
          <div style={{
            background: '#FFFFFF',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              <ShieldCheck size={14} color="var(--brand-primary)" />
              <span>Face Mask</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: category.maskRequired ? 'var(--aqi-unhealthy)' : 'var(--brand-primary)' }}>
              {category.maskRequired ? 'Recommended' : 'Not Required'}
            </div>
          </div>

          {/* Tile 2: Windows */}
          <div style={{
            background: '#FFFFFF',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              {category.windowsOpen ? <DoorOpen size={14} color="var(--brand-primary)" /> : <DoorClosed size={14} color="var(--aqi-unhealthy)" />}
              <span>Windows</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: category.windowsOpen ? 'var(--brand-primary)' : 'var(--aqi-unhealthy)' }}>
              {category.windowsOpen ? 'Open & Ventilate' : 'Keep Closed'}
            </div>
          </div>

          {/* Tile 3: Outdoor Workout */}
          <div style={{
            background: '#FFFFFF',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              <Activity size={14} color="var(--brand-warm)" />
              <span>Exercise</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {category.outdoorExercise}
            </div>
          </div>

          {/* Tile 4: Air Purifier */}
          <div style={{
            background: '#FFFFFF',
            padding: '12px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
              <Home size={14} color="var(--brand-terracotta)" />
              <span>Air Purifier</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {category.airPurifier}
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: 3D Interactive Atmosphere Globe & Circular Radial Meter */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, rgba(250, 247, 242, 0.7) 0%, rgba(245, 239, 235, 0.9) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        border: '1px solid var(--border-subtle)',
        position: 'relative'
      }}>
        {/* Interactive 3D Canvas */}
        <ThreeAtmosphere aqi={aqiValue} category={category.category} />

        <div style={{
          marginTop: 10,
          textAlign: 'center',
          background: '#FFFFFF',
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: category.color }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Atmospheric Particle Field Simulation
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            (Interactive 3D)
          </span>
        </div>
      </div>

    </div>
  );
};

export default AqiHeroCard;
