"use client";
import { useState, useEffect, useRef } from "react";
import { fetchProjects, fetchSiteConfig, type Project, type SiteConfig } from "@/lib/store";

export default function Portfolio() {
  const [activeSection, setActiveSection] = useState("inicio");
  const [loaded, setLoaded] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [info, setInfo] = useState<SiteConfig | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [projs, cfg] = await Promise.all([fetchProjects(), fetchSiteConfig()]);
      // fetchProjects via RLS only returns visible=true for unauthenticated users
      setProjects(projs);
      setInfo(cfg);
      setTimeout(() => setLoaded(true), 100);
    })();
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current)
        cursorRef.current.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
  };

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.4 }
    );
    ["inicio", "sobre-mi", "proyectos", "contacto"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  if (!info) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F7F5F2", color: "#8C8880", fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.14em" }}>
      Cargando...
    </div>
  );

  const tagWords = info.tagline.split(" ");
  const tagHead = tagWords.slice(0, -1).join(" ");
  const tagLast = tagWords[tagWords.length - 1];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root { --bg:#F7F5F2; --ink:#1A1916; --muted:#8C8880; --accent:#C5A882; --line:#E2DDD8; --serif:'Cormorant Garamond',Georgia,serif; --mono:'DM Mono',monospace; }
        html { scroll-behavior:smooth; }
        body { background:var(--bg); color:var(--ink); font-family:var(--mono); cursor:none; overflow-x:hidden; }
        ::selection { background:var(--accent); color:var(--bg); }
        .cursor { position:fixed; width:12px; height:12px; background:var(--ink); border-radius:50%; pointer-events:none; z-index:9999; mix-blend-mode:multiply; }
        nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center; padding:24px 48px; background:var(--bg); border-bottom:1px solid var(--line); }
        .nav-logo { font-family:var(--serif); font-size:20px; font-weight:300; color:var(--ink); text-decoration:none; display:flex; align-items:center; gap:12px; }
        .nav-logo img { height:32px; object-fit:contain; }
        .nav-links { display:flex; gap:40px; list-style:none; }
        .nav-links button { font-family:var(--mono); font-size:11px; font-weight:300; letter-spacing:0.12em; text-transform:uppercase; background:none; border:none; color:var(--muted); cursor:none; transition:color 0.2s; padding:4px 0; position:relative; }
        .nav-links button::after { content:''; position:absolute; bottom:0; left:0; width:0; height:1px; background:var(--ink); transition:width 0.3s; }
        .nav-links button:hover,.nav-links button.active { color:var(--ink); }
        .nav-links button.active::after,.nav-links button:hover::after { width:100%; }
        section { min-height:100vh; padding:120px 48px 80px; max-width:1200px; margin:0 auto; }
        #inicio { display:flex; flex-direction:column; justify-content:center; padding-top:140px; padding-bottom:80px; position:relative; }
        .hero-label { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); margin-bottom:32px; opacity:0; transform:translateY(20px); transition:opacity 0.8s 0.2s,transform 0.8s 0.2s; }
        .hero-label.v { opacity:1; transform:translateY(0); }
        .hero-name { font-family:var(--serif); font-size:clamp(72px,10vw,130px); font-weight:300; line-height:0.9; letter-spacing:-0.02em; opacity:0; transform:translateY(30px); transition:opacity 0.9s 0.4s,transform 0.9s 0.4s; }
        .hero-name.v { opacity:1; transform:translateY(0); }
        .hero-name em { font-style:italic; color:var(--accent); }
        .hero-tagline { margin-top:48px; max-width:420px; font-size:13px; font-weight:300; line-height:1.8; color:var(--muted); opacity:0; transform:translateY(20px); transition:opacity 0.8s 0.7s,transform 0.8s 0.7s; }
        .hero-tagline.v { opacity:1; transform:translateY(0); }
        .hero-cta { margin-top:56px; display:flex; align-items:center; gap:40px; opacity:0; transition:opacity 0.8s 0.9s; }
        .hero-cta.v { opacity:1; }
        .btn-primary { font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--bg); background:var(--ink); border:none; padding:16px 36px; cursor:none; transition:background 0.3s; }
        .btn-primary:hover { background:var(--accent); }
        .btn-ghost { font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); background:none; border:none; cursor:none; transition:color 0.2s; }
        .btn-ghost:hover { color:var(--ink); }
        .hero-scroll { position:absolute; bottom:48px; right:0; display:flex; align-items:center; gap:12px; font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); opacity:0; animation:fadeIn 1s 1.5s forwards; }
        .scroll-line { width:40px; height:1px; background:var(--muted); animation:expandLine 1.5s 2s ease forwards; transform-origin:left; transform:scaleX(0); }
        @keyframes fadeIn { to { opacity:1; } }
        @keyframes expandLine { to { transform:scaleX(1); } }
        .section-header { display:flex; align-items:baseline; gap:24px; margin-bottom:72px; padding-bottom:24px; border-bottom:1px solid var(--line); }
        .section-number { font-size:10px; letter-spacing:0.2em; color:var(--muted); }
        .section-title { font-family:var(--serif); font-size:clamp(40px,5vw,64px); font-weight:300; line-height:1; }
        #sobre-mi { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        .about-visual { aspect-ratio:4/5; position:relative; overflow:hidden; background:linear-gradient(135deg,#EDE9E4 0%,#E0DAD4 100%); }
        .about-visual::after { content:''; position:absolute; bottom:-20px; right:-20px; width:80px; height:80px; border:1px solid var(--accent); }
        .about-photo-placeholder { width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); }
        .about-text { font-family:var(--serif); font-size:22px; font-weight:300; line-height:1.7; margin-bottom:32px; }
        .about-sub { font-size:12px; font-weight:300; line-height:1.9; color:var(--muted); margin-bottom:48px; }
        .about-stats { display:grid; grid-template-columns:1fr 1fr; gap:32px; padding-top:40px; border-top:1px solid var(--line); }
        .stat-number { font-family:var(--serif); font-size:48px; font-weight:300; line-height:1; }
        .stat-label { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); margin-top:8px; }
        .projects-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .project-card { padding:48px; background:var(--bg); border:1px solid var(--line); cursor:none; transition:border-color 0.4s; position:relative; overflow:hidden; }
        .project-card:hover { border-color:var(--accent); }
        .project-card::before { content:''; position:absolute; inset:0; background:var(--accent); opacity:0; transition:opacity 0.4s; }
        .project-card:hover::before { opacity:0.04; }
        .project-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; }
        .project-category { font-size:10px; letter-spacing:0.18em; text-transform:uppercase; color:var(--muted); }
        .project-year { font-size:10px; color:var(--muted); }
        .project-title { font-family:var(--serif); font-size:36px; font-weight:300; line-height:1.1; margin-bottom:20px; transition:color 0.3s; position:relative; }
        .project-card:hover .project-title { color:var(--accent); }
        .project-desc { font-size:12px; font-weight:300; line-height:1.8; color:var(--muted); margin-bottom:32px; position:relative; }
        .project-tags { display:flex; gap:8px; flex-wrap:wrap; position:relative; }
        .tag { font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); border:1px solid var(--line); padding:5px 12px; transition:border-color 0.3s,color 0.3s; }
        .project-card:hover .tag { border-color:var(--accent); color:var(--ink); }
        .project-arrow { position:absolute; bottom:48px; right:48px; font-size:20px; color:var(--line); transition:color 0.3s,transform 0.3s; }
        .project-card:hover .project-arrow { color:var(--accent); transform:translate(4px,-4px); }
        .project-img { width:100%; aspect-ratio:16/9; object-fit:cover; margin-bottom:24px; display:block; position:relative; }
        #contacto { display:flex; flex-direction:column; justify-content:center; }
        .contact-big { font-family:var(--serif); font-size:clamp(48px,7vw,96px); font-weight:300; line-height:1; letter-spacing:-0.02em; margin-top:16px; margin-bottom:56px; }
        .contact-big a { color:var(--ink); text-decoration:none; position:relative; transition:color 0.3s; }
        .contact-big a::after { content:''; position:absolute; bottom:4px; left:0; width:100%; height:1px; background:var(--accent); transform:scaleX(0); transform-origin:left; transition:transform 0.4s; }
        .contact-big a:hover { color:var(--accent); }
        .contact-big a:hover::after { transform:scaleX(1); }
        .contact-links { display:flex; gap:40px; flex-wrap:wrap; }
        .contact-link { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); text-decoration:none; display:flex; align-items:center; gap:8px; cursor:none; transition:color 0.2s; }
        .contact-link:hover { color:var(--ink); }
        footer { padding:32px 48px; border-top:1px solid var(--line); display:flex; justify-content:space-between; align-items:center; max-width:1200px; margin:0 auto; }
        .footer-text { font-size:10px; letter-spacing:0.12em; color:var(--muted); }
        @media (max-width:768px) {
          nav { padding:20px 24px; } .nav-links { display:none; }
          section { padding:100px 24px 60px; }
          .projects-grid { grid-template-columns:1fr; }
          #sobre-mi { grid-template-columns:1fr; gap:48px; }
          footer { flex-direction:column; gap:16px; text-align:center; }
        }
      `}</style>

      <div ref={cursorRef} className="cursor" />

      <nav>
        <a href="#" className="nav-logo" style={{ cursor: "none" }}>
          {info.logo_image_url
            ? <img src={info.logo_image_url} alt={info.logo_text} />
            : info.logo_text}
        </a>
        <ul className="nav-links">
          {[
            { id: "inicio", label: "Inicio" },
            { id: "sobre-mi", label: "Sobre mí" },
            { id: "proyectos", label: "Proyectos" },
            { id: "contacto", label: "Contacto" },
          ].map((item) => (
            <li key={item.id}>
              <button onClick={() => scrollTo(item.id)} className={activeSection === item.id ? "active" : ""}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* HERO */}
      <section id="inicio" style={{ maxWidth: "100%", paddingLeft: "48px", paddingRight: "48px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <p className={`hero-label ${loaded ? "v" : ""}`}>UX/UI Designer · {info.location}</p>
          <h1 className={`hero-name ${loaded ? "v" : ""}`}>
            {tagHead}<br /><em>{tagLast}</em>
          </h1>
          <p className={`hero-tagline ${loaded ? "v" : ""}`}>{info.bio.slice(0, 180)}…</p>
          <div className={`hero-cta ${loaded ? "v" : ""}`}>
            <button className="btn-primary" onClick={() => scrollTo("proyectos")}>Ver proyectos</button>
            <button className="btn-ghost" onClick={() => scrollTo("contacto")}>Hablemos →</button>
          </div>
          <div className="hero-scroll"><span className="scroll-line" />Scroll</div>
        </div>
      </section>

      {/* SOBRE MÍ */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>
        <section id="sobre-mi" style={{ padding: "80px 0", minHeight: "auto" }}>
          <div className="about-visual">
            <div className="about-photo-placeholder">Tu foto aquí</div>
          </div>
          <div>
            <div className="section-header" style={{ marginBottom: "40px" }}>
              <span className="section-number">01</span>
              <h2 className="section-title">Sobre mí</h2>
            </div>
            <p className="about-text">Soy diseñadora UX/UI con pasión por resolver problemas complejos a través del diseño simple e intuitivo.</p>
            <p className="about-sub">{info.bio}</p>
            <div className="about-stats">
              {info.stats.map((s, i) => (
                <div key={i}>
                  <div className="stat-number">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* PROYECTOS */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>
        <section id="proyectos" style={{ padding: "80px 0", minHeight: "auto" }}>
          <div className="section-header">
            <span className="section-number">02</span>
            <h2 className="section-title">Proyectos</h2>
          </div>
          {projects.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>Próximamente...</p>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <div key={p.id} className="project-card" onClick={() => p.link && window.open(p.link, "_blank")}>
                  {p.image_url && <img src={p.image_url} alt={p.title} className="project-img" />}
                  <div className="project-meta">
                    <span className="project-category">{p.category}</span>
                    <span className="project-year">{p.year}</span>
                  </div>
                  <h3 className="project-title">{p.title}</h3>
                  <p className="project-desc">{p.description}</p>
                  <div className="project-tags">
                    {p.tags.map((t) => <span key={t} className="tag">{t}</span>)}
                  </div>
                  {p.link && <span className="project-arrow">↗</span>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* CONTACTO */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 48px" }}>
        <section id="contacto" style={{ padding: "80px 0 120px", minHeight: "60vh" }}>
          <div className="section-header">
            <span className="section-number">03</span>
            <h2 className="section-title">Contacto</h2>
          </div>
          <p style={{ fontSize: "13px", color: "var(--muted)", fontWeight: 300, lineHeight: 1.8 }}>¿Tienes un proyecto en mente? Hablemos.</p>
          <div className="contact-big">
            <a href={`mailto:${info.email}`}>{info.email}</a>
          </div>
          <div className="contact-links">
            {info.linkedin && <a href={info.linkedin} target="_blank" className="contact-link"><span>↗</span> LinkedIn</a>}
            {info.behance && <a href={info.behance} target="_blank" className="contact-link"><span>↗</span> Behance</a>}
            {info.dribbble && <a href={info.dribbble} target="_blank" className="contact-link"><span>↗</span> Dribbble</a>}
            {info.cv_url && info.cv_url !== "#" && <a href={info.cv_url} target="_blank" className="contact-link"><span>↗</span> CV — Descargar</a>}
          </div>
        </section>
      </div>

      <footer>
        <span className="footer-text">© 2025 {info.name}. Todos los derechos reservados.</span>
        <span className="footer-text">Diseñado con intención.</span>
      </footer>
    </>
  );
}