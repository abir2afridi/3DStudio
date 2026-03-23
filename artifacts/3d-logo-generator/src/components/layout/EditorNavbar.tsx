import React from 'react';
import { useEditorStore } from '@/store/editorStore';
import { 
  Undo2, Redo2, Maximize2, Minimize2, 
  Settings2, Share2, Sun, Moon, Zap,
  RefreshCcw, Download, PanelLeftClose,
  Cuboid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';

export function EditorNavbar() {
  const { 
    projectName, setProjectName, undo, redo, history, historyIndex,
    theme, setTheme, isProcessing, resetAll, toggleSidebar, toggleExportPanel
  } = useEditorStore();

  return (
    <div className="h-14 bg-glass-panel border-b border-foreground/5 flex items-center justify-between px-2 md:px-4 z-20 relative transition-colors duration-500">
      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
        <Link href="/" className="text-foreground group flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity flex-shrink-0">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-primary via-primary/80 to-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
            <Cuboid className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-base md:text-lg tracking-tighter uppercase italic hidden md:block">3D STUDIO</span>
        </Link>
        <div className="h-6 w-px bg-border mx-1 hidden sm:block flex-shrink-0"></div>
        <input 
          type="text" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent border-none text-[13px] md:text-sm font-medium text-foreground w-24 sm:w-48 focus:outline-none focus:ring-1 focus:ring-primary/50 px-1 md:px-2 py-1 rounded truncate min-w-0"
        />
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Undo/Redo - Hidden on tiny screens, shown on tablets */}
        <div className="hidden sm:flex items-center gap-1 p-1 bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl mr-1">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-all disabled:opacity-30"
          >
            <Undo2 size={14} />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 md:p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-all disabled:opacity-30"
          >
            <Redo2 size={14} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Reset - Icon only on mobile */}
          <button 
            onClick={resetAll}
            className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2"
            title="Reset All"
          >
            <RefreshCcw className="w-4 h-4" /> 
            <span className="hidden lg:inline text-sm font-medium">Reset</span>
          </button>

          {/* Export - Smaller on mobile */}
          <button 
            onClick={() => toggleExportPanel()}
            className="ml-1 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary hover:to-cyan-400 text-white rounded-lg text-xs md:text-sm font-bold transition-all shadow-lg hover:shadow-primary/25 flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> 
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>
    </div>

  );
}
