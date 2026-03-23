import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { PresetMaterial, SurfaceTexture } from '@/types/editor';
import { Check } from 'lucide-react';

const PRESETS: { id: PresetMaterial; label: string; desc: string; color: string; accent: string }[] = [
  { id: 'chrome', label: 'Chrome', desc: 'Polished metal', color: '#b8b8c8', accent: '#e0e0f0' },
  { id: 'gold', label: 'Gold', desc: 'Warm gilded', color: '#d4a017', accent: '#ffd700' },
  { id: 'cosmic', label: 'Cosmic', desc: 'Violet gradient', color: '#6600ff', accent: '#aa44ff' },
  { id: 'galactic', label: 'Galactic', desc: 'Dark starfield', color: '#1a1a3a', accent: '#4444aa' },
];

const SURFACES: { id: SurfaceTexture; label: string }[] = [
  { id: 'none', label: 'Smooth' },
  { id: 'brushed', label: 'Brushed' },
  { id: 'hammered', label: 'Hammered' },
  { id: 'carbon', label: 'Carbon' },
  { id: 'wood', label: 'Wood' },
  { id: 'leather', label: 'Leather' },
];

function SliderRow({ label, value, min, max, step = 0.01, displayFn, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  displayFn?: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-medium text-foreground/80">{label}</label>
        <span className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground">{displayFn ? displayFn(value) : value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
    </div>
  );
}

export function MaterialsSection() {
  const {
    materialTab, presetMaterial, customMaterial,
    threeDMode, colorSource, colorMix,
    updateMaterial, updateShape
  } = useEditorStore();

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex bg-secondary p-1 rounded-md border border-foreground/5">
        {(['preset', 'custom'] as const).map(tab => (
          <button key={tab}
            onClick={() => updateMaterial({}, tab)}
            className={`flex-1 text-[11px] py-1.5 rounded font-medium capitalize transition-all ${
              materialTab === tab ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {materialTab === 'preset' && (
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map(p => {
             const active = presetMaterial === p.id;
             return (
              <button key={p.id}
                onClick={() => updateMaterial({ preset: p.id }, 'preset')}
                className={`relative flex flex-col items-center p-2 rounded-lg border transition-all ${
                  active
                    ? 'border-primary bg-primary/10 ring-1 ring-primary'
                    : 'border-border bg-card hover:bg-elevated hover:border-foreground/20'
                }`}>
                <div className="w-full aspect-video rounded-md mb-2 shadow-inner drop-shadow-sm flex-shrink-0 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${p.color}, ${p.accent})` }}>
                  {active && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-foreground/90 leading-tight text-center">{p.label}</div>
                <div className="text-[9px] text-muted-foreground mt-0.5 text-center">{p.desc}</div>
              </button>
             );
          })}
        </div>
      )}

      {materialTab === 'custom' && (
        <div className="space-y-4">
          {/* Color picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Base Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={customMaterial.color}
                onChange={e => updateMaterial({ custom: { color: e.target.value } as any })}
                className="w-10 h-8 rounded-md border border-foreground/20 cursor-pointer bg-transparent outline-none p-0" />
              <div className="flex-1 font-mono text-[11px] text-muted-foreground bg-secondary/50 border border-foreground/5 px-3 py-1.5 rounded-md">
                {customMaterial.color.toUpperCase()}
              </div>
            </div>
          </div>

          <SliderRow label="Metalness" value={customMaterial.metalness} min={0} max={1}
            displayFn={v => `${Math.round(v * 100)}%`}
            onChange={v => updateMaterial({ custom: { metalness: v } as any })} />

          <SliderRow label="Roughness" value={customMaterial.roughness} min={0} max={1}
            displayFn={v => `${Math.round(v * 100)}%`}
            onChange={v => updateMaterial({ custom: { roughness: v } as any })} />

          {/* Surface texture */}
          <div className="space-y-2 pt-2 border-t border-foreground/10">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Texture</label>
            <div className="grid grid-cols-3 gap-1.5">
              {SURFACES.map(s => (
                <button key={s.id}
                  onClick={() => updateMaterial({ custom: { surfaceTexture: s.id } as any })}
                  className={`text-[10px] py-1.5 px-2 rounded-md border transition-all ${
                    customMaterial.surfaceTexture === s.id
                      ? 'border-primary bg-primary/20 text-primary font-medium'
                      : 'border-foreground/5 text-muted-foreground hover:text-foreground hover:border-foreground/20 bg-secondary/50'
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {customMaterial.surfaceTexture !== 'none' && (
            <div className="pl-3 border-l-[1.5px] border-primary/30 space-y-3 ml-1 animate-in slide-in-from-left-2 pt-1">
              <SliderRow label="Strength" value={customMaterial.textureStrength}
                min={0} max={100} step={1} displayFn={v => `${Math.round(v)}%`}
                onChange={v => updateMaterial({ custom: { textureStrength: v } as any })} />
              <SliderRow label="Scale" value={customMaterial.textureSize}
                min={1} max={20} step={0.5} displayFn={v => `${v.toFixed(1)}x`}
                onChange={v => updateMaterial({ custom: { textureSize: v } as any })} />
            </div>
          )}
        </div>
      )}

      {/* Color Mix (Textured mode only) */}
      {(threeDMode === 'textured' || threeDMode === 'layered' || threeDMode === 'relief') && (
        <div className="pt-4 border-t border-foreground/10 space-y-4">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Color Source Blend</label>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-medium text-foreground/80">Image / Material Mix</label>
              <span className="text-[10px] bg-secondary/50 text-muted-foreground px-1.5 py-0.5 rounded">{colorMix}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={colorMix}
              onChange={e => updateShape({ colorMix: parseInt(e.target.value) })}
              className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          </div>

          <div className="flex bg-card p-1 rounded-md border border-foreground/5">
            {(['image', 'material'] as const).map(src => (
              <button key={src}
                onClick={() => updateShape({ colorSource: src })}
                className={`flex-1 text-[11px] py-1.5 rounded font-medium capitalize transition-all ${
                  colorSource === src ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {src === 'image' ? 'Image Texture' : 'Material Only'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
