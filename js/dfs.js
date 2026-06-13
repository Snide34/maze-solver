/**
 * dfs.js — Depth-First Search Algorithm
 * 
 * Explores cells depth-first using a LIFO stack.
 * Does NOT guarantee shortest path.
 * 
 * Feature: maze-solver-visualizer
 */

/**
 * Execute DFS from start to end on the grid.
 * 
 * @param {Array<Array<{r, c, state}>>} gridState - 2D array of Cell objects
 * @param {{r: number, c: number}} start - Starting position
 * @param {{r: number, c: number}} end - Target position
 * @returns {{visited: Array, path: Array, visitedNodes: number, pathLength: number, executionTime: number}}
 */
export function dfs(gridState, start, end) {
  const t0 = performance.now();
  
  const rows = gridState.length;
  const cols = gridState[0].length;
  
  const stack = [start];
  const parent = new Map();
  const explored = new Set();
  const visited = [];
  
  const cellKey = (r, c) => `${r},${c}`;
  parent.set(cellKey(start.r, start.c), null);
  
  // Neighbor directions: up, right, down, left (reversed for stack)
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  while (stack.length > 0) {
    const curr = stack.pop();
    const currKey = cellKey(curr.r, curr.c);
    
    // Skip if already explored
    if (explored.has(currKey)) continue;
    
    explored.add(currKey);
    
    // Add to visited array (exclude start and end)
    if (!(curr.r === start.r && curr.c === start.c) && !(curr.r === end.r && curr.c === end.c)) {
      visited.push({ r: curr.r, c: curr.c });
    }
    
    // Check if we reached the end
    if (curr.r === end.r && curr.c === end.c) {
      break;
    }
    
    // Explore neighbors (reversed so top of stack processes up first)
    for (let i = directions.length - 1; i >= 0; i--) {
      const [dr, dc] = directions[i];
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      
      // Skip out-of-bounds
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      
      const cell = gridState[nr][nc];
      const key = cellKey(nr, nc);
      
      // Skip walls and already explored cells
      if (cell.state === 'wall' || explored.has(key) || parent.has(key)) continue;
      
      parent.set(key, curr);
      stack.push({ r: nr, c: nc });
    }
  }
  
  // Reconstruct path
  const path = [];
  if (parent.has(cellKey(end.r, end.c))) {
    let curr = end;
    while (curr) {
      const key = cellKey(curr.r, curr.c);
      const parentCell = parent.get(key);
      
      // Add to path (exclude start and end)
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
    visitedNodes: visited.length + 1,
    pathLength: path.length > 0 ? path.length + 2 : 0,
    executionTime: Math.round(executionTime * 100) / 100
  };
}
