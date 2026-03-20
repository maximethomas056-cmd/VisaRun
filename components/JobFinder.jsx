import { useState, useEffect, useRef } from "react";
import { JOB_DATA } from "../data/JOB_DATA_FINAL";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:          "#f5f3ee",
  bgCard:      "#ffffff",
  bgMuted:     "#f0ede6",
  border:      "#e8e3d9",
  text:        "#1a1a18",
  textMid:     "#5a5850",
  textFaint:   "#9a9488",
  green:       "#1a7a4a",
  greenLight:  "#edf7f1",
  greenBorder: "#b8e0c8",
  teal:        "#0d9488",
  amber:       "#b45309",
  amberBg:     "#fef9ec",
  red:         "#dc2626",
  redBg:       "#fff1f2",
  shadow:      "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowLg:    "0 8px 40px rgba(0,0,0,0.14)",
};

const FREE_LIMIT  = 2;
const SECTORS     = ["Farm", "Mine", "Construction", "Roadhouse", "Solar", "Fish", "Abattoir", "Forestry", "Autre"];
const STATES      = ["QLD", "WA", "NSW", "VIC", "TAS", "NT", "SA"];
const STATE_ORDER = { QLD: 0, WA: 1, NSW: 2, VIC: 3, TAS: 4, NT: 5, SA: 6 };

const SECTOR_ICONS = {
  Farm:         "🌾",
  Mine:         "⛏️",
  Construction: "🏗️",
  Roadhouse:    "🛣️",
  Solar:        "☀️",
  Fish:         "🐟",
  Abattoir:     "🥩",
  Forestry:     "🌲",
  Autre:        "🏡",
};

const STATE_COLORS = {
  QLD: "#e67e22", WA: "#2980b9", NSW: "#8e44ad",
  VIC: "#16a085", TAS: "#c0392b", NT:  "#d35400", SA: "#27ae60",
};

const REVIEWS = [
  { name: "Lucas M.",   flag: "🇫🇷", text: "J'avais cherché 2 semaines sans résultat. Appelé directement. Embauché en 48h." },
  { name: "Camille R.", flag: "🇧🇪", text: "Chaque jour qui passait c'était du visa cramé. Cette liste m'a sauvé la mise." },
  { name: "Théo B.",    flag: "🇨🇭", text: "Contacts directs, pas de formulaire. Premier appel, premier entretien, c'était bon." },
  { name: "Sara K.",    flag: "🇩🇪", text: "3 semaines perdues avant de trouver ça. Ne fais pas la même erreur que moi." },
];

const CITY_COORDS = {
  "Bundaberg":        { lat: -24.87, lng: 152.35 },
  "Bowen":            { lat: -20.01, lng: 148.24 },
  "Stanthorpe":       { lat: -28.65, lng: 151.93 },
  "Mareeba":          { lat: -17.00, lng: 145.43 },
  "Carnarvon":        { lat: -24.87, lng: 113.66 },
  "Swan Valley":      { lat: -31.82, lng: 116.01 },
  "Margaret River":   { lat: -33.95, lng: 115.07 },
  "Healesville":      { lat: -37.65, lng: 145.52 },
  "Cessnock":         { lat: -32.83, lng: 151.35 },
  "Launceston":       { lat: -41.43, lng: 147.14 },
  "Newman":           { lat: -23.36, lng: 119.73 },
  "Tom Price":        { lat: -22.69, lng: 117.79 },
  "Port Hedland":     { lat: -20.31, lng: 118.57 },
  "Mount Isa":        { lat: -20.72, lng: 139.49 },
  "Singleton":        { lat: -32.57, lng: 151.17 },
  "Port Augusta":     { lat: -32.49, lng: 137.76 },
  "Geraldton":        { lat: -28.77, lng: 114.61 },
  "Mackay":           { lat: -21.14, lng: 149.18 },
  "Barkly Homestead": { lat: -19.70, lng: 135.83 },
  "Daly Waters":      { lat: -16.26, lng: 133.38 },
  "Coober Pedy":      { lat: -29.01, lng: 134.75 },
  "Longreach":        { lat: -23.44, lng: 144.25 },
  "Dubbo":            { lat: -32.24, lng: 148.60 },
  "Kalgoorlie":       { lat: -30.74, lng: 121.46 },
  "Huonville":        { lat: -43.03, lng: 147.02 },
  "Dover":            { lat: -43.31, lng: 147.02 },
  "Port Lincoln":     { lat: -34.72, lng: 135.86 },
  "Arno Bay":         { lat: -33.92, lng: 136.57 },
  "Darwin":           { lat: -12.46, lng: 130.84 },
  "Dinmore":          { lat: -27.62, lng: 152.80 },
  "Rockhampton":      { lat: -23.38, lng: 150.51 },
  "Brisbane":         { lat: -27.47, lng: 153.02 },
  "Murray Bridge":    { lat: -35.12, lng: 139.27 },
  "Wingham":          { lat: -31.86, lng: 152.37 },
  "Hobart":           { lat: -42.88, lng: 147.33 },
  "Coffs Harbour":    { lat: -30.30, lng: 153.11 },
  "Traralgon":        { lat: -38.19, lng: 146.54 },
  "Mount Gambier":    { lat: -37.83, lng: 140.78 },
};

const AU_CITIES = [
  "Sydney","Melbourne","Brisbane","Perth","Adelaide","Darwin","Hobart",
  "Cairns","Townsville","Mackay","Rockhampton","Bundaberg","Toowoomba",
  "Gold Coast","Sunshine Coast","Newcastle","Wollongong","Geelong",
  "Ballarat","Bendigo","Launceston","Alice Springs","Katherine",
  "Broome","Geraldton","Kalgoorlie","Port Hedland","Newman","Tom Price",
  "Carnarvon","Margaret River","Albany","Esperance","Mount Isa",
  "Longreach","Charleville","Roma","Emerald","Bowen","Stanthorpe",
  "Mareeba","Atherton","Port Augusta","Coober Pedy","Whyalla",
  "Dubbo","Orange","Broken Hill","Wagga Wagga","Albury","Cessnock","Singleton",
  "Huonville","Dover","Port Lincoln","Murray Bridge","Wingham",
  "Coffs Harbour","Traralgon","Mount Gambier","Arno Bay","Dinmore",
];

const KNOWN_COORDS = {
  "Sydney":        { lat: -33.87, lng: 151.21 },
  "Melbourne":     { lat: -37.81, lng: 144.96 },
  "Brisbane":      { lat: -27.47, lng: 153.02 },
  "Perth":         { lat: -31.95, lng: 115.86 },
  "Adelaide":      { lat: -34.93, lng: 138.60 },
  "Darwin":        { lat: -12.46, lng: 130.84 },
  "Hobart":        { lat: -42.88, lng: 147.33 },
  "Cairns":        { lat: -16.92, lng: 145.77 },
  "Townsville":    { lat: -19.26, lng: 146.82 },
  "Alice Springs": { lat: -23.70, lng: 133.88 },
  "Broome":        { lat: -17.96, lng: 122.24 },
  "Kalgoorlie":    { lat: -30.74, lng: 121.46 },
  "Dubbo":         { lat: -32.24, lng: 148.60 },
  "Broken Hill":   { lat: -31.95, lng: 141.47 },
  ...CITY_COORDS,
};

function haversine(lat1, lng1, lat2, lng2) {
  const R    = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a    = Math.sin(dLat / 2) ** 2
             + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180)
             * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const el = document.createElement("input");
      el.style.cssText = "position:fixed;opacity:0;top:0;left:0;";
      el.value = text;
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      return true;
    } catch { return false; }
  }
}

const fmtTimer = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function CopyBtn({ text }) {
  const [status, setStatus] = useState("idle");
  const handle = async (e) => {
    e.preventDefault(); e.stopPropagation();
    const ok = await copyToClipboard(text);
    setStatus(ok ? "ok" : "err");
    setTimeout(() => setStatus("idle"), 2000);
  };
  return (
    <button onClick={handle} title="Copier" style={{
      background: status === "ok" ? C.greenLight : status === "err" ? C.redBg : C.bgMuted,
      color:      status === "ok" ? C.green      : status === "err" ? C.red   : C.textFaint,
      border: `1px solid ${C.border}`, borderRadius: 6,
      width: 26, height: 26, display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer", fontSize: 12,
      flexShrink: 0, transition: "all 0.18s", fontFamily: "'DM Sans',sans-serif",
    }}>
      {status === "ok" ? "✓" : status === "err" ? "✗" : "📋"}
    </button>
  );
}

export default function JobFinder() {
  const [sector,      setSector]      = useState(null);
  const [stateF,      setStateF]      = useState(null);
  const [paid,        setPaid]        = useState(false);
  const [paying,      setPaying]      = useState(false);
  const [animCount,   setAnimCount]   = useState(0);
  const [timer,       setTimer]       = useState(899);
  const [reviewIdx,   setReviewIdx]   = useState(0);
  const [viewers,     setViewers]     = useState(Math.floor(Math.random() * 8) + 11);
  const [revealed,    setRevealed]    = useState([]);
  const [showSticky,  setShowSticky]  = useState(false);
  const [cityInput,   setCityInput]   = useState("");
  const [cityCoords,  setCityCoords]  = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  const paywallRef   = useRef(null);
  const timerStarted = useRef(false);

  useEffect(() => {
    const s = document.createElement("style");
    s.id = "whv-styles";
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
      *,*::before,*::after{box-sizing:border-box;}body{margin:0;}
      @keyframes fadeUp  {from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideUp {from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:translateY(0)}}
      @keyframes rowIn   {from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
      @keyframes pulse   {0%,100%{opacity:1}50%{opacity:0.3}}
      @keyframes ticker  {0%{opacity:0;transform:translateY(8px)}12%{opacity:1;transform:translateY(0)}88%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-8px)}}
      @keyframes glow    {0%,100%{box-shadow:0 4px 16px rgba(26,122,74,0.3)}50%{box-shadow:0 4px 28px rgba(26,122,74,0.6)}}
      @keyframes urgPulse{0%,100%{background:#fff1f2}50%{background:#ffe4e6}}
      @keyframes reveal  {0%{filter:blur(5px);opacity:0.5}100%{filter:blur(0);opacity:1}}
      @keyframes vFlicker{0%,100%{opacity:1}50%{opacity:0.6}}
      @keyframes wallPop {0%{opacity:0;transform:scale(0.97)}100%{opacity:1;transform:scale(1)}}
      .chip{transition:all 0.15s;cursor:pointer;font-family:'DM Sans',sans-serif;}
      .chip:hover{border-color:#1a7a4a!important;background:#edf7f1!important;}
      .card{transition:border-color 0.3s,box-shadow 0.2s,transform 0.18s;}
      .card:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(0,0,0,0.09)!important;}
      .card-reveal{animation:reveal 0.55s ease forwards;border-color:#b8e0c8!important;}
      .pay-cta{animation:glow 2s infinite;transition:all 0.2s;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;}
      .pay-cta:hover:not(:disabled){transform:translateY(-2px);filter:brightness(1.07);}
      .sticky-bar{animation:slideUp 0.3s ease;}
      .blur-c{filter:blur(5px);user-select:none;pointer-events:none;}
      .unblur{animation:reveal 0.6s ease forwards;}
      .urgent{animation:urgPulse 1.5s infinite;}
      .vdot{animation:vFlicker 2s infinite;}
      .wall-pop{animation:wallPop 0.35s ease;}
      .city-input:focus{outline:none;border-color:#1a7a4a!important;box-shadow:0 0 0 3px rgba(26,122,74,0.1);}
      ::-webkit-scrollbar{width:0;}
    `;
    if (!document.getElementById("whv-styles")) document.head.appendChild(s);
    return () => document.getElementById("whv-styles")?.remove();
  }, []);

  useEffect(() => { const iv = setInterval(() => setTimer(t => t > 0 ? t - 1 : 899), 1000); return () => clearInterval(iv); }, []);
  useEffect(() => { const iv = setInterval(() => setReviewIdx(i => (i + 1) % REVIEWS.length), 4200); return () => clearInterval(iv); }, []);
  useEffect(() => { const iv = setInterval(() => setViewers(v => Math.max(8, Math.min(22, v + (Math.random() > 0.5 ? 1 : -1)))), 8000); return () => clearInterval(iv); }, []);

  useEffect(() => {
    if (timerStarted.current || paid) return;
    timerStarted.current = true;
    const t = setTimeout(() => { if (!paid) setShowSticky(true); }, 15000);
    return () => clearTimeout(t);
  }, [paid]);

  useEffect(() => {
    const fn = () => { if (!paid) setShowSticky(window.scrollY > 200); };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, [paid]);

  useEffect(() => {
    if (!paid) return;
    setShowSticky(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    sortedResults.forEach((_, i) => setTimeout(() => setRevealed(p => [...p, i]), i * 80));
  }, [paid]);

  useEffect(() => {
    if (!paid || cityInput.length < 2) { setSuggestions([]); return; }
    const q = cityInput.toLowerCase();
    setSuggestions(AU_CITIES.filter(c => c.toLowerCase().startsWith(q)).slice(0, 5));
  }, [cityInput, paid]);

  const baseResults = JOB_DATA.filter(j =>
    (!sector || j.sector === sector) &&
    (!stateF || j.state  === stateF)
  );

  const defaultSorted = [...baseResults].sort((a, b) => {
    const ss = (STATE_ORDER[a.state] ?? 99) - (STATE_ORDER[b.state] ?? 99);
    if (ss !== 0) return ss;
    return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
  });

  const sortedResults = cityCoords
    ? [...baseResults].sort((a, b) => {
        const ca = CITY_COORDS[a.city], cb = CITY_COORDS[b.city];
        if (!ca && !cb) return 0; if (!ca) return 1; if (!cb) return -1;
        return haversine(cityCoords.lat, cityCoords.lng, ca.lat, ca.lng)
             - haversine(cityCoords.lat, cityCoords.lng, cb.lat, cb.lng);
      })
    : defaultSorted;

  useEffect(() => {
    let cur = 0; const target = baseResults.length; setAnimCount(0);
    const iv = setInterval(() => { cur = Math.min(cur + 1, target); setAnimCount(cur); if (cur >= target) clearInterval(iv); }, 20);
    return () => clearInterval(iv);
  }, [sector, stateF]);

  const countBySector = SECTORS.reduce((acc, s) => {
    acc[s] = JOB_DATA.filter(j => j.sector === s && (!stateF || j.state === stateF)).length;
    return acc;
  }, {});

  const visible     = paid ? sortedResults : sortedResults.slice(0, FREE_LIMIT);
  const lockedCount = sortedResults.length - FREE_LIMIT;
  const totalLocked = JOB_DATA.length - FREE_LIMIT;
  const showWall    = !paid && lockedCount > 0;
  const zeroResult  = baseResults.length === 0;

  const handleSector    = (s)  => setSector(sector === s  ? null : s);
  const handleState     = (st) => setStateF(stateF === st ? null : st);
  const scrollToPaywall = ()   => paywallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const handlePay       = ()   => { setPaying(true); setTimeout(() => { setPaying(false); setPaid(true); }, 2000); };

  const selectCity = (city) => {
    setCityInput(city); setSuggestions([]);
    const c = KNOWN_COORDS[city]; if (c) setCityCoords(c);
  };

  const getDistLabel = (job) => {
    if (!cityCoords || !paid) return null;
    const c = CITY_COORDS[job.city]; if (!c) return null;
    return `${haversine(cityCoords.lat, cityCoords.lng, c.lat, c.lng)} km de ${cityInput}`;
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>

      {showSticky && !paid && (
        <div className="sticky-bar" style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(255,255,255,0.97)", borderTop: `1px solid ${C.border}`,
          padding: "10px 16px 16px", backdropFilter: "blur(12px)",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.11)",
        }}>
          <div style={{ maxWidth: 580, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.textMid }}>🔒 +{totalLocked} contacts cachés</span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, color: C.textFaint, textDecoration: "line-through" }}>29,90 $</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.green }}>14,90 $</span>
              </div>
            </div>
            <button className="pay-cta" onClick={handlePay} style={{
              width: "100%", padding: "13px", borderRadius: 12, background: C.green,
              color: "#fff", fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}>🦘 Accéder aux contacts — 14,90 $</button>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 6 }}>
              {["✅ Accès garanti", "⚡ Immédiat", `⏱ Expire ${fmtTimer(timer)}`].map(t => (
                <span key={t} style={{ fontSize: 9, color: C.textFaint }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: C.bgCard, borderBottom: `1px solid ${C.border}`,
        padding: "13px 18px", display: "flex", alignItems: "center", gap: 10,
        boxShadow: C.shadow, position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🦘</div>
        <div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: C.text }}>WHV Job Finder</div>
          <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.04em" }}>Contacts directs · 88 jours · Australie</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7 }}>
          {!paid && (
            <div className="urgent" style={{ fontSize: 11, color: C.red, fontWeight: 700, border: `1px solid #fecaca`, borderRadius: 7, padding: "3px 9px", display: "flex", alignItems: "center", gap: 4 }}>
              ⏱ {fmtTimer(timer)}
            </div>
          )}
          <div style={{ background: paid ? C.greenLight : C.redBg, border: `1px solid ${paid ? C.greenBorder : "#fecaca"}`, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: paid ? C.green : C.red }}>
            {paid ? "✓ Accès complet" : "2 résultats gratuits"}
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg,#1a7a4a 0%,#0a3d22 100%)", padding: "28px 18px 26px", textAlign: "center" }}>
        {!paid && (
          <div style={{ background: "rgba(220,38,38,0.85)", borderRadius: 9, padding: "7px 16px", marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11 }}>⚠️</span>
            <span style={{ fontSize: 11, color: "#fff", fontWeight: 700 }}>Chaque jour sans employeur = 1 jour de visa perdu</span>
          </div>
        )}
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 8 }}>
          Reste une 2ème année<br />
          <span style={{ fontStyle: "italic", fontWeight: 400, fontSize: 21, color: "rgba(255,255,255,0.8)" }}>en Australie</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Téléphone direct · Email recrutement · Zéro intermédiaire</div>
      </div>

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "0 14px 140px" }}>

        {paid && (
          <div style={{ paddingTop: 16, marginBottom: 14, animation: "fadeUp 0.4s ease" }}>
            <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: 7 }}>📍 Trier par proximité</div>
            <div style={{ position: "relative" }}>
              <input className="city-input" value={cityInput} onChange={e => setCityInput(e.target.value)}
                placeholder="Ta ville de départ… ex: Brisbane, Perth"
                style={{ width: "100%", padding: "10px 36px 10px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bgCard, fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: C.text }} />
              {cityInput && (
                <button onClick={() => { setCityInput(""); setCityCoords(null); setSuggestions([]); }}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", fontSize: 14, color: C.textFaint, cursor: "pointer" }}>✕</button>
              )}
              {suggestions.length > 0 && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: C.shadowLg, zIndex: 20, overflow: "hidden" }}>
                  {suggestions.map(city => (
                    <div key={city} onClick={() => selectCity(city)}
                      style={{ padding: "10px 14px", fontSize: 13, color: C.text, cursor: "pointer", borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bgMuted}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      📍 {city}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cityCoords && <div style={{ fontSize: 11, color: C.green, fontWeight: 600, marginTop: 6 }}>✓ Résultats triés du plus proche au plus loin de {cityInput}</div>}
          </div>
        )}

        <div style={{ paddingTop: paid ? 0 : 16, marginBottom: 12 }}>
          <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: 7 }}>Secteur</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SECTORS.map(s => {
              const active = sector === s;
              const n = countBySector[s];
              return (
                <button key={s} className="chip" onClick={() => handleSector(s)} style={{
                  padding: "7px 11px", borderRadius: 9,
                  border: `1.5px solid ${active ? C.green : C.border}`,
                  background: active ? C.green : C.bgCard,
                  color: active ? "#fff" : C.textMid,
                  fontSize: 12, fontWeight: 600,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  {SECTOR_ICONS[s]} {s}
                  {n > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, background: active ? "rgba(255,255,255,0.25)" : C.bgMuted, color: active ? "#fff" : C.textFaint, borderRadius: 5, padding: "1px 5px" }}>
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: C.textFaint, letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, marginBottom: 7 }}>État</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {STATES.map(st => (
              <button key={st} className="chip" onClick={() => handleState(st)} style={{
                padding: "6px 12px", borderRadius: 9,
                border: `1.5px solid ${stateF === st ? STATE_COLORS[st] : C.border}`,
                background: stateF === st ? STATE_COLORS[st] : C.bgCard,
                color: stateF === st ? "#fff" : C.textMid,
                fontSize: 12, fontWeight: 700,
              }}>{st}</button>
            ))}
          </div>
        </div>

        {!zeroResult && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, background: C.bgMuted, borderRadius: 10, padding: "9px 14px" }}>
            <span style={{ fontSize: 15 }}>📍</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>
              <span style={{ color: C.green, fontFamily: "'Playfair Display',serif", fontSize: 17 }}>{animCount}</span>
              {" "}employeur{animCount > 1 ? "s" : ""} trouvé{animCount > 1 ? "s" : ""}
            </span>
            <div style={{ flex: 1 }} />
            {!paid && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: C.textMid, fontWeight: 600 }}>
                <span className="vdot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "inline-block" }} />
                {viewers} consultent maintenant
              </div>
            )}
            {paid && cityCoords && <span style={{ fontSize: 10, color: C.green, fontWeight: 600 }}>📍 Trié par proximité</span>}
          </div>
        )}

        {zeroResult && (sector || stateF) && (
          <div style={{ textAlign: "center", padding: "36px 0", animation: "fadeUp 0.3s ease" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🔍</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, color: C.text, marginBottom: 6 }}>Aucun résultat pour cette combinaison</div>
            <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 16 }}>Retire un filtre pour voir plus d'employeurs</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {sector && <button onClick={() => setSector(null)} style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${C.green}`, background: C.greenLight, color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✕ Retirer « {sector} »</button>}
              {stateF && <button onClick={() => setStateF(null)} style={{ padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${C.green}`, background: C.greenLight, color: C.green, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}>✕ Retirer « {stateF} »</button>}
            </div>
          </div>
        )}

        {!zeroResult && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visible.map((job, i) => {
                const distLabel  = getDistLabel(job);
                const isRevealed = paid && revealed.includes(i);
                return (
                  <div key={job.name + i} className={`card${isRevealed ? " card-reveal" : ""}`}
                    style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 15px", boxShadow: C.shadow, animation: `rowIn 0.3s ease ${i * 0.06}s both` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {SECTOR_ICONS[job.sector] || "🏢"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.name}</span>
                          {job.isNew && (
                            <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: C.amber, borderRadius: 5, padding: "2px 5px", flexShrink: 0, letterSpacing: "0.04em" }}>NOUVEAU</span>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: C.textFaint, marginTop: 1 }}>
                          <span style={{ color: C.teal, fontWeight: 600 }}>{job.sector}</span> · éligible 88j
                        </div>
                      </div>
                      <div style={{ background: (STATE_COLORS[job.state] || "#888") + "22", border: `1px solid ${(STATE_COLORS[job.state] || "#888")}55`, borderRadius: 7, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: STATE_COLORS[job.state] || "#888", flexShrink: 0 }}>
                        {job.state}
                      </div>
                    </div>

                    <div style={{ background: C.bgMuted, borderRadius: 8, padding: "7px 10px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13 }}>📍</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent((job.city || job.address || job.name) + ", Australia")}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 600, color: C.green, textDecoration: "none" }}>
                          {job.city || "Australie"}
                        </a>
                        {job.address && <span style={{ fontSize: 11, color: C.textFaint }}> · {job.address}</span>}
                      </div>
                      {distLabel
                        ? <span style={{ fontSize: 10, color: C.green, fontWeight: 700, background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>{distLabel}</span>
                        : job.dist && <span style={{ fontSize: 10, color: C.teal, fontWeight: 500, flexShrink: 0 }}>{job.dist}</span>
                      }
                    </div>

                    <div style={{ paddingTop: 9, borderTop: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                        <span style={{ fontSize: 12, flexShrink: 0 }}>📞</span>
                        {paid
                          ? <a href={`tel:${(job.phone||"").replace(/\s/g, "")}`} className={isRevealed ? "unblur" : ""} style={{ fontSize: 12, color: C.green, fontWeight: 600, flex: 1, textDecoration: "none" }}>{job.phone || "—"}</a>
                          : <span className="blur-c" style={{ fontSize: 12, color: C.textMid, fontWeight: 500, flex: 1 }}>{(job.phone||"+61 x xxxx xxxx").slice(0, 7)}xxx xxxx</span>
                        }
                        {paid ? <CopyBtn text={job.phone || ""} /> : (
                          <button onClick={scrollToPaywall} style={{
                            display: "block", width: "100%", marginTop: 10,
                            padding: "11px", borderRadius: 10, border: "none",
                            background: C.green, color: "#fff",
                            fontSize: 13, fontWeight: 700, cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                          }}>🔒 Voir les contacts</button>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, flexShrink: 0 }}>✉️</span>
                        {paid
                          ? <a href={`mailto:${job.email}`} className={isRevealed ? "unblur" : ""} style={{ fontSize: 11, color: C.textMid, fontWeight: 500, flex: 1, textDecoration: "none", wordBreak: "break-all" }}>{job.email || "—"}</a>
                          : <span className="blur-c" style={{ fontSize: 11, color: C.textMid, fontWeight: 500, flex: 1 }}>{job.email ? job.email.slice(0, 2) + "xxxxx@" + job.email.split("@")[1] : "xxxxx@employer.com.au"}</span>
                        }
                        {paid && <CopyBtn text={job.email || ""} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {showWall && (
              <div className="wall-pop" style={{ marginTop: 10 }}>
                <div style={{ background: C.bgCard, border: `2px dashed ${C.greenBorder}`, borderRadius: 16, padding: "22px 20px", textAlign: "center", boxShadow: C.shadow }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>🔒</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 4 }}>
                    +{totalLocked} contacts cachés
                  </div>
                  <div style={{ fontSize: 13, color: C.textFaint, marginBottom: 18 }}>
                    Téléphone direct + email pour chaque employeur
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 13, color: C.textFaint, textDecoration: "line-through" }}>29,90 $</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: C.green }}>14,90 $</span>
                    <span style={{ fontSize: 10, color: "#fff", background: C.red, borderRadius: 5, padding: "2px 6px", fontWeight: 700 }}>−50%</span>
                  </div>
                  <button className="pay-cta" onClick={scrollToPaywall} style={{ width: "100%", padding: "15px", borderRadius: 13, background: C.green, color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    🦘 Accéder aux {totalLocked} contacts — 14,90 $
                  </button>
                </div>
              </div>
            )}

            {showWall && (
              <div ref={paywallRef} style={{ marginTop: 14, animation: "fadeUp 0.4s ease" }}>
                <div style={{ background: C.bgCard, border: `2px solid ${C.greenBorder}`, borderRadius: 20, overflow: "hidden", boxShadow: C.shadowLg }}>
                  <div style={{ background: C.red, padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                    <span style={{ fontSize: 12 }}>⚠️</span>
                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>Chaque jour sans employeur = 1 jour de visa perdu</span>
                  </div>
                  <div style={{ padding: "20px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.redBg, border: `1px solid #fecaca`, borderRadius: 20, padding: "5px 12px", marginBottom: 14, fontSize: 11, color: C.red, fontWeight: 600 }}>
                      <span className="vdot" style={{ width: 6, height: 6, borderRadius: "50%", background: C.red, display: "inline-block" }} />
                      {viewers} backpackers consultent cette liste maintenant
                    </div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 21, fontWeight: 700, color: C.text, marginBottom: 4 }}>Ne cherche pas pendant 3 semaines.</div>
                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontStyle: "italic", color: C.green, marginBottom: 14 }}>Trouve ce soir.</div>

                    <div key={reviewIdx} style={{ background: C.bgMuted, borderRadius: 12, padding: "11px 14px", marginBottom: 14, animation: "ticker 4.2s ease", textAlign: "left" }}>
                      <div style={{ display: "flex", marginBottom: 4 }}>{[0,1,2,3,4].map(i => <span key={i} style={{ fontSize: 12, color: "#f59e0b" }}>★</span>)}</div>
                      <div style={{ fontSize: 12, color: C.text, fontStyle: "italic", marginBottom: 4 }}>"{REVIEWS[reviewIdx].text}"</div>
                      <div style={{ fontSize: 10, color: C.textFaint, fontWeight: 600 }}>{REVIEWS[reviewIdx].flag} {REVIEWS[reviewIdx].name} · WHV 2024</div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, color: C.textFaint, textDecoration: "line-through" }}>29,90 $</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: C.green, lineHeight: 1 }}>14,90 $</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 10 }}>Accès à vie · Paiement unique</div>

                    <div className="urgent" style={{ border: `1px solid #fecaca`, borderRadius: 9, padding: "8px 14px", fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 14 }}>
                      ⏱ Offre −50% expire dans <strong>{fmtTimer(timer)}</strong>
                    </div>

                    <button className="pay-cta" onClick={handlePay} disabled={paying} style={{ width: "100%", padding: "15px", borderRadius: 13, background: paying ? C.bgMuted : C.green, color: paying ? C.textMid : "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {paying ? <><span style={{ animation: "pulse 1s infinite" }}>⏳</span> Paiement en cours…</> : <><span>🦘</span> Accéder aux contacts — 14,90 $</>}
                    </button>

                    <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 10, flexWrap: "wrap" }}>
                      {["🔐 Sécurisé", "⚡ Accès immédiat", "✅ Accès garanti"].map(t => (
                        <span key={t} style={{ fontSize: 10, color: C.textFaint }}>{t}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: C.textMid, fontWeight: 500 }}>
                      🔥 <strong style={{ color: C.text }}>47 backpackers</strong> ont débloqué cette semaine
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paid && (
              <div style={{ textAlign: "center", padding: "20px 0 4px", animation: "fadeUp 0.5s ease" }}>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontStyle: "italic", color: C.green }}>
                  🎉 {sortedResults.length} employeurs débloqués — bonne chance pour tes 88 jours !
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
