import { useState } from "react";

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
      background:#f3eaf0;
      height:160px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:60px;
      position:relative;
      flex-shrink:0;
    }

    .badge{
      position:absolute;
      top:6px;
      left:6px;
      background:#ff4d4f;
      color:white;
      font-size:11px;
      padding:2px 6px;
      border-radius:4px;
      font-weight:bold;
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
      width:72px;
      background:white;
      border-right:1px solid #eee;
      display:flex;
      flex-direction:column;
      padding:10px 0;
      flex-shrink:0;
      overflow-y:auto;
    }

    .cat-item{
      display:flex;
      flex-direction:column;
      align-items:center;
      padding:12px 6px;
      cursor:pointer;
      gap:5px;
      border-left:3px solid transparent;
      transition:0.15s;
    }

    .cat-item:hover{ background:#fff0f7; }

    .cat-item.active{
      border-left:3px solid #e91e8c;
      background:#fff0f7;
    }

    .cat-item span{
      font-size:10px;
      text-align:center;
      color:#555;
      line-height:1.3;
    }

    .cat-item.active span{
      color:#e91e8c;
      font-weight:bold;
    }

    .submenu{
      width:0;
      overflow:hidden;
      background:white;
      border-right:1px solid #eee;
      transition:width 0.25s ease;
      flex-shrink:0;
    }

    .submenu.open{ width:150px; }

    .submenu-inner{
      width:150px;
      padding:10px 0;
    }

    .submenu-title{
      font-size:12px;
      font-weight:bold;
      color:#e91e8c;
      padding:8px 14px 6px;
      border-bottom:1px solid #f0e0e8;
      margin-bottom:4px;
    }

    .sub-item{
      display:flex;
      align-items:center;
      gap:8px;
      padding:9px 14px;
      font-size:12px;
      color:#444;
      cursor:pointer;
      transition:0.15s;
    }

    .sub-item:hover{
      background:#fff0f7;
      color:#e91e8c;
    }

    .sub-item.active{
      background:#fff0f7;
      color:#e91e8c;
      font-weight:bold;
    }
  `}</style>
);

function TopNavbar({ user, cartCount, openCart, openAuth }) {
  return (
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"12px 20px",
      background:"white",
      borderBottom:"1px solid #eee",
      position:"sticky",
      top:0,
      zIndex:100
    }}>
      <div style={{fontSize:20,fontWeight:"bold",color:"#e91e8c",whiteSpace:"nowrap"}}>
        MeiHua Jewelry
      </div>

      <input
        placeholder="Search..."
        style={{
          width:"40%",
          padding:"9px 14px",
          borderRadius:20,
          border:"1px solid #ccc",
          fontSize:13
        }}
      />

      <div style={{display:"flex",gap:15,alignItems:"center"}}>
        <div style={{position:"relative",cursor:"pointer"}} onClick={openCart}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position:"absolute",
              top:-8, right:-10,
              background:"#e91e8c",
              color:"white",
              borderRadius:"50%",
              padding:"2px 6px",
              fontSize:11
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
          <span style={{fontSize:13}}>Halo, <strong>{user}</strong></span>
        )}
      </div>
    </div>
  );
}

const categories = [
  {
    id:"cincin", label:"Cincin",
    subs:["Cincin Emas","Cincin Berlian","Cincin Perak","Cincin Couple","Cincin Tunangan"]
  },
  {
    id:"kalung", label:"Kalung",
    subs:["Kalung Emas","Kalung Perak","Kalung Mutiara","Kalung Choker","Kalung Liontin"]
  },
  {
    id:"gelang", label:"Gelang",
    subs:["Gelang Emas","Gelang Perak","Gelang Batu","Gelang Charm","Gelang Couple"]
  },
  {
    id:"anting", label:"Anting",
    subs:["Anting Gantung","Anting Stud","Anting Hoop","Anting Klip","Anting Permata"]
  },
  {
    id:"bros", label:"Bros",
    subs:["Bros Bunga","Bros Hewan","Bros Enamel","Bros Vintage","Bros Kristal"]
  },
  {
    id:"set", label:"Set Perhiasan",
    subs:["Set Pernikahan","Set Hadiah","Set Pengantin","Set Couple","Set Premium"]
  },
];

const allProducts = [
  { id:1,  cat:"cincin",  name:"Cincin Emas 18K Rose Gold",    price:720000,  oldPrice:850000,  discount:15, img:"💍", rating:4.9, sold:"100rb+", seller:"MeiHua Official" },
  { id:2,  cat:"kalung",  name:"Kalung Mutiara Putih Elegan",  price:325000,  oldPrice:null,    discount:null, img:"📿", rating:4.8, sold:"50rb+",  seller:"PearlShop" },
  { id:3,  cat:"anting",  name:"Anting Berlian Swarovski",     price:256000,  oldPrice:320000,  discount:20, img:"💎", rating:5.0, sold:"500rb+", seller:"DiamondStore" },
  { id:4,  cat:"gelang",  name:"Gelang Charm Silver 925",      price:185000,  oldPrice:null,    discount:null, img:"🪬", rating:4.7, sold:"200rb+", seller:"SilverArt" },
  { id:5,  cat:"bros",    name:"Bros Bunga Kristal Ungu",      price:89000,   oldPrice:110000,  discount:19, img:"🌸", rating:4.9, sold:"30rb+",  seller:"BrosQueen" },
  { id:6,  cat:"set",     name:"Set Perhiasan Couple Emas",    price:1250000, oldPrice:1500000, discount:17, img:"🎁", rating:4.8, sold:"10rb+",  seller:"MeiHua Official" },
  { id:7,  cat:"cincin",  name:"Cincin Perak Ukir Bunga",      price:145000,  oldPrice:null,    discount:null, img:"💍", rating:4.6, sold:"80rb+",  seller:"SilverCraft" },
  { id:8,  cat:"kalung",  name:"Kalung Liontin Bintang Emas",  price:380000,  oldPrice:420000,  discount:10, img:"📿", rating:4.9, sold:"150rb+", seller:"StarJewel" },
  { id:9,  cat:"anting",  name:"Anting Hoop Gold Filled",      price:175000,  oldPrice:null,    discount:null, img:"💎", rating:4.7, sold:"60rb+",  seller:"HoopStyle" },
  { id:10, cat:"gelang",  name:"Gelang Batu Opal Warna-warni", price:220000,  oldPrice:260000,  discount:15, img:"🪬", rating:4.8, sold:"40rb+",  seller:"StoneGems" },
  { id:11, cat:"bros",    name:"Bros Vintage Kelopak Enamel",  price:65000,   oldPrice:null,    discount:null, img:"🌸", rating:4.5, sold:"25rb+",  seller:"VintagePin" },
  { id:12, cat:"set",     name:"Set Pengantin Emas Putih",     price:2800000, oldPrice:3200000, discount:13, img:"🎁", rating:5.0, sold:"5rb+",   seller:"BridalGold" },
];

function ProductGrid({ products, cart, addToCart, removeFromCart }) {
  if (products.length === 0) {
    return (
      <div style={{
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        height:300, color:"#aaa", gap:10
      }}>
        <span style={{fontSize:48}}>🔍</span>
        <p style={{fontSize:14}}>Produk tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div style={{
      display:"grid",
      gridTemplateColumns:"repeat(auto-fill, minmax(155px, 1fr))",
      gap:10,
      alignItems:"stretch"
    }}>
      {products.map(p => {
        const item = cart.find(i => i.id === p.id);
        return (
          <div key={p.id} className="product-card">

            {/* Gambar */}
            <div className="product-img">
              {p.discount && <div className="badge">{p.discount}%</div>}
              {p.img}
            </div>

            {/* Info — flex column agar tombol selalu di bawah */}
            <div style={{
              padding:"8px 10px 10px",
              display:"flex",
              flexDirection:"column",
              flex:1
            }}>

              {/* Nama — fixed height 2 baris */}
              <p style={{
                fontSize:12,
                margin:"0 0 4px",
                color:"#333",
                lineHeight:1.4,
                height:"34px",
                overflow:"hidden",
                display:"-webkit-box",
                WebkitLineClamp:2,
                WebkitBoxOrient:"vertical"
              }}>
                {p.name}
              </p>

              {/* Harga utama */}
              <p style={{
                color:"#e91e8c",
                fontWeight:"bold",
                fontSize:14,
                margin:"0 0 2px"
              }}>
                Rp {p.price.toLocaleString("id-ID")}
              </p>

              {/* Harga lama — fixed height agar rata walau kosong */}
              <div style={{height:"18px", marginBottom:4}}>
                {p.oldPrice && (
                  <span className="old-price">
                    Rp {p.oldPrice.toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              {/* Rating */}
              <p style={{fontSize:11, color:"#777", margin:"0 0 3px"}}>
                ⭐ {p.rating} • {p.sold} terjual
              </p>

              {/* Nama toko */}
              <p className="seller-badge" style={{margin:"0 0 6px"}}>
                ✔ {p.seller}
              </p>

              {/* Tombol — didorong ke bawah */}
              <div style={{marginTop:"auto"}}>
                {item ? (
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => removeFromCart(p.id)}>−</button>
                    <span className="qty-num">{item.qty}</span>
                    <button className="qty-btn" onClick={() => addToCart(p)}>+</button>
                  </div>
                ) : (
                  <button className="btn-cart" onClick={() => addToCart(p)}>
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
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div style={{
      position:"fixed", top:0, right:0,
      width:"350px", height:"100vh",
      background:"white",
      boxShadow:"-2px 0 10px rgba(0,0,0,0.2)",
      padding:20, zIndex:999
    }}>
      <h3 style={{margin:"0 0 16px"}}>Keranjang</h3>

      <button onClick={close} style={{
        position:"absolute", top:14, right:14,
        border:"none", background:"none", fontSize:18, cursor:"pointer"
      }}>✖</button>

      {cart.length === 0 ? (
        <div style={{textAlign:"center", marginTop:60, color:"#aaa"}}>
          <div style={{fontSize:48}}>🛒</div>
          <p style={{fontSize:14}}>Keranjang masih kosong</p>
        </div>
      ) : (
        <>
          {cart.map(item => (
            <div key={item.id} style={{
              display:"flex", justifyContent:"space-between",
              marginBottom:15, borderBottom:"1px solid #eee", paddingBottom:10
            }}>
              <div>
                <div style={{fontSize:13, fontWeight:"bold"}}>{item.name}</div>
                <small style={{color:"#777"}}>
                  {item.qty} x Rp {item.price.toLocaleString("id-ID")}
                </small>
              </div>
              <button onClick={() => remove(item.id)} style={{
                background:"none", border:"none",
                color:"red", cursor:"pointer", fontSize:12
              }}>
                Hapus
              </button>
            </div>
          ))}

          <h4 style={{color:"#e91e8c"}}>
            Total: Rp {total.toLocaleString("id-ID")}
          </h4>

          <button className="btn-cart">Checkout</button>
        </>
      )}
    </div>
  );
}

function AuthModal({ close, setUser, mode }) {
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setUser(isLogin ? email.split("@")[0] : name);
    close();
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
        background:"white", padding:30,
        borderRadius:12, width:350, position:"relative"
      }}>
        <button onClick={close} style={{
          position:"absolute", top:10, right:10,
          border:"none", background:"none", fontSize:18, cursor:"pointer"
        }}>✖</button>

        <h2 style={{textAlign:"center", color:"#e91e8c"}}>
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input placeholder="Nama" value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle} required />
          )}
          <input placeholder="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle} required />
          <input placeholder="Password" type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            style={inputStyle} required />
          <button className="btn-cart" type="submit">
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p style={{textAlign:"center", marginTop:10, fontSize:13}}>
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <span style={{color:"#e91e8c", cursor:"pointer"}}
            onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width:"100%", padding:"10px", margin:"8px 0",
  borderRadius:"8px", border:"1px solid #ccc",
  boxSizing:"border-box", display:"block"
};

export default function App() {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

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

  const handleCatClick = (cat) => {
    if (activeCategory?.id === cat.id) {
      setActiveCategory(null);
      setActiveSub(null);
    } else {
      setActiveCategory(cat);
      setActiveSub(null);
    }
  };

  const filteredProducts = activeCategory
    ? allProducts.filter(p => p.cat === activeCategory.id)
    : allProducts;

  const activeCatData = categories.find(c => c.id === activeCategory?.id);

  return (
    <>
      <GlobalStyles />
      <TopNavbar
        user={user}
        cartCount={cart.reduce((a, b) => a + b.qty, 0)}
        openCart={() => setShowCart(true)}
        openAuth={(mode) => setShowAuth(mode)}
      />

      <div style={{display:"flex", height:"calc(100vh - 57px)", overflow:"hidden"}}>

        {/* Sidebar kategori utama */}
        <div className="sidebar">
          {categories.map(cat => (
            <div
              key={cat.id}
              className={`cat-item ${activeCategory?.id === cat.id ? "active" : ""}`}
              onClick={() => handleCatClick(cat)}
            >
              <span style={{fontSize:22}}>{cat.icon}</span>
              <span>{cat.label}</span>
            </div>
          ))}
        </div>

        {/* Submenu geser */}
        <div className={`submenu ${activeCategory ? "open" : ""}`}>
          {activeCatData && (
            <div className="submenu-inner">
              <div className="submenu-title">
                {activeCatData.icon} {activeCatData.label}
              </div>
              {activeCatData.subs.map((sub, i) => (
                <div
                  key={i}
                  className={`sub-item ${activeSub === i ? "active" : ""}`}
                  onClick={() => setActiveSub(activeSub === i ? null : i)}
                >
                  <span>{sub.icon}</span>
                  <span>{sub.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Konten produk */}
        <div style={{flex:1, overflowY:"auto", padding:"16px"}}>

          {/* Breadcrumb */}
          <div style={{
            fontSize:12, color:"#888", marginBottom:12,
            display:"flex", alignItems:"center", gap:6
          }}>
            <span
              style={{cursor:"pointer", color: !activeCategory ? "#e91e8c" : "#888"}}
              onClick={() => { setActiveCategory(null); setActiveSub(null); }}
            >
              Semua Produk
            </span>
            {activeCategory && (
              <>
                <span>›</span>
                <span
                  style={{color: activeSub === null ? "#e91e8c" : "#888", cursor:"pointer"}}
                  onClick={() => setActiveSub(null)}
                >
                  {activeCategory.icon} {activeCategory.label}
                </span>
              </>
            )}
            {activeSub !== null && activeCatData && (
              <>
                <span>›</span>
                <span style={{color:"#e91e8c"}}>
                  {activeCatData.subs[activeSub].label}
                </span>
              </>
            )}
          </div>

          {/* Judul & jumlah produk */}
          <div style={{
            display:"flex", justifyContent:"space-between",
            alignItems:"center", marginBottom:12
          }}>
            <h2 style={{margin:0, fontSize:15}}>
              {activeCategory
                ? `${activeCategory.icon} ${activeCategory.label}`
                : "Semua Produk"}
            </h2>
            <span style={{fontSize:12, color:"#888"}}>
              {filteredProducts.length} produk
            </span>
          </div>

          <ProductGrid
            products={filteredProducts}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
          />
        </div>
      </div>

      {showCart && (
        <CartPopup
          cart={cart}
          close={() => setShowCart(false)}
          remove={removeFromCart}
        />
      )}

      {showAuth && (
        <AuthModal
          mode={showAuth}
          close={() => setShowAuth(null)}
          setUser={setUser}
        />
      )}
    </>
  );
}