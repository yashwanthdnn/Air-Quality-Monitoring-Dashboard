import React from 'react';
import { X, Sparkles, Check, Image as ImageIcon, Sliders, Eye, Sun, Trees, Sunset, CloudRain, Moon } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { BACKGROUND_PRESETS } from './AtmosphericBackground';

const AtmosphereSelectorModal = ({ isOpen, onClose }) => {
  const { bgTheme, setBgTheme, bgBlur, setBgBlur, bgDim, setBgDim } = useLocation();

  if (!isOpen) return null;

  const getPresetIcon = (id) => {
    switch (id) {
      case 'clear': return <Sun size={18} color="#D97706" />;
      case 'forest': return <Trees size={18} color="#2E7D32" />;
      case 'sunset': return <Sunset size={18} color="#D96B43" />;
      case 'rain': return <CloudRain size={18} color="#0284C7" />;
      case 'night': return <Moon size={18} color="#7C3AED" />;
      default: return <Sparkles size={18} color="#2E7D32" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(30, 35, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: 760,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #2E7D32 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(46, 125, 50, 0.25)'
            }}>
              <ImageIcon size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Realistic Background Scenery
              </h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Immersive photorealistic atmospheric backgrounds with live weather synchronisation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary btn-icon"
            style={{ width: 36, height: 36 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Realistic Scenery Presets Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 16,
          marginBottom: 24
        }}>
          {BACKGROUND_PRESETS.map((preset) => {
            const isSelected = bgTheme === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => setBgTheme(preset.id)}
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '3px solid var(--brand-primary)' : '2px solid var(--border-subtle)',
                  boxShadow: isSelected ? '0 8px 24px rgba(46, 125, 50, 0.25)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                  background: '#FFFFFF'
                }}
              >
                {/* Image Thumbnail */}
                <div style={{
                  height: 120,
                  backgroundImage: `url(${preset.previewUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {/* Subtle Gradient Scrim */}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)'
                  }} />

                  {/* Selected Pill Badge */}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'var(--brand-primary)',
                      color: '#FFFFFF',
                      borderRadius: 'var(--radius-full)',
                      padding: '3px 8px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}>
                      <Check size={12} strokeWidth={3} />
                      <span>Active</span>
                    </div>
                  )}

                  {/* Icon & Title over image */}
                  <div style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 10,
                    right: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    color: '#FFFFFF'
                  }}>
                    {getPresetIcon(preset.id)}
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                      {preset.name}
                    </span>
                  </div>
                </div>

                {/* Card Description Footer */}
                <div style={{ padding: '10px 12px', background: isSelected ? 'var(--brand-primary-light)' : '#FFFFFF' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 700, color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)', marginBottom: 2 }}>
                    {preset.tagline}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                    {preset.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Adjustments: Blur & Contrast Tuning */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 22px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Sliders size={16} color="var(--brand-primary)" />
            <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Atmosphere & Backdrop Fine-Tuning
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            
            {/* Blur Intensity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                <span>Backdrop Softness / Blur</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                  {bgBlur === 0 ? 'Crystal Sharp (0px)' : bgBlur <= 3 ? 'Subtle (3px)' : bgBlur <= 8 ? 'Medium (8px)' : 'Soft Glow (14px)'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Sharp', val: 0 },
                  { label: 'Subtle', val: 3 },
                  { label: 'Medium', val: 7 },
                  { label: 'Soft', val: 14 }
                ].map((b) => (
                  <button
                    key={b.val}
                    onClick={() => setBgBlur(b.val)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      border: bgBlur === b.val ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      background: bgBlur === b.val ? '#FFFFFF' : 'transparent',
                      color: bgBlur === b.val ? 'var(--brand-primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Readability Contrast / Dimming */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                <span>Card Contrast / Glass Opacity</span>
                <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>
                  {bgDim <= 0.25 ? 'Vibrant (Light Scrim)' : bgDim <= 0.45 ? 'Balanced (Recommended)' : 'Focus (Deep Glass)'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: 'Vibrant', val: 0.22 },
                  { label: 'Balanced', val: 0.42 },
                  { label: 'Deep Focus', val: 0.62 }
                ].map((d) => (
                  <button
                    key={d.val}
                    onClick={() => setBgDim(d.val)}
                    style={{
                      flex: 1,
                      padding: '6px 0',
                      borderRadius: 'var(--radius-sm)',
                      border: bgDim === d.val ? '2px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                      background: bgDim === d.val ? '#FFFFFF' : 'transparent',
                      color: bgDim === d.val ? 'var(--brand-primary)' : 'var(--text-muted)',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: '10px 24px' }}
          >
            Apply & Return to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};

export default AtmosphereSelectorModal;
