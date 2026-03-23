import React from 'react';
import { useEditorStore } from '@/store/editorStore';

export function ShapeSection() {
  const { 
    thickness, bevel, bevelSize, bevelSegments, scale, 
    smoothNormals, centerOrigin, invertImage, updateShape 
  } = useEditorStore();

  return (
    <div className="space-y-4">
      
      {/* ── Extrusion Depth / Thickness ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-foreground/80">Thickness</label>
          <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">{thickness}</span>
        </div>
        <input 
          type="range" min="1" max="100" 
          value={thickness} 
          onChange={(e) => updateShape({ thickness: parseInt(e.target.value) })}
          className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>

      {/* ── Global Scale ── */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-foreground/80">Global Scale</label>
          <span className="text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">{scale.toFixed(1)}x</span>
        </div>
        <input 
          type="range" min="0.5" max="3" step="0.1"
          value={scale} 
          onChange={(e) => updateShape({ scale: parseFloat(e.target.value) })}
          className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
        />
      </div>

      {/* ── Bevel Options ── */}
      <div className="pt-3 border-t border-foreground/10">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">Rounded Edges (Bevel)</span>
          <div className="relative inline-flex items-center h-4 w-7 rounded-full transition-colors bg-secondary border border-foreground/5">
            <input 
              type="checkbox" 
              className="sr-only peer"
              checked={bevel}
              onChange={(e) => updateShape({ bevel: e.target.checked })}
            />
            <div className={`absolute left-0.5 top-0.5 bg-muted-foreground peer-checked:bg-primary w-3 h-3 rounded-full transition-transform ${bevel ? 'translate-x-3' : ''}`}></div>
          </div>
        </label>
      </div>

      {bevel && (
        <div className="space-y-3 pl-3 border-l-[1.5px] border-primary/30 ml-1 animate-in slide-in-from-left-2">
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-medium text-muted-foreground tracking-wide">Bevel Size</label>
              <span className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">{bevelSize}</span>
            </div>
            <input 
              type="range" min="1" max="20" 
              value={bevelSize} 
              onChange={(e) => updateShape({ bevelSize: parseInt(e.target.value) })}
              className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-medium text-muted-foreground tracking-wide">Resolution</label>
              <span className="text-[10px] bg-secondary/50 px-1.5 py-0.5 rounded">{bevelSegments}</span>
            </div>
            <input 
              type="range" min="1" max="10" 
              value={bevelSegments} 
              onChange={(e) => updateShape({ bevelSegments: parseInt(e.target.value) })}
              className="w-full h-1 accent-primary bg-secondary rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
            />
          </div>
        </div>
      )}

      {/* ── Advanced Toggles ── */}
      <div className="pt-3 border-t border-foreground/10 space-y-3">
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">Invert Source Image</span>
          <div className="relative inline-flex items-center h-4 w-7 rounded-full transition-colors bg-secondary border border-foreground/5">
            <input 
              type="checkbox" className="sr-only peer" checked={invertImage}
              onChange={(e) => updateShape({ invertImage: e.target.checked })}
            />
            <div className={`absolute left-0.5 top-0.5 bg-muted-foreground peer-checked:bg-primary w-3 h-3 rounded-full transition-transform ${invertImage ? 'translate-x-3' : ''}`}></div>
          </div>
        </label>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">Smooth Normals</span>
          <div className="relative inline-flex items-center h-4 w-7 rounded-full transition-colors bg-secondary border border-foreground/5">
            <input 
              type="checkbox" className="sr-only peer" checked={smoothNormals}
              onChange={(e) => updateShape({ smoothNormals: e.target.checked })}
            />
            <div className={`absolute left-0.5 top-0.5 bg-muted-foreground peer-checked:bg-primary w-3 h-3 rounded-full transition-transform ${smoothNormals ? 'translate-x-3' : ''}`}></div>
          </div>
        </label>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">Center Origin</span>
          <div className="relative inline-flex items-center h-4 w-7 rounded-full transition-colors bg-secondary border border-foreground/5">
            <input 
              type="checkbox" className="sr-only peer" checked={centerOrigin}
              onChange={(e) => updateShape({ centerOrigin: e.target.checked })}
            />
            <div className={`absolute left-0.5 top-0.5 bg-muted-foreground peer-checked:bg-primary w-3 h-3 rounded-full transition-transform ${centerOrigin ? 'translate-x-3' : ''}`}></div>
          </div>
        </label>
      </div>

    </div>
  );
}
