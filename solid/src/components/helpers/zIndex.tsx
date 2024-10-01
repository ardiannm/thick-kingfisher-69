export let currentZIndex = 0; // Initialize the global zIndex

export const getNextZIndex = () => {
  currentZIndex += 1; // Increment the zIndex
  return currentZIndex; // Return the new zIndex value
};

export const resetZIndex = () => {
  currentZIndex = 0; // Reset zIndex to 0
};
