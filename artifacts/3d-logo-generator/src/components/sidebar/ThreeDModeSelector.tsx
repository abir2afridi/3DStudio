import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { 
  Layers, Image as ImageIcon, Mountain, Zap, Target, Sparkles, 
  Grid, Wand2, Diamond, Hexagon, CircleDashed, Palette, Scan, PenTool, Box, RotateCcw, Layout
} from 'lucide-react';
import { ThreeDMode, GenerationQuality } from '@/types/editor';

const MODES: { id: ThreeDMode; icon: React.ReactNode; label: string; desc: string; badge?: string }[] = [
  { id: 'textured', icon: <ImageIcon className="w-4 h-4" />, label: 'Textured', desc: 'Extrudes silhouette and maps original image to front.', badge: 'Photo' },
  { id: 'layered', icon: <Layers className="w-4 h-4" />, label: 'Layered', desc: 'Clusters colors into separate depth layers.', badge: 'Flat' },
  { id: 'relief', icon: <Mountain className="w-4 h-4" />, label: 'Relief', desc: 'Uses brightness as height map for sculpted surface.', badge: 'Gradient' },
  { id: 'voxel', icon: <Grid className="w-4 h-4" />, label: 'Voxel', desc: 'Translates pixels into a 3D grid of cubes.', badge: 'Retro' },
  { id: 'neon', icon: <Wand2 className="w-4 h-4" />, label: 'Neon', desc: 'Extracts contour into glowing 3D tubes.', badge: 'Bloom' },
  { id: 'crystal', icon: <Diamond className="w-4 h-4" />, label: 'Crystal', desc: 'Transparent glass with index of refraction & transmission.', badge: 'Premium' },
  { id: 'wireframe', icon: <Hexagon className="w-4 h-4" />, label: 'Wireframe', desc: 'Futuristic glowing wireframe topology.', badge: 'Sci-Fi' },
  { id: 'inflated', icon: <CircleDashed className="w-4 h-4" />, label: 'Inflated', desc: 'Soft, highly rounded puffed-out surfaces.', badge: 'Organic' },
  { id: 'clay', icon: <Palette className="w-4 h-4" />, label: 'Clay', desc: 'Hand-crafted matte look with soft rounded edges.', badge: 'Artistic' },
  { id: 'hologram', icon: <Scan className="w-4 h-4" />, label: 'Hologram', desc: 'Translucent glowing shell with scanning energy.', badge: 'FX' },
  { id: 'blueprint', icon: <PenTool className="w-4 h-4" />, label: 'Blueprint', desc: 'Technical architectural line-work and fill.', badge: 'Draft' },
  { id: 'studio', icon: <Target className="w-4 h-4" />, label: 'Studio', desc: 'Pure 3D geometry with premium materials (no image texture).', badge: 'Brand' },
];

const QUALITIES: { id: GenerationQuality; label: string; hint: string }[] = [
  { id: 'draft',    label: 'Draft',    hint: 'Lower res' },
  { id: 'balanced', label: 'Balanced', hint: 'Recommended' },
  { id: 'high',     label: 'High',     hint: 'Fine detail' },
];

const SMOOTHING_LABELS = ['None', 'Minimal', 'Light', 'Balanced', 'Strong', 'Max'];

export function ThreeDModeSelector() {
  const { 
    threeDMode, setThreeDMode, layerCount, quality, smoothing, 
    textureScale, textureOffsetX, textureOffsetY, textureRotation,
    studioDetail, studioStyle, studioGlass, studioRemoveHoles, updateShape 
  } = useEditorStore() as any;

  const currentQuality: GenerationQuality = quality ?? 'balanced';
  const currentSmoothing: number = smoothing ?? 3;
  const activeModeObj = MODES.find((m) => m.id === threeDMode);

  return (
    <div className="space-y-4">

      {/* ── Compact Grid of Modes ── */}
      <div className="grid grid-cols-2 gap-2">
        {MODES.map((mode) => {
          const active = threeDMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setThreeDMode(mode.id)}
              className={`flex items-center gap-2.5 p-2 rounded-lg border transition-all duration-200 ${
                active
                  ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-sm text-primary'
                  : 'bg-card border-border hover:bg-elevated hover:border-white/20 text-muted-foreground hover:text-white'
              }`}
            >
              <div className="flex-shrink-0">{mode.icon}</div>
              <span className="text-xs font-medium tracking-tight whitespace-nowrap">{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Mode Description Box */}
      {activeModeObj && (
        <div className="p-3 bg-secondary/40 border border-foreground/10 rounded-lg">
          <div className="flex justify-between items-center mb-1">
             <span className="text-[11px] font-semibold text-foreground/80">{activeModeObj.label} Mode</span>
             {activeModeObj.badge && <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">{activeModeObj.badge}</span>}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {activeModeObj.desc}
          </p>
        </div>
      )}

      {/* ── Mode-specific options ── */}
      {threeDMode === 'layered' && (
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-foreground/80">Color Layers</label>
            <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">{layerCount}</span>
          </div>
          <input
            type="range" min="2" max="12" step="1"
            value={layerCount}
            onChange={(e) => updateShape({ layerCount: parseInt(e.target.value) })}
            className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />
        </div>
      )}

      {threeDMode === 'studio' && (
        <div className="space-y-4 pt-3 border-t border-foreground/10 animate-in fade-in slide-in-from-top-2">
          <div className="space-y-4 pt-2 mt-2">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Studio Mode Style</span>
            <div className="grid grid-cols-2 gap-2 bg-black/20 p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => updateShape({ studioStyle: 'solid' })}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all ${
                  studioStyle === 'solid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Box size={14} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">Solid</span>
              </button>
              <button
                onClick={() => updateShape({ studioStyle: 'sculpted' })}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all ${
                  studioStyle === 'sculpted' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers size={14} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">Sculpted</span>
              </button>
              <button
                onClick={() => updateShape({ studioStyle: 'layered' })}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all ${
                   studioStyle === 'layered' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layout size={14} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">Structure</span>
              </button>
              <button
                onClick={() => updateShape({ studioStyle: 'outline' })}
                className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all ${
                   studioStyle === 'outline' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <Scan size={14} />
                <span className="text-[9px] font-bold uppercase tracking-tighter">Outline</span>
              </button>
            </div>

            <p className="text-[10px] text-white/40 leading-relaxed italic px-1">
              {studioStyle === 'solid' && "Solid: Creates a single clean 3D block from the logo's outer edge."}
              {studioStyle === 'sculpted' && "Sculpted: Keeps the solid block but carves detail into the surface."}
              {studioStyle === 'layered' && "Structure: Multi-layer wireframe net. Highly detailed and spaced out."}
              {studioStyle === 'outline' && "Outline: Single dense layer of detailed lines. Clean and premium look."}
            </p>

            {(studioStyle === 'sculpted' || studioStyle === 'layered' || studioStyle === 'outline') && (
              <div className="space-y-4 px-1 animate-in zoom-in-95">
                {/* ── Detail Slider ── */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Layers size={10} /> Detail Complexity
                    </span>
                    <span className="text-primary font-mono bg-primary/10 px-1.5 rounded">{layerCount ?? 4}</span>
                  </div>
                  <input
                    type="range" min="2" max="10" step="1"
                    value={layerCount ?? 4}
                    onChange={(e) => updateShape({ layerCount: parseInt(e.target.value) })}
                    className="w-full h-1 accent-primary bg-black/30 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
                </div>

                {/* ── Glass Base Toggle (Sculpted only) ── */}
                {studioStyle === 'sculpted' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => updateShape({ studioGlass: !studioGlass })}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                        studioGlass ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-black/20 border-white/5 text-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Diamond size={12} className={studioGlass ? 'animate-pulse' : ''} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">See-Through Base</span>
                      </div>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${studioGlass ? 'bg-primary' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${studioGlass ? 'left-3.5' : 'left-0.5'}`} />
                      </div>
                    </button>

                    <button
                      onClick={() => updateShape({ studioRemoveHoles: !studioRemoveHoles })}
                      className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                        studioRemoveHoles ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-black/20 border-white/5 text-white/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Scan size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Solid Surface (Fill Gaps)</span>
                      </div>
                      <div className={`w-6 h-3 rounded-full relative transition-all ${studioRemoveHoles ? 'bg-primary' : 'bg-white/10'}`}>
                        <div className={`absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all ${studioRemoveHoles ? 'left-3.5' : 'left-0.5'}`} />
                      </div>
                    </button>
                    {studioRemoveHoles && (
                      <p className="text-[9px] text-primary/60 italic leading-tight px-1">
                        ✨ Small holes and internal gaps will be filled for a solid sculpture look.
                      </p>
                    )}
                  </div>
                )}

                {/* ── Net/Wireframe Toggle (Structure only) ── */}
                {studioStyle === 'layered' && (
                   <div className="flex flex-col gap-1.5">
                      <p className="text-[9px] text-white/40 italic leading-tight">
                        🕸️ Fish-net mode: Logo outlines become 3D tubes connected by vertical struts. Fully see-through from any direction.
                      </p>
                   </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {threeDMode === 'textured' && (
        <div className="space-y-3 pt-3 border-t border-foreground/10 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Scan className="w-3 h-3" /> Texture Mapping
            </label>
            <button 
              onClick={() => updateShape({ textureScale: 1.0, textureOffsetX: 0, textureOffsetY: 0, textureRotation: 0 })}
              className="text-[9px] bg-primary/15 text-primary border border-primary/20 hover:bg-primary/25 px-1.5 py-0.5 rounded transition-all flex items-center gap-1 uppercase font-bold tracking-tighter"
              title="Align to corners perfectly"
            >
              <Zap className="w-2.5 h-2.5" /> Auto Adjust
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Zoom / Scale */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">ZOOM LEVEL</span>
                <span className="text-primary font-mono bg-primary/10 px-1 rounded">{textureScale.toFixed(2)}x</span>
              </div>
              <input
                type="range" min="0.5" max="3" step="0.01"
                value={textureScale}
                onChange={(e) => updateShape({ textureScale: parseFloat(e.target.value) })}
                className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
               {/* Offset X */}
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-muted-foreground uppercase">Offset X</span>
                    <span className="text-foreground">{Math.round(textureOffsetX)}%</span>
                  </div>
                  <input
                    type="range" min="-100" max="100" step="1"
                    value={textureOffsetX}
                    onChange={(e) => updateShape({ textureOffsetX: parseInt(e.target.value) })}
                    className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
               </div>
               {/* Offset Y */}
               <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[9px]">
                    <span className="text-muted-foreground uppercase">Offset Y</span>
                    <span className="text-foreground">{Math.round(textureOffsetY)}%</span>
                  </div>
                  <input
                    type="range" min="-100" max="100" step="1"
                    value={textureOffsetY}
                    onChange={(e) => updateShape({ textureOffsetY: parseInt(e.target.value) })}
                    className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                  />
               </div>
            </div>

            {/* Rotation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground uppercase">TEXTURE ANGLE</span>
                <span className="text-foreground font-mono">{Math.round(textureRotation)}°</span>
              </div>
              <input
                type="range" min="-180" max="180" step="1"
                value={textureRotation}
                onChange={(e) => updateShape({ textureRotation: parseInt(e.target.value) })}
                className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Generation Quality ── */}
      <div className="space-y-3 pt-3 border-t border-foreground/10">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Target className="w-3 h-3" /> Mesh Quality
        </label>
        <div className="flex bg-secondary p-1 rounded-md border border-foreground/5">
          {QUALITIES.map((q) => {
            const active = currentQuality === q.id;
            return (
              <button
                key={q.id}
                title={q.hint}
                onClick={() => updateShape({ quality: q.id })}
                className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-all ${
                  active ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {q.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Contour Smoothing ── */}
      <div className="space-y-3 pt-3 border-t border-foreground/10">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Zap className="w-3 h-3" /> Smoothing
        </label>
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-foreground/80">Edge Curve</label>
          <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">{SMOOTHING_LABELS[currentSmoothing]}</span>
        </div>
        <input
          type="range" min="0" max="5" step="1"
          value={currentSmoothing}
          onChange={(e) => updateShape({ smoothing: parseInt(e.target.value) })}
          className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>

    </div>
  );
}
