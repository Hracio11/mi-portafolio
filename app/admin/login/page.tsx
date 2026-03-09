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
    if (ok) {
      router.push("/admin");
    } else {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:#0E0E0E; --surface:#161616; --border:#2A2A2A; --text:#F0EDE8; --muted:#666; --accent:#C5A882; --serif:'Cormorant Garamond',Georgia,serif; --mono:'DM Mono',monospace; }
        body { background:var(--bg); color:var(--text); font-family:var(--mono); }
        .wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
        .box { width:100%; max-width:400px; }
        .logo { font-family:var(--serif); font-size:28px; font-weight:300; margin-bottom:8px; }
        .sub { font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); margin-bottom:56px; }
        .divider { width:32px; height:1px; background:var(--border); margin-bottom:56px; }
        .field { margin-bottom:20px; }
        .field label { display:block; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); margin-bottom:10px; }
        .field input { width:100%; background:var(--surface); border:1px solid var(--border); color:var(--text); font-family:var(--mono); font-size:13px; font-weight:300; padding:14px 16px; outline:none; transition:border-color 0.2s; }
        .field input:focus { border-color:var(--accent); }
        .err { font-size:11px; color:#E07070; margin-bottom:20px; }
        .btn { width:100%; background:var(--accent); border:none; color:#0E0E0E; font-family:var(--mono); font-size:11px; letter-spacing:0.18em; text-transform:uppercase; padding:16px; cursor:pointer; transition:opacity 0.2s; font-weight:400; }
        .btn:hover { opacity:0.85; }
        .btn:disabled { opacity:0.4; cursor:not-allowed; }
        .back { display:block; text-align:center; margin-top:32px; font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color 0.2s; }
        .back:hover { color:var(--text); }
        .hint { font-size:10px; color:var(--muted); margin-top:24px; line-height:1.7; padding:16px; border:1px solid var(--border); }
        .hint strong { color:var(--accent); }
      `}</style>
      <div className="wrap">
        <div className="box">
          <div className="logo">Panel Admin</div>
          <div className="sub">Acceso privado · Tu Portafolio</div>
          <div className="divider" />
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoFocus
                required
              />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div className="err">{error}</div>}
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Verificando..." : "Ingresar →"}
            </button>
          </form>
          <div className="hint">
            <strong>¿Primera vez?</strong> Ve a tu dashboard de Supabase →{" "}
            <strong>Authentication → Users → Invite user</strong> y crea tu
            usuario administrador con email y contraseña.
          </div>
          <a href="/" className="back">← Volver al portafolio</a>
        </div>
      </div>
    </>
  );
}