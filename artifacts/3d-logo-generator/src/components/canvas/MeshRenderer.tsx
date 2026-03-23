import React, { useRef, Suspense } from 'react';
import * as THREE from 'three';
import { Text, Center, Float } from '@react-three/drei';
import { useImageTo3D } from '@/hooks/useImageTo3D';
import { useAnimation } from '@/hooks/useAnimation';
import { useEditorStore } from '@/store/editorStore';

export function MeshRenderer() {
  const { mesh } = useImageTo3D();
  const { 
    textEnabled, logoText, fontSize, textDepth, 
    textLetterSpacing, textColor, fontFamily,
    wireframeVisible
  } = useEditorStore();
  
  const groupRef = useRef<THREE.Group>(null);
  
  // Apply animations to the group wrapping the mesh
  useAnimation(groupRef);

  return (
    <group ref={groupRef}>
      {/* 3D Logo Mesh */}
      {mesh && (
        <primitive 
          object={mesh} 
          position={[0, textEnabled ? 0.8 : 0, 0]} 
        />
      )}

      {/* 3D Text Generation */}
      {textEnabled && logoText && (
        <Center position={[0, mesh ? -1.2 : 0, 0]}>
          <Text
            fontSize={fontSize / 100}
            maxWidth={10}
            lineHeight={1}
            letterSpacing={textLetterSpacing / 100}
            textAlign="center"
            font={getFontUrl(fontFamily)}
            anchorX="center"
            anchorY="middle"
            depthOffset={1}
          >
            {logoText}
            <meshPhysicalMaterial 
              color={textColor} 
              metalness={0.6}
              roughness={0.2}
              clearcoat={1}
              wireframe={wireframeVisible}
            />
          </Text>
        </Center>
      )}
    </group>
  );
}

function getFontUrl(family: string) {
  // Mapping of families to accessible .woff or .ttf URLs
  // Using reliable CDN for Three.js compatible fonts
  const fonts: Record<string, string> = {
    'Inter': 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
    'Roboto': 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.woff',
    'Outfit': 'https://fonts.gstatic.com/s/outfit/v11/QGYsz_RcYXStV86MLjM.woff',
    'Space Grotesk': 'https://fonts.gstatic.com/s/spacegrotesk/v15/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-g.woff',
    'Pacifico': 'https://fonts.gstatic.com/s/pacifico/v22/FwZY7WnL3M46uIs-N7JB.woff',
    'Bebas Neue': 'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK7jt6px649p0kc.woff'
  };
  return fonts[family] || fonts['Inter'];
}

