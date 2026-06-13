/**
 * bfs.js — Breadth-First Search Algorithm
 * 
 * Explores cells level-by-level using a FIFO queue.
 * Guarantees shortest path when all edge weights are 1.
 * 
 * Feature: maze-solver-visualizer
 */

/**
 * Execute BFS from start to end on the grid.
 * 
 * @param {Array<Array<{r, c, state}>>} gridState - 2D array of Cell objects
 * @param {{r: number, c: number}} start - Starting position
 * @param {{r: number, c: number}} end - Target position
 * @returns {{visited: Array, path: Array, visitedNodes: number, pathLength: number, executionTime: number}}
 */
export function bfs(gridState, start, end) {
  const t0 = performance.now();
  
  const rows = gridState.length;
  const cols = gridState[0].length;
  
  const queue = [start];
  const parent = new Map();
  const visited = [];
  
  const cellKey = (r, c) => `${r},${c}`;
  parent.set(cellKey(start.r, start.c), null);
  
  // Neighbor directions: up, right, down, left
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  while (queue.length > 0) {
    const curr = queue.shift();
    
    // Check if we reached the end
    if (curr.r === end.r && curr.c === end.c) {
      break;
    }
    
    // Explore neighbors
    for (const [dr, dc] of directions) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      
      // Skip out-of-bounds
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      
      const cell = gridState[nr][nc];
      const key = cellKey(nr, nc);
      
      // Skip walls and already visited cells
      if (cell.state === 'wall' || parent.has(key)) continue;
      
      parent.set(key, curr);
      
      // Add to visited array (exclude start and end for animation)
      if (!(nr === start.r && nc === start.c) && !(nr === end.r && nc === end.c)) {
        visited.push({ r: nr, c: nc });
      }
      
      queue.push({ r: nr, c: nc });
    }
  }
  
  // Reconstruct path
  const path = [];
  if (parent.has(cellKey(end.r, end.c))) {
    let curr = end;
    while (curr) {
      const key = cellKey(curr.r, curr.c);
      const parentCell = parent.get(key);
      
      // Add to path (exclude start and end for animation)
      if (!(curr.r === start.r && curr.c === start.c) && !(curr.r === end.r && curr.c === end.c)) {
        path.unshift({ r: curr.r, c: curr.c });
      }
      
      curr = parentCell;
    }
  }
  
  const executionTime = performance.now() - t0;
  
  return {
    visited,
    path,
    visitedNodes: visited.length + 1,  // +1 for start
    pathLength: path.length > 0 ? path.length + 2 : 0,  // +2 for start/end, or 0 if no path
    executionTime: Math.round(executionTime * 100) / 100  // Round to 2 decimals
  };
}
