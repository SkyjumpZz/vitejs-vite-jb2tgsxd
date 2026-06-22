
import { useState, useEffect, useCallback } from "react";

/* ─────────────── ITEM MASTER LIST ─────────────── */
const ITEM_CATEGORIES = [
  { cat: "MDVR หลัก", items: [
    "MDVR 2CH","MDVR - 32-04","ME41-04 V2","ME41-04 V3","ME41-04 (B)",
    "ME41-04 AI","ME80-08 AI","ME40-04 AI","ME31-08 AI",
    "Video Mixer (Splitter)","Ruptela","Fatigue Momenta","AI BOX","DMS Camera","ADAS Camera"
  ]},
  { cat: "กล้อง / Camera", items: [
    "DOME V.30","DOME V.38 / V.39","DOME CP","DOME CPM","DOME CP outdoor",
    "DOME CP outdoor 2023","DOME CP outdoor v.2","DOME D1","DOME IP V9","DOME IP V30",
    "IP V26 กล้องนอก","Reverse IP68 กล้องถอย","Reverse 608IR กล้องถอย"
  ]},
  { cat: "Storage / การ์ด", items: [
    "SD Card 32 GB","SD Card 64 GB","SD Card 128 GB","SD Card 256 GB","SD Card 512 GB",
    "SSD 240 GB - 256 GB","SSD 480 GB - 512 GB","SSD 1TB"
  ]},
  { cat: "Audio / สัญญาณ", items: [
    "Buzzer ต้านทาน","ลำโพง AI","ลำโพง AI +สายต่อ Ai","ลำโพง AI BOX",
    "MIC เสียง","Intercom v.3","Alarmsound Box"
  ]},
  { cat: "สาย / Cable", items: [
    "Cable 5M (แบบสำเร็จ)","Cable 10M (แบบสำเร็จ)","Cable 15M (แบบสำเร็จ)",
    "สาย 2.5 M / 5 M ทำเอง","สายสามทาง Intercom","สายสามทาง AI BOX",
    "สายสองทาง AI BOX","สายจอ+สายลำโพง Y","RJ45","LAN CABLE","Cable 6 PIN","Cable IP",
    "Cable IP ต่อความยาว 5M / 10M","Cable Splitter","สายต่อเครื่องรูดบัตร",
    "สาย 8CH","สาย Power","ชุดสายไฟ ดำ,แดง,เหลือง"
  ]},
  { cat: "อุปกรณ์เสริม", items: [
    "เครื่องรูดบัตร Binary","เครื่องรูดบัตร EFFON","จอมอนิเตอร์ 4CH / 8CH",
    "Power Plug 1 หัว","Power Plug 2 หัว","Emergency button","กล่อง Relay ไฟถอย",
    "Sensor ถอย / หน้า","ขาตั้ง DMS / จอมอนิเตอร์","Converter 24/12V",
    "Relay 24V หัว+หาง","เหล็กฉาก","กล่องเหล็กเก็บ MDVR","เสา GPS","เสา 3G",
    "กระบอกฟิวส์ + ฟิวส์","IO MDVR","MOTOR 12V","เฟ็ก","หางปลา กลม / เหลี่ยม"
  ]}
];
const ALL_ITEMS = ITEM_CATEGORIES.flatMap(c => c.items);

const TYPE_ROWS = [
  { label:"ใบเบิกของ ติดตั้ง", cls:"gn" },
  { label:"ใบเบิก เปลี่ยนแบบการติดตั้ง", cls:"gn" },
  { label:"ใบคืน ถอดอุปกรณ์", cls:"gn" },
  { label:"ใบเบิกของ Service", cls:"bl" },
  { label:"ใบเบิก ติดตั้งเพิ่มเติม", cls:"bl" },
  { label:"ใบคืน เปลี่ยนแบบ", cls:"bl" },
  { label:"ใบเบิกของ Spare", cls:"rd" },
  { label:"ใบเบิก Stock", cls:"rd" },
  { label:"ใบคืนของ Stock", cls:"rd" },
];

/* ─────────────── STORAGE HELPERS ─────────────── */
async function storageGet(key, shared=true) {
  try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function storageSet(key, val, shared=true) {
  try { await window.storage.set(key, JSON.stringify(val), shared); } catch {}
}
async function storageDel(key, shared=true) {
  try { await window.storage.delete(key, shared); } catch {}
}
async function storageList(prefix, shared=true) {
  try { const r = await window.storage.list(prefix, shared); return r?.keys || []; }
  catch { return []; }
}

/* ─────────────── PRINT HELPERS ─────────────── */
function printDoc(doc, stock) {
  const LEFT_NAMES = [
    "MDVR 2CH","MDVR - 32-04","ME41-04 V2","ME41-04 V3","ME41-04 (B)",
    "ME41-04 AI","ME80-08 AI","ME40-04 AI","ME31-08 AI","Video Mixer (Splitter)",
    "Ruptela","Fatigue Momenta","AI BOX","DMS Camera","ADAS Camera",
    "เครื่องรูดบัตร Binary","เครื่องรูดบัตร EFFON","สายต่อเครื่องรูดบัตร",
    "ลำโพง AI","ลำโพง AI +สายต่อ Ai","สายจอ+สายลำโพง Y","MIC เสียง","Intercom v.3",
    "Alarmsound Box","สาย 2.5 M / 5 M ทำเอง","สายสามทาง Intercom",
    "SD Card 32 GB","SD Card 64 GB","SD Card 128 GB","SD Card 256 GB","SD Card 512 GB",
    "SSD 240 GB - 256 GB","SSD 480 GB - 512 GB","SSD 1TB",
    "จอมอนิเตอร์ 4CH / 8CH","Power Plug 1 หัว","Power Plug 2 หัว",
    "Emergency button","กล่อง Relay ไฟถอย","Sensor ถอย / หน้า",
    "ขาตั้ง DMS / จอมอนิเตอร์","Converter 24/12V","Relay 24V หัว+หาง",
    "เหล็กฉาก","กล่องเหล็กเก็บ MDVR"
  ];
  const RIGHT_NAMES = [
    "DOME V.30","DOME V.38 / V.39","DOME CP","DOME CPM","DOME CP outdoor",
    "DOME CP outdoor 2023","DOME CP outdoor v.2","DOME D1","DOME IP V9","DOME IP V30",
    "IP V26 กล้องนอก","Reverse IP68 กล้องถอย","Reverse 608IR กล้องถอย",
    "Buzzer ต้านทาน","Cable 5M (แบบสำเร็จ)","Cable 10M (แบบสำเร็จ)","Cable 15M (แบบสำเร็จ)",
    "RJ45","LAN CABLE","Cable 6 PIN","Cable IP","Cable IP ต่อความยาว 5M / 10M",
    "Cable Splitter","สายสามทาง AI BOX","สายสองทาง AI BOX","ลำโพง AI BOX",
    "MOTOR 12V","เสา GPS","เสา 3G","กระบอกฟิวส์ + ฟิวส์","IO MDVR","สาย Power",
    "เฟ็ก","ชุดสายไฟ ดำ,แดง,เหลือง","หางปลา กลม / เหลี่ยม","สาย 8CH"
  ];
  const f = (d) => d ? new Date(d).toLocaleDateString("th-TH",{year:"numeric",month:"long",day:"numeric"}) : "___________";
  const items = doc.items || {};
  const types = doc.types || [];
  const custType = doc.custType || "";

  function tCell(t) {
    const on = types.includes(t.label);
    const bg = t.cls==="gn"?"#ccffcc":t.cls==="bl"?"#ccccff":"#ffcccc";
    return `<td style="background:${bg};padding:1.5px 3px;border:.5px solid #555;font-size:6.5pt;font-weight:700;white-space:nowrap">${on?"☑":"☐"} ${t.label}</td>`;
  }
  function cCell(label, bg) {
    const on = custType===label;
    return `<td style="background:${bg};padding:1.5px 3px;border:.5px solid #555;font-size:6.5pt;font-weight:700;white-space:nowrap">${on?"☑":"☐"} ${label}</td>`;
  }
  function itemRow(ln, rn) {
    const li = ln ? (items[ln]||{}) : {};
    const ri = rn ? (items[rn]||{}) : {};
    const lq = li.qty||""; const lo = li.retOk||""; const lc = li.retChkOk||""; const ld = li.retChkBad||"";
    const rq = ri.qty||""; const ro = ri.retOk||""; const rc = ri.retChkOk||""; const rd = ri.retChkBad||"";
    const td = (v,w="") => `<td style="border:.5px solid #bbb;padding:0 2px;font-size:6.5pt;font-weight:700;height:5.5mm;text-align:center;background:#fff;width:${w}">${v||""}</td>`;
    const nm = (v,w) => `<td colspan="2" style="border:.5px solid #bbb;padding:0 3px;font-size:6.5pt;font-weight:700;height:5.5mm;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:#fff;width:${w}">${v||""}</td>`;
    return `<tr>
      <td style="border-left:.9px solid #333;border:.5px solid #bbb;padding:0;height:5.5mm;background:#ccffcc;width:2.5%"></td>
      <td style="border:.5px solid #bbb;padding:0;height:5.5mm;background:#ffcccc;width:2.5%"></td>
      ${nm(ln,"18%")}${td(lq,"4%")}${td(lo,"5%")}${td(lc,"4%")}${td(ld,"4%")}
      <td style="border-right:.9px solid #333;border:.5px solid #bbb;padding:0;width:5%;background:#fff"></td>
      <td style="border:none;background:#ccc;width:1.5%;padding:0"></td>
      <td style="border-left:.9px solid #333;border:.5px solid #bbb;padding:0;background:#ccffcc;width:2.5%"></td>
      <td style="border:.5px solid #bbb;padding:0;background:#ffcccc;width:2.5%"></td>
      ${nm(rn,"18%")}${td(rq,"4%")}${td(ro,"5%")}${td(rc,"4%")}${td(rd,"4%")}
      <td style="border-right:.9px solid #333;border:.5px solid #bbb;padding:0;width:5%;background:#fff"></td>
    </tr>`;
  }

  const maxR = Math.max(LEFT_NAMES.length, RIGHT_NAMES.length);
  let rows = "";
  for(let i=0;i<maxR;i++) rows += itemRow(LEFT_NAMES[i], RIGHT_NAMES[i]);

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
<style>
@page{size:A4 portrait;margin:5mm 4mm}
*{box-sizing:border-box;margin:0;padding:0;font-family:'Sarabun',sans-serif}
body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
table{width:100%;border-collapse:collapse}
</style></head><body>
<div style="font-size:6.5pt;font-weight:700">
<div style="text-align:center;font-size:11pt;font-weight:700;margin-bottom:1.5mm">เอกสารบันทึกสต๊อคสินค้า</div>
<table style="margin-bottom:1.5mm;table-layout:fixed">
<colgroup><col style="width:14%"><col style="width:18%"><col style="width:14%"><col style="width:10%"><col style="width:22%"></colgroup>
<tr>${tCell(TYPE_ROWS[0])}${tCell(TYPE_ROWS[1])}${tCell(TYPE_ROWS[2])}${cCell("ลูกค้า เช่า","#fff")}
<td rowspan="3" style="border:.5px solid #555;padding:2px 4px;font-size:6.5pt;font-weight:700">เลขที่ Stock: <b>${doc.noStock||""}</b></td></tr>
<tr>${tCell(TYPE_ROWS[3])}${tCell(TYPE_ROWS[4])}${tCell(TYPE_ROWS[5])}${cCell("ลูกค้า ซื้อ","#ccffcc")}</tr>
<tr>${tCell(TYPE_ROWS[6])}${tCell(TYPE_ROWS[7])}${tCell(TYPE_ROWS[8])}${cCell("ไม่ระบุในใบงาน","#faa4cb")}</tr>
</table>
<table style="margin-bottom:1.5mm;table-layout:fixed">
<colgroup><col style="width:42%"><col style="width:20%"><col style="width:38%"></colgroup>
<tr>
<td style="border:.5px solid #555;padding:1.5px 4px">ชื่อลูกค้า/หน่วยงาน: <b>${doc.customer||""}</b></td>
<td style="border:.5px solid #555;padding:1.5px 4px">ทะเบียน: <b>${doc.plate||""}</b></td>
<td style="border:.5px solid #555;padding:1.5px 4px">เลขที่ Admin: <b>${doc.noAdmin||""}</b></td>
</tr>
<tr>
<td style="border:.5px solid #555;padding:1.5px 4px">ทีมติดตั้ง/ผู้รับเหมา: <b>${doc.team||""}</b></td>
<td style="border:.5px solid #555;padding:1.5px 4px">จำนวนคัน: <b>${doc.numCars||""}</b></td>
<td style="border:.5px solid #555;padding:1.5px 4px">วันที่รับ: <b>${f(doc.dateRecv)}</b> คืน: <b>${f(doc.dateRet)}</b></td>
</tr>
</table>
<table style="table-layout:fixed">
<colgroup>
<col style="width:2.5%"><col style="width:2.5%"><col style="width:10%"><col style="width:8%">
<col style="width:4%"><col style="width:5%"><col style="width:4%"><col style="width:4%"><col style="width:5%">
<col style="width:1.5%">
<col style="width:2.5%"><col style="width:2.5%"><col style="width:10%"><col style="width:8%">
<col style="width:4%"><col style="width:5%"><col style="width:4%"><col style="width:4%"><col style="width:5%">
</colgroup>
<thead>
<tr>
<th style="border-left:.9px solid #333;border:.5px solid #555;background:#ccffcc;font-size:5.5pt;padding:1px" rowspan="3">เบิก<br>ใหม่</th>
<th style="border:.5px solid #555;background:#ffcccc;font-size:5.5pt;padding:1px" rowspan="3">เบิก<br>เก่า</th>
<th colspan="2" style="border:.5px solid #555;text-align:left;padding-left:3px;font-size:5.5pt" rowspan="3">รายการ</th>
<th style="border:.5px solid #555;font-size:5.5pt;padding:1px" rowspan="3">เบิก</th>
<th style="border:.5px solid #555;font-size:5.5pt;padding:1px" rowspan="3">คืน<br>ปกติดี</th>
<th colspan="2" style="border:.5px solid #555;font-size:5.5pt;padding:1px">คืนรอตรวจ</th>
<th style="border-right:.9px solid #333;border:.5px solid #555;font-size:5.5pt;padding:1px" rowspan="3">หมาย<br>เหตุ</th>
<th style="border:none;background:#ccc" rowspan="3"></th>
<th style="border-left:.9px solid #333;border:.5px solid #555;background:#ccffcc;font-size:5.5pt;padding:1px" rowspan="3">เบิก<br>ใหม่</th>
<th style="border:.5px solid #555;background:#ffcccc;font-size:5.5pt;padding:1px" rowspan="3">เบิก<br>เก่า</th>
<th colspan="2" style="border:.5px solid #555;text-align:left;padding-left:3px;font-size:5.5pt" rowspan="3">รายการ</th>
<th style="border:.5px solid #555;font-size:5.5pt;padding:1px" rowspan="3">เบิก</th>
<th style="border:.5px solid #555;font-size:5.5pt;padding:1px" rowspan="3">คืน<br>ปกติดี</th>
<th colspan="2" style="border:.5px solid #555;font-size:5.5pt;padding:1px">คืนรอตรวจ</th>
<th style="border-right:.9px solid #333;border:.5px solid #555;font-size:5.5pt;padding:1px" rowspan="3">หมาย<br>เหตุ</th>
</tr>
<tr>
<th style="border:.5px solid #555;background:#ccffcc;font-size:5pt;padding:1px">ดี</th>
<th style="border:.5px solid #555;background:#ffcccc;font-size:5pt;padding:1px">เสีย</th>
<th style="border:.5px solid #555;background:#ccffcc;font-size:5pt;padding:1px">ดี</th>
<th style="border:.5px solid #555;background:#ffcccc;font-size:5pt;padding:1px">เสีย</th>
</tr>
<tr></tr>
</thead>
<tbody>${rows}</tbody>
</table>
<div style="display:flex;gap:14px;margin-top:3mm">
<div style="flex:1;text-align:center;border-top:.5px solid #777;padding-top:2px">ผู้เบิก</div>
<div style="flex:1;text-align:center;border-top:.5px solid #777;padding-top:2px">ผู้อนุมัติ</div>
<div style="flex:1;text-align:center;border-top:.5px solid #777;padding-top:2px">ผู้จ่ายของ</div>
</div>
<div style="margin-top:2mm">หมายเหตุ …………………………………………………………………………………………………………………………………………………………………………………………………</div>
</div></body></html>`;

  const w = window.open("","_blank");
  if(w){ w.document.write(html); w.document.close(); setTimeout(()=>w.print(),800); }
}

/* ─────────────── COLORS / STYLES ─────────────── */
const C = {
  bg: "#f0f2f5", card: "#fff", border: "#e2e6ec",
  blue: "#1a6fc4", bluel: "#e8f2fd", bluem: "#378ADD",
  green: "#0F6E56", greenl: "#e0f5ee",
  amber: "#B86A00", amberl: "#fef3e2",
  red: "#c0392b", redl: "#fdeaea",
  text: "#1a1d23", t2: "#5a6072", t3: "#9099aa",
  gn: "#ccffcc", bl: "#ccccff", rd: "#ffcccc", pk: "#faa4cb",
};
const s = {
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, marginBottom: 12, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.06)" },
  cardHead: { display:"flex", alignItems:"center", gap:8, padding:"10px 16px", background:"#f7f8fa", borderBottom:`1px solid ${C.border}` },
  cardBody: { padding: "14px 16px" },
  badge: (color, bg) => ({ fontSize:10, fontWeight:600, padding:"2px 8px", borderRadius:99, background:bg, color, border:`1px solid ${color}40`, display:"inline-flex", alignItems:"center" }),
  btn: (variant="default") => ({
    fontSize:13, fontWeight:600, fontFamily:"inherit", padding:"7px 16px", borderRadius:7,
    cursor:"pointer", display:"inline-flex", alignItems:"center", gap:6, border:"1px solid",
    transition:"all .15s",
    ...(variant==="primary" ? { background:C.blue, color:"#fff", borderColor:"#1260a8" }
      : variant==="green" ? { background:C.green, color:"#fff", borderColor:"#0a4f3d" }
      : variant==="red" ? { background:C.red, color:"#fff", borderColor:"#922b21" }
      : variant==="ghost" ? { background:"transparent", color:C.t2, borderColor:C.border }
      : { background:"#fff", color:C.text, borderColor:C.border })
  }),
  input: { width:"100%", fontSize:13, fontFamily:"inherit", padding:"7px 10px", border:`1px solid ${C.border}`, borderRadius:7, background:"#fff", color:C.text, outline:"none" },
  tab: (active) => ({ padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer", border:"none", background:"transparent", color: active ? C.blue : C.t2, borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent", transition:"all .15s" }),
};

/* ─────────────── MAIN APP ─────────────── */
export default function App() {
  const [tab, setTab] = useState("docs"); // docs | stock | new | edit
  const [docs, setDocs] = useState([]);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [toast, setToast] = useState(null);
  const [stockSearch, setStockSearch] = useState("");
  const [docSearch, setDocSearch] = useState("");

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 2500);
  };

  /* ── load all data ── */
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [stockData, docKeys] = await Promise.all([
      storageGet("songdee:stock"),
      storageList("songdee:doc:")
    ]);
    setStock(stockData || {});
    const loaded = await Promise.all(docKeys.map(k => storageGet(k)));
    setDocs(loaded.filter(Boolean).sort((a,b) => (b.createdAt||0)-(a.createdAt||0)));
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  /* ── save stock ── */
  const saveStock = async (newStock) => {
    setStock(newStock);
    await storageSet("songdee:stock", newStock);
    showToast("บันทึก Stock แล้ว");
  };

  /* ── save doc ── */
  const saveDoc = async (doc) => {
    const key = `songdee:doc:${doc.id}`;
    await storageSet(key, doc);
    setDocs(prev => {
      const idx = prev.findIndex(d=>d.id===doc.id);
      if(idx>=0){ const n=[...prev]; n[idx]=doc; return n.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)); }
      return [doc,...prev].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    });
    showToast("บันทึกใบเบิกแล้ว");
  };

  /* ── delete doc ── */
  const deleteDoc = async (id) => {
    if(!confirm("ลบใบเบิกนี้?")) return;
    await storageDel(`songdee:doc:${id}`);
    setDocs(prev=>prev.filter(d=>d.id!==id));
    showToast("ลบใบเบิกแล้ว","error");
  };

  /* ── open edit ── */
  const openEdit = (id) => { setEditId(id); setTab("edit"); };
  const openNew = () => { setEditId(null); setTab("new"); };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'Sarabun',sans-serif" }}>
      {/* TOPBAR */}
      <div style={{ background:"linear-gradient(135deg,#1a3a6b,#1976d2)", padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(26,63,107,.2)" }}>
        <div>
          <div style={{ fontSize:16, fontWeight:700, color:"#fff" }}>📋 SONGDEE Stock System</div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,.65)", marginTop:2 }}>ระบบจัดการสต๊อกและใบเบิกอุปกรณ์ MDVR</div>
        </div>
        <span style={{ background:"rgba(255,255,255,.18)", color:"#fff", fontSize:11, fontWeight:600, padding:"4px 12px", borderRadius:99, border:"1px solid rgba(255,255,255,.3)" }}>2025 V.2</span>
      </div>

      {/* NAV TABS */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", paddingLeft:12, gap:4 }}>
        {[["docs","📄 ใบเบิก"],["stock","📦 Stock คงเหลือ"]].map(([k,l])=>(
          <button key={k} style={s.tab(tab===k)} onClick={()=>setTab(k)}>{l}</button>
        ))}
        <div style={{ marginLeft:"auto", paddingRight:12 }}>
          <button style={s.btn("primary")} onClick={openNew}>＋ สร้างใบเบิกใหม่</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 12px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.t3, fontSize:14 }}>⏳ กำลังโหลดข้อมูล...</div>
        ) : tab==="docs" ? (
          <DocsTab docs={docs} docSearch={docSearch} setDocSearch={setDocSearch}
            onEdit={openEdit} onDelete={deleteDoc} onPrint={d=>printDoc(d,stock)} />
        ) : tab==="stock" ? (
          <StockTab stock={stock} stockSearch={stockSearch} setStockSearch={setStockSearch} onSave={saveStock} />
        ) : tab==="new" ? (
          <DocEditor doc={null} stock={stock} onSave={async(d)=>{ await saveDoc(d); setTab("docs"); }} onCancel={()=>setTab("docs")} showToast={showToast} />
        ) : tab==="edit" ? (
          <DocEditor doc={docs.find(d=>d.id===editId)} stock={stock} onSave={async(d)=>{ await saveDoc(d); setTab("docs"); }} onCancel={()=>setTab("docs")} showToast={showToast} />
        ) : null}
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, background: toast.type==="error"?C.red:C.green, color:"#fff", fontSize:13, fontWeight:600, padding:"10px 18px", borderRadius:8, boxShadow:"0 4px 16px rgba(0,0,0,.2)", zIndex:9999, transition:"all .3s" }}>
          {toast.type==="error"?"🗑":"✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ─────────────── DOCS TAB ─────────────── */
function DocsTab({ docs, docSearch, setDocSearch, onEdit, onDelete, onPrint }) {
  const filtered = docs.filter(d =>
    !docSearch || [d.noStock,d.noAdmin,d.customer,d.plate,d.team].join(" ").toLowerCase().includes(docSearch.toLowerCase())
  );
  const fmtDate = d => d ? new Date(d).toLocaleDateString("th-TH",{day:"numeric",month:"short",year:"numeric"}) : "-";

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <input style={{...s.input, maxWidth:320}} placeholder="🔍 ค้นหา เลขที่ / ลูกค้า / ทะเบียน..." value={docSearch} onChange={e=>setDocSearch(e.target.value)} />
        <span style={{ fontSize:12, color:C.t3 }}>{filtered.length} รายการ</span>
      </div>
      {filtered.length===0 ? (
        <div style={{ textAlign:"center", padding:"60px 0", color:C.t3 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
          <div>ยังไม่มีใบเบิก — กด "สร้างใบเบิกใหม่" ได้เลย</div>
        </div>
      ) : (
        <div style={{ display:"grid", gap:10 }}>
          {filtered.map(doc=>(
            <div key={doc.id} style={{...s.card, display:"flex", alignItems:"center", gap:0}}>
              {/* status strip */}
              <div style={{ width:5, alignSelf:"stretch", background: doc.status==="closed"?"#27ae60": doc.status==="partial"?"#e67e22":"#1a6fc4", borderRadius:"10px 0 0 10px" }} />
              <div style={{ flex:1, padding:"12px 16px", display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
                <div style={{ minWidth:120 }}>
                  <div style={{ fontSize:12, color:C.t3 }}>เลขที่ Stock</div>
                  <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{doc.noStock||"-"}</div>
                  <div style={{ fontSize:11, color:C.t3 }}>{doc.noAdmin||""}</div>
                </div>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{doc.customer||"-"}</div>
                  <div style={{ fontSize:11, color:C.t3 }}>{doc.plate||""} {doc.team ? "· "+doc.team : ""}</div>
                  <div style={{ fontSize:11, color:C.t3, marginTop:2 }}>{(doc.types||[]).join(", ")}</div>
                </div>
                <div style={{ textAlign:"right", minWidth:110 }}>
                  <div style={{ fontSize:11, color:C.t3 }}>วันที่รับ</div>
                  <div style={{ fontSize:12, fontWeight:600 }}>{fmtDate(doc.dateRecv)}</div>
                  <div style={{ fontSize:11, color:C.t3, marginTop:2 }}>รับ {Object.values(doc.items||{}).filter(i=>i.qty>0).length} รายการ</div>
                </div>
                <StatusBadge status={doc.status} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6, padding:"12px 14px", borderLeft:`1px solid ${C.border}` }}>
                <button style={s.btn("primary")} onClick={()=>onEdit(doc.id)}>✏️ แก้ไข</button>
                <button style={s.btn()} onClick={()=>onPrint(doc)}>🖨 Print</button>
                <button style={s.btn("ghost")} onClick={()=>onDelete(doc.id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { closed:["#27ae60","#e8f8f0","ปิดงานแล้ว"], partial:["#e67e22","#fef4e8","คืนบางส่วน"], open:["#1a6fc4","#e8f2fd","กำลังดำเนินการ"] };
  const [c,bg,l] = map[status||"open"] || map["open"];
  return <span style={s.badge(c,bg)}>{l}</span>;
}

/* ─────────────── STOCK TAB ─────────────── */
function StockTab({ stock, stockSearch, setStockSearch, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const startEdit = () => { setDraft({...stock}); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const save = () => { onSave(draft); setEditing(false); };

  const filteredCats = ITEM_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item => !stockSearch || item.toLowerCase().includes(stockSearch.toLowerCase()))
  })).filter(cat => cat.items.length > 0);

  const lowItems = ALL_ITEMS.filter(item => {
    const q = parseInt(stock[item])||0;
    return q <= 3 && q >= 0;
  });

  return (
    <div>
      {/* Low stock alert */}
      {lowItems.length>0 && (
        <div style={{ background:"#fff8e1", border:"1px solid #ffe082", borderRadius:8, padding:"10px 14px", marginBottom:12, fontSize:12, color:"#7a5200" }}>
          ⚠️ <strong>Stock ต่ำ ({lowItems.length} รายการ):</strong> {lowItems.slice(0,6).join(", ")}{lowItems.length>6?` +${lowItems.length-6} รายการ`:""}
        </div>
      )}

      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
        <input style={{...s.input, maxWidth:320}} placeholder="🔍 ค้นหาสินค้า..." value={stockSearch} onChange={e=>setStockSearch(e.target.value)} />
        {!editing
          ? <button style={s.btn("primary")} onClick={startEdit}>✏️ แก้ไข Stock</button>
          : <>
              <button style={s.btn("green")} onClick={save}>💾 บันทึก</button>
              <button style={s.btn("ghost")} onClick={cancelEdit}>ยกเลิก</button>
            </>
        }
      </div>

      <div style={{ display:"grid", gap:10 }}>
        {filteredCats.map(cat=>(
          <div key={cat.cat} style={s.card}>
            <div style={s.cardHead}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{cat.cat}</div>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ background:"#f4f6f9" }}>
                    <th style={{ padding:"6px 12px", textAlign:"left", fontWeight:600, color:C.t2, fontSize:11, borderBottom:`1px solid ${C.border}` }}>รายการ</th>
                    <th style={{ padding:"6px 12px", textAlign:"center", fontWeight:600, color:C.t2, fontSize:11, width:100, borderBottom:`1px solid ${C.border}` }}>Stock คงเหลือ</th>
                    {editing && <th style={{ padding:"6px 12px", textAlign:"center", fontWeight:600, color:C.t2, fontSize:11, width:100, borderBottom:`1px solid ${C.border}` }}>แก้ไข</th>}
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map(item=>{
                    const qty = editing ? (parseInt(draft[item])||0) : (parseInt(stock[item])||0);
                    const low = qty<=3;
                    return (
                      <tr key={item} style={{ borderBottom:`1px solid #f0f2f5` }}>
                        <td style={{ padding:"6px 12px", color:C.text }}>{item}</td>
                        <td style={{ padding:"6px 12px", textAlign:"center" }}>
                          <span style={{ fontWeight:700, fontSize:14, color: low?"#e67e22":C.green }}>
                            {qty}
                          </span>
                          {low && qty>=0 && <span style={{ fontSize:10, color:"#e67e22", marginLeft:4 }}>⚠</span>}
                        </td>
                        {editing && (
                          <td style={{ padding:"4px 12px", textAlign:"center" }}>
                            <input
                              type="number" min="0"
                              style={{ width:70, textAlign:"center", fontSize:13, fontFamily:"inherit", padding:"4px 6px", border:`1px solid ${C.border}`, borderRadius:6, outline:"none" }}
                              value={draft[item]||""}
                              onChange={e=>setDraft(prev=>({...prev,[item]:parseInt(e.target.value)||0}))}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────── DOC EDITOR ─────────────── */
function DocEditor({ doc, stock, onSave, onCancel, showToast }) {
  const isNew = !doc;
  const [form, setForm] = useState({
    id: doc?.id || `doc_${Date.now()}`,
    createdAt: doc?.createdAt || Date.now(),
    noStock: doc?.noStock||"", noAdmin: doc?.noAdmin||"",
    dateRecv: doc?.dateRecv||"", dateRet: doc?.dateRet||"",
    customer: doc?.customer||"", plate: doc?.plate||"",
    team: doc?.team||"", numCars: doc?.numCars||"",
    types: doc?.types||[], custType: doc?.custType||"",
    items: doc?.items||{}, status: doc?.status||"open",
    notes: doc?.notes||""
  });
  const [itemTab, setItemTab] = useState("select"); // select | return
  const [catFilter, setCatFilter] = useState("all");
  const [itemSearch, setItemSearch] = useState("");

  const setF = (k,v) => setForm(p=>({...p,[k]:v}));
  const togType = (t) => setF("types", form.types.includes(t) ? form.types.filter(x=>x!==t) : [...form.types,t]);
  const togCust = (t) => setF("custType", form.custType===t?"":t);

  const setItem = (name, field, val) => {
    setForm(p=>({...p, items:{...p.items, [name]:{...p.items[name],[field]:val}}}));
  };
  const toggleItem = (name) => {
    const cur = form.items[name];
    if(cur?.qty>0) {
      const next = {...form.items}; delete next[name]; setF("items",next);
    } else {
      setItem(name,"qty",1);
    }
  };

  const selectedItems = Object.entries(form.items).filter(([,v])=>v?.qty>0);

  // filter items for select tab
  const visibleCats = ITEM_CATEGORIES.map(cat=>({
    ...cat,
    items: cat.items.filter(item =>
      (catFilter==="all" || cat.cat===catFilter) &&
      (!itemSearch || item.toLowerCase().includes(itemSearch.toLowerCase()))
    )
  })).filter(cat=>cat.items.length>0);

  const handleSave = async () => {
    if(!form.noStock) { showToast("กรุณากรอกเลขที่ Stock","error"); return; }
    await onSave(form);
  };

  const TROW_BG = { gn:C.gn, bl:C.bl, rd:C.rd };

  return (
    <div>
      {/* header */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <button style={s.btn("ghost")} onClick={onCancel}>← กลับ</button>
        <div style={{ fontSize:15, fontWeight:700, color:C.text }}>{isNew?"สร้างใบเบิกใหม่":"แก้ไขใบเบิก"}</div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          <button style={s.btn("primary")} onClick={handleSave}>💾 บันทึก</button>
        </div>
      </div>

      {/* type checkboxes */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={{ fontWeight:700, fontSize:13 }}>📄 ประเภทเอกสาร</span></div>
        <div style={s.cardBody}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
            {TYPE_ROWS.map(t=>(
              <label key={t.label} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, cursor:"pointer", padding:"6px 10px", border:`1px solid ${C.border}`, borderRadius:7, background: form.types.includes(t.label)?TROW_BG[t.cls]:"#fafbfc", fontWeight:600, transition:"all .15s" }}>
                <input type="checkbox" checked={form.types.includes(t.label)} onChange={()=>togType(t.label)} style={{ accentColor:C.blue, width:13, height:13 }} />
                {t.label}
              </label>
            ))}
          </div>
          <div style={{ display:"flex", gap:6, marginTop:8 }}>
            {[["ลูกค้า เช่า","#fff"],["ลูกค้า ซื้อ",C.gn],["ไม่ระบุในใบงาน",C.pk]].map(([l,bg])=>(
              <label key={l} style={{ flex:1, display:"flex", alignItems:"center", gap:7, fontSize:12, cursor:"pointer", padding:"6px 10px", border:`1px solid ${C.border}`, borderRadius:7, background:form.custType===l?bg:"#fafbfc", fontWeight:600 }}>
                <input type="radio" checked={form.custType===l} onChange={()=>togCust(l)} style={{ accentColor:C.green }} />
                {l}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* job info */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={{ fontWeight:700, fontSize:13 }}>🪪 ข้อมูลงาน</span></div>
        <div style={s.cardBody}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:10, marginBottom:10 }}>
            {[["noStock","เลขที่ Stock","text","STOCK-____"],["noAdmin","เลขที่ Admin","text","ADMIN-____"],["dateRecv","วันที่รับของ","date"],["dateRet","วันที่คืนของ","date"]].map(([k,l,t,ph])=>(
              <div key={k}><div style={{ fontSize:11, fontWeight:600, color:C.t2, marginBottom:3, textTransform:"uppercase", letterSpacing:".04em" }}>{l}</div>
              <input style={s.input} type={t} placeholder={ph} value={form[k]} onChange={e=>setF(k,e.target.value)}/></div>
            ))}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            <div style={{ gridColumn:"span 2" }}><div style={{ fontSize:11, fontWeight:600, color:C.t2, marginBottom:3, textTransform:"uppercase", letterSpacing:".04em" }}>ชื่อลูกค้า / หน่วยงาน</div><input style={s.input} placeholder="ชื่อลูกค้าหรือหน่วยงาน" value={form.customer} onChange={e=>setF("customer",e.target.value)}/></div>
            <div><div style={{ fontSize:11, fontWeight:600, color:C.t2, marginBottom:3, textTransform:"uppercase", letterSpacing:".04em" }}>ทะเบียน</div><input style={s.input} placeholder="กข 1234" value={form.plate} onChange={e=>setF("plate",e.target.value)}/></div>
            <div style={{ gridColumn:"span 2" }}><div style={{ fontSize:11, fontWeight:600, color:C.t2, marginBottom:3, textTransform:"uppercase", letterSpacing:".04em" }}>ทีมติดตั้ง / ผู้รับเหมา</div><input style={s.input} placeholder="ชื่อทีมหรือผู้รับเหมา" value={form.team} onChange={e=>setF("team",e.target.value)}/></div>
            <div><div style={{ fontSize:11, fontWeight:600, color:C.t2, marginBottom:3, textTransform:"uppercase", letterSpacing:".04em" }}>จำนวนคัน</div><input style={s.input} placeholder="1" value={form.numCars} onChange={e=>setF("numCars",e.target.value)}/></div>
          </div>
        </div>
      </div>

      {/* item tabs */}
      <div style={s.card}>
        <div style={{ borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center" }}>
          <button style={s.tab(itemTab==="select")} onClick={()=>setItemTab("select")}>🔧 เลือกอุปกรณ์</button>
          <button style={s.tab(itemTab==="return")} onClick={()=>setItemTab("return")}>📥 บันทึกคืน</button>
          <div style={{ marginLeft:"auto", padding:"4px 12px" }}>
            <span style={s.badge(C.blue,"#e8f2fd")}>{selectedItems.length} รายการ</span>
          </div>
        </div>

        {itemTab==="select" ? (
          <div style={{ padding:14 }}>
            <div style={{ display:"flex", gap:8, marginBottom:12, flexWrap:"wrap" }}>
              <input style={{...s.input, maxWidth:240}} placeholder="🔍 ค้นหาอุปกรณ์..." value={itemSearch} onChange={e=>setItemSearch(e.target.value)} />
              <select style={{...s.input, maxWidth:200}} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
                <option value="all">ทุกหมวด</option>
                {ITEM_CATEGORIES.map(c=><option key={c.cat} value={c.cat}>{c.cat}</option>)}
              </select>
            </div>
            {visibleCats.map(cat=>(
              <div key={cat.cat} style={{ marginBottom:14 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.t2, textTransform:"uppercase", letterSpacing:".05em", marginBottom:6 }}>{cat.cat}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:6 }}>
                  {cat.items.map(item=>{
                    const sel = (form.items[item]?.qty||0)>0;
                    const stk = parseInt(stock[item])||0;
                    return (
                      <div key={item} onClick={()=>toggleItem(item)} style={{ border:`1px solid ${sel?C.blue:C.border}`, borderRadius:7, padding:"8px 10px", cursor:"pointer", background: sel?C.bluel:"#fafbfc", position:"relative", transition:"all .15s" }}>
                        <div style={{ fontSize:12, fontWeight:600, color:sel?"#0C447C":C.text, marginBottom:4 }}>{item}</div>
                        <div style={{ fontSize:11, color:C.t3 }}>Stock: <strong style={{ color: stk<=3?"#e67e22":C.green }}>{stk}</strong></div>
                        {sel && (
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }} onClick={e=>e.stopPropagation()}>
                            <label style={{ fontSize:10, color:C.t2, fontWeight:600 }}>จำนวน:</label>
                            <input type="number" min="1" style={{ width:50, fontSize:12, padding:"2px 4px", border:`1px solid ${C.border}`, borderRadius:5, textAlign:"center" }}
                              value={form.items[item]?.qty||1}
                              onChange={e=>setItem(item,"qty",parseInt(e.target.value)||1)} />
                            <select style={{ fontSize:10, padding:"2px 4px", border:`1px solid ${C.border}`, borderRadius:5 }}
                              value={form.items[item]?.isNew?"new":"old"}
                              onChange={e=>setItem(item,"isNew",e.target.value==="new")}>
                              <option value="new">ใหม่</option>
                              <option value="old">เก่า</option>
                            </select>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* RETURN TAB */
          <div style={{ padding:14 }}>
            <div style={{ fontSize:12, color:C.t2, marginBottom:12, padding:"8px 12px", background:"#f7f8fa", borderRadius:7 }}>
              📌 กรอกจำนวนที่คืนแต่ละช่อง (ช่องที่ยังไม่ได้กรอกหมายถึงยังไม่ได้คืน)
            </div>
            {selectedItems.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:C.t3 }}>ยังไม่ได้เลือกอุปกรณ์ในแท็บ "เลือกอุปกรณ์"</div>
            ) : (
              <>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ background:"#f4f6f9" }}>
                      <th style={{ padding:"6px 10px", textAlign:"left", fontWeight:600, color:C.t2, fontSize:11, borderBottom:`1px solid ${C.border}` }}>รายการ</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontWeight:600, color:C.t2, fontSize:11, width:60, borderBottom:`1px solid ${C.border}` }}>เบิก</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontWeight:600, color:C.t2, fontSize:11, width:80, borderBottom:`1px solid ${C.border}` }}>คืน ปกติดี</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontWeight:600, color:C.t2, fontSize:11, width:80, borderBottom:`1px solid ${C.border}`, background:"#eefaea" }}>รอตรวจ ดี</th>
                      <th style={{ padding:"6px 10px", textAlign:"center", fontWeight:600, color:C.t2, fontSize:11, width:80, borderBottom:`1px solid ${C.border}`, background:"#feecec" }}>รอตรวจ เสีย</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map(([name,item])=>{
                      const totalRet = (parseInt(item.retOk)||0)+(parseInt(item.retChkOk)||0)+(parseInt(item.retChkBad)||0);
                      const done = totalRet >= (item.qty||0);
                      return (
                        <tr key={name} style={{ borderBottom:`1px solid #f0f2f5`, background: done?"#f0faf4":"#fff" }}>
                          <td style={{ padding:"6px 10px", fontWeight:600 }}>
                            {done && <span style={{ fontSize:11, marginRight:4 }}>✅</span>}
                            {name}
                            <span style={s.badge(item.isNew?"#0C447C":"#633806", item.isNew?C.bluel:C.amberl)}>{item.isNew?"ใหม่":"เก่า"}</span>
                          </td>
                          <td style={{ padding:"6px 10px", textAlign:"center", fontWeight:700, color:C.text }}>{item.qty}</td>
                          {["retOk","retChkOk","retChkBad"].map(f=>(
                            <td key={f} style={{ padding:"4px 8px", textAlign:"center" }}>
                              <input type="number" min="0" style={{ width:60, textAlign:"center", fontSize:12, padding:"3px 5px", border:`1px solid ${C.border}`, borderRadius:5, outline:"none" }}
                                value={item[f]||""}
                                onChange={e=>setItem(name,f,parseInt(e.target.value)||0)} />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* status selector */}
                <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:12, fontWeight:600, color:C.t2 }}>สถานะใบเบิก:</span>
                  {[["open","กำลังดำเนินการ","#1a6fc4"],["partial","คืนบางส่วน","#e67e22"],["closed","ปิดงานแล้ว","#27ae60"]].map(([k,l,c])=>(
                    <label key={k} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, cursor:"pointer", padding:"5px 10px", border:`1.5px solid ${form.status===k?c:C.border}`, borderRadius:6, background:form.status===k?`${c}18`:"#fff", fontWeight:600, color:form.status===k?c:C.text }}>
                      <input type="radio" checked={form.status===k} onChange={()=>setF("status",k)} style={{ accentColor:c }} />{l}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* notes */}
      <div style={s.card}>
        <div style={s.cardHead}><span style={{ fontWeight:700, fontSize:13 }}>📝 หมายเหตุ</span></div>
        <div style={s.cardBody}>
          <textarea style={{...s.input, height:70, resize:"vertical"}} placeholder="หมายเหตุเพิ่มเติม..." value={form.notes} onChange={e=>setF("notes",e.target.value)} />
        </div>
      </div>

      <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <button style={s.btn("ghost")} onClick={onCancel}>ยกเลิก</button>
        <button style={s.btn("primary")} onClick={handleSave}>💾 บันทึกใบเบิก</button>
      </div>
    </div>
  );
}
