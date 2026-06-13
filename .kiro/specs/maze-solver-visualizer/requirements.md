# Requirements Document

## Introduction

A browser-based interactive Maze Solver Visualizer built with HTML, CSS, and JavaScript. Users draw mazes on a grid by clicking cells to place walls, designate start and end points, then watch a chosen pathfinding algorithm (BFS or DFS) animate its traversal step-by-step. A statistics panel reports the algorithm used, number of visited nodes, path length, and execution time. A random maze generator and optional extras (dark/light mode, A* algorithm, adjustable grid size) round out the feature set.

## Glossary

- **Grid**: The rectangular 2-D array of cells rendered as a CSS Grid that forms the maze canvas.
- **Cell**: A single square unit within the Grid. Each Cell has exactly one state at any given time.
- **Cell_State**: One of: `empty` (white), `wall` (black), `start` (green), `end` (red), `visited` (blue), `path` (yellow).
- **Start_Cell**: The unique Cell marked as the algorithm's origin point (green).
- **End_Cell**: The unique Cell marked as the algorithm's destination point (red).
- **Wall_Cell**: A Cell that the pathfinding algorithm treats as impassable.
- **Visited_Cell**: A Cell the algorithm has examined during traversal (blue).
- **Path_Cell**: A Cell that forms part of the final route from Start_Cell to End_Cell (yellow).
- **Visualizer**: The main application module that orchestrates the Grid, algorithms, and animation.
- **Animator**: The sub-module that applies Cell_State changes to the DOM one step at a time using `setTimeout`.
- **BFS**: Breadth-First Search — explores neighbors level-by-level, guaranteeing the shortest path.
- **DFS**: Depth-First Search — explores as far as possible along each branch before backtracking; finds a path but not necessarily the shortest.
- **A_Star**: A* heuristic search algorithm — optional feature that finds the shortest path using a cost + heuristic function.
- **Statistics_Panel**: The UI element that displays Algorithm, Visited_Nodes, Path_Length, and Execution_Time after a run.
- **Maze_Generator**: The module that randomly places Wall_Cells to produce a solvable maze layout.
- **Execution_Time**: The elapsed wall-clock time in milliseconds from algorithm start to completion of path reconstruction.
- **Visited_Nodes**: The count of distinct Cells examined by the algorithm during traversal.
- **Path_Length**: The count of Cells in the reconstructed route from Start_Cell to End_Cell, inclusive.
- **Animation_Speed**: The delay in milliseconds between successive Cell_State updates during animation.

---

## Requirements

### Requirement 1: Grid Rendering and Initialization

**User Story:** As a user, I want to see a grid of cells when the page loads, so that I have a canvas to draw my maze on.

#### Acceptance Criteria

1. THE Visualizer SHALL render a Grid of 20×20 cells by default on page load.
2. THE Visualizer SHALL assign every Cell the `empty` state on initialization.
3. THE Grid SHALL display each Cell as a square with equal width and height, laid out using CSS Grid.
4. WHERE the adjustable grid size feature is enabled, THE Visualizer SHALL re-initialize the Grid with the selected dimensions (10×10, 20×20, or 30×30) and clear all Cell states when the user changes the grid size.

---

### Requirement 2: Cell Interaction — Walls, Start, and End Points

**User Story:** As a user, I want to click cells to place walls and designate start/end points, so that I can design a custom maze.

#### Acceptance Criteria

1. WHEN a user clicks an `empty` Cell, THE Visualizer SHALL toggle that Cell to the `wall` state.
2. WHEN a user clicks a `wall` Cell, THE Visualizer SHALL toggle that Cell back to the `empty` state.
3. WHEN a user right-clicks a Cell and no Start_Cell exists, THE Visualizer SHALL set that Cell as the Start_Cell (green).
4. WHEN a user right-clicks a Cell and a Start_Cell already exists, THE Visualizer SHALL move the Start_Cell designation to the clicked Cell.
5. WHEN a user middle-clicks (or uses a designated secondary interaction) a Cell and no End_Cell exists, THE Visualizer SHALL set that Cell as the End_Cell (red).
6. WHEN a user middle-clicks a Cell and an End_Cell already exists, THE Visualizer SHALL move the End_Cell designation to the clicked Cell.
7. THE Visualizer SHALL ensure that at most one Start_Cell and at most one End_Cell exist in the Grid at any time.
8. IF a user attempts to place a wall on the Start_Cell or End_Cell, THEN THE Visualizer SHALL ignore that interaction and leave the Cell state unchanged.

---

### Requirement 3: BFS Pathfinding

**User Story:** As a user, I want to run BFS on my maze, so that I can find the shortest path between the start and end points.

#### Acceptance Criteria

1. WHEN the user activates the BFS algorithm and both a Start_Cell and End_Cell exist, THE Visualizer SHALL execute Breadth-First Search from the Start_Cell to the End_Cell.
2. THE BFS module SHALL explore neighboring Cells in the order: up, right, down, left.
3. THE BFS module SHALL treat Wall_Cells as impassable and SHALL NOT enqueue them.
4. WHEN BFS reaches the End_Cell, THE BFS module SHALL reconstruct the shortest path by tracing parent pointers from End_Cell back to Start_Cell.
5. WHEN BFS completes, THE Visualizer SHALL record the Visited_Nodes count, Path_Length, and Execution_Time.
6. IF BFS exhausts all reachable Cells without reaching the End_Cell, THEN THE Visualizer SHALL display a "No path found" message and SHALL NOT animate a path.

---

### Requirement 4: DFS Pathfinding

**User Story:** As a user, I want to run DFS on my maze, so that I can see how a depth-first traversal explores the grid.

#### Acceptance Criteria

1. WHEN the user activates the DFS algorithm and both a Start_Cell and End_Cell exist, THE Visualizer SHALL execute Depth-First Search from the Start_Cell to the End_Cell.
2. THE DFS module SHALL explore neighboring Cells in the order: up, right, down, left.
3. THE DFS module SHALL treat Wall_Cells as impassable and SHALL NOT recurse into them.
4. WHEN DFS reaches the End_Cell, THE DFS module SHALL reconstruct the path by tracing parent pointers from End_Cell back to Start_Cell.
5. WHEN DFS completes, THE Visualizer SHALL record the Visited_Nodes count, Path_Length, and Execution_Time.
6. IF DFS exhausts all reachable Cells without reaching the End_Cell, THEN THE Visualizer SHALL display a "No path found" message and SHALL NOT animate a path.

---

### Requirement 5: Step-by-Step Animation

**User Story:** As a user, I want to watch the algorithm animate one cell at a time, so that I can understand how the traversal unfolds.

#### Acceptance Criteria

1. WHEN a pathfinding algorithm is running, THE Animator SHALL update each visited Cell's state to `visited` one Cell at a time, with a delay equal to Animation_Speed between consecutive updates.
2. WHEN all visited Cells have been animated and a path exists, THE Animator SHALL then animate each Path_Cell to the `path` state one Cell at a time, with a delay equal to Animation_Speed between consecutive updates.
3. THE Animator SHALL NOT modify the Start_Cell or End_Cell visual state during animation.
4. THE Visualizer SHALL disable all user interaction with the Grid and algorithm controls while the Animator is running.
5. WHEN the Animator completes all state updates, THE Visualizer SHALL re-enable user interaction.
6. THE Animator SHALL use a default Animation_Speed of 30 milliseconds.

---

### Requirement 6: Statistics Panel

**User Story:** As a user, I want to see statistics after each run, so that I can compare the performance of different algorithms.

#### Acceptance Criteria

1. THE Statistics_Panel SHALL display the following fields: Algorithm, Visited_Nodes, Path_Length, and Execution_Time.
2. WHEN a pathfinding run completes, THE Statistics_Panel SHALL update Algorithm to the name of the algorithm that was run.
3. WHEN a pathfinding run completes, THE Statistics_Panel SHALL update Visited_Nodes to the count of Cells examined during traversal.
4. WHEN a pathfinding run completes, THE Statistics_Panel SHALL update Path_Length to the count of Cells in the reconstructed path, or 0 if no path was found.
5. WHEN a pathfinding run completes, THE Statistics_Panel SHALL update Execution_Time to the elapsed time in milliseconds from algorithm start to path reconstruction completion.
6. WHEN the user resets or clears the Grid, THE Statistics_Panel SHALL reset all displayed values to their default empty/zero state.

---

### Requirement 7: Random Maze Generator

**User Story:** As a user, I want to generate a random maze with one click, so that I can quickly test the algorithms without drawing walls manually.

#### Acceptance Criteria

1. WHEN the user activates the Maze_Generator, THE Maze_Generator SHALL clear the current Grid and randomly assign the `wall` state to approximately 30% of all Cells.
2. THE Maze_Generator SHALL preserve a valid Start_Cell and End_Cell if they were set prior to generation, relocating them to `empty` Cells if their previous positions become walls.
3. THE Maze_Generator SHALL guarantee that at least one path exists between the Start_Cell and End_Cell after generation.
4. IF no Start_Cell or End_Cell is set when the Maze_Generator is activated, THEN THE Maze_Generator SHALL place the Start_Cell at the top-left Cell and the End_Cell at the bottom-right Cell before generating walls.

---

### Requirement 8: Grid Reset and Clear

**User Story:** As a user, I want to reset the grid to a clean state, so that I can start a new maze without refreshing the page.

#### Acceptance Criteria

1. WHEN the user activates the reset control, THE Visualizer SHALL set all Cells to the `empty` state.
2. WHEN the user activates the reset control, THE Visualizer SHALL clear the Start_Cell and End_Cell designations.
3. WHEN the user activates a clear-path control (distinct from full reset), THE Visualizer SHALL set all `visited` and `path` Cells back to `empty`, while preserving `wall`, `start`, and `end` Cell states.

---

### Requirement 9: Optional — Dark/Light Mode

**User Story:** As a user, I want to toggle between dark and light themes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHERE the dark/light mode feature is enabled, THE Visualizer SHALL provide a toggle control to switch between dark and light themes.
2. WHEN the user activates the theme toggle, THE Visualizer SHALL apply the selected theme to all UI elements without reloading the page.
3. WHERE the dark/light mode feature is enabled, THE Visualizer SHALL persist the user's theme preference in `localStorage` and restore it on subsequent page loads.

---

### Requirement 10: Optional — A* Pathfinding

**User Story:** As a user, I want to run A* search on my maze, so that I can see a heuristic-guided shortest path traversal.

#### Acceptance Criteria

1. WHERE the A_Star feature is enabled, THE Visualizer SHALL provide an A* algorithm selection control alongside BFS and DFS.
2. WHEN the user activates A_Star and both a Start_Cell and End_Cell exist, THE Visualizer SHALL execute A* search using Manhattan distance as the heuristic.
3. THE A_Star module SHALL guarantee that the path it finds is the shortest path when all edge weights are equal.
4. WHEN A_Star completes, THE Visualizer SHALL record Visited_Nodes, Path_Length, and Execution_Time in the Statistics_Panel.
5. IF A_Star exhausts all reachable Cells without reaching the End_Cell, THEN THE Visualizer SHALL display a "No path found" message.
