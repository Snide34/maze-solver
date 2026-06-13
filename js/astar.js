// A* algorithm

// Simple binary min-heap for open set
class MinHeap {
  constructor() {
    this.heap = [];
  }
  
  insert(node, priority) {
    this.heap.push({ node, priority });
    this.bubbleUp(this.heap.length - 1);
  }
  
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop().node;
    
    const min = this.heap[0].node;
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return min;
  }
  
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }
  
  bubbleDown(index) {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      
      if (leftChild < this.heap.length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }
      
      if (smallest === index) break;
      
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
  
  isEmpty() {
    return this.heap.length === 0;
  }
}

/**
 * Manhattan distance heuristic.
 */
function heuristic(cell, end) {
  return Math.abs(cell.r - end.r) + Math.abs(cell.c - end.c);
}

/**
 * Execute A* from start to end on the grid.
 * 
 * @param {Array<Array<{r, c, state}>>} gridState - 2D array of Cell objects
 * @param {{r: number, c: number}} start - Starting position
 * @param {{r: number, c: number}} end - Target position
 * @returns {{visited: Array, path: Array, visitedNodes: number, pathLength: number, executionTime: number}}
 */
export function astar(gridState, start, end) {
  const t0 = performance.now();
  
  const rows = gridState.length;
  const cols = gridState[0].length;
  
  const openSet = new MinHeap();
  const gScore = new Map();
  const parent = new Map();
  const closed = new Set();
  const visited = [];
  
  const cellKey = (r, c) => `${r},${c}`;
  
  gScore.set(cellKey(start.r, start.c), 0);
  parent.set(cellKey(start.r, start.c), null);
  openSet.insert(start, heuristic(start, end));
  
  // Neighbor directions: up, right, down, left
  const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
  
  while (!openSet.isEmpty()) {
    const curr = openSet.extractMin();
    const currKey = cellKey(curr.r, curr.c);
    
    // Skip if already closed (lazy deletion)
    if (closed.has(currKey)) continue;
    
    closed.add(currKey);
    
    // Add to visited array (exclude start and end)
    if (!(curr.r === start.r && curr.c === start.c) && !(curr.r === end.r && curr.c === end.c)) {
      visited.push({ r: curr.r, c: curr.c });
    }
    
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
      
      // Skip walls and closed cells
      if (cell.state === 'wall' || closed.has(key)) continue;
      
      const tentativeG = gScore.get(currKey) + 1;
      
      if (!gScore.has(key) || tentativeG < gScore.get(key)) {
        gScore.set(key, tentativeG);
        const f = tentativeG + heuristic({ r: nr, c: nc }, end);
        parent.set(key, curr);
        openSet.insert({ r: nr, c: nc }, f);
      }
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
