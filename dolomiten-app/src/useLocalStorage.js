import { useState, useEffect } from "react";

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch { return initial; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch { /* quota exceeded */ }
  }, [key, val]);

  return [val, setVal];
}
