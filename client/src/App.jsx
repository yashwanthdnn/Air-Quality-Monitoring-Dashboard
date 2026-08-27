import React, { useState } from 'react';
import Navbar from './components/Navbar';
import AqiHeroCard from './components/AqiHeroCard';
import PollutantsGrid from './components/PollutantsGrid';
import WeatherWidget from './components/WeatherWidget';
import ForecastCharts from './components/ForecastCharts';
import AirQualityMap from './components/AirQualityMap';
import CityCompareModal from './components/CityCompareModal';
import HealthTipsModal from './components/HealthTipsModal';
import AuthModal from './components/AuthModal';
import AtmosphericBackground from './components/AtmosphericBackground';
import AtmosphereSelectorModal from './components/AtmosphereSelectorModal';
import { useLocation } from './context/LocationContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { Wind, Shield, Globe, HeartHandshake, Layers } from 'lucide-react';

function DashboardContent() {
  const { data, loading, error, refreshData } = useLocation();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isHealthTipsOpen, setIsHealthTipsOpen] = useState(false);
  const [isAtmosphereOpen, setIsAtmosphereOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      
      {/* 0. Realistic Atmospheric Background Scenery Layer */}
      <AtmosphericBackground />

      <div className="container" style={{ flex: 1, paddingBottom: 40, position: 'relative', zIndex: 10 }}>
        
        {/* Navigation Bar */}
        <Navbar 
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenCompare={() => setIsCompareOpen(true)}
          onOpenHealthTips={() => setIsHealthTipsOpen(true)}
          onOpenAtmosphere={() => setIsAtmosphereOpen(true)}
        />

        {/* Global Error Banner */}
        {error && (
          <div style={{
            background: 'var(--aqi-unhealthy-bg)',
            color: 'var(--aqi-unhealthy)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            fontSize: '0.9rem',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        {/* 1. Hero Air Quality & 3D Atmospheric Canvas */}
        <AqiHeroCard 
          data={data} 
          loading={loading} 
          onRefresh={refreshData} 
        />

        {/* 2. Detailed Pollutant Breakdown */}
        {data?.airQuality?.pollutants && (
          <PollutantsGrid pollutants={data.airQuality.pollutants} />
        )}

        {/* 3. Weather & Atmospheric Conditions */}
        {data?.weather && (
          <WeatherWidget weather={data.weather} dailyForecast={data.dailyForecast} />
        )}

        {/* 4. 24-Hour Trends & 7-Day Forecast */}
        {data?.hourlyTrend && (
          <ForecastCharts hourlyTrend={data.hourlyTrend} dailyForecast={data.dailyForecast} />
        )}

        {/* 5. Interactive Leaflet Map */}
        <AirQualityMap />

      </div>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CityCompareModal isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} />
      <HealthTipsModal isOpen={isHealthTipsOpen} onClose={() => setIsHealthTipsOpen(false)} />
      <AtmosphereSelectorModal isOpen={isAtmosphereOpen} onClose={() => setIsAtmosphereOpen(false)} />

      {/* Footer */}
      <footer style={{
        background: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px 0',
        marginTop: 40
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <Wind size={16} />
            </div>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              AeroPulse Live
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Data sourced from Open-Meteo Copernicus & World Health Organization Guidelines • Zero API Keys Required
          </div>

          <div style={{ display: 'flex', gap: 16, fontSize: '0.82rem', fontWeight: 600 }}>
            <button onClick={() => setIsHealthTipsOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Health Guidance
            </button>
            <button onClick={() => setIsCompareOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Compare Cities
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <DashboardContent />
      </LocationProvider>
    </AuthProvider>
  );
}
