// Statistics panel

/**
 * Update statistics panel with algorithm results.
 * 
 * @param {{algorithm: string, visitedNodes: number, pathLength: number, executionTime: number}} stats
 */
export function updateStats({ algorithm, visitedNodes, pathLength, executionTime }) {
  const algorithmEl = document.getElementById('stat-algorithm');
  const visitedEl = document.getElementById('stat-visited');
  const pathEl = document.getElementById('stat-path');
  const timeEl = document.getElementById('stat-time');
  
  if (algorithmEl) algorithmEl.textContent = algorithm.toUpperCase();
  if (visitedEl) visitedEl.textContent = visitedNodes;
  if (pathEl) pathEl.textContent = pathLength;
  if (timeEl) timeEl.textContent = `${executionTime}ms`;
}

/**
 * Reset statistics panel to default empty state.
 */
export function resetStats() {
  const algorithmEl = document.getElementById('stat-algorithm');
  const visitedEl = document.getElementById('stat-visited');
  const pathEl = document.getElementById('stat-path');
  const timeEl = document.getElementById('stat-time');
  
  if (algorithmEl) algorithmEl.textContent = '—';
  if (visitedEl) visitedEl.textContent = '—';
  if (pathEl) pathEl.textContent = '—';
  if (timeEl) timeEl.textContent = '—';
}
