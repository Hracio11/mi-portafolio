"use client";
import { useState, useEffect, useRef } from "react";
import { fetchProjects, fetchSiteConfig, type Project, type SiteConfig } from "@/lib/store";

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [info, setInfo] = useState<SiteConfig | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [projs, cfg] = await Promise.all([fetchProjects(), fetchSiteConfig()]);
      setProjects(projs.filter((p) => p.visible));
      setInfo(cfg);
      setTimeout(() => setLoaded(true), 80);
    })();
  }, []);

  useEffect(() => {
    let cx = 0, cy = 0, tx = 0, ty = 0;
    const move = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; };
    window.addEventListener("mousemove", move);
    const raf = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      if (cursorRef.current) cursorRef.current.style.transform = `translate(${cx - 20}px,${cy - 20}px)`;
      if (cursorDotRef.current) cursorDotRef.current.style.transform = `translate(${tx - 4}px,${ty - 4}px)`;
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.3 }
    );
    ["home", "about", "projects", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [info]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  if (!info) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1C3A2A", color: "#F0C040", fontFamily: "monospace", letterSpacing: "0.2em", fontSize: "12px" }}>
      CARGANDO...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --green: #1C3A2A;
          --green2: #244D38;
          --cream: #F5F0E8;
          --yellow: #F0C040;
          --yellow2: #E6A800;
          --dark: #0F1F16;
          --muted: #8AAA98;
          --serif: 'Playfair Display', Georgia, serif;
          --mono: 'Space Mono', monospace;
        }
        html { scroll-behavior:smooth; }
        body { background:var(--green); color:var(--cream); font-family:var(--mono); cursor:none; overflow-x:hidden; }
        ::selection { background:var(--yellow); color:var(--dark); }

        /* CURSOR */
        .cursor-ring { position:fixed; width:40px; height:40px; border:1.5px solid var(--yellow); border-radius:50%; pointer-events:none; z-index:9999; transition:width 0.2s,height 0.2s,border-color 0.2s; mix-blend-mode:difference; }
        .cursor-dot { position:fixed; width:8px; height:8px; background:var(--yellow); border-radius:50%; pointer-events:none; z-index:9999; }

        /* NAV */
        nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center; padding:20px 48px; background:var(--green); border-bottom:1px solid rgba(240,192,64,0.15); }
        .nav-logo { font-family:var(--serif); font-size:18px; font-weight:700; color:var(--yellow); text-decoration:none; letter-spacing:0.02em; }
        .nav-links { display:flex; gap:36px; list-style:none; align-items:center; }
        .nav-links button { font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; background:none; border:none; color:var(--muted); cursor:none; transition:color 0.2s; }
        .nav-links button:hover,.nav-links button.active { color:var(--cream); }
        .nav-cta { background:var(--yellow); color:var(--dark); font-family:var(--mono); font-size:11px; letter-spacing:0.14em; text-transform:uppercase; border:none; padding:10px 24px; cursor:none; font-weight:700; transition:background 0.2s; }
        .nav-cta:hover { background:var(--yellow2); }

        /* HERO */
        #home { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; position:relative; overflow:hidden; padding-top:80px; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:80px 48px 80px; position:relative; z-index:2; }
        .hero-tag { font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:var(--yellow); margin-bottom:24px; opacity:0; transition:opacity 0.6s 0.2s; display:flex; align-items:center; gap:12px; }
        .hero-tag::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow); }
        .hero-tag.v { opacity:1; }
        .hero-title { font-family:var(--serif); font-size:clamp(56px,7vw,96px); font-weight:900; line-height:0.92; letter-spacing:-0.02em; color:var(--cream); opacity:0; transform:translateY(40px); transition:opacity 0.9s 0.4s,transform 0.9s 0.4s; }
        .hero-title.v { opacity:1; transform:translateY(0); }
        .hero-title .accent { color:var(--yellow); font-style:italic; }
        .hero-bio { margin-top:36px; font-size:13px; line-height:1.8; color:var(--muted); max-width:400px; opacity:0; transition:opacity 0.8s 0.8s; }
        .hero-bio.v { opacity:1; }
        .hero-actions { margin-top:48px; display:flex; gap:20px; align-items:center; opacity:0; transition:opacity 0.8s 1s; }
        .hero-actions.v { opacity:1; }
        .btn-fill { background:var(--yellow); color:var(--dark); font-family:var(--mono); font-size:11px; letter-spacing:0.16em; text-transform:uppercase; border:none; padding:14px 32px; cursor:none; font-weight:700; transition:background 0.2s,transform 0.2s; }
        .btn-fill:hover { background:var(--yellow2); transform:translateY(-2px); }
        .btn-outline { background:none; color:var(--cream); font-family:var(--mono); font-size:11px; letter-spacing:0.16em; text-transform:uppercase; border:1px solid rgba(245,240,232,0.3); padding:14px 32px; cursor:none; transition:border-color 0.2s,color 0.2s; }
        .btn-outline:hover { border-color:var(--yellow); color:var(--yellow); }
        .hero-socials { margin-top:56px; display:flex; gap:24px; opacity:0; transition:opacity 0.8s 1.2s; }
        .hero-socials.v { opacity:1; }
        .social-link { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color 0.2s; cursor:none; }
        .social-link:hover { color:var(--yellow); }

        .hero-right { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .hero-bg-text { position:absolute; font-family:var(--serif); font-size:clamp(100px,14vw,180px); font-weight:900; color:transparent; -webkit-text-stroke:1px rgba(240,192,64,0.12); line-height:0.85; user-select:none; right:-20px; text-align:right; }
        .hero-card { position:relative; z-index:2; background:var(--green2); border:1px solid rgba(240,192,64,0.2); padding:40px; width:280px; }
        .hero-card-label { font-size:9px; letter-spacing:0.22em; text-transform:uppercase; color:var(--yellow); margin-bottom:20px; }
        .hero-card-name { font-family:var(--serif); font-size:28px; font-weight:700; line-height:1.1; margin-bottom:16px; }
        .hero-card-role { font-size:11px; letter-spacing:0.1em; color:var(--muted); margin-bottom:24px; }
        .hero-card-skills { display:flex; flex-direction:column; gap:10px; }
        .skill-bar-item { }
        .skill-bar-label { font-size:9px; letter-spacing:0.12em; text-transform:uppercase; color:var(--muted); margin-bottom:4px; display:flex; justify-content:space-between; }
        .skill-bar-track { height:2px; background:rgba(255,255,255,0.08); }
        .skill-bar-fill { height:100%; background:var(--yellow); transition:width 1.5s ease; }
        .hero-scroll-indicator { position:absolute; bottom:48px; left:48px; display:flex; align-items:center; gap:16px; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); opacity:0; animation:fadeUp 0.8s 1.6s forwards; }
        .scroll-arrow { display:flex; flex-direction:column; gap:3px; }
        .scroll-arrow span { display:block; width:1px; height:8px; background:var(--muted); margin:0 auto; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)} }

        /* ABOUT */
        #about { background:var(--cream); color:var(--dark); padding:120px 48px; }
        .about-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1.2fr; gap:80px; align-items:start; }
        .about-label { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--yellow2); margin-bottom:20px; display:flex; align-items:center; gap:12px; }
        .about-label::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow2); }
        .about-title { font-family:var(--serif); font-size:clamp(48px,5vw,72px); font-weight:900; line-height:0.92; letter-spacing:-0.02em; color:var(--dark); margin-bottom:36px; }
        .about-title em { font-style:italic; color:var(--green); }
        .about-bio { font-size:13px; line-height:1.9; color:#4A5A50; margin-bottom:40px; }
        .about-stats { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .stat-box { background:var(--green); color:var(--cream); padding:28px 24px; }
        .stat-box:nth-child(2) { background:var(--yellow); color:var(--dark); }
        .stat-box:nth-child(4) { background:var(--green2); color:var(--cream); }
        .stat-val { font-family:var(--serif); font-size:48px; font-weight:900; line-height:1; }
        .stat-lbl { font-size:9px; letter-spacing:0.16em; text-transform:uppercase; margin-top:8px; opacity:0.7; }

        .about-right {}
        .skills-section { margin-bottom:48px; }
        .skills-title { font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--green); font-weight:700; margin-bottom:20px; padding-bottom:12px; border-bottom:2px solid var(--green); }
        .skills-wrap { display:flex; flex-wrap:wrap; gap:10px; }
        .skill-pill { font-size:10px; letter-spacing:0.1em; text-transform:uppercase; padding:8px 16px; background:var(--green); color:var(--cream); transition:background 0.2s; cursor:none; }
        .skill-pill:hover { background:var(--yellow); color:var(--dark); }
        .skill-pill.soft { background:transparent; border:1px solid var(--green); color:var(--green); }
        .skill-pill.soft:hover { background:var(--green); color:var(--cream); }

        /* EXPERIENCE */
        .exp-section { margin-top:48px; }
        .exp-item { padding:28px 0; border-bottom:1px solid rgba(28,58,42,0.15); cursor:none; transition:padding-left 0.3s; }
        .exp-item:hover { padding-left:12px; }
        .exp-header { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px; }
        .exp-role { font-family:var(--serif); font-size:20px; font-weight:700; color:var(--dark); }
        .exp-period { font-size:10px; letter-spacing:0.1em; color:var(--green); font-weight:700; }
        .exp-company { font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--yellow2); margin-bottom:12px; font-weight:700; }
        .exp-bullets { padding-left:0; list-style:none; display:flex; flex-direction:column; gap:6px; }
        .exp-bullets li { font-size:12px; line-height:1.6; color:#4A5A50; padding-left:16px; position:relative; }
        .exp-bullets li::before { content:'→'; position:absolute; left:0; color:var(--yellow2); font-size:10px; }

        /* PROJECTS */
        #projects { background:var(--dark); padding:120px 48px; }
        .projects-inner { max-width:1200px; margin:0 auto; }
        .section-header-dark { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:64px; }
        .section-label-dark { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--yellow); display:flex; align-items:center; gap:12px; margin-bottom:16px; }
        .section-label-dark::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow); }
        .section-title-dark { font-family:var(--serif); font-size:clamp(40px,5vw,64px); font-weight:900; line-height:0.92; color:var(--cream); }
        .projects-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .project-card { background:var(--green2); border:1px solid rgba(240,192,64,0.1); padding:48px; position:relative; overflow:hidden; cursor:none; transition:border-color 0.3s,background 0.3s; }
        .project-card:hover { border-color:rgba(240,192,64,0.4); background:#2A5A3E; }
        .project-card::after { content:''; position:absolute; top:0; left:0; width:3px; height:0; background:var(--yellow); transition:height 0.4s; }
        .project-card:hover::after { height:100%; }
        .pc-meta { display:flex; justify-content:space-between; margin-bottom:28px; }
        .pc-cat { font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:var(--yellow); }
        .pc-year { font-size:9px; color:var(--muted); }
        .pc-title { font-family:var(--serif); font-size:32px; font-weight:700; line-height:1.1; color:var(--cream); margin-bottom:16px; transition:color 0.3s; }
        .project-card:hover .pc-title { color:var(--yellow); }
        .pc-desc { font-size:12px; line-height:1.8; color:var(--muted); margin-bottom:28px; }
        .pc-tags { display:flex; gap:8px; flex-wrap:wrap; }
        .pc-tag { font-size:9px; letter-spacing:0.12em; text-transform:uppercase; border:1px solid rgba(240,192,64,0.2); color:var(--muted); padding:4px 12px; transition:all 0.2s; }
        .project-card:hover .pc-tag { border-color:var(--yellow); color:var(--yellow); }
        .pc-arrow { position:absolute; bottom:48px; right:48px; font-size:24px; color:rgba(240,192,64,0.2); transition:all 0.3s; }
        .project-card:hover .pc-arrow { color:var(--yellow); transform:translate(4px,-4px); }
        .pc-img { width:100%; aspect-ratio:16/9; object-fit:cover; margin-bottom:28px; opacity:0.85; }

        /* CONTACT */
        #contact { background:var(--green); padding:120px 48px; }
        .contact-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.2fr 1fr; gap:80px; align-items:start; }
        .contact-label { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--yellow); display:flex; align-items:center; gap:12px; margin-bottom:20px; }
        .contact-label::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow); }
        .contact-title { font-family:var(--serif); font-size:clamp(40px,5vw,72px); font-weight:900; line-height:0.92; color:var(--cream); margin-bottom:48px; }
        .contact-title em { color:var(--yellow); font-style:italic; }
        .contact-email { font-family:var(--serif); font-size:clamp(20px,2.5vw,32px); font-weight:700; color:var(--cream); text-decoration:none; display:inline-block; position:relative; transition:color 0.3s; cursor:none; }
        .contact-email::after { content:''; position:absolute; bottom:-4px; left:0; width:100%; height:2px; background:var(--yellow); transform:scaleX(0); transform-origin:left; transition:transform 0.4s; }
        .contact-email:hover { color:var(--yellow); }
        .contact-email:hover::after { transform:scaleX(1); }
        .contact-details { margin-top:48px; display:flex; flex-direction:column; gap:16px; }
        .contact-detail { display:flex; align-items:center; gap:16px; font-size:12px; color:var(--muted); letter-spacing:0.06em; }
        .contact-detail-icon { width:32px; height:32px; background:var(--green2); display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .contact-right { padding-top:8px; }
        .contact-links { display:flex; flex-direction:column; gap:2px; }
        .contact-link-item { display:flex; align-items:center; justify-content:space-between; padding:20px 24px; background:var(--green2); border:1px solid rgba(240,192,64,0.1); text-decoration:none; cursor:none; transition:background 0.2s,border-color 0.2s; }
        .contact-link-item:hover { background:#2A5A3E; border-color:rgba(240,192,64,0.3); }
        .cli-label { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--cream); }
        .cli-arrow { color:var(--yellow); font-size:18px; transition:transform 0.2s; }
        .contact-link-item:hover .cli-arrow { transform:translate(4px,-4px); }

        /* FOOTER */
        footer { background:var(--dark); padding:32px 48px; display:flex; justify-content:space-between; align-items:center; }
        .footer-text { font-size:10px; letter-spacing:0.14em; color:var(--muted); text-transform:uppercase; }
        .footer-logo { font-family:var(--serif); font-size:18px; font-weight:700; color:var(--yellow); }

        @media (max-width:768px) {
          nav { padding:16px 24px; }
          .nav-links { display:none; }
          #home { grid-template-columns:1fr; }
          .hero-right { display:none; }
          .hero-left { padding:80px 24px 60px; }
          .about-inner { grid-template-columns:1fr; gap:48px; }
          #about { padding:80px 24px; }
          .projects-grid { grid-template-columns:1fr; }
          #projects { padding:80px 24px; }
          .contact-inner { grid-template-columns:1fr; gap:48px; }
          #contact { padding:80px 24px; }
          footer { flex-direction:column; gap:12px; padding:24px; }
        }
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="cursor-ring" />
      <div ref={cursorDotRef} className="cursor-dot" />

      {/* NAV */}
      <nav>
        <span className="nav-logo">
          {info.logo_image_url
            ? <img src={info.logo_image_url} alt={info.logo_text} style={{ height: 32, objectFit: "contain" }} />
            : info.logo_text}
        </span>
        <ul className="nav-links">
          {[
            { id: "home", label: "Inicio" },
            { id: "about", label: "Sobre mí" },
            { id: "projects", label: "Proyectos" },
            { id: "contact", label: "Contacto" },
          ].map((item) => (
            <li key={item.id}>
              <button onClick={() => scrollTo(item.id)} className={activeSection === item.id ? "active" : ""}>
                {item.label}
              </button>
            </li>
          ))}
          <li>
            <button className="nav-cta" onClick={() => scrollTo("contact")}>Contáctame</button>
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section id="home">
        <div className="hero-left">
          <p className={`hero-tag ${loaded ? "v" : ""}`}>Desarrollador Web · Lima, Perú</p>
          <h1 className={`hero-title ${loaded ? "v" : ""}`}>
            {info.name.split(" ")[0]}<br />
            <span className="accent">{info.name.split(" ").slice(1).join(" ")}</span><br />
            Rojas.
          </h1>
          <p className={`hero-bio ${loaded ? "v" : ""}`}>{info.bio.slice(0, 200)}...</p>
          <div className={`hero-actions ${loaded ? "v" : ""}`}>
            <button className="btn-fill" onClick={() => scrollTo("projects")}>Ver proyectos</button>
            <button className="btn-outline" onClick={() => scrollTo("contact")}>Hablemos →</button>
          </div>
          <div className={`hero-socials ${loaded ? "v" : ""}`}>
            {info.linkedin && <a href={info.linkedin} target="_blank" className="social-link">LI: /horacio</a>}
            {info.github && <a href={info.github} target="_blank" className="social-link">GH: /horacio</a>}
            <a href={`mailto:${info.email}`} className="social-link">BE: {info.email}</a>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-bg-text">
            PORT<br />FOLIO<br />WEB
          </div>
          <div className="hero-card">
            <div className="hero-card-label">Stack técnico</div>
            <div className="hero-card-name">{info.logo_text}</div>
            <div className="hero-card-role">Full Stack Developer</div>
            <div className="hero-card-skills">
              {[
                { label: "Frontend", pct: 85 },
                { label: "Backend", pct: 75 },
                { label: "Bases de datos", pct: 80 },
                { label: "React / Next.js", pct: 70 },
              ].map((s) => (
                <div key={s.label} className="skill-bar-item">
                  <div className="skill-bar-label">
                    <span>{s.label}</span>
                    <span>{s.pct}%</span>
                  </div>
                  <div className="skill-bar-track">
                    <div className="skill-bar-fill" style={{ width: loaded ? `${s.pct}%` : "0%" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="scroll-arrow"><span /><span /><span /></div>
          Scroll
        </div>
      </section>

      {/* ABOUT */}
      <section id="about">
        <div className="about-inner">
          <div>
            <div className="about-label">Sobre mí</div>
            <h2 className="about-title">
              Hola,<br />soy <em>Horacio</em>
            </h2>
            <p className="about-bio">{info.bio}</p>
            <div className="about-stats">
              {info.stats.map((s, i) => (
                <div key={i} className="stat-box">
                  <div className="stat-val">{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="about-right">
            <div className="skills-section">
              <div className="skills-title">Tecnologías</div>
              <div className="skills-wrap">
                {info.skills_tech.map((s) => (
                  <span key={s} className="skill-pill">{s}</span>
                ))}
              </div>
            </div>
            <div className="skills-section">
              <div className="skills-title">Habilidades blandas</div>
              <div className="skills-wrap">
                {info.skills_soft.map((s) => (
                  <span key={s} className="skill-pill soft">{s}</span>
                ))}
              </div>
            </div>
            <div className="exp-section">
              <div className="skills-title">Experiencia</div>
              {info.experience.map((e, i) => (
                <div key={i} className="exp-item">
                  <div className="exp-header">
                    <span className="exp-role">{e.role}</span>
                    <span className="exp-period">{e.period}</span>
                  </div>
                  <div className="exp-company">{e.company}</div>
                  <ul className="exp-bullets">
                    {e.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section id="projects">
        <div className="projects-inner">
          <div className="section-header-dark">
            <div>
              <div className="section-label-dark">Proyectos</div>
              <h2 className="section-title-dark">Mi trabajo</h2>
            </div>
          </div>
          {projects.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>Próximamente...</p>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <div key={p.id} className="project-card" onClick={() => p.link && window.open(p.link, "_blank")}>
                  {p.image_url && <img src={p.image_url} alt={p.title} className="pc-img" />}
                  <div className="pc-meta">
                    <span className="pc-cat">{p.category}</span>
                    <span className="pc-year">{p.year}</span>
                  </div>
                  <h3 className="pc-title">{p.title}</h3>
                  <p className="pc-desc">{p.description}</p>
                  <div className="pc-tags">
                    {p.tags.map((t) => <span key={t} className="pc-tag">{t}</span>)}
                  </div>
                  {p.link && <span className="pc-arrow">↗</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact">
        <div className="contact-inner">
          <div>
            <div className="contact-label">Contacto</div>
            <h2 className="contact-title">
              ¿Tienes un<br /><em>proyecto</em>?
            </h2>
            <a href={`mailto:${info.email}`} className="contact-email">{info.email}</a>
            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-detail-icon">📍</div>
                <span>{info.location}</span>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">📞</div>
                <span>{info.phone}</span>
              </div>
            </div>
          </div>
          <div className="contact-right">
            <div className="contact-links">
              {info.linkedin && (
                <a href={info.linkedin} target="_blank" className="contact-link-item">
                  <span className="cli-label">LinkedIn</span>
                  <span className="cli-arrow">↗</span>
                </a>
              )}
              {info.github && (
                <a href={info.github} target="_blank" className="contact-link-item">
                  <span className="cli-label">GitHub</span>
                  <span className="cli-arrow">↗</span>
                </a>
              )}
              {info.cv_url && info.cv_url !== "#" && (
                <a href={info.cv_url} target="_blank" className="contact-link-item">
                  <span className="cli-label">Descargar CV</span>
                  <span className="cli-arrow">↗</span>
                </a>
              )}
              <a href={`mailto:${info.email}`} className="contact-link-item">
                <span className="cli-label">Enviar email</span>
                <span className="cli-arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <span className="footer-text">© 2025 {info.name}</span>
        <span className="footer-logo">{info.logo_text}</span>
        <span className="footer-text">Lima, Perú</span>
      </footer>
    </>
  );
}