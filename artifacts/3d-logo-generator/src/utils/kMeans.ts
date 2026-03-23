export function kMeansCluster(imageData: ImageData, k: number) {
  const { data, width, height } = imageData;
  const total = width * height;
  const valid: [number, number, number][] = [];
  
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 128) valid.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (!valid.length) return [];

  let centers: [number, number, number][] = Array.from({ length: Math.min(k, valid.length) }, () => {
    const idx = Math.floor(Math.random() * valid.length);
    return [...valid[idx]] as [number, number, number];
  });
  
  const assignments = new Int32Array(total).fill(-1);

  for (let iter = 0; iter < 10; iter++) {
    for (let i = 0; i < data.length; i += 4) {
      const pi = i / 4;
      if (data[i + 3] < 128) { assignments[pi] = -1; continue; }
      let minD = Infinity, best = 0;
      centers.forEach(([cr, cg, cb], ci) => {
        const d = (data[i] - cr) ** 2 + (data[i + 1] - cg) ** 2 + (data[i + 2] - cb) ** 2;
        if (d < minD) { minD = d; best = ci; }
      });
      assignments[pi] = best;
    }
    const sums = centers.map(() => [0, 0, 0, 0] as [number, number, number, number]);
    for (let i = 0; i < data.length; i += 4) {
      const ci = assignments[i / 4]; 
      if (ci < 0) continue;
      sums[ci][0] += data[i]; sums[ci][1] += data[i + 1]; sums[ci][2] += data[i + 2]; sums[ci][3]++;
    }
    centers = sums.map(([r, g, b, n]) => n > 0 ? [r / n, g / n, b / n] as [number, number, number] : [128, 128, 128]);
  }

  return centers.map((c, ci) => {
    const mask = new Uint8Array(total); 
    let count = 0;
    for (let i = 0; i < total; i++) {
      if (assignments[i] === ci) { mask[i] = 1; count++; }
    }
    const [r, g, b] = c.map(Math.round);
    return {
      color: `#${[r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')}`,
      mask,
      pixelCount: count
    };
  }).filter(c => c.pixelCount > 100);
}

export function getLuminance(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
