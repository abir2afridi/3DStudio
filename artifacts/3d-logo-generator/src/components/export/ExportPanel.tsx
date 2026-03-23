import React, { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { 
  Download, 
  Video, 
  Image as ImageIcon, 
  Box as BoxIcon, 
  X,
  Monitor,
  FileCheck,
  Zap,
  Clock,
  Film
} from 'lucide-react';
import toast from 'react-hot-toast';

export function ExportPanel() {
  const { 
    exportPanelCollapsed, 
    toggleExportPanel, 
    isProcessing,
    exportSize, 
    exportQuality, 
    exportDuration, 
    exportFPS,
    updateExport,
    requestExport 
  } = useEditorStore();
  const [selectedFormat, setSelectedFormat] = useState<string>('PNG');
  const [isExporting, setIsExporting] = useState(false);

  if (exportPanelCollapsed) return null;
  
  const handleExportTrigger = () => {
    if (isProcessing) {
      toast.error('Please wait for 3D generation to finish');
      return;
    }
    requestExport(selectedFormat);
  };

  const sizes = [
    { id: 'portrait', label: '9:16', icon: <Monitor className="rotate-90" /> },
    { id: 'square', label: '1:1', icon: <Monitor /> },
    { id: 'landscape', label: '16:9', icon: <Monitor /> }
  ];

  const qualities = [
    { id: 'fast', label: 'Fast', desc: 'Lower res' },
    { id: 'balanced', label: 'Balanced', desc: 'Standard' },
    { id: 'high', label: 'Ultra', desc: 'Max detail' }
  ];

  const fpsOptions = [24, 30, 60];

  const FormatButton = ({ format, icon: Icon, isSmall = false }: { format: string, icon?: any, isSmall?: boolean }) => {
    const isSelected = selectedFormat === format;
    return (
      <button 
        onClick={() => setSelectedFormat(format)} 
        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group ${
          isSelected 
            ? 'bg-primary/10 border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.1)]' 
            : 'bg-foreground/[0.02] border-foreground/[0.05] hover:bg-foreground/[0.04]'
        }`}
      >
        <div className="flex items-center gap-2">
          {isSelected && <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />}
          <span className={`text-[10px] font-bold ${isSelected ? 'text-primary' : 'text-foreground'}`}>{format}</span>
        </div>
        {Icon && <Icon className={`w-3.5 h-3.5 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />}
      </button>
    );
  };

  return (
    <div className="w-80 h-full bg-glass-panel backdrop-blur-xl border-l border-foreground/[0.05] flex flex-col overflow-hidden shadow-2xl z-10 relative transition-colors duration-500">
      <div className="h-14 border-b border-foreground/[0.05] flex items-center justify-between px-4 flex-shrink-0 bg-foreground/[0.02]">
        <h2 className="font-display font-semibold text-lg text-foreground">Export</h2>
        <button onClick={toggleExportPanel} className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-foreground/[0.05] transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {/* Export Preview / Canvas Container Mock */}
        <div className="space-y-3">
          <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 block">Composition Preview</label>
          <div className="w-full aspect-video bg-foreground/[0.03] rounded-xl border border-foreground/[0.08] overflow-hidden relative flex items-center justify-center group">
            <div className="absolute inset-3 border border-foreground/[0.1] border-dashed rounded-lg pointer-events-none group-hover:border-primary/30 transition-colors"></div>
            <div className="text-center">
              <ImageIcon className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <span className="text-muted-foreground/40 text-[10px] font-medium uppercase tracking-tight">Viewport Capture</span>
            </div>
          </div>
        </div>

        {/* Output Settings */}
        <div className="space-y-6">
          <div className="pt-2 border-t border-foreground/[0.05]">
             <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3 block">Frame Ratio</label>
             <div className="grid grid-cols-3 gap-2">
               {sizes.map((size) => (
                 <button
                   key={size.id}
                   onClick={() => updateExport({ size: size.id as any })}
                   className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-300 ${
                     exportSize === size.id 
                       ? 'bg-primary/10 border-primary/30 text-primary' 
                       : 'bg-foreground/[0.02] border-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.04]'
                   }`}
                 >
                   <div className="opacity-50">
                     {React.cloneElement(size.icon as any, { size: 12 })}
                   </div>
                   <span className="text-[10px] font-medium">{size.label}</span>
                 </button>
               ))}
             </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 mb-3 block">Render Quality</label>
            <div className="grid grid-cols-1 gap-2">
              {qualities.map((q) => (
                <button
                  key={q.id}
                  onClick={() => updateExport({ quality: q.id as any })}
                  className={`w-full flex items-center justify-between p-2.5 px-3 rounded-lg border transition-all duration-300 ${
                    exportQuality === q.id 
                      ? 'bg-primary/10 border-primary/30 text-primary shadow-sm' 
                      : 'bg-foreground/[0.02] border-foreground/[0.05] text-muted-foreground hover:bg-foreground/[0.04]'
                  }`}
                >
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-bold uppercase tracking-tight">{q.label}</span>
                    <span className="text-[9px] opacity-50 uppercase tracking-tighter">{q.desc}</span>
                  </div>
                  {exportQuality === q.id && <FileCheck size={12} className="text-primary animate-in zoom-in duration-300" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-foreground/[0.05] space-y-4">
            <label className="text-[10px] uppercase tracking-widest text-muted-foreground/60 block">Motion Specs</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 opacity-40">
                  <Clock size={11} />
                  <span className="text-[9px] uppercase tracking-tight font-bold">Duration</span>
                </div>
                <select 
                  value={exportDuration}
                  onChange={(e) => updateExport({ duration: parseInt(e.target.value) })}
                  className="w-full bg-foreground/[0.03] border border-foreground/[0.08] rounded-md px-2 py-1.5 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 appearance-none pointer-events-auto"
                >
                  <option value={3000}>3 Seconds</option>
                  <option value={5000}>5 Seconds</option>
                  <option value={10000}>10 Seconds</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 opacity-40">
                  <Zap size={11} />
                  <span className="text-[9px] uppercase tracking-tight font-bold">FPS</span>
                </div>
                <div className="flex gap-1">
                  {fpsOptions.map(fps => (
                    <button
                      key={fps}
                      onClick={() => updateExport({ fps: fps as any })}
                      className={`flex-1 py-1.5 rounded-md text-[9px] font-bold border transition-all ${
                        exportFPS === fps 
                          ? 'bg-primary/20 border-primary/40 text-primary' 
                          : 'bg-foreground/[0.03] border-foreground/[0.08] text-muted-foreground hover:bg-foreground/[0.05]'
                      }`}
                    >
                      {fps}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Export Grid */}
        <div className="space-y-6 pt-2 border-t border-foreground/[0.05]">
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Film className="w-3 h-3" /> Video / Animation
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <FormatButton format="MP4" icon={Video} />
              <FormatButton format="GIF" icon={ImageIcon} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5" /> Static Images
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <FormatButton format="PNG" />
              <FormatButton format="JPG" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BoxIcon className="w-3.5 h-3.5" /> 3D Geometries
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {['GLB', 'OBJ', 'STL'].map(fmt => (
                <FormatButton key={fmt} format={fmt} isSmall />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <BoxIcon className="w-3.5 h-3.5" /> Project Files
            </h3>
            <FormatButton format="ZIP Project Archive" icon={Download} />
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-foreground/[0.05] bg-foreground/[0.02]">
        <button 
          onClick={handleExportTrigger}
          disabled={isExporting}
          className="w-full py-3.5 bg-primary text-primary-foreground hover:shadow-primary/20 disabled:opacity-50 text-[11px] rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] group"
        >
          <div className="flex items-center gap-2">
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : 'group-hover:translate-y-0.5 transition-transform'}`} />
            <span>{isExporting ? 'Processing Architecture...' : `Download ${selectedFormat}`}</span>
          </div>
        </button>
        <p className="text-center text-[9px] text-muted-foreground/40 mt-3 font-medium tracking-tight">Free version includes attribution watermark</p>
      </div>
    </div>

  );
}
