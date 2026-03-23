export type ThreeDMode = 'textured' | 'layered' | 'relief' | 'voxel' | 'neon' | 'crystal' | 'wireframe' | 'inflated' | 'clay' | 'hologram' | 'blueprint';
export type GenerationQuality = 'draft' | 'balanced' | 'high';
export type AnimationType = 'none'|'rotateY'|'bounce'|'spinTilt'|'pendulum'|'float'|'pulse'|'wobble'|'orbit'|'heartbeat';
export type EnvironmentType = 'studio'|'sunset'|'forest'|'night'|'warehouse'|'none';
export type SurfaceTexture = 'none'|'brushed'|'hammered'|'carbon'|'wood'|'leather';
export type PresetMaterial = 'chrome'|'gold'|'cosmic'|'galactic';

export interface CustomMaterialOptions {
  color: string;
  metalness: number;
  roughness: number;
  surfaceTexture: SurfaceTexture;
  textureStrength: number;
  textureSize: number;
}

export interface AdvancedMapFiles {
  diffuse: File | null;
  roughness: File | null;
  normal: File | null;
}

export interface ExtractedColors {
  dominant: string[];
  imageData: ImageData;
  width: number;
  height: number;
}

export interface MaterialOptions {
  color?: string;
  metalness?: number;
  roughness?: number;
  preset?: PresetMaterial;
  custom?: CustomMaterialOptions;
  maps?: AdvancedMapFiles;
}

export interface ShapeOptions {
  thickness: number;
  bevel: boolean;
  bevelSize: number;
  bevelSegments: number;
  smoothNormals: boolean;
  sidesMode: 'both'|'front';
  centerOrigin: boolean;
  scale: number;
  threeDMode: ThreeDMode;
  layerCount: number;
  colorSource: 'image'|'material';
  colorMix: number;
  material: MaterialOptions;
  quality: GenerationQuality;
  smoothing: number;
  invertImage: boolean;
}

export interface AnimationOptions {
  type: AnimationType;
  speed: number;
  playing: boolean;
}

export interface SceneOptions {
  backgroundColor: string;
  transparentBackground: boolean;
  environment: EnvironmentType;
  environmentIntensity: number;
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  directionalPos: [number,number,number];
  pointLightEnabled: boolean;
  pointLightColor: string;
  pointLightIntensity: number;
  shadowEnabled: boolean;
  fogEnabled: boolean;
  fogColor: string;
  fogDensity: number;
  gridVisible: boolean;
  wireframeVisible: boolean;
  postProcessingEnabled: boolean;
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  vignetteEnabled: boolean;
  chromaticAberration: boolean;
  noiseEnabled: boolean;
  pixelateEnabled: boolean;
  pixelSize: number;
}

export interface ExportOptions {
  size: 'auto'|'portrait'|'square'|'landscape'|'custom';
  quality: 'fast'|'balanced'|'high';
  duration: number;
  fps: 24|30|60;
  customWidth: number;
  customHeight: number;
}

export interface EditorSnapshot {
  shape: ShapeOptions;
  materialTab: 'preset'|'custom'|'advanced';
  presetMaterial: PresetMaterial;
  customMaterial: CustomMaterialOptions;
  animation: AnimationOptions;
  scene: SceneOptions;
  threeDMode: ThreeDMode;
  text: {
    enabled: boolean;
    content: string;
    size: number;
    depth: number;
    fontFamily: string;
    letterSpacing: number;
    color: string;
  };
}

export interface EditorState {
  uploadedFile: File | null;
  uploadedImageUrl: string | null;
  extractedColors: ExtractedColors | null;
  
  threeDMode: ThreeDMode;
  layerCount: number;
  colorSource: 'image'|'material';
  colorMix: number;
  quality: GenerationQuality;
  smoothing: number;
  thickness: number;
  bevel: boolean;
  bevelSize: number;
  bevelSegments: number;
  smoothNormals: boolean;
  sidesMode: 'both'|'front';
  centerOrigin: boolean;
  scale: number;
  invertImage: boolean;
  
  // Text to 3D
  textEnabled: boolean;
  logoText: string;
  fontSize: number;
  fontFamily: string;
  textDepth: number;
  textLetterSpacing: number;
  textColor: string;
  
  materialTab: 'preset'|'custom'|'advanced';
  presetMaterial: PresetMaterial;
  customMaterial: CustomMaterialOptions;
  advancedMaps: AdvancedMapFiles;
  
  animationType: AnimationType;
  animationSpeed: number;
  animationPlaying: boolean;
  
  backgroundColor: string;
  transparentBackground: boolean;
  environment: EnvironmentType;
  environmentIntensity: number;
  ambientIntensity: number;
  ambientColor: string;
  directionalIntensity: number;
  directionalColor: string;
  directionalPos: [number,number,number];
  pointLightEnabled: boolean;
  pointLightColor: string;
  pointLightIntensity: number;
  shadowEnabled: boolean;
  fogEnabled: boolean;
  fogColor: string;
  fogDensity: number;
  gridVisible: boolean;
  wireframeVisible: boolean;
  postProcessingEnabled: boolean;
  bloomEnabled: boolean;
  bloomIntensity: number;
  bloomThreshold: number;
  vignetteEnabled: boolean;
  chromaticAberration: boolean;
  noiseEnabled: boolean;
  pixelateEnabled: boolean;
  pixelSize: number;
  
  exportSize: 'auto'|'portrait'|'square'|'landscape'|'custom';
  exportQuality: 'fast'|'balanced'|'high';
  exportDuration: number;
  exportFPS: 24|30|60;
  customWidth: number;
  customHeight: number;
  
  sidebarCollapsed: boolean;
  exportPanelCollapsed: boolean;
  fullscreen: boolean;
  projectName: string;
  theme: 'light' | 'dark';
  
  isProcessing: boolean;
  processingStep: string;
  processingError: string | null;
  
  history: EditorSnapshot[];
  historyIndex: number;
  
  exportRequested: string | null; // Added for export functionality
  
  // Actions
  setUploadedFile: (f: File | null) => void;
  setThreeDMode: (m: ThreeDMode) => void;
  updateShape: (p: Partial<ShapeOptions>) => void;
  updateText: (p: Partial<{ 
    textEnabled: boolean; 
    logoText: string; 
    fontSize: number; 
    fontFamily: string; 
    textDepth: number; 
    textLetterSpacing: number; 
    textColor: string;
  }>) => void;
  updateMaterial: (p: Partial<MaterialOptions>, tab?: 'preset'|'custom'|'advanced') => void;
  updateAnimation: (p: Partial<AnimationOptions>) => void;
  updateScene: (p: Partial<SceneOptions>) => void;
  updateExport: (p: Partial<ExportOptions>) => void;
  setProcessingState: (isProcessing: boolean, step?: string, error?: string | null) => void;
  setColors: (colors: ExtractedColors) => void;
  toggleSidebar: () => void;
  toggleExportPanel: () => void;
  toggleFullscreen: () => void;
  setProjectName: (name: string) => void;
  undo: () => void;
  redo: () => void;
  resetAll: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  requestExport: (format: string | null) => void; // Added for export functionality
}
