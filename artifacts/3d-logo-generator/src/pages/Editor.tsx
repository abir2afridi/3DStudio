import React, { useEffect } from 'react';
import { EditorNavbar } from '@/components/layout/EditorNavbar';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ExportPanel } from '@/components/export/ExportPanel';
import { ThreeCanvas } from '@/components/canvas/ThreeCanvas';
import { useEditorStore } from '@/store/editorStore';

export default function Editor() {
  // Setup keyboard shortcuts
  const { undo, redo, toggleSidebar, toggleFullscreen } = useEditorStore();

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
    <div className="w-full h-screen overflow-hidden bg-background text-foreground relative">
      <div className="absolute inset-0 z-0">
        <ThreeCanvas />
      </div>
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <div className="pointer-events-auto">
          <EditorNavbar />
        </div>
        <div className="flex flex-1 overflow-hidden justify-between">
          <div className="pointer-events-auto h-full">
            <Sidebar />
          </div>
          <div className="pointer-events-auto h-full">
            <ExportPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
