export function delay(value, ms = 250) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function getStoredArray(key, fallback = []) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

export function setStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
