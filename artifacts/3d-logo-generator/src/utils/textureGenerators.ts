import * as THREE from 'three';
import { simplexNoise2D } from './noise';
import { SurfaceTexture } from '@/types/editor';

export function generateTexture(type: SurfaceTexture, repeat: number): THREE.CanvasTexture | null {
  if (type === 'none') return null;
  
  const c = document.createElement('canvas'); 
  c.width = c.height = 512;
  const ctx = c.getContext('2d')!;

  switch(type){
    case 'brushed':
      for(let y=0; y<512; y+=2){
        const v = 120 + Math.random()*30;
        ctx.strokeStyle = `rgb(${v},${v},${v})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(512,y); ctx.stroke();
      }
      break;
    case 'hammered':
      ctx.fillStyle = '#888'; ctx.fillRect(0,0,512,512);
      for(let i=0; i<200; i++){
        const x = Math.random()*512, y = Math.random()*512, r = 4+Math.random()*12;
        const g = ctx.createRadialGradient(x,y,0,x,y,r);
        g.addColorStop(0, 'rgba(255,255,255,0.4)');
        g.addColorStop(0.5, 'rgba(100,100,100,0.2)');
        g.addColorStop(1, 'rgba(0,0,0,0.3)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
      break;
    case 'carbon':
      for(let y=0; y<512; y+=4) {
        for(let x=0; x<512; x+=4){
          const shift = (Math.floor(y/4)%2)*2;
          ctx.fillStyle = (Math.floor((x+shift)/2)%2===0) ? '#1a1a1a' : '#2d2d2d';
          ctx.fillRect(x,y,4,4);
        }
      }
      break;
    case 'wood':
      for(let y=0; y<512; y++){
        const v = 140 + Math.sin(y*0.2)*30 + Math.sin(y*0.05)*20;
        ctx.fillStyle = `rgb(${Math.floor(v*0.7)},${Math.floor(v*0.5)},${Math.floor(v*0.2)})`;
        ctx.fillRect(0,y,512,1);
      }
      break;
    case 'leather':
      for(let y=0; y<512; y+=2) {
        for(let x=0; x<512; x+=2){
          const n = simplexNoise2D(x*0.02, y*0.02);
          const v = Math.floor(80 + n*40);
          ctx.fillStyle = `rgb(${v},${Math.floor(v*0.7)},${Math.floor(v*0.5)})`;
          ctx.fillRect(x,y,2,2);
        }
      }
      break;
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}
