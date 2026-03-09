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
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    if (ok) router.push("/admin");
    else { setError("Email o contraseña incorrectos."); setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --green:#1C3A2A; --green2:#244D38; --dark:#0F1F16; --cream:#F5F0E8; --yellow:#F0C040; --muted:#8AAA98; --serif:'Playfair Display',Georgia,serif; --mono:'Space Mono',monospace; }
        body { background:var(--dark); color:var(--cream); font-family:var(--mono); min-height:100vh; display:flex; align-items:center; justify-content:center; }
        .box { width:100%; max-width:420px; padding:24px; }
        .logo { font-family:var(--serif); font-size:32px; font-weight:900; color:var(--yellow); margin-bottom:6px; }
        .sub { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:48px; }
        .line { width:32px; height:2px; background:var(--yellow); margin-bottom:48px; }
        .field { margin-bottom:20px; }
        .field label { display:block; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
        .field input { width:100%; background:var(--green); border:1px solid rgba(240,192,64,0.15); color:var(--cream); font-family:var(--mono); font-size:13px; padding:14px 16px; outline:none; transition:border-color 0.2s; }
        .field input:focus { border-color:var(--yellow); }
        .err { font-size:11px; color:#E07070; margin-bottom:20px; letter-spacing:0.04em; }
        .btn { width:100%; background:var(--yellow); border:none; color:var(--dark); font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; padding:16px; cursor:pointer; transition:opacity 0.2s; }
        .btn:hover { opacity:0.85; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .hint { margin-top:24px; font-size:10px; color:var(--muted); line-height:1.8; padding:16px; border:1px solid rgba(240,192,64,0.15); }
        .hint strong { color:var(--yellow); }
        .back { display:block; text-align:center; margin-top:24px; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color 0.2s; }
        .back:hover { color:var(--cream); }
      `}</style>
      <div className="box">
        <div className="logo">Admin</div>
        <div className="sub">Panel de administración</div>
        <div className="line" />
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" autoFocus required />
          </div>
          <div className="field">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="err">{error}</div>}
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Verificando..." : "Ingresar →"}
          </button>
        </form>
        <div className="hint">
          <strong>¿Primera vez?</strong> Ve a Supabase → Authentication → Users → <strong>Add user</strong> y crea tu cuenta de administrador.
        </div>
        <a href="/" className="back">← Volver al portafolio</a>
      </div>
    </>
  );
}