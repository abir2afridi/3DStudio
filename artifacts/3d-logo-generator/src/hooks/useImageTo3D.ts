import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useEditorStore } from '@/store/editorStore';
import { buildMesh } from '@/utils/meshBuilders';
import { disposeObject } from '@/utils/threeUtils';

export function useImageTo3D() {
  const [mesh, setMesh] = useState<THREE.Object3D | null>(null);
  const uploadedFile = useEditorStore(s => s.uploadedFile);
  const setProcessingState = useEditorStore(s => s.setProcessingState);
  
  // State dependencies that trigger a rebuild
  const threeDMode = useEditorStore(s => s.threeDMode);
  const layerCount = useEditorStore(s => s.layerCount);
  const colorSource = useEditorStore(s => s.colorSource);
  const colorMix = useEditorStore(s => s.colorMix);
  const thickness = useEditorStore(s => s.thickness);
  const bevel = useEditorStore(s => s.bevel);
  const bevelSize = useEditorStore(s => s.bevelSize);
  const bevelSegments = useEditorStore(s => s.bevelSegments);
  const smoothNormals = useEditorStore(s => s.smoothNormals);
  const scale = useEditorStore(s => s.scale);
  const invertImage = useEditorStore(s => (s as any).invertImage ?? false);
  const quality = useEditorStore(s => (s as any).quality ?? 'balanced');
  const smoothing = useEditorStore(s => (s as any).smoothing ?? 3);
  const textureScale = useEditorStore(s => (s as any).textureScale ?? 1.0);
  const textureOffsetX = useEditorStore(s => (s as any).textureOffsetX ?? 0.0);
  const textureOffsetY = useEditorStore(s => (s as any).textureOffsetY ?? 0.0);
  const textureRotation = useEditorStore(s => (s as any).textureRotation ?? 0.0);
  const materialTab = useEditorStore(s => s.materialTab);
  const presetMaterial = useEditorStore(s => s.presetMaterial);
  const customMaterial = useEditorStore(s => s.customMaterial);
  const studioDetail = useEditorStore(s => (s as any).studioDetail ?? true);
  const studioStyle = useEditorStore(s => (s as any).studioStyle ?? 'sculpted');
  const studioGlass = useEditorStore(s => (s as any).studioGlass ?? false);
  const studioRemoveHoles = useEditorStore(s => (s as any).studioRemoveHoles ?? false);
  
  const currentMeshRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!uploadedFile) {
      if (currentMeshRef.current) {
        disposeObject(currentMeshRef.current);
        currentMeshRef.current = null;
      }
      setMesh(null);
      return;
    }

    let isCancelled = false;

    const build = async () => {
      try {
        setProcessingState(true, 'Initializing...');
        
        const materialOpts = materialTab === 'preset' 
          ? { preset: presetMaterial } 
          : { custom: customMaterial };

        const opts = {
          threeDMode, layerCount, colorSource, colorMix,
          thickness, bevel, bevelSize, bevelSegments, smoothNormals,
          sidesMode: 'both' as const, centerOrigin: true, scale,
          quality, smoothing, invertImage,
          textureScale, textureOffsetX, textureOffsetY, textureRotation,
          studioDetail,
          studioStyle,
          studioGlass,
          studioRemoveHoles,
          material: materialOpts
        };

        const newMesh = await buildMesh(uploadedFile, opts, (step) => {
          if (!isCancelled) setProcessingState(true, step);
        });

        if (isCancelled) {
          disposeObject(newMesh);
          return;
        }

        if (currentMeshRef.current) disposeObject(currentMeshRef.current);
        currentMeshRef.current = newMesh;
        setMesh(newMesh);
        setProcessingState(false);
      } catch (err: any) {
        console.error(err);
        if (!isCancelled) {
          setProcessingState(false, '', err.message || 'Failed to process image');
        }
      }
    };

    // Debounce slightly to prevent rapid rebuilds on slider drag
    const timer = setTimeout(build, 150);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    uploadedFile, threeDMode, layerCount, colorSource, colorMix, thickness,
    bevel, bevelSize, bevelSegments, smoothNormals, scale, invertImage,
    quality, smoothing, textureScale, textureOffsetX, textureOffsetY, textureRotation,
    materialTab, presetMaterial, customMaterial, studioDetail, studioStyle, studioGlass, studioRemoveHoles, setProcessingState
  ]);

  return { mesh };
}
