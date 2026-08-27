import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Calendar, Clock, TrendingUp, Sun, Cloud, CloudRain } from 'lucide-react';
import { useLocation } from '../context/LocationContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ForecastCharts = ({ hourlyTrend = [], dailyForecast = [] }) => {
  const { aqiStandard, tempUnit } = useLocation();
  const [activeMetric, setActiveMetric] = useState('aqi'); // 'aqi' | 'pm2_5' | 'temp'

  if (!hourlyTrend || hourlyTrend.length === 0) return null;

  // Format hourly labels (e.g. "14:00", "15:00" or "+1h")
  const hourlyLabels = hourlyTrend.map((h, i) => {
    if (h.time && h.time.includes('T')) {
      const date = new Date(h.time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return `+${i}h`;
  });

  // Prepare datasets based on activeMetric
  let chartData;
  let chartOptions;

  if (activeMetric === 'aqi') {
    chartData = {
      labels: hourlyLabels,
      datasets: [
        {
          label: aqiStandard === 'US' ? 'US AQI' : 'EU CAQI',
          data: hourlyTrend.map(h => aqiStandard === 'US' ? h.usAqi : h.euAqi),
          borderColor: '#2E7D32',
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(46, 125, 50, 0.35)');
            gradient.addColorStop(1, 'rgba(46, 125, 50, 0.0)');
            return gradient;
          },
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#2E7D32',
          pointBorderWidth: 2,
          pointHoverRadius: 6
        }
      ]
    };
  } else if (activeMetric === 'pm2_5') {
    chartData = {
      labels: hourlyLabels,
      datasets: [
        {
          label: 'PM2.5 (µg/m³)',
          data: hourlyTrend.map(h => h.pm2_5),
          borderColor: '#D97706',
          backgroundColor: 'rgba(217, 119, 6, 0.2)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 2
        },
        {
          label: 'PM10 (µg/m³)',
          data: hourlyTrend.map(h => h.pm10),
          borderColor: '#D96B43',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 2
        }
      ]
    };
  } else {
    // Temperature
    chartData = {
      labels: hourlyLabels,
      datasets: [
        {
          label: `Temperature (°${tempUnit})`,
          data: hourlyTrend.map(h => tempUnit === 'F' ? Math.round((h.temperature * 9) / 5 + 32) : h.temperature),
          borderColor: '#D85A20',
          backgroundColor: 'rgba(216, 90, 32, 0.15)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#FFFFFF',
          pointBorderColor: '#D85A20',
          pointBorderWidth: 2
        }
      ]
    };
  }

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#4F5D6B',
          font: { family: 'Plus Jakarta Sans', size: 12, weight: 600 },
          usePointStyle: true,
          boxWidth: 8
        }
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1E232A',
        bodyColor: '#4F5D6B',
        borderColor: '#E8E2D9',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: { family: 'Outfit', weight: 'bold', size: 13 },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        shadowBlur: 12,
        shadowColor: 'rgba(0, 0, 0, 0.08)'
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(232, 226, 217, 0.4)' },
        ticks: { color: '#8291A0', font: { family: 'Plus Jakarta Sans', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(232, 226, 217, 0.4)' },
        ticks: { color: '#8291A0', font: { family: 'Plus Jakarta Sans', size: 11 } }
      }
    }
  };

  const getAqiColor = (aqi) => {
    if (aqi <= 50) return 'var(--aqi-good)';
    if (aqi <= 100) return 'var(--aqi-moderate)';
    if (aqi <= 150) return 'var(--aqi-sensitive)';
    if (aqi <= 200) return 'var(--aqi-unhealthy)';
    return 'var(--aqi-hazardous)';
  };

  return (
    <section style={{ marginTop: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            24-Hour Trend & 7-Day Forecast
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Continuous particulate trajectory and predictive air quality modeling
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-full)',
          padding: 4,
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveMetric('aqi')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeMetric === 'aqi' ? 'var(--brand-primary-light)' : 'transparent',
              color: activeMetric === 'aqi' ? 'var(--brand-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            AQI Index
          </button>
          <button
            onClick={() => setActiveMetric('pm2_5')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeMetric === 'pm2_5' ? 'var(--brand-warm-light)' : 'transparent',
              color: activeMetric === 'pm2_5' ? 'var(--brand-warm)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            PM2.5 / PM10
          </button>
          <button
            onClick={() => setActiveMetric('temp')}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: activeMetric === 'temp' ? 'var(--brand-terracotta-light)' : 'transparent',
              color: activeMetric === 'temp' ? 'var(--brand-terracotta)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            Temperature
          </button>
        </div>
      </div>

      {/* Main Hourly Line Chart */}
      <div className="solid-card" style={{ padding: '24px', marginBottom: 20 }}>
        <div style={{ height: 260 }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* 7-Day Day-by-Day Forecast Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12
      }}>
        {dailyForecast.map((day, idx) => {
          const dateObj = day.date ? new Date(day.date) : new Date();
          const dayName = idx === 0 ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const aqiColor = getAqiColor(day.predictedAqi);

          return (
            <div
              key={idx}
              className="solid-card"
              style={{
                padding: '16px 12px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `3px solid ${aqiColor}`
              }}
            >
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {dayName}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {formattedDate}
                </div>

                <div style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-display)',
                  color: aqiColor,
                  margin: '4px 0'
                }}>
                  {day.predictedAqi}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: aqiColor, marginBottom: 8 }}>
                  {day.aqiCategory}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {tempUnit === 'F' ? Math.round((day.maxTemp * 9) / 5 + 32) : day.maxTemp}° / {tempUnit === 'F' ? Math.round((day.minTemp * 9) / 5 + 32) : day.minTemp}°{tempUnit}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  UV Max: {day.uvIndexMax}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ForecastCharts;
