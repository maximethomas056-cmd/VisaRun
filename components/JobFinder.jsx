import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
const PRICE = "$24.90 AUD";
const DB_LAST_UPDATED = "March 2026"; // ← Mettre à jour manuellement quand tu enrichis la base

const SECTORS = ["All","Farm","Mine","Construction","Roadhouse","Solar","Fish","Abattoir","Forestry","Other"];
const STATES  = ["QLD","WA","NSW","VIC","TAS","NT","SA"];
const STATE_ORDER = {QLD:0,WA:1,NSW:2,VIC:3,TAS:4,NT:5,SA:6};

const SECTOR_ICONS = {
  All:"✦", Farm:"🌾", Mine:"⛏️", Construction:"🏗️", Roadhouse:"🛣️",
  Solar:"☀️", Fish:"🐟", Abattoir:"🥩", Forestry:"🌲",
  Other:"🏢", Hostel:"🏨", Recruitment:"👥",
};

const STATE_COLORS = {
  QLD:"#e67e22", WA:"#2980b9", NSW:"#8e44ad",
  VIC:"#16a085", TAS:"#c0392b", NT:"#d35400", SA:"#27ae60",
};

// Slider steps: index 0 = Nearby (25km) → last index = Any
const DIST_STEPS = [25, 50, 100, 150, 200, 300, 500, null]; // null = Any


const CITY_COORDS = {
  // Major cities
  "Sydney":{lat:-33.87,lng:151.21},"Melbourne":{lat:-37.81,lng:144.96},
  "Brisbane":{lat:-27.47,lng:153.02},"Brisbane City":{lat:-27.47,lng:153.02},
  "Perth":{lat:-31.95,lng:115.86},"West Perth":{lat:-31.95,lng:115.85},
  "East Perth":{lat:-31.95,lng:115.87},"North Perth":{lat:-31.92,lng:115.85},
  "Adelaide":{lat:-34.93,lng:138.60},"Darwin":{lat:-12.46,lng:130.84},
  "Darwin City":{lat:-12.46,lng:130.84},"Hobart":{lat:-42.88,lng:147.33},
  "Cairns":{lat:-16.92,lng:145.77},"Cairns City":{lat:-16.92,lng:145.77},
  "Cairns North":{lat:-16.90,lng:145.75},"Townsville":{lat:-19.26,lng:146.82},
  "Townsville City":{lat:-19.26,lng:146.82},"Alice Springs":{lat:-23.70,lng:133.88},
  "Broome":{lat:-17.96,lng:122.24},"Kalgoorlie":{lat:-30.74,lng:121.46},
  "Newman":{lat:-23.36,lng:119.73},"Port Hedland":{lat:-20.31,lng:118.57},
  "Karratha":{lat:-20.74,lng:116.85},"Tom Price":{lat:-22.69,lng:117.79},
  // QLD
  "Gold Coast":{lat:-28.02,lng:153.40},"Surfers Paradise":{lat:-28.00,lng:153.43},
  "Sunshine Coast":{lat:-26.65,lng:153.06},"Rockhampton":{lat:-23.38,lng:150.51},
  "Bundaberg":{lat:-24.87,lng:152.35},"Bundaberg Central":{lat:-24.87,lng:152.35},
  "Mackay":{lat:-21.14,lng:149.18},"Toowoomba":{lat:-27.56,lng:151.95},
  "Mount Isa":{lat:-20.72,lng:139.49},"Gladstone":{lat:-23.84,lng:151.25},
  "Hervey Bay":{lat:-25.29,lng:152.84},"Maryborough":{lat:-25.54,lng:152.70},
  "Emerald":{lat:-23.53,lng:148.16},"Longreach":{lat:-23.44,lng:144.25},
  "Bowen":{lat:-20.01,lng:148.24},"Stanthorpe":{lat:-28.65,lng:151.93},
  "Mareeba":{lat:-17.00,lng:145.43},"Atherton":{lat:-17.27,lng:145.48},
  "Innisfail":{lat:-17.52,lng:146.03},"Ayr":{lat:-19.57,lng:147.40},
  "Cloncurry":{lat:-20.70,lng:140.51},"Charleville":{lat:-26.40,lng:146.24},
  "Roma":{lat:-26.57,lng:148.79},"Charters Towers":{lat:-20.07,lng:146.26},
  "Collinsville":{lat:-20.55,lng:147.85},"Fortitude Valley":{lat:-27.46,lng:153.03},
  "Spring Hill":{lat:-27.46,lng:153.02},"Southbank":{lat:-27.48,lng:153.02},
  "Portsmith":{lat:-16.93,lng:145.78},"Tolga":{lat:-17.23,lng:145.48},
  "Tablelands":{lat:-17.25,lng:145.50},"Woongoolba":{lat:-27.83,lng:153.38},
  "Tamborine Mountain":{lat:-27.95,lng:153.19},"Yulara":{lat:-25.24,lng:130.98},
  "Anmatjere":{lat:-22.25,lng:132.25},
  // NSW
  "Newcastle":{lat:-32.93,lng:151.78},"Wollongong":{lat:-34.42,lng:150.89},
  "Albury":{lat:-36.08,lng:146.91},"Wagga Wagga":{lat:-35.12,lng:147.37},
  "Dubbo":{lat:-32.24,lng:148.60},"Orange":{lat:-33.28,lng:149.10},
  "Bathurst":{lat:-33.42,lng:149.58},"Tamworth":{lat:-31.09,lng:150.92},
  "Broken Hill":{lat:-31.95,lng:141.47},"Cessnock":{lat:-32.83,lng:151.35},
  "Singleton":{lat:-32.57,lng:151.17},"Maitland":{lat:-32.73,lng:151.55},
  "Griffith":{lat:-34.29,lng:146.04},"Young":{lat:-34.31,lng:148.30},
  "Tumut":{lat:-35.31,lng:148.22},"Bilpin":{lat:-33.48,lng:150.52},
  "Coffs Harbour":{lat:-30.30,lng:153.11},"Lismore":{lat:-28.81,lng:153.28},
  "Byron Bay":{lat:-28.65,lng:153.61},"Armidale":{lat:-30.51,lng:151.67},
  "Goulburn":{lat:-34.75,lng:149.72},"Parramatta":{lat:-33.81,lng:151.00},
  "North Sydney":{lat:-33.84,lng:151.21},"Surry Hills":{lat:-33.89,lng:151.21},
  "Alexandria":{lat:-33.91,lng:151.20},"Potts Point":{lat:-33.87,lng:151.22},
  "Wetherill Park":{lat:-33.85,lng:150.90},"Ingleburn":{lat:-34.00,lng:150.87},
  "Homebush West":{lat:-33.86,lng:151.08},"Mascot":{lat:-33.93,lng:151.19},
  "Chatswood":{lat:-33.80,lng:151.18},"Rydalmere":{lat:-33.81,lng:151.03},
  "Revesby":{lat:-33.95,lng:151.01},"Unanderra":{lat:-34.45,lng:150.87},
  "Cardiff":{lat:-32.96,lng:151.71},"Auburn":{lat:-33.85,lng:151.03},
  "Woolloomooloo":{lat:-33.87,lng:151.22},"Waterloo":{lat:-33.90,lng:151.20},
  "Haymarket":{lat:-33.88,lng:151.20},"Wollongong":{lat:-34.42,lng:150.89},
  "Alstonville":{lat:-28.84,lng:153.44},"Wandin North":{lat:-37.79,lng:145.43},
  // VIC
  "Geelong":{lat:-38.15,lng:144.36},"Ballarat":{lat:-37.56,lng:143.86},
  "Bendigo":{lat:-36.76,lng:144.28},"Shepparton":{lat:-36.38,lng:145.40},
  "Wodonga":{lat:-36.12,lng:146.89},"Mildura":{lat:-34.18,lng:142.16},
  "Warrnambool":{lat:-38.38,lng:142.48},"Traralgon":{lat:-38.19,lng:146.54},
  "Dandenong South":{lat:-38.00,lng:145.22},"Werribee South":{lat:-37.97,lng:144.67},
  "Laverton North":{lat:-37.85,lng:144.79},"St Kilda":{lat:-37.87,lng:144.98},
  "Richmond":{lat:-37.82,lng:145.00},"Southbank":{lat:-37.82,lng:144.96},
  "Mornington":{lat:-38.22,lng:145.04},"Silvan":{lat:-37.82,lng:145.43},
  "Cressy":{lat:-37.99,lng:143.64},"Woongoolba":{lat:-27.83,lng:153.38},
  "Hale":{lat:-37.75,lng:145.00},"Healesville":{lat:-37.65,lng:145.52},
  "Mount Gambier":{lat:-37.83,lng:140.78},"McLaren Vale":{lat:-35.22,lng:138.55},
  // SA
  "Port Augusta":{lat:-32.49,lng:137.76},"Port Lincoln":{lat:-34.72,lng:135.86},
  "Whyalla":{lat:-33.03,lng:137.58},"Murray Bridge":{lat:-35.12,lng:139.27},
  "Coober Pedy":{lat:-29.01,lng:134.75},"Barossa Valley":{lat:-34.53,lng:138.95},
  "McLaren Vale":{lat:-35.22,lng:138.55},"Renmark":{lat:-34.17,lng:140.75},
  "Berri":{lat:-34.28,lng:140.60},"Naracoorte":{lat:-36.96,lng:140.74},
  "Bordertown":{lat:-36.31,lng:140.77},"Angaston":{lat:-34.50,lng:139.03},
  "Barton":{lat:-35.30,lng:138.60},"Stuart":{lat:-31.89,lng:137.50},
  // WA
  "Geraldton":{lat:-28.77,lng:114.61},"Carnarvon":{lat:-24.87,lng:113.66},
  "Esperance":{lat:-33.86,lng:121.89},"Albany":{lat:-35.02,lng:117.88},
  "Bunbury":{lat:-33.33,lng:115.64},"Margaret River":{lat:-33.95,lng:115.07},
  "Swan Valley":{lat:-31.82,lng:116.01},"Manjimup":{lat:-34.24,lng:116.15},
  "Northam":{lat:-31.65,lng:116.67},"Merredin":{lat:-31.48,lng:118.28},
  "Kununurra":{lat:-15.77,lng:128.74},"Exmouth":{lat:-21.93,lng:114.13},
  "Fremantle":{lat:-32.05,lng:115.75},"Osborne Park":{lat:-31.89,lng:115.83},
  "Welshpool":{lat:-31.99,lng:115.94},"Bibra Lake":{lat:-32.10,lng:115.83},
  "Balcatta":{lat:-31.87,lng:115.83},"Brendale":{lat:-27.31,lng:152.98},
  "Bibra Lake":{lat:-32.10,lng:115.83},"Davenport":{lat:-20.74,lng:116.87},
  // NT
  "Katherine":{lat:-14.46,lng:132.27},"Katherine South":{lat:-14.48,lng:132.27},
  "Tennant Creek":{lat:-19.65,lng:134.19},"Nhulunbuy":{lat:-12.18,lng:136.78},
  "Berrimah":{lat:-12.43,lng:130.91},"Coolalinga":{lat:-12.49,lng:131.00},
  "Winnellie":{lat:-12.43,lng:130.88},"East Arm":{lat:-12.47,lng:130.88},
  "Roebuck":{lat:-17.97,lng:122.22},"Hale":{lat:-12.50,lng:131.00},
  "Warumungu":{lat:-19.65,lng:134.19},
  // TAS
  "Launceston":{lat:-41.43,lng:147.14},"Devonport":{lat:-41.18,lng:146.35},
  "Burnie":{lat:-41.05,lng:145.91},"Ulverstone":{lat:-41.17,lng:146.18},
  "St Leonards":{lat:-41.46,lng:147.18},"Huonville":{lat:-43.03,lng:147.02},
  "Dover":{lat:-43.31,lng:147.02},"Stanley":{lat:-40.76,lng:145.29},
  "Cressy":{lat:-41.69,lng:147.08},"Cambridge":{lat:-42.83,lng:147.42},
  // Other key agricultural areas
  "Shepparton":{lat:-36.38,lng:145.40},"Robinvale":{lat:-34.59,lng:142.77},
  "Swan Hill":{lat:-35.34,lng:143.55},"Echuca":{lat:-36.13,lng:144.75},
  "Wangaratta":{lat:-36.36,lng:146.31},"Yarrawonga":{lat:-36.02,lng:146.00},
  "Cobram":{lat:-35.92,lng:145.65},"Kyabram":{lat:-36.32,lng:145.05},
  "Tatura":{lat:-36.44,lng:145.27},"Mooroopna":{lat:-36.40,lng:145.37},
  "Leeton":{lat:-34.55,lng:146.40},"Narrandera":{lat:-34.75,lng:146.55},
  "Hay":{lat:-34.51,lng:144.84},"Deniliquin":{lat:-35.53,lng:144.96},
  "Moree":{lat:-29.47,lng:149.84},"Narrabri":{lat:-30.33,lng:149.78},
  "Inverell":{lat:-29.78,lng:151.11},"Glen Innes":{lat:-29.73,lng:151.73},
  "Mudgee":{lat:-32.60,lng:149.59},"Cowra":{lat:-33.83,lng:148.68},
  "Forbes":{lat:-33.38,lng:148.00},"Parkes":{lat:-33.13,lng:148.17},
  "Condobolin":{lat:-33.08,lng:147.15},"Nyngan":{lat:-31.56,lng:147.20},
  "Bourke":{lat:-30.09,lng:145.94},"Wee Waa":{lat:-30.22,lng:149.43},
  "Wingham":{lat:-31.86,lng:152.37},"Taree":{lat:-31.90,lng:152.46},
  "Port Macquarie":{lat:-31.43,lng:152.91},"Kempsey":{lat:-31.08,lng:152.84},
  "Grafton":{lat:-29.69,lng:152.93},"Casino":{lat:-28.87,lng:153.04},
  "Kyogle":{lat:-28.62,lng:153.00},"Mullumbimby":{lat:-28.55,lng:153.50},
  "Murwillumbah":{lat:-28.33,lng:153.40},"Tweed Heads":{lat:-28.18,lng:153.55},
  "Woolgoolga":{lat:-30.11,lng:153.20},"Nambucca Heads":{lat:-30.64,lng:152.97},
  "Macksville":{lat:-30.71,lng:152.92},"Dorrigo":{lat:-30.34,lng:152.72},
  "Bellingen":{lat:-30.45,lng:152.90},"Wauchope":{lat:-31.46,lng:152.74},
  "Gloucester":{lat:-31.98,lng:151.96},"Dungog":{lat:-32.40,lng:151.75},
  "Muswellbrook":{lat:-32.27,lng:150.89},"Scone":{lat:-32.05,lng:150.87},
  "Arno Bay":{lat:-33.92,lng:136.57},"Port Pirie":{lat:-33.19,lng:138.01},
  "Kadina":{lat:-33.97,lng:137.72},"Wallaroo":{lat:-33.94,lng:137.63},
  "Moonta":{lat:-34.07,lng:137.59},"Yorke Peninsula":{lat:-34.50,lng:137.60},
  "Clare":{lat:-33.83,lng:138.62},"Burra":{lat:-33.69,lng:138.93},
  "Kapunda":{lat:-34.34,lng:138.91},"Gawler":{lat:-34.60,lng:138.74},
  "Victor Harbor":{lat:-35.55,lng:138.62},"Goolwa":{lat:-35.50,lng:138.78},
  "Strathalbyn":{lat:-35.27,lng:138.89},"Tailem Bend":{lat:-35.25,lng:139.46},
  "Keith":{lat:-36.10,lng:140.35},"Millicent":{lat:-37.60,lng:140.35},
  "Penola":{lat:-37.37,lng:140.84},"Lucindale":{lat:-36.98,lng:140.37},
  "Meningie":{lat:-35.69,lng:139.33},"Mannum":{lat:-34.91,lng:139.30},
  "Blanchetown":{lat:-34.35,lng:139.61},"Waikerie":{lat:-34.18,lng:139.98},
  "Loxton":{lat:-34.45,lng:140.57},"Barmera":{lat:-34.25,lng:140.47},
  "Cobdogla":{lat:-34.26,lng:140.38},"Glossop":{lat:-34.27,lng:140.52},
  "Mypolonga":{lat:-35.07,lng:139.34},"Jervois":{lat:-35.22,lng:139.51},
  "Nildottie":{lat:-34.64,lng:139.55},"Walker Flat":{lat:-34.55,lng:139.47},
  "Sedan":{lat:-34.57,lng:139.32},"Sandalwood":{lat:-34.39,lng:140.09},
  "Pyap":{lat:-34.50,lng:140.45},"Qualco":{lat:-34.37,lng:140.33},
  "Ramco":{lat:-34.33,lng:140.09},"Sunlands":{lat:-34.28,lng:139.92},
  "Moorook":{lat:-34.28,lng:140.35},"Lyrup":{lat:-34.22,lng:140.63},
  "Bugle Hut":{lat:-34.16,lng:140.68},"Monash":{lat:-34.25,lng:140.54},
  "Paringa":{lat:-34.17,lng:140.78},
};

// Smart search: detect if input is a city name or employer name
function detectSearchType(input, coords) {
  if (!input || input.length < 2) return { type: "none" };
  const lower = input.toLowerCase();
  // Check if it matches a known city
  const cityMatch = Object.keys(coords).find(city => 
    city.toLowerCase() === lower || city.toLowerCase().startsWith(lower)
  );
  if (cityMatch && coords[cityMatch]) {
    return { type: "city", city: cityMatch, coords: coords[cityMatch] };
  }
  // Check partial city match (3+ chars)
  if (input.length >= 3) {
    const partialCity = Object.keys(coords).find(city =>
      city.toLowerCase().startsWith(lower)
    );
    if (partialCity) {
      return { type: "city_partial", city: partialCity };
    }
  }
  return { type: "employer", query: input };
}

async function copyToClipboard(text){
  try{await navigator.clipboard.writeText(text);return true;}
  catch{try{const el=document.createElement("input");el.style.cssText="position:fixed;opacity:0;top:0;left:0;";el.value=text;document.body.appendChild(el);el.focus();el.select();document.execCommand("copy");document.body.removeChild(el);return true;}catch{return false;}}
}

function haversine(lat1,lng1,lat2,lng2){
  const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLng=(lng2-lng1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
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

function EmailModal({onClose, onCheck, checking, error}){
  const[email,setEmail]=useState("");
  const handleSubmit=()=>{if(email.includes("@"))onCheck(email);};
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(26,26,24,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"jfFadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:24,width:"100%",maxWidth:380,boxShadow:"0 8px 40px rgba(0,0,0,0.14)",overflow:"hidden",animation:"jfSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{background:"linear-gradient(135deg,#1a7a4a,#0d3d22)",padding:"24px 24px 20px",textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>🦘</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>Access your contacts</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.6)"}}>Enter the email you used to pay</div>
        </div>
        <div style={{padding:"24px"}}>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
            placeholder="your@email.com"
            autoFocus
            style={{width:"100%",padding:"13px 16px",borderRadius:10,border:"1.5px solid #e8e3d9",fontFamily:"'DM Sans',sans-serif",fontSize:14,marginBottom:12,boxSizing:"border-box",outline:"none"}}
          />
          {error&&<div style={{color:"#dc2626",fontSize:12,marginBottom:10,textAlign:"center"}}>{error}</div>}
          <button
            onClick={handleSubmit}
            disabled={checking||!email.includes("@")}
            style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:checking?"#9a9488":"#1a7a4a",color:"#fff",fontSize:14,fontWeight:700,cursor:checking?"not-allowed":"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:10}}
          >
            {checking?"Checking...":"Unlock Access →"}
          </button>
          <button onClick={onClose} style={{width:"100%",padding:"10px",borderRadius:10,border:"1px solid #e8e3d9",background:"transparent",color:"#5a5850",fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentModal({onClose, onAlreadyPaid}){
  const STRIPE_URL = "https://buy.stripe.com/dRm9AS0Ze03sb1n0UX4Rq00";
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(26,26,24,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,animation:"jfFadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:24,width:"100%",maxWidth:400,boxShadow:C.shadowLg,overflow:"hidden",animation:"jfSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{background:"linear-gradient(135deg,#1a7a4a,#0d3d22)",padding:"28px 24px 22px",textAlign:"center"}}>
          <div style={{fontSize:38,marginBottom:10}}>🦘</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:700,color:"#fff",marginBottom:5,lineHeight:1.2}}>Skip the agencies.</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#fff",marginBottom:8,lineHeight:1.2}}>Contact employers yourself.</div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,color:"rgba(255,255,255,0.75)"}}>Find work anywhere in Australia — no middleman.</div>
        </div>
        <div style={{padding:"18px 20px 22px"}}>
          <div style={{background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:8,padding:"9px 13px",marginBottom:14,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:14}}>📍</span>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.green,fontWeight:600}}>Jobs available now across all 7 states</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:14}}>
            {[["📞","Direct phone"],["✉️","Recruitment email"],["🌐","Official website"],["📸","Instagram"],["👥","Facebook"],["📍","Sort by distance"]].map(([icon,label])=>(
              <div key={label} style={{background:C.bgMuted,borderRadius:8,padding:"9px 11px",display:"flex",alignItems:"center",gap:7}}>
                <span style={{fontSize:14}}>{icon}</span>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:C.text}}>{label}</span>
              </div>
            ))}
          </div>
          <div style={{textAlign:"center",marginBottom:6}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:40,fontWeight:700,color:C.green,lineHeight:1}}>{PRICE}</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginTop:4}}>One-time · No subscription · Lifetime access</div>
          </div>
          <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,textAlign:"center",marginBottom:14}}>
            Updated contacts · Not random Google results
          </div>
          <a href={STRIPE_URL} target="_blank" rel="noopener noreferrer" style={{display:"block",width:"100%",padding:"16px",borderRadius:13,border:"none",background:C.green,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",textAlign:"center",textDecoration:"none",boxShadow:"0 4px 16px rgba(26,122,74,0.3)",marginBottom:10,boxSizing:"border-box"}}>
            🔓 Unlock 2,000+ employer contacts — {PRICE}
          </a>
          <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:14}}>
            {["🔐 Secure","⚡ Instant access","✅ Lifetime"].map(t=>(
              <span key={t} style={{fontSize:10,color:C.textFaint}}>{t}</span>
            ))}
          </div>
          <button onClick={onAlreadyPaid} style={{width:"100%",padding:"12px",borderRadius:10,border:`1.5px solid ${C.green}`,background:C.greenLight,color:C.green,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>
            ✓ Already paid? Click here to unlock
          </button>
          <button onClick={onClose} style={{width:"100%",padding:"10px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.textMid,fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployerModal({job, onClose, paid, onUnlock}){
  useEffect(()=>{
    const fn=e=>{if(e.key==="Escape")onClose();};
    document.addEventListener("keydown",fn);
    return()=>document.removeEventListener("keydown",fn);
  },[]);
  const sc=STATE_COLORS[job.state]||"#888";
  const igHandle=job.instagram?job.instagram.replace(/https?:\/\/(www\.)?instagram\.com\//,"@").replace(/\/$/,""):"";
  const fbIsNumeric=job.facebook&&/\/\d+\/?$/.test(job.facebook);
  const fbIsProfile=job.facebook&&/profil\.php|profile\.php/i.test(job.facebook);
  const fbUrl=(fbIsNumeric||fbIsProfile)?null:job.facebook;
  const fbLabel=fbUrl?fbUrl.replace(/https?:\/\/(www\.)?facebook\.com\//,"").replace(/\/$/,""):`${job.name} · Facebook`;
  const INSTA_SVG=`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#9d174d" stroke-width="2"/><circle cx="12" cy="12" r="4" stroke="#9d174d" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1" fill="#9d174d"/></svg>`;
  const FB_SVG=`<svg width="14" height="14" viewBox="0 0 24 24" fill="#1d4ed8" xmlns="http://www.w3.org/2000/svg"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`;
  return(
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:200,background:"rgba(26,26,24,0.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",animation:"jfFadeIn 0.2s ease"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bgCard,borderRadius:"20px 20px 0 0",width:"100%",maxWidth:560,maxHeight:"82vh",display:"flex",flexDirection:"column",boxShadow:C.shadowLg,animation:"jfSlideUp 0.3s cubic-bezier(.34,1.56,.64,1)"}}>
        {/* Header sticky */}
        <div style={{borderBottom:`1px solid ${C.border}`,padding:"20px 20px 16px",flexShrink:0,background:C.bgCard,borderRadius:"20px 20px 0 0"}}>
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
                <span style={{background:sc+"22",border:`1px solid ${sc}55`,borderRadius:6,padding:"2px 7px",fontSize:11,fontWeight:700,color:sc}}>{job.state}</span>
              </div>
            </div>
            <button onClick={onClose} style={{background:"transparent",border:"none",fontSize:22,cursor:"pointer",color:C.textFaint,padding:4,flexShrink:0,lineHeight:1}}>✕</button>
          </div>
        </div>
        {/* Contenu scrollable */}
        <div style={{overflowY:"auto",flex:1,padding:"16px 20px 8px"}}>
          <div style={{background:C.bgMuted,borderRadius:10,padding:"12px 14px",marginBottom:12}}>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color:C.textFaint,letterSpacing:"0.12em",textTransform:"uppercase",fontWeight:600,marginBottom:6}}>Location</div>
            <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
              <span style={{fontSize:16,marginTop:1}}>📍</span>
              <div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent((job.address?job.address+", ":"")+(job.city?job.city+", ":"")+job.state+", Australia")}`} target="_blank" rel="noopener noreferrer" style={{fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,color:C.green,textDecoration:"none",display:"block"}}>
                  {job.city||job.state} → View on Google Maps
                </a>
                {job.address&&<div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginTop:2}}>{job.address}</div>}
              </div>
            </div>
          </div>
          {job.website&&(
            <a href={job.website} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:10,background:C.greenLight,border:`1px solid ${C.greenBorder}`,borderRadius:10,padding:"11px 14px",textDecoration:"none",marginBottom:12}}>
              <span style={{fontSize:16}}>🌐</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.green,fontWeight:600,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.website.replace(/https?:\/\/(www\.)?/,"")}</span>
              <span style={{fontSize:12,color:C.green,flexShrink:0}}>→</span>
            </a>
          )}
          <a href={paid?"#":"https://buy.stripe.com/dRm9AS0Ze03sb1n0UX4Rq00"} target={paid?"_self":"_blank"} rel="noopener noreferrer" onClick={e=>{if(paid)e.preventDefault();}} style={{borderRadius:14,overflow:"hidden",marginBottom:8,border:`1.5px solid ${paid?C.greenBorder:"#e8e3d9"}`,display:"block",textDecoration:"none",cursor:paid?"default":"pointer"}}>
            <div style={{background:paid?"#edf7f1":"#1a7a4a",padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:14}}>{paid?"✓":"🔒"}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,color:paid?C.green:"#fff",letterSpacing:"0.08em",textTransform:"uppercase"}}>
                {paid?"Direct contacts unlocked":"Tap to unlock — $24.90"}
              </span>
              {!paid&&<span style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,0.8)"}}>→</span>}
            </div>
            <div style={{background:paid?C.greenLight+"30":"#fff",padding:"14px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                <span style={{fontSize:16,flexShrink:0}}>📞</span>
                {paid?(
                  <><a href={`tel:${(job.phone||"").replace(/\s/g,"")}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,color:C.green,fontWeight:700,flex:1,textDecoration:"none"}} onClick={e=>e.stopPropagation()}>{job.phone||"—"}</a>{job.phone&&<CopyBtn text={job.phone}/>}</>
                ):(
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:14,fontWeight:700,color:"#1a1a18",flex:1,filter:"blur(4px)",userSelect:"none"}}>{job.phone||"+61 7 4153 xxxx"}</div>
                )}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:paid&&(job.instagram||fbUrl)?10:0}}>
                <span style={{fontSize:16,flexShrink:0}}>✉️</span>
                {paid?(
                  <><a href={`mailto:${job.email}`} style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textMid,flex:1,textDecoration:"none",wordBreak:"break-all"}} onClick={e=>e.stopPropagation()}>{job.email||"—"}</a>{job.email&&<CopyBtn text={job.email}/>}</>
                ):(
                  <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#1a1a18",flex:1,filter:"blur(4px)",userSelect:"none"}}>{job.email||"hiring@employer.com.au"}</div>
                )}
              </div>
              {paid&&job.instagram&&(
                <a href={job.instagram} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,background:"#fdf2f8",border:"1px solid #f9a8d4",borderRadius:8,padding:"8px 10px",textDecoration:"none",marginBottom:8}} onClick={e=>e.stopPropagation()}>
                  <span dangerouslySetInnerHTML={{__html:INSTA_SVG}} style={{flexShrink:0,display:"flex"}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#9d174d",fontWeight:700,flex:1}}>{igHandle}</span>
                  <span style={{fontSize:11,color:"#9d174d"}}>→</span>
                </a>
              )}
              {paid&&fbUrl&&(
                <a href={fbUrl} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:8,background:"#eff6ff",border:"1px solid #93c5fd",borderRadius:8,padding:"8px 10px",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>
                  <span dangerouslySetInnerHTML={{__html:FB_SVG}} style={{flexShrink:0,display:"flex"}}/>
                  <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"#1d4ed8",fontWeight:700,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fbLabel}</span>
                  <span style={{fontSize:11,color:"#1d4ed8"}}>→</span>
                </a>
              )}
              {!paid&&(
                <div style={{display:"flex",gap:6,marginTop:4}}>
                  {[[INSTA_SVG,"#fdf2f8","#9d174d","Instagram"],[FB_SVG,"#eff6ff","#1d4ed8","Facebook"],["📍","#f5f3ee","#9a9488","By distance"]].map(([icon,bg,color,label])=>(
                    <div key={label} style={{flex:1,background:bg,borderRadius:8,padding:"7px 4px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      {label==="By distance"
                        ?<span style={{fontSize:15}}>📍</span>
                        :<span dangerouslySetInnerHTML={{__html:icon}} style={{display:"flex"}}/>
                      }
                      <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:9,color,fontWeight:700}}>{label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </a>
        </div>
        {/* Sticky CTA en bas — seulement non payé */}
        {!paid&&(
          <div style={{padding:"12px 20px 24px",flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.bgCard}}>
            <a href="https://buy.stripe.com/dRm9AS0Ze03sb1n0UX4Rq00" target="_blank" rel="noopener noreferrer" style={{display:"flex",width:"100%",padding:"16px",borderRadius:13,background:"#1a7a4a",color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(26,122,74,0.3)",marginBottom:8,textDecoration:"none",boxSizing:"border-box"}}>
              🔓 Unlock all contacts — {PRICE}
            </a>
            <div style={{display:"flex",justifyContent:"center",gap:16}}>
              {["🔐 Secure","⚡ Instant","✅ Lifetime"].map(t=>(
                <span key={t} style={{fontSize:10,color:C.textFaint,fontFamily:"'DM Sans',sans-serif"}}>{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobFinder({onSwitchTab}){
  const[sectors,setSectors]=useState([]);
  const[stateF,setStateF]=useState(null);
  const[paid,setPaid]=useState(false);
  const[selectedJob,setSelectedJob]=useState(null);
  const[showPayment,setShowPayment]=useState(false);
  const[search,setSearch]=useState("");
  const[cityCoords,setCityCoords]=useState(null);
  const[cityName,setCityName]=useState("");
  const[suggestions,setSuggestions]=useState([]);
  const[showSavedOnly,setShowSavedOnly]=useState(false);
  const[saved,setSaved]=useState([]);
  const[searchMode,setSearchMode]=useState("none");
  const[showEmailModal,setShowEmailModal]=useState(false);
  const[emailInput,setEmailInput]=useState("");
  const[emailChecking,setEmailChecking]=useState(false);
  const[emailError,setEmailError]=useState("");
  const[distRadius,setDistRadius]=useState(null); // null = Any distance
  const savedHydrated=useRef(false);
  const searchRef=useRef();

  // Load saved jobs + check paid status client-side only
  useEffect(()=>{
    try{
      const s=localStorage.getItem("vr_saved_jobs");
      if(s)setSaved(JSON.parse(s));
    }catch{}
    savedHydrated.current=true;
    try{
      const storedEmail=localStorage.getItem("vr_paid_email");
      if(storedEmail)setPaid(true);
    }catch{}
  },[]);

  // Save favoris — seulement apres hydratation
  useEffect(()=>{
    if(!savedHydrated.current)return;
    try{localStorage.setItem("vr_saved_jobs",JSON.stringify(saved));}catch{}
  },[saved]);

  const toggleSave=useCallback((jobName,e)=>{
    e.stopPropagation();
    setSaved(prev=>prev.includes(jobName)?prev.filter(n=>n!==jobName):[...prev,jobName]);
  },[]);

  // Verifier l email contre Supabase via notre API
  const checkEmail=useCallback(async(email)=>{
    setEmailChecking(true);
    setEmailError("");
    try{
      const normalizedEmail=email.toLowerCase().trim();
      const res=await fetch("/api/check-access",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({email:normalizedEmail})
      });
      const data=await res.json();
      if(data.paid){
        localStorage.setItem("vr_paid_email",normalizedEmail);
        setPaid(true);
        setShowEmailModal(false);
        // Envoyer le mail welcome back via route serveur dédiée
        fetch("/api/welcome-email",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({email:normalizedEmail})
        }).catch(()=>{});
      } else {
        setShowEmailModal(false);
        setShowPayment(true);
      }
    }catch{
      setEmailError("Connection error. Please try again.");
    }finally{
      setEmailChecking(false);
    }
  },[]);

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

  // Smart search handler
  const handleSearchChange=useCallback((val)=>{
    setSearch(val);
    if(!val||val.length<2){setSuggestions([]);setSearchMode("none");setCityCoords(null);setCityName("");return;}
    const lower=val.toLowerCase();
    const cityMatches=Object.keys(CITY_COORDS).filter(city=>
      city.toLowerCase().startsWith(lower)
    ).slice(0,6);
    if(cityMatches.length>0){
      setSuggestions(cityMatches);
      setSearchMode("city_suggest");
    } else {
      setSuggestions([]);
      setSearchMode("none");
      setCityCoords(null);
      setCityName("");
    }
  },[]);

  const selectCity=useCallback((city)=>{
    setSearch(city);
    setSuggestions([]);
    setCityCoords(CITY_COORDS[city]);
    setCityName(city);
    setSearchMode("city");
    setDistRadius(25); // Par défaut : Nearby (25km)
  },[]);

  const clearSearch=useCallback(()=>{
    setSearch("");setSuggestions([]);setSearchMode("none");setCityCoords(null);setCityName("");setDistRadius(null);
  },[]);

  // Filter & sort
  const filtered=useMemo(()=>JOB_DATA.filter(j=>{
    if(showSavedOnly&&!saved.includes(j.name))return false;
    if(sectors.length>0){
      // Multi-sélection : OR entre les secteurs choisis
      const match=sectors.some(s=>{
        if(s==="Other"){
          const eligible=["Farm","Mine","Construction","Roadhouse","Solar","Fish","Abattoir","Forestry"];
          return !eligible.includes(j.sector);
        }
        return j.sector===s;
      });
      if(!match)return false;
    }
    if(stateF&&j.state!==stateF)return false;
    if(cityCoords&&distRadius!==null){
      const c=CITY_COORDS[j.city];
      if(!c)return false;
      const d=haversine(cityCoords.lat,cityCoords.lng,c.lat,c.lng);
      if(d>distRadius)return false;
    }
    return true;
  }),[sectors,stateF,showSavedOnly,saved,cityCoords,distRadius]);

  const sorted=useMemo(()=>{
    if(cityCoords){
      return [...filtered].sort((a,b)=>{
        const ca=CITY_COORDS[a.city],cb=CITY_COORDS[b.city];
        if(!ca&&!cb)return 0;if(!ca)return 1;if(!cb)return-1;
        return haversine(cityCoords.lat,cityCoords.lng,ca.lat,ca.lng)-haversine(cityCoords.lat,cityCoords.lng,cb.lat,cb.lng);
      });
    }
    return [...filtered].sort((a,b)=>{
      const ss=(STATE_ORDER[a.state]??99)-(STATE_ORDER[b.state]??99);
      if(ss!==0)return ss;
      return(b.score||0)-(a.score||0);
    });
  },[filtered,cityCoords]);

  const visible=paid?sorted:sorted.slice(0,FREE_LIMIT);
  const showWall=!paid&&sorted.length>FREE_LIMIT;
  const lockedCount=sorted.length-FREE_LIMIT;

  const sectorCounts=useMemo(()=>SECTORS.reduce((acc,s)=>{
    acc[s]=JOB_DATA.filter(j=>j.sector===s&&(!stateF||j.state===stateF)).length;
    return acc;
  },{}),[stateF]);

  const getDistLabel=useCallback((job)=>{
    if(!cityCoords)return null;
    const c=CITY_COORDS[job.city];if(!c)return null;
    const d=haversine(cityCoords.lat,cityCoords.lng,c.lat,c.lng);
    return d===0?"nearby":`${d}km`;
  },[cityCoords]);

  return(
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>

      {selectedJob&&!showPayment&&(
        <EmployerModal job={selectedJob} onClose={()=>setSelectedJob(null)} paid={paid} onUnlock={()=>{setSelectedJob(null);setShowPayment(true);}}/>
      )}
      {showEmailModal&&(
        <EmailModal onClose={()=>setShowEmailModal(false)} onCheck={checkEmail} checking={emailChecking} error={emailError}/>
      )}
      {showPayment&&(
        <PaymentModal onClose={()=>setShowPayment(false)} onAlreadyPaid={()=>{setShowPayment(false);setShowEmailModal(true);}}/>
      )}

      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#1a7a4a 0%,#0d3d22 100%)",padding:"22px 18px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:700,color:"#fff",lineHeight:1.2}}>Find employers directly.</div>
            <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:"rgba(255,255,255,0.65)",marginTop:3}}>2,000+ contacts · No middleman · No agency fees</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 12px",marginTop:8}}>
              <span style={{fontSize:11,color:"rgba(255,255,255,0.8)",fontFamily:"'DM Sans',sans-serif"}}>Database updated:</span>
              <span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:"'DM Sans',sans-serif"}}>{DB_LAST_UPDATED}</span>
            </div>
          </div>
          {!paid?(
            <div style={{display:"flex",gap:6,flexShrink:0}}>
              <button onClick={()=>setShowEmailModal(true)} style={{background:"rgba(255,255,255,0.15)",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:10,padding:"8px 12px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",whiteSpace:"nowrap"}}>
                Sign in
              </button>
              <a href="https://buy.stripe.com/dRm9AS0Ze03sb1n0UX4Rq00" target="_blank" rel="noopener noreferrer" style={{background:"#fff",borderRadius:10,padding:"8px 12px",color:C.green,fontSize:11,fontWeight:700,textDecoration:"none",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                🔓 {PRICE}
              </a>
            </div>
          ):(
            <div style={{background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.3)",borderRadius:8,padding:"5px 12px",fontSize:11,fontWeight:600,color:"#fff"}}>✓ Full access</div>
          )}
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {[
            ["📞","Direct phone"],
            ["✉️","Email"],
            ["📸","Instagram"],
            ["👥","Facebook"],
          ].map(([icon,label])=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"5px 10px",border:"1px solid rgba(255,255,255,0.15)"}}>
              <span style={{fontSize:12}}>{icon}</span>
              <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.9)"}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{maxWidth:580,margin:"0 auto",padding:"14px 14px 140px"}}>

        {/* Search bar */}
        <div style={{marginBottom:12,position:"relative"}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15,pointerEvents:"none"}}>
              {searchMode==="city"?"📍":"🔍"}
            </span>
            <input
              ref={searchRef}
              className="jf-input"
              value={search}
              onChange={e=>handleSearchChange(e.target.value)}
              placeholder="Search by city…"
              style={{width:"100%",padding:"12px 36px 12px 38px",borderRadius:12,border:`1.5px solid ${searchMode==="city"?C.green:C.border}`,background:C.bgCard,fontSize:13,fontFamily:"'DM Sans',sans-serif",color:C.text,boxSizing:"border-box",transition:"border-color 0.2s"}}
            />
            {search&&<button onClick={clearSearch} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",fontSize:16,color:C.textFaint,cursor:"pointer"}}>✕</button>}
          </div>
          {suggestions.length>0&&(
            <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:C.shadowLg,zIndex:50,overflow:"hidden"}}>
              <div style={{padding:"8px 12px 4px",fontSize:9,color:C.textFaint,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600}}>Cities nearby</div>
              {suggestions.map(city=>(
                <div key={city} onClick={()=>selectCity(city)} style={{padding:"10px 14px",fontSize:13,color:C.text,cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderTop:`1px solid ${C.border}`}} onMouseEnter={e=>e.currentTarget.style.background=C.bgMuted} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <span style={{fontSize:13}}>📍</span>
                  <span style={{fontWeight:500}}>{city}</span>
                </div>
              ))}
            </div>
          )}

          {/* Active city indicator + slider distance */}
          {searchMode==="city"&&cityCoords&&(
            <div style={{marginTop:8,background:C.bgCard,border:`1px solid ${C.greenBorder}`,borderRadius:10,padding:"10px 14px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontSize:11,color:C.green,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                  <span>📍</span> {cityName}
                </div>
                <span style={{fontSize:12,color:C.green,fontWeight:700,background:C.greenLight,borderRadius:7,padding:"3px 9px",border:`1px solid ${C.greenBorder}`}}>
                  {distRadius===null?"🌏 Any distance":`📍 Within ${distRadius}km`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={DIST_STEPS.length-1}
                step={1}
                value={distRadius===null?DIST_STEPS.length-1:DIST_STEPS.indexOf(distRadius)===-1?DIST_STEPS.length-1:DIST_STEPS.indexOf(distRadius)}
                onChange={e=>{
                  const idx=Number(e.target.value);
                  setDistRadius(DIST_STEPS[idx]);
                }}
                style={{width:"100%",accentColor:C.green,cursor:"pointer",marginBottom:4}}
              />
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:C.textFaint}}>
                <span style={{fontWeight:600,color:C.green}}>📍 Nearby</span>
                <span>100km</span>
                <span>300km</span>
                <span style={{fontWeight:600}}>Any</span>
              </div>
            </div>
          )}
        </div>

        {/* Sector — multi-sélection */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:9,color:C.textFaint,letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:7}}>Sector</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {/* Bouton All */}
            <button key="All" className="jf-chip" onClick={()=>{setShowSavedOnly(false);setSectors([]);}} style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${sectors.length===0&&!showSavedOnly?C.green:C.border}`,background:sectors.length===0&&!showSavedOnly?C.green:C.bgCard,color:sectors.length===0&&!showSavedOnly?"#fff":C.textMid,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
              {SECTOR_ICONS["All"]} All
            </button>
            {SECTORS.filter(s=>s!=="All").map(s=>{
              const active=sectors.includes(s);
              return(
                <button key={s} className="jf-chip" onClick={()=>{
                  setShowSavedOnly(false);
                  setSectors(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
                }} style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${active?C.green:C.border}`,background:active?C.green:C.bgCard,color:active?"#fff":C.textMid,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                  {SECTOR_ICONS[s]} {s}
                </button>
              );
            })}
            {saved.length>0&&(
              <button className="jf-chip" onClick={()=>{setSectors([]);setShowSavedOnly(p=>!p);}} style={{padding:"7px 12px",borderRadius:9,border:`1.5px solid ${showSavedOnly?"#f59e0b":C.border}`,background:showSavedOnly?"#fef9ec":C.bgCard,color:showSavedOnly?"#b45309":C.textMid,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
                ⭐ Saved <span style={{background:showSavedOnly?"#f59e0b":"#e2e8f0",color:showSavedOnly?"#fff":"#64748b",borderRadius:20,padding:"1px 7px",fontSize:11,fontWeight:700}}>{saved.length}</span>
              </button>
            )}
          </div>
          {/* Indicateur secteurs actifs */}
          {sectors.length>1&&(
            <div style={{marginTop:6,fontSize:11,color:C.green,fontWeight:600,display:"flex",alignItems:"center",gap:5}}>
              <span>✓</span> {sectors.join(" + ")}
              <button onClick={()=>setSectors([])} style={{background:"none",border:"none",color:C.textFaint,cursor:"pointer",fontSize:11,padding:"0 4px"}}>✕ Clear</button>
            </div>
          )}
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

        {/* Count + Saved toggle */}
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,background:C.bgMuted,borderRadius:10,padding:"10px 14px"}}>
          <span style={{fontSize:13}}>📋</span>
          <span style={{fontSize:13,fontWeight:600,color:C.text}}>
            <span style={{color:C.green,fontFamily:"'Playfair Display',serif",fontSize:18}}>{sorted.length}</span>
            {" "}employer{sorted.length!==1?"s":""} found
          </span>
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            {!paid&&sorted.length>FREE_LIMIT&&!showSavedOnly&&(
              <span style={{fontSize:10,color:C.textFaint}}>{FREE_LIMIT} free · {lockedCount} locked</span>
            )}
            {paid&&cityCoords&&!showSavedOnly&&<span style={{fontSize:10,color:C.green,fontWeight:600}}>📍 By proximity</span>}
          </div>
        </div>

        {/* Zero results */}
        {sorted.length===0&&(
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,color:C.text,marginBottom:8}}>No results found</div>
            <div style={{fontSize:13,color:C.textFaint,marginBottom:16}}>Try removing a filter</div>
            <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
              {sectors.length>0&&<button onClick={()=>setSectors([])} style={{padding:"8px 14px",borderRadius:9,border:`1.5px solid ${C.green}`,background:C.greenLight,color:C.green,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✕ Remove sector filters</button>}
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
                  <div key={job.name+i} className="jf-card"
                    onClick={()=>setSelectedJob(job)}
                    style={{background:C.bgCard,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 15px",boxShadow:C.shadow,animation:`jfRowIn 0.3s ease ${Math.min(i,8)*0.04}s both`,cursor:"pointer"}}>
                    {/* Top row */}
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
                          {job.score>0&&(
                            <span style={{fontSize:10,color:"#f59e0b",fontWeight:600}}>★ {job.score}{job.reviews>0&&<span style={{color:C.textFaint,fontWeight:400}}> ({job.reviews})</span>}</span>
                          )}
                        </div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <button onClick={(e)=>toggleSave(job.name,e)} style={{background:saved.includes(job.name)?"#fef9ec":"transparent",border:`1.5px solid ${saved.includes(job.name)?"#f59e0b":C.border}`,borderRadius:8,cursor:"pointer",fontSize:20,padding:"4px 8px",lineHeight:1,color:saved.includes(job.name)?"#f59e0b":C.textFaint,transition:"all 0.2s"}} title={saved.includes(job.name)?"Remove from saved":"Save"}>
                            {saved.includes(job.name)?"⭐":"☆"}
                          </button>
                          <span style={{background:sc+"22",border:`1px solid ${sc}55`,borderRadius:7,padding:"3px 8px",fontSize:11,fontWeight:700,color:sc}}>{job.state}</span>
                        </div>
                        {dist&&<span style={{fontSize:10,color:C.green,fontWeight:700,textAlign:"right"}}>{dist}</span>}
                      </div>
                    </div>
                    {/* Location row */}
                    <div style={{display:"flex",alignItems:"center",gap:6,background:C.bgMuted,borderRadius:8,padding:"6px 10px",marginBottom:6}}>
                      <span style={{fontSize:11}}>📍</span>
                      <span style={{fontSize:11,fontWeight:500,color:C.textMid,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{job.city||job.state}{job.address?` · ${job.address}`:""}</span>
                      <a href={`https://maps.google.com/?q=${encodeURIComponent((job.city||job.state)+", Australia")}`} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:10,color:C.teal,fontWeight:600,textDecoration:"none",flexShrink:0}}>Map →</a>
                    </div>
                    {/* Contact badges */}
                    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                      {[
                        {label:"Phone",    val:job.phone},
                        {label:"Email",    val:job.email},
                        {label:"Website",  val:job.website},
                        {label:"Instagram",val:job.instagram},
                        {label:"Facebook", val:job.facebook},
                      ].map(({label,val})=>(
                        <span key={label} style={{display:"flex",alignItems:"center",gap:4,padding:"3px 8px",borderRadius:20,fontSize:10,fontWeight:600,background:val?C.greenLight:C.bgMuted,color:val?C.green:C.textFaint,border:`1px solid ${val?C.greenBorder:C.border}`}}>
                          <span style={{width:5,height:5,borderRadius:"50%",background:val?C.green:C.border,display:"inline-block",flexShrink:0}}/>
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paywall */}
            {showWall&&(
              <a href="https://buy.stripe.com/dRm9AS0Ze03sb1n0UX4Rq00" target="_blank" rel="noopener noreferrer" style={{display:"block",marginTop:12,background:C.bgCard,border:`1.5px solid ${C.greenBorder}`,borderRadius:18,padding:"20px",textAlign:"center",textDecoration:"none",cursor:"pointer"}}>
                <div style={{fontSize:24,marginBottom:8}}>🔒</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:C.text,marginBottom:4}}>2,000+ direct employer contacts</div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:12,color:C.textFaint,marginBottom:14,lineHeight:1.6}}>Updated contacts · Not random Google results</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:12}}>
                  {[["2,000+","employers"],["7","states"],["$24.90","one-time"]].map(([n,l])=>(
                    <div key={l} style={{background:C.bgMuted,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                      <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:C.green,lineHeight:1}}>{n}</div>
                      <div style={{fontSize:10,color:C.textFaint,marginTop:3}}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,color:C.textFaint,marginBottom:10}}>✅ Lifetime access · One-time payment · No subscription</div>
                <div style={{width:"100%",padding:"15px",borderRadius:13,background:C.green,color:"#fff",fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 16px rgba(26,122,74,0.3)",marginBottom:10,boxSizing:"border-box"}}>
                  🔓 Unlock 2,000+ employer contacts — {PRICE}
                </div>
                <div style={{display:"flex",justifyContent:"center",gap:14}}>
                  {["🔐 Secure","⚡ Instant access","✅ Lifetime"].map(t=>(
                    <span key={t} style={{fontSize:10,color:C.textFaint}}>{t}</span>
                  ))}
                </div>
              </a>
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
