import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  apiLogin, apiRegister, apiGetProducts, apiGetCategories,
  apiGetOrders, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
  apiAddCategory, apiUpdateCategory, apiDeleteCategory,
  apiUpdateOrderStatus, apiCreateOrder
} from './api';

const C = {
  primary:      "#C8587A",
  primaryDeep:  "#A33D5C",
  primaryLight: "#FFF5F8",
  primaryGlow:  "rgba(200,88,122,0.12)",
  primaryMid:   "#D97F9A",
  blush:        "#EEC5D2",
  petal:        "#F5DCEA",
  rose:         "#FAF0F4",
  ink:          "#1C1117",
  inkSoft:      "#3A2530",
  stone:        "#6B4D58",
  fog:          "#A08590",
  silk:         "#FBF6F8",
  parchment:    "#E8D5DD",
  snow:         "#FFFFFF",
  gold:         "#9A6B2A",
  goldShine:    "#C9893C",
  jade:         "#2A7055",
  jadeLight:    "#EAF4EF",
  sapphire:     "#1b3a88",
  sapphireL:    "#EEF2FF",
  amber:        "#8A5210",
  amberL:       "#FFF8EE",
  danger:       "#A01830",
  dangerL:      "#FFF0F2",
  sidebarBg:    "#922546",
  sidebarText:  "#e2c6d0",
  sidebarActive:"#C8587A",
};

const FIXED_SELLER = "MeiHua Official";
const fmt = (n) => "Rp\u00A0" + Number(n).toLocaleString("id-ID");

function getToken() { return localStorage.getItem('meihua_token'); }
function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function saveLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}
function loadLocal(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
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
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 14px; scroll-behavior: smooth; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: ${C.silk}; color: ${C.ink}; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.parchment}; border-radius: 99px; }
    ::-webkit-scrollbar-thumb:hover { background: ${C.blush}; }

    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 7px; border: none; border-radius: 10px; cursor: pointer;
      font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 13px;
      letter-spacing: .1px; transition: all .18s cubic-bezier(.4,0,.2,1); white-space: nowrap;
    }
    .btn:active { transform: scale(.97); }
    .btn-primary {
      background: linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDeep} 100%);
      color: #fff; padding: 10px 22px; box-shadow: 0 3px 14px ${C.primaryGlow};
    }
    .btn-primary:hover { box-shadow: 0 6px 20px ${C.primaryGlow}; transform: translateY(-1px); }
    .btn-ghost { background: transparent; color: ${C.inkSoft}; padding: 9px 18px; border: 1.5px solid ${C.parchment}; }
    .btn-ghost:hover { border-color: ${C.primary}; color: ${C.primary}; background: ${C.primaryLight}; }
    .btn-danger-soft { background: ${C.dangerL}; color: ${C.danger}; padding: 6px 12px; border: 1.5px solid #FECACA; font-size: 12px; border-radius: 8px; }
    .btn-danger-soft:hover { background: #FFE4EA; }
    .btn-edit-soft { background: ${C.snow}; color: ${C.primary}; padding: 6px 12px; border: 1.5px solid ${C.parchment}; font-size: 12px; border-radius: 8px; }
    .btn-edit-soft:hover { border-color: ${C.primary}; background: ${C.primaryLight}; }
    .btn-sm { padding: 6px 12px; font-size: 12px; border-radius: 8px; }
    .btn-icon { background: ${C.rose}; border: 1.5px solid ${C.parchment}; color: ${C.stone}; width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; }
    .btn-icon:hover { border-color: ${C.primary}; color: ${C.primary}; background: ${C.primaryLight}; }

    .inp {
      width: 100%; padding: 10px 14px; border: 1.5px solid ${C.parchment}; border-radius: 9px;
      font-size: 13.5px; font-family: 'Plus Jakarta Sans', sans-serif;
      color: ${C.ink}; background: ${C.snow}; outline: none; transition: border-color .15s, box-shadow .15s;
    }
    .inp:focus { border-color: ${C.primary}; box-shadow: 0 0 0 3px ${C.primaryGlow}; }
    .inp::placeholder { color: ${C.fog}; }
    .inp-label { font-size: 11px; font-weight: 700; color: ${C.stone}; text-transform: uppercase; letter-spacing: .7px; margin-bottom: 5px; display: block; }
    .inp-group { display: flex; flex-direction: column; }
    select.inp { appearance: none; cursor: pointer;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A08590' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat; background-position: right 13px center; padding-right: 36px;
    }
    textarea.inp { resize: vertical; min-height: 84px; line-height: 1.55; }

    .card { background: ${C.snow}; border: 1px solid ${C.parchment}; border-radius: 14px; overflow: hidden; }
    .card-pad { padding: 20px; }

    .tbl { width: 100%; border-collapse: collapse; font-size: 15px; }
    .tbl th { padding: 11px 16px; text-align: left; font-size: 12px; font-weight: 700; color: ${C.fog}; text-transform: uppercase; letter-spacing: .8px; background: ${C.silk}; border-bottom: 1px solid ${C.parchment}; }
    .tbl td { padding: 13px 16px; border-bottom: 1px solid ${C.rose}; color: ${C.stone}; vertical-align: middle; }
    .tbl tbody tr { transition: background .1s; }
    .tbl tbody tr:hover td { background: ${C.silk}; }
    .tbl tbody tr:last-child td { border-bottom: none; }

    .badge { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
    .badge-pending    { background: ${C.amberL};   color: ${C.amber}; }
    .badge-dot-pending    { background: ${C.amber}; }
    .badge-processing { background: ${C.sapphireL}; color: ${C.sapphire}; }
    .badge-dot-processing { background: ${C.sapphire}; }
    .badge-shipped    { background: #E0F2FE; color: #0369A1; }
    .badge-dot-shipped    { background: #0369A1; }
    .badge-delivered  { background: ${C.jadeLight}; color: ${C.jade}; }
    .badge-dot-delivered  { background: ${C.jade}; }
    .badge-cancelled  { background: ${C.dangerL};  color: ${C.danger}; }
    .badge-dot-cancelled  { background: ${C.danger}; }

    .prod-card {
      background: ${C.snow}; border: 1px solid ${C.parchment}; border-radius: 14px; overflow: hidden;
      transition: box-shadow .25s, transform .25s, border-color .25s;
      display: flex; flex-direction: column; cursor: pointer;
    }
    .prod-card:hover { box-shadow: 0 10px 32px ${C.primaryGlow}; transform: translateY(-3px); border-color: ${C.blush}; }

    .cat-item {
      display: flex; align-items: center; padding: 9px 16px; cursor: pointer;
      font-size: 12.5px; color: ${C.stone}; border-left: 2px solid transparent;
      transition: all .15s; font-weight: 500;
    }
    .cat-item:hover { background: ${C.primaryLight}; color: ${C.primary}; }
    .cat-item.active { border-left-color: ${C.primary}; background: ${C.primaryLight}; color: ${C.primary}; font-weight: 700; }

    .admin-nav {
      display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer;
      font-size: 13px; color: ${C.sidebarText}; border-left: 2px solid transparent;
      transition: all .15s; font-weight: 500; margin: 1px 0;
    }
    .admin-nav:hover { background: rgba(200,88,122,0.15); color: #fff; }
    .admin-nav.active { border-left-color: ${C.sidebarActive}; background: rgba(200,88,122,0.22); color: #fff; font-weight: 700; }
    .nav-pill { margin-left: auto; background: ${C.primary}; color: #fff; font-size: 10px; padding: 2px 7px; border-radius: 99px; font-weight: 700; }

    .qty-ctrl { display: flex; align-items: center; border: 1.5px solid ${C.parchment}; border-radius: 9px; overflow: hidden; height: 34px; }
    .qty-btn { width: 34px; height: 100%; background: ${C.snow}; border: none; font-size: 16px; color: ${C.stone}; cursor: pointer; font-weight: 600; flex-shrink: 0; transition: .15s; }
    .qty-btn:hover { background: ${C.primaryLight}; color: ${C.primary}; }
    .qty-btn:first-child { border-right: 1.5px solid ${C.parchment}; }
    .qty-btn:last-child  { border-left:  1.5px solid ${C.parchment}; }
    .qty-num { flex: 1; text-align: center; font-weight: 700; font-size: 13px; }

    .upload-zone {
      aspect-ratio: 1; border-radius: 12px; border: 2px dashed ${C.parchment};
      background: ${C.rose}; display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      cursor: pointer; overflow: hidden; transition: all .18s; position: relative;
    }
    .upload-zone:hover { border-color: ${C.primary}; background: ${C.primaryLight}; }
    .upload-zone.has-img { border-style: solid; border-color: ${C.parchment}; }
    .upload-zone .upload-overlay {
      position: absolute; inset: 0; background: rgba(28,17,23,.6);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      opacity: 0; transition: opacity .18s; color: #fff; gap: 6px;
    }
    .upload-zone:hover .upload-overlay { opacity: 1; }

    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
    .uploading-bar {
      height: 3px; border-radius: 99px;
      background: linear-gradient(90deg, ${C.parchment} 0%, ${C.primary} 50%, ${C.parchment} 100%);
      background-size: 200%; animation: shimmer 1.2s infinite;
    }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp .3s ease both; }

    .divider { border: none; border-top: 1px solid ${C.parchment}; }

    .stat-card {
      background: ${C.snow}; border: 1px solid ${C.parchment}; border-radius: 14px;
      padding: 18px 20px; display: flex; flex-direction: column; gap: 3px; transition: box-shadow .2s, border-color .2s;
    }
    .stat-card:hover { box-shadow: 0 6px 20px ${C.primaryGlow}; border-color: ${C.blush}; }
    .stat-val { font-family: 'Playfair Display', serif; font-size: 26px; font-weight: 700; line-height: 1.1; }
    .stat-label { font-size: 12px; font-weight: 600; color: ${C.inkSoft}; margin-top: 4px; }
    .stat-sub { font-size: 11px; color: ${C.fog}; }

    .topbar { background: ${C.snow}; border-bottom: 1px solid ${C.parchment}; position: sticky; top: 0; z-index: 100; flex-shrink: 0; }
    .admin-topbar { background: ${C.snow}; border-bottom: 1px solid ${C.parchment}; }
    .prod-tag { display: inline-flex; align-items: center; background: ${C.primaryLight}; color: ${C.primary}; padding: 2px 9px; border-radius: 99px; font-size: 11px; font-weight: 700; }
    .sec-title { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 500; color: ${C.ink}; }
    .sec-sub { font-size: 12px; color: ${C.fog}; margin-top: 2px; }

    .search-bar {
      width: 100%; padding: 10px 16px 10px 40px; border-radius: 99px; border: 1.5px solid ${C.parchment};
      font-size: 13px; outline: none; font-family: 'Plus Jakarta Sans', sans-serif;
      background: ${C.rose}; color: ${C.ink}; transition: all .15s;
    }
    .search-bar:focus { border-color: ${C.primary}; background: ${C.snow}; box-shadow: 0 0 0 3px ${C.primaryGlow}; }
    .search-bar::placeholder { color: ${C.fog}; }

    .filter-btn {
      padding: 6px 16px; border-radius: 99px; cursor: pointer; font-size: 12px; font-weight: 600;
      transition: all .15s; font-family: 'Plus Jakarta Sans', sans-serif;
      display: inline-flex; align-items: center; gap: 5px;
    }
    .filter-btn-active { background: linear-gradient(135deg, ${C.primary}, ${C.primaryDeep}); color: #fff; border: none; box-shadow: 0 3px 12px ${C.primaryGlow}; }
    .filter-btn-inactive { background: ${C.snow}; color: ${C.stone}; border: 1.5px solid ${C.parchment}; }
    .filter-btn-inactive:hover { border-color: ${C.primary}; color: ${C.primary}; }
    .bar-seg:hover { filter: brightness(1.06); }
  `}</style>
);

const MHLogo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="mh-bg" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor={C.primary}/>
        <stop offset="100%" stopColor={C.primaryDeep}/>
      </linearGradient>
      <linearGradient id="mh-text" x1="0" y1="0" x2="48" y2="48">
        <stop offset="0%" stopColor="#FFFFFF"/>
        <stop offset="100%" stopColor={C.petal}/>
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="44" height="44" rx="14" fill="url(#mh-bg)"/>
    <path d="M11 33V16L18 25L24 16V33" stroke="url(#mh-text)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M27 16V33 M36 16V33 M27 24.5H36" stroke="url(#mh-text)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <circle cx="24" cy="39" r="1.4" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

const Ic = {
  Dash:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Box:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  Order:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  Tag:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Chart:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  Cart:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X:       () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  Plus:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  Edit:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Trash:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Logout:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  Image:   () => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Upload:  () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  Star:    () => <svg width="10" height="10" viewBox="0 0 24 24" fill={C.goldShine} stroke={C.goldShine} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Chevron: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  Ok:      () => <svg width="11" height="11" viewBox="0 0 24 24" fill={C.jade} stroke="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  Warn:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Del:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  Store:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
};

function Overlay({ children, onClose }) {
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(28,17,23,.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20,backdropFilter:"blur(4px)"}}>
      <div onClick={e => e.stopPropagation()} className="fade-up">{children}</div>
    </div>
  );
}

function ConfirmModal({ title, desc, onConfirm, onCancel, danger }) {
  return (
    <Overlay onClose={onCancel}>
      <div style={{background:C.snow,borderRadius:18,padding:"32px 28px",width:360,textAlign:"center",boxShadow:"0 24px 64px rgba(28,17,23,.22)"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:danger?C.dangerL:C.petal,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
          {danger ? <Ic.Del/> : <Ic.Warn/>}
        </div>
        <h3 style={{margin:"0 0 8px",fontSize:20,color:C.ink,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>{title}</h3>
        <p style={{margin:"0 0 26px",fontSize:13,color:C.stone,lineHeight:1.65}}>{desc}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} className="btn btn-ghost" style={{flex:1,padding:11}}>Batal</button>
          <button onClick={onConfirm} style={{flex:1,padding:11,borderRadius:10,border:"none",background:danger?C.danger:`linear-gradient(135deg,${C.primary},${C.primaryDeep})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:".15s"}}>
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

function StatCard({ label, value, sub, accent = C.primary }) {
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
    setError(''); setUploading(true);
    try {
      const result = await uploadImageToServer(file);
      onChange(result.url);
    } catch (err) {
      setError(err.message || 'Upload gagal. Coba lagi.');
    } finally { setUploading(false); }
  }, [onChange]);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <span className="inp-label">Foto Produk</span>
      <div className={`upload-zone ${currentUrl ? 'has-img' : ''}`}
        onClick={() => !uploading && fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}>
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="preview" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div className="upload-overlay"><Ic.Upload/><span style={{fontSize:12,fontWeight:600}}>Ganti Foto</span></div>
          </>
        ) : uploading ? (
          <div style={{textAlign:"center",padding:20}}>
            <p style={{fontSize:12,color:C.fog,marginBottom:10}}>Mengupload...</p>
            <div className="uploading-bar" style={{width:80}}/>
          </div>
        ) : (
          <>
            <div style={{color:C.fog,marginBottom:8}}><Ic.Image/></div>
            <p style={{fontSize:12,color:C.fog,fontWeight:500,textAlign:"center",lineHeight:1.5,padding:"0 10px"}}>Klik atau seret foto</p>
            <p style={{fontSize:11,color:C.blush,marginTop:4}}>JPG, PNG, WEBP · Maks 5MB</p>
          </>
        )}
        {uploading && currentUrl && (
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:6,background:"rgba(28,17,23,.7)"}}>
            <div className="uploading-bar"/>
          </div>
        )}
      </div>
      {error && <p style={{fontSize:11,color:C.danger,marginTop:2}}>⚠ {error}</p>}
      <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}}
        onChange={e => { const f = e.target.files[0]; if (f) handleFile(f); e.target.value = ''; }}/>
      {currentUrl && (
        <button onClick={() => onChange(null)} className="btn btn-danger-soft btn-sm" style={{width:"100%"}}>Hapus Foto</button>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const statusOpts = ["pending","processing","shipped","delivered","cancelled"];
  return (
    <Overlay onClose={onClose}>
      <div style={{background:C.snow,borderRadius:18,width:500,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(28,17,23,.22)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 24px",borderBottom:`1px solid ${C.parchment}`,background:C.silk}}>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:C.stone,textTransform:"uppercase",letterSpacing:".8px",margin:"0 0 4px"}}>Detail Pesanan</p>
            <h3 style={{margin:0,fontSize:20,color:C.ink,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>#{order.id}</h3>
          </div>
          <button onClick={onClose} className="btn btn-icon"><Ic.X/></button>
        </div>
        <div style={{padding:24,display:"flex",flexDirection:"column",gap:18}}>
          <div style={{background:C.rose,borderRadius:12,padding:16}}>
            <p style={{fontSize:10,fontWeight:700,color:C.stone,textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 10px"}}>Informasi Pelanggan</p>
            <p style={{fontWeight:700,color:C.ink,margin:"0 0 5px",fontSize:14}}>{order.customer}</p>
            <p style={{fontSize:12,color:C.fog,margin:"0 0 3px"}}>Telp: {order.phone}</p>
            <p style={{fontSize:12,color:C.fog,margin:0}}>Alamat: {order.address}</p>
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:C.stone,textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 10px"}}>Item Pesanan</p>
            {order.items.map((it, i) => (
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
              <span style={{fontWeight:700,fontSize:17,color:C.primary}}>{fmt(order.total)}</span>
            </div>
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:700,color:C.stone,textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 10px"}}>Ubah Status</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {statusOpts.map(s => (
                <button key={s} onClick={() => onStatusChange(order.id, s)} style={{
                  padding:"7px 15px",borderRadius:99,
                  border:`1.5px solid ${order.status===s?C.primary:C.parchment}`,
                  background:order.status===s?`linear-gradient(135deg,${C.primary},${C.primaryDeep})`:C.snow,
                  color:order.status===s?"#fff":C.stone,
                  fontSize:12,fontWeight:600,cursor:"pointer",
                  fontFamily:"'Plus Jakarta Sans',sans-serif",transition:".15s"
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

  const filtered = orders.filter(o => {
    const matchStatus = filter === "all" || o.status === filter;
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      o.id.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      (o.phone && o.phone.includes(q)) ||
      (o.address && o.address.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status==="pending").length,
    processing: orders.filter(o => o.status==="processing").length,
    shipped: orders.filter(o => o.status==="shipped").length,
    delivered: orders.filter(o => o.status==="delivered").length,
    cancelled: orders.filter(o => o.status==="cancelled").length,
  };
  const revenue = orders.filter(o => o.status==="delivered").reduce((s,o) => s+o.total, 0);

  const changeStatus = async (id, status) => {
    await apiUpdateOrderStatus(id, status);
    setOrders(prev => prev.map(o => o.id===id ? {...o,status} : o));
    setSelected(prev => prev ? {...prev,status} : prev);
  };

  const filterBtns = [
    ["all","Semua"],["pending","Menunggu"],["processing","Diproses"],
    ["shipped","Dikirim"],["delivered","Selesai"],["cancelled","Dibatalkan"]
  ];

  return (
    <div style={{padding:26,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <h2 className="sec-title">Pesanan Masuk</h2>
          <p className="sec-sub">{orders.length} total pesanan</p>
        </div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.fog,pointerEvents:"none"}}><Ic.Search/></span>
          <input className="search-bar" placeholder="Cari ID, nama, atau alamat..." value={search}
            onChange={e => setSearch(e.target.value)} style={{width:260}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Total Pendapatan" value={fmt(revenue)} sub="Pesanan selesai" accent={C.primary}/>
        <StatCard label="Pesanan Baru" value={counts.pending} sub="Menunggu konfirmasi" accent={C.amber}/>
        <StatCard label="Dalam Proses" value={counts.processing+counts.shipped} sub="Diproses & dikirim" accent={C.sapphire}/>
        <StatCard label="Pesanan Selesai" value={counts.delivered} sub="Berhasil terkirim" accent={C.jade}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {filterBtns.map(([k,v]) => (
          <button key={k} onClick={() => setFilter(k)} className={`filter-btn ${filter===k?"filter-btn-active":"filter-btn-inactive"}`}>
            {v}
            {counts[k]>0 && <span style={{background:filter===k?"rgba(255,255,255,.25)":C.rose,borderRadius:99,padding:"0 6px",fontSize:11}}>{counts[k]}</span>}
          </button>
        ))}
      </div>
      {search && <p style={{fontSize:12,color:C.fog,marginBottom:12}}>Menampilkan <strong style={{color:C.primary}}>{filtered.length}</strong> hasil untuk "{search}"</p>}
      <div className="card">
        <table className="tbl">
          <thead>
            <tr><th>ID Pesanan</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Tanggal</th><th>Status</th><th>Aksi</th></tr>
          </thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{textAlign:"center",padding:52,color:C.fog}}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.parchment} strokeWidth="1.5" style={{display:"block",margin:"0 auto 10px"}}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                {search ? `Tidak ada pesanan untuk "${search}"` : "Tidak ada pesanan"}
              </td></tr>
            )}
            {filtered.map(o => (
              <tr key={o.id}>
                <td><span style={{fontWeight:700,color:C.primary,fontSize:12}}>#{o.id}</span></td>
                <td>
                  <p style={{fontWeight:600,color:C.ink,margin:"0 0 2px",fontSize:13}}>{o.customer}</p>
                  <p style={{fontSize:11,color:C.fog,margin:0}}>{o.phone}</p>
                </td>
                <td style={{fontSize:12,color:C.fog,maxWidth:180}}>{o.items.map(it=>`${it.name} (×${it.qty})`).join(", ")}</td>
                <td><span style={{fontWeight:700,color:C.ink}}>{fmt(o.total)}</span></td>
                <td style={{fontSize:11,color:C.fog,whiteSpace:"nowrap"}}>{o.date}</td>
                <td><StatusBadge status={o.status}/></td>
                <td><button className="btn btn-edit-soft btn-sm" onClick={() => setSelected(o)}>Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <OrderDetailModal order={selected} onClose={() => setSelected(null)} onStatusChange={changeStatus}/>}
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
      name:form.name, cat:form.cat,
      price:Number(form.price),
      old_price:form.oldPrice ? Number(form.oldPrice) : null,
      discount:form.discount ? Number(form.discount) : null,
      img:imgUrl, rating:Number(form.rating),
      sold:form.sold, seller:FIXED_SELLER,
    };
    try {
      if (view==="add") {
        const res = await apiAddProduct(data);
        if (res.id) setProducts(prev => [...prev, {...data,id:res.id,oldPrice:data.old_price,img:res.img||imgUrl}]);
      } else {
        const res = await apiUpdateProduct(editTarget.id, data);
        setProducts(prev => prev.map(p => p.id===editTarget.id ? {...p,...data,oldPrice:data.old_price,img:res?.img||imgUrl} : p));
      }
      setView("list"); resetForm();
    } catch { alert("Gagal menyimpan produk. Coba lagi."); }
  };

  if (view==="add" || view==="edit") {
    return (
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{background:C.silk,borderBottom:`1px solid ${C.parchment}`,padding:"18px 26px"}}>
          <h2 className="sec-title">{view==="add" ? "Tambah Produk Baru" : "Edit Produk"}</h2>
          {view==="edit" && <p className="sec-sub">{editTarget?.name}</p>}
        </div>
        <div style={{padding:28,maxWidth:920,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"210px 1fr",gap:30,alignItems:"start"}}>
            <ImageUploadWidget currentUrl={imgUrl} onChange={setImgUrl}/>
            <div style={{display:"flex",flexDirection:"column",gap:15}}>
              <div className="inp-group">
                <label className="inp-label">Nama Produk *</label>
                <input className="inp" placeholder="Isi nama produk" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div className="inp-group">
                  <label className="inp-label">Kategori</label>
                  <select className="inp" value={form.cat} onChange={e => setForm({...form,cat:e.target.value})}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Nama Toko</label>
                  <input className="inp" value={FIXED_SELLER} readOnly style={{background:C.rose,color:C.fog,cursor:"not-allowed"}}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Harga Jual (Rp) *</label>
                  <input className="inp" type="number" placeholder="0" value={form.price} onChange={e => setForm({...form,price:e.target.value})}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Harga Asli (Rp)</label>
                  <input className="inp" type="number" placeholder="0" value={form.oldPrice} onChange={e => setForm({...form,oldPrice:e.target.value})}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Diskon (%)</label>
                  <input className="inp" type="number" placeholder="0" value={form.discount} onChange={e => setForm({...form,discount:e.target.value})}/>
                </div>
                <div className="inp-group">
                  <label className="inp-label">Jumlah Terjual</label>
                  <input className="inp" placeholder="0" value={form.sold} onChange={e => setForm({...form,sold:e.target.value})}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={() => { setView("list"); resetForm(); }} className="btn btn-ghost" style={{padding:"11px 22px"}}>Batal</button>
                <button onClick={handleSave} className="btn btn-primary" style={{flex:1,padding:11}}>
                  {view==="add" ? "Simpan Produk" : "Update Produk"}
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
        <button onClick={() => { resetForm(); setView("add"); }} className="btn btn-primary"><Ic.Plus/> Tambah Produk</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Total Produk" value={products.length} accent={C.primary}/>
        <StatCard label="Ada Diskon" value={products.filter(p=>p.discount).length} accent={C.danger}/>
        <StatCard label="Ada Foto" value={products.filter(p=>p.img).length} accent={C.jade}/>
        <StatCard label="Kategori" value={categories.length} accent={C.sapphire}/>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th style={{width:52}}>Foto</th><th>Nama Produk</th><th>Harga</th><th>Kategori</th><th>Rating</th><th>Aksi</th></tr></thead>
          <tbody>
            {products.length===0 && <tr><td colSpan={6} style={{textAlign:"center",padding:52,color:C.fog}}>Belum ada produk.</td></tr>}
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div style={{width:44,height:44,borderRadius:10,background:C.rose,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.parchment}`}}>
                    {p.img ? <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : <span style={{color:C.parchment,fontSize:18}}>🌸</span>}
                  </div>
                </td>
                <td>
                  <p style={{fontWeight:600,color:C.ink,margin:"0 0 3px",fontSize:13}}>{p.name}</p>
                  <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,color:C.jade,fontWeight:600}}><Ic.Ok/> {p.seller}</span>
                </td>
                <td>
                  <p style={{fontWeight:700,color:C.primary,margin:"0 0 2px",fontSize:13}}>{fmt(p.price)}</p>
                  {p.oldPrice && <span style={{fontSize:11,color:C.fog,textDecoration:"line-through"}}>{fmt(p.oldPrice)}</span>}
                  {p.discount && <span style={{fontSize:10.5,color:C.danger,background:C.dangerL,padding:"1px 7px",borderRadius:5,fontWeight:700,marginLeft:4}}>−{p.discount}%</span>}
                </td>
                <td><span className="prod-tag">{categories.find(c=>c.id===p.cat)?.label||p.cat}</span></td>
                <td><span style={{display:"inline-flex",alignItems:"center",gap:4,fontWeight:600,fontSize:12,color:C.ink}}><Ic.Star/> {p.rating}</span></td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={() => openEdit(p)} className="btn btn-edit-soft btn-sm"><Ic.Edit/> Edit</button>
                    <button onClick={() => setDeleteTarget(p)} className="btn btn-danger-soft btn-sm"><Ic.Trash/> Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteTarget && (
        <ConfirmModal title="Hapus produk ini?" danger
          desc={`"${deleteTarget.name}" akan dihapus secara permanen.`}
          onConfirm={async () => { await apiDeleteProduct(deleteTarget.id); setProducts(prev => prev.filter(p => p.id!==deleteTarget.id)); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function CategoriesPanel({ categories, setCategories }) {
  const [view, setView] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ label:"" });
  const [err, setErr] = useState("");

  const openEdit = (cat) => { setEditTarget(cat); setForm({label:cat.label}); setErr(""); setView("edit"); };
  const handleSave = async () => {
    const label = form.label.trim();
    if (!label) { setErr("Nama kategori wajib diisi."); return; }
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (view==="add" && categories.find(c => c.id===id)) { setErr("Kategori dengan nama ini sudah ada."); return; }
    try {
      if (view==="add") {
        const res = await apiAddCategory({ id, label });
        setCategories(prev => [...prev, {id:res.id||id, label}]);
      } else {
        await apiUpdateCategory(editTarget.id, { label });
        setCategories(prev => prev.map(c => c.id===editTarget.id ? {...c,label} : c));
      }
      setView("list"); setErr("");
    } catch { setErr("Gagal menyimpan kategori. Coba lagi."); }
  };

  if (view!=="list") return (
    <div style={{padding:26,maxWidth:520}}>
      <h2 className="sec-title" style={{marginBottom:20}}>{view==="add" ? "Tambah Kategori" : "Edit Kategori"}</h2>
      {err && <div style={{background:C.dangerL,border:`1px solid #FECACA`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.danger}}>{err}</div>}
      <div className="card card-pad">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div className="inp-group">
            <label className="inp-label">Nama Kategori *</label>
            <input className="inp" placeholder="Isi kategori" value={form.label} onChange={e => setForm({...form,label:e.target.value})}/>
          </div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={() => { setView("list"); setErr(""); }} className="btn btn-ghost" style={{padding:"10px 22px"}}>Batal</button>
            <button onClick={handleSave} className="btn btn-primary" style={{flex:1,padding:10}}>
              {view==="add" ? "Simpan Kategori" : "Update Kategori"}
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
        <button onClick={() => { setForm({label:""}); setErr(""); setView("add"); }} className="btn btn-primary"><Ic.Plus/> Tambah Kategori</button>
      </div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>Nama Kategori</th><th>ID</th><th style={{width:180,textAlign:"center"}}>Aksi</th></tr></thead>
          <tbody>
            {categories.length===0 && <tr><td colSpan={3} style={{textAlign:"center",padding:52,color:C.fog}}>Belum ada kategori.</td></tr>}
            {categories.map(cat => (
              <tr key={cat.id}>
                <td style={{fontWeight:700,color:C.ink,fontSize:13}}>{cat.label}</td>
                <td><code style={{background:C.rose,color:C.stone,padding:"2px 9px",borderRadius:6,fontSize:11}}>{cat.id}</code></td>
                <td style={{textAlign:"center"}}>
                  <div style={{display:"flex",justifyContent:"center",gap:6}}>
                    <button onClick={() => openEdit(cat)} className="btn btn-edit-soft btn-sm"><Ic.Edit/> Edit</button>
                    <button onClick={() => setDeleteTarget(cat)} className="btn btn-danger-soft btn-sm"><Ic.Trash/> Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {deleteTarget && (
        <ConfirmModal title="Hapus kategori?" danger
          desc={`Kategori "${deleteTarget.label}" akan dihapus permanen.`}
          onConfirm={async () => { await apiDeleteCategory(deleteTarget.id); setCategories(prev => prev.filter(c => c.id!==deleteTarget.id)); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

function SalesReportPanel({ orders, products, categories }) {
  const [reportPeriod, setReportPeriod] = useState("all");
  const now = new Date();

  const filteredByPeriod = orders.filter(o => {
    if (reportPeriod==="all") return true;
    const d = new Date(o.date || o.created_at);
    if (reportPeriod==="today") return d.toDateString()===now.toDateString();
    if (reportPeriod==="week") { const w=new Date(now); w.setDate(now.getDate()-7); return d>=w; }
    if (reportPeriod==="month") return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
    return true;
  });

  const delivered = filteredByPeriod.filter(o => o.status==="delivered");
  const cancelled = filteredByPeriod.filter(o => o.status==="cancelled");
  const totalRevenue = delivered.reduce((s,o) => s+o.total, 0);
  const avgOrder = delivered.length>0 ? Math.round(totalRevenue/delivered.length) : 0;
  const conversionRate = filteredByPeriod.length>0 ? Math.round((delivered.length/filteredByPeriod.length)*100) : 0;
  const cancelRate = filteredByPeriod.length>0 ? Math.round((cancelled.length/filteredByPeriod.length)*100) : 0;

  const catRevenue = {};
  delivered.forEach(o => o.items.forEach(it => {
    const p = products.find(pr => pr.name===it.name);
    const cat = p ? categories.find(c => c.id===p.cat)?.label||"Lainnya" : "Lainnya";
    catRevenue[cat] = (catRevenue[cat]||0) + it.price*it.qty;
  }));
  const catData = Object.entries(catRevenue).sort((a,b) => b[1]-a[1]);
  const maxCat = catData[0] ? catData[0][1] : 1;

  const prodRevenue = {};
  const prodQty = {};
  delivered.forEach(o => o.items.forEach(it => {
    prodRevenue[it.name] = (prodRevenue[it.name]||0) + it.price*it.qty;
    prodQty[it.name] = (prodQty[it.name]||0) + it.qty;
  }));
  const topProds = Object.entries(prodRevenue).sort((a,b) => b[1]-a[1]).slice(0,5);

  const months = ["Okt","Nov","Des","Jan","Feb","Mar","Apr"];
  const monthlyRevenue = [1850000,2340000,3120000,2780000,3450000,2950000,totalRevenue||4200000];
  const maxMonth = Math.max(...monthlyRevenue);
  const PALETTE = [C.primary,"#7c3aed","#0891b2",C.jade,"#d97706","#dc2626"];
  const periodBtns = [["all","Semua Waktu"],["month","Bulan Ini"],["week","7 Hari"],["today","Hari Ini"]];

  return (
    <div style={{padding:26,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
        <div>
          <h2 className="sec-title">Laporan Penjualan</h2>
          <p className="sec-sub">Ringkasan performa toko MeiHua Official</p>
        </div>
        <div style={{display:"flex",gap:6}}>
          {periodBtns.map(([k,v]) => (
            <button key={k} onClick={() => setReportPeriod(k)} className={`filter-btn ${reportPeriod===k?"filter-btn-active":"filter-btn-inactive"}`}>{v}</button>
          ))}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
        <StatCard label="Total Pendapatan" value={fmt(totalRevenue)} sub="Pesanan selesai" accent={C.primary}/>
        <StatCard label="Total Pesanan" value={filteredByPeriod.length} sub="Semua status" accent="#7c3aed"/>
        <StatCard label="Rata-rata Pesanan" value={fmt(avgOrder)} sub="Per transaksi" accent={C.sapphire}/>
        <StatCard label="Tingkat Selesai" value={`${conversionRate}%`} sub={`Dibatalkan: ${cancelRate}%`} accent={C.jade}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.7fr 1fr",gap:16,marginBottom:16}}>
        <div className="card card-pad">
          <p style={{fontWeight:700,fontSize:14,color:C.ink,margin:"0 0 3px",fontFamily:"'Playfair Display',serif"}}>Tren Pendapatan</p>
          <p style={{fontSize:12,color:C.fog,margin:"0 0 20px"}}>7 bulan terakhir</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160}}>
            {monthlyRevenue.map((val,i) => {
              const h = Math.round((val/maxMonth)*135);
              const isLast = i===monthlyRevenue.length-1;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  {isLast ? <p style={{fontSize:10,color:C.primary,fontWeight:700,margin:0,whiteSpace:"nowrap"}}>{fmt(val)}</p> : <p style={{fontSize:10,color:"transparent",margin:0}}>x</p>}
                  <div className="bar-seg" style={{width:"100%",height:`${h}px`,background:isLast?`linear-gradient(to top,${C.primaryDeep},${C.primary})`:C.parchment,borderRadius:"6px 6px 0 0",transition:".3s",cursor:"pointer"}}/>
                  <p style={{fontSize:11,color:isLast?C.primary:C.fog,margin:0,fontWeight:isLast?700:400}}>{months[i]}</p>
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
                {catData.map(([cat,rev],i) => (
                  <div key={cat}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.ink}}>{cat}</span>
                      <span style={{fontSize:12,fontWeight:700,color:PALETTE[i%PALETTE.length]}}>{fmt(rev)}</span>
                    </div>
                    <div style={{height:5,background:C.silk,borderRadius:99,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.round((rev/maxCat)*100)}%`,background:PALETTE[i%PALETTE.length],borderRadius:99,transition:".4s"}}/>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
      <div className="card">
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.parchment}`,background:C.silk}}>
          <p style={{fontWeight:700,fontSize:14,color:C.ink,margin:0,fontFamily:"'Playfair Display',serif"}}>Produk Terlaris</p>
        </div>
        {topProds.length===0
          ? <p style={{color:C.fog,fontSize:13,textAlign:"center",padding:32}}>Belum ada data</p>
          : <table className="tbl">
              <thead><tr><th style={{width:40}}>#</th><th>Produk</th><th>Qty Terjual</th><th>Pendapatan</th><th>Porsi</th></tr></thead>
              <tbody>
                {topProds.map(([name,rev],i) => (
                  <tr key={name}>
                    <td>
                      <span style={{width:26,height:26,borderRadius:"50%",background:i===0?C.petal:i===1?C.rose:C.silk,display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:i===0?C.primary:C.fog}}>{i+1}</span>
                    </td>
                    <td style={{fontWeight:600,color:C.ink,fontSize:13}}>{name}</td>
                    <td style={{fontSize:12,color:C.stone,fontWeight:600}}>{prodQty[name]||0} pcs</td>
                    <td><span style={{fontWeight:700,color:C.primary}}>{fmt(rev)}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:4,background:C.silk,borderRadius:99,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.round((rev/(topProds[0][1]||1))*100)}%`,background:`linear-gradient(to right,${C.primary},${C.primaryDeep})`,borderRadius:99}}/>
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
  const [tab, setTab] = useState(() => loadLocal('meihua_admin_tab', 'dashboard'));
  const pendingCount = orders.filter(o => o.status==="pending").length;
  const totalRevenue = orders.filter(o => o.status==="delivered").reduce((s,o) => s+o.total, 0);
  const deliveredCount = orders.filter(o => o.status==="delivered").length;
  const setTabPersist = (t) => { setTab(t); saveLocal('meihua_admin_tab', t); };

  const navItems = [
    {key:"dashboard", label:"Dashboard", icon:<Ic.Dash/>},
    {key:"products",  label:"Produk",    icon:<Ic.Box/>},
    {key:"orders",    label:"Pesanan",   icon:<Ic.Order/>, badge:pendingCount||null},
    {key:"categories",label:"Kategori",  icon:<Ic.Tag/>},
    {key:"reports",   label:"Laporan",   icon:<Ic.Chart/>},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.silk,overflow:"hidden"}}>
      <div className="admin-topbar" style={{padding:"11px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:11}}>
          <MHLogo size={36}/>
          <div>
            <p style={{margin:0,fontSize:14,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif"}}>MeiHua Official</p>
            <p style={{margin:0,fontSize:10,color:C.fog,letterSpacing:".5px"}}>Admin Dashboard</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <p style={{margin:0,fontSize:13,fontWeight:600,color:C.ink}}>{user}</p>
            <p style={{margin:0,fontSize:10,color:C.fog}}>Administrator</p>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.primaryDeep})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff"}}>
            {user?.charAt(0).toUpperCase()}
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{fontSize:12,gap:5}}>
            <Ic.Store/> Lihat Toko
          </button>
        </div>
      </div>

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{width:210,background:C.sidebarBg,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"16px 16px 8px"}}>
            <p style={{fontSize:12,fontWeight:700,color:"rgba(255, 255, 255, 0.35)",textTransform:"uppercase",letterSpacing:"1px",margin:0}}>Menu Utama</p>
          </div>
          {navItems.map(n => (
            <div key={n.key} className={`admin-nav ${tab===n.key?"active":""}`} onClick={() => setTabPersist(n.key)}>
              {n.icon}{n.label}
              {n.badge && <span className="nav-pill">{n.badge}</span>}
            </div>
          ))}
          <div style={{marginTop:"auto",padding:"14px 16px",borderTop:"1px solid rgba(255,255,255,.06)"}}>
            <p style={{fontSize:12,color:"rgba(226,198,208,0.35)",margin:0}}>MeiHua © 2026</p>
          </div>
        </div>

        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {tab==="dashboard" && (
            <div style={{padding:26}}>
              <h2 className="sec-title" style={{marginBottom:4}}>Selamat datang, {user} ๑ ืົཽ₍₍ළ₎₎ ืົཽ</h2>
              <p className="sec-sub" style={{marginBottom:22}}>Ringkasan performa toko Anda</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:26}}>
                <StatCard label="Total Produk" value={products.length} sub="Produk aktif" accent={C.primary}/>
                <StatCard label="Pesanan Masuk" value={orders.length} sub="Semua status" accent="#7c3aed"/>
                <StatCard label="Pesanan Selesai" value={deliveredCount} sub="Terkirim" accent={C.jade}/>
                <StatCard label="Total Pendapatan" value={fmt(totalRevenue)} sub="Pesanan selesai" accent={C.gold}/>
              </div>
              <div className="card">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:`1px solid ${C.parchment}`,background:C.silk}}>
                  <p style={{fontWeight:700,fontSize:15,color:C.ink,margin:0,fontFamily:"'Playfair Display',serif"}}>Pesanan Terbaru</p>
                  <button onClick={() => setTabPersist("orders")} style={{fontSize:13,color:C.primary,fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Lihat semua</button>
                </div>
                <table className="tbl">
                  <thead><tr><th>ID</th><th>Pelanggan</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.slice(0,5).map(o => (
                      <tr key={o.id}>
                        <td style={{fontWeight:700,color:C.primary,fontSize:12}}>#{o.id}</td>
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
          {tab==="products"    && <ProductsPanel products={products} setProducts={setProducts} categories={categories}/>}
          {tab==="orders"      && <OrdersPanel orders={orders} setOrders={setOrders}/>}
          {tab==="categories"  && <CategoriesPanel categories={categories} setCategories={setCategories}/>}
          {tab==="reports"     && <SalesReportPanel orders={orders} products={products} categories={categories}/>}
        </div>
      </div>
    </div>
  );
}

function TopNavbar({ user, cartCount, openCart, openAuth, openAdmin, onLogout, searchQuery, setSearchQuery }) {
  return (
    <div className="topbar" style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:11}}>
        <MHLogo size={34}/>
        <div>
          <span style={{fontSize:16,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif",letterSpacing:".2px"}}>
            MeiHua <span style={{color:C.primary}}>Official</span>
          </span>
          <p style={{margin:0,fontSize:9.5,color:C.primaryMid,fontWeight:700,letterSpacing:"1.2px",textTransform:"uppercase"}}>Fine Jewelry</p>
        </div>
      </div>
      <div style={{position:"relative",width:"36%"}}>
        <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",color:C.fog,pointerEvents:"none"}}><Ic.Search/></span>
        <input className="search-bar" placeholder="Cari produk perhiasan..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:C.fog,display:"flex",alignItems:"center",padding:2}}>
            <Ic.X/>
          </button>
        )}
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button onClick={openCart} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:9,display:"flex",alignItems:"center",color:C.stone,borderRadius:10,transition:".15s"}}
          onMouseEnter={e => e.currentTarget.style.background=C.rose}
          onMouseLeave={e => e.currentTarget.style.background="none"}>
          <Ic.Cart/>
          {cartCount>0 && <span style={{position:"absolute",top:3,right:3,background:C.primary,color:"#fff",borderRadius:"50%",width:17,height:17,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{cartCount}</span>}
        </button>
        {!user ? (
          <>
            <button className="btn btn-ghost" onClick={() => openAuth("login")}>Masuk</button>
            <button className="btn btn-primary" onClick={() => openAuth("register")}>Daftar</button>
          </>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${C.primary},${C.primaryDeep})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff"}}>
              {user.charAt(0).toUpperCase()}
            </div>
            <span style={{fontSize:13,fontWeight:600,color:C.ink}}>{user}</span>
            <button onClick={openAdmin} style={{background:C.primaryLight,color:C.primaryDeep,border:`1.5px solid ${C.parchment}`,borderRadius:99,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:".15s"}}>
              Admin
            </button>
            <button onClick={onLogout} style={{background:"none",border:"none",color:C.fog,fontSize:13,cursor:"pointer",padding:"6px 8px",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}>
              <Ic.Logout/>Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGrid({ products, cart, addToCart, removeFromCart, searchQuery }) {
  if (products.length===0) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:320,color:C.fog,gap:10}}>
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={C.parchment} strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <p style={{fontSize:15,fontWeight:600,marginTop:8,color:C.stone}}>{searchQuery ? `Tidak ada produk untuk "${searchQuery}"` : "Produk tidak ditemukan"}</p>
      {searchQuery && <p style={{fontSize:12,color:C.fog}}>Coba kata kunci yang berbeda</p>}
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(168px,1fr))",gap:14}}>
      {products.map(p => {
        const item = cart.find(i => i.id===p.id);
        return (
          <div key={p.id} className="prod-card">
            <div style={{height:168,position:"relative",overflow:"hidden",background:C.rose,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {p.discount && (
                <div style={{position:"absolute",top:8,left:8,background:C.danger,color:"#fff",fontSize:11,padding:"3px 9px",borderRadius:6,fontWeight:700,zIndex:1}}>
                  −{p.discount}%
                </div>
              )}
              {p.img
                ? <img src={p.img} alt="produk" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:C.blush}}>
                    <span style={{fontSize:32}}>🌸</span>
                    <p style={{fontSize:11,color:C.fog,margin:0}}>Belum ada foto</p>
                  </div>
              }
            </div>
            <div style={{padding:"13px 13px 15px",display:"flex",flexDirection:"column",flex:1}}>
              <p style={{fontSize:12.5,margin:"0 0 7px",color:C.ink,lineHeight:1.4,height:36,overflow:"hidden",fontWeight:500}}>{p.name}</p>
              <p style={{color:C.primary,fontWeight:700,fontSize:14,margin:"0 0 2px"}}>{fmt(p.price)}</p>
              <div style={{height:17,marginBottom:6}}>
                {p.oldPrice && <span style={{textDecoration:"line-through",color:C.fog,fontSize:11}}>{fmt(p.oldPrice)}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:4}}>
                <Ic.Star/><span style={{fontSize:11,color:C.fog}}>{p.rating} · {p.sold} terjual</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:11}}>
                <Ic.Ok/><span style={{fontSize:11,color:C.jade,fontWeight:600}}>{p.seller}</span>
              </div>
              <div style={{marginTop:"auto"}}>
                {item ? (
                  <div className="qty-ctrl">
                    <button className="qty-btn" onClick={() => removeFromCart(p.id)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(p)}>+</button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(p)}
                    style={{width:"100%",padding:"9px",background:`linear-gradient(135deg,${C.primary},${C.primaryDeep})`,color:"#fff",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:".15s",boxShadow:`0 2px 10px ${C.primaryGlow}`}}
                    onMouseEnter={e => e.currentTarget.style.transform="scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
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

const PAYMENT_METHODS = [
  { id: "transfer", label: "Transfer Bank", icon: "🏦", detail: "BCA · Mandiri · BNI" },
  { id: "qris",     label: "QRIS",          icon: "📱", detail: "Semua e-wallet & m-banking" },
  { id: "cod",      label: "COD",           icon: "🚚", detail: "Bayar saat barang tiba" },
];

function CheckoutModal({ cart, user, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: user || "", phone: "", address: "", payment: "transfer", notes: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const validate = () => {
    if (!form.name.trim()) return "Nama penerima wajib diisi.";
    if (!form.phone.trim() || form.phone.replace(/\D/g,'').length < 9) return "Nomor HP tidak valid.";
    if (!form.address.trim()) return "Alamat pengiriman wajib diisi.";
    return null;
  };

  const handleNext = () => {
    const e = validate();
    if (e) { setErr(e); return; }
    setErr(""); setStep(2);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await apiCreateOrder({
        customer: form.name,
        phone: form.phone,
        address: form.address,
        payment_method: form.payment,
        notes: form.notes,
        items: cart.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price })),
        total,
      });
      setStep(3);
    } catch (e) {
      setErr("Gagal membuat pesanan: " + e.message);
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — Sukses
  if (step === 3) return (
    <Overlay onClose={() => {}}>
      <div style={{ background: C.snow, borderRadius: 20, width: 400, padding: "40px 32px", textAlign: "center", boxShadow: "0 24px 64px rgba(28,17,23,.22)" }}>
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.jadeLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>✓</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display',serif", color: C.ink }}>Pesanan Berhasil!</h3>
        <p style={{ fontSize: 13, color: C.stone, margin: "0 0 6px", lineHeight: 1.7 }}>
          Terima kasih, <strong>{form.name}</strong>!
        </p>
        <p style={{ fontSize: 12, color: C.fog, margin: "0 0 24px" }}>
          Kami akan menghubungi {form.phone} untuk konfirmasi.
        </p>
        <div style={{ background: C.rose, borderRadius: 12, padding: "14px 18px", marginBottom: 24, textAlign: "left" }}>
          <p style={{ fontSize: 11, color: C.stone, margin: "0 0 4px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".7px" }}>Total Pembayaran</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: C.primary, margin: "0 0 4px" }}>{fmt(total)}</p>
          <p style={{ fontSize: 11, color: C.fog, margin: 0 }}>via {PAYMENT_METHODS.find(m => m.id === form.payment)?.label}</p>
        </div>
        <button onClick={onSuccess} className="btn btn-primary" style={{ width: "100%", padding: 13 }}>
          Kembali Belanja
        </button>
      </div>
    </Overlay>
  );

  // STEP 2 — Konfirmasi
  if (step === 2) return (
    <Overlay onClose={() => setStep(1)}>
      <div style={{ background: C.snow, borderRadius: 20, width: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(28,17,23,.22)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.parchment}`, background: C.silk, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.stone, textTransform: "uppercase", letterSpacing: ".8px", margin: "0 0 3px" }}>Langkah 2 dari 2</p>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>Konfirmasi Pesanan</h3>
          </div>
          <button onClick={onClose} className="btn btn-icon"><Ic.X /></button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {err && <div style={{ background: C.dangerL, border: `1px solid #FECACA`, borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.danger }}>{err}</div>}
          <div style={{ background: C.rose, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.stone, textTransform: "uppercase", letterSpacing: ".7px", margin: "0 0 10px" }}>Dikirim ke</p>
            <p style={{ fontWeight: 700, color: C.ink, margin: "0 0 3px", fontSize: 14 }}>{form.name}</p>
            <p style={{ fontSize: 12, color: C.fog, margin: "0 0 3px" }}>{form.phone}</p>
            <p style={{ fontSize: 12, color: C.fog, margin: 0 }}>{form.address}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: C.stone, textTransform: "uppercase", letterSpacing: ".7px", margin: "0 0 10px" }}>Item Pesanan ({cart.length})</p>
            {cart.map((item, i) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < cart.length - 1 ? `1px solid ${C.parchment}` : "none", gap: 10 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {item.img && <img src={item.img} alt="" style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", border: `1px solid ${C.parchment}` }} />}
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: "0 0 2px" }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: C.fog, margin: 0 }}>×{item.qty} · {fmt(item.price)}</p>
                  </div>
                </div>
                <p style={{ fontWeight: 700, color: C.ink, margin: 0, flexShrink: 0 }}>{fmt(item.qty * item.price)}</p>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: C.silk, borderRadius: 10 }}>
            <span style={{ fontSize: 13, color: C.stone }}>Metode Pembayaran</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{PAYMENT_METHODS.find(m => m.id === form.payment)?.label}</span>
          </div>
          {form.notes && (
            <div style={{ padding: "10px 14px", background: C.silk, borderRadius: 10 }}>
              <span style={{ fontSize: 12, color: C.fog }}>Catatan: {form.notes}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 16px", background: C.primaryLight, borderRadius: 10, border: `1px solid ${C.blush}` }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Total Bayar</span>
            <span style={{ fontWeight: 700, fontSize: 20, color: C.primary }}>{fmt(total)}</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setErr(""); setStep(1); }} className="btn btn-ghost" style={{ flex: 1, padding: 12 }}>← Ubah Data</button>
            <button onClick={handleConfirm} disabled={loading} className="btn btn-primary" style={{ flex: 2, padding: 12, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Memproses..." : "✓ Konfirmasi & Pesan"}
            </button>
          </div>
        </div>
      </div>
    </Overlay>
  );

  // STEP 1 — Form data diri
  return (
    <Overlay onClose={onClose}>
      <div style={{ background: C.snow, borderRadius: 20, width: 460, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(28,17,23,.22)" }}>
        <div style={{ background: `linear-gradient(135deg,${C.primary},${C.primaryDeep})`, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 10, color: "rgba(255,255,255,.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".8px" }}>Langkah 1 dari 2</p>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Playfair Display',serif" }}>Data Pengiriman</h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,.7)" }}>{cart.length} produk · {fmt(total)}</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,.2)", border: "none", borderRadius: 9, width: 34, height: 34, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic.X />
          </button>
        </div>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div style={{ background: C.dangerL, border: `1px solid #FECACA`, borderRadius: 9, padding: "10px 14px", fontSize: 13, color: C.danger }}>{err}</div>}
          <div className="inp-group">
            <label className="inp-label">Nama Penerima *</label>
            <input className="inp" placeholder="Nama lengkap penerima" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="inp-group">
            <label className="inp-label">Nomor HP *</label>
            <input className="inp" placeholder="08xxxxxxxxxx" type="tel" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="inp-group">
            <label className="inp-label">Alamat Pengiriman *</label>
            <textarea className="inp" placeholder="Jalan, nomor rumah, kelurahan, kota, kode pos..." value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })} style={{ minHeight: 80 }} />
          </div>
          <div className="inp-group">
            <label className="inp-label">Metode Pembayaran *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {PAYMENT_METHODS.map(m => (
                <div key={m.id} onClick={() => setForm({ ...form, payment: m.id })}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", border: `1.5px solid ${form.payment === m.id ? C.primary : C.parchment}`, borderRadius: 10, cursor: "pointer", background: form.payment === m.id ? C.primaryLight : C.snow, transition: ".15s" }}>
                  <span style={{ fontSize: 22 }}>{m.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: form.payment === m.id ? C.primaryDeep : C.ink }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: C.fog }}>{m.detail}</p>
                  </div>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${form.payment === m.id ? C.primary : C.parchment}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {form.payment === m.id && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="inp-group">
            <label className="inp-label">Catatan (opsional)</label>
            <input className="inp" placeholder="Instruksi khusus untuk penjual..." value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button onClick={handleNext} className="btn btn-primary" style={{ width: "100%", padding: 13, marginTop: 4 }}>
            Lanjut ke Konfirmasi →
          </button>
        </div>
      </div>
    </Overlay>
  );
}

function CartPopup({ cart, close, remove, user, openAuth, clearCart }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleCheckout = () => {
    if (!user) {
      close();
      openAuth("login");
      return;
    }
    setShowCheckout(true);
  };

  const handleSuccess = () => {
    setShowCheckout(false);
    clearCart();
    close();
  };

  return (
    <>
      <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(28,17,23,.45)", zIndex: 998, backdropFilter: "blur(2px)" }} />
      <div style={{ position: "fixed", top: 0, right: 0, width: 370, height: "100vh", background: C.snow, boxShadow: `-4px 0 32px rgba(28,17,23,.12)`, zIndex: 999, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 22px", borderBottom: `1px solid ${C.parchment}`, background: C.silk }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.ink, fontFamily: "'Playfair Display',serif" }}>Keranjang Belanja</h3>
          <button onClick={close} className="btn btn-icon"><Ic.X /></button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: "center", marginTop: 90, color: C.fog, padding: 22 }}>
            <span style={{ fontSize: 44 }}>🛍️</span>
            <p style={{ fontSize: 15, marginTop: 16, fontWeight: 600, color: C.stone }}>Keranjang masih kosong</p>
            <p style={{ fontSize: 12, color: C.fog, marginTop: 5 }}>Tambahkan produk perhiasan pilihan Anda</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${C.parchment}`, gap: 12 }}>
                  {item.img && <img src={item.img} alt="" style={{ width: 46, height: 46, borderRadius: 9, objectFit: "cover", border: `1px solid ${C.parchment}`, flexShrink: 0 }} />}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.ink, margin: "0 0 4px" }}>{item.name}</p>
                    <p style={{ fontSize: 12, color: C.fog, margin: 0 }}>{item.qty} × {fmt(item.price)}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: C.ink }}>{fmt(item.qty * item.price)}</span>
                    <button onClick={() => remove(item.id)} className="btn btn-danger-soft" style={{ fontSize: 11, padding: "3px 10px" }}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "18px 22px", borderTop: `1px solid ${C.parchment}`, background: C.rose }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontWeight: 600, color: C.stone }}>Total ({cart.reduce((s,i)=>s+i.qty,0)} item)</span>
                <span style={{ fontWeight: 700, fontSize: 18, color: C.primary }}>{fmt(total)}</span>
              </div>
              {!user && (
                <p style={{ fontSize: 12, color: C.stone, textAlign: "center", marginBottom: 10, background: C.amberL, padding: "8px 12px", borderRadius: 8 }}>
                  ⚠ Silakan{" "}
                  <span style={{ color: C.primary, cursor: "pointer", fontWeight: 700 }} onClick={handleCheckout}>login</span>
                  {" "}terlebih dahulu untuk checkout
                </p>
              )}
              <button onClick={handleCheckout} className="btn btn-primary" style={{ width: "100%", padding: 13, fontSize: 13, borderRadius: 10 }}>
                {user ? "Checkout Sekarang →" : "Login untuk Checkout"}
              </button>
            </div>
          </>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal
          cart={cart}
          user={user}
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}

function AuthModal({ close, setUser, mode, onLoginAdmin }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (password.length < 6) { setErr("Password minimal 6 karakter."); return; }
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await apiLogin(email, password);
      } else {
        if (!name.trim()) { setErr("Nama tidak boleh kosong."); setLoading(false); return; }
        res = await apiRegister(name.trim(), email, password);
      }
      if (res?.token) {
        localStorage.setItem('meihua_token', res.token);
        const userName = (typeof res.user === 'object' ? res.user?.name : res.user) || email.split('@')[0];
        const userRole = (typeof res.user === 'object' ? res.user?.role : 'user') || 'user';
        localStorage.setItem('meihua_role', userRole);
        localStorage.setItem('meihua_name', userName);
        setUser(userName);
        // Admin masuk dashboard, customer tetap di toko
        if (userRole === 'admin') onLoginAdmin();
        close();
      } else {
        setErr(res?.message || 'Terjadi kesalahan.');
      }
    } catch (error) {
      setErr('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Overlay onClose={close}>
      <div style={{ background: C.snow, borderRadius: 20, width: 390, overflow: "hidden", boxShadow: "0 28px 72px rgba(28,17,23,.25)" }}>
        <div style={{ background: `linear-gradient(135deg,${C.primary} 0%,${C.primaryDeep} 100%)`, padding: "28px 32px 26px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, opacity: .08, backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} />
          <MHLogo size={46} />
          <h2 style={{ margin: "14px 0 4px", fontSize: 22, color: "#fff", fontWeight: 700, fontFamily: "'Playfair Display',serif" }}>
            {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.75)" }}>MeiHua Official</p>
        </div>
        <div style={{ padding: "26px 32px 28px" }}>
          {err && (
            <div style={{ background: C.dangerL, border: `1px solid #FECACA`, borderRadius: 9, padding: "10px 14px", marginBottom: 14, fontSize: 13, color: C.danger }}>
              {err}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {!isLogin && (
              <input className="inp" placeholder="Nama lengkap" value={name}
                onChange={e => setName(e.target.value)} required disabled={loading} />
            )}
            <input className="inp" placeholder="Alamat email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required disabled={loading} />
            <div style={{ position: "relative" }}>
              <input className="inp" placeholder="Password (min. 6 karakter)"
                type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} required disabled={loading}
                style={{ paddingRight: 100 }} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: C.fog, fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                {showPass ? "Sembunyikan" : "Tampilkan"}
              </button>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: "100%", padding: 13, fontSize: 13, borderRadius: 10, marginTop: 4, opacity: loading ? 0.7 : 1 }}>
              {loading ? "Memproses..." : (isLogin ? "Masuk ke Akun" : "Daftar Sekarang")}
            </button>
          </form>
          <hr className="divider" style={{ margin: "20px 0" }} />
          <p style={{ textAlign: "center", fontSize: 13, color: C.fog, margin: 0 }}>
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <span style={{ color: C.primary, cursor: "pointer", fontWeight: 700 }}
              onClick={() => { setIsLogin(!isLogin); setErr(""); }}>
              {isLogin ? "Daftar disini" : "Masuk"}
            </span>
          </p>
        </div>
      </div>
    </Overlay>
  );
}

export default function App() {
  const [user, setUser]               = useState(() => localStorage.getItem('meihua_name') || null);
  const [cart, setCart]               = useState(() => loadLocal('meihua_cart', []));
  const [adminMode, setAdminMode]     = useState(() => loadLocal('meihua_admin_mode', false));
  const [activeCategory, setActiveCategory] = useState(() => loadLocal('meihua_active_cat', null));
  const [searchQuery, setSearchQuery] = useState(() => loadLocal('meihua_search', ''));
  const [showCart, setShowCart]       = useState(false);
  const [showAuth, setShowAuth]       = useState(null);
  const [showLogout, setShowLogout]   = useState(false);
  const [products, setProducts]       = useState([]);
  const [categories, setCategories]   = useState([]);
  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const clearCart = () => setCart([]);

  useEffect(() => { saveLocal('meihua_cart', cart); }, [cart]);
  useEffect(() => { saveLocal('meihua_admin_mode', adminMode); }, [adminMode]);
  useEffect(() => { saveLocal('meihua_active_cat', activeCategory); }, [activeCategory]);
  useEffect(() => { saveLocal('meihua_search', searchQuery); }, [searchQuery]);

  useEffect(() => {
    const token = localStorage.getItem('meihua_token');
    const savedName = localStorage.getItem('meihua_name');
    if (token && savedName) setUser(savedName);
    async function fetchPublicData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([apiGetProducts(), apiGetCategories()]);
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) { console.error('[App] fetchPublicData error:', err); }
      finally { setLoading(false); }
    }
    fetchPublicData();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('meihua_token');
    const role = localStorage.getItem('meihua_role');
    if (!user || !token || role !== 'admin') return;
    apiGetOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [user]);

  const addToCart = (product) => setCart(prev => {
    const exist = prev.find(i => i.id===product.id);
    if (exist) return prev.map(i => i.id===product.id ? {...i,qty:i.qty+1} : i);
    return [...prev, {...product,qty:1}];
  });
  const removeFromCart = (id) => setCart(prev => prev.map(i => i.id===id ? {...i,qty:i.qty-1} : i).filter(i => i.qty>0));

  const filteredProducts = products.filter(p => {
    if (activeCategory && p.cat !== activeCategory.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.seller && p.seller.toLowerCase().includes(q)) ||
        (p.cat && p.cat.toLowerCase().includes(q)) ||
        (categories.find(c => c.id===p.cat)?.label||"").toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.silk}}>
      <div style={{textAlign:"center"}}>
        <MHLogo size={52}/>
        <p style={{marginTop:16,color:C.fog,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Memuat data MeiHua…</p>
        <div className="uploading-bar" style={{width:120,margin:"12px auto 0"}}/>
      </div>
    </div>
  );

  return (
    <>
      <GlobalStyles/>
      {!adminMode && (
        <TopNavbar
          user={user}
          cartCount={cart.reduce((a,b) => a+b.qty, 0)}
          openCart={() => setShowCart(true)}
          openAuth={m => setShowAuth(m)}
          openAdmin={() => setAdminMode(true)}
          onLogout={() => setShowLogout(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {user && adminMode ? (
        <AdminPanel
          products={products} setProducts={setProducts}
          categories={categories} setCategories={setCategories}
          orders={orders} setOrders={setOrders}
          user={user} onClose={() => setAdminMode(false)}
        />
      ) : (
        <div style={{display:"flex",height:"calc(100vh - 60px)",overflow:"hidden"}}>
          {/* Sidebar Kategori */}
          <div style={{width:130,background:C.snow,flexShrink:0,borderRight:`1px solid ${C.parchment}`,padding:"10px 0",overflowY:"auto"}}>
            <div style={{padding:"7px 16px 9px",borderBottom:`1px solid ${C.parchment}`,marginBottom:4}}>
              <p style={{fontSize:9.5,fontWeight:700,color:C.fog,textTransform:"uppercase",letterSpacing:".8px",margin:0}}>Kategori</p>
            </div>
            <div className={`cat-item ${!activeCategory?"active":""}`}
              onClick={() => { setActiveCategory(null); setSearchQuery(""); }}>
              Semua
            </div>
            {categories.map(cat => (
              <div key={cat.id} className={`cat-item ${activeCategory?.id===cat.id?"active":""}`}
                onClick={() => {
                  setActiveCategory(activeCategory?.id===cat.id ? null : cat);
                  setSearchQuery("");
                }}>
                {cat.label}
              </div>
            ))}
          </div>

          {/* Area Produk */}
          <div style={{flex:1,overflowY:"auto",padding:18}}>
            {/* Breadcrumb */}
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:14,fontSize:13}}>
              <span style={{cursor:"pointer",color:!activeCategory?C.primary:C.fog,fontWeight:600}}
                onClick={() => { setActiveCategory(null); setSearchQuery(""); }}>
                Semua Produk
              </span>
              {activeCategory && (
                <>
                  <span style={{color:C.parchment}}><Ic.Chevron/></span>
                  <span style={{color:C.primary,fontWeight:600}}>{activeCategory.label}</span>
                </>
              )}
              {searchQuery && (
                <>
                  <span style={{color:C.parchment}}><Ic.Chevron/></span>
                  <span style={{color:C.primary,fontWeight:600}}>Hasil: "{searchQuery}"</span>
                </>
              )}
            </div>

            {/* Header */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{margin:0,fontSize:18,fontWeight:700,color:C.ink,fontFamily:"'Playfair Display',serif"}}>
                {searchQuery ? "Hasil pencarian" : activeCategory ? activeCategory.label : "Semua Produk"}
              </h2>
              <span style={{fontSize:12,color:C.fog,background:C.rose,padding:"4px 12px",borderRadius:99,fontWeight:600}}>
                {filteredProducts.length} produk
              </span>
            </div>

            <ProductGrid
              products={filteredProducts}
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      )}

      {showCart && (
        <CartPopup
          cart={cart}
          close={() => setShowCart(false)}
          remove={removeFromCart}
          user={user}
          openAuth={m => setShowAuth(m)}
          clearCart={clearCart}
        />
      )}

      {showAuth && (
        <AuthModal
          mode={showAuth}
          close={() => setShowAuth(null)}
          setUser={setUser}
          onLoginAdmin={() => setAdminMode(true)}
        />
      )}
      {showLogout && (
        <ConfirmModal
          title="Yakin ingin keluar?"
          desc="Anda akan keluar dari sesi ini."
          onConfirm={() => {
            localStorage.removeItem('meihua_token');
            localStorage.removeItem('meihua_role');
            localStorage.removeItem('meihua_name');
            localStorage.removeItem('meihua_admin_mode');
            setUser(null); setAdminMode(false); setShowLogout(false); setCart([]);
          }}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </>
  );
}