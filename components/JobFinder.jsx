import { useState, useEffect, useRef, useCallback } from "react";
import { JOB_DATA } from "../data/JOB_DATA_FINAL";

const C = {
  bg:"#f5f3ee", bgCard:"#ffffff", bgMuted:"#f0ede6",
  border:"#e8e3d9", text:"#1a1a18", textMid:"#5a5850", textFaint:"#9a9488",
  green:"#1a7a4a", greenLight:"#edf7f1", greenBorder:"#b8e0c8",
  teal:"#0d9488", amber:"#b45309", amberBg:"#fef9ec",
  red:"#dc2626", redBg:"#fff1f2",
  shadow:"0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
  shadowLg:"0 8px 40px rgba(0,0,0,0.14)",
};

const FREE_LIMIT = 5;
const PRICE = "A$24.90";

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
  "Sydney":{lat:-33.87,lng:151.21},"Melbourne":{lat:-37.81,lng:144.96},
  "Brisbane":{lat:-27.47,lng:153.02},"Perth":{lat:-31.95,lng:115.86},
  "Adelaide":{lat:-34.93,lng:138.60},"Darwin":{lat:-12.46,lng:130.84},
  "Hobart":{lat:-42.88,lng:147.33},"Cairns":{lat:-16.92,lng:145.77},
  "Townsville":{lat:-19.26,lng:146.82},"Alice Springs":{lat:-23.70,lng:133.88},
  "Bundaberg":{lat:-24.87,lng:152.35},"Bowen":{lat:-20.01,lng:148.24},
  "Stanthorpe":{lat:-28.65,lng:151.93},"Mareeba":{lat:-17.00,lng:145.43},
  "Carnarvon":{lat:-24.87,lng:113.66},"Margaret River":{lat:-33.95,lng:115.07},
  "Cessnock":{lat:-32.83,lng:151.35},"Launceston":{lat:-41.43,lng:147.14},
  "Newman":{lat:-23.36,lng:119.73},"Port Hedland":{lat:-20.31,lng:118.57},
  "Mount Isa":{lat:-20.72,lng:139.49},"Singleton":{lat:-32.57,lng:151.17},
  "Port Augusta":{lat:-32.49,lng:137.76},"Geraldton":{lat:-28.77,lng:114.61},
  "Mackay":{lat:-21.14,lng:149.18},"Rockhampton":{lat:-23.38,lng:150.51},
  "Dubbo":{lat:-32.24,lng:148.60},"Kalgoorlie":{lat:-30.74,lng:121.46},
  "Broome":{lat:-17.96,lng:122.24},"Tom Price":{lat:-22.69,lng:117.79},
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

function CopyBtn({text}){
  const[s,setS]=useState("idle");
  const handle=async(e)=>{e.preventDefault();e.stopPropagation();const ok=await copyToClipboard(text);setS(ok?"ok":"err");setTimeout(()=>setS("idle"),2000);};
  return(
    <button onClick={handle} title="Copy" style={{background:s==="ok"?C.greenLight:s==="err"?C.redBg:C.bgMuted,color:s==="ok"?C.green:s==="err"?C.red:C.textFaint,border:`1px solid ${C.border}`,borderRadius:6,width:28,height:28,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,flexShrink:0,transition:"all 0.18s"}}>
      {s==="ok"?"✓":s==="err"?"✗":"📋"}
    </button>
  );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({onClose}){
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(26,26,24,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"jfFadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:24,width:"100%",maxWidth:400,boxShadow:C.shadowLg,overflow:"hidden",animation:"jfSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{background:`linear-gradient(135deg,#1a7a4a,#0d3d22)`,padding:"28px 24px",textAlign:"center"}}>
          <div style={{fontSize:48,marginBottom:8}}>🦘</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:4}}>Unlock all contacts</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>One-time payment · Lifetime access</div>
        </div>
        <div style={{padding:"24px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
            {[
              ["📞","Direct phone numbers"],
              ["✉️","Recruitment emails"],
              ["🌐","Official websites"],
              ["📍","Sort by proximity"],
            ].map(([icon,label])=>(
              <div key={label} style={{background:C.bgMuted,borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:16}}>{icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.text}}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:700,color:C.green,lineHeight:1}}>{PRICE}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginTop:4}}>{JOB_DATA.length.toLocaleString()} employers · One-time payment</div>
          </div>

          {/* Coming soon state */}
          <div style={{background:C.bgMuted,borderRadius:14,padding:"18px",textAlign:"center",marginBottom:12}}>
            <div style={{fontSize:24,marginBottom:6}}>🔧</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>Payment coming soon</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint,lineHeight:1.5}}>We're setting up secure payment.<br/>Leave your email to be notified when it's live.</div>
          </div>

          <input type="email" placeholder="your@email.com" style={{width:"100%",padding:"12px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bgCard,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.text,marginBottom:10,boxSizing:"border-box"}}/>
          <button style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:C.green,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}>
            Notify me when available
          </button>
          <button onClick={onClose} style={{width:"100%",padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Employer Detail Modal ────────────────────────────────────────────────────
function EmployerModal({job, onClose, paid, onUnlock}){
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",fn);
    return()=>document.removeEventListener("keydown",fn);
  },[]);
  const stateColor=STATE_COLORS[job.state]||"#888";
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(26,26,24,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0",animation:"jfFadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,maxHeight:"82vh",overflowY:"auto",boxShadow:C.shadowLg,animation:"jfSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)"}}>

        {/* Header */}
        <div style={{background:`linear-gradient(135deg,${stateColor}18,${stateColor}05)`,borderBottom:`1px solid ${C.border}`,padding:"20px 20px 16px",position:"sticky",top:0,background:C.bgCard,zIndex:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{width:48,height:48,borderRadius:12,background:C.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,border:`1px solid ${C.border}`}}>
              {SECTOR_ICONS[job.sector]||"🏢"}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text,lineHeight:1.2}}>{job.name}</span>
                {job.isNew&&<span style={{fontSize:9,fontWeight:700,color:"#fff",background:C.amber,borderRadius:5,padding:"2px 6px",flexShrink:0}}>NEW</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:C.teal,fontWeight:600}}>{job.sector}</span>
                <span style={{fontSize:11,color:C.textFaint}}>· 88-day eligible</span>
                <span style={{background:stateColor+"22",border:`1px solid ${stateColor}55`,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,color:stateColor}}>{job.state}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:20,cursor:"pointer",color:C.textFaint,padding:4,flexShrink:0,lineHeight:1}}>✕</button>
          </div>
        </div>

        <div style={{padding:"16px 20px 32px"}}>

          {/* Rating */}
          {job.score>0&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:C.bgMuted,borderRadius:10,padding:"10px 14px"}}>
              <div style={{display:"flex",gap:2}}>
                {[1,2,3,4,5].map(i=>(
                  <span key={i} style={{fontSize:14,color:i<=Math.round(job.score)?"#f59e0b":"#e2e8f0"}}>★</span>
                ))}
              </div>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:700,color:C.text}}>{job.score}</span>
              {job.reviews>0&&<span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint}}>({job.reviews.toLocaleString()} reviews)</span>}
            </div>
          )}

          {/* Location */}
          <div style={{background:C.bgMuted,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Location</div>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <span style={{fontSize:16,marginTop:1}}>📍</span>
              <div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent((job.address?job.address+", ":"")+(job.city?job.city+", ":"")+job.state+", Australia")}`} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:C.green,textDecoration:"none",display:"block"}}>
                  {job.city||job.state} → View on map
                </a>
                {job.address&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginTop:2}}>{job.address}</div>}
              </div>
            </div>
          </div>

          {/* Website */}
          {job.website&&(
            <a href={job.website} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:10,padding:"11px 14px",textDecoration:"none",marginBottom:12}}>
              <span style={{fontSize:16}}>🌐</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.green,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.website.replace(/https?:\/\/(www\.)?/,"")}</span>
              <span style={{fontSize:12,color:C.green,flexShrink:0}}>→</span>
            </a>
          )}

          {/* Contacts */}
          <div style={{border:`1.5px solid ${paid?C.greenBorder:C.border}`,borderRadius:12,padding:"14px",marginBottom:paid?0:14,background:paid?C.greenLight+"40":C.bgMuted}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:paid?C.green:C.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:12}}>
              {paid?"✓ Direct contacts":"🔒 Contacts locked"}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <span style={{fontSize:16,flexShrink:0}}>📞</span>
              {paid?(
                <>
                  <a href={`tel:${(job.phone||"").replace(/\s/g,"")}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.green,fontWeight:700,flex:1,textDecoration:"none"}}>{job.phone||"—"}</a>
                  {job.phone&&<CopyBtn text={job.phone}/>}
                </>
              ):(
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.textMid,filter:"blur(5px)",userSelect:"none",flex:1,fontWeight:600}}>{(job.phone||"+61 x xxxx xxxx")}</span>
              )}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:16,flexShrink:0}}>✉️</span>
              {paid?(
                <>
                  <a href={`mailto:${job.email}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,flex:1,textDecoration:"none",wordBreak:"break-all"}}>{job.email||"—"}</a>
                  {job.email&&<CopyBtn text={job.email}/>}
                </>
              ):(
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,filter:"blur(5px)",userSelect:"none",flex:1}}>{job.email||"xxxxx@employer.com.au"}</span>
              )}
            </div>
          </div>

          {!paid&&(
            <button onClick={onUnlock} style={{width:"100%",padding:"16px",borderRadius:13,border:"none",background:C.green,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(26,122,74,0.3)"}}>
              🔓 Unlock all contacts — {PRICE}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JobFinder(){
  const[sector,setSector]=useState(null);
  const[stateF,setStateF]=useState(null);
  const[paid,setPaid]=useState(false);
  const[selectedJob,setSelectedJob]=useState(null);
  const[showPayment,setShowPayment]=useState(false);
  const[cityInput,setCityInput]=useState("");
  const[cityCoords,setCityCoords]=useState(null);
  const[suggestions,setSuggestions]=useState([]);
  const[search,setSearch]=useState("");

  useEffect(()=>{
    const s=document.createElement("style");s.id="jf-styles";
    s.textContent=`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');
      @keyframes jfFadeIn{from{opacity:0}to{opacity:1}}
      @keyframes jfSlideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
      @keyframes jfRowIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      .jf-chip{transition:all 0.15s;cursor:pointer;font-family:'DM Sans',sans-serif;}
      .jf-chip:hover{border-color:#1a7a4a!important;background:#edf7f1!important;color:#1a7a4a!important;}
      .jf-card{transition:transform 0.15s,box-shadow 0.15s,border-color 0.15s;cursor:pointer;}
      .jf-card:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(0,0,0,0.09)!important;border-color:#b8e0c8!important;}
      .jf-input:focus{outline:none;border-color:#1a7a4a!important;box-shadow:0 0 0 3px rgba(26,122,74,0.1);}
      .jf-cta:hover{filter:brightness(1.06);transform:translateY(-1px);}
    `;
    if(!document.getElementById("jf-styles"))document.head.appendChild(s);
    return()=>document.getElementById("jf-styles")?.remove();
  },[]);

  useEffect(()=>{
    if(cityInput.length<2){setSuggestions([]);return;}
    const q=cityInput.toLowerCase();
    setSuggestions(AU_CITIES.filter(c=>c.toLowerCase().startsWith(q)).slice(0,5));
  },[cityInput]);

  const selectCity=useCallback((city)=>{
    setCityInput(city);setSuggestions([]);
    const c=CITY_COORDS[city];if(c)setCityCoords(c);
  },[]);

  const filtered=JOB_DATA.filter(j=>{
    if(sector&&j.sector!==sector)return false;
    if(stateF&&j.state!==stateF)return false;
    if(search){
      const q=search.toLowerCase();
      if(!j.name.toLowerCase().includes(q)&&!(j.city||"").toLowerCase().includes(q))return false;
    }
    return true;
  });

  const sorted=cityCoords
    ?[...filtered].sort((a,b)=>{
        const ca=CITY_COORDS[a.city],cb=CITY_COORDS[b.city];
        if(!ca&&!cb)return 0;if(!ca)return 1;if(!cb)return-1;
        return haversine(cityCoords.lat,cityCoords.lng,ca.lat,ca.lng)-haversine(cityCoords.lat,cityCoords.lng,cb.lat,cb.lng);
      })
    :[...filtered].sort((a,b)=>{
        const ss=(STATE_ORDER[a.state]??99)-(STATE_ORDER[b.state]??99);
        if(ss!==0)return ss;
        return(b.score||0)-(a.score||0);
      });

  const visible=paid?sorted:sorted.slice(0,FREE_LIMIT);
  const showWall=!paid&&sorted.length>FREE_LIMIT;
  const lockedCount=sorted.length-FREE_LIMIT;

  const sectorCounts=SECTORS.reduce((acc,s)=>{
    acc[s]=JOB_DATA.filter(j=>j.sector===s&&(!stateF||j.state===stateF)).length;
    return acc;
  },{});

  const getDistLabel=(job)=>{
    if(!cityCoords)return null;
    const c=CITY_COORDS[job.city];if(!c)return null;
    const d=haversine(cityCoords.lat,cityCoords.lng,c.lat,c.lng);
    return d===0?"0km":`${d}km`;
  };

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>

      {selectedJob&&!showPayment&&(
        <EmployerModal job={selectedJob} onClose={()=>setSelectedJob(null)} paid={paid} onUnlock={()=>{setSelectedJob(null);setShowPayment(true);}}/>
      )}
      {showPayment&&(
        <PaymentModal onClose={()=>setShowPayment(false)}/>
      )}

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#1a7a4a 0%,#0d3d22 100%)",padding:"22px 18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#fff",lineHeight:1.2}}>
              Find your farm job.
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontStyle:"italic",color:"rgba(255,255,255,0.7)"}}>Stay a second year.</div>
          </div>
          {!paid&&(
            <button onClick={()=>setShowPayment(true)} className="jf-cta" style={{background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s",backdropFilter:"blur(4px)",flexShrink:0}}>
              🔓 Unlock {PRICE}
            </button>
          )}
          {paid&&(
            <div style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,color:"#fff"}}>✓ Full access</div>
          )}
        </div>
        <div style={{display:"flex",gap:20}}>
          {[[`${JOB_DATA.length.toLocaleString()}+`,"Employers"],["8","Sectors"],["7","States"]].map(([val,label])=>(
            <div key={label}>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#fff"}}>{val}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:580,margin:"0 auto",padding:"14px 14px 140px"}}>

        {/* Search */}
        <div style={{marginBottom:12,position:"relative"}}>
          <input className="jf-input" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by employer or city…"
            style={{width:"100%",padding:"11px 36px 11px 14px",borderRadius:11,border:`1.5px solid ${C.border}`,background:C.bgCard,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.text,boxSizing:"border-box"}}/>
          {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:15,color:C.textFaint,cursor:"pointer"}}>✕</button>}
        </div>

        {/* Sector */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>Sector</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {SECTORS.map(s=>{
              const active=sector===s;
              return(
                <button key={s} className="jf-chip" onClick={()=>setSector(sector===s?null:s)} style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${active?C.green:C.border}`,background:active?C.green:C.bgCard,color:active?"#fff":C.textMid,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                  {SECTOR_ICONS[s]} {s}
                  <span style={{fontSize:10,background:active?"rgba(255,255,255,0.2)":C.bgMuted,color:active?"#fff":C.textFaint,borderRadius:5,padding:"1px 5px",fontWeight:700}}>{sectorCounts[s]||0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* State */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>State</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {STATES.map(st=>(
              <button key={st} className="jf-chip" onClick={()=>setStateF(stateF===st?null:st)} style={{padding:"6px 12px",borderRadius:9,border:`1.5px solid ${stateF===st?STATE_COLORS[st]:C.border}`,background:stateF===st?STATE_COLORS[st]:C.bgCard,color:stateF===st?"#fff":C.textMid,fontSize:12,fontWeight:700}}>{st}</button>
            ))}
          </div>
        </div>

        {/* Distance */}
        <div style={{marginBottom:14,position:"relative"}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>📍 Sort by distance from</div>
          <div style={{position:"relative"}}>
            <input className="jf-input" value={cityInput} onChange={e=>setCityInput(e.target.value)} placeholder="Your city… e.g. Brisbane, Perth"
              style={{width:"100%",padding:"10px 36px 10px 14px",borderRadius:10,border:`1.5px solid ${C.border}`,background:C.bgCard,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.text,boxSizing:"border-box"}}/>
            {cityInput&&<button onClick={()=>{setCityInput("");setCityCoords(null);setSuggestions([]);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:15,color:C.textFaint,cursor:"pointer"}}>✕</button>}
          </div>
          {suggestions.length>0&&(
            <div style={{position:"absolute",top:"calc(100% - 4px)",left:0,right:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:C.shadowLg,zIndex:20,overflow:"hidden"}}>
              {suggestions.map(city=>(
                <div key={city} onClick={()=>selectCity(city)} style={{padding:"10px 14px",fontSize:13,color:C.text,cursor:"pointer",borderBottom:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.bgMuted} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  📍 {city}
                </div>
              ))}
            </div>
          )}
          {cityCoords&&<div style={{fontSize:11,color:C.green,fontWeight:600,marginTop:5}}>✓ Sorted by distance from {cityInput}</div>}
        </div>

        {/* Count */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:C.bgMuted,borderRadius:10,padding:"10px 14px"}}>
          <span style={{fontSize:13}}>📋</span>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>
            <span style={{color:C.green,fontFamily:"'Playfair Display',serif",fontSize:18}}>{sorted.length}</span>
            {" "}employer{sorted.length!==1?"s":""} found
          </span>
          {paid&&cityCoords&&<span style={{marginLeft:"auto",fontSize:10,color:C.green,fontWeight:600}}>📍 By proximity</span>}
        </div>

        {/* Zero results */}
        {sorted.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.text,marginBottom:8}}>No results found</div>
            <div style={{fontSize:13,color:C.textFaint,marginBottom:16}}>Try removing a filter</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {sector&&<button onClick={()=>setSector(null)} style={{padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.green}`,background:C.greenLight,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Remove "{sector}"</button>}
              {stateF&&<button onClick={()=>setStateF(null)} style={{padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.green}`,background:C.greenLight,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Remove "{stateF}"</button>}
            </div>
          </div>
        )}

        {/* Cards */}
        {sorted.length>0&&(
          <>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {visible.map((job,i)=>{
                const sc=STATE_COLORS[job.state]||"#888";
                const dist=getDistLabel(job);
                return(
                  <div key={job.name+i} className="jf-card" onClick={()=>setSelectedJob(job)}
                    style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 15px",boxShadow:C.shadow,animation:`jfRowIn 0.3s ease ${Math.min(i,8)*0.04}s both`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                      <div style={{width:40,height:40,borderRadius:10,background:C.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
                        {SECTOR_ICONS[job.sector]||"🏢"}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2,flexWrap:"wrap"}}>
                          <span style={{fontSize:14,fontWeight:700,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.name}</span>
                          {job.isNew&&<span style={{fontSize:9,fontWeight:700,color:"#fff",background:C.amber,borderRadius:5,padding:"2px 5px",flexShrink:0}}>NEW</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:11,color:C.teal,fontWeight:600}}>{job.sector}</span>
                          {job.score>0&&<span style={{fontSize:10,color:C.textFaint}}>★ {job.score}</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        <span style={{background:sc+"22",border:`1px solid ${sc}55`,borderRadius:7,padding:"3px 8px",fontSize:11,fontWeight:700,color:sc}}>{job.state}</span>
                        {dist&&<span style={{fontSize:10,color:C.green,fontWeight:700}}>{dist}</span>}
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8,background:C.bgMuted,borderRadius:8,padding:"7px 10px"}}>
                      <span style={{fontSize:12}}>📍</span>
                      <span style={{fontSize:12,fontWeight:500,color:C.textMid,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.city||job.state}{job.address?` · ${job.address}`:""}</span>
                      <span style={{fontSize:11,color:C.teal,fontWeight:600,flexShrink:0}}>View →</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paywall */}
            {showWall&&(
              <div style={{marginTop:12}}>
                {/* Blurred preview */}
                <div style={{position:"relative",overflow:"hidden",borderRadius:"14px 14px 0 0",border:`1px solid ${C.border}`,borderBottom:"none"}}>
                  {sorted.slice(FREE_LIMIT,FREE_LIMIT+3).map((job,i)=>(
                    <div key={i} style={{background:C.bgCard,padding:"14px 15px",borderBottom:i<2?`1px solid ${C.border}`:"none",filter:"blur(3px)",opacity:0.7,userSelect:"none"}}>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{width:40,height:40,borderRadius:10,background:C.bgMuted,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{SECTOR_ICONS[job.sector]||"🏢"}</div>
                        <div>
                          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{job.name}</div>
                          <div style={{fontSize:11,color:C.textFaint}}>{job.city||job.state} · {job.sector}</div>
                        </div>
                        <div style={{marginLeft:"auto",fontSize:11,fontWeight:700,color:STATE_COLORS[job.state]||"#888"}}>{job.state}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:80,background:`linear-gradient(to bottom,transparent,${C.bg})`}}/>
                </div>

                {/* CTA */}
                <div style={{background:C.bgCard,border:`1px solid ${C.border}`,borderTop:"none",borderRadius:"0 0 18px 18px",padding:"20px",textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:6}}>🔒</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:4}}>
                    +{lockedCount} more employers
                  </div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint,marginBottom:16,lineHeight:1.6}}>
                    Phone · Email · Website for every employer.<br/>
                    <strong style={{color:C.text}}>One call = your 88 days sorted.</strong>
                  </div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:32,fontWeight:700,color:C.green,marginBottom:4}}>{PRICE}</div>
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginBottom:14}}>Lifetime access · One-time payment</div>
                  <button className="jf-cta" onClick={()=>setShowPayment(true)} style={{width:"100%",padding:"15px",borderRadius:13,border:"none",background:C.green,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(26,122,74,0.3)",transition:"all 0.2s"}}>
                    🔓 Unlock all employers — {PRICE}
                  </button>
                  <div style={{display:"flex",justifyContent:"center",gap:16,marginTop:10}}>
                    {["🔐 Secure","⚡ Instant access","✅ Lifetime"].map(t=>(
                      <span key={t} style={{fontSize:10,color:C.textFaint}}>{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {paid&&(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontStyle:"italic",color:C.green}}>
                  🎉 {sorted.length} employers unlocked — good luck!
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
