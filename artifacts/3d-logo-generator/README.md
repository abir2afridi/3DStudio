# 3D Logo Generator Components

![React Three Fiber](https://img.shields.io/badge/Three--Fiber-black?style=for-the-badge)
![Framer Motion](https://img.shields.io/badge/Framer--Motion-deep--purple?style=for-the-badge)

The primary application for generating high-end spatial logos and 3D icons directly within the browser.

## 🌟 Key Features

### 1. Vector Extraction
Converts standard images (PNG/JPG) into extrudable 3D silhouettes via custom canvas edge-detection algorithms.

### 2. PBR Material Designer
Access curated presets for the ultimate "premium" look:
- **Polished Glass**: Realistic refraction and specular highlights.
- **Chrome / Metal**: High-contrast, physically accurate reflections.
- **Matte Ceramic**: Understated, elegant subsurface scattering simulation.

### 3. Real-Time Logic
- **Non-Interactive Mesh Rendering**: Optimized Three.js loop for zero-latency UI updates.
- **Zustand State Engine**: Atomic updates for every parameter from rotation drift to material roughness.

## 📦 Developer Guide

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Launch Developer Mode**:
   ```bash
   pnpm run dev
   ```

3. **Build Target**:
   ```bash
   pnpm run build
   ```

---

*Spatial Computing Lab — 3D Studio Architecture*
