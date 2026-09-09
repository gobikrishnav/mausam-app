# 🇮🇳 MAUSAM (मौसम): Mega Unified Meteorological Intelligence Platform

[![Android Release](https://img.shields.io/badge/Android%20APK-v3.4.0-0E468A?style=for-the-badge&logo=android&logoColor=white)](https://github.com/gobikrishnav/mausam-app/releases/tag/v3.4.0)
[![Build Status](https://img.shields.io/github/actions/workflow/status/gobikrishnav/mausam-app/build-apk.yml?branch=main&style=for-the-badge)](https://github.com/gobikrishnav/mausam-app/actions)
[![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)](LICENSE)

**MAUSAM** is a single, consolidated **Mega Meteorological Platform** inspired by the India Meteorological Department (IMD), Ministry of Earth Sciences (MoES), Government of India. It unifies surface meteorological observations, satellite earth observation, GIS Doppler radar, 4-tier disaster warning systems, on-device machine learning personalization, and AI voice briefings into **one cohesive repository and a single Android APK file**.

📖 **[Read Full Architecture, API & Function Documentation](docs/PROJECT_ARCHITECTURE_AND_API_GUIDE.md)**

---

## 📱 Direct Single Android APK Download

Download the signed, production-ready Android APK directly to your phone:

➡️ **[Download Single APK: MAUSAM.apk (6.65 MB)](https://github.com/gobikrishnav/mausam-app/releases/download/v3.4.0/MAUSAM.apk)** *(Latest Release v3.4.0)*

*Requires Android 7.0+ (API level 24 to 35). Universal compatibility across all Android devices.*

---

## 🌟 Mega Unified Feature Suite

### 1. 🧠 On-Device Neural AI with Backpropagation (M-BPNN v3.0)
- **Zero Cloud Latency**: Executes on-device in $<2$ ms with zero network telemetry.
- **Layer Topology**: $12 \to 8 \to 8$ Multi-Layer Perceptron (MLP) mapping 12 biometeorological inputs to 8 hidden non-linear neurons ($\sigma(z) = \frac{1}{1 + e^{-z}}$) and 8 persona priority logits.
- **Analytical Gradient Descent with Momentum**:
  $$\Delta W_{2,j,k} = \eta \cdot \delta_{2,k} \cdot h_j + \alpha \cdot \Delta W_{2,j,k}^{(t-1)}$$
  $$\Delta W_{1,i,j} = \eta \cdot \delta_{1,j} \cdot x_i + \alpha \cdot \Delta W_{1,i,j}^{(t-1)}$$
  ($\eta = 0.08, \alpha = 0.85$, MSE Loss).
- **Interactive Neural Inspector**: Live hidden neuron activation bars and 1-tap manual epoch training.
- **Online Reinforcement Feedback**: Real-time `👍 Helpful` and `👎 Refine` buttons adapt synaptic weights locally.

### 2. 🎨 Official Meteorological Identity & Responsive Onboarding
- **Page 1: Splash Screen**: Features the official State Emblem of India (Lion Capital of Ashoka), official Mausam app logo, sunrise mountain landscape with waving Indian Tricolor ribbon, and *"जनहित में, सदैव"* motto.
- **Page 2: India Gate Onboarding**: Headline *"Reliable Weather Information for a Better India"*, India Gate architectural artwork, skip control, and progress indicators.
- **100% Phone & Desktop Responsive**: Adapts edge-to-edge on phones (`pt-safe-top`, `pb-safe-bottom`) and centers inside a smartphone simulator frame on desktops.

### 3. 🛰️ Satellite & GIS Radar Meteorological Observational Suite
- **INSAT-3DS Satellite Feeds**: Visible, Thermal Infrared (TIR-1), Water Vapor (WV), and Geo-color composite products.
- **Live Doppler Weather Radar (DWR)**: 10 official IMD radar stations (Delhi, Mumbai, Chennai, Kolkata, Srinagar, Kochi, Patna, Nagpur, Hyderabad, Agartala) with 250 km range rings and dBZ reflectivity popups.
- **Dynamic Precipitation Loop**: Animated time playback using RainViewer v2 tile cache.

### 4. 🌾 8 Targeted Lifestyle Sectors
1. **Farmers / Agriculture**: Meghdoot agro-advisories, micro-irrigation alerts, frost/mildew monitoring.
2. **Commuters & Road Users**: Traffic precipitation index, low-visibility fog warnings, route travel delays.
3. **Fitness & Outdoor Athletes**: Thermal comfort index, diurnal running slots, hydration indices.
4. **Fishermen & Coastal Citizens**: INCOIS sea swell heights, tide status, rip current warnings.
5. **Health & Vulnerable Groups**: CPCB Air Quality Index (AQI), PM2.5/PM10 thresholds, respiratory alerts.
6. **Parents & School Commuters**: School bus weather warnings, heatwave alerts.
7. **Travelers & Tourism**: 26 categorized Indian destination microclimates (Hill stations, Pilgrimage, Coastal, Cyclone zones).
8. **Event Planners**: Convective storm risk, open-air venue viability, wind gust limits.

### 5. 🚨 Disaster Management Emergency Helplines
1-tap direct emergency calling:
- **NDMA National Control Room**: `1078`
- **National Emergency Response**: `112`
- **State Disaster Relief**: `1070`
- **District Disaster Relief**: `1077`

### 6. 🔐 Resilient Authentication Architecture
- **Clerk Cloud Auth**: Google/Apple SSO, social login, and user avatar synchronization.
- **Clean Forms**: Standard web placeholders (`name@example.com`, `Enter your password`) with empty initial state.
- **1-Tap Guest Citizen Mode**: Instant full access without mandatory login walls.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Languages** | TypeScript 5.8+, JavaScript (ES2022), Python 3.13, Java 21 |
| **Frontend Framework** | React 19 + Vite 8.2 |
| **Styling & Design** | Tailwind CSS 3.4 + Lucide Icons |
| **Native Android** | Capacitor 7.0 + Gradle 8.x (Single APK output) |
| **GIS & Radar Mapping** | Leaflet 1.9 + RainViewer Doppler API + OpenStreetMap |
| **Data Visualization** | Recharts 3.1 (Hourly area charts, 10-day daily trends) |
| **State Management** | Zustand (Persistent local storage & offline rehydration) |
| **Data Persistence** | **Zero-Database / Local-First** (`localStorage` + PWA Cache Storage) |
| **Identity & SSO** | Clerk Cloud Auth (`@clerk/clerk-react`) |
| **Machine Learning** | M-BPNN v3.0 (On-device Backpropagation Neural Network) |
| **CI/CD Pipeline** | GitHub Actions (Automated build and release workflow) |

---

## 💻 Local Development & Build Instructions

### Prerequisites
- Node.js 20+
- npm 10+
- Java JDK 21 (for Android build)
- Android Studio / Android SDK (API 34/35)

### Running Dev Server
```bash
git clone https://github.com/gobikrishnav/mausam-app.git
cd mausam-app
npm install
npm run dev
```

### Building the Single Android APK
```bash
# 1. Compile TypeScript and build production web assets
npm run build

# 2. Sync web assets with Capacitor Android
npx cap sync android

# 3. Build standalone signed APK with Gradle
cd android
./gradlew assembleRelease
```

---

## 📚 Complete Technical Documentation
For full API contracts, mathematical proofs, function signatures, and data flow diagrams:
👉 **[docs/PROJECT_ARCHITECTURE_AND_API_GUIDE.md](docs/PROJECT_ARCHITECTURE_AND_API_GUIDE.md)**
