import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Center, Text3D } from '@react-three/drei';
import * as THREE from 'three';
import helvetiker from 'three/examples/fonts/helvetiker_bold.typeface.json';

export function Placeholder() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.5;
      meshRef.current.rotation.x = Math.cos(clock.getElapsedTime() * 0.3) * 0.2;
    }
  });

  return (
    <group>
      <Center>
        <Text3D
          ref={meshRef}
          font={helvetiker as any}
          size={1.5}
          height={0.4}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          3D
          <meshStandardMaterial 
            ref={materialRef}
            color="#8b5cf6" 
            metalness={0.8} 
            roughness={0.2}
            emissive="#4c1d95"
            emissiveIntensity={0.2}
          />
        </Text3D>
      </Center>
    </group>
  );
}
