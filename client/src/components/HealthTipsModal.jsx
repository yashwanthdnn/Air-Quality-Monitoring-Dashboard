import React from 'react';
import { X, Heart, Shield, Activity, Baby, UserCheck, Wind, AlertTriangle } from 'lucide-react';

const HealthTipsModal = ({ isOpen, onClose }) => {
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
        maxWidth: 780,
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-xl)',
        padding: '28px',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Shield size={22} color="var(--brand-primary)" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Air Quality & Health Guidelines
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
              Evidence-based respiratory safeguards and preventative precautions
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

        {/* Group Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginBottom: 24 }}>
          
          {/* Card 1: Sensitive & Asthma */}
          <div className="solid-card" style={{ padding: '18px', borderLeft: '4px solid var(--brand-terracotta)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Heart size={18} color="var(--brand-terracotta)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Asthma & Lung Conditions</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Keep quick-relief inhalers accessible at all times. When AQI exceeds 100, avoid outdoor physical activity and keep windows sealed. Use certified True HEPA air filtration indoors.
            </p>
          </div>

          {/* Card 2: Children & Infants */}
          <div className="solid-card" style={{ padding: '18px', borderLeft: '4px solid var(--brand-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Baby size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Children & Infants</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Children breathe more air per pound of body weight than adults. Restrict prolonged playground recess and outdoor sports when PM2.5 levels rise above moderate benchmarks.
            </p>
          </div>

          {/* Card 3: Outdoor Athletes */}
          <div className="solid-card" style={{ padding: '18px', borderLeft: '4px solid var(--brand-warm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Activity size={18} color="var(--brand-warm)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Athletes & Cyclists</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Intense cardio increases ventilation up to 10x, drawing ultrafine particles deep into alveolar tissue. Shift workouts indoors or schedule runs during early morning low-traffic hours.
            </p>
          </div>

          {/* Card 4: Mask Protocols */}
          <div className="solid-card" style={{ padding: '18px', borderLeft: '4px solid var(--brand-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Shield size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Respirator & Mask Standards</h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Standard surgical masks only filter coarse dust. For fine PM2.5 protection, use tight-fitting N95, KN95, or FFP2 certified particulate respirators with proper facial seal.
            </p>
          </div>

        </div>

        {/* AQI Scale Guide */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
            AQI Index Classification Scale
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { range: '0 - 50', label: 'Good', color: 'var(--aqi-good)', bg: 'var(--aqi-good-bg)', desc: 'Air quality is satisfactory with little to no risk.' },
              { range: '51 - 100', label: 'Moderate', color: 'var(--aqi-moderate)', bg: 'var(--aqi-moderate-bg)', desc: 'Acceptable; sensitive individuals should monitor symptoms.' },
              { range: '101 - 150', label: 'Unhealthy for Sensitive Groups', color: 'var(--aqi-sensitive)', bg: 'var(--aqi-sensitive-bg)', desc: 'Sensitive groups may experience health effects.' },
              { range: '151 - 200', label: 'Unhealthy', color: 'var(--aqi-unhealthy)', bg: 'var(--aqi-unhealthy-bg)', desc: 'Everyone may begin experiencing adverse effects.' },
              { range: '201 - 300', label: 'Very Unhealthy', color: 'var(--aqi-very-unhealthy)', bg: 'var(--aqi-very-unhealthy-bg)', desc: 'Health alert: emergency conditions for general population.' },
              { range: '301+', label: 'Hazardous', color: 'var(--aqi-hazardous)', bg: 'var(--aqi-hazardous-bg)', desc: 'Serious health warning. Entire population affected.' }
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: row.bg,
                  fontSize: '0.84rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <strong style={{ color: row.color, width: 70 }}>{row.range}</strong>
                  <strong style={{ color: row.color }}>{row.label}</strong>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{row.desc}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default HealthTipsModal;
