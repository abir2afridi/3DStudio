import * as THREE from 'three';

export function disposeObject(obj: THREE.Object3D) {
  if (!obj) return;
  obj.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => disposeMaterial(m));
        } else {
          disposeMaterial(child.material);
        }
      }
    }
  });
}

function disposeMaterial(mat: THREE.Material) {
  mat.dispose();
  // @ts-ignore
  if (mat.map) mat.map.dispose();
  // @ts-ignore
  if (mat.normalMap) mat.normalMap.dispose();
  // @ts-ignore
  if (mat.roughnessMap) mat.roughnessMap.dispose();
}
