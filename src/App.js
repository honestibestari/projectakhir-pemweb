import React, { useState, useRef, useEffect } from "react";
import { apiLogin, apiRegister, apiGetProducts, apiGetCategories, 
         apiGetOrders, apiAddProduct, apiUpdateProduct, apiDeleteProduct,
         apiAddCategory, apiUpdateCategory, apiDeleteCategory, 
         apiUpdateOrderStatus } from './api';

const C = {
  primary:   "#C8102E",   
  primary2:  "#A00D25",
  gold:      "#B8963E",
  goldLight: "#F5EDD6",
  dark:      "#1A1A1A",
  mid:       "#4A4A4A",
  muted:     "#8A8A8A",
  border:    "#E8E4DE",
  surface:   "#FAFAF8",
  white:     "#FFFFFF",
  success:   "#166534",
  successBg: "#DCFCE7",
  warning:   "#92400E",
  warningBg: "#FEF3C7",
  info:      "#1E40AF",
  infoBg:    "#DBEAFE",
  danger:    "#991B1B",
  dangerBg:  "#FEE2E2",
};

const FIXED_SELLER = "MeiHua Official";
const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

const LogoIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill={C.primary}/>
    <path d="M16 6L19.5 13H26L20.5 17.5L22.5 25L16 21L9.5 25L11.5 17.5L6 13H12.5L16 6Z"
      fill={C.gold} stroke={C.gold} strokeWidth="0.5" strokeLinejoin="round"/>
    <circle cx="16" cy="16" r="3" fill={C.white} opacity="0.9"/>
  </svg>
);

const Icon = {
  dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  product:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  order:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  category:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>,
  report:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
  cart:      () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  search:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  close:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>,
  plus:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>,
  edit:      () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:     () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
  check:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>,
  user:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>,
  photo:     () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  star:      () => <svg width="11" height="11" viewBox="0 0 24 24" fill={C.gold} stroke={C.gold} strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  verified:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill={C.success} stroke="none"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  chevron:   () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
};

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-size: 14px; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: ${C.surface};
      color: ${C.dark};
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }

    .btn-primary {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${C.primary}; color: ${C.white};
      padding: 9px 20px; border: none; border-radius: 8px;
      cursor: pointer; font-weight: 600; font-size: 13px;
      font-family: 'DM Sans', sans-serif; letter-spacing: .2px;
      transition: background .15s, transform .1s;
    }
    .btn-primary:hover { background: ${C.primary2}; transform: translateY(-1px); }
    .btn-primary:active { transform: translateY(0); }

    .btn-outline {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${C.white}; color: ${C.dark};
      padding: 8px 18px; border: 1.5px solid ${C.border};
      border-radius: 8px; cursor: pointer; font-weight: 500;
      font-size: 13px; font-family: 'DM Sans', sans-serif;
      transition: border-color .15s, background .15s;
    }
    .btn-outline:hover { border-color: ${C.primary}; color: ${C.primary}; background: #FFF8F8; }

    .btn-danger {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${C.dangerBg}; color: ${C.danger};
      padding: 7px 14px; border: 1.5px solid #FECACA;
      border-radius: 8px; cursor: pointer; font-weight: 600;
      font-size: 12px; font-family: 'DM Sans', sans-serif;
      transition: background .15s;
    }
    .btn-danger:hover { background: #FEE2E2; }

    .btn-edit {
      display: inline-flex; align-items: center; gap: 6px;
      background: ${C.white}; color: ${C.primary};
      padding: 7px 14px; border: 1.5px solid ${C.border};
      border-radius: 8px; cursor: pointer; font-weight: 600;
      font-size: 12px; font-family: 'DM Sans', sans-serif;
      transition: border-color .15s, background .15s;
    }
    .btn-edit:hover { border-color: ${C.primary}; background: #FFF8F8; }

    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-label {
      font-size: 11px; font-weight: 600; color: ${C.muted};
      text-transform: uppercase; letter-spacing: .6px;
    }
    .form-input {
      width: 100%; padding: 10px 13px;
      border: 1.5px solid ${C.border}; border-radius: 8px;
      font-size: 13px; font-family: 'DM Sans', sans-serif;
      color: ${C.dark}; background: ${C.white};
      outline: none; transition: border-color .15s, box-shadow .15s;
    }
    .form-input:focus {
      border-color: ${C.primary};
      box-shadow: 0 0 0 3px rgba(200,16,46,.07);
    }
    .form-input::placeholder { color: #C0B9B1; }

    .card {
      background: ${C.white}; border: 1px solid ${C.border};
      border-radius: 12px; overflow: hidden;
    }

    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th {
      padding: 11px 16px; text-align: left;
      font-size: 10.5px; font-weight: 700; color: ${C.muted};
      text-transform: uppercase; letter-spacing: .7px;
      background: #F7F5F2; border-bottom: 1px solid ${C.border};
    }
    .data-table td {
      padding: 13px 16px; border-bottom: 1px solid #F2EFE9;
      color: ${C.mid}; vertical-align: middle;
    }
    .data-table tbody tr:hover td { background: #FAFAF8; }
    .data-table tbody tr:last-child td { border-bottom: none; }

    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 20px;
      font-size: 11px; font-weight: 700; letter-spacing: .2px;
    }
    .badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
    .badge-pending   { background: ${C.warningBg}; color: ${C.warning}; }
    .badge-dot-pending   { background: ${C.warning}; }
    .badge-processing{ background: ${C.infoBg};    color: ${C.info}; }
    .badge-dot-processing{ background: ${C.info}; }
    .badge-shipped   { background: #E0F2FE;         color: #0369A1; }
    .badge-dot-shipped   { background: #0369A1; }
    .badge-delivered { background: ${C.successBg}; color: ${C.success}; }
    .badge-dot-delivered { background: ${C.success}; }
    .badge-cancelled { background: ${C.dangerBg};  color: ${C.danger}; }
    .badge-dot-cancelled { background: ${C.danger}; }

    .product-card {
      background: ${C.white}; border: 1px solid ${C.border};
      border-radius: 12px; overflow: hidden;
      transition: box-shadow .2s, transform .2s;
      display: flex; flex-direction: column; cursor: pointer;
    }
    .product-card:hover {
      box-shadow: 0 8px 28px rgba(0,0,0,.09);
      transform: translateY(-2px);
    }

    .store-sidebar {
      width: 120px; background: ${C.white}; flex-shrink: 0;
      border-right: 1px solid ${C.border};
      padding: 12px 0; overflow-y: auto;
    }
    .cat-item {
      display: flex; align-items: center;
      padding: 10px 16px; cursor: pointer;
      font-size: 12.5px; color: ${C.mid};
      border-left: 3px solid transparent;
      transition: all .15s; font-weight: 500;
    }
    .cat-item:hover { background: #FFF8F8; color: ${C.primary}; }
    .cat-item.active {
      border-left-color: ${C.primary};
      background: #FFF8F8; color: ${C.primary}; font-weight: 700;
    }

    .submenu {
      width: 0; overflow: hidden;
      background: #FAFAF8; border-right: 1px solid ${C.border};
      transition: width .2s ease; flex-shrink: 0;
    }
    .submenu.open { width: 148px; }
    .submenu-inner { width: 148px; padding: 12px 0; }
    .submenu-title {
      font-size: 10px; font-weight: 700; color: ${C.primary};
      padding: 6px 14px 8px; text-transform: uppercase;
      letter-spacing: .8px; border-bottom: 1px solid ${C.border}; margin-bottom: 4px;
    }
    .sub-item {
      padding: 9px 14px; font-size: 12px; color: ${C.mid};
      cursor: pointer; border-left: 3px solid transparent;
      transition: all .15s; font-weight: 500;
    }
    .sub-item:hover { background: #FFF8F8; color: ${C.primary}; }
    .sub-item.active { border-left-color: ${C.primary}; background: #FFF8F8; color: ${C.primary}; font-weight: 700; }

    .admin-sidebar {
      width: 224px; background: ${C.white};
      border-right: 1px solid ${C.border};
      display: flex; flex-direction: column; flex-shrink: 0;
    }
    .admin-nav-item {
      display: flex; align-items: center; gap: 9px;
      padding: 10px 18px; cursor: pointer;
      font-size: 13px; color: ${C.mid};
      border-left: 3px solid transparent;
      transition: all .15s; font-weight: 500; margin: 1px 0;
    }
    .admin-nav-item:hover { background: #FFF8F8; color: ${C.primary}; }
    .admin-nav-item.active {
      border-left-color: ${C.primary};
      background: #FFF8F8; color: ${C.primary}; font-weight: 700;
    }
    .nav-badge {
      margin-left: auto; background: ${C.primary};
      color: ${C.white}; font-size: 10px;
      padding: 2px 7px; border-radius: 20px; font-weight: 700;
    }

    .qty-control {
      display: flex; align-items: center;
      border: 1.5px solid ${C.border}; border-radius: 8px;
      overflow: hidden; height: 34px;
    }
    .qty-btn {
      width: 34px; height: 100%;
      background: ${C.white}; border: none;
      font-size: 16px; color: ${C.mid};
      cursor: pointer; font-weight: 600; flex-shrink: 0; transition: .15s;
    }
    .qty-btn:hover { background: #FFF8F8; color: ${C.primary}; }
    .qty-btn:first-child { border-right: 1.5px solid ${C.border}; }
    .qty-btn:last-child  { border-left:  1.5px solid ${C.border}; }
    .qty-num { flex: 1; text-align: center; font-weight: 700; font-size: 13px; }

    .old-price { text-decoration: line-through; color: ${C.muted}; font-size: 11px; }

    .section-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px; font-weight: 700; color: ${C.dark};
    }
    .divider { border: none; border-top: 1px solid ${C.border}; }

    select.form-input { appearance: none; cursor: pointer; }
    textarea.form-input { resize: vertical; min-height: 80px; line-height: 1.5; }
  `}</style>
);

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(10,5,15,.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}
    >
      <div onClick={e=>e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ConfirmModal({ title, desc, onConfirm, onCancel, danger }) {
  return (
    <ModalOverlay onClose={onCancel}>
      <div style={{background:C.white,borderRadius:16,padding:"32px 28px",width:360,textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,.18)"}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:danger?C.dangerBg:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          {danger
            ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.danger} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
        </div>
        <h3 style={{margin:"0 0 8px",fontSize:17,color:C.dark,fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>{title}</h3>
        <p style={{margin:"0 0 24px",fontSize:13,color:C.muted,lineHeight:1.6}}>{desc}</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} className="btn-outline" style={{flex:1,justifyContent:"center",padding:11}}>Batal</button>
          <button
            onClick={onConfirm}
            style={{flex:1,padding:11,borderRadius:8,border:"none",background:danger?C.danger:C.primary,color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}
          >
            {danger ? "Ya, Hapus" : "Konfirmasi"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

const STATUS_LABELS = {pending:"Menunggu",processing:"Diproses",shipped:"Dikirim",delivered:"Selesai",cancelled:"Dibatalkan"};
function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className={`badge-dot badge-dot-${status}`}/>
      {STATUS_LABELS[status]}
    </span>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const statusOpts = ["pending","processing","shipped","delivered","cancelled"];
  return (
    <ModalOverlay onClose={onClose}>
      <div style={{background:C.white,borderRadius:16,width:480,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,.18)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"20px 24px",borderBottom:`1px solid ${C.border}`}}>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".7px",margin:"0 0 4px"}}>Detail Pesanan</p>
            <h3 style={{margin:0,fontSize:19,color:C.dark,fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>#{order.id}</h3>
          </div>
          <button onClick={onClose} style={{background:"#F5F3F0",border:"none",borderRadius:8,width:34,height:34,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.mid}}>
            <Icon.close/>
          </button>
        </div>
        <div style={{padding:24}}>
          <div style={{background:C.surface,borderRadius:10,padding:16,marginBottom:16}}>
            <p style={{fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".6px",margin:"0 0 10px"}}>Informasi Pelanggan</p>
            <p style={{fontWeight:700,color:C.dark,margin:"0 0 5px",fontSize:14}}>{order.customer}</p>
            <p style={{fontSize:12,color:C.muted,margin:"0 0 3px"}}>Telp: {order.phone}</p>
            <p style={{fontSize:12,color:C.muted,margin:0}}>Alamat: {order.address}</p>
          </div>
          <div style={{marginBottom:16}}>
            <p style={{fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".6px",margin:"0 0 10px"}}>Item Pesanan</p>
            {order.items.map((it,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<order.items.length-1?`1px solid ${C.border}`:"none"}}>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:C.dark,margin:"0 0 2px"}}>{it.name}</p>
                  <p style={{fontSize:11,color:C.muted,margin:0}}>x{it.qty} × {fmt(it.price)}</p>
                </div>
                <p style={{fontWeight:700,color:C.dark,margin:0,flexShrink:0}}>{fmt(it.qty*it.price)}</p>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",marginTop:12,paddingTop:12,borderTop:`2px solid ${C.border}`}}>
              <span style={{fontWeight:700,fontSize:14,color:C.dark}}>Total</span>
              <span style={{fontWeight:700,fontSize:16,color:C.primary}}>{fmt(order.total)}</span>
            </div>
          </div>
          <div>
            <p style={{fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".6px",margin:"0 0 10px"}}>Ubah Status</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {statusOpts.map(s=>(
                <button key={s} onClick={()=>onStatusChange(order.id,s)} style={{
                  padding:"6px 14px",borderRadius:20,
                  border:`1.5px solid ${order.status===s?C.primary:C.border}`,
                  background:order.status===s?C.primary:C.white,
                  color:order.status===s?C.white:C.mid,
                  fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:".15s"
                }}>
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}

function StatCard({ label, value, sub, color = C.primary }) {
  return (
    <div className="card" style={{padding:20}}>
      <p style={{fontSize:22,fontWeight:700,color,margin:"0 0 4px",fontFamily:"'Cormorant Garamond',serif"}}>{value}</p>
      <p style={{fontSize:12,fontWeight:600,color:C.dark,margin:"0 0 2px"}}>{label}</p>
      {sub && <p style={{fontSize:11,color:C.muted,margin:0}}>{sub}</p>}
    </div>
  );
}

function OrdersPanel({ orders, setOrders }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setSelectedOrder(prev => prev ? { ...prev, status } : prev);
  };

  const filterBtns = [["all","Semua"],["pending","Menunggu"],["processing","Diproses"],["shipped","Dikirim"],["delivered","Selesai"],["cancelled","Dibatalkan"]];

  return (
    <div style={{padding:24,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
        <div>
          <h2 className="section-title">Pesanan Masuk</h2>
          <p style={{color:C.muted,fontSize:12,marginTop:3}}>{orders.length} total pesanan</p>
        </div>
        <div style={{position:"relative"}}>
          <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:C.muted,pointerEvents:"none"}}><Icon.search/></span>
          <input className="form-input" placeholder="Cari ID atau nama..." value={search} onChange={e=>setSearch(e.target.value)} style={{width:240,paddingLeft:34}}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <StatCard label="Total Pendapatan" value={fmt(revenue)} sub="Pesanan selesai" color={C.primary}/>
        <StatCard label="Pesanan Baru" value={counts.pending} sub="Menunggu konfirmasi" color={C.warning}/>
        <StatCard label="Dalam Proses" value={counts.processing+counts.shipped} sub="Diproses & dikirim" color={C.info}/>
        <StatCard label="Pesanan Selesai" value={counts.delivered} sub="Berhasil terkirim" color={C.success}/>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {filterBtns.map(([k,v])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{
            padding:"6px 14px",borderRadius:20,
            border:`1.5px solid ${filter===k?C.primary:C.border}`,
            background:filter===k?C.primary:C.white,
            color:filter===k?C.white:C.mid,
            fontSize:12,fontWeight:600,cursor:"pointer",
            fontFamily:"'DM Sans',sans-serif",transition:".15s",
            display:"inline-flex",alignItems:"center",gap:5
          }}>
            {v}
            {counts[k]>0&&<span style={{background:filter===k?"rgba(255,255,255,.25)":"#F3F0EC",borderRadius:10,padding:"0 5px",fontSize:11}}>{counts[k]}</span>}
          </button>
        ))}
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Pesanan</th><th>Pelanggan</th><th>Produk</th>
              <th>Total</th><th>Tanggal</th><th>Status</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={7} style={{textAlign:"center",padding:48,color:C.muted}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.border} strokeWidth="1.5" style={{display:"block",margin:"0 auto 10px"}}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                Tidak ada pesanan
              </td></tr>
            )}
            {filtered.map(o=>(
              <tr key={o.id}>
                <td><span style={{fontWeight:700,color:C.primary,fontSize:12}}>#{o.id}</span></td>
                <td>
                  <p style={{fontWeight:600,color:C.dark,margin:"0 0 2px",fontSize:13}}>{o.customer}</p>
                  <p style={{fontSize:11,color:C.muted,margin:0}}>{o.phone}</p>
                </td>
                <td style={{fontSize:12,color:C.muted,maxWidth:180}}>{o.items.map(it=>`${it.name} (×${it.qty})`).join(", ")}</td>
                <td><span style={{fontWeight:700,color:C.dark}}>{fmt(o.total)}</span></td>
                <td style={{fontSize:11,color:C.muted,whiteSpace:"nowrap"}}>{o.date}</td>
                <td><StatusBadge status={o.status}/></td>
                <td><button className="btn-edit" onClick={()=>setSelectedOrder(o)}>Detail</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={()=>setSelectedOrder(null)} onStatusChange={changeStatus}/>
      )}
    </div>
  );
}

function ProductsPanel({ products, setProducts, categories }) {
  const [view, setView] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const imgRef = useRef();
  const emptyForm = { name:"", cat:categories[0]?.id||"", price:"", oldPrice:"", discount:"", rating:"4.9", sold:"" };
  const [form, setForm] = useState(emptyForm);

  const resetForm = () => { setForm(emptyForm); setPreviewImg(null); setEditTarget(null); };
  const openEdit = (p) => {
    setEditTarget(p);
    setForm({name:p.name,cat:p.cat,price:p.price,oldPrice:p.oldPrice||"",discount:p.discount||"",rating:p.rating,sold:p.sold});
    setPreviewImg(p.img); setView("edit");
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { alert("Nama dan harga wajib diisi!"); return; }
    const data = {
      name: form.name, cat: form.cat,
      price: Number(form.price),
      old_price: form.oldPrice ? Number(form.oldPrice) : null,
      discount: form.discount ? Number(form.discount) : null,
      img: previewImg, rating: Number(form.rating),
      sold: form.sold, seller: FIXED_SELLER
    };
    try {
      if (view === "add") {
        const res = await apiAddProduct(data);
        if (res.id) {
          setProducts(prev => [...prev, { ...data, id: res.id, oldPrice: data.old_price }]);
        }
      } else {
        await apiUpdateProduct(editTarget.id, data);
        setProducts(prev => prev.map(p =>
          p.id === editTarget.id ? { ...p, ...data, oldPrice: data.old_price } : p
        ));
      }
      setView("list"); resetForm();
    } catch {
      alert("Gagal menyimpan produk. Coba lagi.");
    }
  };

  if (view==="add" || view==="edit") {
    return (
      <div style={{flex:1,overflowY:"auto"}}>
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"16px 24px"}}>
          <h2 className="section-title">{view==="add"?"Tambah Produk Baru":"Edit Produk"}</h2>
          {view==="edit"&&<p style={{color:C.muted,fontSize:12,marginTop:3}}>{editTarget?.name}</p>}
        </div>
        <div style={{padding:28,maxWidth:900,margin:"0 auto"}}>
          <div style={{display:"grid",gridTemplateColumns:"200px 1fr",gap:28,alignItems:"start"}}>
            <div>
              <label className="form-label" style={{marginBottom:8,display:"block"}}>Foto Produk</label>
              <div onClick={()=>imgRef.current.click()} style={{aspectRatio:"1",borderRadius:12,border:`2px dashed ${C.border}`,background:C.surface,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden",transition:".15s"}}>
                {previewImg
                  ? <img src={previewImg} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>
                  : <><Icon.photo/><span style={{fontSize:11,color:C.muted,marginTop:10}}>Klik untuk upload</span></>
                }
              </div>
              <input ref={imgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setPreviewImg(URL.createObjectURL(f));}}/>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div className="form-group">
                <label className="form-label">Nama Produk *</label>
                <input className="form-input" placeholder="cth: Cincin Emas 18K Rose Gold" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div className="form-group">
                  <label className="form-label">Kategori</label>
                  <select className="form-input" value={form.cat} onChange={e=>setForm({...form,cat:e.target.value})}>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nama Toko</label>
                  <input className="form-input" value={FIXED_SELLER} readOnly style={{background:"#F7F5F2",color:C.muted,cursor:"not-allowed"}}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Jual (Rp) *</label>
                  <input className="form-input" type="number" placeholder="150000" value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Harga Asli (Rp)</label>
                  <input className="form-input" type="number" placeholder="200000" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Diskon (%)</label>
                  <input className="form-input" type="number" placeholder="20" value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})}/>
                </div>
                <div className="form-group">
                  <label className="form-label">Jumlah Terjual</label>
                  <input className="form-input" placeholder="100rb+" value={form.sold} onChange={e=>setForm({...form,sold:e.target.value})}/>
                </div>
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={()=>{setView("list");resetForm();}} className="btn-outline" style={{flex:"0 0 auto",padding:"11px 20px"}}>Batal</button>
                <button onClick={handleSave} className="btn-primary" style={{flex:1,justifyContent:"center",padding:11}}>
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
    <div style={{padding:24,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h2 className="section-title">Manajemen Produk</h2>
          <p style={{color:C.muted,fontSize:12,marginTop:3}}>{products.length} produk terdaftar</p>
        </div>
        <button onClick={()=>{resetForm();setView("add");}} className="btn-primary"><Icon.plus/> Tambah Produk</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <StatCard label="Total Produk" value={products.length} color={C.primary}/>
        <StatCard label="Ada Diskon" value={products.filter(p=>p.discount).length} color={C.danger}/>
        <StatCard label="Ada Foto" value={products.filter(p=>p.img).length} color={C.success}/>
        <StatCard label="Kategori" value={categories.length} color={C.info}/>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table className="data-table">
          <thead><tr><th style={{width:52}}>Foto</th><th>Nama Produk</th><th>Harga</th><th>Kategori</th><th>Rating</th><th>Aksi</th></tr></thead>
          <tbody>
            {products.length===0 && (
              <tr><td colSpan={6} style={{textAlign:"center",padding:48,color:C.muted}}>
                <p style={{marginTop:10,fontSize:13}}>Belum ada produk.</p>
              </td></tr>
            )}
            {products.map(p=>(
              <tr key={p.id}>
                <td>
                  <div style={{width:42,height:42,borderRadius:9,background:C.surface,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${C.border}`}}>
                    {p.img ? <img src={p.img} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : <span style={{color:C.border}}><Icon.photo/></span>}
                  </div>
                </td>
                <td>
                  <p style={{fontWeight:600,color:C.dark,margin:"0 0 3px",fontSize:13}}>{p.name}</p>
                  <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:11,color:C.success,fontWeight:600}}>
                    <Icon.verified/> {p.seller}
                  </span>
                </td>
                <td>
                  <p style={{fontWeight:700,color:C.primary,margin:"0 0 2px",fontSize:13}}>{fmt(p.price)}</p>
                  {p.discount && <span style={{fontSize:10.5,color:C.danger,background:C.dangerBg,padding:"1px 7px",borderRadius:4,fontWeight:700}}>−{p.discount}%</span>}
                </td>
                <td>
                  <span style={{background:C.goldLight,color:C.gold,padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700}}>
                    {categories.find(c=>c.id===p.cat)?.label||p.cat}
                  </span>
                </td>
                <td>
                  <span style={{display:"inline-flex",alignItems:"center",gap:4,fontWeight:600,fontSize:12,color:C.dark}}>
                    <Icon.star/> {p.rating}
                  </span>
                </td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openEdit(p)} className="btn-edit"><Icon.edit/> Edit</button>
                    <button onClick={()=>setDeleteTarget(p)} className="btn-danger"><Icon.trash/> Hapus</button>
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
          desc={`"${deleteTarget.name}" akan dihapus secara permanen.`}
          danger
          onConfirm={async () => {
            await apiDeleteProduct(deleteTarget.id);
            setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
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

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({label:cat.label, subsRaw:cat.subs.join(", ")});
    setErr(""); setView("edit");
  };

  const handleSave = async () => {
    const label = form.label.trim();
    if (!label) { setErr("Nama kategori wajib diisi."); return; }
    const id = label.toLowerCase().replace(/\s+/g, "-");
    if (view==="add" && categories.find(c=>c.id===id)) { setErr("Kategori dengan nama ini sudah ada."); return; }
    const subs = form.subsRaw.split(",").map(s=>s.trim()).filter(Boolean);
    try {
      if (view==="add") {
        const res = await apiAddCategory({ id, label, subs });
        setCategories(prev => [...prev, { id: res.id || id, label, subs }]);
      } else {
        await apiUpdateCategory(editTarget.id, { label, subs });
        setCategories(prev => prev.map(c => c.id===editTarget.id ? { ...c, label, subs } : c));
      }
      setView("list"); setErr("");
    } catch {
      setErr("Gagal menyimpan kategori. Coba lagi.");
    }
  };

  if (view !== "list") {
    return (
      <div style={{padding:24,maxWidth:580}}>
        <h2 className="section-title" style={{marginBottom:20}}>{view==="add"?"Tambah Kategori":"Edit Kategori"}</h2>
        {err && <div style={{background:C.dangerBg,border:`1px solid #FECACA`,borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:C.danger}}>{err}</div>}
        <div className="card" style={{padding:24}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div className="form-group">
              <label className="form-label">Nama Kategori *</label>
              <input className="form-input" placeholder="cth: Gelang" value={form.label} onChange={e=>setForm({...form,label:e.target.value})}/>
              <p style={{fontSize:11,color:C.muted,marginTop:4}}>ID: <strong>{form.label.toLowerCase().replace(/\s+/g,"-")||"—"}</strong></p>
            </div>
            <div className="form-group">
              <label className="form-label">Sub-Kategori (pisahkan koma)</label>
              <textarea className="form-input" placeholder="cth: Gelang Emas, Gelang Perak, Gelang Batu" value={form.subsRaw} onChange={e=>setForm({...form,subsRaw:e.target.value})}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{setView("list");setErr("");}} className="btn-outline" style={{flex:"0 0 auto",padding:"10px 20px"}}>Batal</button>
              <button onClick={handleSave} className="btn-primary" style={{flex:1,justifyContent:"center",padding:10}}>
                {view==="add"?"Simpan Kategori":"Update Kategori"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding:24,flex:1,overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <div>
          <h2 className="section-title">Manajemen Kategori</h2>
          <p style={{color:C.muted,fontSize:12,marginTop:3}}>{categories.length} kategori aktif</p>
        </div>
        <button onClick={()=>{setForm({label:"",subsRaw:""});setErr("");setView("add");}} className="btn-primary"><Icon.plus/> Tambah Kategori</button>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <table className="data-table">
          <thead><tr><th>Nama Kategori</th><th>ID</th><th>Sub-Kategori</th><th>Aksi</th></tr></thead>
          <tbody>
            {categories.length===0 && (
              <tr><td colSpan={4} style={{textAlign:"center",padding:48,color:C.muted}}>Belum ada kategori.</td></tr>
            )}
            {categories.map(cat=>(
              <tr key={cat.id}>
                <td style={{fontWeight:700,color:C.dark,fontSize:13}}>{cat.label}</td>
                <td><code style={{background:"#F3F0EC",color:C.muted,padding:"2px 8px",borderRadius:5,fontSize:11}}>{cat.id}</code></td>
                <td>
                  {cat.subs.length===0
                    ? <span style={{color:C.border,fontStyle:"italic",fontSize:12}}>Tidak ada</span>
                    : <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                        {cat.subs.map((s,j)=><span key={j} style={{background:C.goldLight,color:C.gold,padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:600}}>{s}</span>)}
                      </div>
                  }
                </td>
                <td>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>openEdit(cat)} className="btn-edit"><Icon.edit/> Edit</button>
                    <button onClick={()=>setDeleteTarget(cat)} className="btn-danger"><Icon.trash/> Hapus</button>
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
          onConfirm={async () => {
            await apiDeleteCategory(deleteTarget.id);
            setCategories(prev => prev.filter(c => c.id !== deleteTarget.id));
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
    const p=products.find(pr=>pr.name===it.name);
    const cat=p?categories.find(c=>c.id===p.cat)?.label||"Lainnya":"Lainnya";
    catRevenue[cat]=(catRevenue[cat]||0)+(it.price*it.qty);
  }));
  const catData = Object.entries(catRevenue).sort((a,b)=>b[1]-a[1]);
  const maxCat = catData[0]?catData[0][1]:1;

  const prodRevenue = {};
  delivered.forEach(o=>o.items.forEach(it=>{prodRevenue[it.name]=(prodRevenue[it.name]||0)+(it.price*it.qty);}));
  const topProds = Object.entries(prodRevenue).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const months = ["Okt","Nov","Des","Jan","Feb","Mar","Apr"];
  const monthlyRevenue = [1850000,2340000,3120000,2780000,3450000,2950000,totalRevenue||4200000];
  const maxMonth = Math.max(...monthlyRevenue);
  const catColors = [C.primary,"#7c3aed","#0891b2","#059669","#d97706","#dc2626"];

  return (
    <div style={{padding:24,flex:1,overflowY:"auto"}}>
      <div style={{marginBottom:20}}>
        <h2 className="section-title">Laporan Penjualan</h2>
        <p style={{color:C.muted,fontSize:12,marginTop:3}}>Ringkasan performa toko MeiHua Official</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        <StatCard label="Total Pendapatan" value={fmt(totalRevenue)} sub="Pesanan selesai" color={C.primary}/>
        <StatCard label="Total Pesanan" value={orders.length} sub="Semua status" color="#7c3aed"/>
        <StatCard label="Rata-rata Pesanan" value={fmt(avgOrder)} sub="Per transaksi" color={C.info}/>
        <StatCard label="Tingkat Selesai" value={`${conversionRate}%`} sub="dari total pesanan" color={C.success}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1.6fr 1fr",gap:16,marginBottom:16}}>
        <div className="card" style={{padding:20}}>
          <p style={{fontWeight:700,fontSize:14,color:C.dark,margin:"0 0 3px",fontFamily:"'Cormorant Garamond',serif"}}>Tren Pendapatan</p>
          <p style={{fontSize:12,color:C.muted,margin:"0 0 20px"}}>7 bulan terakhir</p>
          <div style={{display:"flex",alignItems:"flex-end",gap:8,height:160}}>
            {monthlyRevenue.map((val,i)=>{
              const h=Math.round((val/maxMonth)*130);
              const isLast=i===monthlyRevenue.length-1;
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  {isLast&&<p style={{fontSize:10,color:C.primary,fontWeight:700,margin:0,whiteSpace:"nowrap"}}>{fmt(val).replace("Rp ","Rp")}</p>}
                  {!isLast&&<p style={{fontSize:10,color:"transparent",margin:0}}>x</p>}
                  <div style={{width:"100%",height:`${h}px`,background:isLast?C.primary:"#F0EBE8",borderRadius:"6px 6px 0 0",transition:".3s"}}/>
                  <p style={{fontSize:11,color:isLast?C.primary:C.muted,margin:0,fontWeight:isLast?700:400}}>{months[i]}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card" style={{padding:20}}>
          <p style={{fontWeight:700,fontSize:14,color:C.dark,margin:"0 0 3px",fontFamily:"'Cormorant Garamond',serif"}}>Revenue per Kategori</p>
          <p style={{fontSize:12,color:C.muted,margin:"0 0 16px"}}>Pesanan selesai</p>
          {catData.length===0
            ? <p style={{color:C.muted,fontSize:13,textAlign:"center",padding:20}}>Belum ada data</p>
            : <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {catData.map(([cat,rev],i)=>(
                  <div key={cat}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontSize:12,fontWeight:600,color:C.dark}}>{cat}</span>
                      <span style={{fontSize:12,fontWeight:700,color:catColors[i%catColors.length]}}>{fmt(rev)}</span>
                    </div>
                    <div style={{height:6,background:"#F3F0EC",borderRadius:10,overflow:"hidden"}}>
                      <div style={{height:"100%",width:`${Math.round((rev/maxCat)*100)}%`,background:catColors[i%catColors.length],borderRadius:10}}/>
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
      <div className="card" style={{overflow:"hidden"}}>
        <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
          <p style={{fontWeight:700,fontSize:14,color:C.dark,margin:0,fontFamily:"'Cormorant Garamond',serif"}}>Produk Terlaris</p>
        </div>
        {topProds.length===0
          ? <p style={{color:C.muted,fontSize:13,textAlign:"center",padding:32}}>Belum ada data produk terlaris</p>
          : <table className="data-table">
              <thead><tr><th style={{width:40}}>#</th><th>Produk</th><th>Pendapatan</th><th>Porsi</th></tr></thead>
              <tbody>
                {topProds.map(([name,rev],i)=>(
                  <tr key={name}>
                    <td>
                      <span style={{width:26,height:26,borderRadius:"50%",background:i===0?C.goldLight:i===1?"#F3F4F6":"#F7F5F2",display:"inline-flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:i===0?C.gold:C.muted}}>{i+1}</span>
                    </td>
                    <td style={{fontWeight:600,color:C.dark,fontSize:13}}>{name}</td>
                    <td><span style={{fontWeight:700,color:C.primary}}>{fmt(rev)}</span></td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{flex:1,height:5,background:"#F3F0EC",borderRadius:10,overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${Math.round((rev/(topProds[0][1]||1))*100)}%`,background:C.primary,borderRadius:10}}/>
                        </div>
                        <span style={{fontSize:12,fontWeight:600,color:C.muted,minWidth:34}}>{Math.round((rev/(topProds[0][1]||1))*100)}%</span>
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
    {key:"dashboard",label:"Dashboard",icon:<Icon.dashboard/>},
    {key:"products",label:"Produk",icon:<Icon.product/>},
    {key:"orders",label:"Pesanan",icon:<Icon.order/>,badge:pendingCount||null},
    {key:"categories",label:"Kategori",icon:<Icon.category/>},
    {key:"reports",label:"Laporan",icon:<Icon.report/>},
  ];

  return (
    <div style={{height:"100vh",display:"flex",flexDirection:"column",background:C.surface,overflow:"hidden"}}>
      <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <LogoIcon size={34}/>
          <div>
            <p style={{margin:0,fontSize:15,fontWeight:700,color:C.dark,fontFamily:"'Cormorant Garamond',serif"}}>MeiHua Official</p>
            <p style={{margin:0,fontSize:11,color:C.muted}}>Admin Dashboard</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{textAlign:"right"}}>
            <p style={{margin:0,fontSize:13,fontWeight:600,color:C.dark}}>{user}</p>
            <p style={{margin:0,fontSize:11,color:C.muted}}>Administrator</p>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",background:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:C.gold,border:`1.5px solid ${C.border}`}}>
            {user?.charAt(0).toUpperCase()}
          </div>
          <button onClick={onClose} className="btn-outline" style={{fontSize:12}}>Lihat Toko</button>
        </div>
      </div>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div className="admin-sidebar">
          <div style={{padding:"16px 18px 8px"}}>
            <p style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".9px",margin:0}}>Navigasi</p>
          </div>
          {navItems.map(n=>(
            <div key={n.key} className={`admin-nav-item ${tab===n.key?"active":""}`} onClick={()=>setTab(n.key)}>
              {n.icon}{n.label}
              {n.badge && <span className="nav-badge">{n.badge}</span>}
            </div>
          ))}
          <div style={{marginTop:"auto",padding:"14px 18px",borderTop:`1px solid ${C.border}`}}>
            <p style={{fontSize:10.5,color:C.muted,margin:0}}>MeiHua v2.0 — Semester Genap 2025</p>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}>
          {tab==="dashboard" && (
            <div style={{padding:24}}>
              <h2 className="section-title" style={{marginBottom:4}}>Selamat datang, {user}</h2>
              <p style={{color:C.muted,fontSize:12,marginBottom:20}}>Ringkasan performa toko Anda hari ini</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
                <StatCard label="Total Produk" value={products.length} sub="Produk aktif" color={C.primary}/>
                <StatCard label="Pesanan Masuk" value={orders.length} sub="Semua status" color="#7c3aed"/>
                <StatCard label="Pesanan Selesai" value={deliveredCount} sub="Terkirim" color={C.success}/>
                <StatCard label="Total Pendapatan" value={fmt(totalRevenue)} sub="Dari pesanan selesai" color={C.gold}/>
              </div>
              <div className="card" style={{overflow:"hidden"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:`1px solid ${C.border}`}}>
                  <p style={{fontWeight:700,fontSize:14,color:C.dark,margin:0,fontFamily:"'Cormorant Garamond',serif"}}>Pesanan Terbaru</p>
                  <button onClick={()=>setTab("orders")} style={{fontSize:12,color:C.primary,fontWeight:600,background:"none",border:"none",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>Lihat semua</button>
                </div>
                <table className="data-table">
                  <thead><tr><th>ID</th><th>Pelanggan</th><th>Total</th><th>Status</th></tr></thead>
                  <tbody>
                    {orders.slice(0,5).map(o=>(
                      <tr key={o.id}>
                        <td style={{fontWeight:700,color:C.primary,fontSize:12}}>#{o.id}</td>
                        <td style={{fontWeight:600,color:C.dark,fontSize:13}}>{o.customer}</td>
                        <td style={{fontWeight:700,color:C.dark}}>{fmt(o.total)}</td>
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
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 24px",background:C.white,borderBottom:`1px solid ${C.border}`,position:"sticky",top:0,zIndex:100,flexShrink:0}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <LogoIcon size={32}/>
        <div>
          <span style={{fontSize:17,fontWeight:700,color:C.dark,fontFamily:"'Cormorant Garamond',serif",letterSpacing:".3px"}}>
            MeiHua <span style={{color:C.primary}}>Official</span>
          </span>
          <p style={{margin:0,fontSize:10,color:C.gold,fontWeight:600,letterSpacing:"1px",textTransform:"uppercase"}}>Fine Jewelry</p>
        </div>
      </div>
      <div style={{position:"relative",width:"38%"}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted,pointerEvents:"none"}}><Icon.search/></span>
        <input placeholder="Cari produk perhiasan..." style={{width:"100%",padding:"9px 16px 9px 36px",borderRadius:24,border:`1.5px solid ${C.border}`,fontSize:13,outline:"none",fontFamily:"'DM Sans',sans-serif",background:C.surface,color:C.dark,transition:".15s"}}
          onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border}
        />
      </div>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <button onClick={openCart} style={{position:"relative",background:"none",border:"none",cursor:"pointer",padding:"8px",display:"flex",alignItems:"center",color:C.mid}}>
          <Icon.cart/>
          {cartCount>0 && <span style={{position:"absolute",top:0,right:0,background:C.primary,color:C.white,borderRadius:"50%",width:18,height:18,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>{cartCount}</span>}
        </button>
        {!user ? (
          <>
            <button className="btn-outline" onClick={()=>openAuth("login")}>Masuk</button>
            <button className="btn-primary" onClick={()=>openAuth("register")}>Daftar</button>
          </>
        ) : (
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:C.goldLight,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:C.gold,border:`1.5px solid ${C.border}`}}>
              {user.charAt(0).toUpperCase()}
            </div>
            <span style={{fontSize:13,fontWeight:600,color:C.dark}}>{user}</span>
            <button onClick={openAdmin} style={{background:C.goldLight,color:C.gold,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>Admin</button>
            <button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,fontSize:12,cursor:"pointer",padding:"6px 8px",fontFamily:"'DM Sans',sans-serif",display:"flex",alignItems:"center",gap:4}}>
              <Icon.logout/>Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGrid({ products, cart, addToCart, removeFromCart }) {
  if (products.length===0) return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:300,color:C.muted,gap:10}}>
      <Icon.search/>
      <p style={{fontSize:14,fontWeight:600,marginTop:8}}>Produk tidak ditemukan</p>
    </div>
  );
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(162px,1fr))",gap:14,alignItems:"stretch"}}>
      {products.map(p=>{
        const item = cart.find(i=>i.id===p.id);
        return (
          <div key={p.id} className="product-card">
            <div style={{height:160,position:"relative",overflow:"hidden",background:C.surface,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {p.discount && <div style={{position:"absolute",top:8,left:8,background:C.primary,color:C.white,fontSize:11,padding:"3px 8px",borderRadius:5,fontWeight:700,zIndex:1}}>−{p.discount}%</div>}
              {p.img
                ? <img src={p.img} alt="produk" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                : <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,color:C.border}}>
                    <Icon.photo/>
                    <p style={{fontSize:11,color:C.muted,margin:0}}>Belum ada foto</p>
                  </div>
              }
            </div>
            <div style={{padding:"12px 12px 14px",display:"flex",flexDirection:"column",flex:1}}>
              <p style={{fontSize:12.5,margin:"0 0 6px",color:C.dark,lineHeight:1.4,height:36,overflow:"hidden",fontWeight:500}}>{p.name}</p>
              <p style={{color:C.primary,fontWeight:700,fontSize:14,margin:"0 0 2px"}}>{fmt(p.price)}</p>
              <div style={{height:17,marginBottom:5}}>
                {p.oldPrice && <span className="old-price">{fmt(p.oldPrice)}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
                <Icon.star/>
                <span style={{fontSize:11,color:C.muted}}>{p.rating} · {p.sold} terjual</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:10}}>
                <Icon.verified/>
                <span style={{fontSize:11,color:C.success,fontWeight:600}}>{p.seller}</span>
              </div>
              <div style={{marginTop:"auto"}}>
                {item ? (
                  <div className="qty-control">
                    <button className="qty-btn" onClick={()=>removeFromCart(p.id)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={()=>addToCart(p)}>+</button>
                  </div>
                ) : (
                  <button onClick={()=>addToCart(p)} style={{width:"100%",padding:"8px",background:C.primary,color:C.white,border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:12,fontFamily:"'DM Sans',sans-serif",transition:".15s"}}>
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
      <div onClick={close} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.3)",zIndex:998}}/>
      <div style={{position:"fixed",top:0,right:0,width:360,height:"100vh",background:C.white,boxShadow:"-4px 0 28px rgba(0,0,0,.1)",zIndex:999,display:"flex",flexDirection:"column"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px",borderBottom:`1px solid ${C.border}`}}>
          <h3 style={{margin:0,fontSize:16,fontWeight:700,color:C.dark,fontFamily:"'Cormorant Garamond',serif"}}>Keranjang Belanja</h3>
          <button onClick={close} style={{border:"none",background:"#F5F3F0",borderRadius:7,width:30,height:30,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.mid}}>
            <Icon.close/>
          </button>
        </div>
        {cart.length===0 ? (
          <div style={{textAlign:"center",marginTop:80,color:C.muted,padding:20}}>
            <Icon.cart/>
            <p style={{fontSize:14,marginTop:14,fontWeight:600}}>Keranjang masih kosong</p>
            <p style={{fontSize:12,color:C.muted,marginTop:4}}>Tambahkan produk perhiasan pilihan Anda</p>
          </div>
        ) : (
          <>
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px"}}>
              {cart.map(item=>(
                <div key={item.id} style={{display:"flex",justifyContent:"space-between",marginBottom:14,paddingBottom:14,borderBottom:`1px solid ${C.border}`,gap:10}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:13,fontWeight:600,color:C.dark,margin:"0 0 4px"}}>{item.name}</p>
                    <p style={{fontSize:12,color:C.muted,margin:0}}>{item.qty} × {fmt(item.price)}</p>
                  </div>
                  <button onClick={()=>remove(item.id)} style={{background:C.dangerBg,border:"none",color:C.danger,cursor:"pointer",fontSize:12,borderRadius:6,padding:"4px 10px",fontWeight:600,flexShrink:0,fontFamily:"'DM Sans',sans-serif"}}>Hapus</button>
                </div>
              ))}
            </div>
            <div style={{padding:"16px 20px",borderTop:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
                <span style={{fontWeight:600,color:C.mid}}>Total</span>
                <span style={{fontWeight:700,fontSize:17,color:C.primary}}>{fmt(total)}</span>
              </div>
              <button className="btn-primary" style={{width:"100%",justifyContent:"center",padding:12,fontSize:13,borderRadius:9}}>
                Checkout Sekarang
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function AuthModal({ close, setUser, mode, onLogin }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await apiLogin(email, password);
      } else {
        if (!name.trim()) { setErr("Nama tidak boleh kosong."); setLoading(false); return; }
        res = await apiRegister(name.trim(), email, password);
      }

      if (res && res.token) {
        localStorage.setItem('meihua_token', res.token);

        const userName =
          (typeof res.user === 'object' ? res.user?.name : res.user) ||
          email.split('@')[0];
        const userRole =
          (typeof res.user === 'object' ? res.user?.role : 'user') || 'user';

        localStorage.setItem('meihua_role', userRole);
        localStorage.setItem('meihua_name', userName);

        setUser(userName);
        onLogin();
        close();
      } else {
        setErr(res?.message || 'Terjadi kesalahan. Cek console untuk detail.');
      }
    } catch (error) {
      console.error('[AuthModal] Unexpected error:', error);
      setErr('Tidak dapat terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={close}>
      <div style={{background:C.white,padding:"36px 32px",borderRadius:18,width:380,boxShadow:"0 24px 64px rgba(0,0,0,.18)"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <LogoIcon size={44}/>
          <h2 style={{margin:"14px 0 4px",fontSize:22,color:C.dark,fontWeight:700,fontFamily:"'Cormorant Garamond',serif"}}>
            {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
          </h2>
          <p style={{margin:0,fontSize:12,color:C.muted}}>MeiHua Official — Fine Jewelry</p>
        </div>
        {err && (
          <div style={{background:C.dangerBg,border:`1px solid #FECACA`,borderRadius:9,padding:"10px 14px",marginBottom:14,fontSize:13,color:C.danger}}>
            {err}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:12}}>
          {!isLogin && (
            <input className="form-input" placeholder="Nama lengkap" value={name}
              onChange={e=>setName(e.target.value)} required disabled={loading}/>
          )}
          <input className="form-input" placeholder="Alamat email" type="email"
            value={email} onChange={e=>setEmail(e.target.value)} required disabled={loading}/>
          <input className="form-input" placeholder="Password" type="password"
            value={password} onChange={e=>setPassword(e.target.value)} required disabled={loading}/>
          <button type="submit" className="btn-primary"
            disabled={loading}
            style={{justifyContent:"center",padding:12,fontSize:13,borderRadius:9,marginTop:4,opacity:loading?0.7:1}}>
            {loading ? "Memproses..." : (isLogin ? "Masuk ke Akun" : "Daftar Sekarang")}
          </button>
        </form>
        <div style={{height:1,background:C.border,margin:"18px 0"}}/>
        <p style={{textAlign:"center",fontSize:13,color:C.muted,margin:0}}>
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <span style={{color:C.primary,cursor:"pointer",fontWeight:700}}
            onClick={()=>{setIsLogin(!isLogin);setErr("");}}>
            {isLogin ? "Daftar gratis" : "Masuk"}
          </span>
        </p>
      </div>
    </ModalOverlay>
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const token = localStorage.getItem('meihua_token');
    const savedName = localStorage.getItem('meihua_name');
    if (token && savedName) {
      setUser(savedName);
    }

    async function fetchPublicData() {
      setLoading(true);
      try {
        const [prods, cats] = await Promise.all([
          apiGetProducts(),
          apiGetCategories(),
        ]);
        setProducts(Array.isArray(prods) ? prods : []);
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err) {
        console.error('[App] fetchPublicData unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicData();
  }, []); 

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('meihua_token');
    if (!token) return; 

    apiGetOrders()
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(err => console.error('[App] fetchOrders error:', err));
  }, [user]); 

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(i=>i.id===product.id);
      if (exist) return prev.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i);
      return [...prev, {...product,qty:1}];
    });
  };
  const removeFromCart = (id) => setCart(prev => prev.map(i=>i.id===id?{...i,qty:i.qty-1}:i).filter(i=>i.qty>0));

  const filteredProducts = activeCategory ? products.filter(p=>p.cat===activeCategory.id) : products;
  const activeCatData = categories.find(c=>c.id===activeCategory?.id);

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:C.surface}}>
      <div style={{textAlign:"center"}}>
        <LogoIcon size={48}/>
        <p style={{marginTop:16,color:C.muted,fontSize:13,fontFamily:"'DM Sans',sans-serif"}}>Memuat data...</p>
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
          onLogout={()=>setShowLogoutConfirm(true)}
        />
      )}

      {user && adminMode ? (
        <AdminPanel
          products={products} setProducts={setProducts}
          categories={categories} setCategories={setCategories}
          orders={orders} setOrders={setOrders}
          user={user} onClose={()=>setAdminMode(false)}
        />
      ) : (
        <div style={{display:"flex",height:"calc(100vh - 57px)",overflow:"hidden"}}>
          <div className="store-sidebar">
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

          <div className={`submenu ${activeCategory?"open":""}`}>
            {activeCatData && (
              <div className="submenu-inner">
                <div className="submenu-title">{activeCatData.label}</div>
                {activeCatData.subs.map((sub,i)=>(
                  <div key={i} className={`sub-item ${activeSub===i?"active":""}`} onClick={()=>setActiveSub(activeSub===i?null:i)}>{sub}</div>
                ))}
              </div>
            )}
          </div>

          <div style={{flex:1,overflowY:"auto",padding:18}}>
            <div style={{fontSize:11.5,color:C.muted,marginBottom:12,display:"flex",alignItems:"center",gap:5}}>
              <span style={{cursor:"pointer",color:!activeCategory?C.primary:C.muted,fontWeight:600}} onClick={()=>{setActiveCategory(null);setActiveSub(null);}}>Semua Produk</span>
              {activeCategory && <><span style={{color:C.border}}><Icon.chevron/></span><span style={{color:activeSub===null?C.primary:C.muted,cursor:"pointer",fontWeight:600}} onClick={()=>setActiveSub(null)}>{activeCategory.label}</span></>}
              {activeSub!==null && activeCatData && <><span style={{color:C.border}}><Icon.chevron/></span><span style={{color:C.primary,fontWeight:600}}>{activeCatData.subs[activeSub]}</span></>}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{margin:0,fontSize:16,fontWeight:700,color:C.dark,fontFamily:"'Cormorant Garamond',serif"}}>{activeCategory?activeCategory.label:"Semua Produk"}</h2>
              <span style={{fontSize:12,color:C.muted}}>{filteredProducts.length} produk</span>
            </div>
            <ProductGrid products={filteredProducts} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart}/>
          </div>
        </div>
      )}

      {showCart && <CartPopup cart={cart} close={()=>setShowCart(false)} remove={removeFromCart}/>}
      {showAuth && <AuthModal mode={showAuth} close={()=>setShowAuth(null)} setUser={setUser} onLogin={()=>setAdminMode(true)}/>}
      {showLogoutConfirm && (
        <ConfirmModal
          title="Yakin ingin keluar?"
          desc="Anda akan keluar dari sesi ini."
          onConfirm={()=>{
            localStorage.removeItem('meihua_token');
            localStorage.removeItem('meihua_role');
            localStorage.removeItem('meihua_name');
            setUser(null);
            setAdminMode(false);
            setShowLogoutConfirm(false);
          }}
          onCancel={()=>setShowLogoutConfirm(false)}
        />
      )}
    </>
  );
}