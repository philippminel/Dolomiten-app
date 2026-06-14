import { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import { days, checklist } from "./days.js";
import { weatherByDay, outfitByDay, packlist, sunTimes } from "./data.js";
import { useLocalStorage } from "./useLocalStorage.js";
import { useSharedStore } from "./useSharedData.js";
import { useViewport } from "./useViewport.js";

import { createContext, useContext } from "react";

const StoreCtx = createContext(null);
const VpCtx = createContext({ isMobile: true, isTablet: false, isDesktop: false, width: 480 });

const GREEN = "#2d4a3e";
const BLOB_TOKEN = import.meta.env.VITE_VERCEL_BLOB_READ_WRITE_TOKEN;

/* ─── kleine Hilfskomponenten ─────────────────────────────────────────── */

function SectionLabel({ children }) {
  return <div style={{ fontSize: 10, letterSpacing: 3, color: "#8a7a6a", textTransform: "uppercase", marginBottom: 10 }}>{children}</div>;
}

function WeatherBar({ w }) {
  if (!w) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg,#eaf2f8,#f5f9fc)", border: "1px solid #cfe0ec", marginBottom: 16 }}>
      <div style={{ fontSize: 28 }}>{w.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, color: "#2a3a4a", fontWeight: 600 }}>{w.temp} <span style={{ fontSize: 12, color: "#7a8a9a", fontWeight: 400 }}>/ {w.low} nachts</span></div>
        <div style={{ fontSize: 12, color: "#5a6a7a" }}>{w.cond} · 💧 {w.rain} · 💨 {w.wind}</div>
      </div>
      <div style={{ fontSize: 11, color: "#7a8a9a", textAlign: "right", maxWidth: 90, lineHeight: 1.3 }}>{w.note}</div>
    </div>
  );
}

function ImageBox({ src, fallback, accent }) {
  const [err, setErr] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #d8cfc0", background: "#e8e0d0", position: "relative", marginBottom: 16, height: 180 }}>
      <img
        src={err ? fallback : src}
        alt=""
        onLoad={() => setLoaded(true)}
        onError={() => { if (!err) { setErr(true); setLoaded(false); } else setLoaded(true); }}
        style={{ width: "100%", height: 180, objectFit: "cover", display: "block", opacity: loaded ? 1 : 0, transition: "opacity 0.4s" }}
      />
      {!loaded && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: accent }}>🏔️</div>}
    </div>
  );
}

function MapBox({ day }) {
  const osm = `https://www.openstreetmap.org/export/embed.html?bbox=${day.mapCenter[1] - 0.3}%2C${day.mapCenter[0] - 0.15}%2C${day.mapCenter[1] + 0.3}%2C${day.mapCenter[0] + 0.15}&layer=mapnik`;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel>Karte & Route</SectionLabel>
      <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #d8cfc0" }}>
        <iframe src={osm} style={{ width: "100%", height: 180, border: "none", display: "block" }} title="Karte" loading="lazy" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <a href={day.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "9px", borderRadius: 10, background: GREEN, color: "#fff", fontSize: 12, textDecoration: "none", textAlign: "center" }}>🗺️ Google Maps</a>
        <a href={day.appleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "9px", borderRadius: 10, background: "#3a3028", color: "#fff", fontSize: 12, textDecoration: "none", textAlign: "center" }}>🍎 Apple Maps</a>
      </div>
    </div>
  );
}

/* ─── Editierbare Notiz ────────────────────────────────────────────────── */
function NotesBox({ dayNum }) {
  const store = useContext(StoreCtx);
  const notes = store.data[`notes_day${dayNum}`] || "";
  const setNotes = (v) => store.update(`notes_day${dayNum}`, v);
  const [editing, setEditing] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <SectionLabel>📝 Eigene Notizen</SectionLabel>
        <button onClick={() => setEditing(e => !e)} style={{ fontSize: 11, color: GREEN, background: "none", border: "none", cursor: "pointer", padding: "2px 8px", borderRadius: 8, background: editing ? "#f0f7f3" : "transparent" }}>
          {editing ? "✓ Fertig" : "✏️ Bearbeiten"}
        </button>
      </div>
      {editing ? (
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notizen, Ideen, Treffpunkte…"
          style={{ width: "100%", minHeight: 90, padding: "10px 12px", borderRadius: 10, border: "1.5px solid #b8d8c8", fontSize: 13, fontFamily: "Georgia, serif", color: "#2a2420", background: "#fafff8", resize: "vertical", boxSizing: "border-box", outline: "none" }}
          autoFocus
        />
      ) : (
        <div onClick={() => setEditing(true)} style={{ minHeight: 44, padding: "10px 12px", borderRadius: 10, border: "1px dashed #c8d8c0", background: "#fafff8", fontSize: 13, color: notes ? "#2a2420" : "#a0b090", cursor: "text", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
          {notes || "Tippen zum Notiz hinzufügen…"}
        </div>
      )}
    </div>
  );
}

/* ─── Outfit Box ───────────────────────────────────────────────────────── */
function OutfitBox({ outfit }) {
  if (!outfit) return null;
  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel>👗 Outfit-Idee</SectionLabel>
      <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fbf3ef", border: "1px solid #e8d0c4" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#9a5a45", marginBottom: 6 }}>{outfit.title}</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: "#6a4a3a", lineHeight: 1.7 }}>
          {outfit.items.map((it, i) => <li key={i}>{it}</li>)}
        </ul>
        {outfit.shoot && (
          <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 8, background: "#fff", border: "1px solid #f0dcd0", fontSize: 12, color: "#8a5a45", lineHeight: 1.5 }}>
            📷 <strong>Shooting:</strong> {outfit.shoot}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Dokumente / Blob Upload ──────────────────────────────────────────── */
function DocsBox({ dayNum }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const inputRef = useRef();

  const loadFiles = () => {
    setLoadingFiles(true);
    fetch(`/api/files?day=${dayNum}`)
      .then(r => r.json())
      .then(d => setFiles(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingFiles(false));
  };

  useEffect(() => { loadFiles(); }, [dayNum]);

  const upload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}&day=${dayNum}`, {
        method: "POST",
        body: file,
      });
      const blob = await res.json();
      if (blob.url) setFiles(p => [...p, blob]);
      else alert("Upload fehlgeschlagen: " + (blob.error || "unbekannt"));
    } catch (err) {
      alert("Upload fehlgeschlagen: " + err.message);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = async (url, i) => {
    if (!confirm("Datei löschen?")) return;
    try {
      await fetch(`/api/files?url=${encodeURIComponent(url)}`, { method: "DELETE" });
      setFiles(p => p.filter((_, idx) => idx !== i));
    } catch { alert("Löschen fehlgeschlagen"); }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionLabel>📄 Dokumente & Tickets</SectionLabel>
      <div style={{ padding: "12px 14px", borderRadius: 12, background: "#fff", border: "1px solid #e0d8cc" }}>
        <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={upload} style={{ display: "none" }} />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ width: "100%", padding: "11px", borderRadius: 10, border: "1.5px dashed #b8d8c8", background: uploading ? "#f0f7f3" : "#fafff8", color: "#4A7C6F", fontSize: 13, cursor: "pointer", marginBottom: files.length ? 10 : 0 }}>
          {uploading ? "⏳ Wird hochgeladen…" : "＋ PDF / Ticket hochladen"}
        </button>
        {loadingFiles && <div style={{ fontSize: 12, color: "#8a7a6a", textAlign: "center", padding: 6 }}>Lade Dateien…</div>}
        {files.map((f, i) => {
          const name = f.pathname.split("/").pop().replace(/^\d+_/, "");
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: "1px solid #f0e8dc" }}>
              <span style={{ fontSize: 18 }}>{f.pathname.match(/\.(jpg|jpeg|png)$/i) ? "🖼️" : "📄"}</span>
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: 13, color: GREEN, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</a>
              <button onClick={() => remove(f.url, i)} style={{ background: "none", border: "none", color: "#c0786a", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── PDF Export ───────────────────────────────────────────────────────── */
function exportPDF() {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const g = [45, 74, 62];
  doc.setFillColor(...g); doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(20);
  doc.text("Dolomiten  16.-21. Juni 2026", 15, 18);
  let y = 38;

  days.forEach(day => {
    if (y > 235) { doc.addPage(); y = 20; }
    const w = weatherByDay[day.day];
    doc.setFillColor(245, 242, 236); doc.rect(10, y - 5, 190, 10, "F");
    doc.setTextColor(...g); doc.setFontSize(12);
    doc.text(`Tag ${day.day} - ${day.date} - ${day.title}`, 14, y + 1);
    y += 9;
    doc.setTextColor(80, 60, 40); doc.setFontSize(9);
    if (w) { doc.text(`Wetter: ${w.temp}/${w.low} - ${w.cond}`, 14, y); y += 5; }
    doc.text(`Fahrt: ${day.drive}`, 14, y); y += 6;
    day.program.forEach(p => {
      if (y > 275) { doc.addPage(); y = 20; }
      doc.setTextColor(...g); doc.setFontSize(9); doc.text(p.time, 14, y);
      doc.setTextColor(58, 48, 40);
      const lines = doc.splitTextToSize(p.text, 155);
      doc.text(lines, 32, y); y += lines.length * 5 + 1;
    });
    y += 4;
  });

  doc.addPage(); y = 20;
  doc.setFillColor(...g); doc.rect(0, 0, 210, 16, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(15); doc.text("Packliste", 14, 11);
  y = 26;
  Object.entries(packlist).forEach(([cat, items]) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setTextColor(...g); doc.setFontSize(10); doc.text(cat, 14, y); y += 6;
    doc.setTextColor(60, 50, 40); doc.setFontSize(9);
    items.forEach(it => {
      if (y > 285) { doc.addPage(); y = 20; }
      doc.text(`[ ]  ${it}`, 18, y); y += 5;
    });
    y += 3;
  });
  doc.save("Dolomiten-Trip-2026.pdf");
}

/* ─── Tab Button ───────────────────────────────────────────────────────── */
function Tab({ active, accent, onClick, emoji, label, sub }) {
  return (
    <button onClick={onClick} style={{ flexShrink: 0, padding: "8px 11px", borderRadius: 10, border: active ? `1.5px solid ${accent}` : "1.5px solid #d0c8b8", background: active ? "#fff" : "transparent", color: active ? "#2a2420" : "#7a6e60", cursor: "pointer", fontSize: 10, lineHeight: 1.3, textAlign: "center", boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
      <div style={{ fontSize: 15, marginBottom: 2 }}>{emoji}</div>
      <div style={{ fontWeight: 600, fontSize: 9 }}>{label}</div>
      <div style={{ fontSize: 8, opacity: 0.75 }}>{sub}</div>
    </button>
  );
}

/* ─── Day View ─────────────────────────────────────────────────────────── */
function DayView({ idx, setView }) {
  const day = days[idx];
  const vp = useContext(VpCtx);
  const w = weatherByDay[day.day];
  const outfit = outfitByDay[day.day];
  const twoCol = !vp.isMobile;

  const header = (
    <div style={{ padding: "16px", borderRadius: 14, background: "#fff", border: `1.5px solid ${day.accent}44`, borderLeft: `4px solid ${day.accent}`, marginBottom: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: day.accent, textTransform: "uppercase", marginBottom: 3 }}>{day.date}</div>
      <h2 style={{ margin: 0, fontSize: vp.isMobile ? 19 : 23, fontWeight: 400 }}>{day.emoji} {day.title}</h2>
      <div style={{ fontSize: 11, color: "#8a7a6a", marginTop: 7, paddingTop: 7, borderTop: "1px solid #f0e8dc" }}>🚐 {day.drive}</div>
    </div>
  );

  const leftCol = (
    <>
      <WeatherBar w={w} />
      <ImageBox src={day.img} fallback={day.imgFallback} accent={day.accent} />
      <MapBox day={day} />
      <OutfitBox outfit={outfit} />
    </>
  );

  const rightCol = (
    <>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel>Programm</SectionLabel>
        {day.program.map((p, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 9, paddingBottom: 9, borderBottom: i < day.program.length - 1 ? "1px solid #ede8e0" : "none" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: day.accent, fontFamily: "monospace", minWidth: 42, paddingTop: 1 }}>{p.time}</div>
            <div style={{ fontSize: 13, color: "#3a3028", lineHeight: 1.5, flex: 1 }}>{p.text}</div>
          </div>
        ))}
      </div>

      <NotesBox dayNum={day.day} />

      {day.fotospots.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Fotospots</SectionLabel>
          {day.fotospots.map((f, i) => <div key={i} style={{ padding: "8px 12px", marginBottom: 5, borderRadius: 9, background: "#fff8ec", border: "1px solid #e8d8a0", fontSize: 12, color: "#6a5820" }}>{f}</div>)}
        </div>
      )}

      {day.tips.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionLabel>Tipps & Hinweise</SectionLabel>
          {day.tips.map((t, i) => <div key={i} style={{ padding: "8px 12px", marginBottom: 5, borderRadius: 9, background: "#f5f2ec", border: "1px solid #e0d8cc", fontSize: 12, color: "#4a4038" }}>{t}</div>)}
        </div>
      )}

      <DocsBox dayNum={day.day} />

      <div style={{ padding: "12px 14px", borderRadius: 12, background: "#f0f7f3", border: "1px solid #b8d8c8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, color: "#4A7C6F", marginBottom: 2, textTransform: "uppercase", letterSpacing: 2 }}>🏕️ Übernachtung</div>
          <div style={{ fontSize: 14 }}>{day.overnight}</div>
        </div>
        {day.overnightUrl && <a href={day.overnightUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "7px 13px", borderRadius: 20, background: GREEN, color: "#fff", fontSize: 12, textDecoration: "none" }}>Buchen →</a>}
      </div>
    </>
  );

  return (
    <>
      {header}
      {twoCol ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div>{leftCol}</div>
          <div>{rightCol}</div>
        </div>
      ) : (
        <>{leftCol}{rightCol}</>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
        <button onClick={() => setView({ type: "day", idx: Math.max(0, idx - 1) })} disabled={idx === 0}
          style={{ padding: "9px 15px", borderRadius: 20, border: "1px solid #d0c8b8", background: "#fff", color: idx === 0 ? "#c0b8a8" : "#4A7C6F", cursor: idx === 0 ? "default" : "pointer", fontSize: 12 }}>
          ← Vorheriger
        </button>
        <button onClick={() => setView({ type: "day", idx: Math.min(days.length - 1, idx + 1) })} disabled={idx === days.length - 1}
          style={{ padding: "9px 15px", borderRadius: 20, border: "1px solid #d0c8b8", background: "#fff", color: idx === days.length - 1 ? "#c0b8a8" : "#4A7C6F", cursor: idx === days.length - 1 ? "default" : "pointer", fontSize: 12 }}>
          Nächster →
        </button>
      </div>
    </>
  );
}

/* ─── Todo View ────────────────────────────────────────────────────────── */
function TodoView() {
  const store = useContext(StoreCtx);
  const vp = useContext(VpCtx);
  const checks = store.data["todo_checks"] || checklist.map(() => false);
  const toggle = (i) => { const n = [...checks]; n[i] = !n[i]; store.update("todo_checks", n); };
  return (
    <div style={{ maxWidth: vp.isMobile ? "100%" : 640, margin: "0 auto" }}>
      <h2 style={{ fontSize: vp.isMobile ? 16 : 20, fontWeight: 400, marginBottom: 14 }}>✅ Buchungs-Checkliste</h2>
      {checklist.map((c, i) => (
        <div key={i} onClick={() => toggle(i)} style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "12px 14px", marginBottom: 7, borderRadius: 12, background: checks[i] ? "#f0f7f3" : "#fff", border: checks[i] ? "1px solid #b8d8c8" : "1px solid #e0d8cc", cursor: "pointer" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, marginTop: 1, border: checks[i] ? "none" : "1.5px solid #2d4a3e", background: checks[i] ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700 }}>{checks[i] ? "✓" : ""}</div>
          <div>
            <div style={{ fontSize: 13, lineHeight: 1.4, color: checks[i] ? "#6a9a7a" : "#2a2420", textDecoration: checks[i] ? "line-through" : "none" }}>{c.item}</div>
            {c.url && <a href={c.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4A7C6F", marginTop: 2, display: "block" }} onClick={e => e.stopPropagation()}>{c.url.replace("https://", "").split("/")[0]} →</a>}
          </div>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: "13px 15px", borderRadius: 12, background: "#fff8ec", border: "1px solid #e8d8a0", fontSize: 12, color: "#6a5820", lineHeight: 1.9 }}>
        💶 <strong>Budget Fixkosten</strong><br />
        Ansitz Gamp 4N ~220 € · Camping Olympia ~50 €<br />
        Area Sosta ~25 € · Drei Zinnen 45 € · Pragser 45 €<br />
        Vignette ~15 € · Brenner ~10 €<br />
        <strong>Gesamt: ~410 €</strong>
      </div>
    </div>
  );
}

/* ─── Pack View ────────────────────────────────────────────────────────── */
function PackView() {
  const store = useContext(StoreCtx);
  const vp = useContext(VpCtx);
  const checks = store.data["pack_checks"] || {};
  const toggle = (k) => store.update("pack_checks", { ...checks, [k]: !checks[k] });
  const total = Object.values(packlist).flat().length;
  const done = Object.values(checks).filter(Boolean).length;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 400, margin: 0 }}>🎒 Packliste</h2>
        <div style={{ fontSize: 12, color: done === total ? "#4A7C6F" : "#8a7a6a" }}>{done}/{total} gepackt</div>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "#e8e0d0", marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(done / total) * 100}%`, background: GREEN, transition: "width 0.3s", borderRadius: 2 }} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: vp.isDesktop ? "1fr 1fr 1fr" : vp.isTablet ? "1fr 1fr" : "1fr", gap: vp.isMobile ? 0 : 20, alignItems: "start" }}>
      {Object.entries(packlist).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <SectionLabel>{cat}</SectionLabel>
          {items.map((it, i) => {
            const k = cat + i;
            return (
              <div key={k} onClick={() => toggle(k)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 5, borderRadius: 9, background: checks[k] ? "#f0f7f3" : "#fff", border: checks[k] ? "1px solid #b8d8c8" : "1px solid #e8e0d4", cursor: "pointer" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, border: checks[k] ? "none" : "1.5px solid #b0a890", background: checks[k] ? GREEN : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{checks[k] ? "✓" : ""}</div>
                <span style={{ fontSize: 13, color: checks[k] ? "#6a9a7a" : "#3a3028", textDecoration: checks[k] ? "line-through" : "none" }}>{it}</span>
              </div>
            );
          })}
        </div>
      ))}
      </div>
    </>
  );
}

/* ─── Root App ─────────────────────────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState({ type: "day", idx: 0 });
  const store = useSharedStore();
  const vp = useViewport();

  const maxW = vp.isDesktop ? 1200 : vp.isTablet ? 820 : 480;

  return (
    <StoreCtx.Provider value={store}>
    <VpCtx.Provider value={vp}>
    <div style={{ fontFamily: "'Georgia','Times New Roman',serif", background: "#faf7f2", minHeight: "100vh", color: "#2a2420", maxWidth: maxW, margin: "0 auto", boxShadow: vp.isMobile ? "none" : "0 0 40px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{ padding: vp.isMobile ? "22px 20px 14px" : "28px 32px 18px", background: GREEN, color: "#f0ebe0", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: 10, letterSpacing: 4, color: "#8aad99", textTransform: "uppercase", marginBottom: 4 }}>16 – 21 Juni 2026</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ margin: 0, fontSize: vp.isMobile ? 21 : 26, fontWeight: 400 }}>Dolomiten 🏔️</h1>
          <button onClick={exportPDF} style={{ padding: "7px 14px", borderRadius: 20, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#f0ebe0", fontSize: 12, cursor: "pointer" }}>⬇ PDF</button>
        </div>
        <div style={{ fontSize: 11, color: "#8aad99", marginTop: 3 }}>☀️ Wetter: sonnig 20–24° · 🌅 {sunTimes.sunrise} · 🌇 {sunTimes.sunset}{store.syncing ? " · 💾 sichern…" : ""}</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", overflowX: "auto", padding: vp.isMobile ? "12px 12px 0" : "14px 32px 0", gap: 6, background: "#f0ebe0", borderBottom: "1px solid #d8cfc0", scrollbarWidth: "none" }}>
        {days.map((d, i) => (
          <Tab key={i} active={view.type === "day" && view.idx === i} accent={d.accent} onClick={() => setView({ type: "day", idx: i })} emoji={d.emoji} label={`Tag ${d.day}`} sub={d.date.split(" ").slice(0, 2).join(" ")} />
        ))}
        <Tab active={view.type === "pack"} accent="#8a6a4a" onClick={() => setView({ type: "pack" })} emoji="🎒" label="Pack" sub="Liste" />
        <Tab active={view.type === "todo"} accent="#c0a060" onClick={() => setView({ type: "todo" })} emoji="✅" label="Todo" sub="Buchen" />
      </div>

      {/* Content */}
      <div style={{ padding: vp.isMobile ? "18px 16px 60px" : "24px 32px 80px" }}>
        {view.type === "todo" ? <TodoView /> : view.type === "pack" ? <PackView /> : <DayView idx={view.idx} setView={setView} />}
      </div>
    </div>
    </VpCtx.Provider>
    </StoreCtx.Provider>
  );
}
