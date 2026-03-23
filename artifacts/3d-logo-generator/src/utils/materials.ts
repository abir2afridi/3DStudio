import * as THREE from 'three';
import { MaterialOptions, PresetMaterial } from '@/types/editor';
import { generateTexture } from './textureGenerators';

export function buildSelectedMaterial(opts: { material: MaterialOptions }): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide });
  applyPresetToMaterial(mat, opts.material);
  return mat;
}

export function applyPresetToMaterial(mat: THREE.MeshStandardMaterial, options: MaterialOptions) {
  // Clear any existing procedural maps to prevent leaks if recreating
  if (mat.normalMap && mat.normalMap instanceof THREE.CanvasTexture) mat.normalMap.dispose();
  mat.normalMap = null;
  mat.map = null;

  if (options.preset) {
    switch (options.preset) {
      case 'chrome':
        mat.color.setHex(0xC0C0C0);
        mat.metalness = 1.0;
        mat.roughness = 0.05;
        mat.envMapIntensity = 2.5;
        mat.normalMap = generateTexture('brushed', 2);
        break;
      case 'gold':
        mat.color.setHex(0xFFD000);
        mat.metalness = 1.0;
        mat.roughness = 0.08;
        mat.envMapIntensity = 2.0;
        break;
      case 'cosmic':
        mat.color.setHex(0x6600ff); // Base color, full gradient requires custom shader or canvas map
        mat.metalness = 0.3;
        mat.roughness = 0.2;
        break;
      case 'galactic':
        mat.color.setHex(0x1a1a1a);
        mat.metalness = 0.5;
        mat.roughness = 0.3;
        mat.map = generateTexture('leather', 1); // Approximation for star field without external assets
        break;
    }
  } else if (options.custom) {
    mat.color.set(options.custom.color);
    mat.metalness = options.custom.metalness;
    mat.roughness = options.custom.roughness;
    if (options.custom.surfaceTexture !== 'none') {
      mat.normalMap = generateTexture(options.custom.surfaceTexture, options.custom.textureSize);
      if (mat.normalMap) {
        mat.normalScale.setScalar((options.custom.textureStrength / 100) * 3);
      }
    }
  }
  
  // Advanced maps not handled here for brevity, would require async loading
  mat.needsUpdate = true;
}
