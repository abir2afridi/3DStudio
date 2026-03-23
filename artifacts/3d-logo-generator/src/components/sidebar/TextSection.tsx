import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Type, Move, Palette, TextCursorInput } from 'lucide-react';

const FONTS = [
  { id: 'Inter', label: 'Inter' },
  { id: 'Roboto', label: 'Roboto' },
  { id: 'Outfit', label: 'Outfit' },
  { id: 'Space Grotesk', label: 'Space Grotesk' },
  { id: 'Pacifico', label: 'Pacifico' },
  { id: 'Bebas Neue', label: 'Bebas Neue' },
];

export function TextSection() {
  const { 
    textEnabled, logoText, fontSize, textDepth, 
    textLetterSpacing, textColor, fontFamily, updateText 
  } = useEditorStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground/80">Enable 3D Text</span>
        </div>
        <button
          onClick={() => updateText({ textEnabled: !textEnabled })}
          className={`relative w-9 h-5 rounded-full transition-colors duration-300 ${
            textEnabled ? 'bg-primary' : 'bg-foreground/10'
          }`}
        >
          <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-300 ${
            textEnabled ? 'translate-x-4' : ''
          }`} />
        </button>
      </div>

      {textEnabled && (
        <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Text Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <TextCursorInput className="w-3 h-3 text-muted-foreground" />
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Logo Text</label>
            </div>
            <input
              type="text"
              value={logoText}
              onChange={(e) => updateText({ logoText: e.target.value })}
              className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              placeholder="Enter text..."
            />
          </div>

          {/* Font Family selection */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Font Style</label>
            <div className="grid grid-cols-2 gap-2">
              {FONTS.map((font) => (
                <button
                  key={font.id}
                  onClick={() => updateText({ fontFamily: font.id })}
                  className={`px-2 py-1.5 rounded-md text-[10px] border transition-all ${
                    fontFamily === font.id
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'bg-foreground/[0.02] border-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.04]'
                  }`}
                  style={{ fontFamily: font.id }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Size</span>
                <span className="text-primary">{fontSize}px</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={fontSize}
                onChange={(e) => updateText({ fontSize: parseInt(e.target.value) })}
                className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Depth</span>
                <span className="text-primary">{textDepth}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={textDepth}
                onChange={(e) => updateText({ textDepth: parseInt(e.target.value) })}
                className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>Spacing</span>
                <span className="text-primary">{textLetterSpacing}</span>
              </div>
              <input
                type="range"
                min="-10"
                max="50"
                value={textLetterSpacing}
                onChange={(e) => updateText({ textLetterSpacing: parseInt(e.target.value) })}
                className="w-full h-1 bg-foreground/10 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="w-3 h-3 text-muted-foreground" />
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Text Color</label>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={textColor}
                onChange={(e) => updateText({ textColor: e.target.value })}
                className="w-10 h-10 rounded-lg overflow-hidden bg-transparent cursor-pointer border-none"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => updateText({ textColor: e.target.value })}
                className="flex-1 bg-foreground/[0.03] border border-foreground/[0.08] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
