import React, { useState } from 'react';
import { 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  Droplets, 
  Compass, 
  Gauge, 
  Sunrise, 
  Sunset,
  Eye,
  Thermometer,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';

const WeatherWidget = ({ weather, dailyForecast = [] }) => {
  const { tempUnit } = useLocation();
  const [showExplanation, setShowExplanation] = useState(false);
  const [useExactDecimals, setUseExactDecimals] = useState(false);

  if (!weather) return null;

  const toDisplayTemp = (celsius) => {
    const val = tempUnit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
    return useExactDecimals ? val.toFixed(1) : Math.round(val);
  };

  const getUvRisk = (uv) => {
    if (uv <= 2) return { text: 'Low', color: 'var(--aqi-good)', advice: 'No protection required' };
    if (uv <= 5) return { text: 'Moderate', color: 'var(--brand-warm)', advice: 'Wear sunglasses & SPF' };
    if (uv <= 7) return { text: 'High', color: 'var(--brand-terracotta)', advice: 'Seek shade during midday' };
    if (uv <= 10) return { text: 'Very High', color: 'var(--aqi-unhealthy)', advice: 'Extra protection required' };
    return { text: 'Extreme', color: 'var(--aqi-hazardous)', advice: 'Avoid outdoor sun exposure' };
  };

  const uvRisk = getUvRisk(weather.uvIndex);
  const todayForecast = dailyForecast[0] || {};

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Weather & Atmospheric Dynamics
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Meteorological conditions influencing dispersion and local air quality
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="btn btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px', gap: 6 }}
            title="Learn why temperatures differ across weather apps"
          >
            <HelpCircle size={14} color="var(--brand-primary)" />
            <span>Why Temperatures Vary (2–3°)</span>
          </button>

          <button
            onClick={() => setUseExactDecimals(!useExactDecimals)}
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-full)',
              background: useExactDecimals ? 'var(--brand-primary-light)' : 'var(--bg-card)',
              color: useExactDecimals ? 'var(--brand-primary)' : 'var(--text-muted)',
              border: `1px solid ${useExactDecimals ? 'var(--brand-primary)' : 'var(--border-subtle)'}`,
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {useExactDecimals ? '.0 Exact' : 'Rounded'}
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      {showExplanation && (
        <div className="glass-card" style={{
          background: '#FFFFFF',
          padding: '16px 20px',
          marginBottom: 16,
          borderLeft: '4px solid var(--brand-primary)',
          fontSize: '0.86rem',
          lineHeight: 1.5,
          position: 'relative'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            Understanding 2–3° Differences Between Weather Sources
          </h4>
          <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', margin: 0 }}>
            <li><strong>Ambient vs. Feels-Like (Apparent):</strong> High humidity or wind creates significant heat-index differences (e.g. ambient <strong>{weather.temperature}°C</strong> vs feels-like <strong>{weather.apparentTemperature}°C</strong>). Many consumer apps display Apparent temp as the hero figure.</li>
            <li><strong>Airport Station vs. Satellite Grid:</strong> Some apps report from airport weather stations located 15–25 km away, whereas Open-Meteo samples precise coordinate-level meteorological numerical models.</li>
            <li><strong>Microclimate & Urban Heat Islands:</strong> Dense concrete downtown areas retain 2–4°C more heat than open suburban or rural stations.</li>
          </ul>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16
      }}>
        {/* 1. Main Temperature & Condition Card */}
        <div className="solid-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Ambient Air Temperature
              </span>
              <span style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: '0.78rem', fontWeight: 700 }}>
                {weather.condition}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '14px 0 6px 0' }}>
              <span style={{ fontSize: '3.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
                {toDisplayTemp(weather.temperature)}°{tempUnit}
              </span>
            </div>

            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              marginTop: 10,
              fontSize: '0.84rem'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>Feels Like (Heat Index): </span>
              <strong style={{ color: 'var(--brand-terracotta)' }}>{toDisplayTemp(weather.apparentTemperature)}°{tempUnit}</strong>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: 2 }}>
                Range today: {toDisplayTemp(todayForecast.minTemp || weather.temperature - 4)}° to {toDisplayTemp(todayForecast.maxTemp || weather.temperature + 5)}°{tempUnit}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Wind Direction & Speed Compass */}
        <div className="solid-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Wind Flow & Vector
            </span>
            <Compass size={18} color="var(--brand-primary)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            {/* Animated Compass Rose */}
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'var(--bg-card-subtle)',
              border: '2px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                fontSize: '0.62rem',
                fontWeight: 800,
                color: 'var(--text-muted)'
              }}>N</div>
              <div style={{
                transform: `rotate(${weather.windDirection}deg)`,
                transition: 'transform 0.8s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: 3,
                  height: 38,
                  background: 'linear-gradient(to top, var(--border-accent) 50%, var(--brand-terracotta) 50%)',
                  borderRadius: 2
                }} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1 }}>
                {weather.windSpeed} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>km/h</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                Direction: <strong>{weather.windDirection}°</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Solar UV Index */}
        <div className="solid-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Solar UV Exposure
            </span>
            <Sun size={18} color="var(--brand-warm)" />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: uvRisk.color, lineHeight: 1 }}>
              {weather.uvIndex}
            </span>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-card-subtle)',
              color: uvRisk.color
            }}>
              {uvRisk.text}
            </span>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            {uvRisk.advice}
          </p>
        </div>

        {/* 4. Humidity & Pressure */}
        <div className="solid-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Humidity & Pressure
            </span>
            <Droplets size={18} color="var(--brand-primary)" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {weather.humidity}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Relative Humidity</div>
            </div>

            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: 16 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                {weather.pressure}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>hPa (Sea Level)</div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WeatherWidget;
