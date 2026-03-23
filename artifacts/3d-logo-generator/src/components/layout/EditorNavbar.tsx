import React from 'react';
import { 
  Undo2, Redo2, Maximize2, Minimize2, 
  Settings2, Share2, Sun, Moon, Zap,
  RefreshCcw, Download, PanelLeftClose,
  Cuboid, Play, Pause, Activity, Film, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { useEditorStore } from '@/store/editorStore';
import { AnimationType } from '@/types/editor';

export function EditorNavbar() {
  const { 
    projectName, setProjectName, undo, redo, history, historyIndex,
    theme, setTheme, isProcessing, resetAll, toggleSidebar, toggleExportPanel,
    animationType, animationSpeed, animationPlaying, updateAnimation
  } = useEditorStore();

  const [isAnimationMenuOpen, setIsAnimationMenuOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });
  
  const dateString = currentTime.toLocaleDateString([], { 
    weekday: 'short',
    month: 'short', 
    day: 'numeric' 
  });

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

        {/* Date / Time Display */}
        <div className="hidden lg:flex items-center gap-2 ml-4 group transition-all">
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-black tabular-nums text-foreground tracking-tight leading-none flex items-center gap-0.5">
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).replace(/\s[AP]M/, '')}</span>
              <span className="text-red-500 opacity-90">:</span>
              <span className="text-red-500 font-black">{currentTime.toLocaleTimeString([], { second: '2-digit' })}</span>
              <span className="ml-1 text-[8px] opacity-40 uppercase">{currentTime.toLocaleTimeString([], { hour12: true }).slice(-2)}</span>
            </div>
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1 group-hover:text-primary transition-colors">
              {dateString}
            </span>
          </div>
        </div>
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
          {/* Animation Controls */}
          <div className="flex items-center gap-1 p-1 bg-foreground/[0.03] border border-foreground/[0.05] rounded-xl">
            {/* Play/Pause Button - Direct Access */}
            <button 
              onClick={() => updateAnimation({ playing: !animationPlaying })}
              disabled={animationType === 'none'}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                animationPlaying && animationType !== 'none'
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] disabled:opacity-20'
              }`}
              title={animationPlaying ? "Pause Animation" : "Play Animation"}
            >
              {animationPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
            </button>

            <div className="w-px h-4 bg-foreground/10 mx-0.5" />

            {/* Animation Selection Popover */}
            <div className="relative">
              <button 
                onClick={() => setIsAnimationMenuOpen(!isAnimationMenuOpen)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${
                  isAnimationMenuOpen ? 'bg-foreground/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase tracking-tight hidden lg:inline">
                  {ANIMATIONS.find(a => a.id === animationType)?.label || 'none'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isAnimationMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isAnimationMenuOpen && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setIsAnimationMenuOpen(false)}
                      className="fixed inset-0 z-40"
                    />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                      className="absolute right-0 mt-3 w-64 bg-card/95 backdrop-blur-2xl border border-foreground/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 z-50 overflow-hidden"
                    >
                      <div className="flex flex-col mb-4">
                        <span className="text-[9px] font-black tracking-[0.2em] text-primary uppercase opacity-80">Motion Space</span>
                        <span className="text-xs font-bold text-foreground">Select Movement</span>
                      </div>

                      {/* Speed Control */}
                      {animationType !== 'none' && (
                        <div className="mb-4 p-3 bg-foreground/[0.03] rounded-xl border border-foreground/[0.05] group">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <Activity size={10} className="text-primary" />
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Velocity</span>
                            </div>
                            <span className="text-[10px] font-mono font-black text-primary">{animationSpeed.toFixed(1)}x</span>
                          </div>
                          <input 
                            type="range" min={0.1} max={5} step={0.1} value={animationSpeed}
                            onChange={e => updateAnimation({ speed: parseFloat(e.target.value) })}
                            className="w-full h-1 accent-primary bg-foreground/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-1.5">
                        {ANIMATIONS.map(anim => (
                          <button key={anim.id}
                            onClick={() => {
                              updateAnimation({ type: anim.id });
                              if (anim.id === 'none') {
                                updateAnimation({ playing: false });
                              } else {
                                updateAnimation({ playing: true });
                              }
                            }}
                            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-left transition-all duration-200 ${
                              animationType === anim.id
                                ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                                : 'border-transparent bg-foreground/[0.02] hover:bg-foreground/[0.06] text-muted-foreground'
                            }`}>
                            <span className="text-xs">{anim.icon}</span>
                            <span className="text-[9px] font-bold uppercase tracking-tight">{anim.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

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
