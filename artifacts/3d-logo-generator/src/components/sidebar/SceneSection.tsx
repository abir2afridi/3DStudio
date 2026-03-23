import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { EnvironmentType } from '@/types/editor';

const ENVIRONMENTS: { id: EnvironmentType; label: string }[] = [
  { id: 'studio',    label: 'Studio' },
  { id: 'sunset',    label: 'Sunset' },
  { id: 'forest',    label: 'Forest' },
  { id: 'night',     label: 'Night' },
  { id: 'warehouse', label: 'Warehouse' },
  { id: 'none',      label: 'None' },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-4 w-8 rounded-full transition-all duration-200 outline-none ${
        checked ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`inline-block w-2.5 h-2.5 transform rounded-full bg-background transition-all duration-200 ${
          checked ? 'translate-x-[18px]' : 'translate-x-[3.5px]'
        }`}
      />
    </button>
  );
}

function SliderRow({ label, value, min, max, step = 0.1, displayFn, onChange }: {
  label: string; value: number; min: number; max: number; step?: number;
  displayFn?: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-medium text-foreground/80">{label}</label>
        <span className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground">{displayFn ? displayFn(value) : value.toFixed(1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
    </div>
  );
}

export function SceneSection() {
  const {
    backgroundColor, transparentBackground,
    environment, environmentIntensity,
    ambientIntensity, directionalIntensity,
    shadowEnabled, gridVisible,
    postProcessingEnabled, bloomEnabled, bloomIntensity, bloomThreshold, vignetteEnabled,
    updateScene
  } = useEditorStore();

  return (
    <div className="space-y-6">
      {/* Background */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Atmosphere</p>
        <div className="space-y-3.5 bg-secondary/20 p-3 rounded-lg border border-foreground/5">
          <label className="flex items-center justify-between">
            <span className="text-[11px] text-foreground/80">Transparency</span>
            <Toggle checked={transparentBackground} onChange={v => updateScene({ transparentBackground: v })} />
          </label>
          {!transparentBackground && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-foreground/80">Canvas Color</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground font-mono">{backgroundColor.toUpperCase()}</span>
                <input type="color" value={backgroundColor}
                  onChange={e => updateScene({ backgroundColor: e.target.value })}
                  className="w-6 h-6 rounded border border-foreground/10 cursor-pointer bg-transparent" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Environment */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Lighting Environment</p>
        <div className="grid grid-cols-3 gap-1.5">
          {ENVIRONMENTS.map(env => (
            <button key={env.id}
              onClick={() => updateScene({ environment: env.id as any })}
              className={`text-[10px] py-2 px-1 rounded-md border text-center transition-all ${
                environment === env.id
                  ? 'border-primary bg-primary/20 text-foreground font-medium shadow-sm ring-1 ring-primary/30'
                  : 'border-foreground/5 bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-foreground/20'
              }`}>
              {env.label}
            </button>
          ))}
        </div>
        {environment !== 'none' && (
          <div className="mt-4 px-1">
            <SliderRow label="Environment Presence" value={environmentIntensity} min={0} max={3}
              onChange={v => updateScene({ environmentIntensity: v })} />
          </div>
        )}
      </div>

      {/* Intensity Controls */}
      <div className="space-y-4 px-1">
        <SliderRow label="Ambient Light" value={ambientIntensity} min={0} max={2}
          onChange={v => updateScene({ ambientIntensity: v })} />
        <SliderRow label="Key Light Power" value={directionalIntensity} min={0} max={4}
          onChange={v => updateScene({ directionalIntensity: v })} />
      </div>

      {/* Extras */}
      <div className="pt-2">
        <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/20 rounded-lg border border-foreground/5">
          <label className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-foreground/80">Shadows</span>
            <Toggle checked={shadowEnabled} onChange={v => updateScene({ shadowEnabled: v })} />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-[11px] text-foreground/80">Floor Grid</span>
            <Toggle checked={gridVisible} onChange={v => updateScene({ gridVisible: v })} />
          </label>
        </div>
      </div>

      {/* Post Processing */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Visual Effects</p>
          <Toggle checked={postProcessingEnabled} onChange={v => updateScene({ postProcessingEnabled: v })} />
        </div>
        
        {postProcessingEnabled && (
          <div className="pl-3 border-l border-foreground/10 space-y-4 animate-in slide-in-from-left-2">
            <div className="space-y-4 bg-secondary/10 p-3 rounded-md border border-foreground/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-foreground/80">Bloom / Glow</span>
                <Toggle checked={bloomEnabled} onChange={v => updateScene({ bloomEnabled: v })} />
              </div>
              {bloomEnabled && (
                <div className="space-y-3 pt-1">
                  <SliderRow label="Glow Density" value={bloomIntensity} min={0} max={5} step={0.1}
                    onChange={v => updateScene({ bloomIntensity: v })} />
                  <SliderRow label="Glow Fade" value={bloomThreshold} min={0} max={1} step={0.05}
                    onChange={v => updateScene({ bloomThreshold: v })} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-md border border-foreground/5">
              <span className="text-[11px] font-medium text-foreground/80">Vignette Edge</span>
              <Toggle checked={vignetteEnabled} onChange={v => updateScene({ vignetteEnabled: v })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
