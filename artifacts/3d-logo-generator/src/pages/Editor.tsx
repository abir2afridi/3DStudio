import React, { useEffect } from 'react';
import { EditorNavbar } from '@/components/layout/EditorNavbar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ExportPanel } from '@/components/export/ExportPanel';
import { ThreeCanvas } from '@/components/canvas/ThreeCanvas';
import { useEditorStore } from '@/store/editorStore';
import { 
  PanelLeft as SidebarIcon, 
  Download,
} from 'lucide-react';

export default function Editor() {
  const { 
    undo, redo, 
    toggleSidebar, toggleFullscreen, toggleExportPanel,
    sidebarCollapsed, exportPanelCollapsed 
  } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
      }
      if (e.key === 'h') { toggleSidebar(); }
      if (e.key === 'f') { toggleFullscreen(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, toggleSidebar, toggleFullscreen]);

  return (
    <div className="w-full h-screen overflow-hidden bg-background text-foreground relative flex flex-col">
      <div className="relative z-50 flex-none pointer-events-auto">
        <EditorNavbar />
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        {/* Main Canvas Container */}
        <div className="absolute inset-0 z-0">
          <ThreeCanvas />
        </div>

        {/* Floating Sidebar Container - Responsive */}
        <div className={`
          absolute md:relative z-40 h-full transition-all duration-500 ease-in-out pointer-events-none overflow-hidden
          ${sidebarCollapsed ? '-translate-x-full md:translate-x-0 md:w-0' : 'translate-x-0 w-full md:w-[310px]'}
        `}>
          <div className="pointer-events-auto h-full w-[310px] max-w-[85vw] bg-background/95 backdrop-blur-xl">
            <Sidebar />
          </div>
          {/* Mobile Backdrop */}
          {!sidebarCollapsed && (
            <div 
              className="absolute inset-0 left-[310px] md:hidden bg-black/20 backdrop-blur-sm pointer-events-auto"
              onClick={() => toggleSidebar()}
            />
          )}
        </div>

        {/* Desktop Spacer to keep panels on sides */}
        <div className="hidden md:block flex-1 pointer-events-none" />

        {/* Floating Export Panel Container - Responsive */}
        <div className={`
          absolute right-0 md:relative z-40 h-full transition-all duration-500 ease-in-out pointer-events-none overflow-hidden
          ${exportPanelCollapsed ? 'translate-x-full md:translate-x-0 md:w-0' : 'translate-x-0 w-full md:w-[320px]'}
        `}>

          {/* Mobile Backdrop for Export Panel */}
          {!exportPanelCollapsed && (
            <div 
              className="absolute inset-0 right-[320px] md:hidden bg-black/20 backdrop-blur-sm pointer-events-auto"
              onClick={() => toggleExportPanel()}
            />
          )}
          <div className="pointer-events-auto h-full w-[320px] max-w-[85vw] ml-auto bg-background/95 backdrop-blur-xl">
            <ExportPanel />
          </div>
        </div>

        {/* Mobile Toggle Buttons (Floating when panels are closed) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-4 md:hidden pointer-events-none">
          {sidebarCollapsed && (
            <button 
              onClick={() => toggleSidebar()}
              className="p-4 bg-primary text-primary-foreground rounded-full shadow-xl pointer-events-auto active:scale-95 transition-transform"
            >
              <SidebarIcon className="w-6 h-6" />
            </button>
          )}
          {exportPanelCollapsed && (
            <button 
              onClick={() => toggleExportPanel()}
              className="p-4 bg-foreground text-background rounded-full shadow-xl pointer-events-auto active:scale-95 transition-transform"
            >
              <Download className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
