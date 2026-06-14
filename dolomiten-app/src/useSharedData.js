import { useState, useEffect, useCallback, useRef } from "react";

// Lädt das gesamte geteilte Daten-Objekt einmal und stellt einen Setter bereit,
// der Änderungen (debounced) zurück in den Blob schreibt.
export function useSharedStore() {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const saveTimer = useRef(null);

  useEffect(() => {
    fetch("/api/data")
      .then(r => r.json())
      .then(d => { setData(d || {}); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const update = useCallback((key, value) => {
    setData(prev => {
      const next = { ...prev, [key]: value };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        setSyncing(true);
        fetch("/api/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        }).finally(() => setSyncing(false));
      }, 700);
      return next;
    });
  }, []);

  return { data, loaded, syncing, update };
}
