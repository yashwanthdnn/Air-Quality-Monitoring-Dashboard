import React, { useState } from 'react';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

const PollutantsGrid = ({ pollutants = [] }) => {
  const [selectedPollutant, setSelectedPollutant] = useState(null);

  if (!pollutants || pollutants.length === 0) return null;

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Pollutant Breakdown & WHO Standards
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Real-time concentration levels compared against World Health Organization safety guidelines
          </p>
        </div>
      </div>

      {/* Grid of Pollutant Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16
      }}>
        {pollutants.map((item) => {
          const isOverLimit = item.percentageOfLimit > 100;
          const statusColor = item.status === 'Unhealthy' ? 'var(--aqi-unhealthy)' : 
                              item.status === 'Moderate' ? 'var(--aqi-moderate)' : 'var(--aqi-good)';

          return (
            <div
              key={item.id}
              className="solid-card"
              style={{
                padding: '18px 20px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header: Name and Status Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {item.fullName}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-full)',
                    background: item.status === 'Unhealthy' ? 'var(--aqi-unhealthy-bg)' : 
                                item.status === 'Moderate' ? 'var(--aqi-moderate-bg)' : 'var(--aqi-good-bg)',
                    color: statusColor
                  }}>
                    {item.status}
                  </span>
                </div>

                {/* Main Metric Value */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {item.value}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {item.unit}
                  </span>
                </div>

                {/* Progress Bar vs WHO Target */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>WHO Safe Limit: {item.whoLimit} {item.unit}</span>
                    <span style={{ color: statusColor, fontWeight: 700 }}>
                      {item.percentageOfLimit}% of Limit
                    </span>
                  </div>

                  <div style={{
                    height: 8,
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.min(item.percentageOfLimit, 100)}%`,
                      background: statusColor,
                      borderRadius: 4,
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} />
                  </div>
                </div>

                {/* Short Explanatory Text */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PollutantsGrid;
