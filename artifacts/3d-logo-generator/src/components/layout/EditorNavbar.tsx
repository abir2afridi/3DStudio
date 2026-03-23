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
    <div className="h-14 bg-glass-panel border-b border-foreground/5 flex items-center justify-between px-4 z-20 relative transition-colors duration-500">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-foreground group flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-primary via-primary/80 to-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]">
            <Cuboid className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-lg tracking-tighter uppercase italic hidden lg:block">3D STUDIO</span>
        </Link>
        <div className="h-6 w-px bg-border mx-1"></div>
        <input 
          type="text" 
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent border-none text-sm font-medium text-foreground w-48 focus:outline-none focus:ring-1 focus:ring-primary/50 px-2 py-1 rounded"
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Status Indicator */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest hidden sm:inline">Processing</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />
        
        <div className="flex items-center gap-1.5 p-1 bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl">
          <button 
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button 
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        <button 
          onClick={resetAll}
          className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <RefreshCcw className="w-4 h-4" /> <span className="hidden sm:inline">Reset</span>
        </button>
        
        <div className="h-6 w-px bg-border mx-2"></div>

        <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Share2 className="w-4 h-4" /> Share
        </button>

        <button 
          onClick={toggleExportPanel}
          className="px-5 py-2 bg-gradient-to-r from-primary to-cyan-500 hover:from-primary hover:to-cyan-400 text-white rounded-lg text-sm font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Export
        </button>
      </div>
    </div>
  );
}
