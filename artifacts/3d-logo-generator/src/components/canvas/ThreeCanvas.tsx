import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration, Noise, Pixelation } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useEditorStore } from '@/store/editorStore';
import { MeshRenderer } from './MeshRenderer';
import { ExportManager } from './ExportManager';
import { Placeholder } from './Placeholder';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function ThreeCanvas() {
  const { 
    uploadedFile, isProcessing, processingStep, processingError,
    environment, environmentIntensity, backgroundColor, transparentBackground,
    ambientIntensity, ambientColor, directionalIntensity, directionalColor, directionalPos,
    pointLightEnabled, pointLightColor, pointLightIntensity,
    shadowEnabled, gridVisible, fogEnabled, fogColor, fogDensity,
    postProcessingEnabled, bloomEnabled, bloomIntensity, bloomThreshold, vignetteEnabled,
    chromaticAberration, noiseEnabled, pixelateEnabled, pixelSize,
    textEnabled, logoText
  } = useEditorStore();

  const [showModal, setShowModal] = React.useState(false);
  const prevProcessing = React.useRef(isProcessing);

  // Delay showing the modal to prevent flickering for fast updates
  React.useEffect(() => {
    let timer: any;
    if (isProcessing) {
      timer = setTimeout(() => setShowModal(true), 250);
    } else {
      setShowModal(false);
      clearTimeout(timer);
    }
    return () => clearTimeout(timer);
  }, [isProcessing]);

  React.useEffect(() => {
    if (prevProcessing.current && !isProcessing && !processingError) {
      toast.success('3D Logo Updated', {
        icon: '✨',
      });
    }
    prevProcessing.current = isProcessing;
  }, [isProcessing, processingError]);

  return (
    <div className="relative w-full h-full bg-background overflow-hidden">
      
      {/* Premium Loading Overlay */}
      <AnimatePresence>
        {isProcessing && showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative group overflow-hidden"
            >
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-cyan-500/50 rounded-2xl blur-xl opacity-25 group-hover:opacity-40 transition-opacity duration-1000 animate-pulse"></div>
              
              <div className="relative bg-card/90 border border-foreground/10 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-[320px] w-full text-center overflow-hidden">
                {/* Visual indicator */}
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-[3px] border-primary/10 border-t-primary"
                  />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-20 h-20 rounded-full border border-dashed border-cyan-500/30 scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Sparkles className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-display font-bold text-foreground tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
                      Processing 3D
                    </h3>
                    <div className="flex items-center gap-2 mt-1 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                        {processingStep || 'Computing Mesh'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Simulated Progress Bar */}
                <div className="w-full space-y-2">
                  <div className="w-full h-1.5 bg-foreground/5 rounded-full overflow-hidden relative border border-white/5">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_100%] animate-gradient"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-medium text-muted-foreground uppercase tracking-widest px-1">
                    <span>Neural Engine</span>
                    <span className="animate-pulse">Active</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-foreground/5 w-full">
                  <p className="text-[10px] text-muted-foreground/60 italic">
                    Optimizing polygons and lighting...
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Overlay */}
      {processingError && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-destructive/10 border-4 border-destructive/50">
          <div className="bg-card p-6 rounded-2xl border border-destructive/20 shadow-2xl flex flex-col items-center gap-4 text-center max-w-md">
            <h3 className="text-xl font-display text-destructive">Processing Failed</h3>
            <p className="text-muted-foreground">{processingError}</p>
            <button 
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors mt-2"
              onClick={() => useEditorStore.getState().setProcessingState(false, '', null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ 
          preserveDrawingBuffer: true, 
          antialias: true, 
          alpha: true, 
          powerPreference: 'high-performance',
          outputColorSpace: THREE.SRGBColorSpace,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15 // Slightly punchy
        }}
        shadows={shadowEnabled}
      >
        {!transparentBackground && <color attach="background" args={[backgroundColor]} />}
        
        {fogEnabled && <fog attach="fog" args={[fogColor, 5, 15 + (1-fogDensity)*20]} />}

        {/* Improved Lighting Setup */}
        <ambientLight intensity={ambientIntensity} color={ambientColor} />
        <directionalLight 
          position={directionalPos} 
          intensity={directionalIntensity * 1.2} 
          color={directionalColor} 
          castShadow={shadowEnabled} 
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
          shadow-normalBias={0.02}
        />
        
        {/* Soft fill lights for contrast */}
        <directionalLight position={[-4, 1, 3]} intensity={0.5} color="#eef6ff" />
        <directionalLight position={[3, -2, -3]} intensity={0.4} color="#fff0f0" />
        
        {/* Premium Rim Lights (Backlighting) */}
        <spotLight 
          position={[-5, 5, -5]} 
          intensity={2.0} 
          angle={0.15} 
          penumbra={1} 
          color={directionalColor} 
        />
        <spotLight 
          position={[5, 2, -5]} 
          intensity={1.5} 
          angle={0.2} 
          penumbra={1} 
          color="#ffffff" 
        />
        
        {/* Dynamic Highlight Spotlight */}
        <spotLight 
          position={[0, 5, 2]} 
          intensity={1.0} 
          penumbra={1} 
          angle={Math.PI / 4} 
          color="#ffffff"
          castShadow={shadowEnabled}
          shadow-bias={-0.0001}
        />

        {pointLightEnabled && (
          <pointLight position={[0, 2, 2]} intensity={pointLightIntensity} color={pointLightColor} />
        )}

        {/* Environment */}
        {environment !== 'none' && (
          <Suspense fallback={null}>
            <Environment preset={environment as any} background={false} environmentIntensity={environmentIntensity} />
          </Suspense>
        )}

        {/* Grid & Shadows */}
        {gridVisible && <Grid infiniteGrid fadeDistance={20} sectionColor="#555" cellColor="#333" position={[0, -2, 0]} />}
        {shadowEnabled && <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4} />}

        {/* Content */}
        <Suspense fallback={null}>
          <ExportManager />
          {(uploadedFile || textEnabled) && !processingError ? <MeshRenderer /> : <Placeholder />}
        </Suspense>

        {/* Controls */}
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          makeDefault
          maxDistance={20}
          minDistance={1}
        />

        {/* Post Processing */}
        {postProcessingEnabled && (
          <EffectComposer>
            { (bloomEnabled ? <Bloom luminanceThreshold={bloomThreshold} luminanceSmoothing={0.9} height={300} intensity={bloomIntensity} /> : null) as any }
            { (vignetteEnabled ? <Vignette eskil={false} offset={0.1} darkness={1.1} /> : null) as any }
            { (chromaticAberration ? <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} /> : null) as any }
            { (noiseEnabled ? <Noise opacity={0.05} /> : null) as any }
            { (pixelateEnabled ? <Pixelation granularity={pixelSize} /> : null) as any }
          </EffectComposer>
        )}
      </Canvas>

      {/* Hints */}
      {!uploadedFile && !isProcessing && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-black/50 backdrop-blur border border-white/10 px-6 py-3 rounded-full border-dashed">
            <p className="text-white/70 text-sm font-medium">Drop your logo here to see it in 3D</p>
          </div>
        </div>
      )}
    </div>
  );
}
