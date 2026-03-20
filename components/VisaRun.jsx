import { useState, useRef, useCallback, useEffect, useMemo } from "react";

const fmt  = (v) => `$${Number(v).toLocaleString("en-AU",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtN = (v) => Number(v).toLocaleString("en-AU",{minimumFractionDigits:1,maximumFractionDigits:1});
const pn   = (s="") => Math.abs(parseFloat(String(s).replace(/[$,\s]/g,""))||0);

// ── Design tokens ─────────────────────────────────────────────────────────────
const C={
  bg:"#f5f3ee", bgCard:"#ffffff", bgMuted:"#f0ede6",
  border:"#e8e3d9", borderDark:"#d4cfc4",
  text:"#1a1a18", textMid:"#5a5850", textFaint:"#9a9488",
  green:"#1a7a4a", greenBg:"#edf7f1", greenBorder:"#b8e0c8",
  teal:"#0d9488", amber:"#b45309", amberBg:"#fef9ec",
  red:"#dc2626", redBg:"#fef2f2",
  shadow:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowMd:"0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
};

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
  @keyframes milestonePopIn{0%{opacity:0;transform:translateX(-50%) scale(0.7)}100%{opacity:1;transform:translateX(-50%) scale(1)}}
  .drop-zone{transition:border-color 0.2s,background 0.2s;}
  .drop-zone:hover,.drop-zone.drag-over{border-color:${C.green}!important;background:${C.greenBg}!important;}
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

const STORAGE_KEY = "visarun_entries_v1";
const GOAL_KEY    = "visarun_goal_v1";

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

function calcVisaDays(hours,pDays){ if(!hours||!pDays||isNaN(hours)||isNaN(pDays))return 0; const r=Math.min((hours/(pDays*5))*pDays,pDays); return isNaN(r)||!isFinite(r)?0:r; }
function dateDiff(from,to){ if(!from||!to)return 0; const p=d=>{const[dd,mm,yy]=d.split("/");return new Date(yy+"-"+mm.padStart(2,"0")+"-"+dd.padStart(2,"0"));}; return Math.round(Math.abs(p(to)-p(from))/86400000)+1; }
function validateABN(abn){ const d=String(abn).replace(/\s/g,""); if(!/^\d{11}$/.test(d))return false; const w=[10,1,3,5,7,9,11,13,15,17,19]; return w.reduce((s,wt,i)=>s+wt*(i===0?Number(d[i])-1:Number(d[i])),0)%89===0; }

async function processDocumentAI(rawText) {
  const prompt = `You are an expert at extracting data from Australian payslips. Extract the following fields and return ONLY a valid JSON object — no markdown, no explanation, no extra text.

PAYSLIP TEXT:
---
${rawText.slice(0, 6000)}
---

Return exactly this JSON structure:
{
  "gross": 0, "net": 0, "tax": 0, "super": 0,
  "hoursWorked": 0, "periodFrom": "", "periodTo": "",
  "employer": "", "name": "", "abn": ""
}

RULES:
gross — Total earnings BEFORE deductions. Must be > net.
net — Amount paid AFTER all deductions.
tax — PAYG Withholding only.
super — Employer superannuation (~11% of gross).
hoursWorked — SUM of ALL worked hours.
periodFrom/periodTo — DD/MM/YYYY format.
employer — Company name. name — Employee full name. abn — 11 digits no spaces.
FALLBACK: use 0 for missing numbers, "" for missing text.`;

  const response = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
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
  if (!jsonMatch) throw new Error("Invalid AI response");
  const parsed = JSON.parse(jsonMatch[0]);

  const pDays = dateDiff(parsed.periodFrom, parsed.periodTo);
  const farmDays = calcVisaDays(parsed.hoursWorked || 0, pDays);
  const date = parsed.periodFrom && parsed.periodTo ? parsed.periodFrom + " – " + parsed.periodTo : "";

  return {
    gross: parsed.gross||0, net: parsed.net||0, tax: parsed.tax||0, super: parsed.super||0,
    hoursWorked: parsed.hoursWorked||0, periodFrom: parsed.periodFrom||"", periodTo: parsed.periodTo||"",
    periodDays: pDays, employer: parsed.employer||"Unknown Employer", name: parsed.name||"Employee",
    abn: (parsed.abn||"").replace(/\s/g,""), date, farmDays,
    deductionWarning: (parsed.gross||0)>0&&(parsed.net||0)>0&&(parsed.net||0)<(parsed.gross||0)*0.5,
    valid: (parsed.gross||0)>0||(parsed.net||0)>0
  };
}

async function processImageAI(file) {
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
  const mediaType = file.type || "image/jpeg";
  const prompt = `Extract data from this Australian payslip image. Return ONLY valid JSON:
{"gross":0,"net":0,"tax":0,"super":0,"hoursWorked":0,"periodFrom":"","periodTo":"","employer":"","name":"","abn":""}
Rules: gross=total before deductions, net=amount paid, tax=PAYG only, super=employer super ~11%, hoursWorked=sum all hours, dates in DD/MM/YYYY, abn=11 digits. Use 0 or "" if not found.`;

  const response = await fetch("/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json", "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", max_tokens: 1000,
      messages: [{ role: "user", content: [
        { type: "image", source: { type: "base64", media_type: mediaType, data: base64 }},
        { type: "text", text: prompt }
      ]}]
    })
  });
  if (!response.ok) { const err = await response.json().catch(()=>({})); throw new Error(err?.error?.message || `API Error ${response.status}`); }
  const data = await response.json();
  const text = data.content.map(b => b.text || "").join("").trim();
  const stripped = text.replace(/```json|```/g, "").trim();
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");
  const parsed = JSON.parse(jsonMatch[0]);
  const pDays = dateDiff(parsed.periodFrom, parsed.periodTo);
  const farmDays = calcVisaDays(parsed.hoursWorked||0, pDays);
  const date = parsed.periodFrom&&parsed.periodTo ? parsed.periodFrom+" – "+parsed.periodTo : "";
  return {
    gross:parsed.gross||0, net:parsed.net||0, tax:parsed.tax||0, super:parsed.super||0,
    hoursWorked:parsed.hoursWorked||0, periodFrom:parsed.periodFrom||"", periodTo:parsed.periodTo||"",
    periodDays:pDays, employer:parsed.employer||"Unknown Employer", name:parsed.name||"Employee",
    abn:(parsed.abn||"").replace(/\s/g,""), date, farmDays,
    deductionWarning:(parsed.gross||0)>0&&(parsed.net||0)>0&&(parsed.net||0)<(parsed.gross||0)*0.5,
    valid:(parsed.gross||0)>0||(parsed.net||0)>0
  };
}

function ConfettiCelebration({milestone, onDone}){
  const canvasRef = useRef();
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const COLORS = ["#1a7a4a","#34d399","#0d9488","#f97316","#fbbf24","#a3e635","#60a5fa","#f472b6"];
    const particles = Array.from({length:120},()=>({
      x:Math.random()*canvas.width, y:-20-Math.random()*100,
      w:6+Math.random()*8, h:10+Math.random()*14,
      color:COLORS[Math.floor(Math.random()*COLORS.length)],
      rotation:Math.random()*360, vx:(Math.random()-0.5)*4,
      vy:3+Math.random()*5, vr:(Math.random()-0.5)*8,
    }));
    let frame, start = Date.now();
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      const elapsed = Date.now()-start;
      particles.forEach(p=>{
        p.x+=p.vx; p.y+=p.vy; p.rotation+=p.vr; p.vy+=0.08;
        ctx.save(); ctx.translate(p.x+p.w/2, p.y+p.h/2); ctx.rotate(p.rotation*Math.PI/180);
        ctx.fillStyle=p.color; ctx.globalAlpha=Math.max(0,1-(elapsed-2000)/1000);
        ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h); ctx.restore();
      });
      if(elapsed<3000) frame=requestAnimationFrame(draw); else onDone();
    };
    frame=requestAnimationFrame(draw);
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

function ScanOverlay({draft}){
  const[scanPct,setScanPct]=useState(0);
  const rows=draft?[
    {label:"Employer",value:draft.employer&&draft.employer!=="Unknown Employer"?draft.employer:"—",y:16},
    {label:"Period",value:draft.date||"—",y:32},
    {label:"Gross Pay",value:draft.gross>0?fmt(draft.gross):"—",y:50},
    {label:"Hours",value:draft.hoursWorked>0?`${draft.hoursWorked}h`:"—",y:66},
    {label:"Visa days",value:draft.farmDays>0?`+${fmtN(draft.farmDays)}d`:"—",y:82,highlight:true},
  ]:[];
  useEffect(()=>{const start=Date.now(),dur=2200;const tick=()=>{const p=Math.min((Date.now()-start)/dur*100,100);setScanPct(p);if(p<100)requestAnimationFrame(tick);};requestAnimationFrame(tick);},[]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(245,243,238,0.97)",backdropFilter:"blur(8px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.2s ease"}}>
      <div style={{width:"min(300px,84vw)",background:C.bgCard,borderRadius:18,boxShadow:"0 8px 40px rgba(0,0,0,0.12)",border:`1px solid ${C.border}`,overflow:"hidden"}}>
        <div style={{background:C.green,padding:"14px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#fff",fontStyle:"italic"}}>Reading your payslip…</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:"rgba(255,255,255,0.6)",marginTop:1,letterSpacing:"0.06em"}}>WORKING HOLIDAY VISA · AUS</div>
          </div>
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
                  {shown&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green,fontWeight:600}}>visa farm days</span>}
                </div>
              ):(
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:i===2?15:12,fontWeight:i===2?700:500,color:shown?(i===2?C.text:C.textMid):"transparent",background:shown?"transparent":C.bgMuted,borderRadius:shown?0:4,height:shown?"auto":10,transition:"color 0.3s ease,background 0.3s ease",minWidth:shown?0:(i%2===0?"65%":"45%")}}>{shown?row.value:""}</div>
              )}
            </div>
          );})}
        </div>
      </div>
      <div style={{marginTop:16,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,letterSpacing:"0.06em",animation:"pulse 1.5s ease infinite"}}>Analysing your payslip…</div>
    </div>
  );
}


function FiscalBanner(){
  const now=new Date();
  const isSecondHalf=now.getMonth()>=6;
  const fyStartYear=isSecondHalf?now.getFullYear():now.getFullYear()-1;
  const fyEndYear=fyStartYear+1;
  const fyStart=new Date(fyStartYear,6,1),fyEnd=new Date(fyEndYear,5,30);
  const months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const fmtShort=d=>`${months[d.getMonth()]} ${d.getFullYear()}`;
  const pct=Math.min((Math.max(now-fyStart,0))/(fyEnd-fyStart),1);
  return(
    <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border}`,padding:"7px 20px",display:"flex",alignItems:"center",gap:12}}>
      <span style={{fontSize:13}}>📅</span>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.text,whiteSpace:"nowrap"}}>Australian Tax Year · {fyStartYear}–{fyEndYear}</span>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,whiteSpace:"nowrap"}}>{fmtShort(fyStart)} → {fmtShort(fyEnd)}</span>
      <div style={{flex:1,height:4,background:C.border,borderRadius:99,overflow:"hidden",minWidth:40}}>
        <div style={{height:"100%",width:`${pct*100}%`,background:`linear-gradient(90deg,${C.teal},#34d399)`,borderRadius:99}}/>
      </div>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,fontWeight:600,whiteSpace:"nowrap"}}>{Math.max(0,Math.ceil((fyEnd-now)/(7*86400000)))} wks left</span>
    </div>
  );
}

function HeroProgress({totalDays,goal,onGoalChange,rooJump=false}){
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
        {done&&<div style={{fontFamily:"Georgia,serif",fontSize:15,fontStyle:"italic",color:C.green,marginTop:6}}>🏁 Visa ready — Congratulations!</div>}
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

const STAT_ICONS={gross:"💰",net:"💵",tax:"🧾",super:"🦘"};
const STAT_COLORS={gross:C.text,net:C.green,tax:C.red,super:"#6366f1"};
const STAT_LABELS={gross:"Total Gross",net:"Net Received",tax:"Tax Paid",super:"Superannuation"};

function StatCards({totals}){
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,padding:"0 20px 20px",maxWidth:640,margin:"0 auto",width:"100%"}}>
      {["gross","net","tax","super"].map(k=>(
        <div key={k} className="stat-card" style={{background:C.bgCard,borderRadius:14,padding:"14px 12px",border:`1px solid ${C.border}`,boxShadow:C.shadow}}>
          <div style={{fontSize:18,marginBottom:6}}>{STAT_ICONS[k]}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4}}>{STAT_LABELS[k]}</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:"clamp(11px,2vw,16px)",fontWeight:600,color:STAT_COLORS[k]}}>{fmt(totals[k])}</div>
        </div>
      ))}
    </div>
  );
}

function EntryCard({entry,index,isLast,onDelete,onEdit}){
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
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{entry.date}{wh&&<span style={{color:C.teal}}> · {wh}h/wk</span>}{entry.abn&&<span> · ABN {entry.abn}</span>}</div>
          </div>
          <div style={{flexShrink:0,textAlign:"right",minWidth:90}}>
            {!entry.hoursWorked||entry.hoursWorked===0?(
              <div style={{display:"inline-flex",alignItems:"center",gap:4,background:C.amberBg,border:"1px solid #fde68a",borderRadius:8,padding:"4px 10px"}}><span style={{fontSize:12}}>⚠️</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.amber,fontWeight:600}}>Hours missing</span></div>
            ):raw===0?(
              <div style={{display:"inline-flex",alignItems:"baseline",gap:2,background:C.redBg,border:"1px solid #fca5a5",borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.red}}>+0.0</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.red,fontWeight:600}}>d visa</span></div>
            ):(
              <div style={{display:"inline-flex",alignItems:"baseline",gap:2,background:C.greenBg,border:`1px solid ${C.greenBorder}`,borderRadius:8,padding:"4px 10px"}}><span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.green}}>+{fmtN(raw)}</span><span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,fontWeight:600}}>d visa</span></div>
            )}
            {hasDecimal&&raw>0&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,marginTop:2,textAlign:"center"}}>{floor} counted</div>}
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`,minWidth:0}}>
          <div style={{minWidth:0,overflow:"hidden",flexShrink:1,marginRight:8}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:15,fontWeight:600,color:C.text}}>{fmt(entry.gross)}</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginLeft:6}}>gross</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.red,marginLeft:12}}>−{fmt(entry.tax)} tax</span>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0}}>
            <button className="btn-edit" onClick={()=>onEdit(entry)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11}}>Edit</button>
            <button className="btn-danger" onClick={()=>onDelete(index)} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11}}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TapField({label,value,onChange,color=C.text,missing=false,prefix="$",placeholder="0.00",suffix=""}){
  const[editing,setEditing]=useState(false);
  const inputRef=useRef();
  useEffect(()=>{if(editing){inputRef.current?.focus();inputRef.current?.select();}},[editing]);
  return(
    <div onClick={()=>setEditing(true)} style={{background:missing?"rgba(220,38,38,0.03)":editing?"#fff":C.bgMuted,borderRadius:12,padding:"12px 14px",border:`2px solid ${missing?"#fca5a5":editing?C.teal:C.border}`,cursor:"text",transition:"all 0.15s ease",minHeight:64,display:"flex",flexDirection:"column",justifyContent:"space-between",boxShadow:editing?`0 0 0 3px rgba(13,148,136,0.1)`:"none"}}>
      <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,fontWeight:600,color:missing?C.red:editing?C.teal:C.textFaint,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}{missing?" ⚠":""}</span>
      {editing?(
        <input ref={inputRef} type="number" inputMode="decimal" style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:C.text,background:"transparent",border:"none",outline:"none",width:"100%",padding:0,marginTop:4}} value={value} onChange={e=>onChange(e.target.value)} onBlur={()=>setEditing(false)} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape"){setEditing(false);e.preventDefault();}}} placeholder={placeholder}/>
      ):(
        <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:18,fontWeight:700,color:missing?C.red:color,marginTop:4}}>{value?`${prefix}${value}${suffix}`:<span style={{fontSize:12,fontWeight:500,color:C.red}}>Tap to enter</span>}</div>
      )}
    </div>
  );
}

function Modal({draft,filename,onConfirm,onDismiss,editMode=false}){
  const[step,setStep]=useState(editMode?"details":"summary");
  const[v,setV]=useState({gross:draft.gross>0?String(draft.gross):"",net:draft.net>0?String(draft.net):"",tax:draft.tax>0?String(draft.tax):"",super:draft.super>0?String(draft.super):"",employer:draft.employer!=="Unknown Employer"?draft.employer:"",hours:draft.hoursWorked>0?String(draft.hoursWorked):"",pDays:draft.periodDays>0?String(draft.periodDays):"",date:draft.date||"",abn:draft.abn||""});
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
  const finalDays = overrideDays!==null&&overrideDays!==""?parseFloat(overrideDays):vdRaw;
  const handleConfirm=()=>onConfirm({gross:pn(v.gross),net:pn(v.net),tax:pn(v.tax),super:pn(v.super),employer:v.employer||"Unknown Employer",date:v.date,abn:v.abn,farmDays:finalDays,hoursWorked:lh,periodDays:lp,name:draft.name,valid:true,overrideDays:overrideDays?parseFloat(overrideDays)||null:null});
  const weekShort=[["7","1 wk"],["14","2 wks"],["30","1 mo"]];
  return(
    <div style={{position:"fixed",inset:0,zIndex:150,background:"rgba(245,243,238,0.85)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto",animation:"fadeIn 0.2s ease"}}>
      <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:20,padding:28,width:"100%",maxWidth:420,boxShadow:C.shadowMd,animation:"fadeUp 0.3s ease"}}>
        {step==="summary"?(
          <>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:8,fontWeight:600}}>Scan complete</div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:C.text,marginBottom:4}}>{v.employer||filename.replace(".pdf","")}</div>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint}}>{v.date||filename}</div>
            </div>
            {vdRaw>0?(
              <div style={{background:C.greenBg,border:`1.5px solid ${C.greenBorder}`,borderRadius:14,padding:"20px 24px",textAlign:"center",marginBottom:16}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.green,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>We detected</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:700,color:C.green,lineHeight:1}}>+{fmtN(vdRaw)}</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.green,marginTop:4,fontWeight:500}}>visa farm days</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid,marginTop:8}}>{lh}h worked over {lp} days</div>
                {hasDecimal&&<div style={{marginTop:10,padding:"8px 12px",background:"rgba(180,83,9,0.07)",borderRadius:8,fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.amber}}>ℹ️ Immigration counts full days only — <strong>{vdFloor}</strong> counted.</div>}
              </div>
            ):(
              <div style={{background:C.amberBg,border:"1px solid #fde68a",borderRadius:14,padding:16,textAlign:"center",marginBottom:16}}>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.amber,fontWeight:500}}>⏱ Hours not detected — tap the field below to enter</div>
              </div>
            )}
            {deductionWarning&&<div style={{background:"rgba(220,38,38,0.05)",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 12px",marginBottom:16,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.red}}>⚠️ <strong>Deductions detected</strong> — Net ({fmt(netV)}) is less than 50% of gross ({fmt(grossV)}).</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <TapField label="Gross Pay" value={v.gross} onChange={set("gross")} color={C.text} missing={!v.gross||pn(v.gross)===0}/>
              <TapField label="Net Pay" value={v.net} onChange={set("net")} color={C.green} missing={!v.net||pn(v.net)===0}/>
              <TapField label="PAYG Tax" value={v.tax} onChange={set("tax")} color={C.red} missing={!v.tax||pn(v.tax)===0}/>
              <TapField label="Superannuation" value={v.super} onChange={set("super")} color="#6366f1" missing={!v.super||pn(v.super)===0}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <TapField label="Hours worked" value={v.hours} onChange={set("hours")} prefix="" suffix="h" placeholder="75.92" color={C.teal} missing={!v.hours||parseFloat(v.hours)===0}/>
              <div>
                <TapField label="Period length" value={v.pDays} onChange={set("pDays")} prefix="" suffix=" d" placeholder="14" color={C.textMid} missing={lh>0&&lp===0}/>
                {lh>0&&lp===0&&<div style={{display:"flex",gap:6,marginTop:6}}>{weekShort.map(([d,l])=><button key={d} onClick={()=>set("pDays")(d)} style={{flex:1,padding:"7px 0",borderRadius:8,border:`1.5px solid ${C.greenBorder}`,background:C.greenBg,color:C.green,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600}}>{l}</button>)}</div>}
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={onDismiss} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13}}>Ignore</button>
              <button onClick={()=>setStep("details")} style={{flex:1,padding:"12px",borderRadius:10,border:`1.5px solid ${C.teal}`,background:C.bgCard,color:C.teal,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12,fontWeight:600}}>Edit manually</button>
              <button onClick={handleConfirm} style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:C.green,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>Confirm ✓</button>
            </div>
          </>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.teal,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:3}}>{editMode?"Edit payslip":"All data"}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text}}>Edit manually</div></div>
              {missing.length>0&&<div style={{background:C.redBg,border:"1px solid #fca5a5",borderRadius:8,padding:"4px 8px",fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.red}}>{missing.length} missing</div>}
            </div>
            {deductionWarning&&<div style={{background:"rgba(220,38,38,0.05)",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 12px",marginBottom:14,fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.red}}>⚠️ Net less than 50% of gross — farm deductions likely.</div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              {[["gross","Gross Pay"],["net","Net Pay"],["tax","PAYG Tax"],["super","Superannuation"]].map(([k,l])=>(
                <div key={k}><label style={{...LBL,color:pn(v[k])>0?C.textFaint:C.red}}>{l}{pn(v[k])===0?" ⚠":""}</label><input style={INP(pn(v[k])===0)} value={v[k]} onChange={setE(k)} placeholder="0.00"/></div>
              ))}
            </div>
            <div style={{background:C.greenBg,border:`1.5px solid ${C.greenBorder}`,borderRadius:12,padding:14,marginBottom:14}}>
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>88-Day Count</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><label style={{...LBL,color:lh>0?C.textFaint:C.red}}>Hours worked{!lh?" ⚠":""}</label><input style={INP(!lh)} value={v.hours} onChange={setE("hours")} placeholder="75.92"/></div>
                <div><label style={{...LBL,color:lp>0?C.textFaint:lh>0?C.amber:C.textFaint}}>Period length{lh>0&&!lp?" ⚠":""}</label><input style={INP(lh>0&&!lp)} value={v.pDays} onChange={setE("pDays")} placeholder="14"/></div>
              </div>
              {missingPeriod&&<div style={{display:"flex",gap:6,marginBottom:10}}>{weekShort.map(([d,l])=><button key={d} className="period-btn" onClick={()=>setV(p=>({...p,pDays:d}))} style={{flex:1,padding:"6px 4px",borderRadius:7,border:`1px solid ${C.greenBorder}`,background:C.bgCard,color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:11}}>{l}</button>)}</div>}
              {lh>0&&lp>0&&<div style={{background:C.bgCard,borderRadius:8,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textMid}}>{lh}h worked over {lp} days{hasDecimal&&<div style={{fontSize:9,color:C.amber,marginTop:2}}>{vdFloor} counted</div>}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:vdRaw>0?C.green:C.red}}>{vdRaw>0?"+"+fmtN(vdRaw):"?"}</div></div>}
            </div>
            <div style={{marginBottom:14}}>
              <label style={{...LBL}}>Visa days <span style={{color:C.textFaint,fontWeight:400,textTransform:"none",letterSpacing:0}}>(override — auto{vdRaw>0?": "+fmtN(vdRaw)+"d":""})</span></label>
              <input type="number" inputMode="decimal" value={overrideDays??""} onChange={e=>setOverrideDays(e.target.value||null)} placeholder={vdRaw>0?fmtN(vdRaw)+" (auto)":"leave blank = auto"} style={{...INP(),color:overrideDays?C.green:C.textFaint,fontWeight:overrideDays?700:400}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={LBL}>Period</label><input style={INP()} value={v.date} onChange={setE("date")} placeholder="01/06 – 14/06"/></div>
              <div><label style={LBL}>Employer</label><input style={INP()} value={v.employer} onChange={setE("employer")} placeholder="Name"/></div>
            </div>
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                <label style={LBL}>ABN</label>
                {v.abn&&v.abn.replace(/\s/g,"").length>0&&(validateABN(v.abn)?<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.green,fontWeight:600}}>✓ Valid</span>:<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.red,fontWeight:600}}>✗ Invalid</span>)}
              </div>
              <input style={{...INP(v.abn&&v.abn.replace(/\s/g,"").length>0&&!validateABN(v.abn)),letterSpacing:"0.05em"}} value={v.abn} onChange={setE("abn")} placeholder="XX XXX XXX XXX" maxLength={14} inputMode="numeric"/>
            </div>
            <div style={{display:"flex",gap:10}}>
              {!editMode&&<button onClick={()=>setStep("summary")} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>← Back</button>}
              <button onClick={onDismiss} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:12}}>Cancel</button>
              <button onClick={handleConfirm} style={{flex:2,padding:"12px",borderRadius:10,border:"none",background:C.green,color:"#fff",cursor:"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>{editMode?"Save ✓":"Confirm ✓"}</button>
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

export default function VisaRunApp(){
  const[entries,setEntries]=useState([]);
  const[goal,setGoal]=useState(88);
  const[rooJump,setRooJump]=useState(false);
  const[confetti,setConfetti]=useState(null);
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
  },[entries]);
  const prevDays=useRef(0);
  const[scanning,setScanning]=useState(null);
  const[toast,setToast]=useState(null);
  const[modal,setModal]=useState(null);
  const[dragging,setDragging]=useState(false);
  const fileRef=useRef();
  const resolver=useRef(null);

  useEffect(()=>{
    loadEntries().then(e=>setEntries(e));
    loadGoal().then(g=>setGoal(g));
  },[]);

  useEffect(()=>{
    if(document.getElementById("vr-fonts"))return;
    const l=document.createElement("link");l.id="vr-fonts";l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap";document.head.appendChild(l);
  },[]);
  useEffect(()=>{
    if(document.getElementById("vr-css"))return;
    const s=document.createElement("style");s.id="vr-css";s.textContent=CSS;document.head.appendChild(s);
  },[]);

  useEffect(()=>{ saveEntries(entries); },[entries]);
  useEffect(()=>{ saveGoal(goal); },[goal]);

  const totalDays=Math.floor(entries.reduce((s,e)=>s+(e.farmDays??0),0));
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

  const deleteEntry=useCallback(i=>{const e=sorted[i];setEntries(p=>p.filter(x=>x!==e));showToast("Payslip deleted.",false);},[sorted]);
  const editEntry=useCallback(entry=>{setModal({draft:entry,filename:entry.filename||"",editMode:true,originalEntry:entry});},[]);
  const addEntry=useCallback((data,filename)=>{setEntries(p=>[{...data,filename},...p]);const raw=data.farmDays??0;const last=data.name?.split(/[\s,]+/).filter(Boolean).pop()||"";showToast(`${last}\n${fmt(data.gross)} gross · +${fmtN(raw)} d visa`);setRooJump(true);setTimeout(()=>setRooJump(false),1200);},[]);
  const saveEdit=useCallback((data,originalEntry)=>{setEntries(p=>p.map(e=>e===originalEntry?{...data,filename:originalEntry.filename}:e));showToast("Payslip updated ✓");},[]);

  const processFiles=useCallback(async(files)=>{
    for(const file of files){
      setScanning({employer:"",date:"",gross:0,hoursWorked:0,farmDays:0});
      try{
        const isImage = file.type.startsWith("image/");
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
        showToast(`Error: ${err.message}`,false);
        resolver.current?.();resolver.current=null;
      }
    }
    if(fileRef.current)fileRef.current.value="";
  },[addEntry]);

  const handleConfirm=data=>{const{filename,editMode,originalEntry}=modal;setModal(null);if(editMode)saveEdit(data,originalEntry);else addEntry(data,filename);resolver.current?.();resolver.current=null;};
  const handleDismiss=()=>{setModal(null);if(!modal?.editMode)showToast("Payslip ignored.",false);resolver.current?.();resolver.current=null;};

  return(
    <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);processFiles(Array.from(e.dataTransfer.files));}} style={{background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      {confetti&&<ConfettiCelebration milestone={confetti} onDone={()=>setConfetti(null)}/>}
      {scanning&&<ScanOverlay draft={scanning}/>}
      {toast&&<Toast msg={toast.msg} ok={toast.ok}/>}
      {modal&&<Modal draft={modal.draft} filename={modal.filename} editMode={modal.editMode||false} onConfirm={handleConfirm} onDismiss={handleDismiss}/>}

      {/* Header */}
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:C.bgCard}}>
        <div style={{width:36,height:36,borderRadius:10,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🦘</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text,letterSpacing:"-0.02em"}}>Visa Run</div>
          <div style={{fontSize:10,color:C.textFaint,marginTop:1}}>Count your days, live your run · Australia</div>
        </div>
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:10}}>
          {streak>0&&<div style={{background:C.amberBg,border:"1px solid #fde68a",borderRadius:8,padding:"5px 10px",fontSize:11,color:C.amber,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><span>🔥</span>{streak}w</div>}
          
        </div>
      </div>

      <FiscalBanner/>
      <HeroProgress totalDays={totalDays} goal={goal} onGoalChange={setGoal} rooJump={rooJump}/>
      <StatCards totals={totals}/>

      <div style={{maxWidth:600,margin:"0 auto",padding:"0 20px 40px"}}>
        <input ref={fileRef} type="file" accept=".pdf,image/*" multiple style={{display:"none"}} onChange={e=>processFiles(Array.from(e.target.files))}/>
        {sorted.length===0&&(
          <div style={{paddingTop:8}}>
            <div className="drop-zone" onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragging?C.green:C.greenBorder}`,borderRadius:16,padding:"32px 24px",textAlign:"center",cursor:"pointer",marginBottom:12,background:dragging?C.greenBg:C.bgCard,boxShadow:C.shadow}}>
              <div style={{fontSize:64,lineHeight:1,marginBottom:12,display:"inline-block",filter:"drop-shadow(0 4px 12px rgba(26,122,74,0.2))"}}>🦘</div>
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
              <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:10,color:C.textFaint,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600}}>History · {sorted.length} {sorted.length>1?"payslips":"payslip"}</div>
              <div style={{flex:1,height:1,background:C.border}}/>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:11,fontStyle:"italic",color:C.teal}}>{fmtN(entries.reduce((s,e)=>s+(e.farmDays??0),0))} days accumulated</div>
            </div>
            {sorted.map((e,i)=><EntryCard key={e.filename+i} entry={e} index={i} isLast={i===sorted.length-1} onDelete={deleteEntry} onEdit={editEntry}/>)}
            <div className="drop-zone" onClick={()=>fileRef.current?.click()} style={{border:`2px dashed ${dragging?C.green:C.border}`,borderRadius:12,padding:"14px 20px",textAlign:"center",cursor:"pointer",marginTop:20,background:dragging?C.greenBg:"transparent",display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
              <span style={{fontSize:16}}>📄</span>
              <span style={{fontSize:14}}>📸</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textFaint,fontWeight:500}}>Add a payslip · <span style={{color:C.teal}}>Browse</span></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
