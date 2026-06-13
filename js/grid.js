/**
 * grid.js — DOM Grid Management
 * 
 * Responsibility: Create/destroy cell elements, map DOM events to grid coordinates,
 * apply CSS classes based on Cell_State.
 * 
 * Feature: maze-solver-visualizer
 */

// Module-scoped 2D array for fast cell lookup
let cellsArray = [];
let gridContainer = null;

/**
 * Renders the grid: clears container, sets CSS custom property for columns,
 * creates cell divs with data attributes, and sets up delegated event listeners.
 * 
 * @param {HTMLElement} container - The grid container element
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @param {Function} onCellLeft - Callback for left-click: (row, col) => void
 * @param {Function} onCellRight - Callback for right-click: (row, col) => void
 * @param {Function} onCellMiddle - Callback for middle-click: (row, col) => void
 */
export function renderGrid(container, rows, cols, onCellLeft, onCellRight, onCellMiddle) {
  // Store container reference
  gridContainer = container;
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Set CSS custom property for column count
  container.style.setProperty('--cols', cols);
  
  // Initialize 2D array for fast lookup
  cellsArray = Array.from({ length: rows }, () => Array(cols));
  
  // Create all cell elements
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.dataset.state = 'empty';
      
      container.appendChild(cell);
      cellsArray[r][c] = cell;
    }
  }
  
  // Single delegated listener for all click events
  container.addEventListener('click', (event) => {
    if (event.target.classList.contains('cell')) {
      const row = parseInt(event.target.dataset.row, 10);
      const col = parseInt(event.target.dataset.col, 10);
      onCellLeft(row, col);
    }
  });
  
  // Right-click handler (contextmenu event)
  container.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent browser context menu
    if (event.target.classList.contains('cell')) {
      const row = parseInt(event.target.dataset.row, 10);
      const col = parseInt(event.target.dataset.col, 10);
      onCellRight(row, col);
    }
  });
  
  // Middle-click handler (auxclick event)
  container.addEventListener('auxclick', (event) => {
    if (event.button === 1 && event.target.classList.contains('cell')) {
      event.preventDefault();
      const row = parseInt(event.target.dataset.row, 10);
      const col = parseInt(event.target.dataset.col, 10);
      onCellMiddle(row, col);
    }
  });
}

/**
 * Applies a state to a specific cell by setting the data-state attribute.
 * CSS styling is driven by [data-state] attribute selectors.
 * 
 * @param {number} r - Row index
 * @param {number} c - Column index
 * @param {string} state - One of: 'empty', 'wall', 'start', 'end', 'visited', 'path'
 */
export function applyCellState(r, c, state) {
  const cell = cellsArray[r]?.[c];
  if (cell) {
    cell.dataset.state = state;
  }
}

/**
 * Enables or disables mouse interaction with the grid.
 * 
 * @param {boolean} enabled - True to enable, false to disable
 */
export function setInteractionEnabled(enabled) {
  if (gridContainer) {
    gridContainer.style.pointerEvents = enabled ? 'auto' : 'none';
  }
}

/**
 * Returns the DOM element for a specific cell.
 * Used for testing or direct DOM queries if needed.
 * 
 * @param {number} r - Row index
 * @param {number} c - Column index
 * @returns {HTMLElement | null} The cell element, or null if out of bounds
 */
export function getCellElement(r, c) {
  return cellsArray[r]?.[c] || null;
}
