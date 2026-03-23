import { create } from 'zustand';
import { EditorState, EditorSnapshot } from '@/types/editor';

const initialState = {
  uploadedFile: null,
  uploadedImageUrl: null,
  extractedColors: null,
  
  threeDMode: 'textured' as const,
  layerCount: 6,
  colorSource: 'image' as const,
  colorMix: 0,
  quality: 'balanced' as const,
  smoothing: 3,
  thickness: 1,
  bevel: true,
  bevelSize: 4,
  bevelSegments: 4,
  smoothNormals: true,
  sidesMode: 'both' as const,
  centerOrigin: true,
  scale: 1.0,
  invertImage: false,
  textureScale: 1.0,
  textureOffsetX: 0.0,
  textureOffsetY: 0.0,
  textureRotation: 0.0,
  studioDetail: true,
  studioStyle: 'sculpted' as const,
  studioGlass: false,
  studioRemoveHoles: false,
  
  // Text to 3D state
  textEnabled: false,
  logoText: '3D STUDIO',
  fontSize: 40,
  fontFamily: 'Inter',
  textDepth: 5,
  textLetterSpacing: 0,
  textColor: '#ffffff',
  
  materialTab: 'preset' as const,
  presetMaterial: 'chrome' as const,
  customMaterial: {
    color: '#8b5cf6',
    metalness: 0.5,
    roughness: 0.2,
    surfaceTexture: 'none' as const,
    textureStrength: 50,
    textureSize: 5
  },
  advancedMaps: { diffuse: null, roughness: null, normal: null },
  
  animationType: 'rotateY' as const,
  animationSpeed: 1.0,
  animationPlaying: true,
  
  backgroundColor: '#0a0a0a',
  transparentBackground: false,
  environment: 'studio' as const,
  environmentIntensity: 0.2,
  ambientIntensity: 0.2,
  ambientColor: '#ffffff',
  directionalIntensity: 1.5,
  directionalColor: '#ffffff',
  directionalPos: [2, 3, 4] as [number, number, number],
  pointLightEnabled: false,
  pointLightColor: '#8b5cf6',
  pointLightIntensity: 1.0,
  shadowEnabled: true,
  fogEnabled: false,
  fogColor: '#111111',
  fogDensity: 0.05,
  gridVisible: true,
  wireframeVisible: false,
  postProcessingEnabled: true,
  bloomEnabled: true,
  bloomIntensity: 1.5,
  bloomThreshold: 0.8,
  vignetteEnabled: true,
  chromaticAberration: false,
  noiseEnabled: false,
  pixelateEnabled: false,
  pixelSize: 4,
  
  exportSize: 'square' as const,
  exportQuality: 'balanced' as const,
  exportDuration: 3000,
  exportFPS: 30 as const,
  customWidth: 1080,
  customHeight: 1080,
  
  sidebarCollapsed: false,
  exportPanelCollapsed: false,
  fullscreen: false,
  projectName: 'My 3D Logo',
  theme: 'dark' as const,
  
  isProcessing: false,
  processingStep: '',
  processingError: null,
  
  exportRequested: null,
  
  history: [],
  historyIndex: -1,
};

const createSnapshot = (state: any): EditorSnapshot => ({
  shape: {
    thickness: state.thickness,
    bevel: state.bevel,
    bevelSize: state.bevelSize,
    bevelSegments: state.bevelSegments,
    smoothNormals: state.smoothNormals,
    sidesMode: state.sidesMode,
    centerOrigin: state.centerOrigin,
    scale: state.scale,
    threeDMode: state.threeDMode,
    layerCount: state.layerCount,
    colorSource: state.colorSource,
    colorMix: state.colorMix,
    quality: state.quality,
    smoothing: state.smoothing,
    invertImage: state.invertImage,
    textureScale: state.textureScale,
    textureOffsetX: state.textureOffsetX,
    textureOffsetY: state.textureOffsetY,
    textureRotation: state.textureRotation,
    studioDetail: state.studioDetail,
    studioStyle: state.studioStyle,
    studioGlass: state.studioGlass,
    studioRemoveHoles: state.studioRemoveHoles,
    material: {} 
  },
  materialTab: state.materialTab,
  presetMaterial: state.presetMaterial,
  customMaterial: { ...state.customMaterial },
  animation: {
    type: state.animationType,
    speed: state.animationSpeed,
    playing: state.animationPlaying
  },
  scene: {
    backgroundColor: state.backgroundColor,
    transparentBackground: state.transparentBackground,
    environment: state.environment,
    environmentIntensity: state.environmentIntensity,
    ambientIntensity: state.ambientIntensity,
    ambientColor: state.ambientColor,
    directionalIntensity: state.directionalIntensity,
    directionalColor: state.directionalColor,
    directionalPos: state.directionalPos ? [state.directionalPos[0], state.directionalPos[1], state.directionalPos[2]] : [2, 3, 4],
    pointLightEnabled: state.pointLightEnabled,
    pointLightColor: state.pointLightColor,
    pointLightIntensity: state.pointLightIntensity,
    shadowEnabled: state.shadowEnabled,
    fogEnabled: state.fogEnabled,
    fogColor: state.fogColor,
    fogDensity: state.fogDensity,
    gridVisible: state.gridVisible,
    wireframeVisible: state.wireframeVisible,
    postProcessingEnabled: state.postProcessingEnabled,
    bloomEnabled: state.bloomEnabled,
    bloomIntensity: state.bloomIntensity,
    bloomThreshold: state.bloomThreshold,
    vignetteEnabled: state.vignetteEnabled,
    chromaticAberration: state.chromaticAberration,
    noiseEnabled: state.noiseEnabled,
    pixelateEnabled: state.pixelateEnabled,
    pixelSize: state.pixelSize
  },
  text: {
    enabled: state.textEnabled,
    content: state.logoText,
    size: state.fontSize,
    fontFamily: state.fontFamily,
    depth: state.textDepth,
    letterSpacing: state.textLetterSpacing,
    color: state.textColor
  },
  threeDMode: state.threeDMode
});

export const useEditorStore = create<EditorState>((set, get) => ({
  ...initialState,
  
  setUploadedFile: (f) => {
    const currentUrl = get().uploadedImageUrl;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    
    set({ 
      uploadedFile: f, 
      uploadedImageUrl: f ? URL.createObjectURL(f) : null,
      processingError: null 
    });
    
    // Save history
    const state = get();
    const snap = createSnapshot(state);
    set(state => {
      const newHistory = [...state.history.slice(0, state.historyIndex + 1), snap].slice(-50);
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    });
  },
  
  setThreeDMode: (m) => set({ threeDMode: m }),
  
  updateShape: (p) => set((state) => ({ ...state, ...p })),
  updateText: (p) => set((state) => ({ ...state, ...p })),
  
  updateMaterial: (p, tab) => set((state) => {
    const updates: any = {};
    if (tab) updates.materialTab = tab;
    if (p.preset) updates.presetMaterial = p.preset;
    if (p.custom) updates.customMaterial = { ...state.customMaterial, ...p.custom };
    if (p.maps) updates.advancedMaps = { ...state.advancedMaps, ...p.maps };
    return updates;
  }),
  
  updateAnimation: (p) => set((state) => ({
    animationType: p.type !== undefined ? p.type : state.animationType,
    animationSpeed: p.speed !== undefined ? p.speed : state.animationSpeed,
    animationPlaying: p.playing !== undefined ? p.playing : state.animationPlaying,
  })),
  
  updateScene: (p) => set((state) => ({ ...state, ...p })),
  
  updateExport: (p) => set((state) => ({
    exportSize: p.size !== undefined ? p.size : state.exportSize,
    exportQuality: p.quality !== undefined ? p.quality : state.exportQuality,
    exportDuration: p.duration !== undefined ? p.duration : state.exportDuration,
    exportFPS: p.fps !== undefined ? p.fps : state.exportFPS,
    customWidth: p.customWidth !== undefined ? p.customWidth : state.customWidth,
    customHeight: p.customHeight !== undefined ? p.customHeight : state.customHeight,
  })),
  
  setProcessingState: (isProcessing, step = '', error = null) => set({ isProcessing, processingStep: step, processingError: error }),
  
  setColors: (colors) => set({ extractedColors: colors }),
  
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleExportPanel: () => set((state) => ({ exportPanelCollapsed: !state.exportPanelCollapsed })),
  toggleFullscreen: () => set((state) => ({ fullscreen: !state.fullscreen })),
  
  setProjectName: (name) => set({ projectName: name }),
  
  undo: () => set((state) => {
    if (state.historyIndex > 0) {
      const newIdx = state.historyIndex - 1;
      const snap = state.history[newIdx];
      return {
        ...state,
        ...snap.shape,
        ...snap.animation,
        ...snap.scene,
        threeDMode: snap.threeDMode,
        materialTab: snap.materialTab,
        presetMaterial: snap.presetMaterial,
        customMaterial: snap.customMaterial,
        historyIndex: newIdx
      };
    }
    return state;
  }),
  
  redo: () => set((state) => {
    if (state.historyIndex < state.history.length - 1) {
      const newIdx = state.historyIndex + 1;
      const snap = state.history[newIdx];
      return {
        ...state,
        ...snap.shape,
        ...snap.animation,
        ...snap.scene,
        threeDMode: snap.threeDMode,
        materialTab: snap.materialTab,
        presetMaterial: snap.presetMaterial,
        customMaterial: snap.customMaterial,
        historyIndex: newIdx
      };
    }
    return state;
  }),
  
  resetAll: () => {
    const currentUrl = get().uploadedImageUrl;
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    set({ ...initialState });
  },
  
  setTheme: (t) => {
    set({ theme: t });
    // Update body class for tailwind dark mode if needed
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  requestExport: (format) => set({ exportRequested: format })
}));
