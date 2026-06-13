/**
 * mazeGenerator.js — Random Maze with Path Guarantee
 * 
 * Generates random walls (~30% density) with guaranteed solvability.
 * Uses BFS flood-fill repair loop to ensure path exists.
 * 
 * Feature: maze-solver-visualizer
 */

/**
 * BFS flood-fill to check reachability from start to end.
 */
function isReachable(rows, cols, walls, start, end) {
  const queue = [start];
  const visited = new Set();
  visited.add(`${start.r},${start.c}`);
  
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  while (queue.length > 0) {
    const curr = queue.shift();
    
    if (curr.r === end.r && curr.c === end.c) {
      return true;
    }
    
    for (const [dr, dc] of directions) {
      const nr = curr.r + dr;
      const nc = curr.c + dc;
      const key = `${nr},${nc}`;
      
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (walls.has(key) || visited.has(key)) continue;
      
      visited.add(key);
      queue.push({ r: nr, c: nc });
    }
  }
  
  return false;
}

/**
 * Generate a random maze with guaranteed path from start to end.
 * 
 * @param {number} rows - Grid height
 * @param {number} cols - Grid width
 * @param {{r: number, c: number} | null} startPos - Starting position (defaults to [0,0])
 * @param {{r: number, c: number} | null} endPos - Target position (defaults to [rows-1,cols-1])
 * @returns {{walls: Set<string>, startPos: {r, c}, endPos: {r, c}}}
 */
export function generateMaze(rows, cols, startPos, endPos) {
  // Set defaults if not provided
  const start = startPos || { r: 0, c: 0 };
  const end = endPos || { r: rows - 1, c: cols - 1 };
  
  const totalCells = rows * cols;
  const targetWalls = Math.floor(totalCells * 0.30);
  
  const walls = new Set();
  const startKey = `${start.r},${start.c}`;
  const endKey = `${end.r},${end.c}`;
  
  // Randomly place ~30% walls (exclude start/end)
  const allCells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (key !== startKey && key !== endKey) {
        allCells.push(key);
      }
    }
  }
  
  // Shuffle and pick first targetWalls cells
  for (let i = allCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
  }
  
  for (let i = 0; i < Math.min(targetWalls, allCells.length); i++) {
    walls.add(allCells[i]);
  }
  
  // Repair loop: remove walls until path exists
  while (!isReachable(rows, cols, walls, start, end)) {
    // Pick a random wall to remove
    const wallArray = Array.from(walls);
    if (wallArray.length === 0) break;  // Safety: no walls left
    
    const randomIndex = Math.floor(Math.random() * wallArray.length);
    walls.delete(wallArray[randomIndex]);
  }
  
  return {
    walls,
    startPos: start,
    endPos: end
  };
}
