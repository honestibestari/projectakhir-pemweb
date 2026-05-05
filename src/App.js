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
  `}</style>
);

function TopNavbar({ user }) {
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
        placeholder="Cari produk..."
        style={{
          width:"40%",
          padding:"10px",
          borderRadius:20,
          border:"1px solid #ccc"
        }}
      />

      <div style={{display:"flex",gap:10}}>
        {!user ? (
          <>
            <button className="btn-ghost">Masuk</button>
            <button className="btn-primary">Daftar</button>
          </>
        ) : (
          <span>{user}</span>
        )}
      </div>
    </div>
  );
}

const products = [
  {id:1,name:"Lipstik Velvet Rose",price:85000,img:"💄"},
  {id:2,name:"Tote Bag Pastel",price:125000,img:"👜"},
  {id:3,name:"Skincare Glow",price:320000,img:"✨"},
  {id:4,name:"Notebook Aesthetic",price:55000,img:"📓"},
];

function HomePage(){
  return(
    <div style={{padding:30}}>
      <h2>Produk Untuk Kamu</h2>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
        gap:20,
        marginTop:20
      }}>
        {products.map(p=>(
          <div key={p.id} className="card">
            <div style={{fontSize:50,textAlign:"center"}}>{p.img}</div>

            <h3 style={{fontSize:16}}>{p.name}</h3>

            <p style={{color:"#e91e8c",fontWeight:"bold"}}>
              Rp {p.price.toLocaleString("id-ID")}
            </p>

            <p style={{fontSize:12,color:"#777"}}>
              ⭐ 4.9 • 100+ terjual
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App(){
  const [user,setUser] = useState(null);

  return(
    <>
      <GlobalStyles/>
      <TopNavbar user={user}/>
      <HomePage/>
    </>
  );
}