import { useState } from "react";

const GlobalStyles = () => (
  <style>{`
    body {
      margin:0;
      font-family:Arial, sans-serif;
      background:#fff8fb;
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

    .card{
      background:white;
      border-radius:10px;
      padding:15px;
      box-shadow:0 2px 8px rgba(0,0,0,0.1);
    }

    .product-card{
      background:white;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 2px 10px rgba(0,0,0,0.08);
      transition:0.2s;
    }

    .product-card:hover{
      transform:translateY(-5px);
    }

    .product-img{
      background:#f3eaf0;
      height:150px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:50px;
    }

    .badge{
      position:absolute;
      top:10px;
      left:10px;
      background:#ff4d4f;
      color:white;
      font-size:12px;
      padding:3px 8px;
      border-radius:6px;
      font-weight:bold;
    }

    .old-price{
      text-decoration:line-through;
      color:#999;
      font-size:13px;
    }

    .discount{
      color:#ff4d4f;
      font-size:12px;
      margin-left:5px;
    }

    .btn-cart{
      width:100%;
      margin-top:10px;
      padding:10px;
      background:linear-gradient(90deg,#ff4d8d,#e91e8c);
      color:white;
      border:none;
      border-radius:8px;
      font-weight:bold;
      cursor:pointer;
    }
  `}</style>
);

function TopNavbar({ user, cartCount, openCart, openAuth }) {
  return (
    <div style={{
      display:"flex",
      justifyContent:"space-between",
      alignItems:"center",
      padding:"12px 30px",
      background:"white",
      borderBottom:"1px solid #eee"
    }}>
      
      <div style={{fontSize:22,fontWeight:"bold",color:"#e91e8c"}}>
        MeiHua Jewelry
      </div>

      <input
        placeholder="Search..."
        style={{
          width:"40%",
          padding:"10px",
          borderRadius:20,
          border:"1px solid #ccc"
        }}
      />

      <div style={{display:"flex",gap:15,alignItems:"center"}}>

        <div style={{position:"relative",cursor:"pointer"}} onClick={openCart}>
          🛒
          {cartCount > 0 && (
            <span style={{
              position:"absolute",
              top:-8,
              right:-10,
              background:"#e91e8c",
              color:"white",
              borderRadius:"50%",
              padding:"2px 6px",
              fontSize:12
            }}>
              {cartCount}
            </span>
          )}
        </div>

        {!user ? (
          <>
            <button className="btn-ghost" onClick={() => openAuth("login")}>
              Login
            </button>
            <button className="btn-primary" onClick={() => openAuth("register")}>
              Register
            </button>
          </>
        ) : (
          <span style={{fontSize:14}}>Halo, <strong>{user}</strong></span>
        )}
      </div>
    </div>
  );
}

const products = [
  {
    id:1,
    name:"Lipstik Velvet Rose",
    price:72250,
    oldPrice:85000,
    discount:15,
    img:"💄"
  },
  {
    id:2,
    name:"Tote Bag Pastel Bloom",
    price:125000,
    oldPrice:null,
    discount:null,
    img:"👜"
  },
  {
    id:3,
    name:"Skincare Glow Set",
    price:256000,
    oldPrice:320000,
    discount:20,
    img:"✨"
  },
  {
    id:4,
    name:"Notebook Aesthetic",
    price:55000,
    oldPrice:null,
    discount:null,
    img:"📓"
  },
];

function HomePage({addToCart}){
  return(
    <div style={{padding:30}}>
      <h2 style={{marginBottom:10}}>Product</h2>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:20
      }}>
        {products.map(p=>(
          <div key={p.id} className="product-card">
            
            <div style={{position:"relative"}}>
              {p.discount && (
                <div className="badge">{p.discount}%</div>
              )}

              <div className="product-img">{p.img}</div>
            </div>

            <div style={{padding:12}}>
              <h3 style={{fontSize:15,marginBottom:5}}>
                {p.name}
              </h3>

              <p style={{
                color:"#e91e8c",
                fontWeight:"bold",
                fontSize:16
              }}>
                Rp {p.price.toLocaleString("id-ID")}
              </p>

              {p.oldPrice && (
                <div>
                  <span className="old-price">
                    Rp {p.oldPrice.toLocaleString("id-ID")}
                  </span>
                  <span className="discount">
                    Hemat {p.discount}%
                  </span>
                </div>
              )}

              <p style={{fontSize:12,color:"#777"}}>
                ⭐ 4.9 • 100+ terjual
              </p>

              <button 
                className="btn-cart"
                onClick={()=>addToCart(p)}
              >
                + Cart
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}

function CartPopup({ cart, close, remove }) {
  const total = cart.reduce((sum,item)=> sum + item.price * item.qty, 0);

  return(
    <div style={{
      position:"fixed",
      top:0,
      right:0,
      width:"350px",
      height:"100vh",
      background:"white",
      boxShadow:"-2px 0 10px rgba(0,0,0,0.2)",
      padding:20,
      zIndex:999
    }}>
      
      <h3>Cart</h3>

      <button 
        onClick={close}
        style={{
          position:"absolute",
          top:10,
          right:10,
          border:"none",
          background:"none",
          fontSize:18,
          cursor:"pointer"
        }}
      >
        ✖
      </button>

      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cart.map(item=>(
            <div key={item.id} style={{
              display:"flex",
              justifyContent:"space-between",
              marginBottom:15,
              borderBottom:"1px solid #eee",
              paddingBottom:10
            }}>
              <div>
                <div>{item.name}</div>
                <small>{item.qty} x Rp {item.price.toLocaleString("id-ID")}</small>
              </div>

              <button 
                onClick={()=>remove(item.id)}
                style={{
                  background:"none",
                  border:"none",
                  color:"red",
                  cursor:"pointer"
                }}
              >
                Hapus
              </button>
            </div>
          ))}

          <h4>
            Total: Rp {total.toLocaleString("id-ID")}
          </h4>

          <button className="btn-cart">
            Checkout
          </button>
        </>
      )}
    </div>
  );
}

function AuthModal({ close, setUser, mode }) {
  const [isLogin,setIsLogin] = useState(mode === "login");
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if(isLogin){
      // login → ambil nama dari email
      setUser(email.split("@")[0]);
    } else {
      // register → pakai nama
      setUser(name);
    }

    close();
  };

  return(
    <div style={{
      position:"fixed",
      top:0,
      left:0,
      width:"100%",
      height:"100%",
      background:"rgba(0,0,0,0.4)",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      zIndex:999
    }}>

      <div style={{
        background:"white",
        padding:30,
        borderRadius:12,
        width:350,
        position:"relative"
      }}>

        {/* tombol X */}
        <button onClick={close} style={{
          position:"absolute",
          top:10,
          right:10,
          border:"none",
          background:"none",
          fontSize:18,
          cursor:"pointer"
        }}>
          ✖
        </button>

        <h2 style={{textAlign:"center",color:"#e91e8c"}}>
          {isLogin ? "Masuk" : "Daftar"}
        </h2>

        <form onSubmit={handleSubmit}>

          {!isLogin && (
            <input
              placeholder="Nama"
              value={name}
              onChange={e=>setName(e.target.value)}
              style={inputStyle}
              required
            />
          )}

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            style={inputStyle}
            required
          />

          <button className="btn-cart" type="submit">
            {isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>

        <p style={{textAlign:"center",marginTop:10}}>
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <span 
            style={{color:"#e91e8c",cursor:"pointer"}}
            onClick={()=>setIsLogin(!isLogin)}
          >
            {isLogin ? "Daftar" : "Masuk"}
          </span>
        </p>

      </div>
    </div>
  );
}

const inputStyle = {
  width:"100%",
  padding:"10px",
  margin:"8px 0",
  borderRadius:"8px",
  border:"1px solid #ccc",
  boxSizing:"border-box", 
  display:"block" 
};

export default function App(){
  const [user,setUser] = useState(null);
  const [cart,setCart] = useState([]);
  const [showCart,setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(null);

  const addToCart = (product) => {
    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if(exist){
        return prev.map(item =>
          item.id === product.id
            ? {...item, qty: item.qty + 1}
            : item
        );
      }
      return [...prev, {...product, qty:1}];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return(
    <>
      <GlobalStyles/>
      <TopNavbar 
        user={user} 
        cartCount={cart.reduce((a,b)=>a+b.qty,0)}
        openCart={()=>setShowCart(true)}
        openAuth={(mode) => setShowAuth(mode)}
      />

      <HomePage addToCart={addToCart}/>

      {showCart && (
        <CartPopup 
          cart={cart}
          close={()=>setShowCart(false)}
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