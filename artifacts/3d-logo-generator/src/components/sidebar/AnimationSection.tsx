import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { AnimationType } from '@/types/editor';
import { Play, Pause } from 'lucide-react';

const ANIMATIONS: { id: AnimationType; label: string; icon: string }[] = [
  { id: 'none',      label: 'None',      icon: '⬛' },
  { id: 'rotateY',   label: 'Spin',      icon: '🔄' },
  { id: 'bounce',    label: 'Bounce',    icon: '⬆️' },
  { id: 'spinTilt',  label: 'Tilt',      icon: '🌀' },
  { id: 'pendulum',  label: 'Swing',     icon: '🕰️' },
  { id: 'float',     label: 'Float',     icon: '🌊' },
  { id: 'pulse',     label: 'Pulse',     icon: '💓' },
  { id: 'wobble',    label: 'Wobble',    icon: '〰️' },
  { id: 'orbit',     label: 'Orbit',     icon: '🪐' },
  { id: 'heartbeat', label: 'Beat',      icon: '❤️' },
];

export function AnimationSection() {
  const { animationType, animationSpeed, animationPlaying, updateAnimation } = useEditorStore();

  return (
    <div className="space-y-4">
      {/* Play / Pause */}
      <button
        onClick={() => updateAnimation({ playing: !animationPlaying })}
        disabled={animationType === 'none'}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold transition-all shadow-sm ${
          animationType === 'none'
            ? 'bg-secondary/50 text-muted-foreground cursor-not-allowed opacity-50'
            : animationPlaying
              ? 'bg-card border border-foreground/10 hover:bg-secondary text-foreground'
              : 'bg-primary text-primary-foreground hover:opacity-90'
        }`}>
        {animationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        {animationPlaying ? 'PAUSE' : 'PLAY'}
      </button>

      {/* Grid of animation types */}
      <div className="grid grid-cols-2 gap-1.5">
        {ANIMATIONS.map(anim => (
          <button key={anim.id}
            onClick={() => updateAnimation({ type: anim.id })}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all ${
              animationType === anim.id
                ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                : 'border-foreground/5 bg-secondary/30 hover:bg-secondary/60 hover:border-foreground/20 text-muted-foreground hover:text-foreground'
            }`}>
            <span className="text-sm scale-90 grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100">{anim.icon}</span>
            <span className="text-[10px] font-medium tracking-tight uppercase">{anim.label}</span>
          </button>
        ))}
      </div>

      {/* Speed */}
      {animationType !== 'none' && (
        <div className="space-y-2.5 pt-3 border-t border-foreground/10 animate-in fade-in slide-in-from-top-1">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Speed Control</label>
            <span className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded text-muted-foreground">{animationSpeed.toFixed(1)}x</span>
          </div>
          <input type="range" min={0.1} max={5} step={0.1} value={animationSpeed}
            onChange={e => updateAnimation({ speed: parseFloat(e.target.value) })}
            className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary" />
          <div className="flex justify-between text-[9px] text-muted-foreground/60 px-1">
            <span>SLOW</span>
            <span>FAST</span>
          </div>
        </div>
      )}
    </div>
  );
}
