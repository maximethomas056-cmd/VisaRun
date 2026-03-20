import { useState, useEffect, useRef, useCallback } from "react";
import { JOB_DATA } from "../data/JOB_DATA_FINAL";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:"#f5f3ee", bgCard:"#ffffff", bgMuted:"#f0ede6",
  border:"#e8e3d9", text:"#1a1a18", textMid:"#5a5850", textFaint:"#9a9488",
  green:"#1a7a4a", greenLight:"#edf7f1", greenBorder:"#b8e0c8",
  teal:"#0d9488", amber:"#b45309", amberBg:"#fef9ec",
  red:"#dc2626", redBg:"#fff1f2",
  shadow:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowLg:"0 8px 40px rgba(0,0,0,0.14)",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const FREE_LIMIT = 5; // show 5 free results (more generous = more trust)
const PRICE = "A$24.90";
const CHECKOUT_URL = "https://visarun.lemonsqueezy.com/checkout"; // placeholder

const SECTORS = ["Farm","Mine","Construction","Roadhouse","Solar","Fish","Abattoir","Forestry"];
const STATES  = ["QLD","WA","NSW","VIC","TAS","NT","SA"];
const STATE_ORDER = {QLD:0,WA:1,NSW:2,VIC:3,TAS:4,NT:5,SA:6};

const SECTOR_ICONS = {
  Farm:"🌾", Mine:"⛏️", Construction:"🏗️", Roadhouse:"🛣️",
  Solar:"☀️", Fish:"🐟", Abattoir:"🥩", Forestry:"🌲",
  Other:"🏢", Hostel:"🏨", Recruitment:"👥",
};

const STATE_COLORS = {
  QLD:"#e67e22", WA:"#2980b9", NSW:"#8e44ad",
  VIC:"#16a085", TAS:"#c0392b", NT:"#d35400", SA:"#27ae60",
};

const CITY_COORDS = {
  "Bundaberg":{lat:-24.87,lng:152.35},"Bowen":{lat:-20.01,lng:148.24},
  "Stanthorpe":{lat:-28.65,lng:151.93},"Mareeba":{lat:-17.00,lng:145.43},
  "Carnarvon":{lat:-24.87,lng:113.66},"Swan Valley":{lat:-31.82,lng:116.01},
  "Margaret River":{lat:-33.95,lng:115.07},"Healesville":{lat:-37.65,lng:145.52},
  "Cessnock":{lat:-32.83,lng:151.35},"Launceston":{lat:-41.43,lng:147.14},
  "Newman":{lat:-23.36,lng:119.73},"Tom Price":{lat:-22.69,lng:117.79},
  "Port Hedland":{lat:-20.31,lng:118.57},"Mount Isa":{lat:-20.72,lng:139.49},
  "Singleton":{lat:-32.57,lng:151.17},"Port Augusta":{lat:-32.49,lng:137.76},
  "Geraldton":{lat:-28.77,lng:114.61},"Mackay":{lat:-21.14,lng:149.18},
  "Darwin":{lat:-12.46,lng:130.84},"Brisbane":{lat:-27.47,lng:153.02},
  "Dubbo":{lat:-32.24,lng:148.60},"Kalgoorlie":{lat:-30.74,lng:121.46},
  "Hobart":{lat:-42.88,lng:147.33},"Rockhampton":{lat:-23.38,lng:150.51},
  "Cairns":{lat:-16.92,lng:145.77},"Townsville":{lat:-19.26,lng:146.82},
  "Alice Springs":{lat:-23.70,lng:133.88},"Perth":{lat:-31.95,lng:115.86},
  "Adelaide":{lat:-34.93,lng:138.60},"Sydney":{lat:-33.87,lng:151.21},
  "Melbourne":{lat:-37.81,lng:144.96},
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
];

function haversine(lat1,lng1,lat2,lng2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}

async function copyToClipboard(text){
  try{await navigator.clipboard.writeText(text);return true;}
  catch{try{const el=document.createElement("input");el.style.cssText="position:fixed;opacity:0;top:0;left:0;";el.value=text;document.body.appendChild(el);el.focus();el.select();document.execCommand("copy");document.body.removeChild(el);return true;}catch{return false;}}
}

// ─── CopyBtn ──────────────────────────────────────────────────────────────────
function CopyBtn({text}){
  const[status,setStatus]=useState("idle");
  const handle=async(e)=>{e.preventDefault();e.stopPropagation();const ok=await copyToClipboard(text);setStatus(ok?"ok":"err");setTimeout(()=>setStatus("idle"),2000);};
  return(
    <button onClick={handle} title="Copy" style={{background:status==="ok"?C.greenLight:status==="err"?C.redBg:C.bgMuted,color:status==="ok"?C.green:status==="err"?C.red:C.textFaint,border:`1px solid ${C.border}`,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,flexShrink:0,transition:"all 0.18s"}}>
      {status==="ok"?"✓":status==="err"?"✗":"📋"}
    </button>
  );
}

// ─── EmployerModal ────────────────────────────────────────────────────────────
function EmployerModal({job, onClose, paid, onUnlock}){
  useEffect(()=>{
    const handleKey=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",handleKey);
    return()=>document.removeEventListener("keydown",handleKey);
  },[]);

  const stateColor = STATE_COLORS[job.state]||"#888";

  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(26,26,24,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 80px",animation:"fadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,maxHeight:"80vh",overflowY:"auto",boxShadow:C.shadowLg,animation:"slideUp 0.3s cubic-bezier(.34,1.56,.64,1)"}}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${stateColor}22,${stateColor}08)`,borderBottom:`1px solid ${C.border}`,padding:"20px 20px 16px",position:"sticky",top:0,backdropFilter:"blur(12px)"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:48,height:48,borderRadius:12,background:C.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1px solid ${C.border}`}}>
              {SECTOR_ICONS[job.sector]||"🏢"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text}}>{job.name}</span>
                {job.isNew&&<span style={{fontSize:9,fontWeight:700,color:"#fff",background:C.amber,borderRadius:5,padding:"2px 6px"}}>NEW</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:C.teal,fontWeight:600}}>{job.sector}</span>
                <span style={{fontSize:11,color:C.textFaint}}>· 88-day eligible</span>
                <span style={{background:stateColor+"22",border:`1px solid ${stateColor}55`,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,color:stateColor}}>{job.state}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:C.textFaint,padding:4,flexShrink:0}}>✕</button>
          </div>
        </div>

        <div style={{padding:"16px 20px 24px"}}>

          {/* Rating */}
          {job.score>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,background:C.bgMuted,borderRadius:10,padding:"10px 14px"}}>
              <div style={{display:"flex",gap:2}}>
                {[1,2,3,4,5].map(i=>(
                  <span key={i} style={{fontSize:14,color:i<=Math.round(job.score)?"#f59e0b":"#e2e8f0"}}>★</span>
                ))}
              </div>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{job.score}</span>
              {job.reviews>0&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint}}>({job.reviews} reviews)</span>}
            </div>
          )}

          {/* Location */}
          <div style={{background:C.bgMuted,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Location</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>📍</span>
              <div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent((job.address||job.name)+", "+(job.city||"")+", Australia")}`} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:C.green,textDecoration:"none"}}>
                  {job.city||job.state}
                </a>
                {job.address&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginTop:2}}>{job.address}</div>}
              </div>
            </div>
          </div>

          {/* Website */}
          {job.website&&(
            <div style={{marginBottom:12}}>
              <a href={job.website} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:10,padding:"10px 14px",textDecoration:"none"}}>
                <span style={{fontSize:14}}>🌐</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.green,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.website.replace(/https?:\/\/(www\.)?/,"")}</span>
                <span style={{fontSize:11,color:C.green}}>→</span>
              </a>
            </div>
          )}

          {/* Contacts */}
          <div style={{background:paid?C.bgCard:C.bgMuted,border:`1.5px solid ${paid?C.greenBorder:C.border}`,borderRadius:12,padding:"14px",marginBottom:paid?0:16}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:paid?C.green:C.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:10}}>{paid?"Direct contacts":"Contacts locked"}</div>

            {/* Phone */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:14,flexShrink:0}}>📞</span>
              {paid?(
                <>
                  <a href={`tel:${(job.phone||"").replace(/\s/g,"")}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.green,fontWeight:600,flex:1,textDecoration:"none"}}>{job.phone||"—"}</a>
                  {job.phone&&<CopyBtn text={job.phone}/>}
                </>
              ):(
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:C.textMid,filter:"blur(4px)",userSelect:"none",flex:1}}>{(job.phone||"+61 x xxxx xxxx").slice(0,7)}xxx xxxx</span>
              )}
            </div>

            {/* Email */}
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14,flexShrink:0}}>✉️</span>
              {paid?(
                <>
                  <a href={`mailto:${job.email}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,flex:1,textDecoration:"none",wordBreak:"break-all"}}>{job.email||"—"}</a>
                  {job.email&&<CopyBtn text={job.email}/>}
                </>
              ):(
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,filter:"blur(4px)",userSelect:"none",flex:1}}>{job.email?job.email.slice(0,2)+"xxxxx@"+job.email.split("@")[1]:"xxxxx@employer.com.au"}</span>
              )}
            </div>
          </div>

          {/* CTA if not paid */}
          {!paid&&(
            <button onClick={onUnlock} style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:C.green,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(26,122,74,0.3)"}}>
              🔓 Unlock all contacts — {PRICE}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main JobFinder ───────────────────────────────────────────────────────────
export default function JobFinder(){
  const[sector,setSector]=useState(null);
  const[stateF,setStateF]=useState(null);
  const[paid,setPaid]=useState(false);
  const[selectedJob,setSelectedJob]=useState(null);
  const[cityInput,setCityInput]=useState("");
  const[cityCoords,setCityCoords]=useState(null);
  const[suggestions,setSuggestions]=useState([]);
  const[search,setSearch]=useState("");

  // CSS
  useEffect(()=>{
    const s=document.createElement("style");s.id="jf-styles";
    s.textContent=`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
      @keyframes rowIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      @keyframes reveal{0%{filter:blur(6px);opacity:0.4}100%{filter:blur(0);opacity:1}}
      .jf-chip{transition:all 0.15s;cursor:pointer;}
      .jf-chip:hover{border-color:#1a7a4a!important;background:#edf7f1!important;color:#1a7a4a!important;}
      .jf-card{transition:transform 0.15s,box-shadow 0.15s,border-color 0.15s;cursor:pointer;}
      .jf-card:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(0,0,0,0.09)!important;border-color:#b8e0c8!important;}
      .jf-card-reveal{animation:reveal 0.5s ease forwards;}
      .jf-cta{transition:all 0.2s;border:none;cursor:pointer;}
      .jf-cta:hover{transform:translateY(-1px);filter:brightness(1.05);}
      .jf-city:focus{outline:none;border-color:#1a7a4a!important;box-shadow:0 0 0 3px rgba(26,122,74,0.1);}
      ::-webkit-scrollbar{width:0;}
    `;
    if(!document.getElementById("jf-styles"))document.head.appendChild(s);
    return()=>document.getElementById("jf-styles")?.remove();
  },[]);

  // City suggestions
  useEffect(()=>{
    if(cityInput.length<2){setSuggestions([]);return;}
    const q=cityInput.toLowerCase();
    setSuggestions(AU_CITIES.filter(c=>c.toLowerCase().startsWith(q)).slice(0,5));
  },[cityInput]);

  const selectCity=useCallback((city)=>{
    setCityInput(city);setSuggestions([]);
    const c=CITY_COORDS[city];if(c)setCityCoords(c);
  },[]);

  // Filter & sort
  const filtered = JOB_DATA.filter(j=>{
    if(sector&&j.sector!==sector)return false;
    if(stateF&&j.state!==stateF)return false;
    if(search&&!j.name.toLowerCase().includes(search.toLowerCase())&&!(j.city||"").toLowerCase().includes(search.toLowerCase()))return false;
    // Only show eligible sectors
    const eligible=["Farm","Mine","Construction","Roadhouse","Solar","Fish","Abattoir","Forestry"];
    // Include all if no filter, but show "Other"/"Hostel" etc only if no sector filter
    return true;
  });

  const sorted = cityCoords
    ? [...filtered].sort((a,b)=>{
        const ca=CITY_COORDS[a.city],cb=CITY_COORDS[b.city];
        if(!ca&&!cb)return 0;if(!ca)return 1;if(!cb)return-1;
        return haversine(cityCoords.lat,cityCoords.lng,ca.lat,ca.lng)-haversine(cityCoords.lat,cityCoords.lng,cb.lat,cb.lng);
      })
    : [...filtered].sort((a,b)=>{
        const ss=(STATE_ORDER[a.state]??99)-(STATE_ORDER[b.state]??99);
        if(ss!==0)return ss;
        return(b.score||0)-(a.score||0);
      });

  const visible = paid ? sorted : sorted.slice(0,FREE_LIMIT);
  const showWall = !paid && sorted.length>FREE_LIMIT;
  const lockedCount = sorted.length - FREE_LIMIT;

  const handleUnlock=()=>{
    window.open(CHECKOUT_URL,"_blank");
  };

  // sector counts
  const sectorCounts=SECTORS.reduce((acc,s)=>{
    acc[s]=JOB_DATA.filter(j=>j.sector===s&&(!stateF||j.state===stateF)).length;
    return acc;
  },{});

  const getDistLabel=(job)=>{
    if(!cityCoords)return null;
    const c=CITY_COORDS[job.city];if(!c)return null;
    return`${haversine(cityCoords.lat,cityCoords.lng,c.lat,c.lng)}km`;
  };

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>

      {/* Modal */}
      {selectedJob&&(
        <EmployerModal
          job={selectedJob}
          onClose={()=>setSelectedJob(null)}
          paid={paid}
          onUnlock={handleUnlock}
        />
      )}

      {/* Header */}
      <div style={{background:C.bgCard,borderBottom:`1px solid ${C.border}`,padding:"14px 18px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50,boxShadow:C.shadow}}>
        <div style={{width:34,height:34,borderRadius:9,background:C.green,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>🦘</div>
        <div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.text}}>WHV Job Finder</div>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.04em"}}>{JOB_DATA.length.toLocaleString()} verified employers · Direct contacts</div>
        </div>
        <div style={{marginLeft:"auto"}}>
          {paid?(
            <div style={{background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,color:C.green}}>✓ Full access</div>
          ):(
            <button onClick={handleUnlock} className="jf-cta" style={{background:C.green,color:"#fff",borderRadius:9,padding:"7px 14px",fontSize:12,fontWeight:700,boxShadow:"0 2px 8px rgba(26,122,74,0.25)"}}>
              Unlock {PRICE}
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#1a7a4a 0%,#0d3d22 100%)",padding:"24px 18px 22px",textAlign:"center"}}>
        <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:700,color:"#fff",lineHeight:1.2,marginBottom:6}}>
          Find your farm job.<br/>
          <span style={{fontStyle:"italic",fontWeight:400,fontSize:19,color:"rgba(255,255,255,0.75)"}}>Stay a second year.</span>
        </div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:16}}>Phone · Email · No middleman</div>
        <div style={{display:"flex",justifyContent:"center",gap:16,flexWrap:"wrap"}}>
          {[
            [`${JOB_DATA.length.toLocaleString()}+`,"Employers"],
            ["8","Sectors"],
            ["7","States"],
          ].map(([val,label])=>(
            <div key={label} style={{textAlign:"center"}}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#fff"}}>{val}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.5)",letterSpacing:"0.06em"}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:580,margin:"0 auto",padding:"14px 14px 140px"}}>

        {/* Search */}
        <div style={{marginBottom:14,position:"relative"}}>
          <input
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="Search by employer or city…"
            style={{width:"100%",padding:"11px 36px 11px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,background:C.bgCard,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.text,boxSizing:"border-box"}}
          />
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:14,color:C.textFaint,cursor:"pointer"}}>✕</button>}
        </div>

        {/* Sector filter */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>Sector</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {SECTORS.map(s=>{
              const active=sector===s;
              const n=sectorCounts[s]||0;
              return(
                <button key={s} className="jf-chip" onClick={()=>setSector(sector===s?null:s)} style={{padding:"7px 11px",borderRadius:9,border:`1.5px solid ${active?C.green:C.border}`,background:active?C.green:C.bgCard,color:active?"#fff":C.textMid,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                  {SECTOR_ICONS[s]} {s}
                  {n>0&&<span style={{fontSize:10,background:active?"rgba(255,255,255,0.2)":C.bgMuted,color:active?"#fff":C.textFaint,borderRadius:5,padding:"1px 5px",fontWeight:700}}>{n}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* State filter */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>State</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {STATES.map(st=>(
              <button key={st} className="jf-chip" onClick={()=>setStateF(stateF===st?null:st)} style={{padding:"6px 12px",borderRadius:9,border:`1.5px solid ${stateF===st?STATE_COLORS[st]:C.border}`,background:stateF===st?STATE_COLORS[st]:C.bgCard,color:stateF===st?"#fff":C.textMid,fontSize:12,fontWeight:700}}>{st}</button>
            ))}
          </div>
        </div>

        {/* City proximity (always visible) */}
        <div style={{marginBottom:14,position:"relative"}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>📍 Sort by distance from</div>
          <input
            className="jf-city"
            value={cityInput}
            onChange={e=>setCityInput(e.target.value)}
            placeholder="Your city… e.g. Brisbane, Perth"
            style={{width:"100%",padding:"10px 36px 10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bgCard,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.text,boxSizing:"border-box"}}
          />
          {cityInput&&<button onClick={()=>{setCityInput("");setCityCoords(null);setSuggestions([]);}} style={{position:"absolute",right:10,top:"calc(50% + 10px)",transform:"translateY(-50%)",background:"none",border:"none",fontSize:14,color:C.textFaint,cursor:"pointer"}}>✕</button>}
          {suggestions.length>0&&(
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:C.shadowLg,zIndex:20,overflow:"hidden"}}>
              {suggestions.map(city=>(
                <div key={city} onClick={()=>selectCity(city)} style={{padding:"10px 14px",fontSize:13,color:C.text,cursor:"pointer",borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.bgMuted} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  📍 {city}
                </div>
              ))}
            </div>
          )}
          {cityCoords&&<div style={{fontSize:11,color:C.green,fontWeight:600,marginTop:5}}>✓ Sorted by distance from {cityInput}</div>}
        </div>

        {/* Results count */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:C.bgMuted,borderRadius:10,padding:"10px 14px"}}>
          <span style={{fontSize:14}}>📋</span>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>
            <span style={{color:C.green,fontFamily:"'Playfair Display',serif",fontSize:18}}>{sorted.length}</span>
            {" "}employer{sorted.length!==1?"s":""} found
          </span>
          {!paid&&<span style={{marginLeft:"auto",fontSize:11,color:C.textFaint}}>{FREE_LIMIT} free · {Math.max(0,lockedCount)} locked</span>}
          {paid&&cityCoords&&<span style={{marginLeft:"auto",fontSize:10,color:C.green,fontWeight:600}}>📍 By proximity</span>}
        </div>

        {/* Cards */}
        {sorted.length===0?(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.text,marginBottom:8}}>No results found</div>
            <div style={{fontSize:13,color:C.textFaint,marginBottom:16}}>Try removing a filter</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {sector&&<button onClick={()=>setSector(null)} style={{padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.green}`,background:C.greenLight,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer"}}>✕ Remove "{sector}"</button>}
              {stateF&&<button onClick={()=>setStateF(null)} style={{padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.green}`,background:C.greenLight,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer"}}>✕ Remove "{stateF}"</button>}
            </div>
          </div>
        ):(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {visible.map((job,i)=>{
                const stateColor=STATE_COLORS[job.state]||"#888";
                const distLabel=getDistLabel(job);
                return(
                  <div key={job.name+i} className="jf-card" onClick={()=>setSelectedJob(job)} style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 15px",boxShadow:C.shadow,animation:`rowIn 0.3s ease ${Math.min(i,8)*0.05}s both`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:40,height:40,borderRadius:10,background:C.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                        {SECTOR_ICONS[job.sector]||"🏢"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                          <span style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.name}</span>
                          {job.isNew&&<span style={{fontSize:9,fontWeight:700,color:"#fff",background:C.amber,borderRadius:5,padding:"2px 5px",flexShrink:0}}>NEW</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:11,color:C.teal,fontWeight:600}}>{job.sector}</span>
                          {job.score>0&&(
                            <span style={{fontSize:10,color:C.textFaint}}>★ {job.score}</span>
                          )}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        <span style={{background:stateColor+"22",border:`1px solid ${stateColor}55`,borderRadius:7,padding:"3px 8px",fontSize:11,fontWeight:700,color:stateColor}}>{job.state}</span>
                        {distLabel&&<span style={{fontSize:10,color:C.green,fontWeight:600}}>{distLabel}</span>}
                      </div>
                    </div>

                    <div style={{display:"flex",alignItems:"center",gap:8,background:C.bgMuted,borderRadius:8,padding:"7px 10px"}}>
                      <span style={{fontSize:12}}>📍</span>
                      <span style={{fontSize:12,fontWeight:600,color:C.text}}>{job.city||job.state}</span>
                      {job.address&&<span style={{fontSize:11,color:C.textFaint,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {job.address}</span>}
                      <span style={{marginLeft:"auto",fontSize:11,color:C.teal,fontWeight:500,flexShrink:0}}>View →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paywall */}
            {showWall&&(
              <div style={{marginTop:16,background:C.bgCard,border:`2px solid ${C.greenBorder}`,borderRadius:18,overflow:"hidden",boxShadow:C.shadowLg}}>
                {/* Blurred preview */}
                <div style={{position:"relative",overflow:"hidden",padding:"12px 14px",background:C.bgMuted}}>
                  {sorted.slice(FREE_LIMIT,FREE_LIMIT+3).map((job,i)=>(
                    <div key={i} style={{background:C.bgCard,borderRadius:12,padding:"12px 14px",marginBottom:i<2?8:0,filter:"blur(4px)",opacity:0.6}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:36,height:36,borderRadius:9,background:C.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{SECTOR_ICONS[job.sector]||"🏢"}</div>
                        <div>
                          <div style={{fontSize:13,fontWeight:700,color:C.text}}>{job.name}</div>
                          <div style={{fontSize:11,color:C.textFaint}}>{job.city||job.state}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,transparent 20%,rgba(245,243,238,0.95))"}}/>
                </div>

                <div style={{padding:"20px",textAlign:"center"}}>
                  <div style={{fontSize:32,marginBottom:8}}>🔓</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:C.text,marginBottom:4}}>
                    +{lockedCount} employers waiting
                  </div>
                  <div style={{fontSize:13,color:C.textFaint,marginBottom:20,lineHeight:1.5}}>
                    Phone numbers · Emails · One-time payment.<br/>
                    <strong style={{color:C.text}}>One call = your 88 days sorted.</strong>
                  </div>

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
                    {[
                      ["📞","Direct phone numbers","Call today, start tomorrow"],
                      ["✉️","Recruitment emails","Faster than job boards"],
                      ["📍","Sort by proximity","Find what's closest to you"],
                      ["🌐","Official websites","Verify before you apply"],
                    ].map(([icon,title,sub])=>(
                      <div key={title} style={{background:C.bgMuted,borderRadius:10,padding:"10px 12px",textAlign:"left"}}>
                        <div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:2}}>{icon} {title}</div>
                        <div style={{fontSize:10,color:C.textFaint}}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{marginBottom:16}}>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:700,color:C.green,lineHeight:1}}>{PRICE}</div>
                    <div style={{fontSize:11,color:C.textFaint,marginTop:4}}>Lifetime access · One-time payment</div>
                  </div>

                  <button className="jf-cta" onClick={handleUnlock} style={{width:"100%",padding:"16px",borderRadius:13,background:C.green,color:"#fff",fontSize:16,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 20px rgba(26,122,74,0.35)"}}>
                    🦘 Unlock all contacts — {PRICE}
                  </button>

                  <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:10,flexWrap:"wrap"}}>
                    {["🔐 Secure payment","⚡ Instant access","✅ Lifetime access"].map(t=>(
                      <span key={t} style={{fontSize:10,color:C.textFaint}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {paid&&(
              <div style={{textAlign:"center",padding:"20px 0",animation:"fadeIn 0.5s ease"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontStyle:"italic",color:C.green}}>
                  🎉 {sorted.length} employers unlocked — good luck with your 88 days!
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
