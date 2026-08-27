import React, { useState, useEffect } from 'react';
import { useLocation } from '../context/LocationContext';

export const BACKGROUND_PRESETS = [
  {
    id: 'auto',
    name: 'Auto Weather Sync',
    tagline: 'Live Adaptive Atmosphere',
    description: 'Automatically changes with live weather, AQI, and time of day',
    src: null,
    previewUrl: '/backgrounds/bg-clear-sky.jpg'
  },
  {
    id: 'clear',
    name: 'Alpine Clear Sky',
    tagline: 'Pure Mountain Oxygen',
    description: 'Pristine mountain peaks, crystal azure skies & alpine meadows',
    src: '/backgrounds/bg-clear-sky.jpg',
    previewUrl: '/backgrounds/bg-clear-sky.jpg'
  },
  {
    id: 'forest',
    name: 'Emerald Rainforest',
    tagline: 'Lush Forest Canopy',
    description: 'Dense ancient mossy forest, sunbeams, and crystal streams',
    src: '/backgrounds/bg-forest-clean.jpg',
    previewUrl: '/backgrounds/bg-forest-clean.jpg'
  },
  {
    id: 'sunset',
    name: 'Golden City Sunset',
    tagline: 'Warm Twilight Skyline',
    description: 'Atmospheric golden hour glow over reflective metropolitan towers',
    src: '/backgrounds/bg-urban-sunset.jpg',
    previewUrl: '/backgrounds/bg-urban-sunset.jpg'
  },
  {
    id: 'rain',
    name: 'Mountain Rain & Mist',
    tagline: 'Moody Overcast Weather',
    description: 'Atmospheric raindrops, drifting mist, and dramatic storm clouds',
    src: '/backgrounds/bg-rainy-weather.jpg',
    previewUrl: '/backgrounds/bg-rainy-weather.jpg'
  },
  {
    id: 'night',
    name: 'Celestial Starry Night',
    tagline: 'Crystal Nocturnal View',
    description: 'Luminous milky way galaxy over tranquil alpine lake reflections',
    src: '/backgrounds/bg-night-sky.jpg',
    previewUrl: '/backgrounds/bg-night-sky.jpg'
  }
];

export const getAutoBackground = (data) => {
  if (!data) return '/backgrounds/bg-clear-sky.jpg';

  const weather = data.weather || {};
  const currentAQ = data.airQuality || {};
  const aqi = currentAQ.usAqi || 40;
  const condition = (weather.condition || '').toLowerCase();
  const precipitation = weather.precipitation || 0;

  const now = new Date();
  const currentHour = now.getHours();
  const isNight = currentHour >= 19 || currentHour < 6;

  // 1. Rain, Storm, Drizzle
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder') || precipitation > 0.3) {
    return '/backgrounds/bg-rainy-weather.jpg';
  }

  // 2. Night
  if (isNight) {
    return '/backgrounds/bg-night-sky.jpg';
  }

  // 3. Fog / Overcast / Dense Clouds
  if (condition.includes('fog') || condition.includes('mist') || condition.includes('overcast')) {
    return '/backgrounds/bg-rainy-weather.jpg';
  }

  // 4. Sunset / Golden Hour or Moderate Smog (17:00 - 19:30 or high AQI)
  if ((currentHour >= 17 && currentHour <= 19) || aqi > 120) {
    return '/backgrounds/bg-urban-sunset.jpg';
  }

  // 5. Clean Forest Air (AQI <= 35)
  if (aqi <= 35) {
    return '/backgrounds/bg-forest-clean.jpg';
  }

  // 6. Default Clear Alpine Sky
  return '/backgrounds/bg-clear-sky.jpg';
};

const AtmosphericBackground = () => {
  const { data, bgTheme = 'auto', bgBlur = 3, bgDim = 0.42 } = useLocation();

  const [activeImage, setActiveImage] = useState('/backgrounds/bg-clear-sky.jpg');
  const [prevImage, setPrevImage] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Compute desired image URL
  useEffect(() => {
    let targetImage = '/backgrounds/bg-clear-sky.jpg';

    if (bgTheme === 'auto') {
      targetImage = getAutoBackground(data);
    } else {
      const found = BACKGROUND_PRESETS.find(p => p.id === bgTheme);
      if (found && found.src) {
        targetImage = found.src;
      }
    }

    if (targetImage !== activeImage) {
      setPrevImage(activeImage);
      setActiveImage(targetImage);
      setIsTransitioning(true);

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPrevImage(null);
      }, 1200);

      return () => clearTimeout(timer);
    }
  }, [bgTheme, data, activeImage]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: '#FAF7F2'
      }}
    >
      {/* Previous background image layer for smooth cross-fading */}
      {prevImage && (
        <div
          style={{
            position: 'absolute',
            top: '-5%',
            left: '-5%',
            width: '110%',
            height: '110%',
            backgroundImage: `url(${prevImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            filter: `blur(${bgBlur}px)`,
            transform: 'scale(1)',
            opacity: isTransitioning ? 0 : 1,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 1
          }}
        />
      )}

      {/* Active realistic background image layer */}
      <div
        className="atmospheric-bg-image"
        style={{
          position: 'absolute',
          top: '-5%',
          left: '-5%',
          width: '110%',
          height: '110%',
          backgroundImage: `url(${activeImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          filter: `blur(${bgBlur}px)`,
          opacity: 1,
          transition: 'opacity 1.2s ease-in-out, filter 0.4s ease',
          animation: 'kenBurnsMotion 35s ease-in-out infinite alternate',
          zIndex: 2
        }}
      />

      {/* Layer 1: Semi-translucent Glass Scrim for Pristine Contrast & Readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `rgba(250, 247, 242, ${bgDim})`,
          backdropFilter: 'saturate(120%)',
          WebkitBackdropFilter: 'saturate(120%)',
          transition: 'background 0.5s ease',
          zIndex: 3
        }}
      />

      {/* Layer 2: Subtle Ambient Color Wash & Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.2) 0%, rgba(245, 239, 235, 0.65) 100%)',
          mixBlendMode: 'normal',
          zIndex: 4
        }}
      />

      {/* Layer 3: Subtle Top/Bottom Edge Vignettes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(250, 247, 242, 0.4) 0%, transparent 20%, transparent 80%, rgba(250, 247, 242, 0.7) 100%)',
          zIndex: 5
        }}
      />
    </div>
  );
};

export default AtmosphericBackground;
