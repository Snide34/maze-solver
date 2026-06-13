// Animation module

let timeoutIds = [];

/**
 * Animate visited cells followed by path cells with configurable delay.
 * 
 * @param {Array} visited - Array of cells to animate with 'visited' state
 * @param {Array} path - Array of cells to animate with 'path' state
 * @param {Function} applyState - Callback(r, c, state) to update cell state
 * @param {number} speedMs - Delay in milliseconds between each step
 * @param {Function} onComplete - Callback invoked after the last step
 */
export function animate(visited, path, applyState, speedMs, onComplete) {
  // Clear any existing timeouts from previous animations
  cancelAnimation();
  
  // Build combined steps array: visited first, then path
  const steps = [
    ...visited.map(cell => ({ cell, state: 'visited' })),
    ...path.map(cell => ({ cell, state: 'path' }))
  ];
  
  // Schedule each step at i * speedMs offset
  steps.forEach(({ cell, state }, i) => {
    const timeoutId = setTimeout(() => {
      applyState(cell.r, cell.c, state);
      
      // Call onComplete after the last step
      if (i === steps.length - 1) {
        onComplete();
      }
    }, i * speedMs);
    
    timeoutIds.push(timeoutId);
  });
}

/**
 * Cancel all pending animation timeouts.
 * Called when user resets/interrupts an animation mid-run.
 */
export function cancelAnimation() {
  timeoutIds.forEach(id => clearTimeout(id));
  timeoutIds = [];
}
