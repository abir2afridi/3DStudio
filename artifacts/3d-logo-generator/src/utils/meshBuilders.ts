import * as THREE from 'three';
import { ShapeOptions, GenerationQuality } from '@/types/editor';
import { buildAlphaMask, fillHoles } from './maskBuilder';
import { marchingSquares } from './marchingSquares';
import { smoothContour, simplifyContour } from './contourUtils';
import { kMeansCluster, getLuminance } from './kMeans';
import { buildSelectedMaterial, applyPresetToMaterial } from './materials';

// ━━━ QUALITY PARAMS ━━━
const QUALITY_PARAMS: Record<GenerationQuality, { maxDim: number; rdpTol: number }> = {
  draft:    { maxDim: 384, rdpTol: 2.5 },
  balanced: { maxDim: 768, rdpTol: 1.2 },
  high:     { maxDim: 1024, rdpTol: 0.6 },
};

// ━━━ HOLE DETECTION HELPERS ━━━

/** Signed area (positive = CCW in image pixel space = outer boundary). */
function signedArea(pts: {x:number,y:number}[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return a / 2;
}

/** Ray-casting point-in-polygon test (image pixel coordinates). */
function pointInPolygon(px: number, py: number, poly: {x:number,y:number}[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Normalize pixel points into [-0.5, 0.5] range preserving aspect ratio. */
function normalizePts(pts: {x:number,y:number}[], maxD: number, w: number, h: number) {
  return pts.map(pt => ({
    x:  pt.x / maxD - w / (2 * maxD),
    y: -(pt.y / maxD - h / (2 * maxD)),
  }));
}

/**
 * Convert a list of raw pixel-space contours into THREE.Shape objects with
 * proper holes. Smaller contours that lie inside a larger contour are added
 * as THREE.Path holes instead of separate shapes, so rings / letter counters
 * (O, B, D, A, …) are correctly hollow in the extruded geometry.
 */
function buildShapesWithHoles(
  contours: {x:number,y:number}[][],
  maxD: number,
  w: number,
  h: number
): THREE.Shape[] {
  if (contours.length === 0) return [];

  // Sort by absolute area descending
  const sorted = contours
    .map(pts => ({ pts, absArea: Math.abs(signedArea(pts)) }))
    .sort((a, b) => b.absArea - a.absArea);

  // Lower noise threshold for better small detail (0.1% instead of 0.5%)
  const minArea = sorted[0].absArea * 0.001;
  const significant = sorted.filter(c => c.absArea > minArea);

  // 1. Identify immediate parent for each contour
  const parents = new Array(significant.length).fill(-1);
  for (let i = 0; i < significant.length; i++) {
    const testPt = significant[i].pts[Math.floor(significant[i].pts.length / 2)];
    for (let j = 0; j < significant.length; j++) {
      if (i === j) continue;
      if (pointInPolygon(testPt.x, testPt.y, significant[j].pts)) {
        // j is an ancestor of i. We want the tightest parent (smallest area).
        if (parents[i] === -1 || significant[j].absArea < significant[parents[i]].absArea) {
          parents[i] = j;
        }
      }
    }
  }

  // 2. Calculate nesting depth for each contour
  const depths = new Array(significant.length).fill(0);
  for (let i = 0; i < significant.length; i++) {
    let p = parents[i];
    while (p !== -1) {
      depths[i]++;
      p = parents[p];
    }
  }

  // 3. Convert to THREE.Shape and THREE.Path (holes)
  const shapes: THREE.Shape[] = [];
  // Store indices to facilitate connecting holes to parents
  const indexToShape = new Map<number, THREE.Shape>();

  for (let i = 0; i < significant.length; i++) {
    const isHole = depths[i] % 2 === 1;
    const nPts = normalizePts(significant[i].pts, maxD, w, h);
    
    if (!isHole) {
      const shape = new THREE.Shape();
      nPts.forEach((pt, idx) => idx === 0 ? shape.moveTo(pt.x, pt.y) : shape.lineTo(pt.x, pt.y));
      shape.closePath();
      shapes.push(shape);
      indexToShape.set(i, shape);
    } else {
      const path = new THREE.Path();
      nPts.forEach((pt, idx) => idx === 0 ? path.moveTo(pt.x, pt.y) : path.lineTo(pt.x, pt.y));
      path.closePath();
      
      // Find the nearest ancestor that is a Shape (even depth)
      let ancestorIdx = parents[i];
      while (ancestorIdx !== -1 && depths[ancestorIdx] % 2 !== 0) {
        ancestorIdx = parents[ancestorIdx];
      }
      
      const parentShape = indexToShape.get(ancestorIdx);
      if (parentShape) {
        parentShape.holes.push(path);
      } else {
        // Fallback: If no shape parent found, treat as separate shape
        const shape = new THREE.Shape();
        nPts.forEach((pt, idx) => idx === 0 ? shape.moveTo(pt.x, pt.y) : shape.lineTo(pt.x, pt.y));
        shape.closePath();
        shapes.push(shape);
      }
    }
  }

  console.log(`[Shapes] ${shapes.length} outer shapes created from ${significant.length} contours.`);
  return shapes;
}

// ━━━ STEP 3: IMAGE → THREE.Shape[] ━━━
async function imageToOutlineShapes(
  file: File,
  quality: GenerationQuality,
  smoothing: number,
  invertImage: boolean,
  reportProgress?: (p: string) => void
): Promise<{ shapes: THREE.Shape[]; w: number; h: number; maxD: number }> {
  reportProgress?.('Reading image pixels...');
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
  });

  const { maxDim, rdpTol } = QUALITY_PARAMS[quality] ?? QUALITY_PARAMS.balanced;
  const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
  const w = Math.floor(img.width * scale), h = Math.floor(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  if (invertImage) ctx.filter = 'invert(100%)';
  ctx.drawImage(img, 0, 0, w, h);
  if (invertImage) ctx.filter = 'none';
  URL.revokeObjectURL(url);

  const imageData = ctx.getImageData(0, 0, w, h);

  reportProgress?.('Detecting background and building alpha mask...');
  const mask = buildAlphaMask(imageData);

  const fgCount = mask.reduce((s, v) => s + v, 0);
  console.log(`[Mask] ${fgCount}/${w * h} px foreground (${Math.round(fgCount / (w * h) * 100)}%)`);

  reportProgress?.('Tracing shape outline...');
  const rawContours = marchingSquares(mask, w, h);
  if (rawContours.length === 0) throw new Error('No shape found. Try PNG with transparent background.');

  // Process each contour with configurable smoothing and tolerance
  const processed = rawContours
    .map(c => simplifyContour(smoothContour(c, smoothing), rdpTol))
    .filter(c => c.length >= 3);

  reportProgress?.('Building 3D geometry with hole detection...');
  const maxD = Math.max(w, h);
  const shapes = buildShapesWithHoles(processed, maxD, w, h);

  console.log(`[Shapes] ${shapes.length} shapes, ${shapes.reduce((s, sh) => s + sh.holes.length, 0)} holes`);
  return { shapes, w, h, maxD };
}

function remapFrontFaceUVs(geo: THREE.ExtrudeGeometry, canvasW?: number, canvasH?: number, maxDim?: number) {
  if (!geo.groups || geo.groups.length < 2) {
    console.warn('[UV] No groups found'); return;
  }
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const g = geo.groups[0]; // front face

  // If we have canvas dimension info, we can do a "Canvas Perfect" mapping
  if (canvasW && canvasH && maxDim) {
    const wRatio = maxDim / canvasW;
    const hRatio = maxDim / canvasH;
    
    for (let i = g.start; i < g.start + g.count; i++) {
      const x = uv.getX(i);
      const y = uv.getY(i);
      // The vertices are in centered normalized space [-w/2maxD, w/2maxD]
      // So we map them back to [0, 1] relative to the canvas
      const u = x * wRatio + 0.5;
      const v = y * hRatio + 0.5;
      uv.setXY(i, u, v);
    }
  } else {
    // Original logic: Tight stretch to bounding box
    let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
    for (let i = g.start; i < g.start + g.count; i++) {
      const u = uv.getX(i), v = uv.getY(i);
      if (u < minU) minU = u; if (u > maxU) maxU = u;
      if (v < minV) minV = v; if (v > maxV) maxV = v;
    }
    const rU = (maxU - minU) || 1, rV = (maxV - minV) || 1;
    for (let i = g.start; i < g.start + g.count; i++) {
      uv.setXY(i, (uv.getX(i) - minU) / rU, (uv.getY(i) - minV) / rV);
    }
  }
  uv.needsUpdate = true;
}

// ━━━ STRATEGY 1: TEXTURED EXTRUSION ━━━
async function buildTexturedMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const { shapes, w, h, maxD } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted');

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 40,
    bevelEnabled: opts.bevel ?? true,
    bevelThickness: opts.bevelSize / 400,
    bevelSize: opts.bevelSize / 500,
    bevelSegments: opts.quality === 'high' ? Math.max(8, opts.bevelSegments * 2) : opts.bevelSegments,
    curveSegments: opts.quality === 'high' ? 48 : opts.quality === 'draft' ? 12 : 24,
  });

  // CRITICAL ORDER: center FIRST, then remap UVs
  geometry.center();
  if (opts.smoothNormals) geometry.computeVertexNormals();
  remapFrontFaceUVs(geometry, w, h, maxD);

  reportProgress?.('Applying material & texture...');
  
  // Re-create the canvas texture to ensure it has the inversion if requested
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
  });
  URL.revokeObjectURL(url);
  
  const canvas = document.createElement('canvas');
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  if (opts.invertImage) ctx.filter = 'invert(100%)';
  ctx.drawImage(img, 0, 0, img.width, img.height);
  
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  
  // Apply texture transformation
  const tScale = opts.textureScale ?? 1.0;
  tex.repeat.set(1 / tScale, 1 / tScale);
  tex.offset.set((opts.textureOffsetX ?? 0) / 100, (opts.textureOffsetY ?? 0) / 100);
  tex.rotation = (opts.textureRotation ?? 0) * (Math.PI / 180);
  tex.center.set(0.5, 0.5);
  
  // Enable wrapping so texture doesn't disappear when offset
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  
  tex.needsUpdate = true;

  const frontMat = new THREE.MeshPhysicalMaterial({
    map: tex,
    metalness: 0.4,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    sheen: 0.5,
    sheenRoughness: 0.2,
    sheenColor: new THREE.Color(0xffffff),
    side: THREE.FrontSide,
    transparent: true,
    alphaTest: 0.05,
  });
  frontMat.needsUpdate = true;

  if (opts.colorMix > 0 && opts.colorSource === 'material') {
    const blend = new THREE.Color().lerpColors(
      new THREE.Color(0xffffff),
      new THREE.Color(opts.material.color ?? 0xffd700),
      opts.colorMix / 100
    );
    frontMat.color = blend;
    if (opts.colorMix >= 100) frontMat.map = null;
  }

  const sideMat = buildSelectedMaterial(opts);
  const mesh = new THREE.Mesh(geometry, [frontMat, sideMat]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ━━━ STRATEGY 2: LAYERED COLORS ━━━
async function buildMultiLayerMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Group> {
  reportProgress?.('Extracting color layers...');
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
  });
  URL.revokeObjectURL(url);

  const { maxDim, rdpTol } = QUALITY_PARAMS[opts.quality ?? 'balanced'];
  const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
  const w = Math.floor(img.width * scale), h = Math.floor(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  if (opts.invertImage) ctx.filter = 'invert(100%)';
  ctx.drawImage(img, 0, 0, w, h);
  if (opts.invertImage) ctx.filter = 'none';
  const imageData = ctx.getImageData(0, 0, w, h);

  // Apply foreground mask so k-means never clusters background pixels.
  const fgMask = buildAlphaMask(imageData);
  const maskedData = new Uint8ClampedArray(imageData.data);
  for (let i = 0; i < fgMask.length; i++) {
    if (fgMask[i] === 0) maskedData[i * 4 + 3] = 0;
  }
  const maskedImageData = new ImageData(maskedData, w, h);

  const clusters = kMeansCluster(maskedImageData, opts.layerCount ?? 6);
  clusters.sort((a, b) => getLuminance(a.color) - getLuminance(b.color));

  const group = new THREE.Group();
  const totalDepth = opts.thickness / 40;
  let zAcc = 0;

  const maxD = Math.max(w, h);
  const smoothIter = opts.smoothing ?? 3;

  reportProgress?.(`Building ${clusters.length} 3D layers...`);
  for (const cluster of clusters) {
    const rawContours = marchingSquares(cluster.mask, w, h);
    if (!rawContours.length) continue;
    const processed = rawContours
      .map(c => simplifyContour(smoothContour(c, smoothIter), rdpTol))
      .filter(c => c.length >= 3);

    // Build shapes with holes for each layer too
    const shapes = buildShapesWithHoles(processed, maxD, w, h);
    if (!shapes.length) continue;

    const layerDepth = totalDepth / clusters.length;
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: layerDepth,
      bevelEnabled: false,
      curveSegments: opts.quality === 'high' ? 16 : 8,
    });

    const mat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(cluster.color),
      metalness: opts.colorSource === 'material' ? (opts.material.metalness ?? 0.3) : 0.4,
      roughness: opts.colorSource === 'material' ? (opts.material.roughness ?? 0.4) : 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = zAcc - totalDepth / 2;
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
    zAcc += layerDepth * 0.8;
  }

  if (group.children.length === 0) throw new Error("Could not extract enough colors.");

  const box = new THREE.Box3().setFromObject(group);
  group.position.sub(box.getCenter(new THREE.Vector3()));
  return group;
}

// ━━━ STRATEGY 3: RELIEF SCULPT ━━━
async function buildHeightMapMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  reportProgress?.('Generating height map...');

  // Quality-dependent resolution
  const baseRes = opts.quality === 'high' ? 512 : opts.quality === 'draft' ? 128 : 256;

  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url;
  });
  URL.revokeObjectURL(url);

  const imgMaxD = Math.max(img.width, img.height);
  const planeW = img.width / imgMaxD;
  const planeH = img.height / imgMaxD;

  const resX = Math.round(baseRes * planeW);
  const resY = Math.round(baseRes * planeH);
  const geo = new THREE.PlaneGeometry(planeW, planeH, resX, resY);

  const canvas = document.createElement('canvas');
  canvas.width = resX; canvas.height = resY;
  const ctx = canvas.getContext('2d')!;
  if (opts.invertImage) ctx.filter = 'invert(100%)';
  ctx.drawImage(img, 0, 0, resX, resY);
  if (opts.invertImage) ctx.filter = 'none';
  const { data } = ctx.getImageData(0, 0, resX, resY);
  const pos = geo.attributes.position;
  const maxDisp = opts.thickness / 40;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const px = Math.max(0, Math.min(resX - 1, Math.floor((x / planeW + 0.5) * resX)));
    const py = Math.max(0, Math.min(resY - 1, Math.floor((0.5 - y / planeH) * resY)));
    const idx = (py * resX + px) * 4;
    const lum = (0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2]) / 255;
    const a = data[idx + 3];
    pos.setZ(i, a < 128 ? -maxDisp * 0.5 : lum < 0.15 ? 0 : maxDisp * lum);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  const originalCanvas = document.createElement('canvas');
  originalCanvas.width = img.width; originalCanvas.height = img.height;
  const originalCtx = originalCanvas.getContext('2d')!;
  if (opts.invertImage) originalCtx.filter = 'invert(100%)';
  originalCtx.drawImage(img, 0, 0, img.width, img.height);
  
  const tex = new THREE.CanvasTexture(originalCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;

  const mat = new THREE.MeshPhysicalMaterial({
    map: opts.colorSource === 'image' ? tex : null,
    metalness: opts.material.metalness ?? 0.4,
    roughness: opts.material.roughness ?? 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });
  if (opts.colorSource === 'material') applyPresetToMaterial(mat, opts.material);

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// ━━━ STRATEGY 4: VOXEL BLOCKS ━━━
async function buildVoxelMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Object3D> {
  reportProgress?.('Generating voxel grid...');

  // Target resolutions based on quality
  const targetRes = opts.quality === 'high' ? 80 : opts.quality === 'draft' ? 30 : 50;

  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url;
  });
  URL.revokeObjectURL(url);

  const imgMaxD = Math.max(img.width, img.height);
  const scale = targetRes / imgMaxD;
  const resX = Math.floor(img.width * scale);
  const resY = Math.floor(img.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = resX; canvas.height = resY;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  if (opts.invertImage) ctx.filter = 'invert(100%)';
  ctx.drawImage(img, 0, 0, resX, resY);
  if (opts.invertImage) ctx.filter = 'none';
  const { data } = ctx.getImageData(0, 0, resX, resY);

  // First pass to discover valid pixels
  const validPixels: { x: number, y: number, color: THREE.Color }[] = [];
  for (let py = 0; py < resY; py++) {
    for (let px = 0; px < resX; px++) {
      const idx = (py * resX + px) * 4;
      const alpha = data[idx + 3];
      if (alpha > 128) {
        // Pixel is foreground
        let col = new THREE.Color(data[idx] / 255, data[idx + 1] / 255, data[idx + 2] / 255);
        if (opts.colorSource === 'material') {
          col = new THREE.Color(opts.material.color ?? 0xffffff);
        }
        validPixels.push({ x: px, y: py, color: col });
      }
    }
  }

  if (validPixels.length === 0) throw new Error("No pixels found for voxel grid.");

  // Single box size (derived from the fact we want the max dimension to be roughly 1.0 unit wide)
  const boxSize = 1.0 / targetRes;
  const depth = (opts.thickness / 40) || boxSize; 

  const geometry = opts.quality === 'high' 
    ? new THREE.BoxGeometry(boxSize * 0.98, boxSize * 0.98, depth * 0.98, 1, 1, 1) 
    : new THREE.BoxGeometry(boxSize * 0.95, boxSize * 0.95, depth * 0.95);
  // Add slight bevel to voxels if requested
  if (opts.bevel) {
      // It's expensive to bevel every voxel, so we just stick with box geo but maybe tweak material
  }

  const mat = new THREE.MeshStandardMaterial({
    metalness: opts.colorSource === 'material' ? (opts.material.metalness ?? 0.3) : 0.1,
    roughness: opts.colorSource === 'material' ? (opts.material.roughness ?? 0.4) : 0.8,
  });

  const mesh = new THREE.InstancedMesh(geometry, mat, validPixels.length);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < validPixels.length; i++) {
    const p = validPixels[i];
    // Map pixel coordinates to centered world coordinates
    const wx = (p.x / targetRes) - (resX / targetRes) / 2;
    const wy = -(p.y / targetRes) + (resY / targetRes) / 2;
    
    dummy.position.set(wx, wy, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.setColorAt(i, p.color);
  }
  
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  return mesh;
}

// ━━━ STRATEGY 5: NEON TUBE ━━━
async function buildNeonMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Object3D> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted for neon mode');

  const group = new THREE.Group();
  
  const neonColor = opts.colorSource === 'material' ? new THREE.Color(opts.material.color ?? 0x00ffcc) : new THREE.Color(0x00ffcc);
  
  const mat = new THREE.MeshStandardMaterial({
    color: neonColor,
    emissive: neonColor,
    emissiveIntensity: 2.5,
    roughness: 0.1,
    metalness: 0.8,
  });

  const tubeRadius = Math.max(0.005, (opts.thickness / 800));
  const radialSegments = opts.quality === 'draft' ? 5 : 8;

  for (const shape of shapes) {
    const pts = shape.getPoints();
    if (pts.length > 2) {
      const curve3D = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p.x, p.y, 0)), true);
      const tubeGeo = new THREE.TubeGeometry(curve3D, pts.length * 3, tubeRadius, radialSegments, true);
      const mesh = new THREE.Mesh(tubeGeo, mat);
      mesh.castShadow = true;
      group.add(mesh);
    }

    for (const hole of shape.holes) {
      const hPts = hole.getPoints();
      if (hPts.length > 2) {
        const hCurve3D = new THREE.CatmullRomCurve3(hPts.map(p => new THREE.Vector3(p.x, p.y, 0)), true);
        const hTubeGeo = new THREE.TubeGeometry(hCurve3D, hPts.length * 3, tubeRadius, radialSegments, true);
        const hMesh = new THREE.Mesh(hTubeGeo, mat);
        hMesh.castShadow = true;
        group.add(hMesh);
      }
    }
  }

  // Center the group securely
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.children.forEach(c => {
    c.position.sub(center);
  });

  return group;
}

// ━━━ STRATEGY 6: CRYSTAL / GLASS ━━━
async function buildCrystalMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted for crystal mode');

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 40,
    bevelEnabled: opts.bevel ?? true,
    bevelThickness: opts.bevelSize / 500,
    bevelSize: opts.bevelSize / 600,
    bevelSegments: opts.bevelSegments,
    curveSegments: opts.quality === 'high' ? 24 : opts.quality === 'draft' ? 8 : 16,
  });

  geometry.center();
  if (opts.smoothNormals) geometry.computeVertexNormals();

  const baseColor = opts.colorSource === 'material' ? new THREE.Color(opts.material.color ?? 0xffffff) : new THREE.Color(0xffffff);

  const mat = new THREE.MeshPhysicalMaterial({
    color: baseColor,
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.95, // Glass effect
    ior: 1.52,          // Index of refraction for glass
    thickness: opts.thickness / 20, // Refraction thickness
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
  });

  const mesh = new THREE.Mesh(geometry, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

// ━━━ STRATEGY 7: HOLO WIREFRAME ━━━
async function buildWireframeMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted for wireframe mode');

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 40,
    bevelEnabled: opts.bevel ?? true,
    bevelThickness: opts.bevelSize / 500,
    bevelSize: opts.bevelSize / 600,
    bevelSegments: opts.bevelSegments,
    curveSegments: opts.quality === 'high' ? 24 : opts.quality === 'draft' ? 8 : 16,
  });

  geometry.center();

  const wireColor = opts.colorSource === 'material' ? new THREE.Color(opts.material.color ?? 0x00ffcc) : new THREE.Color(0x00ffcc);

  const mat = new THREE.MeshStandardMaterial({
    color: wireColor,
    emissive: wireColor,
    emissiveIntensity: 2.0, // Glow effect
    wireframe: true,
    transparent: true,
    opacity: 0.8,
  });

  const mesh = new THREE.Mesh(geometry, mat);
  // Wireframes don't cast nice shadows usually
  return mesh;
}

// ━━━ STRATEGY 8: INFLATED / SOFT ━━━
async function buildInflatedMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 5, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted');

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 50,
    bevelEnabled: true,
    bevelThickness: opts.thickness / 40,
    bevelSize: opts.thickness / 50,
    bevelSegments: Math.max(8, opts.bevelSegments * 2),
    curveSegments: 24,
  });

  geometry.center();
  geometry.computeVertexNormals();

  const baseCol = opts.colorSource === 'material' ? new THREE.Color(opts.material.color ?? 0xffffff) : new THREE.Color(0xffffff);

  const mat = new THREE.MeshPhysicalMaterial({
    color: baseCol,
    metalness: 0.1,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    sheen: 1.0,
    sheenColor: new THREE.Color(0xffffff),
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// ━━━ STRATEGY 9: CLAY / MATTE ━━━
async function buildClayMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 4, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted');

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 40,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 6,
    curveSegments: 16,
  });

  geometry.center();
  geometry.computeVertexNormals();

  const clayColor = opts.colorSource === 'material' ? new THREE.Color(opts.material.color ?? 0xeec4a1) : new THREE.Color(0xeec4a1);

  const mat = new THREE.MeshPhysicalMaterial({
    color: clayColor,
    roughness: 0.8,
    metalness: 0,
    flatShading: false,
  });

  const mesh = new THREE.Mesh(geometry, mat);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

// ━━━ STRATEGY 10: HOLOGRAM ━━━
async function buildHologramMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted');

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 100,
    bevelEnabled: false,
    curveSegments: 12,
  });

  geometry.center();

  const holoColor = opts.colorSource === 'material' ? new THREE.Color(opts.material.color ?? 0x00ffff) : new THREE.Color(0x00ffff);

  const mat = new THREE.MeshStandardMaterial({
    color: holoColor,
    emissive: holoColor,
    emissiveIntensity: 1.5,
    transparent: true,
    opacity: 0.4,
    wireframe: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, mat);
  return mesh;
}

// ━━━ STRATEGY 11: BLUEPRINT ━━━
async function buildBlueprintMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Group> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 0, opts.invertImage, reportProgress);
  if (!shapes.length) throw new Error('No shape extracted');

  const group = new THREE.Group();
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 40,
    bevelEnabled: false,
    curveSegments: 12,
  });
  geometry.center();

  const lineMat = new THREE.LineBasicMaterial({ color: 0x4488ff, linewidth: 2 });
  const edges = new THREE.EdgesGeometry(geometry);
  const line = new THREE.LineSegments(edges, lineMat);
  group.add(line);

  const fillMat = new THREE.MeshBasicMaterial({ 
    color: 0x002244, 
    transparent: true, 
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const fill = new THREE.Mesh(geometry, fillMat);
  group.add(fill);

  return group;
}

// ━━━ STRATEGY 12: STUDIO / CLEAN ━━━
// ━━━ STRATEGY 12: STUDIO / CLEAN (SCULPTED) ━━━
async function buildStudioMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Object3D> {
  const style = (opts as any).studioStyle || (opts.studioDetail ? 'sculpted' : 'solid');

  // Case 1: Pure Solid Silhouette
  if (style === 'solid') {
    reportProgress?.('Building solid silhouette...');
    return await buildStudioMeshBasic(file, opts);
  }

  // Common analysis for Sculpted and Layered
  reportProgress?.('Analyzing logo sculpture...');
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url;
  });
  URL.revokeObjectURL(url);

  const { maxDim, rdpTol } = QUALITY_PARAMS[opts.quality ?? 'balanced'];
  const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
  const w = Math.floor(img.width * scale), h = Math.floor(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  if (opts.invertImage) ctx.filter = 'invert(100%)';
  ctx.drawImage(img, 0, 0, w, h);
  if (opts.invertImage) ctx.filter = 'none';
  const imageData = ctx.getImageData(0, 0, w, h);
  const fgMask = buildAlphaMask(imageData);
  const smooth = opts.smoothing ?? 3;
  const maxD = Math.max(w, h);
  const baseThickness = opts.thickness / 40;
  const mat = buildSelectedMaterial(opts);

  const group = new THREE.Group();

  // Case 2: Sculpted (Base + Relief)
  if (style === 'sculpted') {
    const baseMask = opts.studioRemoveHoles ? fillHoles(fgMask, w, h) : fgMask;
    const baseContours = marchingSquares(baseMask, w, h);
    if (baseContours.length) {
      const processedBase = baseContours
        .map(c => simplifyContour(smoothContour(c, smooth), rdpTol))
        .filter(c => c.length >= 3);
      const baseShapes = buildShapesWithHoles(processedBase, maxD, w, h);
      const baseGeo = new THREE.ExtrudeGeometry(baseShapes, {
        depth: baseThickness,
        bevelEnabled: opts.bevel ?? true,
        bevelThickness: opts.bevelSize / 400,
        bevelSize: opts.bevelSize / 500,
      });
      if (opts.smoothNormals) baseGeo.computeVertexNormals();
      baseGeo.center();

      // The base mesh (flat background layer) is removed as per user's request.
    }

    // Add sculpted relief layers (the detailed structure)
    const maskedData = new Uint8ClampedArray(imageData.data);
    for (let i = 0; i < fgMask.length; i++) {
      if (fgMask[i] === 0) maskedData[i * 4 + 3] = 0;
    }
    const detailCount = Math.min(6, (opts.layerCount ?? 4));
    const clusters = kMeansCluster(new ImageData(maskedData, w, h), detailCount);
    clusters.sort((a, b) => getLuminance(b.color) - getLuminance(a.color));

    reportProgress?.(`Adding ${clusters.length} premium sculpted details...`);
    const surfaceZ = 0; // Surface at 0 since there's no base block
    const reliefDepth = baseThickness / 2; // Extra depth for the single layer sculpture

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const clusterMask = opts.studioRemoveHoles ? fillHoles(cluster.mask, w, h) : cluster.mask;
      const rawContours = marchingSquares(clusterMask, w, h);
      if (!rawContours.length) continue;
      const processed = rawContours
        .map(c => simplifyContour(smoothContour(c, smooth), rdpTol))
        .filter(c => c.length >= 3);
      const shapes = buildShapesWithHoles(processed, maxD, w, h);
      if (!shapes.length) continue;

      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth: reliefDepth,
        bevelEnabled: opts.bevel ?? true,
        bevelThickness: opts.bevelSize / 600,
        bevelSize: opts.bevelSize / 600,
        bevelSegments: 4,
      });
      
      const detailColor = new THREE.Color(mat.color).multiplyScalar(1.0 + (i * 0.05));
      const detailMat = new THREE.MeshPhysicalMaterial({
        color: detailColor,
        metalness: 0.8,
        roughness: 0.15,
        clearcoat: 1.0,
        emissive: detailColor,
        emissiveIntensity: 0.1, // Subtle highlight glow
      });

      const mesh = new THREE.Mesh(geo, detailMat);
      mesh.position.z = surfaceZ + (i * 0.01);
      mesh.castShadow = true; mesh.receiveShadow = true;
      group.add(mesh);
    }
  }

  // Case 3 & 4: Structure & Outline (wire-frame tubes from internal detail outlines)
  if (style === 'layered' || style === 'outline') {
    reportProgress?.('Analyzing internal structure...');

    // Extract detail layers for a "Detailed Outline"
    const maskedData = new Uint8ClampedArray(imageData.data);
    for (let i = 0; i < fgMask.length; i++) {
        if (fgMask[i] === 0) maskedData[i * 4 + 3] = 0;
    }
    
    // --- PERFORMANCE OPTIMIZATION ---
    const isOutline = style === 'outline';
    const structureRdpTol = isOutline ? rdpTol * 1.5 : rdpTol * 2.5; 

    // Initializing structure analysis parameters
    const allContours: {x: number, y: number}[][] = [];
    const seenHashes = new Set<string>();
    
    // We use clusters to find internal detail structures
    const detailCount = isOutline ? 12 : Math.min(8, (opts.layerCount ?? 4) + 2);
    const clusters = kMeansCluster(new ImageData(maskedData, w, h), detailCount);

    // For Outline mode, we use the TOTAL foreground mask to get a single, highly detailed outline.
    // This avoids the 'double layer' problem created by overlapping clusters.
    const clustersToUse = isOutline ? [{ mask: fgMask }] : clusters;

    for (const cluster of clustersToUse) {
      const clusterContours = marchingSquares(cluster.mask, w, h);
      for (const c of clusterContours) {
        if (c.length < (isOutline ? 4 : 8)) continue; 
        const processed = simplifyContour(smoothContour(c, smooth), structureRdpTol);
        if (processed.length < (isOutline ? 2 : 3)) continue;
        
        // Robust deduplication
        const hash = `${Math.round(processed[0].x/10)},${Math.round(processed[0].y/10)},${processed.length}`;
        if (!seenHashes.has(hash)) {
          allContours.push(processed);
          seenHashes.add(hash);
        }
      }
    }

    if (!allContours.length) return await buildStudioMeshBasic(file, opts);

    // Outline mode uses thicker tubes and very close layers
    const tubeRadius = isOutline ? baseThickness / 60 : baseThickness / 140; 
    const totalDepth = isOutline ? 0 : baseThickness; // No depth for single outline
    const layerCount = isOutline ? 1 : Math.max(2, opts.layerCount ?? 4);

    const baseColor = mat.color || new THREE.Color(0xcccccc);

    for (let layer = 0; layer < layerCount; layer++) {
      const layerProgress = layerCount <= 1 ? 0 : (layer / (layerCount - 1));
      // For outline mode, ensure it's STRICTLY centered at 0
      const z = isOutline ? 0 : (layerProgress * totalDepth - (totalDepth / 2));
      
      const layerMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(baseColor).lerp(new THREE.Color(0xffffff), layerProgress * 0.4),
        metalness: 1.0,
        roughness: 0.1,
        clearcoat: 1.0,
        emissive: baseColor,
        emissiveIntensity: isOutline ? 0.3 : (0.2 + (layerProgress * 0.3)),
        transparent: true,
        opacity: isOutline ? 0.95 : (0.6 + (layerProgress * 0.3)),
        side: THREE.DoubleSide,
      });

      const layerGeometries: THREE.BufferGeometry[] = [];

      for (const contour of allContours) {
        const points3D = contour.map((pt: {x: number, y: number}) => {
          const x = (pt.x / maxD - 0.5);
          const y = -(pt.y / maxD - (h / maxD) * 0.5);
          return new THREE.Vector3(x, y, z);
        });
        points3D.push(points3D[0].clone());

        const curve = new THREE.CatmullRomCurve3(points3D, false, 'catmullrom', 0.2);
        
        const tubularSegments = Math.max(8, Math.floor(points3D.length * (isOutline ? 1.2 : 0.8)));
        const radialSegments = isOutline ? 4 : 3; 
        
        const tubeGeo = new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, radialSegments, false);
        layerGeometries.push(tubeGeo);
      }

      if (layerGeometries.length > 0) {
        const mergedGeo = layerGeometries.length > 1 
          ? (await import('three/examples/jsm/utils/BufferGeometryUtils.js')).mergeGeometries(layerGeometries)
          : layerGeometries[0];
          
        const layerMesh = new THREE.Mesh(mergedGeo, layerMat);
        layerMesh.castShadow = true;
        layerMesh.receiveShadow = true;
        group.add(layerMesh);
        
        if (layerGeometries.length > 1) {
          layerGeometries.forEach(g => g.dispose());
        }
      }
    }

    // Struts are only for the spaced-out 'layered' mode
    if (!isOutline) {
      reportProgress?.('Adding structural connectors...');
      const strutRadius = tubeRadius * 0.6;
      const strutMat = new THREE.MeshPhysicalMaterial({
          color: baseColor,
          transparent: true,
          opacity: 0.3,
          metalness: 0.5,
          roughness: 0.8
      });

      const sortedContours = [...allContours].sort((a, b) => b.length - a.length);
      const mainContours = sortedContours.slice(0, 2); 
      const strutGeos: THREE.BufferGeometry[] = [];

      for (const contour of mainContours) {
        const strutInterval = Math.max(8, Math.floor(contour.length / 8));
        for (let p = 0; p < contour.length; p += strutInterval) {
          const pt = contour[p];
          const x = (pt.x / maxD - 0.5);
          const y = -(pt.y / maxD - (h / maxD) * 0.5);
          
          for (let layer = 0; layer < layerCount - 1; layer++) {
            const z1 = (layer / (layerCount - 1)) * totalDepth - (totalDepth / 2);
            const z2 = ((layer + 1) / (layerCount - 1)) * totalDepth - (totalDepth / 2);

            const strutPath = new THREE.LineCurve3(new THREE.Vector3(x, y, z1), new THREE.Vector3(x, y, z2));
            const strutGeo = new THREE.TubeGeometry(strutPath, 1, strutRadius, 3, false);
            strutGeos.push(strutGeo);
          }
        }
      }

      if (strutGeos.length > 0) {
        const mergedStruts = (await import('three/examples/jsm/utils/BufferGeometryUtils.js')).mergeGeometries(strutGeos);
        const strutMesh = new THREE.Mesh(mergedStruts, strutMat);
        group.add(strutMesh);
        strutGeos.forEach(g => g.dispose());
      }
    }
  }

  if (group.children.length === 0) return await buildStudioMeshBasic(file, opts);

  // Center the entire group
  const box = new THREE.Box3().setFromObject(group);
  const center = box.getCenter(new THREE.Vector3());
  group.position.sub(center);

  return group;
}

// ━━━ STUDIO FALLBACK ━━━
async function buildStudioMeshBasic(file: File, opts: ShapeOptions): Promise<THREE.Mesh> {
  const { shapes } = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage);
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: opts.thickness / 40,
    bevelEnabled: opts.bevel ?? true,
    bevelThickness: opts.bevelSize / 400,
    bevelSize: opts.bevelSize / 500,
  });
  if (opts.smoothNormals) geometry.computeVertexNormals();
  geometry.center();
  const mesh = new THREE.Mesh(geometry, buildSelectedMaterial(opts));
  return mesh;
}

// ━━━ MAIN DISPATCHER ━━━
export async function buildMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Object3D> {
  let obj: THREE.Object3D;
  switch (opts.threeDMode) {
    case 'layered': obj = await buildMultiLayerMesh(file, opts, reportProgress); break;
    case 'relief':  obj = await buildHeightMapMesh(file, opts, reportProgress); break;
    case 'voxel':   obj = await buildVoxelMesh(file, opts, reportProgress); break;
    case 'neon':    obj = await buildNeonMesh(file, opts, reportProgress); break;
    case 'crystal': obj = await buildCrystalMesh(file, opts, reportProgress); break;
    case 'wireframe': obj = await buildWireframeMesh(file, opts, reportProgress); break;
    case 'inflated': obj = await buildInflatedMesh(file, opts, reportProgress); break;
    case 'clay': obj = await buildClayMesh(file, opts, reportProgress); break;
    case 'hologram': obj = await buildHologramMesh(file, opts, reportProgress); break;
    case 'blueprint': obj = await buildBlueprintMesh(file, opts, reportProgress); break;
    case 'studio': obj = await buildStudioMesh(file, opts, reportProgress); break;
    case 'textured':
    default: obj = await buildTexturedMesh(file, opts, reportProgress); break;
  }

  obj.scale.setScalar(opts.scale);
  reportProgress?.('Done!');
  return obj;
}
