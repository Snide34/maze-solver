/**
 * visualizer.js — Orchestrator Module
 * 
 * Owns gridState, coordinates Grid, Animator, Algorithms, Statistics.
 * Single source of truth for all maze state.
 * 
 * Feature: maze-solver-visualizer
 */

import * as Grid from './grid.js';
import * as Animator from './animator.js';
import { bfs } from './bfs.js';
import { dfs } from './dfs.js';
import { astar } from './astar.js';
import { generateMaze as genMaze } from './mazeGenerator.js';
import * as Stats from './statisticsPanel.js';

// Module state
let gridState = [];
let rows = 20;
let cols = 20;
let startPos = null;
let endPos = null;
let isRunning = false;
let animationSpeed = 30;

/**
 * Initialize visualizer with specified grid dimensions.
 */
export function initVisualizer(newRows, newCols) {
  rows = newRows;
  cols = newCols;
  
  // Build gridState 2D array
  gridState = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({ r, c, state: 'empty' }))
  );
  
  // Clear start/end
  startPos = null;
  endPos = null;
  
  // Render grid with interaction callbacks
  const container = document.getElementById('grid-container');
  Grid.renderGrid(container, rows, cols, handleLeftClick, handleRightClick, handleMiddleClick);
  
  // Reset stats
  Stats.resetStats();
}

/**
 * Handle left-click: toggle wall (skip start/end).
 */
function handleLeftClick(r, c) {
  if (isRunning) return;
  
  const cell = gridState[r][c];
  
  // Skip if start or end
  if (cell.state === 'start' || cell.state === 'end') return;
  
  // Toggle wall
  if (cell.state === 'empty' || cell.state === 'visited' || cell.state === 'path') {
    cell.state = 'wall';
  } else if (cell.state === 'wall') {
    cell.state = 'empty';
  }
  
  Grid.applyCellState(r, c, cell.state);
}

/**
 * Handle right-click: set/move start.
 */
function handleRightClick(r, c) {
  if (isRunning) return;
  
  // Clear previous start
  if (startPos) {
    gridState[startPos.r][startPos.c].state = 'empty';
    Grid.applyCellState(startPos.r, startPos.c, 'empty');
  }
  
  // Set new start
  gridState[r][c].state = 'start';
  Grid.applyCellState(r, c, 'start');
  startPos = { r, c };
}

/**
 * Handle middle-click: set/move end.
 */
function handleMiddleClick(r, c) {
  if (isRunning) return;
  
  // Clear previous end
  if (endPos) {
    gridState[endPos.r][endPos.c].state = 'empty';
    Grid.applyCellState(endPos.r, endPos.c, 'empty');
  }
  
  // Set new end
  gridState[r][c].state = 'end';
  Grid.applyCellState(r, c, 'end');
  endPos = { r, c };
}

/**
 * Run selected algorithm.
 */
export function runAlgorithm(name) {
  if (isRunning) return;
  if (!startPos || !endPos) {
    alert('Please place a start and end cell first.');
    return;
  }
  
  // Clear previous visited/path cells
  clearPath();
  
  // Select algorithm
  let algoFn;
  switch (name) {
    case 'bfs':
      algoFn = bfs;
      break;
    case 'dfs':
      algoFn = dfs;
      break;
    case 'astar':
      algoFn = astar;
      break;
    default:
      return;
  }
  
  // Execute algorithm
  const result = algoFn(gridState, startPos, endPos);
  
  // Update stats
  Stats.updateStats({
    algorithm: name,
    visitedNodes: result.visitedNodes,
    pathLength: result.pathLength,
    executionTime: result.executionTime
  });
  
  // Check if no path found
  if (result.path.length === 0) {
    alert('No path found!');
    return;
  }
  
  // Animate result
  isRunning = true;
  Grid.setInteractionEnabled(false);
  
  Animator.animate(
    result.visited,
    result.path,
    Grid.applyCellState,
    animationSpeed,
    () => {
      isRunning = false;
      Grid.setInteractionEnabled(true);
    }
  );
}

/**
 * Generate random maze.
 */
export function generateMaze() {
  if (isRunning) return;
  
  // Clear path
  clearPath();
  
  // Generate maze
  const { walls, startPos: newStart, endPos: newEnd } = genMaze(rows, cols, startPos, endPos);
  
  // Update start/end if changed
  if (startPos && (startPos.r !== newStart.r || startPos.c !== newStart.c)) {
    gridState[startPos.r][startPos.c].state = 'empty';
    Grid.applyCellState(startPos.r, startPos.c, 'empty');
  }
  if (endPos && (endPos.r !== newEnd.r || endPos.c !== newEnd.c)) {
    gridState[endPos.r][endPos.c].state = 'empty';
    Grid.applyCellState(endPos.r, endPos.c, 'empty');
  }
  
  startPos = newStart;
  endPos = newEnd;
  
  // Apply walls to grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (walls.has(key)) {
        gridState[r][c].state = 'wall';
        Grid.applyCellState(r, c, 'wall');
      } else if (r === startPos.r && c === startPos.c) {
        gridState[r][c].state = 'start';
        Grid.applyCellState(r, c, 'start');
      } else if (r === endPos.r && c === endPos.c) {
        gridState[r][c].state = 'end';
        Grid.applyCellState(r, c, 'end');
      } else {
        gridState[r][c].state = 'empty';
        Grid.applyCellState(r, c, 'empty');
      }
    }
  }
}

/**
 * Reset grid: all cells → empty, clear start/end.
 */
export function resetGrid() {
  if (isRunning) {
    Animator.cancelAnimation();
    isRunning = false;
    Grid.setInteractionEnabled(true);
  }
  
  // Clear all cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      gridState[r][c].state = 'empty';
      Grid.applyCellState(r, c, 'empty');
    }
  }
  
  startPos = null;
  endPos = null;
  
  Stats.resetStats();
}

/**
 * Clear path: visited/path → empty, preserve wall/start/end.
 */
export function clearPath() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = gridState[r][c];
      if (cell.state === 'visited' || cell.state === 'path') {
        cell.state = 'empty';
        Grid.applyCellState(r, c, 'empty');
      }
    }
  }
}

/**
 * Set animation speed.
 */
export function setAnimationSpeed(ms) {
  animationSpeed = ms;
}

/**
 * Get current start/end for external use.
 */
export function getStartEnd() {
  return { startPos, endPos };
}
