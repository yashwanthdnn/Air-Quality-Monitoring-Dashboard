# 🌿 AeroPulse — Atmospheric & Air Quality Intelligence Dashboard

A full-stack, real-time **Air Quality & Weather Monitoring Web Application** built with **React (Vite)**, **Node.js/Express**, **MongoDB (Mongoose)**, **Leaflet Maps**, and **Three.js 3D atmospheric graphics**.

Designed with an elegant **light theme** (warm porcelain, cream-sand, and sage emerald accents — strictly avoiding standard blue palettes), complete with real-time automatic geolocation, global search, interactive map exploration, pollutant breakdown, health advisories, hourly/weekly forecasts, city comparisons, and JWT-authenticated user accounts with MongoDB.

---

## ✨ Features

- **🎨 Warm Light Theme Design System**: Porcelain ivory background (`#FAF7F2`), crisp sage/emerald brand accents (`#2E7D32`), luxury glassmorphism cards, and dynamic AQI status indicators.
- **🌐 3D Atmospheric Particle & AQI Sphere (Three.js)**: Interactive 3D celestial sphere and particle field simulating atmospheric particulate density in real-time. Move your mouse to rotate and inspect.
- **🛰️ Live Air Quality Metrics (Open-Meteo)**:
  - Supports both **US EPA AQI (0–500)** and **European CAQI (0–100)** standards.
  - Dominant pollutant identifier & real-time health category badge with pulsing status rings.
- **🔬 Deep Pollutant Breakdown (WHO Benchmarks)**:
  - **PM2.5** (Fine Particulate Matter)
  - **PM10** (Coarse Inhalable Particulate Matter)
  - **NO₂** (Nitrogen Dioxide)
  - **O₃** (Ground-Level Ozone)
  - **SO₂** (Sulfur Dioxide)
  - **CO** (Carbon Monoxide)
  - **Atmospheric Dust** & **NH₃** (Ammonia)
  - Color-coded progress meters showing safe limit comparison vs **World Health Organization (WHO)** standards.
- **🌦️ Integrated Weather Dynamics**:
  - Real-time temperature (°C / °F toggle) and apparent "feels like" temperature.
  - **Animated Wind Direction Compass Rose** & wind velocity vector.
  - **Solar UV Index Exposure Gauge** with sun protection and burn risk warnings.
  - Relative humidity %, barometric surface pressure (hPa), cloud cover %, and precipitation.
- **🗺️ Interactive Leaflet Map**:
  - Custom light CartoDB Voyager tiles.
  - **Click anywhere on the globe/map** to instantly sample and display live air quality and weather at those exact coordinates.
  - Global capital and major city hotspot markers.
- **📍 Automatic Geolocation & Global Search**:
  - Automatic browser GPS coordinate detection with 1-click **"My Location"** button.
  - Instant debounced autocomplete search for any city, region, or landmark globally.
- **📈 24-Hour Trends & 7-Day Predictive Modeling**:
  - Interactive line charts for hourly AQI trajectories, PM2.5/PM10 curves, and temperature trends.
  - 7-day day-by-day predictive AQI cards with weather icons and temperature ranges.
- **⚖️ City Comparison Tool**:
  - Side-by-side multi-city comparison of air quality, PM2.5, temperature, and wind.
- **🩺 Comprehensive Health Guidelines & Advisories**:
  - Actionable health recommendations for asthma patients, children/infants, elderly seniors, and outdoor athletes.
  - Face mask (N95/KN95) requirements, ventilation/window recommendations, and HEPA air purifier guidance.
- **🔐 MongoDB Authentication & Saved Hubs**:
  - User Registration and Login with JWT tokens and bcrypt password hashing.
  - Save favorite cities to your personal MongoDB account for instant 1-click access.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Three.js, Leaflet, Chart.js / React-Chartjs-2, Lucide React, Canvas-Confetti, Vanilla CSS Design System.
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Axios, Bcryptjs, CORS, Dotenv.
- **Open APIs**: Open-Meteo Air Quality API, Open-Meteo Weather API, Nominatim Geocoding API (100% free, zero API keys required).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Quick Start

1. **Start the Express Backend Server**:
   ```bash
   cd server
   npm install
   node server.js
   ```
   *The server will start on `http://localhost:5000` and automatically connect to MongoDB.*

2. **Start the React Frontend Client**:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The client will start on `http://localhost:5173`.*

3. Open **`http://localhost:5173`** in your browser.

---

## 🚀 Render Deployment (Production)

This repository is pre-configured for **1-click / zero-configuration deployment to [Render](https://render.com)**.

See the full step-by-step guide in [RENDER_DEPLOYMENT_GUIDE.md](file:///c:/Users/HP/Downloads/project1/RENDER_DEPLOYMENT_GUIDE.md).

### Quick Deploy Summary:
1. Push repository to **GitHub**.
2. In [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint** and select this repo (uses `render.yaml`).
3. Set your **`MONGODB_URI`** environment variable (Free MongoDB Atlas connection string).
4. Render will automatically build the React frontend (`npm run build`) and start the unified server (`npm start`)!

| Parameter | Value |
|---|---|
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |
| **Node Engine** | `>=18.0.0` |
| **Health Check** | `/api/health` |


---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status & MongoDB connection state |
| `GET` | `/api/air-quality?lat={lat}&lon={lon}` | Comprehensive air quality & weather metrics |
| `POST` | `/api/air-quality/compare` | Multi-city side-by-side comparison |
| `GET` | `/api/geocoding/search?q={query}` | Global city autocomplete search |
| `GET` | `/api/geocoding/reverse?lat={lat}&lon={lon}` | Reverse geocodes coordinates to city name |
| `GET` | `/api/geocoding/featured` | List of featured global city coordinates |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/user/saved-locations` | Get user's saved favorite hubs from MongoDB |
| `POST` | `/api/user/saved-locations` | Save a new favorite city to MongoDB |
| `DELETE` | `/api/user/saved-locations/:id` | Remove a saved city |
