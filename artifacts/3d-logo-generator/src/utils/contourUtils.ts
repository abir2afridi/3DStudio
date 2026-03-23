// STEP 2: CONTOUR SMOOTHING & SIMPLIFICATION

export function smoothContour(pts: {x:number,y:number}[], iter = 3) {
  for (let i = 0; i < iter; i++) {
    pts = pts.map((_, j, a) => ({
      x: (a[(j - 1 + a.length) % a.length].x + a[j].x * 2 + a[(j + 1) % a.length].x) / 4,
      y: (a[(j - 1 + a.length) % a.length].y + a[j].y * 2 + a[(j + 1) % a.length].y) / 4,
    }));
  }
  return pts;
}

export function simplifyContour(pts: {x:number,y:number}[], tol = 1.5) {
  if (pts.length < 3) return pts;
  function perp(p: any, a: any, b: any) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy);
    return len === 0 ? Math.hypot(p.x - a.x, p.y - a.y) : Math.abs(dx * (a.y - p.y) - (a.x - p.x) * dy) / len;
  }
  function rdp(p: any[], e: number): any[] {
    if (p.length <= 2) return p;
    let maxD = 0, maxI = 0;
    for (let i = 1; i < p.length - 1; i++) {
      const d = perp(p[i], p[0], p[p.length - 1]);
      if (d > maxD) { maxD = d; maxI = i; }
    }
    return maxD > e
      ? [...rdp(p.slice(0, maxI + 1), e).slice(0, -1), ...rdp(p.slice(maxI), e)]
      : [p[0], p[p.length - 1]];
  }
  return rdp(pts, tol);
}

export function processContour(
  raw: {x:number,y:number}[],
  smoothIter = 3,
  rdpTol = 1.5
) {
  return simplifyContour(smoothContour(raw, smoothIter), rdpTol);
}
