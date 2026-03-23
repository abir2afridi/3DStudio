/**
 * A robust contour tracer (Moore neighborhood tracing) specialized for extracting ordered
 * boundary paths from a binary mask, suitable for THREE.Shape geometry creation.
 */
export function marchingSquares(mask: Uint8Array, w: number, h: number): {x:number, y:number}[][] {
  const visited = new Uint8Array(w * h);
  const contours: {x:number, y:number}[][] = [];
  
  // Directions: 0=E, 1=SE, 2=S, 3=SW, 4=W, 5=NW, 6=N, 7=NE
  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];
  
  const getP = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0;
    return mask[y * w + x];
  };

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      // Find a starting point of an unvisited boundary
      if (mask[idx] === 1 && getP(x - 1, y) === 0 && !visited[idx]) {
        const contour: {x:number, y:number}[] = [];
        let cx = x, cy = y;
        let dir = 7; // Start looking North-East
        
        let iters = 0; // Prevent infinite loops in edge cases
        const maxIters = w * h;

        while (iters++ < maxIters) {
          contour.push({ x: cx, y: cy });
          visited[cy * w + cx] = 1;
          
          let found = false;
          let searchDir = (dir + 6) % 8; // Look counter-clockwise
          
          for (let i = 0; i < 8; i++) {
            const nx = cx + dx[searchDir];
            const ny = cy + dy[searchDir];
            
            if (getP(nx, ny) === 1) {
              cx = nx;
              cy = ny;
              dir = searchDir;
              found = true;
              break;
            }
            searchDir = (searchDir + 1) % 8; // Move clockwise
          }
          
          if (!found || (cx === x && cy === y)) {
            break; // Back to start or isolated point
          }
        }
        
        if (contour.length >= 3) {
          contours.push(contour);
        }
      }
    }
  }
  
  return contours;
}
