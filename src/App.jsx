import { useState, useRef } from “react”;

const MONTHS = [“Ocak”,“Şubat”,“Mart”,“Nisan”,“Mayıs”,“Haziran”,“Temmuz”,“Ağustos”,“Eylül”,“Ekim”,“Kasım”,“Aralık”];
const DAYS = [“Pzt”,“Sal”,“Çar”,“Per”,“Cum”,“Cmt”,“Paz”];
const COLORS = [”#FF6B6B”,”#4ECDC4”,”#45B7D1”,”#96CEB4”,”#FFEAA7”,”#DDA0DD”,”#98D8C8”,”#F7DC6F”,”#BB8FCE”,”#85C1E9”];

const now = new Date();

const MONTH_NAMES = {
“ocak”:0,“jan”:0,“january”:0,“şubat”:1,“subat”:1,“feb”:1,“february”:1,
“mart”:2,“mar”:2,“march”:2,“nisan”:3,“nis”:3,“apr”:3,“april”:3,
“mayıs”:4,“mayis”:4,“may”:4,“haziran”:5,“haz”:5,“jun”:5,“june”:5,
“temmuz”:6,“tem”:6,“jul”:6,“july”:6,“ağustos”:7,“agustos”:7,“agu”:7,“aug”:7,“august”:7,
“eylül”:8,“eylul”:8,“eyl”:8,“sep”:8,“september”:8,“ekim”:9,“eki”:9,“oct”:9,“october”:9,
“kasım”:10,“kasim”:10,“kas”:10,“nov”:10,“november”:10,“aralık”:11,“aralik”:11,“ara”:11,“dec”:11,“december”:11
};

function dateToObj(d) { return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }; }
function objToDate(o) { return new Date(o.year, o.month, o.day); }
function compareDateObjs(a, b) { return objToDate(a) - objToDate(b); }

function parseNaturalText(text) {
const lower = text.toLowerCase();
const fallbackYear = (() => { const ym = text.match(/\b(202[3-9]|203\d)\b/); return ym ? parseInt(ym[1]) : now.getFullYear(); })();

let startObj = null, endObj = null;

// Pattern 1: “6-11 Nisan” or “6 - 11 Nisan”
let m = lower.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s+([a-zçğışöüa-z]+)/i);
if (m) {
const mo = MONTH_NAMES[m[3]];
if (mo !== undefined) {
startObj = { day: parseInt(m[1]), month: mo, year: fallbackYear };
endObj   = { day: parseInt(m[2]), month: mo, year: fallbackYear };
}
}

// Pattern 2: “6 Nisan - 11 Nisan” or cross-month “6 Nisan - 11 Mayıs”
if (!startObj) {
m = lower.match(/(\d{1,2})\s+([a-zçğışöü]+)\s*[-–]\s*(\d{1,2})\s+([a-zçğışöü]+)/i);
if (m) {
const mo1 = MONTH_NAMES[m[2]], mo2 = MONTH_NAMES[m[4]];
if (mo1 !== undefined && mo2 !== undefined) {
startObj = { day: parseInt(m[1]), month: mo1, year: fallbackYear };
endObj   = { day: parseInt(m[3]), month: mo2, year: fallbackYear };
}
}
}

// Pattern 3: “6 ile 11 Nisan” / “6’dan 11’e Nisan”
if (!startObj) {
m = lower.match(/(\d{1,2})(?:’den|’dan|den|dan)?\s+(?:ile|ve)\s+(\d{1,2})(?:’e|’a|ye|ya)?\s+([a-zçğışöü]+)/i);
if (m) {
const mo = MONTH_NAMES[m[3]];
if (mo !== undefined) {
startObj = { day: parseInt(m[1]), month: mo, year: fallbackYear };
endObj   = { day: parseInt(m[2]), month: mo, year: fallbackYear };
}
}
}

// Pattern 4: “Nisan 6-11”
if (!startObj) {
m = lower.match(/([a-zçğışöü]+)\s+(\d{1,2})\s*[-–]\s*(\d{1,2})/i);
if (m) {
const mo = MONTH_NAMES[m[1]];
if (mo !== undefined) {
startObj = { day: parseInt(m[2]), month: mo, year: fallbackYear };
endObj   = { day: parseInt(m[3]), month: mo, year: fallbackYear };
}
}
}

// Time
let hour = null, minute = 0;
const timeM = lower.match(/(\d{1,2})[:.](\d{2})/);
if (timeM) { hour = parseInt(timeM[1]); minute = parseInt(timeM[2]); }

// Title
let title = text
.replace(/\d{1,2}\s*[-–]\s*\d{1,2}\s+(?:ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/gi, “”)
.replace(/\d{1,2}\s+(?:ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\s*[-–]\s*\d{1,2}\s+(?:ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/gi, “”)
.replace(/\d{1,2}\s+(?:ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)/gi, “”)
.replace(/(?:ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)\s+\d{1,2}(?:\s*[-–]\s*\d{1,2})?/gi, “”)
.replace(/\d{1,2}[:.]\d{2}/g, “”)
.replace(/\b(bugün|yarın|today|tomorrow|ile|arasında|arası|’den|’dan|den|dan|’e|’a)\b/gi, “”)
.replace(/\b(sabah|öğle|akşam|gece|saat)\b/gi, “”)
.replace(/\s+/g, “ “).trim();
if (!title) title = “Etkinlik”;
title = title.charAt(0).toUpperCase() + title.slice(1);

if (startObj) {
if (endObj && compareDateObjs(endObj, startObj) < 0) {
endObj.month = (endObj.month + 1) % 12;
if (endObj.month === 0) endObj.year++;
}
const allDay = hour === null;
return { start: startObj, end: endObj || startObj, hour: hour ?? 0, minute, title, allDay };
}

// Single date fallback
if (/bugün|today/.test(lower)) {
const s = dateToObj(now);
return { start:s, end:s, hour: hour??9, minute, title, allDay: false };
}
if (/yarın|tomorrow/.test(lower)) {
const t = new Date(now); t.setDate(t.getDate()+1); const s = dateToObj(t);
return { start:s, end:s, hour: hour??9, minute, title, allDay: false };
}
const re1 = /(\d{1,2})\s+([a-zçğışöüa-z]+)/gi;
while ((m = re1.exec(lower)) !== null) {
const d = parseInt(m[1]), mo = MONTH_NAMES[m[2]];
if (mo !== undefined && d >= 1 && d <= 31) {
const s = { day:d, month:mo, year:fallbackYear };
return { start:s, end:s, hour: hour??9, minute, title, allDay: false };
}
}
const re2 = /([a-zçğışöü]+)\s+(\d{1,2})/gi;
while ((m = re2.exec(lower)) !== null) {
const mo = MONTH_NAMES[m[1]], d = parseInt(m[2]);
if (mo !== undefined && d >= 1 && d <= 31) {
const s = { day:d, month:mo, year:fallbackYear };
return { start:s, end:s, hour: hour??9, minute, title, allDay: false };
}
}
return null;
}

function getDaysInMonth(year, month) { return new Date(year, month+1, 0).getDate(); }
function getFirstDayOfMonth(year, month) { let d = new Date(year,month,1).getDay(); return d===0?6:d-1; }

function eventCoversDay(ev, day, month, year) {
const d = new Date(year, month, day);
return d >= objToDate(ev.start) && d <= objToDate(ev.end);
}
function isRange(ev) {
return objToDate(ev.start).getTime() !== objToDate(ev.end).getTime();
}

export default function App() {
const [viewYear, setViewYear] = useState(now.getFullYear());
const [viewMonth, setViewMonth] = useState(now.getMonth());
const [events, setEvents] = useState([{
id:1, color:COLORS[0], title:“Bugünkü toplantı”, allDay:false,
start:dateToObj(now), end:dateToObj(now), hour:10, minute:0
}]);
const [input, setInput] = useState(””);
const [feedback, setFeedback] = useState(null);
const [selectedDay, setSelectedDay] = useState(null);
const [loading, setLoading] = useState(false);
const inputRef = useRef();

const daysInMonth = getDaysInMonth(viewYear, viewMonth);
const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

const getEventsForDay = (day) =>
events.filter(ev => eventCoversDay(ev, day, viewMonth, viewYear))
.sort((a,b) => a.hour*60+a.minute-(b.hour*60+b.minute));

const handleAdd = async () => {
if (!input.trim()) return;
setLoading(true); setFeedback(null);
const parsed = parseNaturalText(input);
if (parsed) {
const color = COLORS[events.length % COLORS.length];
const newEv = { id: Date.now(), color, …parsed };
setEvents(prev=>[…prev, newEv]);
setViewMonth(parsed.start.month); setViewYear(parsed.start.year); setSelectedDay(parsed.start.day);
const rangeEv = isRange(newEv);
const dateStr = rangeEv
? `${parsed.start.day} ${MONTHS[parsed.start.month]} – ${parsed.end.day} ${MONTHS[parsed.end.month]}`
: `${parsed.start.day} ${MONTHS[parsed.start.month]}`;
const timeStr = parsed.allDay ? “tüm gün” : `${parsed.hour.toString().padStart(2,'0')}:${parsed.minute.toString().padStart(2,'0')}`;
setFeedback({ type:“success”, msg:`✓ "${parsed.title}" — ${dateStr}, ${timeStr}` });
setInput(””); setLoading(false); return;
}

```
// AI fallback
try {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514", max_tokens:300,
      system:`Takvim asistanısın. Metnden etkinlik çıkar, SADECE JSON döndür.
```

Tek gün: {“type”:“single”,“day”:G,“month”:M,“year”:Y,“hour”:H,“minute”:DK,“title”:“AD”,“allDay”:false}
Aralık: {“type”:“range”,“startDay”:G,“startMonth”:M,“startYear”:Y,“endDay”:G,“endMonth”:M,“endYear”:Y,“title”:“AD”,“allDay”:true}
Ay: Ocak=0..Aralık=11. Bugün:${now.toLocaleDateString(‘tr-TR’)}. Yıl yoksa ${now.getFullYear()}.`, messages:[{role:"user",content:input}] }) }); const data = await res.json(); const raw = data.content?.map(i=>i.text||"").join("")||""; const p = JSON.parse(raw.replace(/```json|```/g,"").trim()); const color = COLORS[events.length % COLORS.length]; let newEv; if (p.type==="range") { newEv = { id:Date.now(), color, title:p.title, allDay:true, hour:0, minute:0, start:{day:p.startDay,month:p.startMonth,year:p.startYear}, end:{day:p.endDay,month:p.endMonth,year:p.endYear} }; } else { newEv = { id:Date.now(), color, title:p.title, allDay:p.allDay||false, hour:p.hour??9, minute:p.minute||0, start:{day:p.day,month:p.month,year:p.year}, end:{day:p.day,month:p.month,year:p.year} }; } setEvents(prev=>[...prev,newEv]); setViewMonth(newEv.start.month); setViewYear(newEv.start.year); setSelectedDay(newEv.start.day); const rangeEv = isRange(newEv); const dateStr = rangeEv ? `${newEv.start.day} ${MONTHS[newEv.start.month]} – ${newEv.end.day} ${MONTHS[newEv.end.month]}`:`${newEv.start.day} ${MONTHS[newEv.start.month]}`; setFeedback({type:"success", msg:`✓ “${newEv.title}” — ${dateStr}`});
setInput(””);
} catch(e) {
setFeedback({type:“error”, msg:“Anlaşılamadı. Örnek: ‘6-11 Nisan Boston’ veya ‘28 Mart 10:00 emlakçı’”});
}
setLoading(false);
};

const handleKey = e => { if(e.key===“Enter”) handleAdd(); };
const deleteEvent = id => setEvents(prev=>prev.filter(e=>e.id!==id));
const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); setSelectedDay(null); };
const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); setSelectedDay(null); };

const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

return (
<div style={{minHeight:“100vh”,background:”#0f0f14”,fontFamily:”‘DM Sans’,‘Segoe UI’,sans-serif”,color:”#e8e8f0”,padding:“24px 16px”,display:“flex”,flexDirection:“column”,alignItems:“center”}}>
<style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap'); *{box-sizing:border-box;} ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#1a1a24;}::-webkit-scrollbar-thumb{background:#333;border-radius:4px;} .day-cell{border-radius:10px;transition:background 0.15s;cursor:pointer;} .day-cell:hover{background:#1e1e2e!important;} .day-cell.selected{background:#1e1e2e!important;outline:2px solid #7c6af0;outline-offset:-2px;} .del-btn{opacity:0;transition:opacity 0.2s;background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:16px;padding:2px 6px;} .event-row:hover .del-btn{opacity:1;} .add-btn:hover{background:#6c5ef0!important;} .nav-btn:hover{background:#222!important;} input:focus{outline:none;} .tip-item:hover{color:#7c6af0!important;}`}</style>

```
  <div style={{width:"100%",maxWidth:520}}>
    <div style={{marginBottom:28,textAlign:"center"}}>
      <div style={{fontFamily:"'DM Serif Display',serif",fontSize:32,letterSpacing:"-0.5px",color:"#fff"}}>Takvimim</div>
      <div style={{fontSize:13,color:"#555",marginTop:4}}>Doğal dille ekle · Tek gün & aralık desteği</div>
    </div>

    <div style={{display:"flex",gap:8,marginBottom:feedback?8:20}}>
      <input ref={inputRef} value={input}
        onChange={e=>{setInput(e.target.value);setFeedback(null);}}
        onKeyDown={handleKey}
        placeholder="6-11 Nisan Boston konferansı..."
        style={{flex:1,background:"#1a1a24",border:"1.5px solid #2a2a38",borderRadius:12,padding:"12px 16px",color:"#e8e8f0",fontSize:15,transition:"border-color 0.2s"}}
        onFocus={e=>e.target.style.borderColor="#7c6af0"}
        onBlur={e=>e.target.style.borderColor="#2a2a38"}
      />
      <button className="add-btn" onClick={handleAdd} disabled={loading}
        style={{background:"#7c6af0",border:"none",borderRadius:12,padding:"12px 20px",color:"#fff",fontWeight:600,fontSize:15,cursor:"pointer",transition:"background 0.2s",whiteSpace:"nowrap"}}>
        {loading?"...":"Ekle"}
      </button>
    </div>

    {feedback && (
      <div style={{marginBottom:16,padding:"10px 14px",borderRadius:10,
        background:feedback.type==="success"?"rgba(78,205,196,0.12)":"rgba(255,107,107,0.12)",
        border:`1px solid ${feedback.type==="success"?"rgba(78,205,196,0.3)":"rgba(255,107,107,0.3)"}`,
        color:feedback.type==="success"?"#4ecdc4":"#ff6b6b",fontSize:14}}>
        {feedback.msg}
      </div>
    )}

    {/* Calendar grid */}
    <div style={{background:"#16161f",borderRadius:18,padding:"20px",marginBottom:16,border:"1px solid #2a2a38"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <button className="nav-btn" onClick={prevMonth} style={{background:"#1e1e2e",border:"none",color:"#aaa",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:16}}>‹</button>
        <div style={{fontWeight:600,fontSize:17,color:"#fff"}}>{MONTHS[viewMonth]} {viewYear}</div>
        <button className="nav-btn" onClick={nextMonth} style={{background:"#1e1e2e",border:"none",color:"#aaa",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:16}}>›</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6}}>
        {DAYS.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:11,color:"#555",fontWeight:600,padding:"4px 0",textTransform:"uppercase",letterSpacing:"0.5px"}}>{d}</div>
        ))}
      </div>

      {/* Range bars row — rendered above grid as overlay */}
      <div style={{position:"relative"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
          {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`} style={{minHeight:58}}/>)}
          {Array.from({length:daysInMonth}).map((_,i)=>{
            const d = i+1;
            const colIdx = (firstDay+i) % 7;
            const rangeEvs = events.filter(ev => isRange(ev) && eventCoversDay(ev, d, viewMonth, viewYear));
            const singleEvs = events.filter(ev => !isRange(ev) && eventCoversDay(ev, d, viewMonth, viewYear));
            const isToday = d===now.getDate()&&viewMonth===now.getMonth()&&viewYear===now.getFullYear();
            const isSel = d===selectedDay;
            const firstRangeEv = rangeEvs[0];

            return (
              <div key={d} className={`day-cell${isSel?" selected":""}`}
                onClick={()=>setSelectedDay(isSel?null:d)}
                style={{minHeight:58,padding:"5px 2px",textAlign:"center",position:"relative",overflow:"hidden"}}>

                {/* Range band */}
                {firstRangeEv && (() => {
                  const rStart = firstRangeEv.start.day===d && firstRangeEv.start.month===viewMonth && firstRangeEv.start.year===viewYear;
                  const rEnd   = firstRangeEv.end.day===d && firstRangeEv.end.month===viewMonth && firstRangeEv.end.year===viewYear;
                  const isFirstCol = colIdx===0;
                  const isLastCol  = colIdx===6;
                  const roundL = rStart || isFirstCol;
                  const roundR = rEnd || isLastCol;
                  return (
                    <div style={{
                      position:"absolute", bottom:7, left:0, right:0, height:8,
                      background: firstRangeEv.color+"44",
                      borderRadius:`${roundL?4:0}px ${roundR?4:0}px ${roundR?4:0}px ${roundL?4:0}px`,
                      marginLeft: rStart ? 6 : 0,
                      marginRight: rEnd ? 6 : 0,
                      borderLeft: rStart ? `3px solid ${firstRangeEv.color}` : "none",
                      borderRight: rEnd ? `3px solid ${firstRangeEv.color}` : "none",
                    }}/>
                  );
                })()}

                {/* Day number */}
                <div style={{
                  width:28,height:28,borderRadius:"50%",margin:"0 auto",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  background: isToday?"#7c6af0":"transparent",
                  color: isToday?"#fff": firstRangeEv ? firstRangeEv.color : "#ccc",
                  fontWeight: isToday||firstRangeEv?600:400, fontSize:14, position:"relative",zIndex:1
                }}>{d}</div>

                {/* Single event dots */}
                {singleEvs.length > 0 && (
                  <div style={{display:"flex",gap:2,justifyContent:"center",marginTop:2,position:"relative",zIndex:1}}>
                    {singleEvs.slice(0,3).map(ev=>(
                      <span key={ev.id} style={{width:5,height:5,borderRadius:"50%",background:ev.color,display:"inline-block"}}/>
                    ))}
                  </div>
                )}

                {rangeEvs.length > 1 && (
                  <div style={{position:"absolute",top:2,right:3,fontSize:9,color:"#555",zIndex:2}}>+{rangeEvs.length-1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Selected day */}
    {selectedDay && (
      <div style={{background:"#16161f",borderRadius:18,padding:"18px 20px",border:"1px solid #2a2a38",marginBottom:16}}>
        <div style={{fontSize:13,color:"#666",marginBottom:12,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.5px"}}>
          {selectedDay} {MONTHS[viewMonth]}
        </div>
        {selectedEvents.length===0 ? (
          <div style={{color:"#444",fontSize:14,textAlign:"center",padding:"16px 0"}}>Bu gün için etkinlik yok</div>
        ) : selectedEvents.map(ev=>(
          <div key={ev.id} className="event-row" style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #1e1e2e"}}>
            <div style={{width:3,height:36,borderRadius:2,background:ev.color,flexShrink:0}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:500,fontSize:15}}>{ev.title}</div>
              <div style={{fontSize:12,color:"#666",marginTop:2}}>
                {isRange(ev)
                  ? `${ev.start.day} ${MONTHS[ev.start.month]} – ${ev.end.day} ${MONTHS[ev.end.month]} · Tüm gün`
                  : `${ev.hour.toString().padStart(2,'0')}:${ev.minute.toString().padStart(2,'0')}`}
              </div>
            </div>
            <button className="del-btn" onClick={()=>deleteEvent(ev.id)}>×</button>
          </div>
        ))}
      </div>
    )}

    {/* Tips */}
    <div style={{padding:"12px 16px",background:"#12121a",borderRadius:12,border:"1px solid #1e1e2e"}}>
      <div style={{fontSize:11,color:"#444",marginBottom:6,fontWeight:600,letterSpacing:"0.5px"}}>ÖRNEK KOMUTLAR</div>
      {["6-11 Nisan Boston konferansı","28 Mart 10:00 emlakçı","15 Mayıs - 20 Mayıs tatil","Yarın 14:30 doktor"].map(ex=>(
        <div key={ex} className="tip-item" onClick={()=>{setInput(ex);inputRef.current?.focus();}}
          style={{fontSize:13,color:"#555",padding:"3px 0",cursor:"pointer",transition:"color 0.15s"}}>→ {ex}</div>
      ))}
    </div>
  </div>
</div>
```

);
}
