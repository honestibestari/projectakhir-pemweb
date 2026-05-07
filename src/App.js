import React, { useState } from "react";

const FIXED_SELLER = "MeiHua Official";

const GlobalStyles = () => (
  <style>{`
    body {
      margin:0;
      font-family:Arial, sans-serif;
      background:#f5f5f5;
    }
    .btn-primary{
      background:#e91e8c;
      color:white;
      padding:8px 16px;
      border:none;
      border-radius:20px;
      cursor:pointer;
      font-weight:bold;
    }
    .btn-ghost{
      background:white;
      border:1px solid #ccc;
      padding:8px 16px;
      border-radius:20px;
      cursor:pointer;
    }
    .product-card{
      background:white;
      border-radius:8px;
      overflow:hidden;
      box-shadow:0 1px 4px rgba(0,0,0,0.08);
      transition:0.2s;
      cursor:pointer;
      display:flex;
      flex-direction:column;
    }
    .product-card:hover{
      box-shadow:0 4px 12px rgba(0,0,0,0.15);
      transform:translateY(-2px);
    }
    .product-img{
      height:160px;
      display:flex;
      align-items:center;
      justify-content:center;
      position:relative;
      overflow:hidden;
      background:#f3eaf0;
      flex-shrink:0;
    }
    .product-img img{
      width:100%;
      height:100%;
      object-fit:cover;
      display:block;
    }
    .product-img .placeholder{
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:6px;
      color:#bbb;
      font-size:12px;
      width:100%;
      height:100%;
    }
    .product-img .placeholder span{ font-size:36px; }
    .badge{
      position:absolute;
      top:6px; left:6px;
      background:#ff4d4f;
      color:white;
      font-size:11px;
      padding:2px 6px;
      border-radius:4px;
      font-weight:bold;
      z-index:1;
    }
    .old-price{
      text-decoration:line-through;
      color:#999;
      font-size:11px;
    }
    .btn-cart{
      width:100%;
      padding:7px;
      background:linear-gradient(90deg,#ff4d8d,#e91e8c);
      color:white;
      border:none;
      border-radius:6px;
      font-weight:bold;
      cursor:pointer;
      font-size:12px;
    }
    .qty-control{
      display:flex;
      align-items:center;
      border:1px solid #ccc;
      border-radius:6px;
      overflow:hidden;
      height:32px;
    }
    .qty-btn{
      width:36px;
      height:100%;
      background:white;
      border:none;
      font-size:16px;
      color:#333;
      cursor:pointer;
      font-weight:bold;
      flex-shrink:0;
    }
    .qty-btn:first-child{ border-right:1px solid #ccc; }
    .qty-btn:last-child{ border-left:1px solid #ccc; }
    .qty-num{
      flex:1;
      text-align:center;
      font-weight:bold;
      font-size:13px;
      color:#333;
    }
    .seller-badge{
      display:inline-flex;
      align-items:center;
      gap:3px;
      font-size:10px;
      color:#03ac0e;
      font-weight:600;
    }
    .sidebar{
      width:110px;
      background:white;
      border-right:1px solid #eee;
      display:flex;
      flex-direction:column;
      padding:8px 0;
      flex-shrink:0;
      overflow-y:auto;
    }
    .cat-item{
      display:flex;
      align-items:center;
      padding:11px 14px;
      cursor:pointer;
      font-size:12px;
      color:#555;
      border-left:3px solid transparent;
      transition:0.15s;
      line-height:1.3;
    }
    .cat-item:hover{ background:#fff0f7; color:#e91e8c; }
    .cat-item.active{
      border-left:3px solid #e91e8c;
      background:#fff0f7;
      color:#e91e8c;
      font-weight:bold;
    }
    .submenu{
      width:0;
      overflow:hidden;
      background:#fafafa;
      border-right:1px solid #eee;
      transition:width 0.25s ease;
      flex-shrink:0;
    }
    .submenu.open{ width:140px; }
    .submenu-inner{ width:140px; padding:8px 0; }
    .submenu-title{
      font-size:11px;
      font-weight:bold;
      color:#e91e8c;
      padding:8px 14px 6px;
      border-bottom:1px solid #f0e0e8;
      margin-bottom:4px;
      text-transform:uppercase;
      letter-spacing:0.5px;
    }
    .sub-item{
      display:flex;
      align-items:center;
      padding:9px 14px;
      font-size:12px;
      color:#444;
      cursor:pointer;
      transition:0.15s;
      border-left:3px solid transparent;
    }
    .sub-item:hover{ background:#fff0f7; color:#e91e8c; }
    .sub-item.active{
      background:#fff0f7;
      color:#e91e8c;
      font-weight:bold;
      border-left:3px solid #e91e8c;
    }
    .admin-row:hover{ background:#fafafa; }
  `}</style>
);

const categories = [
  { id:"cincin",  label:"Cincin",        subs:["Cincin Emas","Cincin Berlian","Cincin Perak","Cincin Couple","Cincin Tunangan"] },
  { id:"kalung",  label:"Kalung",        subs:["Kalung Emas","Kalung Perak","Kalung Mutiara","Kalung Choker","Kalung Liontin"] },
  { id:"gelang",  label:"Gelang",        subs:["Gelang Emas","Gelang Perak","Gelang Batu","Gelang Charm","Gelang Couple"] },
  { id:"anting",  label:"Anting",        subs:["Anting Gantung","Anting Stud","Anting Hoop","Anting Klip","Anting Permata"] },
  { id:"bros",    label:"Bros",          subs:["Bros Bunga","Bros Hewan","Bros Enamel","Bros Vintage","Bros Kristal"] },
  { id:"set",     label:"Set Perhiasan", subs:["Set Pernikahan","Set Hadiah","Set Pengantin","Set Couple","Set Premium"] },
];

const initialProducts = [
  { id:1,  cat:"cincin", name:"Cincin Emas 18K Rose Gold",     price:720000,  oldPrice:850000,  discount:15,   img:null, rating:4.9, sold:"100rb+", seller:FIXED_SELLER },
  { id:2,  cat:"kalung", name:"Kalung Mutiara Putih Elegan",   price:325000,  oldPrice:null,    discount:null, img:null, rating:4.8, sold:"50rb+",  seller:FIXED_SELLER },
  { id:3,  cat:"anting", name:"Anting Berlian Swarovski",      price:256000,  oldPrice:320000,  discount:20,   img:null, rating:5.0, sold:"500rb+", seller:FIXED_SELLER },
  { id:4,  cat:"gelang", name:"Gelang Charm Silver 925",       price:185000,  oldPrice:null,    discount:null, img:null, rating:4.7, sold:"200rb+", seller:FIXED_SELLER },
  { id:5,  cat:"bros",   name:"Bros Bunga Kristal Ungu",       price:89000,   oldPrice:110000,  discount:19,   img:null, rating:4.9, sold:"30rb+",  seller:FIXED_SELLER },
  { id:6,  cat:"set",    name:"Set Perhiasan Couple Emas",     price:1250000, oldPrice:1500000, discount:17,   img:null, rating:4.8, sold:"10rb+",  seller:FIXED_SELLER },
  { id:7,  cat:"cincin", name:"Cincin Perak Ukir Bunga",       price:145000,  oldPrice:null,    discount:null, img:null, rating:4.6, sold:"80rb+",  seller:FIXED_SELLER },
  { id:8,  cat:"kalung", name:"Kalung Liontin Bintang Emas",   price:380000,  oldPrice:420000,  discount:10,   img:null, rating:4.9, sold:"150rb+", seller:FIXED_SELLER },
  { id:9,  cat:"anting", name:"Anting Hoop Gold Filled",       price:175000,  oldPrice:null,    discount:null, img:null, rating:4.7, sold:"60rb+",  seller:FIXED_SELLER },
  { id:10, cat:"gelang", name:"Gelang Batu Opal Warna-warni",  price:220000,  oldPrice:260000,  discount:15,   img:null, rating:4.8, sold:"40rb+",  seller:FIXED_SELLER },
  { id:11, cat:"bros",   name:"Bros Vintage Kelopak Enamel",   price:65000,   oldPrice:null,    discount:null, img:null, rating:4.5, sold:"25rb+",  seller:FIXED_SELLER },
  { id:12, cat:"set",    name:"Set Pengantin Emas Putih",      price:2800000, oldPrice:3200000, discount:13,   img:null, rating:5.0, sold:"5rb+",   seller:FIXED_SELLER },
];

function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", top:0, left:0,
      width:"100%", height:"100%",
      background:"rgba(0,0,0,0.45)",
      display:"flex", justifyContent:"center", alignItems:"center",
      zIndex:1000
    }}>
      <div style={{
        background:"white", borderRadius:16,
        padding:"32px 28px", width:320,
        textAlign:"center",
        boxShadow:"0 8px 32px rgba(0,0,0,0.18)"
      }}>
        <h3 style={{ margin:"0 0 8px", fontSize:17, color:"#1a1a1a" }}>
          Yakin ingin keluar?
        </h3>
        <p style={{ margin:"0 0 24px", fontSize:13, color:"#888", lineHeight:1.5 }}>
          Kamu akan keluar dari akun MeiHua Official.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={onCancel}
            style={{
              flex:1, padding:"11px",
              borderRadius:10, border:"1px solid #ddd",
              background:"white", color:"#555",
              fontSize:14, fontWeight:"bold",
              cursor:"pointer"
            }}
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:1, padding:"11px",
              borderRadius:10, border:"none",
              background:"#e91e8c", color:"white",
              fontSize:14, fontWeight:"bold",
              cursor:"pointer",
              boxShadow:"0 2px 8px rgba(233,30,140,0.3)"
            }}
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ productName, onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", top:0, left:0,
      width:"100%", height:"100%",
      background:"rgba(0,0,0,0.45)",
      display:"flex", justifyContent:"center", alignItems:"center",
      zIndex:1000
    }}>
      <div style={{
        background:"white", borderRadius:16,
        padding:"32px 28px", width:320,
        textAlign:"center",
        boxShadow:"0 8px 32px rgba(0,0,0,0.18)"
      }}>
        <h3 style={{ margin:"0 0 8px", fontSize:17, color:"#1a1a1a" }}>
          Yakin ingin menghapus?
        </h3>
        <p style={{ margin:"0 0 24px", fontSize:13, color:"#888", lineHeight:1.5 }}>
          Produk <strong style={{ color:"#333" }}>{productName}</strong> akan dihapus secara permanen.
        </p>
        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={onCancel}
            style={{
              flex:1, padding:"11px",
              borderRadius:10, border:"1px solid #ddd",
              background:"white", color:"#555",
              fontSize:14, fontWeight:"bold",
              cursor:"pointer"
            }}
          >
            Tidak
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex:1, padding:"11px",
              borderRadius:10, border:"none",
              background:"#ff4d4f", color:"white",
              fontSize:14, fontWeight:"bold",
              cursor:"pointer",
              boxShadow:"0 2px 8px rgba(255,77,79,0.3)"
            }}
          >
            Ya
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPanel({ products, setProducts, user, onClose }) {
  const [tab, setTab] = useState("list");
  const [editTarget, setEditTarget] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const imgInputRef = React.useRef();
  const [form, setForm] = useState({
    name:"", cat:"cincin", price:"", oldPrice:"",
    discount:"", rating:"4.9", sold:""
  });

  const [deleteTarget, setDeleteTarget] = useState(null);

  const inputS = {
    width:"100%", 
    padding:"10px 14px", 
    borderRadius:8,
    border:"1px solid #e0e0e0", 
    fontSize:13,
    boxSizing:"border-box", 
    display:"block", 
    outline:"none",
  };
  const labelS = {
    fontSize:12, color:"#666",
    fontWeight:"600", marginBottom:5, display:"block"
  };

  const resetForm = () => {
    setForm({ name:"", cat:"cincin", price:"", oldPrice:"", discount:"", rating:"4.9", sold:"" });
    setPreviewImg(null);
    setEditTarget(null);
  };

  const openEdit = (p) => {
    setEditTarget(p);
    setForm({
      name:p.name, cat:p.cat,
      price:p.price, oldPrice:p.oldPrice || "",
      discount:p.discount || "",
      rating:p.rating, sold:p.sold
    });
    setPreviewImg(p.img);
    setTab("edit");
  };

  const handleDelete = (p) => {
    setDeleteTarget(p);
  };

  const confirmDelete = () => {
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const handleSave = () => {
    if (!form.name || !form.price) {
      alert("Nama dan harga wajib diisi!"); return;
    }
    if (tab === "add") {
      setProducts(prev => [...prev, {
        id: Date.now(),
        cat: form.cat, name: form.name,
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        discount: form.discount ? Number(form.discount) : null,
        img: previewImg,
        rating: Number(form.rating),
        sold: form.sold, seller: FIXED_SELLER
      }]);
    } else {
      setProducts(prev => prev.map(p =>
        p.id === editTarget.id ? {
          ...p, name:form.name, cat:form.cat,
          price:Number(form.price),
          oldPrice:form.oldPrice ? Number(form.oldPrice) : null,
          discount:form.discount ? Number(form.discount) : null,
          img:previewImg, rating:Number(form.rating),
          sold:form.sold, seller: FIXED_SELLER
        } : p
      ));
    }
    setTab("list"); resetForm();
  };

  const Field = ({ label, children }) => (
    <div style={{ marginBottom:14 }}>
      <label style={labelS}>{label}</label>
      {children}
    </div>
  );

  if (tab === "add" || tab === "edit") {
    return (
      <div style={{
        position:"fixed", top:0, left:0,
        width:"100%", height:"100%",
        background:"#f4f6f8", zIndex:200,
        display:"flex", flexDirection:"column", overflow:"hidden"
      }}>
        <div style={{
          background:"white", borderBottom:"1px solid #eee",
          padding:"14px 28px",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          flexShrink:0
        }}>
          <div>
            <h2 style={{ margin:0, fontSize:18, color:"#1a1a1a", fontWeight:700 }}>
              {tab === "add" ? "Tambah Produk Baru" : "Edit Produk"}
            </h2>
            <p style={{ margin:"2px 0 0", fontSize:12, color:"#aaa" }}>
              {tab === "edit" && editTarget?.name}
            </p>
          </div>
          <button
            onClick={() => { setTab("list"); resetForm(); }}
            style={{
              background:"white", border:"1px solid #ddd",
              borderRadius:8, padding:"9px 20px",
              fontSize:13, cursor:"pointer", color:"#555"
            }}
          >
            Batal
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"28px", display:"flex", justifyContent:"center" }}>
          <div style={{ width:"100%", maxWidth:900 }}>
            <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:28, alignItems:"start" }}>

              <div>
                <label style={labelS}>Foto Produk</label>
                <div
                  onClick={() => imgInputRef.current.click()}
                  style={{
                    width:"100%", aspectRatio:"1",
                    borderRadius:12, border:"2px dashed #e0e0e0",
                    background:"#fafafa",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center",
                    cursor:"pointer", overflow:"hidden"
                  }}
                >
                  {previewImg
                    ? <img src={previewImg} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                    : <>
                        <span style={{ fontSize:36, color:"#ccc" }}>📷</span>
                        <span style={{ fontSize:12, color:"#bbb", marginTop:8 }}>Klik untuk upload</span>
                      </>
                  }
                </div>
                <input
                  ref={imgInputRef} type="file" accept="image/*"
                  style={{ display:"none" }}
                  onChange={e => {
                    const f = e.target.files[0];
                    if (f) setPreviewImg(URL.createObjectURL(f));
                  }}
                />
              </div>

              <div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  <div style={{ gridColumn:"1/-1" }}>
                    <Field label="Nama Produk *">
                      <input style={inputS} placeholder="cth: Cincin Emas 18K Rose Gold"
                        value={form.name}
                        onChange={e => setForm({ ...form, name:e.target.value })} />
                    </Field>
                  </div>
                  <Field label="Kategori">
                    <div style={{ position:"relative" }}>
                      <select
                        style={{
                          ...inputS,
                          appearance:"none",
                          WebkitAppearance:"none",
                          MozAppearance:"none",
                          paddingRight:28,
                          cursor:"pointer",
                          background:"white",
                        }}
                        value={form.cat}
                        onChange={e => setForm({ ...form, cat:e.target.value })}
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.label}</option>
                        ))}
                      </select>
                      <span style={{
                        position:"absolute",
                        right:10,
                        top:"50%",
                        transform:"translateY(-50%)",
                        pointerEvents:"none",
                        color:"#aaa",
                        fontSize:12,
                        lineHeight:1,
                      }}>▾</span>
                    </div>
                  </Field>

                  <Field label="Nama Toko">
                    <div style={{ position:"relative" }}>
                      <input
                        value={FIXED_SELLER}
                        readOnly
                        tabIndex={-1}
                        style={{
                          ...inputS,
                          background:"#f5f5f5",
                          color:"#888",
                          cursor:"not-allowed",
                          border:"1px solid #e8e8e8"
                        }}
                      />
                    </div>
                  </Field>

                  <Field label="Harga Jual *">
                    <input style={inputS} type="number" placeholder="cth: 150000"
                      value={form.price}
                      onChange={e => setForm({ ...form, price:e.target.value })} />
                  </Field>
                  <Field label="Harga Asli (opsional)">
                    <input style={inputS} type="number" placeholder="cth: 200000"
                      value={form.oldPrice}
                      onChange={e => setForm({ ...form, oldPrice:e.target.value })} />
                  </Field>
                  <Field label="Diskon % (opsional)">
                    <input style={inputS} type="number" placeholder="cth: 20"
                      value={form.discount}
                      onChange={e => setForm({ ...form, discount:e.target.value })} />
                  </Field>
                </div>

                <button onClick={handleSave} style={{
                  marginTop:8, width:"100%", padding:14,
                  background:"#e91e8c", color:"white",
                  border:"none", borderRadius:10,
                  fontWeight:"bold", fontSize:15, cursor:"pointer",
                  boxShadow:"0 2px 8px rgba(233,30,140,0.3)"
                }}>
                  {tab === "add" ? "Simpan Produk" : "Update Produk"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", overflow:"hidden" }}>
      <div style={{
        background:"white", borderBottom:"1px solid #eee",
        padding:"14px 20px",
        display:"flex", justifyContent:"space-between", alignItems:"center",
        flexShrink:0
      }}>
        <div>
          <h2 style={{ margin:0, fontSize:18, color:"#1a1a1a", fontWeight:700 }}>Admin</h2>
          <p style={{ margin:"3px 0 0", fontSize:12, color:"#888" }}>
            Selamat datang, <strong>{user}</strong>
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => { resetForm(); setTab("add"); }} style={{
            background:"#e91e8c", color:"white",
            border:"none", borderRadius:8,
            padding:"9px 18px", fontSize:13,
            cursor:"pointer", fontWeight:"bold",
            boxShadow:"0 2px 8px rgba(233,30,140,0.3)"
          }}>
            + Tambah Produk
          </button>
          <button onClick={onClose} style={{
            display:"flex", alignItems:"center", gap:6,
            background:"#fff0f7", color:"#e91e8c",
            border:"1px solid #f9a8d4",
            borderRadius:8, padding:"9px 18px",
            fontSize:13, cursor:"pointer", fontWeight:"bold"
          }}>
            Kunjungi Toko
          </button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:20, background:"#f4f6f8" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18 }}>
          {[
            { label:"Total Produk", value:products.length,                       color:"#e91e8c" },
            { label:"Ada Diskon",   value:products.filter(p=>p.discount).length, color:"#ff4d4f" },
            { label:"Ada Foto",     value:products.filter(p=>p.img).length,      color:"#03ac0e" },
            { label:"Kategori",     value:categories.length,                     color:"#1890ff" },
          ].map((s, i) => (
            <div key={i} style={{
              background:"white", borderRadius:10,
              padding:"14px 18px",
              boxShadow:"0 1px 4px rgba(0,0,0,0.06)"
            }}>
              <div style={{ fontSize:22, fontWeight:"bold", color:s.color }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#888", marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background:"white", borderRadius:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.07)" }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"56px 1fr 130px 110px 70px 130px",
            padding:"11px 16px",
            background:"#f9f9f9", borderBottom:"1px solid #eee",
            fontSize:11, fontWeight:"700",
            color:"#999", textTransform:"uppercase", letterSpacing:"0.5px"
          }}>
            <span>Foto</span>
            <span>Produk</span>
            <span>Harga</span>
            <span>Kategori</span>
            <span>Rating</span>
            <span>Aksi</span>
          </div>

          {products.length === 0 && (
            <div style={{ textAlign:"center", padding:48, color:"#bbb", fontSize:14 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>📦</div>
              Belum ada produk. Klik "+ Tambah Produk" untuk mulai.
            </div>
          )}

          {products.map((p, i) => (
            <div key={p.id} className="admin-row" style={{
              display:"grid",
              gridTemplateColumns:"56px 1fr 130px 110px 70px 130px",
              padding:"12px 16px", alignItems:"center",
              borderBottom: i < products.length - 1 ? "1px solid #f5f5f5" : "none",
              transition:"0.15s"
            }}>
              <div style={{
                width:42, height:42, borderRadius:8,
                background:"#f3eaf0", overflow:"hidden",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0
              }}>
                {p.img
                  ? <img src={p.img} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" />
                  : <span style={{ fontSize:18, color:"#ccc" }}>📷</span>
                }
              </div>

              <div style={{ paddingRight:10 }}>
                <div style={{
                  fontWeight:"600", color:"#222", fontSize:13, marginBottom:2,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:200
                }}>
                  {p.name}
                </div>
                <div style={{ fontSize:11, color:"#03ac0e" }}>✔ {p.seller}</div>
              </div>

              <div>
                <div style={{ color:"#e91e8c", fontWeight:"bold", fontSize:13 }}>
                  Rp {p.price.toLocaleString("id-ID")}
                </div>
                {p.discount && (
                  <div style={{
                    fontSize:10, color:"#ff4d4f", background:"#fff2f0",
                    display:"inline-block", padding:"1px 5px", borderRadius:4, marginTop:2
                  }}>
                    Diskon {p.discount}%
                  </div>
                )}
              </div>

              <div>
                <span style={{
                  background:"#fff0f7", color:"#e91e8c",
                  padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:"600"
                }}>
                  {categories.find(c => c.id === p.cat)?.label || p.cat}
                </span>
              </div>

              <div style={{ fontSize:12, color:"#555" }}>⭐ {p.rating}</div>

              <div style={{ display:"flex", gap:6 }}>
                <button onClick={() => openEdit(p)} style={{
                  padding:"5px 14px", borderRadius:6,
                  border:"1px solid #e91e8c", background:"white",
                  color:"#e91e8c", fontSize:12, cursor:"pointer", fontWeight:"600"
                }}>
                  Edit
                </button>
                {/* ── DIUBAH: kirim objek p, bukan hanya id ── */}
                <button onClick={() => handleDelete(p)} style={{
                  padding:"5px 12px", borderRadius:6,
                  border:"1px solid #ffccc7", background:"#fff2f0",
                  color:"#ff4d4f", fontSize:12, cursor:"pointer", fontWeight:"600"
                }}>
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── BARU: render modal hapus di dalam AdminPanel ── */}
      {deleteTarget && (
        <DeleteConfirmModal
          productName={deleteTarget.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}

function TopNavbar({ user, cartCount, openCart, openAuth, openAdmin, onLogout }) {
  return (
    <div style={{
      display:"flex", justifyContent:"space-between",
      alignItems:"center", padding:"12px 20px",
      background:"white", borderBottom:"1px solid #eee",
      position:"sticky", top:0, zIndex:100, flexShrink:0
    }}>
      <div style={{ fontSize:20, fontWeight:"bold", color:"#e91e8c", whiteSpace:"nowrap" }}>
        MeiHua Official
      </div>

      <input placeholder="Cari produk..."
        style={{
          width:"38%", padding:"9px 14px",
          borderRadius:20, border:"1px solid #ccc", fontSize:13, outline:"none"
        }}
      />

      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ position:"relative", cursor:"pointer" }} onClick={openCart}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position:"absolute", top:-8, right:-10,
              background:"#e91e8c", color:"white",
              borderRadius:"50%", padding:"2px 6px", fontSize:11
            }}>
              {cartCount}
            </span>
          )}
        </div>

        {!user ? (
          <>
            <button className="btn-ghost" onClick={() => openAuth("login")}>Login</button>
            <button className="btn-primary" onClick={() => openAuth("register")}>Register</button>
          </>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:13 }}>Halo, <strong>{user}</strong></span>
            <button onClick={openAdmin} style={{
              background:"#fff0f7", color:"#e91e8c",
              border:"1px solid #f9a8d4",
              borderRadius:20, padding:"6px 14px",
              fontSize:12, cursor:"pointer", fontWeight:"bold"
            }}>
              Admin
            </button>
            <button onClick={onLogout} style={{
              background:"none", border:"none",
              color:"#aaa", fontSize:12,
              cursor:"pointer", padding:"6px 8px"
            }}>
              Keluar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductGrid({ products, cart, addToCart, removeFromCart }) {
  if (products.length === 0) {
    return (
      <div style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        height:300, color:"#aaa", gap:10
      }}>
        <span style={{ fontSize:48 }}>🔍</span>
        <p style={{ fontSize:14 }}>Produk tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))",
      gap:10, alignItems:"stretch"
    }}>
      {products.map(p => {
        const item = cart.find(i => i.id === p.id);
        return (
          <div key={p.id} className="product-card">
            <div className="product-img">
              {p.discount && <div className="badge">{p.discount}%</div>}
              {p.img
                ? <img src={p.img} alt="produk" />
                : <div className="placeholder"><span>📷</span><p style={{ margin:0 }}>Belum ada foto</p></div>
              }
            </div>

            <div style={{ padding:"8px 10px 10px", display:"flex", flexDirection:"column", flex:1 }}>
              <p style={{
                fontSize:12, margin:"0 0 4px", color:"#333",
                lineHeight:1.4, height:"34px", overflow:"hidden",
                display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical"
              }}>
                {p.name}
              </p>
              <p style={{ color:"#e91e8c", fontWeight:"bold", fontSize:14, margin:"0 0 2px" }}>
                Rp {p.price.toLocaleString("id-ID")}
              </p>
              <div style={{ height:"18px", marginBottom:4 }}>
                {p.oldPrice && (
                  <span className="old-price">Rp {p.oldPrice.toLocaleString("id-ID")}</span>
                )}
              </div>
              <p style={{ fontSize:11, color:"#777", margin:"0 0 3px" }}>
                ⭐ {p.rating} • {p.sold} terjual
              </p>
              <p className="seller-badge" style={{ margin:"0 0 6px" }}>✔ {p.seller}</p>
              <div style={{ marginTop:"auto" }}>
                {item ? (
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeFromCart(p.id)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(p)}>+</button>
                  </div>
                ) : (
                  <button className="btn-cart" onClick={() => addToCart(p)}>+ Keranjang</button>
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
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  return (
    <div style={{
      position:"fixed", top:0, right:0,
      width:"350px", height:"100vh",
      background:"white",
      boxShadow:"-2px 0 10px rgba(0,0,0,0.2)",
      padding:20, zIndex:999,
      display:"flex", flexDirection:"column"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h3 style={{ margin:0 }}>Keranjang</h3>
        <button onClick={close} style={{
          border:"none", background:"none", fontSize:18, cursor:"pointer", color:"#aaa"
        }}>✖</button>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign:"center", marginTop:60, color:"#aaa" }}>
          <div style={{ fontSize:48 }}>🛒</div>
          <p style={{ fontSize:14, marginTop:8 }}>Keranjang masih kosong</p>
        </div>
      ) : (
        <>
          <div style={{ flex:1, overflowY:"auto" }}>
            {cart.map(item => (
              <div key={item.id} style={{
                display:"flex", justifyContent:"space-between",
                marginBottom:15, borderBottom:"1px solid #eee", paddingBottom:10
              }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:"bold" }}>{item.name}</div>
                  <small style={{ color:"#777" }}>
                    {item.qty} x Rp {item.price.toLocaleString("id-ID")}
                  </small>
                </div>
                <button onClick={() => remove(item.id)} style={{
                  background:"none", border:"none",
                  color:"red", cursor:"pointer", fontSize:12, flexShrink:0
                }}>Hapus</button>
              </div>
            ))}
          </div>
          <div style={{ borderTop:"1px solid #eee", paddingTop:12 }}>
            <h4 style={{ color:"#e91e8c", margin:"0 0 10px" }}>
              Total: Rp {total.toLocaleString("id-ID")}
            </h4>
            <button className="btn-cart">Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}

function AuthModal({ close, setUser, mode, onLogin }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const nama = isLogin ? email.split("@")[0] : name;
    setUser(nama);
    onLogin();
    close();
  };

  const inputStyle = {
    width:"100%", padding:"10px 12px", margin:"8px 0",
    borderRadius:8, border:"1px solid #e0e0e0",
    boxSizing:"border-box", display:"block", fontSize:13, outline:"none"
  };

  return (
    <div style={{
      position:"fixed", top:0, left:0,
      width:"100%", height:"100%",
      background:"rgba(0,0,0,0.4)",
      display:"flex", justifyContent:"center", alignItems:"center",
      zIndex:999
    }}>
      <div style={{
        background:"white", padding:32,
        borderRadius:14, width:360, position:"relative",
        boxShadow:"0 8px 32px rgba(0,0,0,0.15)"
      }}>
        <button onClick={close} style={{
          position:"absolute", top:12, right:14,
          border:"none", background:"none", fontSize:18, cursor:"pointer", color:"#aaa"
        }}>✖</button>

        <div style={{ textAlign:"center", marginBottom:22 }}>
          <div style={{ fontSize:32, marginBottom:8 }}>💍</div>
          <h2 style={{ margin:0, fontSize:18, color:"#1a1a1a" }}>
            {isLogin ? "Masuk ke Akun" : "Buat Akun Baru"}
          </h2>
          <p style={{ margin:"4px 0 0", fontSize:12, color:"#aaa" }}>MeiHua Official</p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input placeholder="Nama lengkap" value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle} required />
          )}
          <input placeholder="Alamat email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle} required />
          <input placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle} required />
          <button style={{
            width:"100%", padding:"12px",
            background:"#e91e8c", color:"white",
            border:"none", borderRadius:8,
            fontWeight:"bold", fontSize:14,
            cursor:"pointer", marginTop:8,
            boxShadow:"0 2px 8px rgba(233,30,140,0.3)"
          }} type="submit">
            {isLogin ? "Masuk" : "Daftar Sekarang"}
          </button>
        </form>

        <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:"#888" }}>
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <span
            style={{ color:"#e91e8c", cursor:"pointer", fontWeight:"bold" }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Daftar" : "Masuk"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(initialProducts);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(null);
  const [adminMode, setAdminMode] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSub, setActiveSub] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) return prev.map(item =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev =>
      prev.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item)
          .filter(item => item.qty > 0)
    );
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setUser(null);
    setAdminMode(false);
    setShowLogoutConfirm(false);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleCatClick = (cat) => {
    if (activeCategory?.id === cat.id) { setActiveCategory(null); setActiveSub(null); }
    else { setActiveCategory(cat); setActiveSub(null); }
  };

  const filteredProducts = activeCategory
    ? products.filter(p => p.cat === activeCategory.id)
    : products;

  const activeCatData = categories.find(c => c.id === activeCategory?.id);

  return (
    <>
      <GlobalStyles />

      {!adminMode && (
        <TopNavbar
          user={user}
          cartCount={cart.reduce((a, b) => a + b.qty, 0)}
          openCart={() => setShowCart(true)}
          openAuth={(mode) => setShowAuth(mode)}
          openAdmin={() => setAdminMode(true)}
          onLogout={handleLogout}
        />
      )}

      {user && adminMode ? (
        <div style={{ height:"100vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <AdminPanel
            products={products}
            setProducts={setProducts}
            user={user}
            onClose={() => setAdminMode(false)}
          />
        </div>
      ) : (
        <div style={{ display:"flex", height:"calc(100vh - 57px)", overflow:"hidden" }}>

          <div className="sidebar">
            <div
              className={`cat-item ${!activeCategory ? "active" : ""}`}
              onClick={() => { setActiveCategory(null); setActiveSub(null); }}
            >
              Semua
            </div>
            {categories.map(cat => (
              <div key={cat.id}
                className={`cat-item ${activeCategory?.id === cat.id ? "active" : ""}`}
                onClick={() => handleCatClick(cat)}
              >
                {cat.label}
              </div>
            ))}
          </div>

          <div className={`submenu ${activeCategory ? "open" : ""}`}>
            {activeCatData && (
              <div className="submenu-inner">
                <div className="submenu-title">{activeCatData.label}</div>
                {activeCatData.subs.map((sub, i) => (
                  <div key={i}
                    className={`sub-item ${activeSub === i ? "active" : ""}`}
                    onClick={() => setActiveSub(activeSub === i ? null : i)}
                  >
                    {sub}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ flex:1, overflowY:"auto", padding:16 }}>
            <div style={{
              fontSize:12, color:"#888", marginBottom:12,
              display:"flex", alignItems:"center", gap:6
            }}>
              <span
                style={{ cursor:"pointer", color: !activeCategory ? "#e91e8c" : "#888" }}
                onClick={() => { setActiveCategory(null); setActiveSub(null); }}
              >
                Semua Produk
              </span>
              {activeCategory && (
                <>
                  <span>›</span>
                  <span
                    style={{ color: activeSub === null ? "#e91e8c" : "#888", cursor:"pointer" }}
                    onClick={() => setActiveSub(null)}
                  >
                    {activeCategory.label}
                  </span>
                </>
              )}
              {activeSub !== null && activeCatData && (
                <>
                  <span>›</span>
                  <span style={{ color:"#e91e8c" }}>{activeCatData.subs[activeSub]}</span>
                </>
              )}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <h2 style={{ margin:0, fontSize:15 }}>
                {activeCategory ? activeCategory.label : "Semua Produk"}
              </h2>
              <span style={{ fontSize:12, color:"#888" }}>{filteredProducts.length} produk</span>
            </div>

            <ProductGrid
              products={filteredProducts}
              cart={cart}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
            />
          </div>
        </div>
      )}

      {showCart && (
        <CartPopup cart={cart} close={() => setShowCart(false)} remove={removeFromCart} />
      )}

      {showAuth && (
        <AuthModal
          mode={showAuth}
          close={() => setShowAuth(null)}
          setUser={setUser}
          onLogin={() => setAdminMode(true)}
        />
      )}

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onConfirm={confirmLogout}
          onCancel={cancelLogout}
        />
      )}
    </>
  );
}