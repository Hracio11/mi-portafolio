"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const ok = await login(email, password);
    if (ok) router.push("/admin");
    else { setError("Email o contraseña incorrectos."); setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --g:#1C3A2A; --dk:#0F1F16; --cr:#F5F0E8; --y:#F0C040; --mt:#8AAA98; --serif:'Playfair Display',Georgia,serif; --mono:'Space Mono',monospace; }
        body { background:var(--dk); color:var(--cr); font-family:var(--mono); min-height:100vh; display:flex; align-items:center; justify-content:center; }
        .box { width:100%; max-width:400px; padding:24px; }
        .logo { font-family:var(--serif); font-size:32px; font-weight:900; color:var(--y); margin-bottom:4px; }
        .sub { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--mt); margin-bottom:48px; }
        .line { width:28px; height:2px; background:var(--y); margin-bottom:48px; }
        .field { margin-bottom:18px; }
        .field label { display:block; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--mt); margin-bottom:9px; }
        .field input { width:100%; background:var(--g); border:1px solid rgba(240,192,64,0.15); color:var(--cr); font-family:var(--mono); font-size:13px; padding:13px 15px; outline:none; transition:border-color 0.2s; }
        .field input:focus { border-color:var(--y); }
        .err { font-size:11px; color:#E07070; margin-bottom:18px; }
        .btn { width:100%; background:var(--y); border:none; color:var(--dk); font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:15px; cursor:pointer; transition:opacity 0.2s; }
        .btn:hover { opacity:0.85; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .hint { margin-top:22px; font-size:10px; color:var(--mt); line-height:1.8; padding:14px; border:1px solid rgba(240,192,64,0.12); }
        .hint strong { color:var(--y); }
        .back { display:block; text-align:center; margin-top:20px; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--mt); text-decoration:none; transition:color 0.2s; }
        .back:hover { color:var(--cr); }
      `}</style>
      <div className="box">
        <div className="logo">Admin</div>
        <div className="sub">Panel · Horacio Rojas</div>
        <div className="line" />
        <form onSubmit={handleSubmit}>
          <div className="field"><label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoFocus required /></div>
          <div className="field"><label>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></div>
          {error && <div className="err">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>{loading ? "Verificando..." : "Ingresar →"}</button>
        </form>
        <div className="hint"><strong>¿Primera vez?</strong> Ve a Supabase → Authentication → Users → <strong>Add user</strong>.</div>
        <a href="/" className="back">← Volver al portafolio</a>
      </div>
    </>
  );
}