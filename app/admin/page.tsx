"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchProjects, createProject, updateProject, deleteProject, toggleProjectVisibility,
  fetchBlogPhotos, createBlogPhoto, updateBlogPhoto, deleteBlogPhoto,
  fetchSiteConfig, updateSiteConfig,
  uploadLogo, uploadProfileImage, uploadBlogPhoto,
  isAuthenticated, logout,
  type Project, type BlogPhoto, type SiteConfig,
} from "@/lib/store";

type Tab = "proyectos" | "blog" | "info" | "gustos" | "skills" | "exp" | "logo";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ProjectRow({ p, onEdit, onDelete, onToggle }: { p: Project; onEdit: (p: Project) => void; onDelete: (id: string) => void; onToggle: (id: string, v: boolean) => void }) {
  return (
    <div className={`row ${!p.visible ? "faded" : ""}`}>
      <div className="row-info"><span className="row-name">{p.title}</span><span className="row-sub">{p.category} · {p.year}</span></div>
      <div className="row-tags">{p.tags.slice(0, 3).map((t) => <span key={t} className="stag">{t}</span>)}</div>
      <div className="row-acts">
        <button className="abtn" onClick={() => onToggle(p.id, !p.visible)}>{p.visible ? "👁" : "🙈"}</button>
        <button className="abtn" onClick={() => onEdit(p)}>Editar</button>
        <button className="abtn red" onClick={() => onDelete(p.id)}>Eliminar</button>
      </div>
    </div>
  );
}

function ProjModal({ project, onSave, onClose }: { project: Project | null; onSave: (p: any) => void; onClose: () => void }) {
  const [form, setForm] = useState<any>(project ?? { title: "", category: "", year: new Date().getFullYear().toString(), description: "", tags: [], link: "", image_url: "", visible: true, order: 0 });
  const [tags, setTags] = useState((project?.tags ?? []).join(", "));
  const s = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  return (
    <div className="moverlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="mhd"><span className="mtitle">{!project?.id ? "Nuevo proyecto" : "Editar"}</span><button className="mclose" onClick={onClose}>✕</button></div>
        <div className="mbody">
          <div className="fg full"><label>Título *</label><input value={form.title} onChange={(e) => s("title", e.target.value)} /></div>
          <div className="frow">
            <div className="fg"><label>Categoría</label><input value={form.category} onChange={(e) => s("category", e.target.value)} /></div>
            <div className="fg"><label>Año</label><input value={form.year} onChange={(e) => s("year", e.target.value)} /></div>
          </div>
          <div className="fg full"><label>Descripción</label><textarea value={form.description} onChange={(e) => s("description", e.target.value)} rows={3} /></div>
          <div className="fg full"><label>Tags (coma)</label><input value={tags} onChange={(e) => setTags(e.target.value)} /></div>
          <div className="fg full"><label>URL proyecto</label><input value={form.link ?? ""} onChange={(e) => s("link", e.target.value)} /></div>
          <div className="fg full"><label>URL imagen</label><input value={form.image_url ?? ""} onChange={(e) => s("image_url", e.target.value)} /></div>
        </div>
        <div className="mft">
          <button className="bcnl" onClick={onClose}>Cancelar</button>
          <button className="bsave" onClick={() => { if (!form.title.trim()) return; onSave({ ...form, tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean) }); }}>Guardar</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("proyectos");
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<BlogPhoto[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [editProj, setEditProj] = useState<Project | null>(null);
  const [showProjModal, setShowProjModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const blogPhotoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      if (!(await isAuthenticated())) { router.replace("/admin/login"); return; }
      const [projs, phs, cfg] = await Promise.all([fetchProjects(), fetchBlogPhotos(), fetchSiteConfig()]);
      setProjects(projs); setPhotos(phs); setConfig(cfg); setLoading(false);
    })();
  }, [router]);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const sf = (k: keyof SiteConfig, v: any) => setConfig((c) => c ? { ...c, [k]: v } : c);

  // ── Projects ──
  const saveProject = async (p: any) => {
    if (p.id) { const u = await updateProject(p.id, p); setProjects((prev) => prev.map((x) => x.id === u.id ? u : x)); }
    else { const { id: _, ...rest } = p; const c = await createProject({ ...rest, order: projects.length }); setProjects((prev) => [...prev, c]); }
    setShowProjModal(false); flash();
  };
  const delProject = async (id: string) => { if (!confirm("¿Eliminar?")) return; await deleteProject(id); setProjects((p) => p.filter((x) => x.id !== id)); flash(); };
  const togProject = async (id: string, v: boolean) => { await toggleProjectVisibility(id, v); setProjects((p) => p.map((x) => x.id === id ? { ...x, visible: v } : x)); flash(); };

  // ── Blog photos ──
  const handleBlogUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading("blog");
    for (const file of files) {
      try {
        const url = await uploadBlogPhoto(file);
        const photo = await createBlogPhoto({ image_url: url, caption: "", order: photos.length, visible: true });
        setPhotos((prev) => [...prev, photo]);
      } catch { alert(`Error subiendo ${file.name}`); }
    }
    setUploading(null); flash();
  };
  const updateCaption = async (id: string, caption: string) => {
    await updateBlogPhoto(id, { caption });
    setPhotos((p) => p.map((x) => x.id === id ? { ...x, caption } : x));
  };
  const delPhoto = async (id: string) => { if (!confirm("¿Eliminar foto?")) return; await deleteBlogPhoto(id); setPhotos((p) => p.filter((x) => x.id !== id)); flash(); };
  const togPhoto = async (id: string, v: boolean) => { await updateBlogPhoto(id, { visible: v }); setPhotos((p) => p.map((x) => x.id === id ? { ...x, visible: v } : x)); flash(); };

  // ── Config ──
  const saveConfig = async () => { if (!config) return; await updateSiteConfig(config); flash(); };

  // ── Uploads ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !config) return;
    setUploading("logo");
    try { const url = await uploadLogo(file); setConfig({ ...config, logo_image_url: url }); await updateSiteConfig({ logo_image_url: url }); flash(); }
    catch { alert("Error. Crea bucket 'assets' en Supabase Storage."); }
    setUploading(null);
  };
  const handleProfileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !config) return;
    setUploading("profile");
    try { const url = await uploadProfileImage(file); setConfig({ ...config, profile_image_url: url }); await updateSiteConfig({ profile_image_url: url }); flash(); }
    catch { alert("Error subiendo foto de perfil."); }
    setUploading(null);
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0F1F16", display: "flex", alignItems: "center", justifyContent: "center", color: "#8AAA98", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em" }}>CARGANDO...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --g:#1C3A2A; --g2:#244D38; --g3:#2A5A3E; --dk:#0F1F16; --cr:#F5F0E8; --y:#F0C040; --y2:#E6A800; --mt:#8AAA98; --bd:rgba(240,192,64,0.12); --red:#C57070; --serif:'Playfair Display',Georgia,serif; --mono:'Space Mono',monospace; }
        body { background:var(--dk); color:var(--cr); font-family:var(--mono); font-size:13px; }
        * { cursor:default; }
        .layout { display:flex; min-height:100vh; }
        .sb { width:230px; background:var(--g); border-right:1px solid var(--bd); display:flex; flex-direction:column; padding:28px 0; position:fixed; top:0; left:0; bottom:0; overflow-y:auto; }
        .sb-logo { font-family:var(--serif); font-size:20px; font-weight:900; color:var(--y); padding:0 22px 4px; }
        .sb-sub { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--mt); padding:0 22px 24px; }
        .sb-line { height:1px; background:var(--bd); margin:0 22px 20px; }
        .sb-nav { flex:1; }
        .nb { display:flex; align-items:center; gap:10px; width:100%; padding:11px 22px; background:none; border:none; border-left:2px solid transparent; color:var(--mt); font-family:var(--mono); font-size:10px; font-weight:400; letter-spacing:0.13em; text-transform:uppercase; text-align:left; transition:all 0.2s; }
        .nb:hover { color:var(--cr); background:var(--g2); }
        .nb.active { color:var(--y); border-left-color:var(--y); background:var(--g2); }
        .sb-bot { padding:20px 22px; display:flex; flex-direction:column; gap:8px; }
        .view-a { display:block; padding:9px; border:1px solid var(--bd); color:var(--mt); font-family:var(--mono); font-size:10px; letter-spacing:0.13em; text-transform:uppercase; text-decoration:none; text-align:center; transition:all 0.2s; }
        .view-a:hover { color:var(--y); border-color:var(--y); }
        .lgout { background:none; border:none; color:var(--mt); font-family:var(--mono); font-size:10px; letter-spacing:0.13em; text-transform:uppercase; text-align:center; width:100%; padding:9px; transition:color 0.2s; }
        .lgout:hover { color:var(--red); }
        .main { margin-left:230px; flex:1; padding:44px; max-width:980px; }
        .phd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:36px; padding-bottom:20px; border-bottom:1px solid var(--bd); }
        .ptitle { font-family:var(--serif); font-size:36px; font-weight:900; line-height:1; }
        .sbadge { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--y); opacity:0; transition:opacity 0.3s; }
        .sbadge.on { opacity:1; }
        .tbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .cnt { font-size:11px; color:var(--mt); }
        .bnew { background:var(--y); border:none; color:var(--dk); font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; padding:9px 22px; cursor:pointer; transition:opacity 0.2s; }
        .bnew:hover { opacity:0.85; }
        .bnew:disabled { opacity:0.4; cursor:not-allowed; }
        .rows { display:flex; flex-direction:column; gap:2px; }
        .row { display:flex; align-items:center; gap:18px; padding:16px 22px; background:var(--g); border:1px solid var(--bd); transition:border-color 0.2s; }
        .row:hover { border-color:rgba(240,192,64,0.25); }
        .row.faded { opacity:0.4; }
        .row-info { flex:1; min-width:0; }
        .row-name { display:block; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:3px; }
        .row-sub { font-size:10px; color:var(--mt); }
        .row-tags { display:flex; gap:5px; flex-wrap:wrap; }
        .stag { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:var(--mt); border:1px solid var(--bd); padding:2px 7px; }
        .row-acts { display:flex; gap:6px; flex-shrink:0; }
        .abtn { font-family:var(--mono); font-size:9px; letter-spacing:0.1em; text-transform:uppercase; background:none; border:1px solid var(--bd); color:var(--mt); padding:5px 10px; cursor:pointer; transition:all 0.2s; }
        .abtn:hover { color:var(--cr); border-color:var(--cr); }
        .abtn.red:hover { color:var(--red); border-color:var(--red); }
        /* Blog photo grid */
        .pgrid { display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:4px; }
        .pitem { position:relative; aspect-ratio:1; overflow:hidden; background:var(--g); }
        .pitem img { width:100%; height:100%; object-fit:cover; display:block; }
        .pitem-overlay { position:absolute; inset:0; background:rgba(0,0,0,0.6); display:flex; flex-direction:column; justify-content:flex-end; padding:12px; opacity:0; transition:opacity 0.2s; }
        .pitem:hover .pitem-overlay { opacity:1; }
        .pcap-input { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:var(--cr); font-family:var(--mono); font-size:10px; padding:6px 8px; width:100%; outline:none; margin-bottom:8px; }
        .pcap-input:focus { border-color:var(--y); }
        .pitem-acts { display:flex; gap:6px; }
        .pitem-btn { font-family:var(--mono); font-size:9px; letter-spacing:0.1em; text-transform:uppercase; background:none; border:1px solid rgba(255,255,255,0.3); color:var(--cr); padding:4px 10px; cursor:pointer; transition:all 0.2s; flex:1; }
        .pitem-btn:hover { border-color:var(--y); color:var(--y); }
        .pitem-btn.del:hover { border-color:var(--red); color:var(--red); }
        /* Forms */
        .fblock { background:var(--g); border:1px solid var(--bd); padding:32px; margin-bottom:18px; }
        .fbt { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--y); margin-bottom:22px; padding-bottom:12px; border-bottom:1px solid var(--bd); }
        .fg { display:flex; flex-direction:column; gap:7px; margin-bottom:16px; }
        .fg.full { grid-column:1/-1; }
        .fg label { font-size:10px; letter-spacing:0.15em; text-transform:uppercase; color:var(--mt); }
        .fg input,.fg textarea { background:var(--g2); border:1px solid var(--bd); color:var(--cr); font-family:var(--mono); font-size:12px; padding:11px 13px; outline:none; transition:border-color 0.2s; resize:vertical; width:100%; }
        .fg input:focus,.fg textarea:focus { border-color:var(--y); }
        .frow { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .sgrid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:14px; }
        .spair { display:flex; gap:8px; }
        .sbar { display:flex; justify-content:flex-end; margin-top:24px; }
        .bsm { background:var(--y); border:none; color:var(--dk); font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; padding:13px 36px; cursor:pointer; transition:opacity 0.2s; }
        .bsm:hover { opacity:0.85; }
        /* Profile photo */
        .profile-preview { width:180px; height:220px; object-fit:cover; object-position:center top; border:2px solid var(--bd); display:block; }
        .profile-placeholder { width:180px; height:220px; background:var(--g2); border:2px dashed var(--bd); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; }
        .profile-placeholder span { font-size:36px; }
        .profile-placeholder p { font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:var(--mt); }
        .bup { background:none; border:1px solid var(--bd); color:var(--mt); font-family:var(--mono); font-size:10px; letter-spacing:0.13em; text-transform:uppercase; padding:9px 18px; cursor:pointer; transition:all 0.2s; }
        .bup:hover { color:var(--cr); border-color:var(--cr); }
        .bup:disabled { opacity:0.4; cursor:not-allowed; }
        .brem { background:none; border:1px solid var(--bd); color:var(--mt); font-family:var(--mono); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; padding:9px 14px; cursor:pointer; margin-left:8px; transition:all 0.2s; }
        .brem:hover { color:var(--red); border-color:var(--red); }
        .hint { font-size:10px; color:var(--mt); line-height:1.8; padding:12px; border:1px solid var(--bd); margin-top:10px; }
        .hint strong { color:var(--y); }
        /* Preview chips */
        .chip-y { background:var(--y); color:var(--dk); padding:4px 12px; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; font-weight:700; }
        .chip-o { border:1px solid var(--y); color:var(--y); padding:4px 12px; font-size:9px; letter-spacing:0.1em; text-transform:uppercase; }
        /* Exp cards */
        .ecard { background:var(--g2); border:1px solid var(--bd); padding:22px; margin-bottom:12px; }
        .ecard-hd { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
        .ecard-n { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--y); }
        /* Modal */
        .moverlay { position:fixed; inset:0; background:rgba(0,0,0,0.88); display:flex; align-items:center; justify-content:center; z-index:200; padding:20px; }
        .modal { background:var(--g); border:1px solid var(--bd); width:100%; max-width:560px; max-height:92vh; overflow-y:auto; }
        .mhd { display:flex; justify-content:space-between; align-items:center; padding:22px 26px; border-bottom:1px solid var(--bd); }
        .mtitle { font-family:var(--serif); font-size:20px; font-weight:700; }
        .mclose { background:none; border:none; color:var(--mt); font-size:15px; cursor:pointer; transition:color 0.2s; }
        .mclose:hover { color:var(--cr); }
        .mbody { padding:26px; }
        .mft { padding:18px 26px; border-top:1px solid var(--bd); display:flex; justify-content:flex-end; gap:10px; }
        .bcnl { background:none; border:1px solid var(--bd); color:var(--mt); font-family:var(--mono); font-size:10px; letter-spacing:0.13em; text-transform:uppercase; padding:9px 18px; cursor:pointer; }
        .bcnl:hover { color:var(--cr); }
        .bsave { background:var(--y); border:none; color:var(--dk); font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:0.13em; text-transform:uppercase; padding:9px 22px; cursor:pointer; }
        .bsave:hover { opacity:0.85; }
      `}</style>

      <div className="layout">
        {/* SIDEBAR */}
        <aside className="sb">
          <div className="sb-logo">Admin</div>
          <div className="sb-sub">Horacio Rojas</div>
          <div className="sb-line" />
          <nav className="sb-nav">
            {([
              { id: "proyectos", icon: "◈", label: "Proyectos" },
              { id: "blog", icon: "📷", label: "Blog / Galería" },
              { id: "info", icon: "◉", label: "Info personal" },
              { id: "gustos", icon: "🎯", label: "Mis gustos" },
              { id: "skills", icon: "◎", label: "Skills" },
              { id: "exp", icon: "◆", label: "Experiencia" },
              { id: "logo", icon: "▲", label: "Logo / Fotos" },
            ] as { id: Tab; icon: string; label: string }[]).map((item) => (
              <button key={item.id} className={`nb ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="sb-bot">
            <a href="/" target="_blank" className="view-a">Ver web ↗</a>
            <button className="lgout" onClick={async () => { await logout(); router.push("/admin/login"); }}>Cerrar sesión</button>
          </div>
        </aside>

        <main className="main">
          <div className="phd">
            <h1 className="ptitle">
              {tab === "proyectos" && "Proyectos"}
              {tab === "blog" && "Blog / Galería"}
              {tab === "info" && "Info personal"}
              {tab === "gustos" && "Mis gustos"}
              {tab === "skills" && "Skills"}
              {tab === "exp" && "Experiencia"}
              {tab === "logo" && "Logo y Fotos"}
            </h1>
            <span className={`sbadge ${saved ? "on" : ""}`}>✓ Guardado</span>
          </div>

          {/* ── PROYECTOS ── */}
          {tab === "proyectos" && (
            <>
              <div className="tbar">
                <span className="cnt">{projects.length} proyectos</span>
                <button className="bnew" onClick={() => { setEditProj(null); setShowProjModal(true); }}>+ Nuevo</button>
              </div>
              <div className="rows">
                {projects.length === 0 && <p style={{ color: "var(--mt)", padding: "32px 0", textAlign: "center", fontSize: "11px" }}>Sin proyectos aún.</p>}
                {projects.map((p) => <ProjectRow key={p.id} p={p} onEdit={(p) => { setEditProj(p); setShowProjModal(true); }} onDelete={delProject} onToggle={togProject} />)}
              </div>
            </>
          )}

          {/* ── BLOG ── */}
          {tab === "blog" && (
            <>
              <div className="tbar">
                <span className="cnt">{photos.length} fotos</span>
                <button className="bnew" disabled={uploading === "blog"} onClick={() => blogPhotoRef.current?.click()}>
                  {uploading === "blog" ? "Subiendo..." : "+ Subir fotos"}
                </button>
                <input ref={blogPhotoRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleBlogUpload} />
              </div>
              {photos.length === 0
                ? <p style={{ color: "var(--mt)", padding: "48px 0", textAlign: "center", fontSize: "11px", letterSpacing: "0.1em" }}>📷 Aún no hay fotos. Haz click en "Subir fotos".</p>
                : (
                  <div className="pgrid">
                    {photos.map((photo) => (
                      <div key={photo.id} className="pitem">
                        <img src={photo.image_url} alt={photo.caption || ""} />
                        <div className="pitem-overlay">
                          <input
                            className="pcap-input"
                            placeholder="Descripción (opcional)..."
                            defaultValue={photo.caption || ""}
                            onBlur={(e) => updateCaption(photo.id, e.target.value)}
                          />
                          <div className="pitem-acts">
                            <button className="pitem-btn" onClick={() => togPhoto(photo.id, !photo.visible)}>
                              {photo.visible ? "Ocultar" : "Mostrar"}
                            </button>
                            <button className="pitem-btn del" onClick={() => delPhoto(photo.id)}>Eliminar</button>
                          </div>
                        </div>
                        {!photo.visible && <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.7)", color: "var(--y)", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px" }}>Oculto</div>}
                      </div>
                    ))}
                  </div>
                )
              }
              <div className="hint" style={{ marginTop: 16 }}>
                <strong>Tip:</strong> Puedes subir múltiples fotos a la vez. Pasa el cursor sobre cada foto para editar su descripción u ocultarla. Las fotos se guardan en Supabase Storage (bucket <strong>assets</strong>).
              </div>
            </>
          )}

          {/* ── INFO ── */}
          {tab === "info" && config && (
            <>
              <div className="fblock">
                <div className="fbt">Datos personales</div>
                <div className="frow">
                  <div className="fg"><label>Nombre</label><input value={config.name} onChange={(e) => sf("name", e.target.value)} /></div>
                  <div className="fg"><label>Ubicación</label><input value={config.location} onChange={(e) => sf("location", e.target.value)} /></div>
                </div>
                <div className="fg"><label>Tagline</label><input value={config.tagline} onChange={(e) => sf("tagline", e.target.value)} /></div>
                <div className="fg"><label>Bio</label><textarea rows={4} value={config.bio} onChange={(e) => sf("bio", e.target.value)} /></div>
              </div>
              <div className="fblock">
                <div className="fbt">Contacto y redes</div>
                <div className="frow">
                  <div className="fg"><label>Email</label><input value={config.email} onChange={(e) => sf("email", e.target.value)} /></div>
                  <div className="fg"><label>Teléfono</label><input value={config.phone} onChange={(e) => sf("phone", e.target.value)} /></div>
                </div>
                <div className="frow">
                  <div className="fg"><label>LinkedIn</label><input value={config.linkedin} onChange={(e) => sf("linkedin", e.target.value)} /></div>
                  <div className="fg"><label>GitHub</label><input value={config.github} onChange={(e) => sf("github", e.target.value)} /></div>
                </div>
                <div className="fg"><label>URL del CV</label><input value={config.cv_url} onChange={(e) => sf("cv_url", e.target.value)} /></div>
              </div>
              <div className="fblock">
                <div className="fbt">Estadísticas</div>
                <div className="sgrid">
                  {config.stats.map((s, i) => (
                    <div key={i} className="spair">
                      <input value={s.value} onChange={(e) => { const st = [...config.stats]; st[i] = { ...st[i], value: e.target.value }; sf("stats", st); }} style={{ width: 70, flexShrink: 0 }} />
                      <input value={s.label} onChange={(e) => { const st = [...config.stats]; st[i] = { ...st[i], label: e.target.value }; sf("stats", st); }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="sbar"><button className="bsm" onClick={saveConfig}>Guardar →</button></div>
            </>
          )}

          {/* ── GUSTOS ── */}
          {tab === "gustos" && config && (
            <>
              <div className="fblock">
                <div className="fbt">Hobbies e intereses</div>
                {config.hobbies.map((h, i) => (
                  <div key={i} className="frow" style={{ marginBottom: 10 }}>
                    <div className="fg"><label>Emoji / Ícono</label><input value={h.icon} onChange={(e) => { const hb = [...config.hobbies]; hb[i] = { ...hb[i], icon: e.target.value }; sf("hobbies", hb); }} placeholder="🎮" /></div>
                    <div className="fg"><label>Hobby</label><input value={h.label} onChange={(e) => { const hb = [...config.hobbies]; hb[i] = { ...hb[i], label: e.target.value }; sf("hobbies", hb); }} placeholder="Videojuegos" /></div>
                  </div>
                ))}
                <button className="bnew" style={{ marginTop: 8 }} onClick={() => sf("hobbies", [...config.hobbies, { icon: "⭐", label: "" }])}>+ Agregar hobby</button>
              </div>
              <div className="fblock">
                <div className="fbt">Música que escucho</div>
                {config.music.map((m, i) => (
                  <div key={i} style={{ background: "var(--g2)", padding: 16, marginBottom: 10, border: "1px solid var(--bd)" }}>
                    <div className="frow">
                      <div className="fg"><label>Canción / Álbum</label><input value={m.title} onChange={(e) => { const ms = [...config.music]; ms[i] = { ...ms[i], title: e.target.value }; sf("music", ms); }} /></div>
                      <div className="fg"><label>Artista</label><input value={m.artist} onChange={(e) => { const ms = [...config.music]; ms[i] = { ...ms[i], artist: e.target.value }; sf("music", ms); }} /></div>
                    </div>
                    <div className="frow" style={{ marginTop: 0 }}>
                      <div className="fg"><label>Género</label><input value={m.genre} onChange={(e) => { const ms = [...config.music]; ms[i] = { ...ms[i], genre: e.target.value }; sf("music", ms); }} /></div>
                      <div className="fg" style={{ justifyContent: "flex-end", paddingTop: 22 }}><button className="abtn red" onClick={() => sf("music", config.music.filter((_, j) => j !== i))}>Eliminar</button></div>
                    </div>
                  </div>
                ))}
                <button className="bnew" onClick={() => sf("music", [...config.music, { title: "", artist: "", genre: "" }])}>+ Agregar música</button>
              </div>
              <div className="fblock">
                <div className="fbt">Películas y series favoritas</div>
                {config.movies.map((m, i) => (
                  <div key={i} style={{ background: "var(--g2)", padding: 16, marginBottom: 10, border: "1px solid var(--bd)" }}>
                    <div className="frow">
                      <div className="fg"><label>Título</label><input value={m.title} onChange={(e) => { const mv = [...config.movies]; mv[i] = { ...mv[i], title: e.target.value }; sf("movies", mv); }} /></div>
                      <div className="fg"><label>Año</label><input value={m.year} onChange={(e) => { const mv = [...config.movies]; mv[i] = { ...mv[i], year: e.target.value }; sf("movies", mv); }} /></div>
                    </div>
                    <div className="frow" style={{ marginTop: 0 }}>
                      <div className="fg"><label>Género</label><input value={m.genre} onChange={(e) => { const mv = [...config.movies]; mv[i] = { ...mv[i], genre: e.target.value }; sf("movies", mv); }} /></div>
                      <div className="fg" style={{ justifyContent: "flex-end", paddingTop: 22 }}><button className="abtn red" onClick={() => sf("movies", config.movies.filter((_, j) => j !== i))}>Eliminar</button></div>
                    </div>
                  </div>
                ))}
                <button className="bnew" onClick={() => sf("movies", [...config.movies, { title: "", year: "", genre: "" }])}>+ Agregar película/serie</button>
              </div>
              <div className="fblock">
                <div className="fbt">Frase personal</div>
                <div className="fg"><label>Frase</label><textarea rows={3} value={config.personal_quote} onChange={(e) => sf("personal_quote", e.target.value)} /></div>
                <div className="fg"><label>Autor (puede ser tu nombre)</label><input value={config.personal_quote_author} onChange={(e) => sf("personal_quote_author", e.target.value)} /></div>
              </div>
              <div className="sbar"><button className="bsm" onClick={saveConfig}>Guardar →</button></div>
            </>
          )}

          {/* ── SKILLS ── */}
          {tab === "skills" && config && (
            <>
              <div className="fblock">
                <div className="fbt">Tecnologías (separadas por coma)</div>
                <div className="fg"><input value={config.skills_tech.join(", ")} onChange={(e) => sf("skills_tech", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="HTML, CSS, React, PHP..." /></div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {config.skills_tech.map((s) => <span key={s} className="chip-y">{s}</span>)}
                </div>
              </div>
              <div className="fblock">
                <div className="fbt">Habilidades blandas (separadas por coma)</div>
                <div className="fg"><input value={config.skills_soft.join(", ")} onChange={(e) => sf("skills_soft", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder="Comunicación, Trabajo en equipo..." /></div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {config.skills_soft.map((s) => <span key={s} className="chip-o">{s}</span>)}
                </div>
              </div>
              <div className="sbar"><button className="bsm" onClick={saveConfig}>Guardar →</button></div>
            </>
          )}

          {/* ── EXPERIENCIA ── */}
          {tab === "exp" && config && (
            <>
              <div className="fblock">
                <div className="fbt">Experiencia laboral</div>
                {config.experience.map((exp, i) => (
                  <div key={i} className="ecard">
                    <div className="ecard-hd"><span className="ecard-n">Trabajo {i + 1}</span><button className="abtn red" onClick={() => { const e = [...config.experience]; e.splice(i, 1); sf("experience", e); }}>Eliminar</button></div>
                    <div className="frow">
                      <div className="fg"><label>Cargo</label><input value={exp.role} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], role: e.target.value }; sf("experience", ex); }} /></div>
                      <div className="fg"><label>Empresa</label><input value={exp.company} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], company: e.target.value }; sf("experience", ex); }} /></div>
                    </div>
                    <div className="fg"><label>Período</label><input value={exp.period} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], period: e.target.value }; sf("experience", ex); }} /></div>
                    <div className="fg"><label>Logros (uno por línea)</label><textarea rows={3} value={exp.bullets.join("\n")} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], bullets: e.target.value.split("\n").filter(Boolean) }; sf("experience", ex); }} /></div>
                  </div>
                ))}
                <button className="bnew" onClick={() => sf("experience", [...config.experience, { role: "", company: "", period: "", bullets: [] }])}>+ Agregar trabajo</button>
              </div>
              <div className="fblock">
                <div className="fbt">Educación</div>
                {config.education.map((edu, i) => (
                  <div key={i} className="ecard">
                    <div className="ecard-hd"><span className="ecard-n">Educación {i + 1}</span><button className="abtn red" onClick={() => { const e = [...config.education]; e.splice(i, 1); sf("education", e); }}>Eliminar</button></div>
                    <div className="frow">
                      <div className="fg"><label>Carrera</label><input value={edu.degree} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], degree: e.target.value }; sf("education", ed); }} /></div>
                      <div className="fg"><label>Institución</label><input value={edu.school} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], school: e.target.value }; sf("education", ed); }} /></div>
                    </div>
                    <div className="frow">
                      <div className="fg"><label>Período</label><input value={edu.period} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], period: e.target.value }; sf("education", ed); }} /></div>
                      <div className="fg"><label>Detalle</label><input value={edu.detail} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], detail: e.target.value }; sf("education", ed); }} /></div>
                    </div>
                  </div>
                ))}
                <button className="bnew" onClick={() => sf("education", [...config.education, { degree: "", school: "", period: "", detail: "" }])}>+ Agregar educación</button>
              </div>
              <div className="sbar"><button className="bsm" onClick={saveConfig}>Guardar →</button></div>
            </>
          )}

          {/* ── LOGO / FOTOS ── */}
          {tab === "logo" && config && (
            <>
              {/* Foto de perfil */}
              <div className="fblock">
                <div className="fbt">Foto de perfil (aparece en el hero y "Mis gustos")</div>
                <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
                  <div>
                    {config.profile_image_url
                      ? <img src={config.profile_image_url} alt="Perfil" className="profile-preview" />
                      : <div className="profile-placeholder"><span>📸</span><p>Sin foto</p></div>
                    }
                  </div>
                  <div style={{ paddingTop: 8 }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--y)", marginBottom: 8 }}>
                      {config.profile_image_url ? "Foto activa" : "Sin foto de perfil"}
                    </p>
                    <p style={{ fontSize: 11, color: "var(--mt)", lineHeight: 1.7, marginBottom: 16 }}>
                      Esta foto aparece en el hero<br />y en la sección "Mis gustos".
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="bup" disabled={uploading === "profile"} onClick={() => profileRef.current?.click()}>
                        {uploading === "profile" ? "Subiendo..." : "Subir foto"}
                      </button>
                      {config.profile_image_url && (
                        <button className="brem" onClick={async () => { sf("profile_image_url", ""); await updateSiteConfig({ profile_image_url: "" }); flash(); }}>Quitar</button>
                      )}
                    </div>
                    <input ref={profileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfileUpload} />
                  </div>
                </div>
              </div>
              {/* Logo */}
              <div className="fblock">
                <div className="fbt">Logo del sitio</div>
                <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 20, background: "var(--g2)", border: "1px dashed var(--bd)", marginBottom: 20 }}>
                  {config.logo_image_url
                    ? <img src={config.logo_image_url} alt="Logo" style={{ height: 48, objectFit: "contain", background: "#fff", padding: 6 }} />
                    : <span style={{ fontFamily: "var(--serif)", fontSize: 24, fontWeight: 900, color: "var(--y)" }}>{config.logo_text || "Tu Nombre"}</span>
                  }
                </div>
                <div className="fg"><label>Texto del logo</label><input value={config.logo_text} onChange={(e) => sf("logo_text", e.target.value)} /></div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="bup" disabled={uploading === "logo"} onClick={() => logoRef.current?.click()}>
                    {uploading === "logo" ? "Subiendo..." : "Subir imagen logo"}
                  </button>
                  {config.logo_image_url && (
                    <button className="brem" onClick={async () => { sf("logo_image_url", ""); await updateSiteConfig({ logo_image_url: "" }); flash(); }}>Quitar</button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                <div className="hint"><strong>Requiere</strong> bucket <strong>assets</strong> público en Supabase Storage.</div>
              </div>
              <div className="sbar"><button className="bsm" onClick={saveConfig}>Guardar →</button></div>
            </>
          )}
        </main>
      </div>

      {/* PROJECT MODAL */}
      {showProjModal && <ProjModal project={editProj} onSave={saveProject} onClose={() => { setShowProjModal(false); setEditProj(null); }} />}
    </>
  );
}