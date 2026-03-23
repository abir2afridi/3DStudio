import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import * as THREE from 'three';
// @ts-ignore
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
// @ts-ignore
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter';
// @ts-ignore
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';
import JSZip from 'jszip';
import toast from 'react-hot-toast';

export function ExportManager() {
  const { gl, scene, camera } = useThree();
  const { exportRequested, requestExport, projectName, exportDuration, exportFPS } = useEditorStore();

  useEffect(() => {
    if (!exportRequested) return;

    const format = exportRequested;
    requestExport(null);

    const performExport = async () => {
      try {
        if (format === 'PNG' || format === 'JPG') {
          exportImage(format);
        } else if (format === 'GLB' || format === 'GLTF') {
          await exportGLTF();
        } else if (format === 'STL') {
          exportSTL();
        } else if (format === 'OBJ') {
          exportOBJ();
        } else if (format === 'MP4') {
          await exportVideo();
        } else if (format === 'ZIP Project Archive') {
          await exportZip();
        } else if (format === 'GIF') {
          toast.success('GIF generation requires server-side processing. Defaulting to high-quality MP4.');
          await exportVideo();
        }
      } catch (error) {
        console.error('Export failed:', error);
        toast.error(`Failed to export ${format}`);
      }
    };

    performExport();
  }, [exportRequested, gl, scene, camera, projectName, exportDuration, exportFPS]);

  const exportVideo = async () => {
    return new Promise<void>((resolve) => {
      const stream = gl.domElement.captureStream(exportFPS);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000 // 5Mbps
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        saveBlob(blob, `${projectName.replace(/\s+/g, '_')}.webm`);
        toast.success('Video exported as WEBM (optimized for web)!');
        resolve();
      };

      toast.loading(`Recording ${exportDuration / 1000}s sequence...`, { id: 'video-record' });
      recorder.start();
      setTimeout(() => {
        recorder.stop();
        toast.dismiss('video-record');
      }, exportDuration);
    });
  };

  const exportZip = async () => {
    const zip = new JSZip();
    const folder = zip.folder(projectName.replace(/\s+/g, '_'));
    
    // Add settings
    const state = useEditorStore.getState();
    folder?.file('config.json', JSON.stringify(state, null, 2));
    
    // Add image
    gl.render(scene, camera);
    const imgData = gl.domElement.toDataURL('image/png').split(',')[1];
    folder?.file('thumbnail.png', imgData, { base64: true });

    // Add GLTF
    const exporter = new GLTFExporter();
    const gltfData = await new Promise((resolve) => {
      exporter.parse(scene, resolve, { binary: true });
    });
    folder?.file('model.glb', gltfData as ArrayBuffer);

    const content = await zip.generateAsync({ type: 'blob' });
    saveBlob(content, `${projectName.replace(/\s+/g, '_')}_project.zip`);
    toast.success('Project archive ready!');
  };

  const exportImage = (format: string) => {
    gl.render(scene, camera);
    const dataUrl = gl.domElement.toDataURL(format === 'JPG' ? 'image/jpeg' : 'image/png', 1.0);
    const link = document.createElement('a');
    link.download = `${projectName.replace(/\s+/g, '_')}.${format.toLowerCase()}`;
    link.href = dataUrl;
    link.click();
    toast.success(`${format} exported!`);
  };

  const exportGLTF = async () => {
    const exporter = new GLTFExporter();
    const loadingToast = toast.loading('Preparing GLB for download...');
    
    try {
      const target = scene.getObjectByName('logo-export-group') || scene;
      const result = await new Promise((resolve, reject) => {
        exporter.parse(
          target,
          (res: any) => resolve(res),
          (err: any) => reject(err),
          { binary: true, onlyVisible: true }
        );
      });

      const output = result instanceof ArrayBuffer ? result : JSON.stringify(result);
      const blob = new Blob([output], { type: result instanceof ArrayBuffer ? 'application/octet-stream' : 'application/json' });
      saveBlob(blob, `${projectName.replace(/\s+/g, '_')}.glb`);
      toast.success('GLB exported!', { id: loadingToast });
    } catch (error) {
      console.error('GLTF export error:', error);
      toast.error('GLB export failed', { id: loadingToast });
    }
  };


  const exportSTL = () => {
    try {
      const exporter = new STLExporter();
      const result = exporter.parse(scene);
      const blob = new Blob([result], { type: 'application/octet-stream' });
      saveBlob(blob, `${projectName.replace(/\s+/g, '_')}.stl`);
      toast.success('STL exported!');
    } catch (error) {
      console.error('STL export error:', error);
      toast.error('STL export failed');
    }
  };

  const exportOBJ = () => {
    try {
      const exporter = new OBJExporter();
      const result = exporter.parse(scene);
      const blob = new Blob([result], { type: 'text/plain' });
      saveBlob(blob, `${projectName.replace(/\s+/g, '_')}.obj`);
      toast.success('OBJ exported!');
    } catch (error) {
      console.error('OBJ export error:', error);
      toast.error('OBJ export failed');
    }
  };


  const saveBlob = (blob: Blob, filename: string) => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return null;
}
