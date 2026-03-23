# 3D Studio — Spatial Geometry Laboratory

![Spatial Computing](https://img.shields.io/badge/3D-Laboratory-black?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.dot-js&logoColor=white)

The world's first browser-native 3D generator. Zero latency. Total privacy. Infinite scale. **3D Studio** bridges the gap between conceptual 2D UI and hardware-accelerated 3D systems.

---

## 🚀 Core Technologies

- **Silhouette Engine**: Real-time mesh generation from 2D vector data using hardware-accelerated buffers.
- **PBR Materials**: Physically accurate shaders including Polished Glass, Chrome, and Matte Ceramic finishes.
- **Local Compute**: 100% GPU-native. No assets ever leave your device. Permanent privacy.
- **Extreme Exporters**: Direct support for PNG, JPG, GLB, STL, OBJ, and high-quality WEBM sequences.

## 🛠 Tech Stack

- **Core**: React 19 + TypeScript
- **Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion (System-wide variants)
- **State**: Zustand (Atomic architecture)
- **Styling**: Tailwind CSS 4.0 (Custom design system)
- **Routing**: Wouter (Lightweight spatial navigation)
- **Environment**: pnpm Monorepo Workspaces

## 📦 Project Structure

```bash
├── artifacts/
│   ├── 3d-logo-generator/  # Main 3D Design Application
│   └── api-server/         # (Coming Soon) Design Persistence API
├── lib/                     # Shared spatial utilities
└── package.json             # Workspace management
```

## 🏗 Setup & Development

This laboratory uses a **pnpm monorepo** architecture.

1. **Install Dependencies**:

   ```bash
   pnpm install
   ```

2. **Launch Studio**:

   ```bash
   pnpm --filter @workspace/3d-logo-generator dev
   ```

## 📐 System Architect

**Abir Hasan Siam**  
*Lead Developer & Spatial Architect*  
Independent University of Bangladesh (CSC)

Detailed Dossier: [abir2afridi.vercel.app](https://abir2afridi.vercel.app/)

---

*© 2026 3D Studio Laboratory — 51.5074° N, 0.1278° W*
