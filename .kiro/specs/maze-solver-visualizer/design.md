# Design Document: Maze Solver Visualizer

## Overview

The Maze Solver Visualizer is a single-page browser application built entirely with plain HTML, CSS, and JavaScript — no build tools, no frameworks, no transpilation. The user draws a maze on an interactive grid, picks a pathfinding algorithm (BFS, DFS, or A*), and watches it animate cell-by-cell. A statistics panel surfaces visited-node count, path length, and elapsed time after each run. A random maze generator and dark/light theme toggle round out the feature set.

The architecture follows a strict module pattern using ES modules (`type="module"` script tags). Each module owns a single responsibility and communicates through a thin event/callback API rather than global state. All modules share one canonical `gridState` array that lives in the central `Visualizer` module.

---

## Architecture

```
index.html
├── styles/
│   └── main.css            # All styles including CSS custom properties for themes
└── js/
    ├── main.js             # Entry point — wires modules together, registers event listeners
    ├── visualizer.js       # Orchestrator: owns gridState, drives animation lifecycle
    ├── grid.js             # Grid rendering, cell DOM management, interaction handlers
    ├── animator.js         # setTimeout-based animation loop
    ├── bfs.js              # BFS algorithm — returns { visited[], path[] }
    ├── dfs.js              # DFS algorithm — returns { visited[], path[] }
    ├── astar.js            # A* algorithm — returns { visited[], path[] }
    ├── mazeGenerator.js    # Random wall placement with path-guarantee via flood-fill
    └── statisticsPanel.js  # Reads/writes the statistics DOM elements
```

### Module Dependency Graph

```
main.js
  └── visualizer.js
        ├── grid.js
        ├── animator.js
        ├── bfs.js
        ├── dfs.js
        ├── astar.js
        ├── mazeGenerator.js
        └── statisticsPanel.js
```

`main.js` is the only module that imports `visualizer.js`. All other modules are imported exclusively by `visualizer.js`. This keeps the dependency graph shallow and prevents circular imports.

---

## File Structure

```
maze-solver-visualizer/
├── index.html
├── styles/
│   └── main.css
└── js/
    ├── main.js
    ├── visualizer.js
    ├── grid.js
    ├── animator.js
    ├── bfs.js
    ├── dfs.js
    ├── astar.js
    ├── mazeGenerator.js
    └── statisticsPanel.js
```

`index.html` contains the static scaffold: a toolbar with algorithm selector, speed slider, Generate/Reset/Clear buttons, the `#grid-container` div, and the statistics panel. No JavaScript logic lives in HTML.

---

## Components and Interfaces

### `visualizer.js` — Orchestrator

**State owned:**
```js
let gridState   // Cell[][]  — 2-D array of Cell objects
let rows        // number
let cols        // number
let startPos    // { r, c } | null
let endPos      // { r, c } | null
let isRunning   // boolean — true while Animator is active
```

**Public API:**
```js
export function initVisualizer(rows, cols)
export function runAlgorithm(name)   // 'bfs' | 'dfs' | 'astar'
export function generateMaze()
export function resetGrid()
export function clearPath()
export function setAnimationSpeed(ms)
```

`visualizer.js` calls each algorithm with `(gridState, startPos, endPos)` and receives `{ visited, path, visitedNodes, pathLength, executionTime }` back. It then hands the result to `animator.js` and `statisticsPanel.js`.

---

### `grid.js` — DOM Grid

**Responsibility:** Create/destroy cell elements, map DOM events to grid coordinates, apply CSS classes based on `Cell_State`.

**Public API:**
```js
export function renderGrid(container, rows, cols, onCellLeft, onCellRight, onCellMiddle)
export function applyCellState(r, c, state)   // sets data-state attribute + CSS class
export function setInteractionEnabled(enabled)
export function getCellElement(r, c)
```

Each cell `<div>` carries:
- `data-row` and `data-col` attributes
- A single `data-state` attribute (value = one of the Cell_State strings)
- CSS class derived from `data-state` for styling

Mouse events bubble to the grid container; a single delegated listener extracts `data-row`/`data-col` from `event.target` and calls the appropriate callback.

---

### `animator.js` — Animation Loop

**Responsibility:** Accept two arrays (`visited` cells, `path` cells) and animate them sequentially using `setTimeout`. Notifies the caller via a completion callback when done.

**Public API:**
```js
export function animate(visited, path, applyState, speedMs, onComplete)
```

**Algorithm:**
```
steps = [...visited.map(c => [c, 'visited']), ...path.map(c => [c, 'path'])]
for i in 0..steps.length-1:
    setTimeout(() => {
        applyState(steps[i].r, steps[i].c, steps[i].state)
        if i === steps.length-1: onComplete()
    }, i * speedMs)
```

The `applyState` callback is `grid.applyCellState` — keeping `animator.js` decoupled from the DOM. Start and End cells are excluded from both arrays by the algorithm modules before being passed in.

---

### `bfs.js` — Breadth-First Search

**Signature:**
```js
export function bfs(gridState, start, end)
// returns { visited: Cell[], path: Cell[], visitedNodes: number, pathLength: number, executionTime: number }
// path is [] when no route exists
```

**Algorithm sketch:**
```
queue = [start]
parent = Map()
parent.set(cellKey(start), null)
t0 = performance.now()

while queue not empty:
    curr = queue.shift()
    if curr === end: break
    for neighbor of getNeighbors(curr, 'up','right','down','left'):
        if not wall and not in parent:
            parent.set(cellKey(neighbor), curr)
            visited.push(neighbor)
            queue.push(neighbor)

path = reconstructPath(parent, start, end)
executionTime = performance.now() - t0
```

Returns `path = []` (empty) when `end` was never reached, letting the Visualizer display "No path found."

---

### `dfs.js` — Depth-First Search

**Signature:**
```js
export function dfs(gridState, start, end)
// returns same shape as bfs()
```

Iterative DFS using an explicit stack to avoid call-stack overflow on large grids.

**Algorithm sketch:**
```
stack = [start]
parent = Map()
parent.set(cellKey(start), null)
t0 = performance.now()

while stack not empty:
    curr = stack.pop()
    if curr === end: break
    if curr already fully explored: continue
    mark curr explored
    visited.push(curr)
    for neighbor of getNeighbors(curr, 'up','right','down','left') reversed:
        if not wall and not visited:
            parent.set(cellKey(neighbor), curr)
            stack.push(neighbor)

path = reconstructPath(parent, start, end)
executionTime = performance.now() - t0
```

---

### `astar.js` — A* Search

**Signature:**
```js
export function astar(gridState, start, end)
// returns same shape as bfs()
```

**Heuristic:** Manhattan distance — `h(cell) = |cell.r - end.r| + |cell.c - end.c|`

**Algorithm sketch:**
```
openSet = MinHeap keyed on f = g + h
gScore = Map(); gScore[start] = 0
parent = Map(); parent[start] = null
t0 = performance.now()

while openSet not empty:
    curr = openSet.extractMin()
    if curr === end: break
    visited.push(curr)
    for neighbor of getNeighbors(curr):
        if wall: skip
        tentativeG = gScore[curr] + 1
        if tentativeG < gScore[neighbor] (or not set):
            gScore[neighbor] = tentativeG
            f = tentativeG + h(neighbor)
            parent[neighbor] = curr
            openSet.insertOrUpdate(neighbor, f)

path = reconstructPath(parent, start, end)
executionTime = performance.now() - t0
```

A simple binary min-heap is used for the open set. Since all edge weights are 1, A* with Manhattan distance is admissible and consistent, guaranteeing the shortest path.

---

### `mazeGenerator.js` — Random Maze with Path Guarantee

**Signature:**
```js
export function generateMaze(rows, cols, startPos, endPos)
// returns { walls: Set<string>, startPos, endPos }
// wallKey = `${r},${c}`
```

**Algorithm:**

1. Place Start at `[0, 0]` and End at `[rows-1, cols-1]` if not already set.
2. Randomly mark ~30% of all cells as walls (excluding start and end).
3. Run a flood-fill (BFS) from start to verify end is reachable.
4. While end is not reachable:
   - Pick a random wall cell that is not start or end.
   - Remove it (make it empty).
   - Re-run flood-fill.
5. Return the final wall set and confirmed start/end positions.

This simple repair loop converges quickly because at 30% wall density the grid is well below the percolation threshold for a 2-D lattice (~59% for random site percolation). In practice, step 4 rarely needs more than a handful of iterations.

If a previously set start or end position was overwritten by a wall in step 2, the algorithm scans outward (BFS from the original position) to find the nearest empty cell and relocates the marker there.

---

### `statisticsPanel.js` — Statistics Display

**Signature:**
```js
export function updateStats({ algorithm, visitedNodes, pathLength, executionTime })
export function resetStats()
```

Directly reads/writes the four DOM elements (`#stat-algorithm`, `#stat-visited`, `#stat-path`, `#stat-time`). No state is stored in this module — it is purely a view.

---

## Data Models

### `Cell` Object

Each element of `gridState` is a plain object:

```js
{
  r: number,          // row index (0-based)
  c: number,          // column index (0-based)
  state: CellState,   // one of the strings below
}
```

### `CellState` Enum (string constants)

```js
const CellState = {
  EMPTY:   'empty',    // white
  WALL:    'wall',     // black / dark
  START:   'start',    // green
  END:     'end',      // red
  VISITED: 'visited',  // blue
  PATH:    'path',     // yellow
}
```

### `gridState` — 2-D Array

```js
// Access pattern:
const cell = gridState[r][c]

// Initialization:
gridState = Array.from({ length: rows }, (_, r) =>
  Array.from({ length: cols }, (_, c) => ({ r, c, state: CellState.EMPTY }))
)
```

The `gridState` array is always rebuilt from scratch on `initVisualizer` and `resetGrid` calls. Algorithms receive a read-only view and never mutate `gridState` directly — they return the `visited` and `path` arrays, and the Visualizer writes back state changes through `grid.applyCellState`.

### Algorithm Result Shape

```js
{
  visited:       Cell[],   // cells examined, in traversal order (excludes start/end)
  path:          Cell[],   // cells on the solution path from start to end (excludes start/end)
  visitedNodes:  number,   // length of visited (including start in the count for statistics)
  pathLength:    number,   // length of path + 2 (including start and end) or 0 if none
  executionTime: number,   // milliseconds (via performance.now())
}
```

---

## Key Algorithms

### BFS — Shortest Path Guarantee

BFS explores cells level by level using a FIFO queue. Because every step has cost 1, the first time BFS reaches the End_Cell it has found the shortest path. Parent pointers stored in a `Map` (keyed by `"r,c"` string) enable path reconstruction in O(path length) time.

Neighbor order is fixed as **up, right, down, left** (i.e., `[r-1,c]`, `[r,c+1]`, `[r+1,c]`, `[r,c-1]`). Cells outside grid bounds and Wall cells are skipped.

Time complexity: O(rows × cols). Space complexity: O(rows × cols).

### DFS — Exploratory Traversal

Iterative DFS uses a LIFO stack. It does **not** guarantee the shortest path. The neighbor order is reversed on push so the top of the stack always processes up first (matching the logical exploration order). Parent pointers allow path reconstruction once the end is found.

Time complexity: O(rows × cols). Space complexity: O(rows × cols).

### A* — Heuristic-Guided Shortest Path

A* maintains an open set ordered by `f = g + h`, where:
- `g(n)` = exact cost from start to `n` (number of steps, since all edges have weight 1)
- `h(n)` = Manhattan distance from `n` to end = `|n.r - end.r| + |n.c - end.c|`

Manhattan distance is **admissible** (never overestimates) and **consistent** on a grid with uniform costs, so A* returns the shortest path. On open grids A* visits fewer cells than BFS because the heuristic guides it toward the end. On maze-like grids the difference is smaller.

The open set is a binary min-heap; the standard decrease-key operation is approximated by lazy deletion (mark cells as closed when popped, ignore stale entries).

### Maze Generation — Random Walls with Flood-Fill Repair

1. Initialize all cells as empty.
2. Randomly select ⌊0.30 × rows × cols⌋ cells (excluding start/end) and mark them as walls.
3. BFS from start; if end is reachable, generation is complete.
4. Otherwise, randomly remove walls one at a time until reachable.

The repair loop terminates because in the worst case all walls are removed, leaving a fully open grid which is always solvable.

---

## Animation Loop

The `animator.js` module schedules all state updates before any of them fire. This avoids accumulating nested `setTimeout` calls and makes the total animation time predictable.

```js
function animate(visited, path, applyState, speedMs, onComplete) {
  const steps = [
    ...visited.map(cell => ({ cell, state: 'visited' })),
    ...path.map(cell   => ({ cell, state: 'path'    })),
  ]
  steps.forEach(({ cell, state }, i) => {
    setTimeout(() => {
      applyState(cell.r, cell.c, state)
      if (i === steps.length - 1) onComplete()
    }, i * speedMs)
  })
}
```

**Why not `requestAnimationFrame`?** `setTimeout` with a configurable delay is simpler to implement, easier to reason about for learners, and the speed range (10–200 ms per step) is well outside the 16 ms frame budget where `rAF` would be beneficial.

**Cancellation:** The Visualizer stores the highest timeout ID returned before animation starts and calls `clearTimeout` on all IDs up to that value when the user resets mid-animation. This is the simplest reliable cancel strategy without adding a dedicated scheduler.

---

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Toolbar                                            │
│  [Algorithm: BFS ▾] [Speed: ──●──] [Run] [Generate]│
│  [Reset]  [Clear Path]  [🌙 Dark Mode]              │
├─────────────────────────────────────────────────────┤
│                                                     │
│   Grid (CSS Grid, fills remaining viewport width)   │
│   Left-click: wall toggle                           │
│   Right-click: place/move start                     │
│   Middle-click: place/move end                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Statistics Panel                                   │
│  Algorithm: BFS   Visited: 143   Path: 37   Time: 4ms│
└─────────────────────────────────────────────────────┘
```

**CSS Grid for the maze:** The `#grid-container` uses `display: grid; grid-template-columns: repeat(var(--cols), 1fr)`. Cell size adapts to the container width automatically. A `--cols` CSS custom property is updated by `grid.js` when dimensions change.

**Toolbar controls:**
- `<select id="algorithm-select">` — options: BFS, DFS, A*
- `<input type="range" id="speed-slider" min="10" max="200" value="30">`
- `<button id="btn-run">Run</button>`
- `<button id="btn-generate">Generate Maze</button>`
- `<button id="btn-reset">Reset</button>`
- `<button id="btn-clear-path">Clear Path</button>`
- `<button id="btn-theme">🌙</button>`
- `<select id="grid-size-select">` — options: 10×10, 20×20, 30×30

---

## Theme and localStorage (Dark Mode)

Themes are implemented with CSS custom properties on the `:root` element. Switching themes adds or removes a `data-theme="dark"` attribute on `<html>`.

```css
:root {
  --bg: #ffffff;
  --cell-empty: #f0f0f0;
  --cell-wall: #1a1a2e;
  --cell-start: #27ae60;
  --cell-end: #e74c3c;
  --cell-visited: #3498db;
  --cell-path: #f1c40f;
  --toolbar-bg: #f8f8f8;
  --text: #333333;
}

[data-theme="dark"] {
  --bg: #1a1a2e;
  --cell-empty: #16213e;
  --cell-wall: #0f3460;
  --toolbar-bg: #16213e;
  --text: #e0e0e0;
  /* visited/path/start/end colors stay the same — they are semantic */
}
```

**Persistence:**
```js
// On toggle:
const next = current === 'dark' ? 'light' : 'dark'
document.documentElement.dataset.theme = next
localStorage.setItem('theme', next)

// On page load (in main.js, before first render):
const saved = localStorage.getItem('theme') ?? 'light'
document.documentElement.dataset.theme = saved
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: All cells are empty after initialization

*For any* supported grid dimensions (10×10, 20×20, or 30×30), every cell in the grid immediately after initialization SHALL have the `empty` state.

**Validates: Requirements 1.2, 1.4**

---

### Property 2: Wall toggle is a round trip

*For any* cell in the grid that begins as `empty`, left-clicking it once transitions it to `wall`; left-clicking it again returns it to `empty`. The cell's state after two clicks SHALL equal its state before any clicks.

**Validates: Requirements 2.1, 2.2**

---

### Property 3: At most one start and one end cell at all times

*For any* sequence of right-click and middle-click interactions on any cells in the grid, the total count of cells in the `start` state SHALL never exceed 1, and the total count of cells in the `end` state SHALL never exceed 1.

**Validates: Requirements 2.4, 2.6, 2.7**

---

### Property 4: Start and end markers are preserved by interaction constraints

*For any* cell currently in the `start` or `end` state, a left-click on that cell SHALL leave its state unchanged.

**Validates: Requirements 2.8**

---

### Property 5: BFS never visits wall cells

*For any* grid configuration containing wall cells, no wall cell SHALL appear in the `visited` array returned by the BFS module.

**Validates: Requirements 3.3**

---

### Property 6: BFS finds the shortest path

*For any* solvable grid (where a path from start to end exists), the path returned by BFS SHALL have the minimum possible length among all valid paths from start to end.

**Validates: Requirements 3.4**

---

### Property 7: DFS never visits wall cells

*For any* grid configuration containing wall cells, no wall cell SHALL appear in the `visited` array returned by the DFS module.

**Validates: Requirements 4.3**

---

### Property 8: A* path length equals BFS path length (shortest-path guarantee)

*For any* solvable grid with uniform edge weights, the `pathLength` returned by the A* module SHALL equal the `pathLength` returned by the BFS module.

**Validates: Requirements 10.3**

---

### Property 9: Animation preserves start and end cell states

*For any* animation run (visited + path steps), the cells at the `start` and `end` positions SHALL retain their `start` and `end` states respectively after all animation steps have been applied.

**Validates: Requirements 5.3**

---

### Property 10: Animation sequencing — visited before path

*For any* animation run where both visited cells and path cells are non-empty, all `visited`-state updates SHALL be scheduled before any `path`-state updates (i.e., visited cells animate first, path cells animate second).

**Validates: Requirements 5.1, 5.2**

---

### Property 11: Statistics accurately reflect algorithm output

*For any* completed algorithm run, the values displayed in the Statistics_Panel (visitedNodes, pathLength, executionTime) SHALL match the corresponding fields in the result object returned by the algorithm module.

**Validates: Requirements 6.2, 6.3, 6.4, 6.5**

---

### Property 12: Reset produces an all-empty grid

*For any* grid state (containing any combination of wall, start, end, visited, and path cells), invoking `resetGrid` SHALL produce a grid where every cell has the `empty` state and no start or end positions are recorded.

**Validates: Requirements 8.1, 8.2**

---

### Property 13: Clear-path preserves walls, start, and end

*For any* grid state, invoking `clearPath` SHALL leave all `wall`, `start`, and `end` cells unchanged, while setting all `visited` and `path` cells to `empty`.

**Validates: Requirements 8.3**

---

### Property 14: Generated maze is always solvable

*For any* invocation of `generateMaze` (with any grid dimensions and any preset start/end positions), the resulting grid SHALL contain at least one valid path from the Start_Cell to the End_Cell, as verified by BFS returning a non-empty path.

**Validates: Requirements 7.3**

---

### Property 15: Generated maze wall density is approximately 30%

*For any* invocation of `generateMaze`, the ratio of wall cells to total cells in the resulting grid SHALL be within the range [0.20, 0.40] (targeting ~30% with tolerance for the path-guarantee repair).

**Validates: Requirements 7.1**

---

### Property 16: Theme preference round-trip via localStorage

*For any* theme value (`'light'` or `'dark'`), writing that value to `localStorage` and then reading it back SHALL return the same value, and applying that value SHALL set the correct `data-theme` attribute on the root element.

**Validates: Requirements 9.3**

---

## Error Handling

### No Start or End Cell Set

Before invoking any algorithm, `visualizer.js` checks that both `startPos` and `endPos` are non-null. If either is missing, the Run button is disabled and a tooltip reads "Place a start and end cell first."

### No Path Found

When an algorithm returns an empty `path` array, the Visualizer:
1. Still animates the visited cells (so the user sees the failed search).
2. Displays a `"No path found"` message in a non-modal status bar below the grid.
3. Sets `Path_Length` to 0 in the Statistics Panel.
4. Does **not** animate any path cells.

### Mid-Animation Reset

If the user clicks Reset while an animation is running:
1. `visualizer.js` calls `cancelAnimation()` which clears all pending timeouts.
2. `resetGrid()` is called immediately, restoring all cells to `empty`.
3. `isRunning` is set to `false` and controls are re-enabled.

### Grid Size Change During Animation

The grid-size selector is disabled while `isRunning` is true, preventing resize mid-animation. It re-enables in the `onComplete` callback.

### Right-Click Context Menu

`grid.js` calls `event.preventDefault()` on all `contextmenu` events originating from the grid container, suppressing the browser's native right-click menu.

---

## Testing Strategy

### Unit Tests (example-based)

Test framework: **Vitest** (or Jest — both work with vanilla JS modules). No DOM required for algorithm tests; use `jsdom` for grid/animator tests.

Focus areas:
- BFS, DFS, A* with simple known grids (e.g., 3×3 with known shortest path)
- `mazeGenerator` — verify start/end placement on empty grids
- `statisticsPanel` — verify DOM field updates
- `grid` — verify `data-state` attribute changes and event delegation

### Property-Based Tests

Framework: **fast-check** (TypeScript-compatible, works with plain JS via `import`).

Each property test runs a minimum of **100 iterations** with generated inputs.

| Property | Generator | Assertion |
|---|---|---|
| P1 — All cells empty after init | Random dims from {10,20,30} | Every cell.state === 'empty' |
| P2 — Wall toggle round trip | Random grid + random cell index | state after 2 clicks equals initial |
| P3 — At most one start/end | Random sequence of right/middle clicks | count(start) ≤ 1 AND count(end) ≤ 1 |
| P4 — Start/end preserved on click | Random cell with start/end state | state unchanged after left-click |
| P5 — BFS skips walls | Random grid with random walls | visited ∩ walls = ∅ |
| P6 — BFS shortest path | Random solvable grid | BFS length = min path length |
| P7 — DFS skips walls | Same as P5 | visited ∩ walls = ∅ |
| P8 — A* = BFS length | Random solvable grid | A* pathLength = BFS pathLength |
| P9 — Animation preserves start/end | Random visit/path arrays | start/end states unchanged after animate |
| P10 — Visited before path | Random arrays | All visited updates precede path updates |
| P11 — Stats match result | Random algorithm results | Panel values === result fields |
| P12 — Reset all-empty | Random grid state | All cells empty, startPos/endPos null |
| P13 — Clear-path selective | Random grid state | walls/start/end counts unchanged |
| P14 — Maze always solvable | Random dims and start/end | BFS(generated maze) returns path |
| P15 — Maze wall density ~30% | Random dims | wallCount / total ∈ [0.20, 0.40] |
| P16 — Theme localStorage round trip | Random theme choice | Read back = written value |

Tag format for each property test:
```js
// Feature: maze-solver-visualizer, Property N: <property title>
```

### Integration / Smoke Tests

- Verify default `Animation_Speed` constant is `30`.
- Verify `#grid-container` has 400 cells on load (20×20 default).
- Verify theme toggle changes `document.documentElement.dataset.theme`.
- Verify A* option present in `#algorithm-select`.

### Testing Balance

Unit tests cover concrete examples and error conditions. Property tests cover universal correctness (the table above). Avoid duplicating coverage: if a property test already exercises a behavior exhaustively, no separate unit test is needed for the same path.
