import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { JOB_DATA } from "../data/JOB_DATA_FINAL";


const fmt  = (v) => `$${Number(v).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtN = (v) => Number(v).toLocaleString("en-AU",{minimumFractionDigits:1,maximumFractionDigits:1});
const pn   = (s="") => Math.abs(parseFloat(String(s).replace(/[$,\s]/g,""))||0);

// ── Traductions FR / EN ───────────────────────────────────────────────────────
// Toutes les chaînes affichées dans l'interface sont ici.
// Pour ajouter une langue, il suffit d'ajouter une clé (ex: "de" pour allemand).
const LANG = {
  fr: {
    tagline: "Compte tes jours, vis ta run · Australia",
    active: "● Actif",
    saved: "💾 Sauvegardé",
    apiConfigured: "Clé API configurée — parser IA actif",
    apiEdit: "Modifier",
    apiHide: "Masquer",
    apiRequired: "Clé API Anthropic requise pour analyser les fiches",
    apiSave: "Sauvegarder",
    apiLink: "Obtiens ta clé sur",
    apiLinkSuffix: "→ API Keys",
    fiscalYear: "Année fiscale",
    weeksLeft: "sem. restantes",
    visaReady: "🏁 Visa prêt — Félicitations !",
    scanTitle: "Analyse IA en cours…",
    scanSub: "WORKING HOLIDAY VISA · AUS",
    scanDays: "de visa farm",
    scanAnalyse: "Claude analyse ta fiche…",
    dropFirst: "Dépose ta première fiche de paie",
    dropBrowse: "Appuie pour parcourir",
    dropEmpty: "Aucune fiche importée pour l'instant",
    history: "Historique",
    sheet: "fiche",
    sheets: "fiches",
    daysAccum: "jours cumulés",
    addSheet: "Ajouter une fiche",
    browse: "Parcourir",
    hoursWeek: "h/sem",
    missingHours: "Heures manquantes",
    edit: "Modifier",
    delete: "Supprimer",
    gross: "brut",
    tax: "tax",
    tapToEnter: "Toucher pour saisir",
    scanDone: "Scan terminé",
    detected: "Nous avons détecté",
    visaDays: "jours de visa farm",
    workedOn: "travaillées sur",
    days: "jours",
    onlyFull: "L'immigration ne compte que les jours complets",
    counted: "comptés",
    deductWarn: "Déductions détectées",
    deductMsg: "Le net ({net}) est inférieur à 50% du brut ({gross}).",
    deductShort: "Net inférieur à 50% du brut — déductions ferme probables.",
    missingHoursHint: "⏱ Heures non détectées — touchez le champ ci-dessous pour saisir",
    labelGross: "Salaire Brut",
    labelNet: "Salaire Net",
    labelTax: "Tax PAYG",
    labelSuper: "Superannuation",
    labelHours: "Heures travaillées",
    labelPeriod: "Durée période",
    labelDate: "Période",
    labelEmployer: "Employeur",
    labelABN: "ABN",
    abnValid: "✓ Valide",
    abnInvalid: "✗ Incorrect",
    missing: "manquant",
    missings: "manquants",
    ignore: "Ignorer",
    details: "+ Détails",
    confirm: "Confirmer ✓",
    save: "Sauvegarder ✓",
    back: "← Retour",
    cancel: "Annuler",
    editSheet: "Modifier la fiche",
    allData: "Toutes les données",
    counting88: "Comptage 88 Jours",
    weekShort: [["7","1 sem"],["14","2 sem"],["30","1 mois"]],
    toastApiSaved: "Clé API sauvegardée ✓",
    toastDeleted: "Fiche supprimée.",
    toastIgnored: "Fiche ignorée.",
    toastUpdated: "Fiche mise à jour ✓",
    toastNoApi: "Configure ta clé API Anthropic d'abord ↑",
    statGross: "Total Brut",
    statNet: "Net Perçu",
    statTax: "Tax Payée",
    statSuper: "Superannuation",
    months: ["jan","fév","mar","avr","mai","jun","jul","aoû","sep","oct","nov","déc"],
  },
  en: {
    tagline: "Count your days, live your run · Australia",
    active: "● Active",
    saved: "💾 Saved",
    apiConfigured: "API key configured — AI parser active",
    apiEdit: "Edit",
    apiHide: "Hide",
    apiRequired: "Anthropic API key required to analyse payslips",
    apiSave: "Save",
    apiLink: "Get your key at",
    apiLinkSuffix: "→ API Keys",
    fiscalYear: "Financial year",
    weeksLeft: "wks left",
    visaReady: "🏁 Visa ready — Congratulations!",
    scanTitle: "AI analysis in progress…",
    scanSub: "WORKING HOLIDAY VISA · AUS",
    scanDays: "visa farm days",
    scanAnalyse: "Claude is analysing your payslip…",
    dropFirst: "Drop your first payslip here",
    dropBrowse: "Tap to browse",
    dropEmpty: "No payslips imported yet",
    history: "History",
    sheet: "payslip",
    sheets: "payslips",
    daysAccum: "days accumulated",
    addSheet: "Add a payslip",
    browse: "Browse",
    hoursWeek: "h/wk",
    missingHours: "Hours missing",
    edit: "Edit",
    delete: "Delete",
    gross: "gross",
    tax: "tax",
    tapToEnter: "Tap to enter",
    scanDone: "Scan complete",
    detected: "We detected",
    visaDays: "visa farm days",
    workedOn: "worked over",
    days: "days",
    onlyFull: "Immigration counts full days only",
    counted: "counted",
    deductWarn: "Deductions detected",
    deductMsg: "Net ({net}) is less than 50% of gross ({gross}).",
    deductShort: "Net less than 50% of gross — farm deductions likely.",
    missingHoursHint: "⏱ Hours not detected — tap the field below to enter",
    labelGross: "Gross Pay",
    labelNet: "Net Pay",
    labelTax: "PAYG Tax",
    labelSuper: "Superannuation",
    labelHours: "Hours worked",
    labelPeriod: "Period length",
    labelDate: "Period",
    labelEmployer: "Employer",
    labelABN: "ABN",
    abnValid: "✓ Valid",
    abnInvalid: "✗ Invalid",
    missing: "missing",
    missings: "missing",
    ignore: "Ignore",
    details: "+ Details",
    confirm: "Confirm ✓",
    save: "Save ✓",
    back: "← Back",
    cancel: "Cancel",
    editSheet: "Edit payslip",
    allData: "All data",
    counting88: "88-Day Count",
    weekShort: [["7","1 wk"],["14","2 wks"],["30","1 mo"]],
    toastApiSaved: "API key saved ✓",
    toastDeleted: "Payslip deleted.",
    toastIgnored: "Payslip ignored.",
    toastUpdated: "Payslip updated ✓",
    toastNoApi: "Configure your Anthropic API key first ↑",
    statGross: "Total Gross",
    statNet: "Net Received",
    statTax: "Tax Paid",
    statSuper: "Superannuation",
    months: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  },
  es: {
    tagline: "Cuenta tus días, vive tu run · Australia",
    active: "● Activo",
    saved: "💾 Guardado",
    apiConfigured: "Clave API configurada — parser IA activo",
    apiEdit: "Editar",
    apiHide: "Ocultar",
    apiRequired: "Se necesita clave API de Anthropic para analizar los recibos",
    apiSave: "Guardar",
    apiLink: "Obtén tu clave en",
    apiLinkSuffix: "→ API Keys",
    fiscalYear: "Año fiscal",
    weeksLeft: "sem. restantes",
    visaReady: "🏁 ¡Visa lista — Felicitaciones!",
    scanTitle: "Análisis IA en curso…",
    scanSub: "WORKING HOLIDAY VISA · AUS",
    scanDays: "días de visa farm",
    scanAnalyse: "Claude está analizando tu recibo…",
    dropFirst: "Suelta tu primer recibo de pago aquí",
    dropBrowse: "Toca para buscar",
    dropEmpty: "Ningún recibo importado aún",
    history: "Historial",
    sheet: "recibo",
    sheets: "recibos",
    daysAccum: "días acumulados",
    addSheet: "Añadir un recibo",
    browse: "Buscar",
    hoursWeek: "h/sem",
    missingHours: "Horas faltantes",
    edit: "Editar",
    delete: "Eliminar",
    gross: "bruto",
    tax: "impuesto",
    tapToEnter: "Toca para ingresar",
    scanDone: "Escaneo completo",
    detected: "Detectamos",
    visaDays: "días de visa farm",
    workedOn: "trabajadas en",
    days: "días",
    onlyFull: "Inmigración solo cuenta días completos",
    counted: "contados",
    deductWarn: "Deducciones detectadas",
    deductMsg: "El neto ({net}) es menos del 50% del bruto ({gross}).",
    deductShort: "Neto menor al 50% del bruto — deducciones de granja probables.",
    missingHoursHint: "⏱ Horas no detectadas — toca el campo de abajo para ingresar",
    labelGross: "Salario Bruto",
    labelNet: "Salario Neto",
    labelTax: "Impuesto PAYG",
    labelSuper: "Superannuation",
    labelHours: "Horas trabajadas",
    labelPeriod: "Duración período",
    labelDate: "Período",
    labelEmployer: "Empleador",
    labelABN: "ABN",
    abnValid: "✓ Válido",
    abnInvalid: "✗ Incorrecto",
    missing: "faltante",
    missings: "faltantes",
    ignore: "Ignorar",
    details: "+ Detalles",
    confirm: "Confirmar ✓",
    save: "Guardar ✓",
    back: "← Volver",
    cancel: "Cancelar",
    editSheet: "Editar recibo",
    allData: "Todos los datos",
    counting88: "Conteo 88 Días",
    weekShort: [["7","1 sem"],["14","2 sem"],["30","1 mes"]],
    toastApiSaved: "Clave API guardada ✓",
    toastDeleted: "Recibo eliminado.",
    toastIgnored: "Recibo ignorado.",
    toastUpdated: "Recibo actualizado ✓",
    toastNoApi: "Configura tu clave API de Anthropic primero ↑",
    statGross: "Total Bruto",
    statNet: "Neto Recibido",
    statTax: "Impuesto Pagado",
    statSuper: "Superannuation",
    months: ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"],
  },
};

const STORAGE_KEY = "visarun_entries_v1";
const GOAL_KEY    = "visarun_goal_v1";
const API_KEY_STORAGE = "visarun_apikey_v1";

// window.storage est l'API de stockage de Claude.ai (persiste entre sessions)
// Si non disponible, on retombe sur localStorage, puis sur rien (mémoire seule)
async function storageGet(key){
  try{if(window.storage){const r=await window.storage.get(key);return r?r.value:null;}
  return localStorage.getItem(key);}catch{try{return localStorage.getItem(key);}catch{return null;}}
}
async function storageSet(key,val){
  try{if(window.storage){await window.storage.set(key,val);return;}
  localStorage.setItem(key,val);}catch{try{localStorage.setItem(key,val);}catch{}}
}

async function loadEntries(){try{const r=await storageGet(STORAGE_KEY);return r?JSON.parse(r):[]}catch{return[]}}
async function saveEntries(e){await storageSet(STORAGE_KEY,JSON.stringify(e))}
async function loadGoal(){try{const r=await storageGet(GOAL_KEY);return r?Number(r):88}catch{return 88}}
async function saveGoal(g){await storageSet(GOAL_KEY,String(g))}
async function loadApiKey(){try{return await storageGet(API_KEY_STORAGE)||""}catch{return""}}
async function saveApiKey(k){await storageSet(API_KEY_STORAGE,k)}

const pdfReadyPromise = new Promise((res) => {
  if (typeof window === "undefined") return res(false);
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  s.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js"; res(true); };
  s.onerror = () => res(false);
  document.head.appendChild(s);
});

async function extractText(file) {
  await pdfReadyPromise;
  if (!window.pdfjsLib) return "";
  try {
    const pdf = await window.pdfjsLib.getDocument({data: await file.arrayBuffer()}).promise;
    let out = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const ct = await (await pdf.getPage(i)).getTextContent();
      const items = ct.items.slice().sort((a,b) => { const dy=Math.round(b.transform[5])-Math.round(a.transform[5]); return dy||a.transform[4]-b.transform[4]; });
      const map = new Map();
      for (const it of items) { const y=Math.round(it.transform[5]/3)*3; if(!map.has(y))map.set(y,[]); map.get(y).push(it.str); }
      for (const [,w] of [...map.entries()].sort((a,b)=>b[0]-a[0])) out+=w.join(" ").trim()+"\n";
    }
    return out;
  } catch(e) { return ""; }
}

// Guard NaN/Infinity : si période = 0 ou heures manquantes, retourne 0 (Bug #3 corrigé)
function calcVisaDays(hours,pDays){ if(!hours||!pDays||isNaN(hours)||isNaN(pDays))return 0; const r=Math.min((hours/(pDays*5))*pDays,pDays); return isNaN(r)||!isFinite(r)?0:r; }
function dateDiff(from,to){ if(!from||!to)return 0; const p=d=>{const[dd,mm,yy]=d.split("/");return new Date(yy+"-"+mm.padStart(2,"0")+"-"+dd.padStart(2,"0"));}; return Math.round(Math.abs(p(to)-p(from))/86400000)+1; }
function validateABN(abn){ const d=String(abn).replace(/\s/g,""); if(!/^\d{11}$/.test(d))return false; const w=[10,1,3,5,7,9,11,13,15,17,19]; return w.reduce((s,wt,i)=>s+wt*(i===0?Number(d[i])-1:Number(d[i])),0)%89===0; }

// ── Parser IA ─────────────────────────────────────────────────────────────────
// Remplace les 100 lignes de regex par un appel à Claude Haiku
// Claude comprend n'importe quel format de fiche sans règles codées en dur
async function processDocumentAI(rawText) {
  // Prompt v2 — testé sur 30 formats australiens (Xero, MYOB, Employment Hero,
  // KeyPay, Payroller, QuickBooks, piecework, labour hire…) — score 100%
  const prompt = `You are an expert at extracting data from Australian payslips. Extract the following fields and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

PAYSLIP TEXT:
---
${rawText.slice(0, 6000)}
---

Return exactly this JSON structure:
{
  "gross": 0,
  "net": 0,
  "tax": 0,
  "super": 0,
  "hoursWorked": 0,
  "periodFrom": "",
  "periodTo": "",
  "employer": "",
  "name": "",
  "abn": ""
}

EXTRACTION RULES:

gross — Total earnings BEFORE any deductions. Look for: "Gross Pay", "Total Earnings", "Gross Wages", "Total Gross". For piecework payslips (bins, trays, kg), sum all piece-rate lines. Must be > net.

net — Amount actually paid to employee AFTER all deductions. Look for: "Net Pay", "Net Wages", "Amount Paid", "Take Home Pay". IMPORTANT: farm accommodation/meals deducted from net are normal — do NOT add them back to net.

tax — PAYG Withholding only. Look for: "PAYG Withholding", "PAYG Tax", "Income Tax Withheld", "Tax Withheld". Do NOT include super or any other deductions.

super — Employer superannuation guarantee contribution. Look for: "Superannuation Guarantee", "SGC", "Employer Super", "Super Contribution". Usually 11% of gross — NOT deducted from gross.

hoursWorked — SUM of ALL worked hours: ordinary + overtime + casual + weekend + Saturday + Sunday + public holiday. For piecework with no hours listed, set to 0.

periodFrom / periodTo — Pay period dates in DD/MM/YYYY format. If only "Period Ending" found, calculate start = end minus 13 days. If month name used (e.g. "1 June 2024"), convert to DD/MM/YYYY.

employer — Company name of the employer (not the employee).

name — Full name of the employee.

abn — Employer ABN: 11 digits, no spaces, no dashes.

FALLBACK: If any numeric field not found, use 0. If any text field not found, use "".
NEVER include $ symbols or commas in numbers — plain decimals only (e.g. 1234.56).`;

  const response = await fetch("/api/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(()=>({}));
    throw new Error(err?.error?.message || `Erreur API ${response.status}`);
  }

  const data = await response.json();
  const text = data.content.map(b => b.text || "").join("").trim();
  // Robuste : retire les balises markdown puis extrait le bloc JSON
  // même si Claude Haiku ajoute du texte avant ou après (Bug #5 corrigé)
  const stripped = text.replace(/```json|```/g, "").trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse IA invalide — aucun JSON trouvé");
  const parsed = JSON.parse(jsonMatch[0]);

  const pDays = dateDiff(parsed.periodFrom, parsed.periodTo);
  const farmDays = calcVisaDays(parsed.hoursWorked || 0, pDays);
  const date = parsed.periodFrom && parsed.periodTo ? parsed.periodFrom + " – " + parsed.periodTo : "";
  const deductionWarning = (parsed.gross||0) > 0 && (parsed.net||0) > 0 && (parsed.net||0) < (parsed.gross||0) * 0.5;

  return {
    gross: parsed.gross || 0,
    net: parsed.net || 0,
    tax: parsed.tax || 0,
    super: parsed.super || 0,
    hoursWorked: parsed.hoursWorked || 0,
    periodFrom: parsed.periodFrom || "",
    periodTo: parsed.periodTo || "",
    periodDays: pDays,
    employer: parsed.employer || "Unknown Employer",
    name: parsed.name || "Employee",
    abn: (parsed.abn || "").replace(/\s/g, ""),
    date,
    farmDays,
    deductionWarning,
    valid: (parsed.gross || 0) > 0 || (parsed.net || 0) > 0
  };
}

// ── Vision IA — pour les captures d'écran et photos de payslip ───────────────
// Encode l'image en base64 et l'envoie directement à Claude Vision
// Même prompt que le parser texte — Claude lit l'image comme un humain
async function processImageAI(file) {
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
  const mediaType = file.type || "image/jpeg";
  const prompt = `You are an expert at extracting data from Australian payslips. Extract the following fields from this payslip image and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

Return exactly this JSON structure:
{
  "gross": 0,
  "net": 0,
  "tax": 0,
  "super": 0,
  "hoursWorked": 0,
  "periodFrom": "",
  "periodTo": "",
  "employer": "",
  "name": "",
  "abn": ""
}

EXTRACTION RULES:
gross — Total earnings BEFORE deductions. Look for: "Gross Pay", "Total Earnings", "Gross Wages". Must be > net.
net — Amount paid to employee AFTER all deductions. Look for: "Net Pay", "Amount Paid", "Take Home Pay".
tax — PAYG Withholding only. Look for: "PAYG Withholding", "PAYG Tax", "Tax Withheld".
super — Employer superannuation. Look for: "Superannuation Guarantee", "SGC", "Employer Super". Usually ~11% of gross.
hoursWorked — SUM of ALL worked hours across all lines. For piecework with no hours, set to 0.
periodFrom / periodTo — Pay period dates in DD/MM/YYYY format.
employer — Company name of the employer.
name — Full name of the employee.
abn — Employer ABN: 11 digits, no spaces.
NEVER include $ symbols or commas — plain decimals only (e.g. 1234.56).`;

  const response = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 }},
        { type: "text", text: prompt }
      ]}]
    })
  });
  if (!response.ok) {
    const err = await response.json().catch(()=>({}));
    throw new Error(err?.error?.message || `API Error ${response.status}`);
  }
  const data = await response.json();
  const text = data.content.map(b => b.text || "").join("").trim();
  const stripped = text.replace(/```json|```/g, "").trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response — no JSON found");
  const parsed = JSON.parse(jsonMatch[0]);
  const pDays = dateDiff(parsed.periodFrom, parsed.periodTo);
  const farmDays = calcVisaDays(parsed.hoursWorked || 0, pDays);
  const date = parsed.periodFrom && parsed.periodTo ? parsed.periodFrom + " – " + parsed.periodTo : "";
  const deductionWarning = (parsed.gross||0) > 0 && (parsed.net||0) > 0 && (parsed.net||0) < (parsed.gross||0) * 0.5;
  return {
    gross: parsed.gross || 0, net: parsed.net || 0, tax: parsed.tax || 0, super: parsed.super || 0,
    hoursWorked: parsed.hoursWorked || 0, periodFrom: parsed.periodFrom || "", periodTo: parsed.periodTo || "",
    periodDays: pDays, employer: parsed.employer || "Unknown Employer", name: parsed.name || "Employee",
    abn: (parsed.abn || "").replace(/\s/g, ""), date, farmDays, deductionWarning,
    valid: (parsed.gross || 0) > 0 || (parsed.net || 0) > 0
  };
}

// ── Confettis milestone ──────────────────────────────────────────────────────
// Déclenché quand l'user atteint 25j, 50j, 88j ou 179j
// Canvas overlay fullscreen, auto-détruit après 3s
function ConfettiCelebration({milestone, onDone}){
  const canvasRef = useRef();
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const COLORS = ["#1a7a4a","#34d399","#0d9488","#f97316","#fbbf24","#a3e635","#60a5fa","#f472b6"];
    const particles = Array.from({length:120},()=>({
      x: Math.random()*canvas.width,
      y: -20 - Math.random()*100,
      w: 6 + Math.random()*8,
      h: 10 + Math.random()*14,
      color: COLORS[Math.floor(Math.random()*COLORS.length)],
      rotation: Math.random()*360,
      vx: (Math.random()-0.5)*4,
      vy: 3 + Math.random()*5,
      vr: (Math.random()-0.5)*8,
    }));
    let frame, start = Date.now();
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const elapsed = Date.now()-start;
      particles.forEach(p=>{
        p.x += p.vx; p.y += p.vy; p.rotation += p.vr;
        p.vy += 0.08; // gravité légère
        ctx.save();
        ctx.translate(p.x+p.w/2, p.y+p.h/2);
        ctx.rotate(p.rotation*Math.PI/180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1-(elapsed-2000)/1000);
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
        ctx.restore();
      });
      if(elapsed < 3000) frame = requestAnimationFrame(draw);
      else { onDone(); }
    };
    frame = requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(frame);
  },[]);
  const msg = milestone>=179?"🏆 3rd year unlocked!":milestone>=88?"🏁 Visa ready!":milestone>=50?"🔥 Halfway there!":"⭐ "+milestone+" days!";
  return(
    <div style={{position:"fixed",inset:0,zIndex:500,pointerEvents:"none"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0}}/>
      <div style={{position:"absolute",top:"35%",left:"50%",transform:"translateX(-50%)",textAlign:"center",animation:"milestonePopIn 0.5s cubic-bezier(.34,1.56,.64,1) both",pointerEvents:"none"}}>
        <div style={{fontSize:64,lineHeight:1,marginBottom:12}}>🦘</div>
        <div style={{background:"#fff",borderRadius:20,padding:"16px 32px",boxShadow:"0 8px 40px rgba(0,0,0,0.15)",border:"2px solid #b8e0c8"}}>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#1a7a4a",lineHeight:1.2}}>{msg}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"#5a5850",marginTop:6}}>{milestone} days of specified work ✓</div>
        </div>
      </div>
    </div>
  );
}

const C={bg:"#f5f3ee",bgCard:"#ffffff",bgMuted:"#f0ede6",border:"#e8e3d9",borderDark:"#d4cfc4",text:"#1a1a18",textMid:"#5a5850",textFaint:"#9a9488",green:"#1a7a4a",greenBg:"#edf7f1",greenBorder:"#b8e0c8",teal:"#0d9488",amber:"#b45309",amberBg:"#fef9ec",red:"#dc2626",redBg:"#fef2f2",shadow:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",shadowMd:"0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)"};

const CSS=`
  *{box-sizing:border-box;}body{margin:0;background:${C.bg};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes rowIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
  @keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  @keyframes numberUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes rooBounce{0%{transform:translateY(0)}25%{transform:translateY(-14px) scaleX(1.1)}50%{transform:translateY(0)}75%{transform:translateY(-8px)}100%{transform:translateY(0)}}
  @keyframes savedPop{0%{opacity:0;transform:scale(0.8)}50%{opacity:1;transform:scale(1.05)}100%{opacity:1;transform:scale(1)}}
  .drop-zone{transition:border-color 0.2s,background 0.2s;}
  .drop-zone:hover,.drop-zone.drag-over{border-color:${C.green}!important;background:${C.greenBg}!important;}
  .drop-zone:hover .upload-icon{transform:translateY(-4px);}
  .upload-icon{transition:transform 0.3s ease;}
  .stat-card{transition:transform 0.15s,box-shadow 0.15s;}
  .stat-card:hover{transform:translateY(-2px);box-shadow:${C.shadowMd};}
  .entry-card{transition:border-color 0.2s,box-shadow 0.2s;}
  .entry-card:hover{border-color:${C.borderDark};box-shadow:${C.shadowMd};}
  .btn-danger:hover{background:${C.redBg}!important;color:${C.red}!important;border-color:${C.red}!important;}
  .btn-edit:hover{background:${C.greenBg}!important;color:${C.green}!important;border-color:${C.green}!important;}
  .period-btn:hover{background:${C.greenBg}!important;border-color:${C.green}!important;color:${C.green}!important;}
  input:focus{outline:none;border-color:${C.teal}!important;box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
  .timeline-dot{transition:transform 0.2s;}
  .entry-card:hover .timeline-dot{transform:scale(1.4);}
  .api-key-input:focus{outline:none;border-color:${C.teal}!important;box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
`;

function ScanOverlay({draft,t}){
  const[scanPct,setScanPct]=useState(0);
  const rows=draft?[
    {label:t.labelEmployer,value:draft.employer&&draft.employer!=="Unknown Employer"?draft.employer:"—",y:16},
    {label:t.labelDate,value:draft.date||"—",y:32},
    {label:t.labelGross,value:draft.gross>0?fmt(draft.gross):"—",y:50},
    {label:t.labelHours,value:draft.hoursWorked>0?`${draft.hoursWorked}h`:"—",y:66},
    {label:"Visa days",value:draft.farmDays>0?`+${fmtN(draft.farmDays)}j`:"—",y:82,highlight:true},
  ]:[];
  useEffect(()=>{const start=Date.now(),dur=2200;const tick=()=>{const p=Math.min((Date.now()-start)/dur*100,100);setScanPct(p);if(p<100)requestAnimationFrame(tick);};requestAnimationFrame(tick);},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(245,243,238,0.97)",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"}}>
      <div style={{width:"min(300px,84vw)",background:C.bgCard,borderRadius:18,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{background:C.green,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#fff",fontStyle:"italic"}}>{t.scanTitle}</div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"rgba(255,255,255,0.6)",marginTop:1,letterSpacing:"0.06em"}}>{t.scanSub}</div></div>
          <div style={{fontSize:24}}>🦘</div>
        </div>
        <div style={{position:"relative",padding:"16px 18px 18px",minHeight:180}}>
          <div style={{position:"absolute",left:0,right:0,height:2,zIndex:10,background:`linear-gradient(90deg,transparent,${C.teal} 30%,${C.teal} 70%,transparent)`,boxShadow:`0 0 14px ${C.teal}`,top:`${scanPct}%`}}/>
          {rows.map((row,i)=>{const shown=scanPct>=row.y;return(
            <div key={i} style={{marginBottom:row.highlight?0:12}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:8,color:C.textFaint,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:600,marginBottom:2}}>{row.label}</div>
              {row.highlight?(
                <div style={{marginTop:4,background:shown?C.greenBg:C.bgMuted,border:`1.5px solid ${shown?C.greenBorder:C.border}`,borderRadius:10,padding:"8px 14px",display:"flex",alignItems:"baseline",gap:8,transition:"background 0.4s ease,border-color 0.4s ease"}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:26,fontWeight:700,color:shown?C.green:C.textFaint,transition:"color 0.4s ease",opacity:shown?1:0.3}}>{row.value}</span>
                  {shown&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green,fontWeight:600}}>{t.scanDays}</span>}
                </div>
              ):(
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:i===2?15:12,fontWeight:i===2?700:500,color:shown?(i===2?C.text:C.textMid):"transparent",background:shown?"transparent":C.bgMuted,borderRadius:shown?0:4,height:shown?"auto":10,transition:"color 0.3s ease,background 0.3s ease",minWidth:shown?0:(i%2===0?"65%":"45%")}}>{shown?row.value:""}</div>
              )}
            </div>
          );})}
        </div>
      </div>
      <div style={{marginTop:16,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,letterSpacing:"0.06em",animation:"pulse 1.5s ease infinite"}}>{t.scanAnalyse}</div>
    </div>
  );
}

// ── Bannière clé API ──────────────────────────────────────────────────────────
// Affiché si aucune clé API n'est configurée — sans clé, l'IA ne peut pas fonctionner
function ApiKeyBanner({apiKey, onSave, t}){
  const[val,setVal]=useState(apiKey||"");
  const[show,setShow]=useState(false);
  const hasKey=apiKey&&apiKey.startsWith("sk-ant-");
  return(
    <div style={{background:hasKey?C.greenBg:C.amberBg,borderBottom:`1px solid ${hasKey?C.greenBorder:"#fde68a"}`,padding:"10px 20px"}}>
      {hasKey?(
        <div style={{display:"flex",alignItems:"center",gap:10,maxWidth:600,margin:"0 auto"}}>
          <span style={{fontSize:14}}>🔑</span>
          <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green,fontWeight:600}}>{t.apiConfigured}</span>
          <button onClick={()=>setShow(p=>!p)} style={{marginLeft:"auto",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,background:"transparent",border:"none",cursor:"pointer",textDecoration:"underline"}}>{show?t.apiHide:t.apiEdit}</button>
        </div>
      ):(
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:14}}>⚠️</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.amber,fontWeight:600}}>{t.apiRequired}</span>
          </div>
        </div>
      )}
      {(!hasKey||show)&&(
        <div style={{maxWidth:600,margin:"0 auto",marginTop:hasKey?8:0,display:"flex",gap:8}}>
          <input
            className="api-key-input"
            type={show?"text":"password"}
            value={val}
            onChange={e=>setVal(e.target.value)}
            placeholder="sk-ant-api03-..."
            style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:12,padding:"8px 12px",borderRadius:8,border:`1.5px solid ${C.border}`,background:"#fff",color:C.text}}
          />
          <button
            onClick={()=>{if(val.trim()){onSave(val.trim());setShow(false);}}}
            style={{padding:"8px 16px",borderRadius:8,border:"none",background:C.green,color:"#fff",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer"}}
          >{t.apiSave}</button>
        </div>
      )}
      {!hasKey&&<div style={{maxWidth:600,margin:"4px auto 0",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint}}>{t.apiLink} <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{color:C.teal}}>console.anthropic.com</a> {t.apiLinkSuffix}</div>}
    </div>
  );
}

function FiscalBanner({t}){
  const now=new Date();
  const isSecondHalf=now.getMonth()>=6;
  const fyStartYear=isSecondHalf?now.getFullYear():now.getFullYear()-1;
  const fyEndYear=fyStartYear+1;
  const fyStart=new Date(fyStartYear,6,1),fyEnd=new Date(fyEndYear,5,30);
  const fmtShort=d=>`${t.months[d.getMonth()]} ${d.getFullYear()}`;
  const pct=Math.min((Math.max(now-fyStart,0))/(fyEnd-fyStart),1);
  return(
    <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border}`,padding:"7px 20px",display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:13}}>📅</span>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>{t.fiscalYear} {fyStartYear}–{fyEndYear}</span>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,whiteSpace:"nowrap"}}>{fmtShort(fyStart)} → {fmtShort(fyEnd)}</span>
      <div style={{flex:1,height:4,background:C.border,borderRadius:99,overflow:"hidden",minWidth:40}}>
        <div style={{height:"100%",width:`${pct*100}%`,background:`linear-gradient(90deg,${C.teal},#34d399)`,borderRadius:99}}/>
      </div>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,fontWeight:600,whiteSpace:"nowrap"}}>{Math.max(0,Math.ceil((fyEnd-now)/(7*86400000)))} {t.weeksLeft}</span>
    </div>
  );
}

function HeroProgress({totalDays,goal,onGoalChange,rooJump=false,t}){
  const pct=Math.min(totalDays/goal,1),done=totalDays>=goal;
  const remaining=goal-totalDays;
  const milestones=[Math.round(goal*0.25),Math.round(goal*0.5),Math.round(goal*0.75),goal];
  const numColor=done?C.green:pct>0.5?C.teal:C.text;
  return(
    <div style={{background:C.bg,paddingBottom:24}}>
      <div style={{display:"flex",justifyContent:"center",paddingTop:20,marginBottom:4}}>
        <div style={{display:"flex",background:C.bgCard,border:`1.5px solid ${C.border}`,borderRadius:12,padding:3,gap:2}}>
          {[[88,"2nd Year · 88d"],[179,"3rd Year · 179d"]].map(([g,label])=>(
            <button key={g} onClick={()=>onGoalChange(g)} style={{padding:"7px 18px",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600,transition:"all 0.2s",background:goal===g?C.green:"transparent",color:goal===g?"#fff":C.textFaint,boxShadow:goal===g?"0 2px 8px rgba(26,122,74,0.25)":"none"}}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{textAlign:"center",padding:"12px 20px 0",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse 70% 60% at 50% 60%,${done?"rgba(26,122,74,0.08)":pct>0?"rgba(13,148,136,0.05)":"transparent"},transparent)`,pointerEvents:"none",transition:"background 1s ease"}}/>
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,letterSpacing:"0.18em",textTransform:"uppercase",fontWeight:600,marginBottom:4}}>days farm</div>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"center",gap:8,lineHeight:1}}>
          <div key={totalDays} style={{fontFamily:"Georgia,serif",fontSize:"clamp(80px,20vw,112px)",fontWeight:700,color:numColor,lineHeight:0.9,animation:"numberUp 0.6s cubic-bezier(.34,1.56,.64,1)",letterSpacing:"-0.04em",transition:"color 0.8s ease"}}>{totalDays}</div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-start",paddingBottom:10}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.textFaint,fontWeight:500}}>/ {goal}</div>
            {!done&&remaining>0&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint}}>{remaining} left</div>}
          </div>
        </div>
        {done&&<div style={{fontFamily:"Georgia,serif",fontSize:15,fontStyle:"italic",color:C.green,marginTop:6}}>{t.visaReady}</div>}
        {!done&&pct>0&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.teal,marginTop:6,fontWeight:500}}>{Math.round(pct*100)}% complete</div>}
      </div>
      <div style={{padding:"16px 24px 0",maxWidth:500,margin:"0 auto"}}>
        <div style={{position:"relative",paddingTop:32}}>
          {milestones.map((m,i)=>{
            const mPct=m/goal*100,reached=totalDays>=m,isFinish=i===milestones.length-1;
            return(
              <div key={m} style={{position:"absolute",top:0,left:`${mPct}%`,transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",zIndex:2}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:isFinish?14:10,color:reached?(isFinish?C.green:C.teal):C.textFaint,fontWeight:700,whiteSpace:"nowrap"}}>{isFinish?"🏁":reached?"⭐":m+"d"}</div>
                <div style={{width:1,height:8,background:reached?C.greenBorder:C.border,marginTop:2}}/>
              </div>
            );
          })}
          <div style={{height:10,borderRadius:99,overflow:"hidden",position:"relative",background:"linear-gradient(180deg,#e8d5b0,#d4bc88)",boxShadow:"inset 0 2px 4px rgba(0,0,0,0.1)"}}>
            <div style={{position:"absolute",inset:0,borderRadius:99,background:done?`linear-gradient(90deg,#a3e635,${C.green})`:`linear-gradient(90deg,#f97316,#ea580c,${C.teal})`,width:`${pct*100}%`,transition:"width 1.2s cubic-bezier(.34,1.56,.64,1)"}}/>
          </div>
          <div style={{position:"absolute",bottom:10,left:`calc(${pct*100}% - 13px)`,transition:"left 1.2s cubic-bezier(.34,1.56,.64,1)",fontSize:24,lineHeight:1,animation:(done||rooJump)?"rooBounce 0.4s ease 3":"none",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.15))",zIndex:3}}>🦘</div>
        </div>
      </div>
    </div>
  );
}

const ICONS={gross:"💰",net:"💵",tax:"🧾",super:"🦘"};
const STAT_COLORS={gross:C.text,net:C.green,tax:C.red,super:"#6366f1"};

function StatCards({totals,t}){
  const STAT_LABELS={gross:t.statGross,net:t.statNet,tax:t.statTax,super:t.statSuper};
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"0 20px 20px",maxWidth:640,margin:"0 auto",width:"100%"}}>
      {["gross","net","tax","super"].map(k=>(
        <div key={k} className="stat-card" style={{background:C.bgCard,borderRadius:14,padding:"14px 12px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
          <div style={{fontSize:18,marginBottom:6}}>{ICONS[k]}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{STAT_LABELS[k]}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(11px,2vw,16px)",fontWeight:600,color:STAT_COLORS[k]}}>{fmt(totals[k])}</div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({entry,index,isLast,onDelete,onEdit,t}){
  const ini=(entry.employer||"??").split(/\s+/).filter(Boolean).map(w=>w[0]).slice(0,2).join("").toUpperCase();
  const raw=entry.farmDays??0,floor=Math.floor(raw),hasDecimal=(raw-floor)>0.05;
  const wh=entry.hoursWorked>0&&entry.periodDays>0?(entry.hoursWorked/(entry.periodDays/7)).toFixed(1):null;
  return(
    <div style={{display:"flex",gap:12,animation:`rowIn 0.4s ease ${index*0.06}s both`,paddingLeft:4}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,width:20}}>
        <div className="timeline-dot" style={{width:10,height:10,borderRadius:"50%",background:C.green,border:`2px solid ${C.bgCard}`,boxShadow:`0 0 0 2px ${C.greenBorder}`,flexShrink:0,marginTop:18}}/>
        {!isLast&&<div style={{width:1,flex:1,background:`linear-gradient(${C.greenBorder},${C.border})`,marginTop:4}}/>}
      </div>
      <div className="entry-card" style={{flex:1,minWidth:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:isLast?0:12,boxShadow:C.shadow}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:12,minWidth:0}}>
          <div style={{width:40,height:40,borderRadius:11,background:C.greenBg,border:`1px solid ${C.greenBorder}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:C.green}}>{ini}</div>
          <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:600,color:C.text,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.employer}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.date}{wh&&<span style={{color:C.teal}}> · {wh}{t.hoursWeek}</span>}{entry.abn&&<span> · ABN {entry.abn}</span>}</div>
          </div>
          <div style={{flexShrink:0,textAlign:"right",minWidth:90}}>
            {!entry.hoursWorked||entry.hoursWorked===0?(
              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:C.amberBg,border:"1px solid #fde68a",borderRadius:8,padding:"4px 10px"}}><span style={{fontSize:12}}>⚠️</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.amber,fontWeight:600}}>{t.missingHours}</span></div>
            ):raw===0?(
              <div style={{display:"inline-flex",alignItems:"baseline",gap:2,background:C.redBg,border:"1px solid #fca5a5",borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.red}}>+0.0</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.red,fontWeight:600}}>d visa</span></div>
            ):(
              <div style={{display:"inline-flex",alignItems:"baseline",gap:2,background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.green}}>+{fmtN(raw)}</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,fontWeight:600}}>d visa</span></div>
            )}
            {hasDecimal&&raw>0&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,marginTop:2,textAlign:"center"}}>{floor} {t.counted}</div>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`,minWidth:0}}>
          <div style={{minWidth:0,overflow:"hidden",flexShrink:1,marginRight:8}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600,color:C.text}}>{fmt(entry.gross)}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginLeft:6}}>{t.gross}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.red,marginLeft:12}}>−{fmt(entry.tax)} {t.tax}</span>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button className="btn-edit" onClick={()=>onEdit(entry)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11}}>{t.edit}</button>
            <button className="btn-danger" onClick={()=>onDelete(index)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11}}>{t.delete}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TapField({label,value,onChange,color=C.text,missing=false,prefix="$",placeholder="0.00",suffix="",t}){
  const[editing,setEditing]=useState(false);
  const inputRef=useRef();
  useEffect(()=>{if(editing){inputRef.current?.focus();inputRef.current?.select();}},[editing]);
  return(
    <div onClick={()=>setEditing(true)} style={{background:missing?"rgba(220,38,38,0.03)":editing?"#fff":C.bgMuted,borderRadius:12,padding:"12px 14px",border:`2px solid ${missing?"#fca5a5":editing?C.teal:C.border}`,cursor:"text",transition:"all 0.15s ease",minHeight:64,display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:editing?`0 0 0 3px rgba(13,148,136,0.1)`:"none"}}>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:missing?C.red:editing?C.teal:C.textFaint,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}{missing?" ⚠":""}</span>
      {editing?(
        <input ref={inputRef} type="number" inputMode="decimal" style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:C.text,background:"transparent",border:"none",outline:"none",width:"100%",padding:0,marginTop:4}} value={value} onChange={e=>onChange(e.target.value)} onBlur={()=>setEditing(false)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape"){setEditing(false);e.preventDefault();}}} placeholder={placeholder}/>
      ):(
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:missing?C.red:color,marginTop:4}}>{value?`${prefix}${value}${suffix}`:<span style={{fontSize:12,fontWeight:500,color:C.red}}>{t.tapToEnter}</span>}</div>
      )}
    </div>
  );
}

// Résultat visa cliquable — tapote le chiffre vert pour corriger
function VisaDayResult({autoVal,override,onOverride,lh,lp,vdFloor,hasDecimal,t}){
  const[editing,setEditing]=useState(false);
  const inputRef=useRef();
  useEffect(()=>{if(editing)inputRef.current?.focus();},[editing]);
  const isManual=override!==null&&override!=="";
  const displayVal=isManual?parseFloat(override):autoVal;
  if(!lh||!lp) return null;
  return(
    <div onClick={()=>!editing&&setEditing(true)} style={{background:isManual?"rgba(13,148,136,0.06)":C.bgCard,borderRadius:8,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",cursor:"text",border:`1.5px solid ${isManual?C.teal:C.greenBorder}`,transition:"all 0.15s"}}>
      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid}}>
        {lh}h {t.workedOn} {lp} {t.days}
        {hasDecimal&&!isManual&&<div style={{fontSize:9,color:C.amber,marginTop:2}}>{vdFloor} {t.counted}</div>}
        {isManual&&<div style={{fontSize:9,color:C.teal,marginTop:2}}>auto: {autoVal>0?fmtN(autoVal)+"d":"—"}</div>}
      </div>
      <div style={{display:"flex",alignItems:"baseline",gap:4}}>
        {isManual&&<span style={{fontSize:11,color:C.teal}}>🖊</span>}
        {editing?(
          <input ref={inputRef} type="number" inputMode="decimal" defaultValue={isManual?override:Math.floor(autoVal)||""} style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.green,background:"transparent",border:"none",outline:"none",width:60,textAlign:"right",padding:0}} onChange={e=>onOverride(e.target.value||null)} onBlur={()=>setEditing(false)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape"){setEditing(false);e.preventDefault();}}}/>
        ):(
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:displayVal>0?C.green:C.red}}>{displayVal>0?"+"+fmtN(displayVal):"?"}</span>
        )}
        <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,fontWeight:600,marginLeft:1}}>d</span>
      </div>
    </div>
  );
}

function Modal({draft,filename,onConfirm,onDismiss,editMode=false,t}){
  const[step,setStep]=useState(editMode?"details":"summary");
  const[v,setV]=useState({gross:draft.gross>0?String(draft.gross):"",net:draft.net>0?String(draft.net):"",tax:draft.tax>0?String(draft.tax):"",super:draft.super>0?String(draft.super):"",employer:draft.employer!=="Unknown Employer"?draft.employer:"",hours:draft.hoursWorked>0?String(draft.hoursWorked):"",pDays:draft.periodDays>0?String(draft.periodDays):"",date:draft.date||"",abn:draft.abn||""});
  // Override jours visa : null = calcul auto, sinon valeur manuelle tapée par l'user
  const[overrideDays,setOverrideDays]=useState(draft.overrideDays?String(draft.overrideDays):null);
  const set=k=>val=>setV(p=>({...p,[k]:val}));
  const setE=k=>e=>setV(p=>({...p,[k]:e.target.value}));
  const lh=parseFloat(v.hours)||0,lp=parseInt(v.pDays)||0;
  const vdRaw=calcVisaDays(lh,lp),vdFloor=Math.floor(vdRaw),hasDecimal=vdRaw>0&&(vdRaw-vdFloor)>0.05;
  const missingPeriod=lh>0&&lp===0;
  const missing=["gross","net","tax","super"].filter(k=>!v[k]||pn(v[k])===0);
  const grossV=pn(v.gross),netV=pn(v.net),deductionWarning=grossV>0&&netV>0&&netV<grossV*0.5;
  const INP=(err=false)=>({fontFamily:"'DM Sans',sans-serif",fontSize:13,padding:"10px 12px",borderRadius:9,border:`1.5px solid ${err?"#fca5a5":C.border}`,background:C.bgMuted,color:C.text,width:"100%",boxSizing:"border-box"});
  const LBL={fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:5,display:"block",fontWeight:600};
  // Si override activé, on utilise la valeur manuelle, sinon le calcul auto
  const finalDays = overrideDays!==null&&overrideDays!==""?parseFloat(overrideDays):vdRaw;
  const handleConfirm=()=>onConfirm({gross:pn(v.gross),net:pn(v.net),tax:pn(v.tax),super:pn(v.super),employer:v.employer||"Unknown Employer",date:v.date,abn:v.abn,farmDays:finalDays,hoursWorked:lh,periodDays:lp,name:draft.name,valid:true,overrideDays:overrideDays?parseFloat(overrideDays)||null:null});
  return(
    <div style={{position:"fixed",inset:0,zIndex:150,background:"rgba(245,243,238,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto",animation:"fadeIn 0.2s ease"}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:420,boxShadow:C.shadowMd,animation:"fadeUp 0.3s ease"}}>
        {step==="summary"?(
          <>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,fontWeight:600}}>{t.scanDone}</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.text,marginBottom:4}}>{v.employer||filename.replace(".pdf","")}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint}}>{v.date||filename}</div>
            </div>
            {vdRaw>0?(
              <div style={{background:C.greenBg,border:`1.5px solid ${C.greenBorder}`,borderRadius:14,padding:"20px 24px",textAlign:"center",marginBottom:16}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>{t.detected}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,color:C.green,lineHeight:1}}>+{fmtN(vdRaw)}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.green,marginTop:4,fontWeight:500}}>{t.visaDays}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid,marginTop:8}}>{lh}h {t.workedOn} {lp} {t.days}</div>
                {hasDecimal&&<div style={{marginTop:10,padding:"8px 12px",background:"rgba(180,83,9,0.07)",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.amber}}>ℹ️ {t.onlyFull} — <strong>{vdFloor}</strong> {t.counted}.</div>}
              </div>
            ):(
              <div style={{background:C.amberBg,border:"1px solid #fde68a",borderRadius:14,padding:16,textAlign:"center",marginBottom:16}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.amber,fontWeight:500}}>{t.missingHoursHint}</div>
              </div>
            )}
            {deductionWarning&&<div style={{background:"rgba(220,38,38,0.05)",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 12px",marginBottom:16,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.red}}>⚠️ <strong>{t.deductWarn}</strong> — {t.deductMsg.replace("{net}",fmt(netV)).replace("{gross}",fmt(grossV))}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <TapField t={t} label={t.labelGross} value={v.gross} onChange={set("gross")} color={C.text} missing={!v.gross||pn(v.gross)===0}/>
              <TapField t={t} label={t.labelNet} value={v.net} onChange={set("net")} color={C.green} missing={!v.net||pn(v.net)===0}/>
              <TapField t={t} label={t.labelTax} value={v.tax} onChange={set("tax")} color={C.red} missing={!v.tax||pn(v.tax)===0}/>
              <TapField t={t} label={t.labelSuper} value={v.super} onChange={set("super")} color="#6366f1" missing={!v.super||pn(v.super)===0}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <TapField t={t} label={t.labelHours} value={v.hours} onChange={set("hours")} prefix="" suffix="h" placeholder="75.92" color={C.teal} missing={!v.hours||parseFloat(v.hours)===0}/>
              <div>
                <TapField t={t} label={t.labelPeriod} value={v.pDays} onChange={set("pDays")} prefix="" suffix=" d" placeholder="14" color={C.textMid} missing={lh>0&&lp===0}/>
                {lh>0&&lp===0&&<div style={{display:"flex",gap:6,marginTop:6}}>{t.weekShort.map(([d,l])=><button key={d} onClick={()=>set("pDays")(d)} style={{flex:1,padding:"7px 0",borderRadius:8,border:`1.5px solid ${C.greenBorder}`,background:C.greenBg,color:C.green,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600}}>{l}</button>)}</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onDismiss} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>{t.ignore}</button>
              <button onClick={()=>setStep("details")} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bgMuted,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>{t.details}</button>
              <button onClick={handleConfirm} style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:C.green,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>{t.confirm}</button>
            </div>
          </>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:3}}>{editMode?t.editSheet:t.details}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text}}>{t.allData}</div></div>
              {missing.length>0&&<div style={{background:C.redBg,border:"1px solid #fca5a5",borderRadius:8,padding:"4px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.red}}>{missing.length} {missing.length>1?t.missings:t.missing}</div>}
            </div>
            {deductionWarning&&<div style={{background:"rgba(220,38,38,0.05)",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 12px",marginBottom:14,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.red}}>⚠️ {t.deductShort}</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[["gross",t.labelGross],["net",t.labelNet],["tax",t.labelTax],["super",t.labelSuper]].map(([k,l])=>(
                <div key={k}><label style={{...LBL,color:pn(v[k])>0?C.textFaint:C.red}}>{l}{pn(v[k])===0?" ⚠":""}</label><input style={INP(pn(v[k])===0)} value={v[k]} onChange={setE(k)} placeholder="0.00"/></div>
              ))}
            </div>
            <div style={{background:C.greenBg,border:`1.5px solid ${C.greenBorder}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{t.counting88}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={{...LBL,color:lh>0?C.textFaint:C.red}}>{t.labelHours}{!lh?" ⚠":""}</label><input style={INP(!lh)} value={v.hours} onChange={setE("hours")} placeholder="75.92"/></div>
                <div><label style={{...LBL,color:lp>0?C.textFaint:lh>0?C.amber:C.textFaint}}>{t.labelPeriod}{lh>0&&!lp?" ⚠":""}</label><input style={INP(lh>0&&!lp)} value={v.pDays} onChange={setE("pDays")} placeholder="14"/></div>
              </div>
              {missingPeriod&&<div style={{display:"flex",gap:6,marginBottom:10}}>{t.weekShort.map(([d,l])=><button key={d} className="period-btn" onClick={()=>setV(p=>({...p,pDays:d}))} style={{flex:1,padding:"6px 4px",borderRadius:7,border:`1px solid ${C.greenBorder}`,background:C.bgCard,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11}}>{l}</button>)}</div>}
              {lh>0&&lp>0&&<div style={{background:C.bgCard,borderRadius:8,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid}}>{lh}h {t.workedOn} {lp} {t.days}{hasDecimal&&<div style={{fontSize:9,color:C.amber,marginTop:2}}>{vdFloor} {t.counted}</div>}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:vdRaw>0?C.green:C.red}}>{vdRaw>0?"+"+fmtN(vdRaw):"?"}</div></div>}
            </div>
            {/* Override jours visa — simple champ optionnel */}
            <div style={{marginBottom:14}}>
              <label style={{...LBL}}>Visa days <span style={{color:C.textFaint,fontWeight:400,textTransform:"none",letterSpacing:0}}>(override auto{vdRaw>0?" · auto: "+fmtN(vdRaw)+"d":""})</span></label>
              <input type="number" inputMode="decimal" value={overrideDays??""} onChange={e=>setOverrideDays(e.target.value||null)} placeholder={vdRaw>0?fmtN(vdRaw)+" (auto)":"leave blank = auto"} style={{...INP(),color:overrideDays?C.green:C.textFaint,fontWeight:overrideDays?700:400}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={LBL}>{t.labelDate}</label><input style={INP()} value={v.date} onChange={setE("date")} placeholder="01/06 – 14/06"/></div>
              <div><label style={LBL}>{t.labelEmployer}</label><input style={INP()} value={v.employer} onChange={setE("employer")} placeholder="Name"/></div>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <label style={LBL}>{t.labelABN}</label>
                {v.abn&&v.abn.replace(/\s/g,"").length>0&&(validateABN(v.abn)?<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,fontWeight:600}}>{t.abnValid}</span>:<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.red,fontWeight:600}}>{t.abnInvalid}</span>)}
              </div>
              <input style={{...INP(v.abn&&v.abn.replace(/\s/g,"").length>0&&!validateABN(v.abn)),letterSpacing:"0.05em"}} value={v.abn} onChange={setE("abn")} placeholder="XX XXX XXX XXX" maxLength={14} inputMode="numeric"/>
            </div>
            <div style={{display:"flex",gap:10}}>
              {!editMode&&<button onClick={()=>setStep("summary")} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>{t.back}</button>}
              <button onClick={onDismiss} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>{t.cancel}</button>
              <button onClick={handleConfirm} style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:C.green,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>{editMode?t.save:t.confirm}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Toast({msg,ok}){
  return(
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:C.bgCard,border:`1.5px solid ${ok?C.greenBorder:"#fca5a5"}`,borderRadius:14,padding:"12px 20px",zIndex:300,maxWidth:380,textAlign:"center",animation:"toastUp 0.4s cubic-bezier(.34,1.56,.64,1)",boxShadow:C.shadowMd,fontFamily:"'DM Sans',sans-serif",whiteSpace:"pre-line"}}>
      <div style={{fontSize:16,marginBottom:4}}>{ok?"✅":"⚠️"}</div>
      <div style={{fontSize:13,color:ok?C.green:C.red,fontWeight:600}}>{msg}</div>
    </div>
  );
}

function VisaRunApp(){
  const[entries,setEntries]=useState([]);
  const[goal,setGoal]=useState(88);
  const[rooJump,setRooJump]=useState(false);
  const[confetti,setConfetti]=useState(null);
  // Streak = nb de semaines calendaires distinctes avec au moins 1 fiche
  const streak=useMemo(()=>{
    if(!entries.length) return 0;
    const weeks=new Set(entries.map(e=>{
      const d=e.date?e.date.split("–")[0].trim():"";
      if(!d) return null;
      const[dd,mm,yy]=d.split("/");
      if(!yy) return null;
      const dt=new Date(yy+"-"+mm.padStart(2,"0")+"-"+dd.padStart(2,"0"));
      const jan1=new Date(dt.getFullYear(),0,1);
      return dt.getFullYear()+"-W"+Math.ceil(((dt-jan1)/86400000+jan1.getDay()+1)/7);
    }).filter(Boolean));
    return weeks.size;
  },[entries]); // milestone atteint — null ou nombre de jours
  const prevDays=useRef(0); // pour détecter le franchissement de milestone
  const[scanning,setScanning]=useState(null);
  const[toast,setToast]=useState(null);
  const[modal,setModal]=useState(null);
  const[dragging,setDragging]=useState(false);
  const[showSaved,setShowSaved]=useState(false);
  const fileRef=useRef();
  const resolver=useRef(null);

  // Chargement initial depuis window.storage (async) au montage du composant
  useEffect(()=>{
    loadEntries().then(e=>setEntries(e));
    loadGoal().then(g=>setGoal(g));
  },[]);

  // Chargement polices Google Fonts
  useEffect(()=>{
    if(document.getElementById("vr-fonts"))return;
    const l=document.createElement("link");l.id="vr-fonts";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";document.head.appendChild(l);
  },[]);
  useEffect(()=>{
    if(document.getElementById("vr-css"))return;
    const s=document.createElement("style");s.id="vr-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  // Sauvegarde automatique dans window.storage dès que les fiches changent
  useEffect(()=>{ saveEntries(entries); },[entries]);
  // Sauvegarde automatique de l'objectif visa
  useEffect(()=>{ saveGoal(goal); },[goal]);

  // t = objet de traductions actif (FR ou EN)
  // lang est "fr" par défaut (utilisateurs francophones en Australie)
  const[lang,setLang]=useState("en");
  const t=LANG[lang];

  const totalDays=Math.floor(entries.reduce((s,e)=>s+(e.farmDays??0),0));
  // Détecte le franchissement d'un milestone et déclenche les confettis
  useEffect(()=>{
    const MILESTONES=[25,50,88,179];
    const prev=prevDays.current;
    const hit=MILESTONES.find(m=>prev<m&&totalDays>=m);
    if(hit) setConfetti(hit);
    prevDays.current=totalDays;
  },[totalDays]);
  const totals=entries.reduce((a,e)=>({gross:a.gross+e.gross,net:a.net+e.net,tax:a.tax+e.tax,super:a.super+e.super}),{gross:0,net:0,tax:0,super:0});
  const showToast=(msg,ok=true)=>{setToast({msg,ok});setTimeout(()=>setToast(null),4000);};
  const sorted=[...entries].sort((a,b)=>{const pd=d=>{if(!d)return 0;const pt=d.includes("–")?d.split("–")[1].trim():d;const[dd,mm,yy]=pt.split("/");return yy?new Date(yy+"-"+mm.padStart(2,"0")+"-"+dd.padStart(2,"0")).getTime():0;};return pd(b.date)-pd(a.date);});

  const deleteEntry=useCallback(i=>{const e=sorted[i];setEntries(p=>p.filter(x=>x!==e));showToast(t.toastDeleted,false);},[sorted,t]);
  const editEntry=useCallback(entry=>{setModal({draft:entry,filename:entry.filename||"",editMode:true,originalEntry:entry});},[]);
  const addEntry=useCallback((data,filename)=>{setEntries(p=>[{...data,filename},...p]);const raw=data.farmDays??0;const last=data.name?.split(/[\s,]+/).filter(Boolean).pop()||"";showToast(`${last}\n${fmt(data.gross)} ${t.gross} · +${fmtN(raw)} d visa`);setRooJump(true);setTimeout(()=>setRooJump(false),1200);},[t]);
  const saveEdit=useCallback((data,originalEntry)=>{setEntries(p=>p.map(e=>e===originalEntry?{...data,filename:originalEntry.filename}:e));showToast(t.toastUpdated);},[t]);

  const processFiles=useCallback(async(files)=>{
    for(const file of files){
      // On démarre l'overlay de scan avec un draft vide pendant que l'IA travaille
      setScanning({employer:"",date:"",gross:0,hoursWorked:0,farmDays:0});
      try{
        const isImage = file.type.startsWith("image/");
        // Branchement : image → Vision IA directe / PDF → extraction texte → Claude
        let draft;
        if(isImage){
          draft = await processImageAI(file);
        } else {
          const text = await extractText(file).catch(()=>"");
          draft = text.replace(/\s/g,"").length>30
            ? await processDocumentAI(text)
            : {gross:0,net:0,tax:0,super:0,abn:"",name:"Employee",employer:"",date:"",hoursWorked:0,periodDays:0,farmDays:0,valid:false};
        }
        setScanning(draft);
        await new Promise(r=>setTimeout(r,800));
        setScanning(null);
        setModal({draft,filename:file.name,editMode:false});
        await new Promise(r=>{resolver.current=r;});
      }catch(err){
        setScanning(null);
        showToast(`Erreur : ${err.message}`,false);
        resolver.current?.();resolver.current=null;
      }
    }
    if(fileRef.current)fileRef.current.value="";
  },[addEntry,t]);

  const handleConfirm=data=>{const{filename,editMode,originalEntry}=modal;setModal(null);if(editMode)saveEdit(data,originalEntry);else addEntry(data,filename);resolver.current?.();resolver.current=null;};
  const handleDismiss=()=>{setModal(null);if(!modal?.editMode)showToast(t.toastIgnored,false);resolver.current?.();resolver.current=null;};

  return(
    <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);processFiles(Array.from(e.dataTransfer.files));}} style={{background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      {confetti&&<ConfettiCelebration milestone={confetti} onDone={()=>setConfetti(null)}/>}
      {scanning&&<ScanOverlay draft={scanning} t={t}/>}
      {toast&&<Toast msg={toast.msg} ok={toast.ok}/>}
      {modal&&<Modal draft={modal.draft} filename={modal.filename} editMode={modal.editMode||false} onConfirm={handleConfirm} onDismiss={handleDismiss} t={t}/>}

      <div style={{borderBottom:`1px solid ${C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:C.bgCard}}>
        <div style={{width:36,height:36,borderRadius:10,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🦘</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.02em"}}>Visa Run</div>
          <div style={{fontSize:10,color:C.textFaint,marginTop:1}}>{t.tagline}</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {showSaved&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,fontWeight:600,animation:"savedPop 0.3s ease"}}>{t.saved}</div>}
          <div style={{display:"flex",background:C.bgMuted,border:`1px solid ${C.border}`,borderRadius:8,padding:2,gap:2}}>
            {[["en","🇬🇧"],["fr","🇫🇷"],["es","🇪🇸"]].map(([code,flag])=>(
              <button key={code} onClick={()=>setLang(code)} style={{padding:"4px 8px",borderRadius:6,border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,transition:"all 0.15s",background:lang===code?C.green:"transparent",color:lang===code?"#fff":C.textFaint,boxShadow:lang===code?"0 1px 4px rgba(26,122,74,0.3)":"none"}}>{flag} {code.toUpperCase()}</button>
            ))}
          </div>
          {streak>0&&<div style={{background:C.amberBg,border:"1px solid #fde68a",borderRadius:8,padding:"5px 10px",fontSize:11,color:C.amber,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><span>🔥</span>{streak}w</div>}
          <div style={{background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:8,padding:"5px 12px",fontSize:11,color:C.green,fontWeight:600}}>{t.active}</div>
        </div>
      </div>

      <FiscalBanner t={t}/>
      <HeroProgress totalDays={totalDays} goal={goal} onGoalChange={setGoal} rooJump={rooJump} t={t}/>
      <StatCards totals={totals} t={t}/>

      <div style={{maxWidth:600,margin:"0 auto",padding:"0 20px 40px"}}>
        <input ref={fileRef} type="file" accept=".pdf,image/*" multiple style={{display:"none"}} onChange={e=>processFiles(Array.from(e.target.files))}/>
        {sorted.length===0&&(
          <div style={{paddingTop:8}}>
            <div className="empty-cta drop-zone" onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragging?C.green:C.greenBorder}`,borderRadius:16,padding:"32px 24px",textAlign:"center",cursor:"pointer",marginBottom:12,background:dragging?C.greenBg:C.bgCard,boxShadow:C.shadow,animation:"glowPulse 3s ease infinite"}}>
              {/* Kangourou animé */}
              <div style={{fontSize:64,lineHeight:1,marginBottom:12,display:"inline-block",animation:dragging?"rooBounce 0.4s ease infinite":"rooIdle 2.4s ease-in-out infinite",filter:"drop-shadow(0 4px 12px rgba(26,122,74,0.2))",transformOrigin:"bottom center"}}>🦘</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.text,marginBottom:4,lineHeight:1.3}}>
                Your second year<br/><span style={{color:C.green,fontStyle:"italic"}}>starts here.</span>
              </div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint,marginBottom:16}}>
                {dragging?"Drop it! 🎯":"Drop your payslip — we'll count your days."}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:16}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"#fee2e2",border:"1px solid #fca5a5",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📄</div>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:700,color:C.textFaint,letterSpacing:"0.08em"}}>PDF</span>
                </div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint}}>or</div>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"#ede9fe",border:"1px solid #c4b5fd",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📸</div>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,fontWeight:700,color:C.textFaint,letterSpacing:"0.08em"}}>SCREENSHOT</span>
                </div>
              </div>
              <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Works with</div>
                <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:6}}>
                  {["Xero","MYOB","Employment Hero","KeyPay","Payroller","QuickBooks"].map(name=>(
                    <span key={name} style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:C.textMid,background:C.bgMuted,border:`1px solid ${C.border}`,borderRadius:6,padding:"3px 8px"}}>{name}</span>
                  ))}
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:C.textFaint,background:"transparent",border:`1px dashed ${C.border}`,borderRadius:6,padding:"3px 8px",fontStyle:"italic"}}>& many more…</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {sorted.length>0&&(
          <>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,marginTop:4}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>{t.history} · {sorted.length} {sorted.length>1?t.sheets:t.sheet}</div>
              <div style={{flex:1,height:1,background:C.border}}/>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:11,fontStyle:"italic",color:C.teal}}>{fmtN(entries.reduce((s,e)=>s+(e.farmDays??0),0))} {t.daysAccum}</div>
            </div>
            {sorted.map((e,i)=><EntryCard key={e.filename+i} entry={e} index={i} isLast={i===sorted.length-1} onDelete={deleteEntry} onEdit={editEntry} t={t}/>)}
            <div className="drop-zone" onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragging?C.green:C.border}`,borderRadius:12,padding:"14px 20px",textAlign:"center",cursor:"pointer",marginTop:20,background:dragging?C.greenBg:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <span style={{fontSize:16}}>📄</span>
              <span style={{fontSize:14}}>📸</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontWeight:500}}>{t.addSheet} · <span style={{color:C.teal}}>{t.browse}</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



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

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const FREE_LIMIT  = 2;
const SECTORS     = ["Farm", "Mine", "Construction", "Roadhouse", "Solar", "Fish", "Abattoir", "Forestry", "Autre"];
const STATES      = ["QLD", "WA", "NSW", "VIC", "TAS", "NT", "SA"];
const STATE_ORDER = { QLD: 0, WA: 1, NSW: 2, VIC: 3, TAS: 4, NT: 5, SA: 6 };

const ICONS = {
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

// ─── DONNÉES EMPLOYEURS ───────────────────────────────────────────────────────

// ─── COORDONNÉES ──────────────────────────────────────────────────────────────
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

// ─── UTILS ────────────────────────────────────────────────────────────────────
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

const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// ─── COMPOSANT BOUTON COPIER ──────────────────────────────────────────────────
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

// ─── APP ──────────────────────────────────────────────────────────────────────
function JobFinder({ jobData }) {
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

  // ── CSS global ──
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

  // Timer 15s → sticky bar uniquement, pas de scroll forcé
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
    // Retour en haut de page après paiement pour voir les résultats depuis le début
    window.scrollTo({ top: 0, behavior: "smooth" });
    sortedResults.forEach((_, i) => setTimeout(() => setRevealed(p => [...p, i]), i * 80));
  }, [paid]);

  useEffect(() => {
    if (!paid || cityInput.length < 2) { setSuggestions([]); return; }
    const q = cityInput.toLowerCase();
    setSuggestions(AU_CITIES.filter(c => c.toLowerCase().startsWith(q)).slice(0, 5));
  }, [cityInput, paid]);

  // ── Filtrage & tri ──
  const baseResults = jobData.filter(j =>
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

  // Compteur animé
  useEffect(() => {
    let cur = 0; const target = baseResults.length; setAnimCount(0);
    const iv = setInterval(() => { cur = Math.min(cur + 1, target); setAnimCount(cur); if (cur >= target) clearInterval(iv); }, 20);
    return () => clearInterval(iv);
  }, [sector, stateF]);

  // Compteur par secteur dans les chips
  const countBySector = SECTORS.reduce((acc, s) => {
    acc[s] = jobData.filter(j => j.sector === s && (!stateF || j.state === stateF)).length;
    return acc;
  }, {});

  const visible     = paid ? sortedResults : sortedResults.slice(0, FREE_LIMIT);
  const lockedCount = sortedResults.length - FREE_LIMIT;
  const totalLocked = jobData.length - FREE_LIMIT; // toujours le vrai total de la base
  const showWall    = !paid && lockedCount > 0;
  const zeroResult  = baseResults.length === 0;

  const handleSector    = (s)  => setSector(sector === s  ? null : s);
  const handleState     = (st) => setStateF(stateF === st ? null : st);
  const scrollToPaywall = ()   => paywallRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const LEMON_URL = "https://visarun.lemonsqueezy.com/buy/PLACEHOLDER";
  const handlePay       = ()   => { window.open(LEMON_URL, '_blank'); setPaying(true); setTimeout(() => { setPaying(false); setPaid(true); }, 2000); };

  const selectCity = (city) => {
    setCityInput(city); setSuggestions([]);
    const c = KNOWN_COORDS[city]; if (c) setCityCoords(c);
  };

  const getDistLabel = (job) => {
    if (!cityCoords || !paid) return null;
    const c = CITY_COORDS[job.city]; if (!c) return null;
    return `${haversine(cityCoords.lat, cityCoords.lng, c.lat, c.lng)} km de ${cityInput}`;
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>

      {/* ════ STICKY BAR ════ */}
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
                <span style={{ fontSize: 12, color: C.textFaint, textDecoration: "line-through" }}>39,99 A$</span>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: C.green }}>24,99 A$</span>
              </div>
            </div>
            <button className="pay-cta" onClick={handlePay} style={{
              width: "100%", padding: "13px", borderRadius: 12, background: C.green,
              color: "#fff", fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}>🦘 Accéder aux contacts — 24,99 A$</button>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 6 }}>
              {["✅ Accès garanti", "⚡ Immédiat", `⏱ Expire ${fmt(timer)}`].map(t => (
                <span key={t} style={{ fontSize: 9, color: C.textFaint }}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════ HEADER ════ */}
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
              ⏱ {fmt(timer)}
            </div>
          )}
          <div style={{ background: paid ? C.greenLight : C.redBg, border: `1px solid ${paid ? C.greenBorder : "#fecaca"}`, borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 600, color: paid ? C.green : C.red }}>
            {paid ? "✓ Accès complet" : "2 résultats gratuits"}
          </div>
        </div>
      </div>

      {/* ════ HERO ════ */}
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

        {/* ── Proximité post-paiement ── */}
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

        {/* ── Filtre Secteur ── */}
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
                  {ICONS[s]} {s}
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

        {/* ── Filtre État ── */}
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

        {/* ── Compteur ── */}
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

        {/* ── 0 résultat ── */}
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

        {/* ════ CARDS ════ */}
        {!zeroResult && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {visible.map((job, i) => {
                const distLabel  = getDistLabel(job);
                const isRevealed = paid && revealed.includes(i);
                return (
                  <div key={job.name + i} className={`card${isRevealed ? " card-reveal" : ""}`}
                    style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 14, padding: "14px 15px", boxShadow: C.shadow, animation: `rowIn 0.3s ease ${i * 0.06}s both` }}>

                    {/* Nom + badge NEW */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 9, background: C.bgMuted, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                        {ICONS[job.sector]}
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
                      <div style={{ background: STATE_COLORS[job.state] + "22", border: `1px solid ${STATE_COLORS[job.state]}55`, borderRadius: 7, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: STATE_COLORS[job.state], flexShrink: 0 }}>
                        {job.state}
                      </div>
                    </div>

                    {/* Localisation — lien Google Maps */}
                    <div style={{ background: C.bgMuted, borderRadius: 8, padding: "7px 10px", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13 }}>📍</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(job.city + ", Australia")}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 12, fontWeight: 600, color: C.green, textDecoration: "none" }}>
                          {job.city}
                        </a>
                        <span style={{ fontSize: 11, color: C.textFaint }}> · {job.region}</span>
                      </div>
                      {distLabel
                        ? <span style={{ fontSize: 10, color: C.green, fontWeight: 700, background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>{distLabel}</span>
                        : <span style={{ fontSize: 10, color: C.teal, fontWeight: 500, flexShrink: 0 }}>{job.dist}</span>
                      }
                    </div>

                    {/* Contacts */}
                    <div style={{ paddingTop: 9, borderTop: `1px solid ${C.border}` }}>
                      {/* Téléphone */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 7 }}>
                        <span style={{ fontSize: 12, flexShrink: 0 }}>📞</span>
                        {paid
                          ? <a href={`tel:${job.phone.replace(/\s/g, "")}`} className={isRevealed ? "unblur" : ""} style={{ fontSize: 12, color: C.green, fontWeight: 600, flex: 1, textDecoration: "none" }}>{job.phone}</a>
                          : <span className="blur-c" style={{ fontSize: 12, color: C.textMid, fontWeight: 500, flex: 1 }}>{job.phone.slice(0, 7)}xxx xxxx</span>
                        }
                        {paid
                          ? <CopyBtn text={job.phone} />
                          : (
                            <button onClick={scrollToPaywall} style={{
                              display: "block", width: "100%", marginTop: 10,
                              padding: "11px", borderRadius: 10, border: "none",
                              background: C.green, color: "#fff",
                              fontSize: 13, fontWeight: 700, cursor: "pointer",
                              fontFamily: "'DM Sans',sans-serif",
                              letterSpacing: "0.01em",
                            }}>🔒 Voir les contacts</button>
                          )
                        }
                      </div>
                      {/* Email */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, flexShrink: 0 }}>✉️</span>
                        {paid
                          ? <a href={`mailto:${job.email}`} className={isRevealed ? "unblur" : ""} style={{ fontSize: 11, color: C.textMid, fontWeight: 500, flex: 1, textDecoration: "none", wordBreak: "break-all" }}>{job.email}</a>
                          : <span className="blur-c" style={{ fontSize: 11, color: C.textMid, fontWeight: 500, flex: 1 }}>{job.email.slice(0, 2)}xxxxx@{job.email.split("@")[1]}</span>
                        }
                        {paid && <CopyBtn text={job.email} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ════ MUR PAYWALL ════ */}
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
                    <span style={{ fontSize: 13, color: C.textFaint, textDecoration: "line-through" }}>39,99 A$</span>
                    <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 32, fontWeight: 700, color: C.green }}>24,99 A$</span>
                    <span style={{ fontSize: 10, color: "#fff", background: C.red, borderRadius: 5, padding: "2px 6px", fontWeight: 700 }}>−50%</span>
                  </div>
                  <button className="pay-cta" onClick={scrollToPaywall} style={{ width: "100%", padding: "15px", borderRadius: 13, background: C.green, color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    🦘 Accéder aux {totalLocked} contacts — 24,99 A$
                  </button>
                  <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
                    {["✅ Accès garanti", "⚡ Immédiat", "📋 Copie en 1 clic"].map(t => (
                      <span key={t} style={{ fontSize: 10, color: C.textFaint }}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════ PAYWALL DÉTAILLÉ ════ */}
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

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 16 }}>
                      {[
                        ["📞","Téléphone direct",     "Appelle aujourd'hui"],
                        ["✉️","Email recrutement",    "Répond en 24h"],
                        ["📋","Copie en 1 clic",      "iPhone & Android"],
                        ["🗺️","Tri par proximité",    "Depuis ta ville"],
                        ["🌾","Farm · Solar · Mine",  "8 secteurs couverts"],
                        ["🐟","Fish · Abattoir · 🌲", "Nouveaux secteurs"],
                      ].map(([icon, title, sub]) => (
                        <div key={title} style={{ background: C.bgMuted, borderRadius: 10, padding: "9px 12px", textAlign: "left" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 2 }}>{icon} {title}</div>
                          <div style={{ fontSize: 10, color: C.textFaint }}>{sub}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, color: C.textFaint, textDecoration: "line-through" }}>39,99 A$</span>
                      <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 40, fontWeight: 700, color: C.green, lineHeight: 1 }}>24,99 A$</span>
                    </div>
                    <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 10 }}>Accès à vie · Paiement unique</div>

                    <div className="urgent" style={{ border: `1px solid #fecaca`, borderRadius: 9, padding: "8px 14px", fontSize: 12, color: C.red, fontWeight: 600, marginBottom: 14 }}>
                      ⏱ Offre −50% expire dans <strong>{fmt(timer)}</strong>
                    </div>

                    <button className="pay-cta" onClick={handlePay} disabled={paying} style={{ width: "100%", padding: "15px", borderRadius: 13, background: paying ? C.bgMuted : C.green, color: paying ? C.textMid : "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      {paying ? <><span style={{ animation: "pulse 1s infinite" }}>⏳</span> Paiement en cours…</> : <><span>🦘</span> Accéder aux contacts — 24,99 A$</>}
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



// ─── APP PRINCIPALE — Navigation 2 onglets ───────────────────────────────────
export default function App(){
  const [activeTab, setActiveTab] = useState("visa");

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ paddingBottom: 70 }}>
        {activeTab === "visa" && <VisaRunApp />}
        {activeTab === "jobs" && <JobFinder jobData={JOB_DATA} />}
      </div>

      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#ffffff", borderTop: "1px solid #e8e3d9",
        display: "flex", zIndex: 1000,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -2px 16px rgba(0,0,0,0.07)"
      }}>
        {[
          { id: "visa", icon: "🦘", label: "Mon Visa" },
          { id: "jobs", icon: "🔍", label: "Trouver un job" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "10px 0 12px", border: "none", cursor: "pointer",
            background: "transparent", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 3,
            borderTop: `2px solid ${activeTab === tab.id ? "#1a7a4a" : "transparent"}`,
          }}>
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
              color: activeTab === tab.id ? "#1a7a4a" : "#9a9488",
              fontFamily: "'DM Sans',sans-serif",
            }}>{tab.label.toUpperCase()}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

