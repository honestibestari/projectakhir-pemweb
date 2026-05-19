import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  apiLogin, apiRegister, apiGetProducts, apiGetCategories,
  apiGetOrders, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  apiAddCategory, apiUpdateCategory, apiDeleteCategory,
  apiUpdateOrderStatus
} from './api';


const C = {
  ruby:      "#B91C3A",
  rubyDeep:  "#8B1229",
  rubyLight: "#FFF1F3",
  rubyGlow:  "rgba(185,28,58,0.12)",
  jade:      "#065F46",
  jadeLight: "#ECFDF5",
  gold:      "#92702A",
  goldShine: "#D4A843",
  goldLight: "#FDF8EE",
  ink:       "#0F0A06",
  inkSoft:   "#2D2118",
  stone:     "#6B5B4E",
  fog:       "#B8A99A",
  silk:      "#F7F3EE",
  parchment: "#EDE8E1",
  cream:     "#FDFAF7",
  snow:      "#FFFFFF",
  sapphire:  "#1D4ED8",
  sapphireL: "#EFF6FF",
  amber:     "#92400E",
  amberL:    "#FFFBEB",
  danger:    "#991B1B",
  dangerL:   "#FEF2F2",
};

const FIXED_SELLER = "MeiHua Official";
const fmt = (n) => "Rp\u00A0" + Number(n).toLocaleString("id-ID");

function getToken() { return localStorage.getItem('meihua_token'); }
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function uploadImageToServer(file) {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch('/api/products/upload-image', {
    method: 'POST',
    headers: authHeaders(),  
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Upload gagal');
  return data; 
}

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 14px; scroll-behavior: smooth; }
    body {
      font-family: 'Outfit', sans-serif;
      background: ${C.silk};
      color: ${C.ink};
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.parchment}; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.fog}; }

    /* TYPOGRAPHY */
    .t-display { font-family: 'Playfair Display', serif; }
    .t-display-italic { font-family: 'Playfair Display', serif; font-style: italic; }
    .t-mono { font-family: 'Courier New', monospace; }

    /* BUTTONS */
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 7px; border: none; border-radius: 10px; cursor: pointer;
      font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 13px;
      letter-spacing: .1px; transition: all .18s cubic-bezier(.4,0,.2,1);
      white-space: nowrap;
    }
    .btn:active { transform: scale(.97); }
    .btn-ruby {
      background: ${C.ruby}; color: ${C.snow};
      padding: 10px 22px;
      box-shadow: 0 2px 12px ${C.rubyGlow};
    }
    .btn-ruby:hover { background: ${C.rubyDeep}; box-shadow: 0 4px 20px ${C.rubyGlow}; transform: translateY(-1px); }
    .btn-ghost {
      background: transparent; color: ${C.inkSoft};
      padding: 9px 18px; border: 1.5px solid ${C.parchment};
    }
    .btn-ghost:hover { border-color: ${C.ruby}; color: ${C.ruby}; background: ${C.rubyLight}; }
    .btn-danger-soft {
      background: ${C.dangerL}; color: ${C.danger};
      padding: 7px 13px; border: 1.5px solid #FECACA; font-size: 12px;
    }
    .btn-danger-soft:hover { background: #FEE2E2; }
    .btn-edit-soft {
      background: ${C.snow}; color: ${C.ruby};
      padding: 7px 13px; border: 1.5px solid ${C.parchment}; font-size: 12px;
    }
    .btn-edit-soft:hover { border-color: ${C.ruby}; background: ${C.rubyLight}; }
    .btn-sm { padding: 7px 14px; font-size: 12px; border-radius: 8px; }
    .btn-icon {
      background: ${C.silk}; border: 1.5px solid ${C.parchment};
      color: ${C.stone}; width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
    }
    .btn-icon:hover { border-color: ${C.ruby}; color: ${C.ruby}; background: ${C.rubyLight}; }

    /* INPUTS */
    .inp {
      width: 100%; padding: 10px 14px;
      border: 1.5px solid ${C.parchment}; border-radius: 10px;
      font-size: 13.5px; font-family: 'Outfit', sans-serif;
      color: ${C.ink}; background: ${C.snow};
      outline: none; transition: border-color .15s, box-shadow .15s;
    }
    .inp:focus {
      border-color: ${C.ruby};
      box-shadow: 0 0 0 3.5px ${C.rubyGlow};
    }
    .inp::placeholder { color: ${C.fog}; }
    .inp-label {
      font-size: 11px; font-weight: 700; color: ${C.fog};
      text-transform: uppercase; letter-spacing: .7px; margin-bottom: 5px;
      display: block;
    }
    .inp-group { display: flex; flex-direction: column; }
    select.inp { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23B8A99A' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 13px center; padding-right: 36px; }
    textarea.inp { resize: vertical; min-height: 84px; line-height: 1.55; }

    /* CARD */
    .card {
      background: ${C.snow}; border: 1px solid ${C.parchment};
      border-radius: 14px; overflow: hidden;
    }
    .card-pad { padding: 20px; }

    /* TABLE */
    .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
    .tbl th {
      padding: 11px 16px; text-align: left;
      font-size: 10.5px; font-weight: 700; color: ${C.fog};
      text-transform: uppercase; letter-spacing: .7px;
      background: ${C.silk}; border-bottom: 1px solid ${C.parchment};
    }
    .tbl td {
      padding: 13px 16px; border-bottom: 1px solid #F5F0EA;
      color: ${C.stone}; vertical-align: middle;
    }
    .tbl tbody tr { transition: background .1s; }
    .tbl tbody tr:hover td { background: ${C.silk}; }
    .tbl tbody tr:last-child td { border-bottom: none; }

    /* STATUS BADGES */
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 11px; border-radius: 99px;
      font-size: 11px; font-weight: 700; letter-spacing: .1px;
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .badge-pending    { background: ${C.amberL};   color: ${C.amber}; }
    .badge-dot-pending    { background: ${C.amber}; }
    .badge-processing { background: ${C.sapphireL}; color: ${C.sapphire}; }
    .badge-dot-processing { background: ${C.sapphire}; }
    .badge-shipped    { background: #E0F2FE;        color: #0369A1; }
    .badge-dot-shipped    { background: #0369A1; }
    .badge-delivered  { background: ${C.jadeLight}; color: ${C.jade}; }
    .badge-dot-delivered  { background: ${C.jade}; }
    .badge-cancelled  { background: ${C.dangerL};  color: ${C.danger}; }
    .badge-dot-cancelled  { background: ${C.danger}; }

    /* PRODUCT CARD */
    .prod-card {
      background: ${C.snow}; border: 1px solid ${C.parchment};
      border-radius: 14px; overflow: hidden;
      transition: box-shadow .25s, transform .25s;
      display: flex; flex-direction: column; cursor: pointer;
    }
    .prod-card:hover {
      box-shadow: 0 12px 36px rgba(15,10,6,.1);
      transform: translateY(-3px);
    }

    /* CATEGORY SIDEBAR */
    .cat-item {
      display: flex; align-items: center;
      padding: 10px 16px; cursor: pointer;
      font-size: 12.5px; color: ${C.stone};
      border-left: 3px solid transparent;
      transition: all .15s; font-weight: 500;
    }
    .cat-item:hover { background: ${C.rubyLight}; color: ${C.ruby}; }
    .cat-item.active {
      border-left-color: ${C.ruby};
      background: ${C.rubyLight}; color: ${C.ruby}; font-weight: 700;
    }
    .sub-item {
      padding: 9px 14px; font-size: 12px; color: ${C.stone};
      cursor: pointer; border-left: 3px solid transparent;
      transition: all .15s; font-weight: 500;
    }
    .sub-item:hover { background: ${C.rubyLight}; color: ${C.ruby}; }
    .sub-item.active { border-left-color: ${C.ruby}; background: ${C.rubyLight}; color: ${C.ruby}; font-weight: 700; }

    /* ADMIN SIDEBAR */
    .admin-nav {
      display: flex; align-items: center; gap: 10px;
      padding: 10px 18px; cursor: pointer;
      font-size: 13px; color: ${C.stone};
      border-left: 3px solid transparent;
      border-radius: 0 8px 8px 0;
      transition: all .15s; font-weight: 500; margin: 1.5px 8px 1.5px 0;
    }
    .admin-nav:hover { background: ${C.rubyLight}; color: ${C.ruby}; }
    .admin-nav.active {
      border-left-color: ${C.ruby};
      background: ${C.rubyLight}; color: ${C.ruby}; font-weight: 700;
    }
    .nav-pill {
      margin-left: auto; background: ${C.ruby};
      color: ${C.snow}; font-size: 10px;
      padding: 2px 7px; border-radius: 99px; font-weight: 700;
    }

    /* QTY CONTROL */
    .qty-ctrl {
      display: flex; align-items: center;
      border: 1.5px solid ${C.parchment}; border-radius: 9px;
      overflow: hidden; height: 34px;
    }
    .qty-btn {
      width: 34px; height: 100%;
      background: ${C.snow}; border: none;
      font-size: 16px; color: ${C.stone};
      cursor: pointer; font-weight: 600; flex-shrink: 0; transition: .15s;
    }
    .qty-btn:hover { background: ${C.rubyLight}; color: ${C.ruby}; }
    .qty-btn:first-child { border-right: 1.5px solid ${C.parchment}; }
    .qty-btn:last-child  { border-left:  1.5px solid ${C.parchment}; }
    .qty-num { flex: 1; text-align: center; font-weight: 700; font-size: 13px; }

    /* UPLOAD ZONE */
    .upload-zone {
      aspect-ratio: 1; border-radius: 14px;
      border: 2px dashed ${C.parchment};
      background: ${C.silk};
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      cursor: pointer; overflow: hidden; transition: all .18s;
      position: relative;
    }
    .upload-zone:hover { border-color: ${C.ruby}; background: ${C.rubyLight}; }
    .upload-zone.has-img { border-style: solid; border-color: ${C.parchment}; }
    .upload-zone .upload-overlay {
      position: absolute; inset: 0; background: rgba(15,10,6,.55);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .18s; color: ${C.snow}; gap: 6px;
    }
    .upload-zone:hover .upload-overlay { opacity: 1; }

    /* UPLOAD PROGRESS */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .uploading-bar {
      height: 3px; border-radius: 99px;
      background: linear-gradient(90deg, ${C.parchment} 0%, ${C.ruby} 50%, ${C.parchment} 100%);
      background-size: 200%;
      animation: shimmer 1.2s infinite;
    }

    /* DIVIDER */
    .divider { border: none; border-top: 1px solid ${C.parchment}; }

    /* STAT CARD */
    .stat-card {
      background: ${C.snow}; border: 1px solid ${C.parchment};
      border-radius: 14px; padding: 18px 20px;
      display: flex; flex-direction: column; gap: 3px;
    }
    .stat-val { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; line-height: 1.1; }
    .stat-label { font-size: 12px; font-weight: 600; color: ${C.inkSoft}; }
    .stat-sub { font-size: 11px; color: ${C.fog}; }

    /* TOPBAR */
    .topbar {
      background: ${C.snow}; border-bottom: 1px solid ${C.parchment};
      position: sticky; top: 0; z-index: 100; flex-shrink: 0;
    }

    /* PATTERN BG for login */
    .auth-pattern {
      background-color: ${C.ink};
      background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B91C3A' fill-opacity='0.08'%3E%3Cpath d='M20 20l20-20v2L22 20l18 18v2L20 22 2 40H0L20 20zm0 0L0 0h2l18 18L38 0h2L20 20zm0 0l20 20h-2L20 22 2 40H0L20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    /* CHART bar hover */
    .bar-seg:hover { filter: brightness(1.05); }

    /* PRODUCT TAG */
    .prod-tag {
      display: inline-flex; align-items: center;
      background: ${C.goldLight}; color: ${C.gold};
      padding: 2px 9px; border-radius: 99px;
      font-size: 11px; font-weight: 700;
    }

    /* SECTION TITLE */
    .sec-title {
      font-family: 'Playfair Display', serif;
      font-size: 22px; font-weight: 700; color: ${C.ink};
    }
    .sec-sub { font-size: 12px; color: ${C.fog}; margin-top: 3px; }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fadeUp .35s ease both; }
  `}</style>
);

const Ic = {
  logo: ({ size = 30 }) => (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <rect width="36" height="36" rx="10" fill={C.ruby}/>
      <path d="M18 7L21.5 14.5H30L23.5 19.5L26 28L18 23.5L10 28L12.5 19.5L6 14.5H14.5L18 7Z"
        fill={C.goldShine} stroke={C.goldShine} strokeWidth=".5" strokeLinejoin="round"/>
      <circle cx="18" cy="18" r="3.5" fill={C.snow} opacity=".9"/>
    </svg>
  ),
  dash:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  box:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  order:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  tag:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  chart:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  cart:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  x:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  plus:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  edit:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  user:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  image:   () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  upload:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  star:    () => <svg width="10" height="10" viewBox="0 0 24 24" fill={C.goldShine} stroke={C.goldShine} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  chevron: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  ok:      () => <svg width="11" height="11" viewBox="0 0 24 24" fill={C.jade} stroke="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  warn:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  del:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
};

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(10,5,3,.62)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(3px)"}}
    >
      <div onClick={e=>e.stopPropagation()} className="fade-up">{children}</div>
    </div>
  );
}

function ConfirmModal({ title, desc, onConfirm, onCancel, danger }) {
  return (
    <Overlay onClose={onCancel}>
      <div style={{background:C.snow,borderRadius:18,padding:"32px 28px",width:360,textAlign:"center",boxShadow:"0 28px 72px rgba(0,0,0,.2)"}}>
        <div style={{width:56,height:56,borderRadius:"50%",background:danger?C.dangerL:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
          {danger ? <Ic.del/> : <Ic.warn/>}
        </div>
        <h3 style={{margin:"0 0 8px",fontSize:18,color:C.ink,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>{title}</h3>
        <p style={{margin:"0 0 26px",fontSize:13,color:C.stone,lineHeight:1.65}}>{desc}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} className="btn btn-ghost" style={{flex:1,padding:11}}>Batal</button>
          <button
            onClick={onConfirm}
            style={{flex:1,padding:11,borderRadius:10,border:"none",background:danger?C.danger:C.ruby,color:C.snow,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:".15s"}}
          >
            {danger ? "Ya, Hapus" : "Konfirmasi"}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

const STATUS_LABEL = {pending:"Menunggu",processing:"Diproses",shipped:"Dikirim",delivered:"Selesai",cancelled:"Dibatalkan"};
function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className={`badge-dot badge-dot-${status}`}/>
      {STATUS_LABEL[status]}
    </span>
  );
}

function StatCard({ label, value, sub, accent = C.ruby }) {
  return (
    <div className="stat-card">
      <p className="stat-val" style={{color:accent}}>{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  );
}

function ImageUploadWidget({ currentUrl, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const result = await uploadImageToServer(file);
      onChange(result.url); 
    } catch (err) {
      setError(err.message || 'Upload gagal. Coba lagi.');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <span className="inp-label">Foto Produk</span>
      <div
        className={`upload-zone ${currentUrl ? 'has-img' : ''}`}
        onClick={() => !uploading && fileRef.current.click()}
        onDragOver={e => { e.preventDefault(); }}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      >
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div className="upload-overlay">
              <Ic.upload/>
              <span style={{fontSize:12,fontWeight:600}}>Ganti Foto</span>
            </div>
          </>
        ) : (
          <>
            {uploading ? (
              <div style={{textAlign:"center",padding:20}}>
                <p style={{fontSize:12,color:C.fog,marginBottom:10}}>Mengupload...</p>
                <div className="uploading-bar" style={{width:80}}/>
              </div>
            ) : (
              <>
                <div style={{color:C.fog,marginBottom:8}}><Ic.image/></div>
                <p style={{fontSize:12,color:C.fog,fontWeight:500,textAlign:"center",lineHeight:1.5,padding:"0 10px"}}>
                  Klik atau seret foto ke sini
                </p>
                <p style={{fontSize:11,color:C.parchment,marginTop:4}}>JPG, PNG, WEBP · Maks 5MB</p>
              </>
            )}
          </>
        )}
        {uploading && currentUrl && (
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:6,background:"rgba(15,10,6,.7)"}}>
            <div className="uploading-bar"/>
          </div>
        )}
      </div>
      {error && <p style={{fontSize:11,color:C.danger,marginTop:2}}>⚠ {error}</p>}
      <input
        ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
      {currentUrl && (
        <button
          onClick={() => onChange(null)}
          className="btn btn-danger-soft btn-sm"
          style={{width:"100%"}}
        >
          Hapus Foto
        </button>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const statusOpts = ["pending","processing","shipped","delivered","cancelled"];
  return (
    <Overlay onClose={onClose}>
      <div style={{background:C.snow,borderRadius:18,width:500,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 28px 72px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:`1px solid ${C.parchment}`}}>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,color:C.fog,textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 4px"}}>Detail Pesanan</p>
            <h3 style={{margin:0,fontSize:20,color:C.ink,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>#{order.id}</h3>
          </div>
          <button onClick={onClose} className="btn btn-icon"><Ic.x/></button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:18}}>
          <div style={{background:C.silk,borderRadius:12,padding:16}}>
            <p style={{fontSize:10.5,fontWeight:700,color:C.fog,textTransform:"uppercase",letterSpacing:".6px",margin:"0 0 10px"}}>Informasi Pelanggan</p>
            <p style={{fontWeight:700,color:C.ink,margin:"0 0 5px",fontSize:14}}>{order.customer}</p>
            <p style={{fontSize:12,color:C.fog,margin:"0 0 3px"}}>Telp: {order.phone}</p>
            <p style={{fontSize:12,color:C.fog,margin:0}}>Alamat: {order.address}</p>
          </div>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,color:C.fog,textTransform:"uppercase",letterSpacing:".6px",margin:"0 0 10px"}}>Item Pesanan</p>
            {order.items.map((it,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<order.items.length-1?`1px solid ${C.parchment}`:"none"}}>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:C.ink,margin:"0 0 2px"}}>{it.name}</p>
                  <p style={{fontSize:11,color:C.fog,margin:0}}>×{it.qty} · {fmt(it.price)}</p>
                </div>
                <p style={{fontWeight:700,color:C.ink,margin:0,flexShrink:0}}>{fmt(it.qty*it.price)}</p>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:`2px solid ${C.parchment}`}}>
              <span style={{fontWeight:700,fontSize:14,color:C.ink}}>Total</span>
              <span style={{fontWeight:700,fontSize:17,color:C.ruby}}>{fmt(order.total)}</span>
            </div>
          </div>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,color:C.fog,textTransform:"uppercase",letterSpacing:".6px",margin:"0 0 10px"}}>Ubah Status</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {statusOpts.map(s=>(
                <button key={s} onClick={()=>onStatusChange(order.id,s)} style={{
                  padding:"7px 15px",borderRadius:99,
                  border:`1.5px solid ${order.status===s?C.ruby:C.parchment}`,
                  background:order.status===s?C.ruby:C.snow,
                  color:order.status===s?C.snow:C.stone,
                  fontSize:12,fontWeight:600,cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif",transition:".15s"
                }}>
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function OrdersPanel({ orders, setOrders }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const counts = {
    all:orders.length,
    pending:orders.filter(o=>o.status==="pending").length,
    processing:orders.filter(o=>o.status==="processing").length,
    shipped:orders.filter(o=>o.status==="shipped").length,
    delivered:orders.filter(o=>o.status==="delivered").length,
    cancelled:orders.filter(o=>o.status==="cancelled").length,
  };
  const filtered = orders.filter(o=>
    (filter==="all"||o.status===filter) &&
    (o.id.toLowerCase().includes(search.toLowerCase())||o.customer.toLowerCase().includes(search.toLowerCase()))
  );
  const revenue = orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+o.total,0);

  const changeStatus = async (id, status) => {
    await apiUpdateOrderStatus(id, status);
    setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o));
    setSelected(prev=>prev?{...prev,status}:prev);
  };

  const filterBtns = [["all","Semua"],["pending","Menunggu"],["processing","Diproses"],["shipped","Dikirim"],["delivered","Selesai"],["cancelled","Dibatalkan"]];

  return (
    <div style={{padding:26,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <h2 className="sec-title">Pesanan Masuk</h2>
          <p className="sec-sub">{orders.length} total pesanan</p>
        </div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.fog,pointerEvents:"none"}}><Ic.search/></span>
          <input className="inp" placeholder="Cari ID atau nama..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:230,paddingLeft:36}}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Total Pendapatan" value={fmt(revenue)} sub="Pesanan selesai" accent={C.ruby}/>
        <StatCard label="Pesanan Baru" value={counts.pending} sub="Menunggu konfirmasi" accent={C.amber}/>
        <StatCard label="Dalam Proses" value={counts.processing+counts.shipped} sub="Diproses & dikirim" accent={C.sapphire}/>
        <StatCard label="Pesanan Selesai" value={counts.delivered} sub="Berhasil terkirim" accent={C.jade}/>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {filterBtns.map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{
            padding:"6px 15px",borderRadius:99,
            border:`1.5px solid ${filter===k?C.ruby:C.parchment}`,
            background:filter===k?C.ruby:C.snow,
            color:filter===k?C.snow:C.stone,
            fontSize:12,fontWeight:600,cursor:"pointer",
            fontFamily:"'Outfit',sans-serif",transition:".15s",
            display:"inline-flex",alignItems:"center",gap:5
          }}>
            {v}
            {counts[k]>0&&<span style={{background:filter===k?"rgba(255,255,255,.25)":"#EDE8E1",borderRadius:99,padding:"0 6px",fontSize:11}}>{counts[k]}</span>}
          </button>
        ))}
      </div>

      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th>ID Pesanan</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{textAlign:"center",padding:52,color:C.fog}}>
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={C.parchment} strokeWidth="1.5" style={{display:"block",margin:"0 auto 10px"}}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Tidak ada pesanan
              </td></tr>
            )}
            {filtered.map(o=>(
              <tr key={o.id}>
                <td><span style={{fontWeight:700,color:C.ruby,fontSize:12}}>#{o.id}</span></td>
                <td>
                  <p style={{fontWeight:600,color:C.ink,margin:"0 0 2px",fontSize:13}}>{o.customer}</p>
                  <p style={{fontSize:11,color:C.fog,margin:0}}>{o.phone}</p>
                </td>
                <td style={{fontSize:12,color:C.fog,maxWidth:180}}>{o.items.map(it=>`${it.name} (×${it.qty})`).join(", ")}</td>
                <td><span style={{fontWeight:700,color:C.ink}}>{fmt(o.total)}</span></td>
                <td style={{fontSize:11,color:C.fog,whiteSpace:"nowrap"}}>{o.date}</td>
                <td><StatusBadge status={o.status}/></td>
                <td><button className="btn btn-edit-soft btn-sm" onClick={()=>setSelected(o)}>Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <OrderDetailModal order={selected} onClose={()=>setSelected(null)} onStatusChange={changeStatus}/>}
    </div>
  );
}

function ProductsPanel({ products, setProducts, categories }) {
  const [view, setView] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imgUrl, setImgUrl] = useState(null);
  const emptyForm = { name:"", cat:categories[0]?.id||"", price:"", oldPrice:"", discount:"", rating:"4.9", sold:"" };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => { setForm(emptyForm); setImgUrl(null); setEditTarget(null); };
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({name:p.name,cat:p.cat,price:p.price,oldPrice:p.oldPrice||"",discount:p.discount||"",rating:p.rating,sold:p.sold});
    setImgUrl(p.img || null);
    setView("edit");
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { alert("Nama dan harga wajib diisi!"); return; }
    const data = {
      name: form.name, cat: form.cat,
      price: Number(form.price),
      old_price: form.oldPrice ? Number(form.oldPrice) : null,
      discount: form.discount ? Number(form.discount) : null,
      img: imgUrl,  
      rating: Number(form.rating),
      sold: form.sold, seller: FIXED_SELLER,
    };
    try {
      if (view === "add") {
        const res = await apiAddProduct(data);
        if (res.id) setProducts(prev=>[...prev,{...data,id:res.id,oldPrice:data.old_price,img:res.img||imgUrl}]);
      } else {
        const res = await apiUpdateProduct(editTarget.id, data);
        setProducts(prev=>prev.map(p=>p.id===editTarget.id?{...p,...data,oldPrice:data.old_price,img:res?.img||imgUrl}:p));
      }
      setView("list"); resetForm();
    } catch { alert("Gagal menyimpan produk. Coba lagi."); }
  };

  if (view==="add"||view==="edit") {
    return (
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{background:C.snow,borderBottom:`1px solid ${C.parchment}`,padding:"18px 26px"}}>
          <h2 className="sec-title">{view==="add"?"Tambah Produk Baru":"Edit Produk"}</h2>
          {view==="edit"&&<p className="sec-sub">{editTarget?.name}</p>}
        </div>
        <div style={{padding:28,maxWidth:920,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:30,alignItems:"start"}}>
            <ImageUploadWidget currentUrl={imgUrl} onChange={setImgUrl}/>
            <div style={{display:"flex",flexDirection:"column",gap:15}}>
              <div className="inp-group">
                <label className="inp-label">Nama Produk *</label>
                <input className="inp" placeholder="cth: Cincin Emas 18K Rose Gold" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div className="inp-group">
                  <label className="inp-label">Kategori</label>
                  <select className="inp" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Nama Toko</label>
                  <input className="inp" value={FIXED_SELLER} readOnly style={{background:C.silk,color:C.fog,cursor:"not-allowed"}}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Harga Jual (Rp) *</label>
                  <input className="inp" type="number" placeholder="150000" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Harga Asli (Rp)</label>
                  <input className="inp" type="number" placeholder="200000" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Diskon (%)</label>
                  <input className="inp" type="number" placeholder="20" value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Jumlah Terjual</label>
                  <input className="inp" placeholder="100rb+" value={form.sold} onChange={e=>setForm({...form,sold:e.target.value})}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={()=>{setView("list");resetForm();}} className="btn btn-ghost" style={{padding:"11px 22px"}}>Batal</button>
                <button onClick={handleSave} className="btn btn-ruby" style={{flex:1,padding:11}}>
                  {view==="add"?"Simpan Produk":"Update Produk"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:26,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div>
          <h2 className="sec-title">Manajemen Produk</h2>
          <p className="sec-sub">{products.length} produk terdaftar</p>
        </div>
        <button onClick={()=>{resetForm();setView("add");}} className="btn btn-ruby"><Ic.plus/> Tambah Produk</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Total Produk" value={products.length} accent={C.ruby}/>
        <StatCard label="Ada Diskon" value={products.filter(p=>p.discount).length} accent={C.danger}/>
        <StatCard label="Ada Foto" value={products.filter(p=>p.img).length} accent={C.jade}/>
        <StatCard label="Kategori" value={categories.length} accent={C.sapphire}/>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th style={{width:52}}>Foto</th><th>Nama Produk</th><th>Harga</th><th>Kategori</th><th>Rating</th><th>Aksi</th></tr></thead>
          <tbody>
            {products.length===0 && (
              <tr><td colSpan={6} style={{textAlign:"center",padding:52,color:C.fog}}>Belum ada produk.</td></tr>
            )}
            {products.map(p=>(
              <tr key={p.id}>
                <td>
                  <div style={{width:44,height:44,borderRadius:10,background:C.silk,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.parchment}`}}>
                    {p.img ? <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : <span style={{color:C.parchment}}><Ic.image/></span>}
                  </div>
                </td>
                <td>
                  <p style={{fontWeight:600,color:C.ink,margin:"0 0 3px",fontSize:13}}>{p.name}</p>
                  <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,color:C.jade,fontWeight:600}}><Ic.ok/> {p.seller}</span>
                </td>
                <td>
                  <p style={{fontWeight:700,color:C.ruby,margin:"0 0 2px",fontSize:13}}>{fmt(p.price)}</p>
                  {p.discount && <span style={{fontSize:10.5,color:C.danger,background:C.dangerL,padding:"1px 7px",borderRadius:5,fontWeight:700}}>−{p.discount}%</span>}
                </td>
                <td><span className="prod-tag">{categories.find(c=>c.id===p.cat)?.label||p.cat}</span></td>
                <td><span style={{display:"inline-flex",alignItems:"center",gap:4,fontWeight:600,fontSize:12,color:C.ink}}><Ic.star/> {p.rating}</span></td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openEdit(p)} className="btn btn-edit-soft btn-sm"><Ic.edit/> Edit</button>
                    <button onClick={()=>setDeleteTarget(p)} className="btn btn-danger-soft btn-sm"><Ic.trash/> Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteTarget && (
        <ConfirmModal
          title="Hapus produk ini?"
          desc={`"${deleteTarget.name}" akan dihapus secara permanen termasuk fotonya.`}
          danger
          onConfirm={async()=>{
            await apiDeleteProduct(deleteTarget.id);
            setProducts(prev=>prev.filter(p=>p.id!==deleteTarget.id));
            setDeleteTarget(null);
          }}
          onCancel={()=>setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function CategoriesPanel({ categories, setCategories }) {
  const [view, setView] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ label:"", subsRaw:"" });
  const [err, setErr] = useState("");

  const openEdit = (cat) => { setEditTarget(cat); setForm({label:cat.label,subsRaw:cat.subs.join(", ")}); setErr(""); setView("edit"); };
  const handleSave = async () => {
    const label = form.label.trim();
    if (!label) { setErr("Nama kategori wajib diisi."); return; }
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (view==="add"&&categories.find(c=>c.id===id)) { setErr("Kategori dengan nama ini sudah ada."); return; }
    const subs = form.subsRaw.split(",").map(s=>s.trim()).filter(Boolean);
    try {
      if (view==="add") {
        const res = await apiAddCategory({ id, label, subs });
        setCategories(prev=>[...prev,{id:res.id||id,label,subs}]);
      } else {
        await apiUpdateCategory(editTarget.id,{label,subs});
        setCategories(prev=>prev.map(c=>c.id===editTarget.id?{...c,label,subs}:c));
      }
      setView("list"); setErr("");
    } catch { setErr("Gagal menyimpan kategori. Coba lagi."); }
  };

  if (view!=="list") return (
    <div style={{padding:26,maxWidth:580}}>
      <h2 className="sec-title" style={{marginBottom:20}}>{view==="add"?"Tambah Kategori":"Edit Kategori"}</h2>
      {err && <div style={{background:C.dangerL,border:`1px solid #FECACA`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.danger}}>{err}</div>}
      <div className="card card-pad">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="inp-group">
            <label className="inp-label">Nama Kategori *</label>
            <input className="inp" placeholder="cth: Gelang" value={form.label} onChange={e=>setForm({...form,label:e.target.value})}/>
            <p style={{fontSize:11,color:C.fog,marginTop:5}}>ID: <strong>{form.label.toLowerCase().replace(/\s+/g,"-")||"—"}</strong></p>
          </div>
          <div className="inp-group">
            <label className="inp-label">Sub-Kategori (pisahkan koma)</label>
            <textarea className="inp" placeholder="cth: Gelang Emas, Gelang Perak, Gelang Batu" value={form.subsRaw} onChange={e=>setForm({...form,subsRaw:e.target.value})}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setView("list");setErr("");}} className="btn btn-ghost" style={{padding:"10px 22px"}}>Batal</button>
            <button onClick={handleSave} className="btn btn-ruby" style={{flex:1,padding:10}}>
              {view==="add"?"Simpan Kategori":"Update Kategori"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{padding:26,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
        <div><h2 className="sec-title">Manajemen Kategori</h2><p className="sec-sub">{categories.length} kategori aktif</p></div>
        <button onClick={()=>{setForm({label:"",subsRaw:""});setErr("");setView("add");}} className="btn btn-ruby"><Ic.plus/> Tambah Kategori</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Nama Kategori</th><th>ID</th><th>Sub-Kategori</th><th>Aksi</th></tr></thead>
          <tbody>
            {categories.length===0 && <tr><td colSpan={4} style={{textAlign:"center",padding:52,color:C.fog}}>Belum ada kategori.</td></tr>}
            {categories.map(cat=>(
              <tr key={cat.id}>
                <td style={{fontWeight:700,color:C.ink,fontSize:13}}>{cat.label}</td>
                <td><code style={{background:C.silk,color:C.fog,padding:"2px 9px",borderRadius:6,fontSize:11}}>{cat.id}</code></td>
                <td>
                  {cat.subs.length===0
                    ? <span style={{color:C.parchment,fontStyle:"italic",fontSize:12}}>Tidak ada</span>
                    : <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {cat.subs.map((s,j)=><span key={j} className="prod-tag">{s}</span>)}
                      </div>
                  }
                </td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openEdit(cat)} className="btn btn-edit-soft btn-sm"><Ic.edit/> Edit</button>
                    <button onClick={()=>setDeleteTarget(cat)} className="btn btn-danger-soft btn-sm"><Ic.trash/> Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteTarget && (
        <ConfirmModal
          title="Hapus kategori?"
          desc={`Kategori "${deleteTarget.label}" akan dihapus permanen.`}
          danger
          onConfirm={async()=>{
            await apiDeleteCategory(deleteTarget.id);
            setCategories(prev=>prev.filter(c=>c.id!==deleteTarget.id));
            setDeleteTarget(null);
          }}
          onCancel={()=>setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function SalesReportPanel({ orders, products, categories }) {
  const delivered = orders.filter(o=>o.status==="delivered");
  const totalRevenue = delivered.reduce((s,o)=>s+o.total,0);
  const avgOrder = delivered.length>0 ? Math.round(totalRevenue/delivered.length) : 0;
  const conversionRate = orders.length>0 ? Math.round((delivered.length/orders.length)*100) : 0;

  const catRevenue = {};
  delivered.forEach(o=>o.items.forEach(it=>{
    const p = products.find(pr=>pr.name===it.name);
    const cat = p ? categories.find(c=>c.id===p.cat)?.label||"Lainnya" : "Lainnya";
    catRevenue[cat] = (catRevenue[cat]||0) + it.price*it.qty;
  }));
  const catData = Object.entries(catRevenue).sort((a,b)=>b[1]-a[1]);
  const maxCat = catData[0]?catData[0][1]:1;

  const prodRevenue = {};
  delivered.forEach(o=>o.items.forEach(it=>{prodRevenue[it.name]=(prodRevenue[it.name]||0)+it.price*it.qty;}));
  const topProds = Object.entries(prodRevenue).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const months = ["Okt","Nov","Des","Jan","Feb","Mar","Apr"];
  const monthlyRevenue = [1850000,2340000,3120000,2780000,3450000,2950000,totalRevenue||4200000];
  const maxMonth = Math.max(...monthlyRevenue);
  const PALETTE = [C.ruby,"#7c3aed","#0891b2",C.jade,"#d97706","#dc2626"];

  return (
    <div style={{padding:26,flex:1,overflowY:"auto"}}>
      <div style={{marginBottom:22}}>
        <h2 className="sec-title">Laporan Penjualan</h2>
        <p className="sec-sub">Ringkasan performa toko MeiHua Official</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Total Pendapatan" value={fmt(totalRevenue)} sub="Pesanan selesai" accent={C.ruby}/>
        <StatCard label="Total Pesanan" value={orders.length} sub="Semua status" accent="#7c3aed"/>
        <StatCard label="Rata-rata Pesanan" value={fmt(avgOrder)} sub="Per transaksi" accent={C.sapphire}/>
        <StatCard label="Tingkat Selesai" value={`${conversionRate}%`} sub="dari total pesanan" accent={C.jade}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.7fr 1fr",gap:16,marginBottom:16}}>
        <div className="card card-pad">
          <p style={{fontWeight:700,fontSize:14,color:C.ink,margin:"0 0 3px",fontFamily:"'Playfair Display',serif"}}>Tren Pendapatan</p>
          <p style={{fontSize:12,color:C.fog,margin:"0 0 20px"}}>7 bulan terakhir</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160}}>
            {monthlyRevenue.map((val,i)=>{
              const h = Math.round((val/maxMonth)*135);
              const isLast = i===monthlyRevenue.length-1;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  {isLast&&<p style={{fontSize:10,color:C.ruby,fontWeight:700,margin:0,whiteSpace:"nowrap"}}>{fmt(val)}</p>}
                  {!isLast&&<p style={{fontSize:10,color:"transparent",margin:0}}>x</p>}
                  <div className="bar-seg" style={{width:"100%",height:`${h}px`,background:isLast?C.ruby:C.parchment,borderRadius:"6px 6px 0 0",transition:".3s",cursor:"pointer"}}/>
                  <p style={{fontSize:11,color:isLast?C.ruby:C.fog,margin:0,fontWeight:isLast?700:400}}>{months[i]}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card card-pad">
          <p style={{fontWeight:700,fontSize:14,color:C.ink,margin:"0 0 3px",fontFamily:"'Playfair Display',serif"}}>Revenue per Kategori</p>
          <p style={{fontSize:12,color:C.fog,margin:"0 0 16px"}}>Pesanan selesai</p>
          {catData.length===0
            ? <p style={{color:C.fog,fontSize:13,textAlign:"center",padding:20}}>Belum ada data</p>
            : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {catData.map(([cat,rev],i)=>(
                  <div key={cat}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.ink}}>{cat}</span>
                      <span style={{fontSize:12,fontWeight:700,color:PALETTE[i%PALETTE.length]}}>{fmt(rev)}</span>
                    </div>
                    <div style={{height:6,background:C.silk,borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.round((rev/maxCat)*100)}%`,background:PALETTE[i%PALETTE.length],borderRadius:99,transition:".4s"}}/>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
      <div className="card">
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.parchment}`}}>
          <p style={{fontWeight:700,fontSize:14,color:C.ink,margin:0,fontFamily:"'Playfair Display',serif"}}>Produk Terlaris</p>
        </div>
        {topProds.length===0
          ? <p style={{color:C.fog,fontSize:13,textAlign:"center",padding:32}}>Belum ada data</p>
          : <table className="tbl">
              <thead><tr><th style={{width:40}}>#</th><th>Produk</th><th>Pendapatan</th><th>Porsi</th></tr></thead>
              <tbody>
                {topProds.map(([name,rev],i)=>(
                  <tr key={name}>
                    <td>
                      <span style={{width:26,height:26,borderRadius:"50%",background:i===0?C.goldLight:i===1?"#F1F5F9":C.silk,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:i===0?C.gold:C.fog}}>{i+1}</span>
                    </td>
                    <td style={{fontWeight:600,color:C.ink,fontSize:13}}>{name}</td>
                    <td><span style={{fontWeight:700,color:C.ruby}}>{fmt(rev)}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:5,background:C.silk,borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.round((rev/(topProds[0][1]||1))*100)}%`,background:C.ruby,borderRadius:99}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600,color:C.fog,minWidth:34}}>{Math.round((rev/(topProds[0][1]||1))*100)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </div>
    </div>
  );
}

function AdminPanel({ products, setProducts, categories, setCategories, orders, setOrders, user, onClose }) {
  const [tab, setTab] = useState("dashboard");
  const pendingCount = orders.filter(o=>o.status==="pending").length;
  const totalRevenue = orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+o.total,0);
  const deliveredCount = orders.filter(o=>o.status==="delivered").length;

  const navItems = [
    {key:"dashboard",label:"Dashboard",icon:<Ic.dash/>},
    {key:"products",label:"Produk",icon:<Ic.box/>},
    {key:"orders",label:"Pesanan",icon:<Ic.order/>,badge:pendingCount||null},
    {key:"categories",label:"Kategori",icon:<Ic.tag/>},
    {key:"reports",label:"Laporan",icon:<Ic.chart/>},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.silk,overflow:"hidden"}}>
      {/* Top Bar */}
      <div className="topbar" style={{padding:"12px 26px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <Ic.logo size={36}/>
          <div>
            <p style={{margin:0,fontSize:15,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif"}}>MeiHua Official</p>
            <p style={{margin:0,fontSize:11,color:C.fog}}>Admin Dashboard</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <p style={{margin:0,fontSize:13,fontWeight:600,color:C.ink}}>{user}</p>
            <p style={{margin:0,fontSize:11,color:C.fog}}>Administrator</p>
          </div>
          <div style={{width:36,height:36,borderRadius:"50%",background:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:C.gold,border:`2px solid ${C.parchment}`}}>
            {user?.charAt(0).toUpperCase()}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{fontSize:12}}>Lihat Toko</button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {/* Sidebar */}
        <div style={{width:224,background:C.snow,borderRight:`1px solid ${C.parchment}`,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"16px 18px 8px"}}>
            <p style={{fontSize:10,fontWeight:700,color:C.fog,textTransform:"uppercase",letterSpacing:".9px",margin:0}}>Navigasi</p>
          </div>
          {navItems.map(n=>(
            <div key={n.key} className={`admin-nav ${tab===n.key?"active":""}`} onClick={()=>setTab(n.key)}>
              {n.icon}{n.label}
              {n.badge&&<span className="nav-pill">{n.badge}</span>}
            </div>
          ))}
          <div style={{marginTop:"auto",padding:"14px 18px",borderTop:`1px solid ${C.parchment}`}}>
            <p style={{fontSize:10.5,color:C.fog,margin:0}}>MeiHua v2.0 · 2025</p>
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {tab==="dashboard" && (
            <div style={{padding:26}}>
              <h2 className="sec-title" style={{marginBottom:4}}>Selamat datang, {user} 👋</h2>
              <p className="sec-sub" style={{marginBottom:22}}>Ringkasan performa toko Anda</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:26}}>
                <StatCard label="Total Produk" value={products.length} sub="Produk aktif" accent={C.ruby}/>
                <StatCard label="Pesanan Masuk" value={orders.length} sub="Semua status" accent="#7c3aed"/>
                <StatCard label="Pesanan Selesai" value={deliveredCount} sub="Terkirim" accent={C.jade}/>
                <StatCard label="Total Pendapatan" value={fmt(totalRevenue)} sub="Dari pesanan selesai" accent={C.gold}/>
              </div>
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:`1px solid ${C.parchment}`}}>
                  <p style={{fontWeight:700,fontSize:14,color:C.ink,margin:0,fontFamily:"'Playfair Display',serif"}}>Pesanan Terbaru</p>
                  <button onClick={()=>setTab("orders")} style={{fontSize:12,color:C.ruby,fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Lihat semua →</button>
                </div>
                <table className="tbl">
                  <thead><tr><th>ID</th><th>Pelanggan</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.slice(0,5).map(o=>(
                      <tr key={o.id}>
                        <td style={{fontWeight:700,color:C.ruby,fontSize:12}}>#{o.id}</td>
                        <td style={{fontWeight:600,color:C.ink,fontSize:13}}>{o.customer}</td>
                        <td style={{fontWeight:700,color:C.ink}}>{fmt(o.total)}</td>
                        <td><StatusBadge status={o.status}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab==="products"   && <ProductsPanel products={products} setProducts={setProducts} categories={categories}/>}
          {tab==="orders"     && <OrdersPanel orders={orders} setOrders={setOrders}/>}
          {tab==="categories" && <CategoriesPanel categories={categories} setCategories={setCategories}/>}
          {tab==="reports"    && <SalesReportPanel orders={orders} products={products} categories={categories}/>}
        </div>
      </div>
    </div>
  );
}

function TopNavbar({ user, cartCount, openCart, openAuth, openAdmin, onLogout }) {
  return (
    <div className="topbar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"13px 26px"}}>
      <div style={{display:"flex",alignItems:"center",gap:11}}>
        <Ic.logo size={34}/>
        <div>
          <span style={{fontSize:17,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif",letterSpacing:".2px"}}>
            MeiHua <span style={{color:C.ruby}}>Official</span>
          </span>
          <p style={{margin:0,fontSize:10,color:C.goldShine,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase"}}>Fine Jewelry</p>
        </div>
      </div>

      <div style={{position:"relative",width:"37%"}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.fog,pointerEvents:"none"}}><Ic.search/></span>
        <input placeholder="Cari produk perhiasan..." style={{width:"100%",padding:"10px 16px 10px 38px",borderRadius:99,border:`1.5px solid ${C.parchment}`,fontSize:13,outline:"none",fontFamily:"'Outfit',sans-serif",background:C.silk,color:C.ink,transition:".15s"}}
          onFocus={e=>e.target.style.borderColor=C.ruby} onBlur={e=>e.target.style.borderColor=C.parchment}
        />
      </div>

      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button onClick={openCart} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:9,display:"flex",alignItems:"center",color:C.stone,borderRadius:10,transition:".15s"}}
          onMouseEnter={e=>e.currentTarget.style.background=C.silk} onMouseLeave={e=>e.currentTarget.style.background="none"}
        >
          <Ic.cart/>
          {cartCount>0&&<span style={{position:"absolute",top:3,right:3,background:C.ruby,color:C.snow,borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{cartCount}</span>}
        </button>
        {!user ? (
          <>
            <button className="btn btn-ghost" onClick={()=>openAuth("login")}>Masuk</button>
            <button className="btn btn-ruby" onClick={()=>openAuth("register")}>Daftar</button>
          </>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:33,height:33,borderRadius:"50%",background:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:C.gold,border:`2px solid ${C.parchment}`}}>
              {user.charAt(0).toUpperCase()}
            </div>
            <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{user}</span>
            <button onClick={openAdmin} style={{background:C.goldLight,color:C.gold,border:`1.5px solid ${C.parchment}`,borderRadius:99,padding:"6px 15px",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Outfit',sans-serif",transition:".15s"}}>Admin</button>
            <button onClick={onLogout} style={{background:"none",border:"none",color:C.fog,fontSize:12,cursor:"pointer",padding:"6px 8px",fontFamily:"'Outfit',sans-serif",display:"flex",alignItems:"center",gap:4}}>
              <Ic.logout/>Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGrid({ products, cart, addToCart, removeFromCart }) {
  if (products.length===0) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,color:C.fog,gap:10}}>
      <Ic.search/>
      <p style={{fontSize:14,fontWeight:600,marginTop:8}}>Produk tidak ditemukan</p>
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:14}}>
      {products.map(p=>{
        const item = cart.find(i=>i.id===p.id);
        return (
          <div key={p.id} className="prod-card">
            <div style={{height:164,position:"relative",overflow:"hidden",background:C.silk,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {p.discount && <div style={{position:"absolute",top:8,left:8,background:C.ruby,color:C.snow,fontSize:11,padding:"3px 9px",borderRadius:6,fontWeight:700,zIndex:1}}>−{p.discount}%</div>}
              {p.img
                ? <img src={p.img} alt="produk" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:C.parchment}}>
                    <Ic.image/>
                    <p style={{fontSize:11,color:C.fog,margin:0}}>Belum ada foto</p>
                  </div>
              }
            </div>
            <div style={{padding:"13px 13px 15px",display:"flex",flexDirection:"column",flex:1}}>
              <p style={{fontSize:12.5,margin:"0 0 7px",color:C.ink,lineHeight:1.4,height:36,overflow:"hidden",fontWeight:500}}>{p.name}</p>
              <p style={{color:C.ruby,fontWeight:700,fontSize:14,margin:"0 0 2px"}}>{fmt(p.price)}</p>
              <div style={{height:17,marginBottom:6}}>
                {p.oldPrice && <span style={{textDecoration:"line-through",color:C.fog,fontSize:11}}>{fmt(p.oldPrice)}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                <Ic.star/>
                <span style={{fontSize:11,color:C.fog}}>{p.rating} · {p.sold} terjual</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:11}}>
                <Ic.ok/>
                <span style={{fontSize:11,color:C.jade,fontWeight:600}}>{p.seller}</span>
              </div>
              <div style={{marginTop:"auto"}}>
                {item ? (
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={()=>removeFromCart(p.id)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={()=>addToCart(p)}>+</button>
                  </div>
                ) : (
                  <button onClick={()=>addToCart(p)} style={{width:"100%",padding:"9px",background:C.ruby,color:C.snow,border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:12,fontFamily:"'Outfit',sans-serif",transition:".15s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.rubyDeep} onMouseLeave={e=>e.currentTarget.style.background=C.ruby}
                  >
                    + Keranjang
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CartPopup({ cart, close, remove }) {
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return (
    <>
      <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",zIndex:998,backdropFilter:"blur(2px)"}}/>
      <div style={{position:"fixed",top:0,right:0,width:370,height:"100vh",background:C.snow,boxShadow:"-4px 0 36px rgba(0,0,0,.12)",zIndex:999,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 22px",borderBottom:`1px solid ${C.parchment}`}}>
          <h3 style={{margin:0,fontSize:17,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif"}}>Keranjang Belanja</h3>
          <button onClick={close} className="btn btn-icon"><Ic.x/></button>
        </div>
        {cart.length===0 ? (
          <div style={{textAlign:"center",marginTop:90,color:C.fog,padding:22}}>
            <Ic.cart/>
            <p style={{fontSize:15,marginTop:16,fontWeight:600,color:C.stone}}>Keranjang masih kosong</p>
            <p style={{fontSize:12,color:C.fog,marginTop:5}}>Tambahkan produk perhiasan pilihan Anda</p>
          </div>
        ) : (
          <>
            <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
              {cart.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${C.parchment}`,gap:12}}>
                  {item.img && <img src={item.img} alt="" style={{width:44,height:44,borderRadius:9,objectFit:"cover",border:`1px solid ${C.parchment}`,flexShrink:0}}/>}
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:600,color:C.ink,margin:"0 0 4px"}}>{item.name}</p>
                    <p style={{fontSize:12,color:C.fog,margin:0}}>{item.qty} × {fmt(item.price)}</p>
                  </div>
                  <button onClick={()=>remove(item.id)} className="btn btn-danger-soft" style={{fontSize:11,padding:"4px 10px",flexShrink:0}}>Hapus</button>
                </div>
              ))}
            </div>
            <div style={{padding:"18px 22px",borderTop:`1px solid ${C.parchment}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                <span style={{fontWeight:600,color:C.stone}}>Total</span>
                <span style={{fontWeight:700,fontSize:18,color:C.ruby}}>{fmt(total)}</span>
              </div>
              <button className="btn btn-ruby" style={{width:"100%",padding:13,fontSize:13,borderRadius:10}}>Checkout Sekarang</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function AuthModal({ close, setUser, mode, onLogin }) {
  const [isLogin, setIsLogin] = useState(mode==="login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setErr(""); setLoading(true);
    try {
      let res;
      if (isLogin) { res = await apiLogin(email, password); }
      else {
        if (!name.trim()) { setErr("Nama tidak boleh kosong."); setLoading(false); return; }
        res = await apiRegister(name.trim(), email, password);
      }
      if (res?.token) {
        localStorage.setItem('meihua_token', res.token);
        const userName = (typeof res.user==='object'?res.user?.name:res.user)||email.split('@')[0];
        const userRole = (typeof res.user==='object'?res.user?.role:'user')||'user';
        localStorage.setItem('meihua_role', userRole);
        localStorage.setItem('meihua_name', userName);
        setUser(userName); onLogin(); close();
      } else { setErr(res?.message||'Terjadi kesalahan. Cek console untuk detail.'); }
    } catch (error) {
      console.error('[AuthModal]', error);
      setErr('Tidak dapat terhubung ke server.');
    } finally { setLoading(false); }
  };

  return (
    <Overlay onClose={close}>
      <div style={{background:C.snow,borderRadius:20,width:390,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,.22)"}}>
        {/* Header strip */}
        <div style={{background:C.ruby,padding:"28px 32px 26px",textAlign:"center",position:"relative"}}>
          <div style={{position:"absolute",inset:0,opacity:.07,backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",backgroundSize:"12px 12px"}}/>
          <Ic.logo size={46}/>
          <h2 style={{margin:"14px 0 4px",fontSize:22,color:C.snow,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>
            {isLogin?"Selamat Datang":"Buat Akun Baru"}
          </h2>
          <p style={{margin:0,fontSize:12,color:"rgba(255,255,255,.7)"}}>MeiHua Official</p>
        </div>

        <div style={{padding:"28px 32px"}}>
          {err && (
            <div style={{background:C.dangerL,border:`1px solid #FECACA`,borderRadius:10,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.danger}}>
              {err}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>
            {!isLogin && (
              <input className="inp" placeholder="Nama lengkap" value={name}
                onChange={e=>setName(e.target.value)} required disabled={loading}/>
            )}
            <input className="inp" placeholder="Alamat email" type="email"
              value={email} onChange={e=>setEmail(e.target.value)} required disabled={loading}/>
            <input className="inp" placeholder="Password" type="password"
              value={password} onChange={e=>setPassword(e.target.value)} required disabled={loading}/>
            <button type="submit" className="btn btn-ruby"
              disabled={loading}
              style={{width:"100%",padding:13,fontSize:13,borderRadius:10,marginTop:4,opacity:loading?.7:1}}>
              {loading?"Memproses...":(isLogin?"Masuk ke Akun":"Daftar Sekarang")}
            </button>
          </form>
          <hr className="divider" style={{margin:"20px 0"}}/>
          <p style={{textAlign:"center",fontSize:13,color:C.fog,margin:0}}>
            {isLogin?"Belum punya akun?":"Sudah punya akun?"}{" "}
            <span style={{color:C.ruby,cursor:"pointer",fontWeight:700}}
              onClick={()=>{setIsLogin(!isLogin);setErr("");}}>
              {isLogin?"Daftar disini":"Masuk"}
            </span>
          </p>
        </div>
      </div>
    </Overlay>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('meihua_token');
    const savedName = localStorage.getItem('meihua_name');
    if (token && savedName) setUser(savedName);
    async function fetchPublicData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([apiGetProducts(), apiGetCategories()]);
        setProducts(Array.isArray(prods)?prods:[]);
        setCategories(Array.isArray(cats)?cats:[]);
      } catch (err) { console.error('[App] fetchPublicData error:', err); }
      finally { setLoading(false); }
    }
    fetchPublicData();
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!localStorage.getItem('meihua_token')) return;
    apiGetOrders().then(data=>setOrders(Array.isArray(data)?data:[])).catch(console.error);
  }, [user]);

  const addToCart = (product) => setCart(prev=>{
    const exist = prev.find(i=>i.id===product.id);
    if (exist) return prev.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i);
    return [...prev,{...product,qty:1}];
  });
  const removeFromCart = (id) => setCart(prev=>prev.map(i=>i.id===id?{...i,qty:i.qty-1}:i).filter(i=>i.qty>0));

  const filteredProducts = activeCategory ? products.filter(p=>p.cat===activeCategory.id) : products;
  const activeCatData = categories.find(c=>c.id===activeCategory?.id);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.silk}}>
      <div style={{textAlign:"center"}}>
        <Ic.logo size={52}/>
        <p style={{marginTop:16,color:C.fog,fontSize:13,fontFamily:"'Outfit',sans-serif"}}>Memuat data…</p>
      </div>
    </div>
  );

  return (
    <>
      <GlobalStyles/>
      {!adminMode && (
        <TopNavbar
          user={user}
          cartCount={cart.reduce((a,b)=>a+b.qty,0)}
          openCart={()=>setShowCart(true)}
          openAuth={m=>setShowAuth(m)}
          openAdmin={()=>setAdminMode(true)}
          onLogout={()=>setShowLogout(true)}
        />
      )}
      {user&&adminMode ? (
        <AdminPanel
          products={products} setProducts={setProducts}
          categories={categories} setCategories={setCategories}
          orders={orders} setOrders={setOrders}
          user={user} onClose={()=>setAdminMode(false)}
        />
      ) : (
        <div style={{display:"flex",height:"calc(100vh - 62px)",overflow:"hidden"}}>
          {/* Category Sidebar */}
          <div style={{width:122,background:C.snow,flexShrink:0,borderRight:`1px solid ${C.parchment}`,padding:"12px 0",overflowY:"auto"}}>
            <div className={`cat-item ${!activeCategory?"active":""}`} onClick={()=>{setActiveCategory(null);setActiveSub(null);}}>Semua</div>
            {categories.map(cat=>(
              <div key={cat.id} className={`cat-item ${activeCategory?.id===cat.id?"active":""}`}
                onClick={()=>{
                  if(activeCategory?.id===cat.id){setActiveCategory(null);setActiveSub(null);}
                  else{setActiveCategory(cat);setActiveSub(null);}
                }}>
                {cat.label}
              </div>
            ))}
          </div>

          {/* Submenu */}
          <div style={{width:activeCategory?150:0,overflow:"hidden",background:"#F9F6F2",borderRight:`1px solid ${C.parchment}`,transition:"width .22s ease",flexShrink:0}}>
            {activeCatData && (
              <div style={{width:150,padding:"12px 0"}}>
                <div style={{fontSize:10,fontWeight:700,color:C.ruby,padding:"6px 14px 9px",textTransform:"uppercase",letterSpacing:".8px",borderBottom:`1px solid ${C.parchment}`,marginBottom:4}}>{activeCatData.label}</div>
                {activeCatData.subs.map((sub,i)=>(
                  <div key={i} className={`sub-item ${activeSub===i?"active":""}`} onClick={()=>setActiveSub(activeSub===i?null:i)}>{sub}</div>
                ))}
              </div>
            )}
          </div>

          {/* Products */}
          <div style={{flex:1,overflowY:"auto",padding:18}}>
            <div style={{fontSize:11.5,color:C.fog,marginBottom:13,display:"flex",alignItems:"center",gap:5}}>
              <span style={{cursor:"pointer",color:!activeCategory?C.ruby:C.fog,fontWeight:600}} onClick={()=>{setActiveCategory(null);setActiveSub(null);}}>Semua Produk</span>
              {activeCategory&&<><span style={{color:C.parchment}}><Ic.chevron/></span><span style={{color:activeSub===null?C.ruby:C.fog,cursor:"pointer",fontWeight:600}} onClick={()=>setActiveSub(null)}>{activeCategory.label}</span></>}
              {activeSub!==null&&activeCatData&&<><span style={{color:C.parchment}}><Ic.chevron/></span><span style={{color:C.ruby,fontWeight:600}}>{activeCatData.subs[activeSub]}</span></>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif"}}>{activeCategory?activeCategory.label:"Semua Produk"}</h2>
              <span style={{fontSize:12,color:C.fog}}>{filteredProducts.length} produk</span>
            </div>
            <ProductGrid products={filteredProducts} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart}/>
          </div>
        </div>
      )}

      {showCart && <CartPopup cart={cart} close={()=>setShowCart(false)} remove={removeFromCart}/>}
      {showAuth && <AuthModal mode={showAuth} close={()=>setShowAuth(null)} setUser={setUser} onLogin={()=>setAdminMode(true)}/>}
      {showLogout && (
        <ConfirmModal
          title="Yakin ingin keluar?"
          desc="Anda akan keluar dari sesi ini."
          onConfirm={()=>{
            localStorage.removeItem('meihua_token');
            localStorage.removeItem('meihua_role');
            localStorage.removeItem('meihua_name');
            setUser(null); setAdminMode(false); setShowLogout(false);
          }}
          onCancel={()=>setShowLogout(false)}
        />
      )}
    </>
  );
}