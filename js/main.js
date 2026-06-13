// Application entry point

import * as Visualizer from './visualizer.js';

// Restore theme from localStorage
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.dataset.theme = savedTheme;

// Update theme toggle button icon
const updateThemeIcon = () => {
  const themeBtn = document.getElementById('btn-theme');
  const current = document.documentElement.dataset.theme;
  if (themeBtn) {
    themeBtn.textContent = current === 'dark' ? '☀️' : '🌙';
  }
};

// Initialize visualizer with default 20×20 grid
Visualizer.initVisualizer(20, 20);

// Update theme icon on load
updateThemeIcon();

// ============================================
// Event Listeners
// ============================================

// Run button
document.getElementById('btn-run').addEventListener('click', () => {
  const algorithm = document.getElementById('algorithm-select').value;
  Visualizer.runAlgorithm(algorithm);
});

// Generate Maze button
document.getElementById('btn-generate').addEventListener('click', () => {
  Visualizer.generateMaze();
});

// Reset button
document.getElementById('btn-reset').addEventListener('click', () => {
  Visualizer.resetGrid();
});

// Clear Path button
document.getElementById('btn-clear-path').addEventListener('click', () => {
  Visualizer.clearPath();
});

// Theme toggle button
document.getElementById('btn-theme').addEventListener('click', () => {
  const current = document.documentElement.dataset.theme;
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
  updateThemeIcon();
});

// Speed slider
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

speedSlider.addEventListener('input', (e) => {
  const speed = parseInt(e.target.value, 10);
  speedValue.textContent = `${speed}ms`;
  Visualizer.setAnimationSpeed(speed);
});

// Grid size selector
document.getElementById('grid-size-select').addEventListener('change', (e) => {
  const size = parseInt(e.target.value, 10);
  Visualizer.initVisualizer(size, size);
});

// Disable Run button if no start/end (check on algorithm selection)
document.getElementById('algorithm-select').addEventListener('change', () => {
  const { startPos, endPos } = Visualizer.getStartEnd();
  const runBtn = document.getElementById('btn-run');
  if (runBtn) {
    runBtn.disabled = !startPos || !endPos;
    runBtn.title = (!startPos || !endPos) ? 'Place a start and end cell first' : '';
  }
});

// Initial check for Run button state
const { startPos: initialStart, endPos: initialEnd } = Visualizer.getStartEnd();
const runBtn = document.getElementById('btn-run');
if (runBtn) {
  runBtn.disabled = !initialStart || !initialEnd;
  runBtn.title = (!initialStart || !initialEnd) ? 'Place a start and end cell first' : '';
}
