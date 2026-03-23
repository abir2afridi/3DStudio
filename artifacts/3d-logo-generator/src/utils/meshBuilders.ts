import * as THREE from 'three';
import { ShapeOptions, GenerationQuality } from '@/types/editor';
import { buildAlphaMask } from './maskBuilder';
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

  // Sort by absolute area descending (largest = most likely outer boundary)
  const sorted = contours
    .map(pts => ({ pts, absArea: Math.abs(signedArea(pts)) }))
    .sort((a, b) => b.absArea - a.absArea);

  // Discard tiny noise contours (< 0.5% of the largest)
  const minArea = sorted[0].absArea * 0.005;
  const significant = sorted.filter(c => c.absArea > minArea);

  const shapes: THREE.Shape[] = [];
  const usedAsHole = new Set<number>();

  for (let i = 0; i < significant.length; i++) {
    if (usedAsHole.has(i)) continue;

    const outer = significant[i].pts;
    const nOuter = normalizePts(outer, maxD, w, h);
    const shape = new THREE.Shape();
    nOuter.forEach((pt, idx) => idx === 0 ? shape.moveTo(pt.x, pt.y) : shape.lineTo(pt.x, pt.y));
    shape.closePath();

    // Any smaller contour whose representative point is inside `outer` becomes a hole.
    for (let j = i + 1; j < significant.length; j++) {
      if (usedAsHole.has(j)) continue;
      const inner = significant[j].pts;
      // Test middle point for robustness (avoids edge-pixel ambiguity at index 0)
      const testPt = inner[Math.floor(inner.length / 2)];
      if (pointInPolygon(testPt.x, testPt.y, outer)) {
        const nInner = normalizePts(inner, maxD, w, h);
        const hole = new THREE.Path();
        nInner.forEach((pt, idx) => idx === 0 ? hole.moveTo(pt.x, pt.y) : hole.lineTo(pt.x, pt.y));
        hole.closePath();
        shape.holes.push(hole);
        usedAsHole.add(j);
      }
    }

    shapes.push(shape);
  }
  return shapes;
}

// ━━━ STEP 3: IMAGE → THREE.Shape[] ━━━
async function imageToOutlineShapes(
  file: File,
  quality: GenerationQuality,
  smoothing: number,
  invertImage: boolean,
  reportProgress?: (p: string) => void
): Promise<THREE.Shape[]> {
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
  return shapes;
}

function remapFrontFaceUVs(geo: THREE.ExtrudeGeometry) {
  if (!geo.groups || geo.groups.length < 2) {
    console.warn('[UV] No groups found'); return;
  }
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const g = geo.groups[0]; // front face
  let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;

  for (let i = g.start; i < g.start + g.count; i++) {
    const u = uv.getX(i), v = uv.getY(i);
    if (u < minU) minU = u; if (u > maxU) maxU = u;
    if (v < minV) minV = v; if (v > maxV) maxV = v;
  }

  const rU = maxU - minU, rV = maxV - minV;
  if (rU < 0.0001 || rV < 0.0001) { console.warn('[UV] Degenerate range'); return; }

  for (let i = g.start; i < g.start + g.count; i++) {
    uv.setXY(i, (uv.getX(i) - minU) / rU, (uv.getY(i) - minV) / rV);
  }
  uv.needsUpdate = true;
  console.log(`[UV] Remapped: U[${minU.toFixed(3)}–${maxU.toFixed(3)}] V[${minV.toFixed(3)}–${maxV.toFixed(3)}]`);
}

// ━━━ STRATEGY 1: TEXTURED EXTRUSION ━━━
async function buildTexturedMesh(file: File, opts: ShapeOptions, reportProgress?: (p: string) => void): Promise<THREE.Mesh> {
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
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
  remapFrontFaceUVs(geometry);

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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 5, opts.invertImage, reportProgress);
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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 4, opts.invertImage, reportProgress);
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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 3, opts.invertImage, reportProgress);
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
  const shapes = await imageToOutlineShapes(file, opts.quality ?? 'balanced', opts.smoothing ?? 0, opts.invertImage, reportProgress);
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
    case 'textured':
    default: obj = await buildTexturedMesh(file, opts, reportProgress); break;
  }

  obj.scale.setScalar(opts.scale);
  reportProgress?.('Done!');
  return obj;
}
