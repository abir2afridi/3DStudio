import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Sparkles, Zap, Aperture, Layers, Boxes } from 'lucide-react';

export function EffectsSection() {
  const { 
    postProcessingEnabled, bloomEnabled, bloomIntensity, bloomThreshold,
    vignetteEnabled, chromaticAberration, noiseEnabled, pixelateEnabled,
    pixelSize, updateScene 
  } = useEditorStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground/80">Enable Effects</span>
        </div>
        <button
          onClick={() => updateScene({ postProcessingEnabled: !postProcessingEnabled })}
          className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
            postProcessingEnabled ? 'bg-primary' : 'bg-foreground/10'
          }`}
        >
          <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${
            postProcessingEnabled ? 'translate-x-4' : ''
          }`} />
        </button>
      </div>

      {postProcessingEnabled && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Bloom */}
          <div className="space-y-4 p-3 bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-foreground uppercase tracking-widest">Glow (Bloom)</span>
              </div>
              <button
                onClick={() => updateScene({ bloomEnabled: !bloomEnabled })}
                className={`w-4 h-4 rounded border transition-colors ${
                  bloomEnabled ? 'bg-primary border-primary' : 'border-foreground/20'
                }`}
              />
            </div>
            {bloomEnabled && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Intensity</span>
                    <span className="text-primary">{bloomIntensity}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={bloomIntensity}
                    onChange={(e) => updateScene({ bloomIntensity: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    <span>Threshold</span>
                    <span className="text-primary">{bloomThreshold}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bloomThreshold}
                    onChange={(e) => updateScene({ bloomThreshold: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Other Simple Effects */}
          <div className="grid grid-cols-2 gap-3">
            <EffectToggle 
              label="Vignette" 
              active={vignetteEnabled} 
              icon={<Aperture size={12}/>}
              onChange={(v) => updateScene({ vignetteEnabled: v })} 
            />
            <EffectToggle 
              label="Chromatic" 
              active={chromaticAberration} 
              icon={<Layers size={12}/>}
              onChange={(v) => updateScene({ chromaticAberration: v })} 
            />
            <EffectToggle 
              label="Atmospheric Noise" 
              active={noiseEnabled} 
              icon={<Boxes size={12}/>}
              onChange={(v) => updateScene({ noiseEnabled: v })} 
            />
            <EffectToggle 
              label="Pixelate" 
              active={pixelateEnabled} 
              icon={<Boxes size={12}/>}
              onChange={(v) => updateScene({ pixelateEnabled: v })} 
            />
          </div>

          {pixelateEnabled && (
            <div className="space-y-2 p-3 bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl animate-in zoom-in-95 duration-200">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Pixel Size</span>
                <span className="text-primary">{pixelSize}px</span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={pixelSize}
                onChange={(e) => updateScene({ pixelSize: parseInt(e.target.value) })}
                className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EffectToggle({ label, active, icon, onChange }: { label: string, active: boolean, icon: React.ReactNode, onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`p-2 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${
        active 
          ? 'bg-primary/5 border-primary/30 text-primary shadow-[0_0_15px_-5px_var(--primary)]' 
          : 'bg-foreground/[0.02] border-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.04]'
      }`}
    >
      <div className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-primary/20' : 'bg-foreground/5'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
