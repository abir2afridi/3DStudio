# 3D Studio — Spatial Geometry Laboratory

![Spatial Computing](https://img.shields.io/badge/3D-Laboratory-black?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.dot-js&logoColor=white)

The world's first browser-native 3D generator. Zero latency. Total privacy. Infinite scale. **3D Studio** bridges the gap between conceptual 2D UI and hardware-accelerated 3D systems.

---

## 🚀 Premium Features

- **Studio Mode Architecture**: Three specialized rendering paths for maximum impact:
  - **Solid Silhouette**: Perfect for bold, structural branding.
  - **Sculpted Detail**: High-fidelity surfaces with refined depth and highlights.
  - **Layered Structure**: Architectural depth with Z-gradient color transitions and emissive glows.
- **Unified Motion Center**: Animation controls (Spin, Bounce, Pulse, etc.) are integrated directly into the header for instant access.
- **Real-time Dashboard Clock**: Precision time-tracking with second-level accuracy and custom red-pulsing indicators.
- **PBR Materials**: Physically accurate shaders including Polished Glass, Chrome, Matte Ceramic, and holographic effects.
- **Extreme Exporters**: Direct support for 4K PNG/JPG, GLB, STL, OBJ, and professional WEBM video sequences.

## 🛠 Tech Stack

- **Core**: React 19 + TypeScript
- **Graphics**: Three.js + React Three Fiber (Custom Shader Shorthands)
- **Animations**: Framer Motion (System-wide Layout Animations)
- **State Management**: Zustand (Atomic architecture with optimized re-renders)
- **Styling**: Tailwind CSS 4.0 (Custom design tokens & glassmorphism system)
- **Routing**: Wouter (Lightweight spatial navigation)

## 📦 Project Structure

```bash
├── artifacts/
│   ├── 3d-logo-generator/  # Main 3D Design Application
│   └── api-server/         # (Coming Soon) Design Persistence API
├── lib/                     # Shared spatial utilities & math helpers
└── package.json             # Workspace management
```

## 🏗 Setup & Development

This laboratory uses a modern **pnpm monorepo** architecture.

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Launch Studio**:
   ```bash
   npx pnpm --filter @workspace/3d-logo-generator dev
   ```

## 📐 System Architect

**Abir Hasan Siam**  
*Lead Developer & Spatial Architect*  
Independent University of Bangladesh (CSC)

Detailed Dossier: [abir2afridi.vercel.app](https://abir2afridi.vercel.app/)

---

© 2026 3D Studio — Made with ❤️ for the future of 3D Design.

51.5074° N, 0.1278° W
