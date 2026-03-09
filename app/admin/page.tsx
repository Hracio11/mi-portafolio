"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchProjects, createProject, updateProject, deleteProject, toggleProjectVisibility,
  fetchSiteConfig, updateSiteConfig, uploadLogo, isAuthenticated, logout,
  type Project, type SiteConfig,
} from "@/lib/store";

type Tab = "proyectos" | "info" | "skills" | "exp" | "logo";

function ProjectRow({ project, onEdit, onDelete, onToggle }: {
  project: Project; onEdit: (p: Project) => void; onDelete: (id: string) => void; onToggle: (id: string, v: boolean) => void;
}) {
  return (
    <div className={`proj-row ${!project.visible ? "hidden" : ""}`}>
      <div className="proj-info">
        <span className="proj-name">{project.title}</span>
        <span className="proj-meta">{project.category} · {project.year}</span>
      </div>
      <div className="proj-tags">
        {project.tags.slice(0, 3).map((t) => <span key={t} className="small-tag">{t}</span>)}
      </div>
      <div className="proj-actions">
        <button className="act-btn" onClick={() => onToggle(project.id, !project.visible)}>{project.visible ? "👁" : "🙈"}</button>
        <button className="act-btn" onClick={() => onEdit(project)}>Editar</button>
        <button className="act-btn danger" onClick={() => onDelete(project.id)}>Eliminar</button>
      </div>
    </div>
  );
}

function ProjectModal({ project, onSave, onClose }: {
  project: Project | null; onSave: (p: any) => void; onClose: () => void;
}) {
  const isNew = !project?.id;
  const [form, setForm] = useState(project ?? { title: "", category: "", year: new Date().getFullYear().toString(), description: "", tags: [], link: "", image_url: "", visible: true, order: 0 });
  const [tagsInput, setTagsInput] = useState((project?.tags ?? []).join(", "));
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title">{isNew ? "Nuevo proyecto" : "Editar proyecto"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="fg full"><label>Título *</label><input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nombre del proyecto" /></div>
          <div className="form-row">
            <div className="fg"><label>Categoría</label><input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Web App" /></div>
            <div className="fg"><label>Año</label><input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2024" /></div>
          </div>
          <div className="fg full"><label>Descripción</label><textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} /></div>
          <div className="fg full"><label>Tags (coma)</label><input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="React, PHP, SQL" /></div>
          <div className="fg full"><label>URL del proyecto</label><input value={form.link ?? ""} onChange={(e) => set("link", e.target.value)} placeholder="https://..." /></div>
          <div className="fg full"><label>URL imagen</label><input value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." /></div>
        </div>
        <div className="modal-foot">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={() => { if (!form.title.trim()) return; onSave({ ...form, tags: tagsInput.split(",").map((t: string) => t.trim()).filter(Boolean) }); }}>
            {isNew ? "Crear" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("proyectos");
  const [projects, setProjects] = useState<Project[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      if (!(await isAuthenticated())) { router.replace("/admin/login"); return; }
      const [projs, cfg] = await Promise.all([fetchProjects(), fetchSiteConfig()]);
      setProjects(projs); setConfig(cfg); setLoading(false);
    })();
  }, [router]);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const setField = (k: keyof SiteConfig, v: any) => setConfig((c) => c ? { ...c, [k]: v } : c);

  const handleSaveProject = async (p: any) => {
    if (p.id && p.id !== "__new__") {
      const updated = await updateProject(p.id, p);
      setProjects((prev) => prev.map((x) => x.id === updated.id ? updated : x));
    } else {
      const { id: _, ...rest } = p;
      const created = await createProject({ ...rest, order: projects.length });
      setProjects((prev) => [...prev, created]);
    }
    setShowModal(false); flash();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar?")) return;
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id)); flash();
  };

  const handleToggle = async (id: string, visible: boolean) => {
    await toggleProjectVisibility(id, visible);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, visible } : p)); flash();
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    await updateSiteConfig(config); flash();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      setConfig({ ...config, logo_image_url: url });
      await updateSiteConfig({ logo_image_url: url }); flash();
    } catch { alert("Error subiendo logo. Crea el bucket 'assets' en Supabase Storage."); }
    setUploading(false);
  };

  const updateArrayField = (field: "skills_tech" | "skills_soft", val: string) => {
    setField(field, val.split(",").map((s) => s.trim()).filter(Boolean));
  };

  if (loading) return <div style={{ minHeight: "100vh", background: "#0F1F16", display: "flex", alignItems: "center", justifyContent: "center", color: "#8AAA98", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.2em" }}>CARGANDO...</div>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --green:#1C3A2A; --green2:#244D38; --dark:#0F1F16; --cream:#F5F0E8; --yellow:#F0C040; --yellow2:#E6A800; --muted:#8AAA98; --border:rgba(240,192,64,0.12); --danger:#C57070; --serif:'Playfair Display',Georgia,serif; --mono:'Space Mono',monospace; }
        body { background:var(--dark); color:var(--cream); font-family:var(--mono); font-size:13px; }
        * { cursor:default; }
        .layout { display:flex; min-height:100vh; }
        .sidebar { width:230px; background:var(--green); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:32px 0; position:fixed; top:0; left:0; bottom:0; }
        .sb-logo { font-family:var(--serif); font-size:22px; font-weight:900; color:var(--yellow); padding:0 24px 4px; }
        .sb-sub { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--muted); padding:0 24px 28px; }
        .sb-line { height:1px; background:var(--border); margin:0 24px 24px; }
        .sb-nav { flex:1; }
        .nav-btn { display:flex; align-items:center; gap:12px; width:100%; padding:12px 24px; background:none; border:none; border-left:2px solid transparent; color:var(--muted); font-family:var(--mono); font-size:10px; font-weight:400; letter-spacing:0.14em; text-transform:uppercase; text-align:left; transition:all 0.2s; }
        .nav-btn:hover { color:var(--cream); background:var(--green2); }
        .nav-btn.active { color:var(--yellow); border-left-color:var(--yellow); background:var(--green2); }
        .sb-bottom { padding:24px; display:flex; flex-direction:column; gap:8px; }
        .view-link { display:block; padding:10px; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; text-decoration:none; text-align:center; transition:all 0.2s; }
        .view-link:hover { color:var(--yellow); border-color:var(--yellow); }
        .logout-btn { background:none; border:none; color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; text-align:center; width:100%; padding:10px; transition:color 0.2s; }
        .logout-btn:hover { color:var(--danger); }
        .main { margin-left:230px; flex:1; padding:48px; max-width:960px; }
        .page-hd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:40px; padding-bottom:24px; border-bottom:1px solid var(--border); }
        .page-title { font-family:var(--serif); font-size:40px; font-weight:900; line-height:1; color:var(--cream); }
        .saved-badge { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--yellow); opacity:0; transition:opacity 0.3s; }
        .saved-badge.show { opacity:1; }
        .toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .count { font-size:11px; color:var(--muted); }
        .btn-new { background:var(--yellow); border:none; color:var(--dark); font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; padding:10px 24px; cursor:pointer; transition:opacity 0.2s; }
        .btn-new:hover { opacity:0.85; }
        .proj-list { display:flex; flex-direction:column; gap:2px; }
        .proj-row { display:flex; align-items:center; gap:20px; padding:18px 24px; background:var(--green); border:1px solid var(--border); transition:border-color 0.2s; }
        .proj-row:hover { border-color:rgba(240,192,64,0.3); }
        .proj-row.hidden { opacity:0.4; }
        .proj-info { flex:1; min-width:0; }
        .proj-name { display:block; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
        .proj-meta { font-size:10px; color:var(--muted); }
        .proj-tags { display:flex; gap:6px; flex-wrap:wrap; }
        .small-tag { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); border:1px solid var(--border); padding:3px 8px; }
        .proj-actions { display:flex; gap:8px; flex-shrink:0; }
        .act-btn { font-family:var(--mono); font-size:10px; letter-spacing:0.1em; text-transform:uppercase; background:none; border:1px solid var(--border); color:var(--muted); padding:6px 12px; cursor:pointer; transition:all 0.2s; }
        .act-btn:hover { color:var(--cream); border-color:var(--cream); }
        .act-btn.danger:hover { color:var(--danger); border-color:var(--danger); }
        .form-block { background:var(--green); border:1px solid var(--border); padding:36px; margin-bottom:20px; }
        .fb-title { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--yellow); margin-bottom:24px; padding-bottom:14px; border-bottom:1px solid var(--border); }
        .fg { display:flex; flex-direction:column; gap:8px; margin-bottom:18px; }
        .fg.full { grid-column:1/-1; }
        .fg label { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); }
        .fg input,.fg textarea { background:var(--green2); border:1px solid var(--border); color:var(--cream); font-family:var(--mono); font-size:13px; padding:12px 14px; outline:none; transition:border-color 0.2s; resize:vertical; width:100%; }
        .fg input:focus,.fg textarea:focus { border-color:var(--yellow); }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
        .stat-pair { display:flex; gap:10px; }
        .save-bar { display:flex; justify-content:flex-end; margin-top:28px; }
        .btn-save-main { background:var(--yellow); border:none; color:var(--dark); font-family:var(--mono); font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; padding:14px 40px; cursor:pointer; transition:opacity 0.2s; }
        .btn-save-main:hover { opacity:0.85; }
        .logo-preview { display:flex; align-items:center; gap:28px; padding:28px; background:var(--green2); border:1px dashed var(--border); margin-bottom:20px; }
        .logo-preview img { height:56px; object-fit:contain; background:#fff; padding:8px; }
        .logo-preview-text { font-family:var(--serif); font-size:28px; font-weight:900; color:var(--yellow); }
        .btn-upload { background:none; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; padding:10px 20px; cursor:pointer; transition:all 0.2s; }
        .btn-upload:hover { color:var(--cream); border-color:var(--cream); }
        .btn-remove { background:none; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; padding:10px 16px; cursor:pointer; margin-left:8px; transition:all 0.2s; }
        .btn-remove:hover { color:var(--danger); border-color:var(--danger); }
        .hint-box { font-size:10px; color:var(--muted); line-height:1.8; padding:14px; border:1px solid var(--border); margin-top:10px; }
        .hint-box strong { color:var(--yellow); }
        /* EXP EDITOR */
        .exp-editor { display:flex; flex-direction:column; gap:16px; }
        .exp-card { background:var(--green2); border:1px solid var(--border); padding:24px; }
        .exp-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .exp-card-num { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--yellow); }
        /* MODAL */
        .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.85); display:flex; align-items:center; justify-content:center; z-index:200; padding:24px; }
        .modal { background:var(--green); border:1px solid var(--border); width:100%; max-width:580px; max-height:90vh; overflow-y:auto; }
        .modal-head { display:flex; justify-content:space-between; align-items:center; padding:24px 28px; border-bottom:1px solid var(--border); }
        .modal-title { font-family:var(--serif); font-size:22px; font-weight:700; }
        .modal-close { background:none; border:none; color:var(--muted); font-size:16px; cursor:pointer; transition:color 0.2s; }
        .modal-close:hover { color:var(--cream); }
        .modal-body { padding:28px; }
        .modal-foot { padding:20px 28px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:12px; }
        .btn-cancel { background:none; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; padding:10px 20px; cursor:pointer; }
        .btn-cancel:hover { color:var(--cream); }
        .btn-save { background:var(--yellow); border:none; color:var(--dark); font-family:var(--mono); font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; padding:10px 24px; cursor:pointer; }
        .btn-save:hover { opacity:0.85; }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="sb-logo">Admin</div>
          <div className="sb-sub">Panel · Horacio Rojas</div>
          <div className="sb-line" />
          <nav className="sb-nav">
            {([
              { id: "proyectos", icon: "◈", label: "Proyectos" },
              { id: "info", icon: "◉", label: "Info personal" },
              { id: "skills", icon: "◎", label: "Skills" },
              { id: "exp", icon: "◆", label: "Experiencia" },
              { id: "logo", icon: "▲", label: "Logo / Marca" },
            ] as { id: Tab; icon: string; label: string }[]).map((item) => (
              <button key={item.id} className={`nav-btn ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="sb-bottom">
            <a href="/" target="_blank" className="view-link">Ver web ↗</a>
            <button className="logout-btn" onClick={async () => { await logout(); router.push("/admin/login"); }}>Cerrar sesión</button>
          </div>
        </aside>

        <main className="main">
          <div className="page-hd">
            <h1 className="page-title">
              {tab === "proyectos" && "Proyectos"}
              {tab === "info" && "Info personal"}
              {tab === "skills" && "Skills"}
              {tab === "exp" && "Experiencia"}
              {tab === "logo" && "Logo y Marca"}
            </h1>
            <span className={`saved-badge ${saved ? "show" : ""}`}>✓ Guardado</span>
          </div>

          {/* PROYECTOS */}
          {tab === "proyectos" && (
            <>
              <div className="toolbar">
                <span className="count">{projects.length} proyectos</span>
                <button className="btn-new" onClick={() => { setEditingProject(null); setShowModal(true); }}>+ Nuevo proyecto</button>
              </div>
              <div className="proj-list">
                {projects.length === 0 && <p style={{ color: "var(--muted)", padding: "40px 0", textAlign: "center", fontSize: "12px" }}>No hay proyectos.</p>}
                {projects.map((p) => (
                  <ProjectRow key={p.id} project={p}
                    onEdit={(p) => { setEditingProject(p); setShowModal(true); }}
                    onDelete={handleDelete} onToggle={handleToggle}
                  />
                ))}
              </div>
            </>
          )}

          {/* INFO */}
          {tab === "info" && config && (
            <>
              <div className="form-block">
                <div className="fb-title">Datos personales</div>
                <div className="form-row">
                  <div className="fg"><label>Nombre</label><input value={config.name} onChange={(e) => setField("name", e.target.value)} /></div>
                  <div className="fg"><label>Ubicación</label><input value={config.location} onChange={(e) => setField("location", e.target.value)} /></div>
                </div>
                <div className="fg"><label>Tagline</label><input value={config.tagline} onChange={(e) => setField("tagline", e.target.value)} /></div>
                <div className="fg"><label>Bio</label><textarea rows={4} value={config.bio} onChange={(e) => setField("bio", e.target.value)} /></div>
              </div>
              <div className="form-block">
                <div className="fb-title">Contacto y redes</div>
                <div className="form-row">
                  <div className="fg"><label>Email</label><input value={config.email} onChange={(e) => setField("email", e.target.value)} /></div>
                  <div className="fg"><label>Teléfono</label><input value={config.phone} onChange={(e) => setField("phone", e.target.value)} /></div>
                </div>
                <div className="form-row">
                  <div className="fg"><label>LinkedIn URL</label><input value={config.linkedin} onChange={(e) => setField("linkedin", e.target.value)} /></div>
                  <div className="fg"><label>GitHub URL</label><input value={config.github} onChange={(e) => setField("github", e.target.value)} /></div>
                </div>
                <div className="fg"><label>URL del CV</label><input value={config.cv_url} onChange={(e) => setField("cv_url", e.target.value)} /></div>
              </div>
              <div className="form-block">
                <div className="fb-title">Estadísticas</div>
                <div className="stats-grid">
                  {config.stats.map((s, i) => (
                    <div key={i} className="stat-pair">
                      <input value={s.value} onChange={(e) => { const st = [...config.stats]; st[i] = { ...st[i], value: e.target.value }; setField("stats", st); }} style={{ width: "80px", flexShrink: 0 }} />
                      <input value={s.label} onChange={(e) => { const st = [...config.stats]; st[i] = { ...st[i], label: e.target.value }; setField("stats", st); }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="save-bar"><button className="btn-save-main" onClick={handleSaveConfig}>Guardar →</button></div>
            </>
          )}

          {/* SKILLS */}
          {tab === "skills" && config && (
            <>
              <div className="form-block">
                <div className="fb-title">Tecnologías (separadas por coma)</div>
                <div className="fg"><label>Skills técnicas</label><input value={config.skills_tech.join(", ")} onChange={(e) => updateArrayField("skills_tech", e.target.value)} placeholder="HTML, CSS, React, PHP..." /></div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                  {config.skills_tech.map((s) => <span key={s} style={{ background: "var(--yellow)", color: "var(--dark)", padding: "4px 12px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700 }}>{s}</span>)}
                </div>
              </div>
              <div className="form-block">
                <div className="fb-title">Habilidades blandas (separadas por coma)</div>
                <div className="fg"><label>Skills blandas</label><input value={config.skills_soft.join(", ")} onChange={(e) => updateArrayField("skills_soft", e.target.value)} placeholder="Comunicación, Trabajo en equipo..." /></div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "8px" }}>
                  {config.skills_soft.map((s) => <span key={s} style={{ border: "1px solid var(--yellow)", color: "var(--yellow)", padding: "4px 12px", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s}</span>)}
                </div>
              </div>
              <div className="save-bar"><button className="btn-save-main" onClick={handleSaveConfig}>Guardar →</button></div>
            </>
          )}

          {/* EXPERIENCIA */}
          {tab === "exp" && config && (
            <>
              <div className="form-block">
                <div className="fb-title">Experiencia laboral</div>
                <div className="exp-editor">
                  {config.experience.map((exp, i) => (
                    <div key={i} className="exp-card">
                      <div className="exp-card-head">
                        <span className="exp-card-num">Trabajo {i + 1}</span>
                        <button className="act-btn danger" onClick={() => { const e = [...config.experience]; e.splice(i, 1); setField("experience", e); }}>Eliminar</button>
                      </div>
                      <div className="form-row">
                        <div className="fg"><label>Cargo</label><input value={exp.role} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], role: e.target.value }; setField("experience", ex); }} /></div>
                        <div className="fg"><label>Empresa</label><input value={exp.company} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], company: e.target.value }; setField("experience", ex); }} /></div>
                      </div>
                      <div className="fg"><label>Período</label><input value={exp.period} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], period: e.target.value }; setField("experience", ex); }} /></div>
                      <div className="fg"><label>Logros (uno por línea)</label><textarea rows={3} value={exp.bullets.join("\n")} onChange={(e) => { const ex = [...config.experience]; ex[i] = { ...ex[i], bullets: e.target.value.split("\n").filter(Boolean) }; setField("experience", ex); }} /></div>
                    </div>
                  ))}
                  <button className="btn-new" style={{ alignSelf: "flex-start" }} onClick={() => setField("experience", [...config.experience, { role: "", company: "", period: "", bullets: [] }])}>
                    + Agregar trabajo
                  </button>
                </div>
              </div>
              <div className="form-block" style={{ marginTop: 0 }}>
                <div className="fb-title">Educación</div>
                <div className="exp-editor">
                  {config.education.map((edu, i) => (
                    <div key={i} className="exp-card">
                      <div className="exp-card-head">
                        <span className="exp-card-num">Educación {i + 1}</span>
                        <button className="act-btn danger" onClick={() => { const e = [...config.education]; e.splice(i, 1); setField("education", e); }}>Eliminar</button>
                      </div>
                      <div className="form-row">
                        <div className="fg"><label>Carrera</label><input value={edu.degree} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], degree: e.target.value }; setField("education", ed); }} /></div>
                        <div className="fg"><label>Institución</label><input value={edu.school} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], school: e.target.value }; setField("education", ed); }} /></div>
                      </div>
                      <div className="form-row">
                        <div className="fg"><label>Período</label><input value={edu.period} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], period: e.target.value }; setField("education", ed); }} /></div>
                        <div className="fg"><label>Detalle</label><input value={edu.detail} onChange={(e) => { const ed = [...config.education]; ed[i] = { ...ed[i], detail: e.target.value }; setField("education", ed); }} /></div>
                      </div>
                    </div>
                  ))}
                  <button className="btn-new" style={{ alignSelf: "flex-start" }} onClick={() => setField("education", [...config.education, { degree: "", school: "", period: "", detail: "" }])}>
                    + Agregar educación
                  </button>
                </div>
              </div>
              <div className="save-bar"><button className="btn-save-main" onClick={handleSaveConfig}>Guardar →</button></div>
            </>
          )}

          {/* LOGO */}
          {tab === "logo" && config && (
            <>
              <div className="form-block">
                <div className="fb-title">Vista previa</div>
                <div className="logo-preview">
                  {config.logo_image_url
                    ? <img src={config.logo_image_url} alt="Logo" />
                    : <span className="logo-preview-text">{config.logo_text || "Tu Nombre"}</span>}
                  <div>
                    <p style={{ fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--yellow)", marginBottom: "6px" }}>
                      {config.logo_image_url ? "Logo imagen activo" : "Usando texto"}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.7 }}>Sube PNG o SVG, o usa texto Playfair Display.</p>
                  </div>
                </div>
                <div className="fg"><label>Texto del logo</label><input value={config.logo_text} onChange={(e) => setField("logo_text", e.target.value)} /></div>
                <div style={{ display: "flex", alignItems: "center", marginTop: "16px" }}>
                  <button className="btn-upload" onClick={() => logoRef.current?.click()} disabled={uploading}>{uploading ? "Subiendo..." : "Subir imagen"}</button>
                  {config.logo_image_url && (
                    <button className="btn-remove" onClick={async () => { setField("logo_image_url", ""); await updateSiteConfig({ logo_image_url: "" }); flash(); }}>Quitar</button>
                  )}
                </div>
                <input ref={logoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                <div className="hint-box"><strong>Requiere</strong> bucket <strong>assets</strong> público en Supabase Storage.</div>
              </div>
              <div className="save-bar"><button className="btn-save-main" onClick={handleSaveConfig}>Guardar →</button></div>
            </>
          )}
        </main>
      </div>

      {showModal && (
        <ProjectModal
          project={editingProject}
          onSave={handleSaveProject}
          onClose={() => { setShowModal(false); setEditingProject(null); }}
        />
      )}
    </>
  );
}