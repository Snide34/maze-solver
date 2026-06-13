# Tasks

## Task 1: HTML scaffold + base structure
Create `index.html` with toolbar (algorithm select, speed slider, Run/Generate/Reset/Clear buttons, theme toggle, grid-size select), `#grid-container` div, stats panel. Link CSS + JS modules as ES6 imports.

**Depends on:** None

## Task 2: CSS styling with theme support
Create `styles/main.css` with CSS custom properties for light/dark themes, grid layout, cell states (empty/wall/start/end/visited/path colors), toolbar, stats panel. Implement `[data-theme="dark"]` overrides.

**Depends on:** Task 1

## Task 3: Grid module - rendering + interaction
Implement `js/grid.js`: `renderGrid()`, `applyCellState()`, `setInteractionEnabled()`. Event delegation for left/right/middle clicks. Prevent context menu. Cell divs have `data-row`, `data-col`, `data-state` attributes.

**Depends on:** Task 2

## Task 4: Visualizer module - state orchestrator
Implement `js/visualizer.js`: owns `gridState` 2D array, `startPos`, `endPos`, `isRunning`. Export `initVisualizer()`, `runAlgorithm()`, `generateMaze()`, `resetGrid()`, `clearPath()`, `setAnimationSpeed()`. Initialize 20×20 grid on load.

**Depends on:** Task 3

## Task 5: Animator module - setTimeout loop
Implement `js/animator.js`: `animate(visited, path, applyState, speedMs, onComplete)`. Schedule all state updates upfront at `i * speedMs` offsets. Store timeout IDs for cancellation.

**Depends on:** Task 4

## Task 6: BFS algorithm module
Implement `js/bfs.js`: `bfs(gridState, start, end)` returns `{ visited, path, visitedNodes, pathLength, executionTime }`. FIFO queue, parent map, neighbor order up/right/down/left. Skip walls. Path reconstruction via parent pointers.

**Depends on:** Task 4

## Task 7: DFS algorithm module
Implement `js/dfs.js`: `dfs(gridState, start, end)` same signature as BFS. Iterative LIFO stack. Reverse neighbor order on push. No shortest-path guarantee.

**Depends on:** Task 4

## Task 8: A* algorithm module
Implement `js/astar.js`: `astar(gridState, start, end)` same signature. Binary min-heap open set keyed on `f = g + h`. Manhattan distance heuristic. Lazy deletion for stale entries.

**Depends on:** Task 4

## Task 9: Maze generator module
Implement `js/mazeGenerator.js`: `generateMaze(rows, cols, startPos, endPos)` returns `{ walls, startPos, endPos }`. Random 30% walls, BFS flood-fill to verify reachability, repair loop removes walls until path exists. Default start=[0,0], end=[rows-1,cols-1].

**Depends on:** Task 4

## Task 10: Statistics panel module
Implement `js/statisticsPanel.js`: `updateStats({ algorithm, visitedNodes, pathLength, executionTime })`, `resetStats()`. Direct DOM reads/writes to `#stat-algorithm`, `#stat-visited`, `#stat-path`, `#stat-time`.

**Depends on:** Task 4

## Task 11: Main entry point - wire modules
Implement `js/main.js`: import visualizer, restore theme from localStorage, register button listeners (run → `runAlgorithm(selected)`, generate → `generateMaze()`, reset → `resetGrid()`, clear → `clearPath()`, theme toggle, grid-size selector, speed slider). Disable Run when no start/end set.

**Depends on:** Tasks 4, 5, 6, 7, 8, 9, 10

## Task 12: Integration + smoke test
Load in browser. Verify 20×20 grid renders, cells toggle wall on click, right-click sets start, middle-click sets end, Run triggers animation, stats update, Generate creates solvable maze, Reset clears all, theme toggle works, localStorage persists theme.

**Depends on:** Task 11
