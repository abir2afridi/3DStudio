import React, { useState } from 'react';
import { UploadSection } from './UploadSection';
import { ThreeDModeSelector } from './ThreeDModeSelector';
import { ShapeSection } from './ShapeSection';
import { MaterialsSection } from './MaterialsSection';
import { SceneSection } from './SceneSection';
import { TextSection } from './TextSection';
import { EffectsSection } from './EffectsSection';
import { 
  Layers, 
  Box, 
  Palette, 
  Zap, 
  Sun, 
  Moon,
  ChevronDown, 
  ChevronRight,
  Type,
  Sparkles
} from 'lucide-react';
import { useEditorStore } from '@/store/editorStore';

const AccordionItem = ({
  title, icon, children, defaultOpen = false
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-foreground/[0.05] last:border-0 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 transition-all duration-300 ${
          isOpen ? 'bg-foreground/[0.02]' : 'hover:bg-foreground/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`transition-transform duration-300 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 14 }) : icon}
          </span>
          <span className={`text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 ${
            isOpen ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {title}
          </span>
        </div>
        <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50" />
        </div>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 pb-5 pt-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export function Sidebar() {
  const { sidebarCollapsed, theme, setTheme } = useEditorStore();

  if (sidebarCollapsed) return null;

  return (
    <div className="w-[310px] h-full bg-background/95 backdrop-blur-xl border-r border-foreground/[0.05] flex flex-col overflow-hidden shadow-2xl z-20 transition-colors duration-500">
      {/* Header section with Logo generation trigger */}
      <div className="p-4 border-b border-foreground/[0.03] bg-gradient-to-b from-foreground/[0.02] to-transparent">
        <UploadSection />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AccordionItem title="3D ENGINE" icon={<Zap />} defaultOpen>
          <ThreeDModeSelector />
        </AccordionItem>

        <AccordionItem title="TEXT TO 3D" icon={<Type />} defaultOpen>
          <TextSection />
        </AccordionItem>

        <AccordionItem title="EXTRUSION" icon={<Box />} defaultOpen>
          <ShapeSection />
        </AccordionItem>

        <AccordionItem title="MATERIAL" icon={<Palette />} defaultOpen>
          <MaterialsSection />
        </AccordionItem>


        <AccordionItem title="SCENE" icon={<Sun />} defaultOpen>
          <SceneSection />
        </AccordionItem>

        <AccordionItem title="POST EFFECTS" icon={<Sparkles />} defaultOpen>
          <EffectsSection />
        </AccordionItem>
      </div>
      
      <div className="p-3 px-4 border-t border-foreground/[0.05] flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground/30 font-mono tracking-widest uppercase">3D STUDIO v1.2</span>
      </div>
    </div>
  );
}
