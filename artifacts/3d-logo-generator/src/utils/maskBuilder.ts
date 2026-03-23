export function buildAlphaMask(imageData: ImageData): Uint8Array {
  const { data, width, height } = imageData;
  const total = width * height;
  const mask = new Uint8Array(total);
  
  // Check for real transparency (>1% truly transparent pixels)
  let transparentCount = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 128) transparentCount++;
  }
  const hasRealAlpha = transparentCount > total * 0.01;

  if (hasRealAlpha) {
    // Proper transparent PNG → use alpha directly
    for (let i = 0; i < data.length; i += 4) {
      mask[i / 4] = data[i + 3] > 128 ? 1 : 0;
    }
    return autoCorrectInversion(mask, total);
  }

  // No real alpha (JPG or solid-bg PNG) → detect bg from corners
  const samplePoints = [
    0, width-1,
    (height-1)*width, (height-1)*width+(width-1),
    Math.floor(width/2),
    (height-1)*width+Math.floor(width/2),
    Math.floor(height/2)*width,
    Math.floor(height/2)*width+(width-1),
  ];

  let bgR=0, bgG=0, bgB=0;
  samplePoints.forEach(idx => {
    bgR += data[idx*4]; bgG += data[idx*4+1]; bgB += data[idx*4+2];
  });
  bgR /= samplePoints.length;
  bgG /= samplePoints.length;
  bgB /= samplePoints.length;

  // Initial mask by Euclidean color distance from bg
  const threshold = 40;
  for (let i = 0; i < data.length; i += 4) {
    const dr=data[i]-bgR, dg=data[i+1]-bgG, db=data[i+2]-bgB;
    mask[i/4] = Math.sqrt(dr*dr+dg*dg+db*db) > threshold ? 1 : 0;
  }

  // Flood fill from border — TIGHT tolerance to prevent outline leakage
  const floodThreshold = threshold * 0.8;
  const visited = new Uint8Array(total);
  const queue: number[] = [];

  for (let x=0; x<width; x++) {
    if (mask[x]===0) queue.push(x);
    if (mask[(height-1)*width+x]===0) queue.push((height-1)*width+x);
  }
  for (let y=0; y<height; y++) {
    if (mask[y*width]===0) queue.push(y*width);
    if (mask[y*width+width-1]===0) queue.push(y*width+width-1);
  }

  let qi=0;
  while (qi<queue.length) {
    const idx=queue[qi++];
    if (visited[idx]) continue;
    visited[idx]=1; mask[idx]=0;
    const x=idx%width, y=Math.floor(idx/width);
    const neighbors=[
      y>0?idx-width:-1, y<height-1?idx+width:-1,
      x>0?idx-1:-1,     x<width-1?idx+1:-1,
    ];
    for (const n of neighbors) {
      if (n<0||visited[n]) continue;
      const dr=data[n*4]-bgR, dg=data[n*4+1]-bgG, db=data[n*4+2]-bgB;
      if (Math.sqrt(dr*dr+dg*dg+db*db) < floodThreshold) queue.push(n);
    }
  }

  const cleaned = morphClean(mask, width, height);
  return autoCorrectInversion(cleaned, total);
}

// CRITICAL FIX: Auto-detect and flip inverted masks
export function autoCorrectInversion(mask: Uint8Array, total: number): Uint8Array {
  let fg=0;
  for (let i=0; i<total; i++) if (mask[i]===1) fg++;
  const ratio = fg/total;

  if (ratio > 0.55) {
    // >55% foreground = almost certainly inverted → flip
    const flipped = new Uint8Array(total);
    for (let i=0; i<total; i++) flipped[i] = mask[i]===1?0:1;
    console.log(`[Mask] Inverted (${Math.round(ratio*100)}%) → auto-flipped`);
    return flipped;
  }
  console.log(`[Mask] OK — ${Math.round(ratio*100)}% foreground`);
  return mask;
}

// Morphological cleanup — remove noise, fill holes
export function morphClean(mask: Uint8Array, w: number, h: number): Uint8Array {
  const cleaned = new Uint8Array(mask);
  // Erosion: remove isolated orphan pixels (noise)
  // We check the 4-neighborhood to see if a pixel is truly isolated
  for (let y=1; y<h-1; y++) for (let x=1; x<w-1; x++) {
    const idx=y*w+x;
    if (mask[idx]===0) continue;
    const fg = mask[idx-w]+mask[idx+w]+mask[idx-1]+mask[idx+1];
    if (fg === 0) {
      cleaned[idx]=0;
    }
  }
  return cleaned;
}

/**
 * Fills internal holes in a binary mask using flood-fill from the border.
 * Any background pixel NOT reachable from the border is considered an internal hole.
 */
export function fillHoles(mask: Uint8Array, w: number, h: number): Uint8Array {
  const total = w * h;
  const visited = new Uint8Array(total);
  const queue: number[] = [];

  // Start from border and flood fill background (0) pixels
  for (let x = 0; x < w; x++) {
    if (mask[x] === 0) queue.push(x);
    if (mask[(h - 1) * w + x] === 0) queue.push((h - 1) * w + x);
  }
  for (let y = 0; y < h; y++) {
    if (mask[y * w] === 0) queue.push(y * w);
    if (mask[y * w + w - 1] === 0) queue.push(y * w + w - 1);
  }

  let head = 0;
  while (head < queue.length) {
    const idx = queue[head++];
    if (visited[idx]) continue;
    visited[idx] = 1;

    const x = idx % w;
    const y = Math.floor(idx / w);
    
    // Check 4-neighbors
    const neighbors = [
      y > 0 ? idx - w : -1,
      y < h - 1 ? idx + w : -1,
      x > 0 ? idx - 1 : -1,
      x < w - 1 ? idx + 1 : -1,
    ];
    
    for (const n of neighbors) {
      if (n >= 0 && !visited[n] && mask[n] === 0) {
        queue.push(n);
      }
    }
  }

  // Any pixel that was 0 but NOT visited during border-flood-fill is a hole
  const filled = new Uint8Array(mask);
  for (let i = 0; i < total; i++) {
    if (mask[i] === 0 && !visited[i]) {
      filled[i] = 1;
    }
  }

  return filled;
}
