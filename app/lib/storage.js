export const getJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const setJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getNumber = (key, fallback) => {
  const raw = localStorage.getItem(key);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const setString = (key, value) => {
  localStorage.setItem(key, String(value));
};
