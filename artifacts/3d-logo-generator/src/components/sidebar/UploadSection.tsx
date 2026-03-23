import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useEditorStore } from '@/store/editorStore';
import { UploadCloud, RefreshCw, Type, Image as ImageIcon } from 'lucide-react';
import { ACCEPTED_FORMATS, MAX_FILE_SIZE_MB } from '@/utils/constants';
import toast from 'react-hot-toast';

const POPULAR_FONTS = [
  { label: 'Inter (Sans)', value: '"Inter", sans-serif', weight: '900' },
  { label: 'Playfair (Serif)', value: '"Playfair Display", serif', weight: '900' },
  { label: 'Space Mono', value: '"Space Mono", monospace', weight: '700' },
  { label: 'Arial Black', value: '"Arial Black", sans-serif', weight: 'normal' },
  { label: 'Impact', value: 'Impact, sans-serif', weight: 'normal' },
  { label: 'Pacifico (Cursive)', value: '"Pacifico", cursive', weight: 'normal' },
];

export function UploadSection() {
  const { uploadedFile, uploadedImageUrl, setUploadedFile } = useEditorStore();
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [textInput, setTextInput] = useState('');
  const [textFont, setTextFont] = useState(POPULAR_FONTS[0].value);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error(`File is larger than ${MAX_FILE_SIZE_MB}MB`);
      } else {
        toast.error('Invalid file format. Use PNG, JPG, or SVG.');
      }
      return;
    }
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      toast.success('Image loaded successfully');
    }
  }, [setUploadedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    maxFiles: 1
  });

  const handleTextGenerate = () => {
    if (!textInput.trim()) {
      toast.error('Please enter some text');
      return;
    }

    const selectedFont = POPULAR_FONTS.find(f => f.value === textFont);
    const weight = selectedFont ? selectedFont.weight : 'bold';

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, 1024, 1024);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    
    let fontSize = 300;
    ctx.font = `${weight} ${fontSize}px ${textFont}`;
    let metrics = ctx.measureText(textInput);
    
    while (metrics.width > 900 && fontSize > 40) {
      fontSize -= 10;
      ctx.font = `${weight} ${fontSize}px ${textFont}`;
      metrics = ctx.measureText(textInput);
    }
    
    ctx.fillText(textInput, 512, 512);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `text-${Date.now()}.png`, { type: 'image/png' });
        setUploadedFile(file);
        toast.success('Text converted to 3D!');
      }
    }, 'image/png');
  };

  if (uploadedFile && uploadedImageUrl) {
    return (
      <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-3 p-2.5 bg-secondary/30 border border-foreground/5 rounded-lg">
          <div className="w-12 h-12 rounded-md bg-foreground/10 border border-foreground/5 overflow-hidden flex-shrink-0 flex items-center justify-center p-1.5 relative border-dashed">
             <div className="absolute inset-0 bg-grid-foreground/[0.02] bg-[size:6px_6px]" />
            <img src={uploadedImageUrl} alt="Uploaded logo" className="max-w-full max-h-full object-contain relative z-10 drop-shadow-md" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-foreground/90 truncate uppercase tracking-tight">
              {uploadedFile.name.startsWith('text-') ? 'Generated Text' : uploadedFile.name}
            </p>
            <p className="text-[10px] text-muted-foreground">{(uploadedFile.size / 1024).toFixed(1)} KB · LOGO LOADED</p>
          </div>
          <button 
            onClick={() => setUploadedFile(null)}
            className="p-2 hover:bg-white/10 text-muted-foreground hover:text-white rounded-md transition-all group"
            title="Reset Logo"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex p-0.5 bg-secondary/80 rounded border border-foreground/5">
        <button 
          onClick={() => setActiveTab('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${
            activeTab === 'image' ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ImageIcon className="w-3 h-3" /> Image
        </button>
        <button 
          onClick={() => setActiveTab('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded transition-all ${
            activeTab === 'text' ? 'bg-card text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Type className="w-3 h-3" /> Text
        </button>
      </div>

      {/* Image Tab */}
      {activeTab === 'image' && (
        <div 
          {...getRootProps()} 
          className={`border border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-2.5 relative overflow-hidden group
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-foreground/10 hover:border-primary/50 hover:bg-foreground/[0.02]'}`}
        >
          <input {...getInputProps()} />
          <div className="w-9 h-9 rounded-full bg-secondary/50 flex items-center justify-center text-primary/70 group-hover:text-primary group-hover:bg-primary/10 transition-all">
            <UploadCloud className="w-4.5 h-4.5" />
          </div>
          <div className="relative z-10">
            <p className="text-[11px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors">DRAG & DROP IMAGE</p>
            <p className="text-[9px] text-muted-foreground/60 mt-0.5">PNG, JPG or SVG</p>
          </div>
        </div>
      )}

      {/* Text Tab */}
      {activeTab === 'text' && (
        <div className="bg-secondary/20 rounded-lg p-3 border border-foreground/5 space-y-3 animate-in fade-in slide-in-from-right-2">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Content</label>
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="e.g. STUDIO"
              className="w-full bg-secondary/50 border border-foreground/10 rounded px-2.5 py-2 text-[11px] text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-muted-foreground/30 shadow-inner"
              onKeyDown={(e) => e.key === 'Enter' && handleTextGenerate()}
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Typography</label>
            <select 
              value={textFont}
              onChange={(e) => setTextFont(e.target.value)}
              className="w-full bg-secondary/50 border border-foreground/10 rounded px-2.5 py-2 text-[11px] text-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all appearance-none"
              style={{ fontFamily: textFont }}
            >
              {POPULAR_FONTS.map(f => (
                <option key={f.label} value={f.value} className="bg-background text-foreground" style={{ fontFamily: f.value }}>{f.label}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleTextGenerate}
            disabled={!textInput.trim()}
            className="w-full mt-1 py-2 bg-primary hover:opacity-90 disabled:opacity-30 text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded transition-all flex justify-center items-center gap-2 shadow-sm"
          >
            <Type className="w-3 h-3" /> Convert to 3D
          </button>
        </div>
      )}
    </div>
  );
}
