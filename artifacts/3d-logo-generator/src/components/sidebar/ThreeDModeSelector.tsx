import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { 
  Layers, Image as ImageIcon, Mountain, Zap, Target, Sparkles, 
  Grid, Wand2, Diamond, Hexagon, CircleDashed, Palette, Scan, PenTool 
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
];

const QUALITIES: { id: GenerationQuality; label: string; hint: string }[] = [
  { id: 'draft',    label: 'Draft',    hint: 'Lower res' },
  { id: 'balanced', label: 'Balanced', hint: 'Recommended' },
  { id: 'high',     label: 'High',     hint: 'Fine detail' },
];

const SMOOTHING_LABELS = ['None', 'Minimal', 'Light', 'Balanced', 'Strong', 'Max'];

export function ThreeDModeSelector() {
  const { threeDMode, setThreeDMode, layerCount, quality, smoothing, updateShape } = useEditorStore() as any;

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
