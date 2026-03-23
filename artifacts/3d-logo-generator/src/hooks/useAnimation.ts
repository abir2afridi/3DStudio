import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '@/store/editorStore';

export function useAnimation(meshRef: React.RefObject<THREE.Object3D | null>) {
  const type = useEditorStore(s => s.animationType);
  const speed = useEditorStore(s => s.animationSpeed);
  const playing = useEditorStore(s => s.animationPlaying);
  const baseRotation = useRef(new THREE.Euler());
  const basePosition = useRef(new THREE.Vector3());
  const initialized = useRef(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      initialized.current = false;
      return;
    }
    
    const obj = meshRef.current;
    
    // Store base transform once when mesh appears
    if (!initialized.current) {
      baseRotation.current.copy(obj.rotation);
      basePosition.current.copy(obj.position);
      initialized.current = true;
    }

    if (!playing) return;

    const t = clock.getElapsedTime() * speed;
    const s = speed;

    // Reset before applying absolute animations
    if (['bounce', 'pendulum', 'wobble', 'orbit'].includes(type)) {
      obj.rotation.copy(baseRotation.current);
      obj.position.copy(basePosition.current);
    }

    switch (type) {
      case 'rotateY':
        obj.rotation.y += 0.01 * s;
        break;
      case 'bounce':
        obj.position.y = basePosition.current.y + Math.sin(t * 2) * 0.3;
        break;
      case 'spinTilt':
        obj.rotation.y += 0.01 * s;
        obj.rotation.x = Math.sin(t) * 0.3;
        break;
      case 'pendulum':
        obj.rotation.z = Math.sin(t * 1.5) * 0.4;
        break;
      case 'float':
        obj.position.y = basePosition.current.y + Math.sin(t) * 0.15;
        obj.rotation.y += 0.005 * s;
        break;
      case 'pulse':
        obj.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
        break;
      case 'wobble':
        obj.rotation.x = Math.sin(t * 2) * 0.1;
        obj.rotation.z = Math.cos(t * 1.5) * 0.1;
        break;
      case 'orbit':
        obj.position.x = basePosition.current.x + Math.sin(t) * 0.5;
        obj.position.z = basePosition.current.z + Math.cos(t) * 0.5;
        break;
      case 'heartbeat':
        const cycle = t % 1.5;
        let p = 1;
        if (cycle < 0.1) p = 1 + Math.sin(cycle * Math.PI * 10) * 0.1;
        else if (cycle > 0.2 && cycle < 0.3) p = 1 + Math.sin((cycle - 0.2) * Math.PI * 10) * 0.1;
        obj.scale.setScalar(p);
        break;
      case 'none':
      default:
        break;
    }
  });
}
