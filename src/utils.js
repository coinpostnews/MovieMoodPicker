// Utility helpers shared across the project
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
export const safeParseJSON = (str, fallback = null) => {
  try { return JSON.parse(str); } catch { return fallback; }
};
