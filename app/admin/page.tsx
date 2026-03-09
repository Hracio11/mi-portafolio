"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  fetchProjects, createProject, updateProject, deleteProject, toggleProjectVisibility,
  fetchSiteConfig, updateSiteConfig, uploadLogo, isAuthenticated, logout,
  type Project, type SiteConfig,
} from "@/lib/store";

type Tab = "proyectos" | "info" | "logo";

function uid() { return Math.random().toString(36).slice(2, 10); }

// ─── Project Row ──────────────────────────────────────────────────────────────
function ProjectRow({ project, onEdit, onDelete, onToggle }: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, visible: boolean) => void;
}) {
  return (
    <div className={`proj-row ${!project.visible ? "hidden-row" : ""}`}>
      <div className="proj-info">
        <span className="proj-title">{project.title}</span>
        <span className="proj-meta">{project.category} · {project.year}</span>
      </div>
      <div className="proj-tags-wrap">
        {project.tags.slice(0, 3).map((t) => <span key={t} className="small-tag">{t}</span>)}
      </div>
      <div className="proj-actions">
        <button className="act-btn" onClick={() => onToggle(project.id, !project.visible)} title={project.visible ? "Ocultar" : "Mostrar"}>
          {project.visible ? "👁" : "🙈"}
        </button>
        <button className="act-btn" onClick={() => onEdit(project)}>Editar</button>
        <button className="act-btn danger" onClick={() => onDelete(project.id)}>Eliminar</button>
      </div>
    </div>
  );
}

// ─── Project Modal ────────────────────────────────────────────────────────────
function ProjectModal({ project, onSave, onClose }: {
  project: Project | null;
  onSave: (p: Omit<Project, "id"> & { id?: string }) => void;
  onClose: () => void;
}) {
  const isNew = !project?.id;
  const [form, setForm] = useState<Omit<Project, "id"> & { id?: string }>(
    project ?? { title: "", category: "", year: new Date().getFullYear().toString(), description: "", tags: [], link: "", image_url: "", visible: true, order: 0 }
  );
  const [tagsInput, setTagsInput] = useState((project?.tags ?? []).join(", "));

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{isNew ? "Nuevo proyecto" : "Editar proyecto"}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="field-group full">
              <label>Título *</label>
              <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Nombre del proyecto" />
            </div>
            <div className="field-group">
              <label>Categoría</label>
              <input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Product Design" />
            </div>
            <div className="field-group">
              <label>Año</label>
              <input value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="2024" />
            </div>
            <div className="field-group full">
              <label>Descripción</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="Breve descripción..." />
            </div>
            <div className="field-group full">
              <label>Tags (separados por coma)</label>
              <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Figma, Research, Prototyping" />
            </div>
            <div className="field-group full">
              <label>URL del proyecto</label>
              <input value={form.link ?? ""} onChange={(e) => set("link", e.target.value)} placeholder="https://..." />
            </div>
            <div className="field-group full">
              <label>URL de imagen</label>
              <input value={form.image_url ?? ""} onChange={(e) => set("image_url", e.target.value)} placeholder="https://..." />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={() => {
            if (!form.title.trim()) return;
            onSave({ ...form, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) });
          }}>
            {isNew ? "Crear proyecto" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
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
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      const auth = await isAuthenticated();
      if (!auth) { router.replace("/admin/login"); return; }
      const [projs, cfg] = await Promise.all([fetchProjects(), fetchSiteConfig()]);
      setProjects(projs);
      setConfig(cfg);
      setLoading(false);
    })();
  }, [router]);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  // ── Projects ──
  const handleSaveProject = async (p: Omit<Project, "id"> & { id?: string }) => {
    if (p.id) {
      const updated = await updateProject(p.id, p);
      setProjects((prev) => prev.map((x) => x.id === updated.id ? updated : x));
    } else {
      const created = await createProject({ ...p, order: projects.length });
      setProjects((prev) => [...prev, created]);
    }
    setShowModal(false);
    flash();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    flash();
  };

  const handleToggle = async (id: string, visible: boolean) => {
    await toggleProjectVisibility(id, visible);
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, visible } : p));
    flash();
  };

  // ── Config ──
  const setConfigField = (k: keyof SiteConfig, v: any) =>
    setConfig((c) => c ? { ...c, [k]: v } : c);

  const handleSaveConfig = async () => {
    if (!config) return;
    await updateSiteConfig(config);
    flash();
  };

  const handleStatChange = (i: number, field: "label" | "value", val: string) => {
    if (!config) return;
    const stats = [...config.stats];
    stats[i] = { ...stats[i], [field]: val };
    setConfig({ ...config, stats });
  };

  // ── Logo ──
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !config) return;
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      const updated = { ...config, logo_image_url: url };
      setConfig(updated);
      await updateSiteConfig({ logo_image_url: url });
      flash();
    } catch (err) {
      alert("Error subiendo el logo. Asegúrate de haber creado el bucket 'assets' en Supabase Storage.");
    }
    setUploading(false);
  };

  const handleLogout = async () => { await logout(); router.push("/admin/login"); };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E0E0E", color: "#666", fontFamily: "monospace", fontSize: "12px", letterSpacing: "0.14em" }}>
      Cargando...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --bg:#0E0E0E; --surface:#141414; --surface2:#1C1C1C; --border:#252525; --text:#F0EDE8; --muted:#666; --accent:#C5A882; --danger:#C57070; --serif:'Cormorant Garamond',Georgia,serif; --mono:'DM Mono',monospace; }
        body { background:var(--bg); color:var(--text); font-family:var(--mono); font-size:13px; }
        * { cursor:default; }
        .layout { display:flex; min-height:100vh; }
        .sidebar { width:220px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:32px 0; position:fixed; top:0; left:0; bottom:0; }
        .sidebar-logo { font-family:var(--serif); font-size:20px; font-weight:300; padding:0 24px 8px; }
        .sidebar-role { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); padding:0 24px 32px; }
        .sidebar-divider { height:1px; background:var(--border); margin:0 24px 24px; }
        .sidebar-nav { flex:1; }
        .nav-item { display:flex; align-items:center; gap:12px; width:100%; padding:12px 24px; background:none; border:none; border-left:2px solid transparent; color:var(--muted); font-family:var(--mono); font-size:11px; font-weight:300; letter-spacing:0.12em; text-transform:uppercase; text-align:left; transition:color 0.2s, background 0.2s; }
        .nav-item:hover { color:var(--text); background:var(--surface2); }
        .nav-item.active { color:var(--accent); border-left-color:var(--accent); }
        .sidebar-bottom { padding:24px; }
        .view-btn { display:block; width:100%; padding:10px; border:1px solid var(--border); background:none; color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; text-decoration:none; text-align:center; transition:color 0.2s, border-color 0.2s; margin-bottom:10px; }
        .view-btn:hover { color:var(--text); border-color:var(--text); }
        .logout-btn { display:block; width:100%; padding:10px; background:none; border:none; color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; text-align:center; transition:color 0.2s; }
        .logout-btn:hover { color:var(--danger); }
        .main { margin-left:220px; flex:1; padding:48px; max-width:900px; }
        .page-header { margin-bottom:40px; padding-bottom:24px; border-bottom:1px solid var(--border); display:flex; align-items:baseline; justify-content:space-between; }
        .page-title { font-family:var(--serif); font-size:40px; font-weight:300; line-height:1; }
        .saved-badge { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--accent); opacity:0; transition:opacity 0.3s; }
        .saved-badge.show { opacity:1; }
        .projects-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
        .projects-count { font-size:11px; color:var(--muted); }
        .btn-new { background:var(--accent); border:none; color:#0E0E0E; font-family:var(--mono); font-size:10px; font-weight:400; letter-spacing:0.16em; text-transform:uppercase; padding:10px 24px; cursor:pointer; transition:opacity 0.2s; }
        .btn-new:hover { opacity:0.85; }
        .projects-list { display:flex; flex-direction:column; gap:2px; }
        .proj-row { display:flex; align-items:center; gap:24px; padding:20px 24px; background:var(--surface); border:1px solid var(--border); transition:border-color 0.2s; }
        .proj-row:hover { border-color:#3A3A3A; }
        .hidden-row { opacity:0.4; }
        .proj-info { flex:1; min-width:0; }
        .proj-title { display:block; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:4px; }
        .proj-meta { font-size:10px; color:var(--muted); }
        .proj-tags-wrap { display:flex; gap:6px; flex-wrap:wrap; }
        .small-tag { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); border:1px solid var(--border); padding:3px 8px; }
        .proj-actions { display:flex; gap:8px; flex-shrink:0; }
        .act-btn { font-family:var(--mono); font-size:10px; letter-spacing:0.1em; text-transform:uppercase; background:none; border:1px solid var(--border); color:var(--muted); padding:6px 14px; cursor:pointer; transition:color 0.2s, border-color 0.2s; }
        .act-btn:hover { color:var(--text); border-color:var(--text); }
        .act-btn.danger:hover { color:var(--danger); border-color:var(--danger); }
        .form-section { background:var(--surface); border:1px solid var(--border); padding:40px; margin-bottom:24px; }
        .form-section-title { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:28px; padding-bottom:16px; border-bottom:1px solid var(--border); }
        .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; }
        .field-group { display:flex; flex-direction:column; gap:8px; }
        .field-group.full { grid-column:1/-1; }
        .field-group label { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); }
        .field-group input, .field-group textarea { background:var(--surface2); border:1px solid var(--border); color:var(--text); font-family:var(--mono); font-size:13px; font-weight:300; padding:12px 14px; outline:none; transition:border-color 0.2s; resize:vertical; width:100%; }
        .field-group input:focus, .field-group textarea:focus { border-color:var(--accent); }
        .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:20px; }
        .stat-pair { display:flex; gap:10px; }
        .save-bar { display:flex; justify-content:flex-end; margin-top:32px; }
        .btn-save-main { background:var(--accent); border:none; color:#0E0E0E; font-family:var(--mono); font-size:11px; font-weight:400; letter-spacing:0.16em; text-transform:uppercase; padding:14px 40px; cursor:pointer; transition:opacity 0.2s; }
        .btn-save-main:hover { opacity:0.85; }
        .btn-save-main:disabled { opacity:0.4; }
        .logo-preview-area { display:flex; align-items:center; gap:32px; padding:32px; background:var(--surface2); border:1px dashed var(--border); margin-bottom:24px; }
        .logo-preview-img { height:64px; object-fit:contain; background:#fff; padding:8px; }
        .logo-preview-text { font-family:var(--serif); font-size:32px; font-weight:300; }
        .logo-preview-label { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); margin-bottom:6px; }
        .btn-upload { display:inline-block; background:none; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; padding:10px 24px; cursor:pointer; transition:color 0.2s, border-color 0.2s; }
        .btn-upload:hover { color:var(--text); border-color:var(--text); }
        .btn-remove { background:none; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.12em; text-transform:uppercase; padding:10px 20px; cursor:pointer; margin-left:10px; transition:color 0.2s; }
        .btn-remove:hover { color:var(--danger); border-color:var(--danger); }
        .storage-hint { font-size:10px; color:var(--muted); margin-top:12px; line-height:1.7; padding:14px; border:1px solid var(--border); }
        .storage-hint strong { color:var(--accent); }
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; z-index:200; padding:24px; }
        .modal { background:var(--surface); border:1px solid var(--border); width:100%; max-width:600px; max-height:90vh; overflow-y:auto; display:flex; flex-direction:column; }
        .modal-header { display:flex; justify-content:space-between; align-items:center; padding:24px 32px; border-bottom:1px solid var(--border); }
        .modal-title { font-family:var(--serif); font-size:24px; font-weight:300; }
        .modal-close { background:none; border:none; color:var(--muted); font-size:16px; cursor:pointer; transition:color 0.2s; }
        .modal-close:hover { color:var(--text); }
        .modal-body { padding:32px; }
        .modal-footer { padding:24px 32px; border-top:1px solid var(--border); display:flex; justify-content:flex-end; gap:12px; }
        .btn-cancel { background:none; border:1px solid var(--border); color:var(--muted); font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; padding:10px 24px; cursor:pointer; }
        .btn-cancel:hover { color:var(--text); }
        .btn-save { background:var(--accent); border:none; color:#0E0E0E; font-family:var(--mono); font-size:10px; font-weight:400; letter-spacing:0.14em; text-transform:uppercase; padding:10px 28px; cursor:pointer; }
        .btn-save:hover { opacity:0.85; }
      `}</style>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">Panel Admin</div>
          <div className="sidebar-role">Tu portafolio</div>
          <div className="sidebar-divider" />
          <nav className="sidebar-nav">
            {([
              { id: "proyectos", icon: "◈", label: "Proyectos" },
              { id: "info", icon: "◉", label: "Información" },
              { id: "logo", icon: "◎", label: "Logo / Marca" },
            ] as { id: Tab; icon: string; label: string }[]).map((item) => (
              <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}>
                <span>{item.icon}</span>{item.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <a href="/" target="_blank" className="view-btn">Ver portafolio ↗</a>
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </aside>

        <main className="main">
          <div className="page-header">
            <h1 className="page-title">
              {tab === "proyectos" && "Proyectos"}
              {tab === "info" && "Información"}
              {tab === "logo" && "Logo y Marca"}
            </h1>
            <span className={`saved-badge ${saved ? "show" : ""}`}>✓ Guardado en Supabase</span>
          </div>

          {/* ── PROYECTOS ── */}
          {tab === "proyectos" && (
            <>
              <div className="projects-toolbar">
                <span className="projects-count">{projects.length} proyecto{projects.length !== 1 ? "s" : ""}</span>
                <button className="btn-new" onClick={() => { setEditingProject(null); setShowModal(true); }}>
                  + Nuevo proyecto
                </button>
              </div>
              <div className="projects-list">
                {projects.length === 0 && (
                  <p style={{ color: "var(--muted)", fontSize: "12px", padding: "40px 0", textAlign: "center" }}>
                    No hay proyectos aún. ¡Crea el primero!
                  </p>
                )}
                {projects.map((p) => (
                  <ProjectRow key={p.id} project={p}
                    onEdit={(p) => { setEditingProject(p); setShowModal(true); }}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                  />
                ))}
              </div>
            </>
          )}

          {/* ── INFO ── */}
          {tab === "info" && config && (
            <>
              <div className="form-section">
                <div className="form-section-title">Datos personales</div>
                <div className="form-grid">
                  <div className="field-group">
                    <label>Nombre completo</label>
                    <input value={config.name} onChange={(e) => setConfigField("name", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Ubicación</label>
                    <input value={config.location} onChange={(e) => setConfigField("location", e.target.value)} />
                  </div>
                  <div className="field-group full">
                    <label>Tagline (frase del hero)</label>
                    <input value={config.tagline} onChange={(e) => setConfigField("tagline", e.target.value)} />
                  </div>
                  <div className="field-group full">
                    <label>Bio</label>
                    <textarea rows={4} value={config.bio} onChange={(e) => setConfigField("bio", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="form-section-title">Contacto y redes</div>
                <div className="form-grid">
                  <div className="field-group">
                    <label>Email</label>
                    <input value={config.email} onChange={(e) => setConfigField("email", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>URL del CV</label>
                    <input value={config.cv_url} onChange={(e) => setConfigField("cv_url", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>LinkedIn</label>
                    <input value={config.linkedin} onChange={(e) => setConfigField("linkedin", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Behance</label>
                    <input value={config.behance} onChange={(e) => setConfigField("behance", e.target.value)} />
                  </div>
                  <div className="field-group">
                    <label>Dribbble</label>
                    <input value={config.dribbble} onChange={(e) => setConfigField("dribbble", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="form-section">
                <div className="form-section-title">Estadísticas</div>
                <div className="stats-grid">
                  {config.stats.map((stat, i) => (
                    <div key={i} className="stat-pair">
                      <input value={stat.value} onChange={(e) => handleStatChange(i, "value", e.target.value)} placeholder="6+" style={{ width: "80px", flexShrink: 0 }} />
                      <input value={stat.label} onChange={(e) => handleStatChange(i, "label", e.target.value)} placeholder="Años de experiencia" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="save-bar">
                <button className="btn-save-main" onClick={handleSaveConfig}>Guardar información →</button>
              </div>
            </>
          )}

          {/* ── LOGO ── */}
          {tab === "logo" && config && (
            <>
              <div className="form-section">
                <div className="form-section-title">Vista previa del logo</div>
                <div className="logo-preview-area">
                  {config.logo_image_url
                    ? <img src={config.logo_image_url} alt="Logo" className="logo-preview-img" />
                    : <span className="logo-preview-text">{config.logo_text || "Tu Nombre"}</span>
                  }
                  <div>
                    <div className="logo-preview-label">
                      {config.logo_image_url ? "Logo imagen activo" : "Usando texto como logo"}
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--muted)", lineHeight: 1.7 }}>
                      Sube una imagen PNG o SVG para usar como logo,<br />
                      o usa tu nombre en tipografía Cormorant.
                    </p>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="field-group full">
                    <label>Texto del logo</label>
                    <input value={config.logo_text} onChange={(e) => setConfigField("logo_text", e.target.value)} placeholder="Tu Nombre" />
                  </div>
                  <div className="field-group full">
                    <label>Subir imagen de logo</label>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "4px" }}>
                      <button className="btn-upload" onClick={() => logoInputRef.current?.click()} disabled={uploading}>
                        {uploading ? "Subiendo..." : "Subir archivo"}
                      </button>
                      {config.logo_image_url && (
                        <button className="btn-remove" onClick={async () => {
                          const updated = { ...config, logo_image_url: "" };
                          setConfig(updated);
                          await updateSiteConfig({ logo_image_url: "" });
                          flash();
                        }}>
                          Quitar imagen
                        </button>
                      )}
                    </div>
                    <input ref={logoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleLogoUpload} />
                    <div className="storage-hint">
                      <strong>Requiere Supabase Storage:</strong> Ve a tu dashboard →{" "}
                      <strong>Storage → New bucket</strong>, nómbralo <strong>assets</strong> y
                      márcalo como <strong>público</strong>. El logo se subirá ahí automáticamente.
                    </div>
                  </div>
                </div>
              </div>
              <div className="save-bar">
                <button className="btn-save-main" onClick={handleSaveConfig}>Guardar marca →</button>
              </div>
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