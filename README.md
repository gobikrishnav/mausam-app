# 🇮🇳 MAUSAM (मौसम): Mega Unified Meteorological Intelligence Platform

[![Android Release](https://img.shields.io/badge/Android%20APK-v2.0.0-0E468A?style=for-the-badge&logo=android&logoColor=white)](https://github.com/gobikrishnav/mausam-app/releases/tag/v2.0.0)
[![Build Status](https://img.shields.io/github/actions/workflow/status/gobikrishnav/mausam-app/build-apk.yml?branch=main&style=for-the-badge)](https://github.com/gobikrishnav/mausam-app/actions)

**MAUSAM** is a single, consolidated **Mega Meteorological Platform** inspired by the India Meteorological Department (IMD), Ministry of Earth Sciences (MoES), Government of India. It unifies surface meteorological observations, satellite earth observation, GIS Doppler radar, 4-tier disaster warning systems, on-device machine learning personalization, and AI voice briefings into **one cohesive repository and a single Android APK file**.

---

## 📱 Direct Single Android APK Download

Download the signed, production-ready Android APK directly to your phone:

➡️ **[Download Single APK (MAUSAM.apk)](https://github.com/gobikrishnav/mausam-app/releases/download/v2.0.0/MAUSAM.apk)** *(Latest Release v2.0.0)*

*Requires Android 7.0+ (API level 24 to 35). Universal compatibility across all Android devices.*

---

## 🌟 Mega Unified Feature Suite

### 1. 🧠 On-Device Offline Machine Learning (M-AWPM v1.2)
- **Zero Latency**: Executes on-device in ~1.4 ms with 0 KB network data transfer.
- **Biometeorological Computation**: Evaluates Thom's Discomfort Index ($DI$) and diurnal solar phases in real time.
- **12-Dimensional Vector Ranking**: Dynamically ranks actionable advisories across 8 personas.
- **Reinforcement Feedback**: Real-time `👍 Helpful` and `👎 Refine` buttons adapt local weights dynamically.
- **Interactive ML Inspector**: Tap the M-AWPM banner to inspect live weights, confidence ratings, and optimal action windows.

### 2. 🔊 AI Weather Voice Briefing
- Integrated **Web Speech API** audio player (`window.speechSynthesis`) on the Daily AI Brief card for instant audio weather readouts.

### 3. 🛰️ Satellite & GIS Radar Meteorological Observational Suite
- **INSAT-3D/3DR Satellite Viewer**: Real-time Thermal Infrared, Water Vapor, and Visible imagery bands.
- **Interactive GIS Weather Map**: Leaflet-powered multi-layer map with live Doppler Radar reflectivity, precipitation clouds, wind streams, and TomTom traffic integration.
- **3-Hour Rapid Nowcast**: Automated countdown timer with localized severe thunderstorm warnings and lightning safety advisories.
- **4-Color IMD Warning Matrix**: Official Red, Orange, Yellow, and Green warning levels with phenomenon descriptions.

### 4. 🌾 8 Targeted Lifestyle Sectors
1. **Farmers / Agriculture**: Meghdoot agro-advisories, spray windows, harvest forecasts.
2. **Commuters & Road Users**: Traffic precipitation index, fog visibility risk.
3. **Fitness & Outdoor Runners**: Thermal comfort curve, AQI running windows.
4. **Fishermen & Coastal**: INCOIS sea swell heights, coastal squall warnings.
5. **Health & Vulnerable**: Respiratory alerts, particulate matter (PM2.5 / PM10) risks.
6. **Parents & Schools**: School bus weather warnings, heatwave alerts.
7. **Travelers & Tourism**: Weekend district forecasts, route conditions.
8. **Event Planners**: Outdoor precipitation probability matrices.

### 5. 🚨 Disaster Management Emergency Helplines
1-tap direct emergency calling:
- **NDMA National Control Room**: `1078`
- **National Emergency Response**: `112`
- **State Disaster Relief**: `1070`
- **District Disaster Relief**: `1077`

### 6. 🔐 Resilient Authentication Architecture
- **Clerk Cloud Auth**: Wrapped in `<ClerkSafeProvider>` with automatic fallback test key.
- **1-Tap Guest Citizen Mode**: Instant full access without mandatory login walls.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite 8 |
| **Styling & UI** | Tailwind CSS + Lucide Icons + Framer Motion |
| **Native Mobile Wrapper** | Capacitor 8 (`@capacitor/android`, `@capacitor/core`) |
| **Interactive Maps** | Leaflet + OpenStreetMap + TomTom Traffic API |
| **Charts & Graphs** | Recharts (Hourly bar charts, 7-day temperature trends) |
| **State Management** | Zustand (Persistent local storage & offline hydration) |
| **CI/CD Pipeline** | GitHub Actions (Auto-compiles single signed APK on push) |

---

## 💻 Local Development & Build Instructions

### Prerequisites
- Node.js 20+
- npm 10+
- Java JDK 21 (for Android build)
- Android Studio / Android SDK (API 34/35)

### Running Web / Dev Server
```bash
git clone https://github.com/gobikrishnav/mausam-app.git
cd mausam-app
npm install
npm run dev
```

### Building the Single Android APK Locally
```bash
# 1. Build Vite production bundle
npm run build

# 2. Sync web assets with Capacitor Android
npx cap sync android

# 3. Build signed release APK with Gradle
cd android
./gradlew assembleRelease
# The single APK will be generated at android/app/build/outputs/apk/release/app-release.apk
```
