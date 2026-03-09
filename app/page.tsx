"use client";
import { useState, useEffect, useRef } from "react";
import { fetchProjects, fetchBlogPhotos, fetchSiteConfig, type Project, type BlogPhoto, type SiteConfig } from "@/lib/store";

export default function Portfolio() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [photos, setPhotos] = useState<BlogPhoto[]>([]);
  const [info, setInfo] = useState<SiteConfig | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [loaded, setLoaded] = useState(false);
  const [lightbox, setLightbox] = useState<BlogPhoto | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const [projs, phs, cfg] = await Promise.all([fetchProjects(), fetchBlogPhotos(), fetchSiteConfig()]);
      setProjects(projs.filter((p) => p.visible));
      setPhotos(phs.filter((p) => p.visible));
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
      { threshold: 0.25 }
    );
    ["home", "about", "personal", "projects", "blog", "contact"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [info]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setLightbox(null); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  if (!info) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F1F16", color: "#F0C040", fontFamily: "monospace", letterSpacing: "0.2em", fontSize: "12px" }}>
      CARGANDO...
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        :root {
          --green:#1C3A2A; --green2:#244D38; --green3:#2A5A3E;
          --cream:#F5F0E8; --yellow:#F0C040; --yellow2:#E6A800;
          --dark:#0F1F16; --muted:#8AAA98; --red:#E05050;
          --serif:'Playfair Display',Georgia,serif;
          --mono:'Space Mono',monospace;
        }
        html { scroll-behavior:smooth; }
        body { background:var(--green); color:var(--cream); font-family:var(--mono); cursor:none; overflow-x:hidden; }
        ::selection { background:var(--yellow); color:var(--dark); }

        .cursor-ring { position:fixed; width:40px; height:40px; border:1.5px solid var(--yellow); border-radius:50%; pointer-events:none; z-index:9999; mix-blend-mode:difference; }
        .cursor-dot { position:fixed; width:8px; height:8px; background:var(--yellow); border-radius:50%; pointer-events:none; z-index:9999; }

        /* ── NAV ── */
        nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; justify-content:space-between; align-items:center; padding:18px 48px; background:rgba(15,31,22,0.95); backdrop-filter:blur(12px); border-bottom:1px solid rgba(240,192,64,0.1); }
        .nav-logo { font-family:var(--serif); font-size:18px; font-weight:900; color:var(--yellow); text-decoration:none; display:flex; align-items:center; gap:10px; }
        .nav-logo img { height:30px; object-fit:contain; }
        .nav-links { display:flex; gap:28px; list-style:none; align-items:center; }
        .nav-links button { font-family:var(--mono); font-size:10px; letter-spacing:0.14em; text-transform:uppercase; background:none; border:none; color:var(--muted); cursor:none; transition:color 0.2s; }
        .nav-links button:hover,.nav-links button.active { color:var(--cream); }
        .nav-cta { background:var(--yellow) !important; color:var(--dark) !important; padding:9px 20px !important; font-weight:700 !important; transition:opacity 0.2s !important; }
        .nav-cta:hover { opacity:0.85 !important; }

        /* ── HERO ── */
        #home { min-height:100vh; display:grid; grid-template-columns:1fr 1fr; position:relative; overflow:hidden; padding-top:80px; }
        .hero-left { display:flex; flex-direction:column; justify-content:center; padding:80px 48px; position:relative; z-index:2; }
        .hero-tag { font-size:10px; letter-spacing:0.24em; text-transform:uppercase; color:var(--yellow); margin-bottom:24px; opacity:0; transition:opacity 0.6s 0.2s; display:flex; align-items:center; gap:12px; }
        .hero-tag::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow); }
        .hero-tag.v { opacity:1; }
        .hero-title { font-family:var(--serif); font-size:clamp(52px,6.5vw,90px); font-weight:900; line-height:0.92; letter-spacing:-0.02em; opacity:0; transform:translateY(40px); transition:opacity 0.9s 0.4s,transform 0.9s 0.4s; }
        .hero-title.v { opacity:1; transform:translateY(0); }
        .hero-title .acc { color:var(--yellow); font-style:italic; }
        .hero-bio { margin-top:32px; font-size:12px; line-height:1.9; color:var(--muted); max-width:380px; opacity:0; transition:opacity 0.8s 0.8s; }
        .hero-bio.v { opacity:1; }
        .hero-btns { margin-top:44px; display:flex; gap:16px; align-items:center; opacity:0; transition:opacity 0.8s 1s; }
        .hero-btns.v { opacity:1; }
        .btn-y { background:var(--yellow); color:var(--dark); font-family:var(--mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; border:none; padding:13px 28px; cursor:none; font-weight:700; transition:background 0.2s; }
        .btn-y:hover { background:var(--yellow2); }
        .btn-o { background:none; color:var(--cream); font-family:var(--mono); font-size:10px; letter-spacing:0.16em; text-transform:uppercase; border:1px solid rgba(245,240,232,0.25); padding:13px 28px; cursor:none; transition:border-color 0.2s,color 0.2s; }
        .btn-o:hover { border-color:var(--yellow); color:var(--yellow); }
        .hero-right { position:relative; display:flex; align-items:center; justify-content:center; overflow:hidden; }
        .hero-photo-wrap { position:relative; z-index:2; }
        .hero-photo { width:340px; height:440px; object-fit:cover; object-position:center top; display:block; }
        .hero-photo-placeholder { width:340px; height:440px; background:var(--green2); border:1px solid rgba(240,192,64,0.15); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; }
        .hero-photo-placeholder span { font-size:48px; }
        .hero-photo-placeholder p { font-size:10px; letter-spacing:0.16em; text-transform:uppercase; color:var(--muted); }
        .hero-photo-badge { position:absolute; bottom:-16px; right:-16px; background:var(--yellow); color:var(--dark); padding:12px 20px; font-size:10px; letter-spacing:0.16em; text-transform:uppercase; font-weight:700; }
        .hero-bg-text { position:absolute; font-family:var(--serif); font-size:clamp(80px,12vw,160px); font-weight:900; color:transparent; -webkit-text-stroke:1px rgba(240,192,64,0.08); line-height:0.85; user-select:none; right:-10px; top:50%; transform:translateY(-50%); }
        .hero-scroll { position:absolute; bottom:40px; left:48px; display:flex; align-items:center; gap:14px; font-size:10px; letter-spacing:0.2em; text-transform:uppercase; color:var(--muted); opacity:0; animation:fadeUp 0.8s 1.6s forwards; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)} }

        /* ── ABOUT ── */
        #about { background:var(--cream); color:var(--dark); padding:120px 48px; }
        .about-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1fr 1.3fr; gap:80px; align-items:start; }
        .sec-label { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--yellow2); display:flex; align-items:center; gap:12px; margin-bottom:16px; }
        .sec-label::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow2); }
        .sec-title { font-family:var(--serif); font-size:clamp(44px,5vw,68px); font-weight:900; line-height:0.92; letter-spacing:-0.02em; margin-bottom:28px; }
        .sec-title em { font-style:italic; color:var(--green); }
        .about-bio { font-size:12px; line-height:1.9; color:#4A5A50; margin-bottom:36px; }
        .about-stats { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .stat-box { background:var(--green); color:var(--cream); padding:24px 20px; }
        .stat-box:nth-child(2) { background:var(--yellow); color:var(--dark); }
        .stat-box:nth-child(4) { background:var(--green2); }
        .stat-val { font-family:var(--serif); font-size:44px; font-weight:900; line-height:1; }
        .stat-lbl { font-size:9px; letter-spacing:0.14em; text-transform:uppercase; margin-top:6px; opacity:0.7; }
        .skills-group { margin-bottom:36px; }
        .skills-gtitle { font-size:9px; letter-spacing:0.2em; text-transform:uppercase; color:var(--green); font-weight:700; margin-bottom:14px; padding-bottom:10px; border-bottom:2px solid var(--green); }
        .skills-wrap { display:flex; flex-wrap:wrap; gap:8px; }
        .pill { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; padding:7px 14px; background:var(--green); color:var(--cream); cursor:none; transition:background 0.2s; }
        .pill:hover { background:var(--yellow); color:var(--dark); }
        .pill.soft { background:transparent; border:1px solid var(--green); color:var(--green); }
        .pill.soft:hover { background:var(--green); color:var(--cream); }
        .exp-item { padding:24px 0; border-bottom:1px solid rgba(28,58,42,0.12); cursor:none; transition:padding-left 0.3s; }
        .exp-item:hover { padding-left:10px; }
        .exp-hd { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px; }
        .exp-role { font-family:var(--serif); font-size:18px; font-weight:700; }
        .exp-period { font-size:9px; letter-spacing:0.1em; color:var(--green); font-weight:700; }
        .exp-co { font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:var(--yellow2); margin-bottom:10px; font-weight:700; }
        .exp-bullets { list-style:none; display:flex; flex-direction:column; gap:5px; }
        .exp-bullets li { font-size:11px; line-height:1.6; color:#4A5A50; padding-left:14px; position:relative; }
        .exp-bullets li::before { content:'→'; position:absolute; left:0; color:var(--yellow2); font-size:9px; top:1px; }

        /* ── PERSONAL ── */
        #personal { background:var(--dark); padding:120px 48px; }
        .personal-inner { max-width:1200px; margin:0 auto; }
        .personal-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; margin-top:64px; }
        .personal-card { background:var(--green); border:1px solid rgba(240,192,64,0.1); padding:40px; transition:border-color 0.3s; }
        .personal-card:hover { border-color:rgba(240,192,64,0.3); }
        .pc-head { display:flex; align-items:center; gap:12px; margin-bottom:28px; }
        .pc-icon { font-size:24px; }
        .pc-card-title { font-family:var(--serif); font-size:22px; font-weight:700; color:var(--yellow); }
        .hobby-grid { display:flex; flex-wrap:wrap; gap:12px; }
        .hobby-item { display:flex; align-items:center; gap:8px; background:var(--green2); padding:10px 16px; border:1px solid rgba(240,192,64,0.1); transition:border-color 0.2s; }
        .hobby-item:hover { border-color:var(--yellow); }
        .hobby-icon { font-size:18px; }
        .hobby-label { font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:var(--cream); }
        .music-list { display:flex; flex-direction:column; gap:12px; }
        .music-item { display:flex; align-items:center; gap:16px; padding:12px 16px; background:var(--green2); border-left:3px solid var(--yellow); }
        .music-disc { width:36px; height:36px; background:var(--yellow); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:14px; flex-shrink:0; }
        .music-info { flex:1; min-width:0; }
        .music-title { font-size:12px; color:var(--cream); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; }
        .music-artist { font-size:10px; color:var(--muted); letter-spacing:0.06em; }
        .music-genre { font-size:9px; letter-spacing:0.14em; text-transform:uppercase; color:var(--yellow); flex-shrink:0; }
        .movie-list { display:flex; flex-direction:column; gap:10px; }
        .movie-item { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:var(--green2); cursor:none; transition:background 0.2s; }
        .movie-item:hover { background:var(--green3); }
        .movie-left { display:flex; align-items:center; gap:12px; }
        .movie-num { font-family:var(--serif); font-size:20px; font-weight:900; color:rgba(240,192,64,0.3); width:28px; }
        .movie-name { font-size:12px; color:var(--cream); }
        .movie-meta { font-size:9px; color:var(--muted); letter-spacing:0.08em; margin-top:2px; }
        .movie-year { font-size:10px; letter-spacing:0.1em; color:var(--yellow); }
        .quote-card { grid-column:1/-1; background:var(--green2); border:1px solid rgba(240,192,64,0.15); padding:56px 48px; position:relative; overflow:hidden; }
        .quote-mark { font-family:var(--serif); font-size:120px; font-weight:900; color:rgba(240,192,64,0.08); position:absolute; top:-20px; left:32px; line-height:1; }
        .quote-text { font-family:var(--serif); font-size:clamp(24px,3vw,38px); font-weight:700; font-style:italic; color:var(--cream); line-height:1.3; position:relative; z-index:1; margin-bottom:20px; }
        .quote-author { font-size:11px; letter-spacing:0.16em; text-transform:uppercase; color:var(--yellow); position:relative; z-index:1; }

        /* ── PROJECTS ── */
        #projects { background:var(--green); padding:120px 48px; }
        .proj-inner { max-width:1200px; margin:0 auto; }
        .sec-hd-green { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:64px; }
        .sec-label-y { font-size:10px; letter-spacing:0.22em; text-transform:uppercase; color:var(--yellow); display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .sec-label-y::before { content:''; display:inline-block; width:24px; height:1px; background:var(--yellow); }
        .sec-title-c { font-family:var(--serif); font-size:clamp(36px,4.5vw,60px); font-weight:900; line-height:0.92; color:var(--cream); }
        .proj-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .proj-card { background:var(--green2); border:1px solid rgba(240,192,64,0.08); padding:44px; position:relative; overflow:hidden; cursor:none; transition:border-color 0.3s,background 0.3s; }
        .proj-card:hover { border-color:rgba(240,192,64,0.35); background:var(--green3); }
        .proj-card::after { content:''; position:absolute; top:0; left:0; width:3px; height:0; background:var(--yellow); transition:height 0.4s; }
        .proj-card:hover::after { height:100%; }
        .proj-meta { display:flex; justify-content:space-between; margin-bottom:24px; }
        .proj-cat { font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:var(--yellow); }
        .proj-year { font-size:9px; color:var(--muted); }
        .proj-title { font-family:var(--serif); font-size:28px; font-weight:700; line-height:1.1; color:var(--cream); margin-bottom:14px; transition:color 0.3s; }
        .proj-card:hover .proj-title { color:var(--yellow); }
        .proj-desc { font-size:11px; line-height:1.8; color:var(--muted); margin-bottom:24px; }
        .proj-tags { display:flex; gap:6px; flex-wrap:wrap; }
        .proj-tag { font-size:9px; letter-spacing:0.1em; text-transform:uppercase; border:1px solid rgba(240,192,64,0.15); color:var(--muted); padding:3px 10px; transition:all 0.2s; }
        .proj-card:hover .proj-tag { border-color:var(--yellow); color:var(--yellow); }
        .proj-arrow { position:absolute; bottom:44px; right:44px; font-size:22px; color:rgba(240,192,64,0.15); transition:all 0.3s; }
        .proj-card:hover .proj-arrow { color:var(--yellow); transform:translate(4px,-4px); }
        .proj-img { width:100%; aspect-ratio:16/9; object-fit:cover; margin-bottom:24px; }

        /* ── BLOG ── */
        #blog { background:var(--dark); padding:120px 48px; }
        .blog-inner { max-width:1200px; margin:0 auto; }
        .photo-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:4px; margin-top:64px; }
        .photo-item { position:relative; overflow:hidden; cursor:none; aspect-ratio:1; }
        .photo-item img { width:100%; height:100%; object-fit:cover; transition:transform 0.5s; display:block; }
        .photo-item:hover img { transform:scale(1.06); }
        .photo-overlay { position:absolute; inset:0; background:rgba(15,31,22,0); display:flex; align-items:flex-end; padding:20px; transition:background 0.3s; }
        .photo-item:hover .photo-overlay { background:rgba(15,31,22,0.7); }
        .photo-caption { font-size:11px; color:var(--cream); letter-spacing:0.06em; opacity:0; transform:translateY(8px); transition:opacity 0.3s,transform 0.3s; }
        .photo-item:hover .photo-caption { opacity:1; transform:translateY(0); }
        .photo-empty { grid-column:1/-1; text-align:center; padding:80px 0; color:var(--muted); font-size:12px; letter-spacing:0.1em; }

        /* ── LIGHTBOX ── */
        .lb-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.92); z-index:500; display:flex; align-items:center; justify-content:center; padding:40px; cursor:none; }
        .lb-img { max-width:90vw; max-height:80vh; object-fit:contain; display:block; }
        .lb-caption { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); font-size:12px; color:var(--cream); letter-spacing:0.1em; text-align:center; }
        .lb-close { position:absolute; top:24px; right:32px; background:none; border:none; color:var(--cream); font-size:24px; cursor:none; transition:color 0.2s; }
        .lb-close:hover { color:var(--yellow); }

        /* ── CONTACT ── */
        #contact { background:var(--green); padding:120px 48px; }
        .contact-inner { max-width:1200px; margin:0 auto; display:grid; grid-template-columns:1.2fr 1fr; gap:80px; align-items:start; }
        .contact-email { font-family:var(--serif); font-size:clamp(18px,2.2vw,28px); font-weight:700; color:var(--cream); text-decoration:none; display:inline-block; position:relative; transition:color 0.3s; cursor:none; }
        .contact-email::after { content:''; position:absolute; bottom:-3px; left:0; width:100%; height:2px; background:var(--yellow); transform:scaleX(0); transform-origin:left; transition:transform 0.4s; }
        .contact-email:hover { color:var(--yellow); }
        .contact-email:hover::after { transform:scaleX(1); }
        .contact-details { margin-top:40px; display:flex; flex-direction:column; gap:14px; }
        .contact-detail { display:flex; align-items:center; gap:14px; font-size:12px; color:var(--muted); }
        .cd-icon { width:30px; height:30px; background:var(--green2); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0; }
        .contact-links { display:flex; flex-direction:column; gap:2px; }
        .cl-item { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; background:var(--green2); border:1px solid rgba(240,192,64,0.08); text-decoration:none; cursor:none; transition:all 0.2s; }
        .cl-item:hover { background:var(--green3); border-color:rgba(240,192,64,0.3); }
        .cl-label { font-size:11px; letter-spacing:0.14em; text-transform:uppercase; color:var(--cream); }
        .cl-arrow { color:var(--yellow); font-size:16px; transition:transform 0.2s; }
        .cl-item:hover .cl-arrow { transform:translate(3px,-3px); }

        /* ── FOOTER ── */
        footer { background:var(--dark); padding:28px 48px; display:flex; justify-content:space-between; align-items:center; }
        .ft { font-size:10px; letter-spacing:0.12em; color:var(--muted); text-transform:uppercase; }
        .ft-logo { font-family:var(--serif); font-size:17px; font-weight:900; color:var(--yellow); }

        @media(max-width:768px) {
          nav { padding:14px 20px; } .nav-links { display:none; }
          #home { grid-template-columns:1fr; }
          .hero-right { display:none; }
          .hero-left { padding:80px 20px 60px; }
          #about { padding:80px 20px; } .about-inner { grid-template-columns:1fr; gap:40px; }
          #personal { padding:80px 20px; } .personal-grid { grid-template-columns:1fr; }
          #projects { padding:80px 20px; } .proj-grid { grid-template-columns:1fr; }
          #blog { padding:80px 20px; } .photo-grid { grid-template-columns:repeat(2,1fr); }
          #contact { padding:80px 20px; } .contact-inner { grid-template-columns:1fr; gap:40px; }
          footer { flex-direction:column; gap:10px; padding:20px; text-align:center; }
        }
      `}</style>

      {/* Cursor */}
      <div ref={cursorRef} className="cursor-ring" />
      <div ref={cursorDotRef} className="cursor-dot" />

      {/* NAV */}
      <nav>
        <span className="nav-logo">
          {info.logo_image_url
            ? <img src={info.logo_image_url} alt={info.logo_text} />
            : info.logo_text}
        </span>
        <ul className="nav-links">
          {[
            { id: "home", label: "Inicio" },
            { id: "about", label: "Sobre mí" },
            { id: "personal", label: "Mis gustos" },
            { id: "projects", label: "Proyectos" },
            { id: "blog", label: "Blog" },
            { id: "contact", label: "Contacto" },
          ].map((item) => (
            <li key={item.id}>
              <button onClick={() => scrollTo(item.id)} className={`${activeSection === item.id ? "active" : ""} ${item.id === "contact" ? "nav-cta" : ""}`}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section id="home">
        <div className="hero-left">
          <p className={`hero-tag ${loaded ? "v" : ""}`}>Desarrollador Web · Lima, Perú</p>
          <h1 className={`hero-title ${loaded ? "v" : ""}`}>
            Hola,<br />soy <span className="acc">Horacio</span><br />Rojas.
          </h1>
          <p className={`hero-bio ${loaded ? "v" : ""}`}>{info.bio.slice(0, 200)}...</p>
          <div className={`hero-btns ${loaded ? "v" : ""}`}>
            <button className="btn-y" onClick={() => scrollTo("projects")}>Ver proyectos</button>
            <button className="btn-o" onClick={() => scrollTo("contact")}>Hablemos →</button>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-bg-text">HR<br />WD<br />LP</div>
          <div className="hero-photo-wrap">
            {info.profile_image_url
              ? <img src={info.profile_image_url} alt={info.name} className="hero-photo" />
              : (
                <div className="hero-photo-placeholder">
                  <span>📸</span>
                  <p>Tu foto aquí</p>
                </div>
              )
            }
            <div className="hero-photo-badge">Full Stack Dev</div>
          </div>
        </div>
        <div className="hero-scroll">
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {[0,1,2].map(i => <span key={i} style={{ display: "block", width: 1, height: 8, background: "var(--muted)", margin: "0 auto" }} />)}
          </span>
          Scroll
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about">
        <div className="about-inner">
          <div>
            <div className="sec-label">Sobre mí</div>
            <h2 className="sec-title">Hola,<br />soy <em>Horacio</em></h2>
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
          <div>
            <div className="skills-group">
              <div className="skills-gtitle">Tecnologías</div>
              <div className="skills-wrap">{info.skills_tech.map((s) => <span key={s} className="pill">{s}</span>)}</div>
            </div>
            <div className="skills-group">
              <div className="skills-gtitle">Habilidades blandas</div>
              <div className="skills-wrap">{info.skills_soft.map((s) => <span key={s} className="pill soft">{s}</span>)}</div>
            </div>
            <div>
              <div className="skills-gtitle" style={{ marginBottom: 0 }}>Experiencia</div>
              {info.experience.map((e, i) => (
                <div key={i} className="exp-item">
                  <div className="exp-hd"><span className="exp-role">{e.role}</span><span className="exp-period">{e.period}</span></div>
                  <div className="exp-co">{e.company}</div>
                  <ul className="exp-bullets">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PERSONAL / MIS GUSTOS ── */}
      <section id="personal">
        <div className="personal-inner">
          <div className="sec-label-y">Mis gustos</div>
          <h2 className="sec-title-c">Fuera del<br />código</h2>
          <div className="personal-grid">
            {/* Hobbies */}
            <div className="personal-card">
              <div className="pc-head"><span className="pc-icon">🎯</span><span className="pc-card-title">Hobbies</span></div>
              <div className="hobby-grid">
                {info.hobbies.map((h, i) => (
                  <div key={i} className="hobby-item">
                    <span className="hobby-icon">{h.icon}</span>
                    <span className="hobby-label">{h.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Música */}
            <div className="personal-card">
              <div className="pc-head"><span className="pc-icon">🎵</span><span className="pc-card-title">Música</span></div>
              <div className="music-list">
                {info.music.map((m, i) => (
                  <div key={i} className="music-item">
                    <div className="music-disc">🎵</div>
                    <div className="music-info">
                      <div className="music-title">{m.title}</div>
                      <div className="music-artist">{m.artist}</div>
                    </div>
                    <span className="music-genre">{m.genre}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Películas */}
            <div className="personal-card">
              <div className="pc-head"><span className="pc-icon">🎬</span><span className="pc-card-title">Películas y series</span></div>
              <div className="movie-list">
                {info.movies.map((m, i) => (
                  <div key={i} className="movie-item">
                    <div className="movie-left">
                      <span className="movie-num">0{i + 1}</span>
                      <div>
                        <div className="movie-name">{m.title}</div>
                        <div className="movie-meta">{m.genre}</div>
                      </div>
                    </div>
                    <span className="movie-year">{m.year}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Foto personal */}
            <div className="personal-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 0, overflow: "hidden" }}>
              {info.profile_image_url
                ? <img src={info.profile_image_url} alt={info.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
                : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40, color: "var(--muted)" }}>
                    <span style={{ fontSize: 48 }}>🙋</span>
                    <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Tu foto aquí</p>
                  </div>
                )
              }
            </div>
            {/* Frase */}
            <div className="quote-card">
              <div className="quote-mark">"</div>
              <div className="quote-text">{info.personal_quote}</div>
              <div className="quote-author">— {info.personal_quote_author}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROYECTOS ── */}
      <section id="projects">
        <div className="proj-inner">
          <div className="sec-hd-green">
            <div>
              <div className="sec-label-y">Proyectos</div>
              <h2 className="sec-title-c">Mi trabajo</h2>
            </div>
          </div>
          {projects.length === 0
            ? <p style={{ color: "var(--muted)", fontSize: "12px" }}>Próximamente...</p>
            : (
              <div className="proj-grid">
                {projects.map((p) => (
                  <div key={p.id} className="proj-card" onClick={() => p.link && window.open(p.link, "_blank")}>
                    {p.image_url && <img src={p.image_url} alt={p.title} className="proj-img" />}
                    <div className="proj-meta">
                      <span className="proj-cat">{p.category}</span>
                      <span className="proj-year">{p.year}</span>
                    </div>
                    <h3 className="proj-title">{p.title}</h3>
                    <p className="proj-desc">{p.description}</p>
                    <div className="proj-tags">{p.tags.map((t) => <span key={t} className="proj-tag">{t}</span>)}</div>
                    {p.link && <span className="proj-arrow">↗</span>}
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </section>

      {/* ── BLOG / GALERÍA ── */}
      <section id="blog">
        <div className="blog-inner">
          <div className="sec-label-y">Blog</div>
          <h2 className="sec-title-c">Mi galería</h2>
          {photos.length === 0
            ? <div className="photo-empty">📷 Aún no hay fotos. Súbelas desde el panel admin.</div>
            : (
              <div className="photo-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="photo-item" onClick={() => setLightbox(photo)}>
                    <img src={photo.image_url} alt={photo.caption || ""} />
                    <div className="photo-overlay">
                      {photo.caption && <div className="photo-caption">{photo.caption}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact">
        <div className="contact-inner">
          <div>
            <div className="sec-label-y">Contacto</div>
            <h2 className="sec-title-c" style={{ marginBottom: 40 }}>¿Tienes un<br /><em style={{ fontStyle: "italic", color: "var(--yellow)" }}>proyecto</em>?</h2>
            <a href={`mailto:${info.email}`} className="contact-email">{info.email}</a>
            <div className="contact-details">
              <div className="contact-detail"><div className="cd-icon">📍</div><span>{info.location}</span></div>
              <div className="contact-detail"><div className="cd-icon">📞</div><span>{info.phone}</span></div>
            </div>
          </div>
          <div className="contact-links">
            {info.linkedin && <a href={info.linkedin} target="_blank" className="cl-item"><span className="cl-label">LinkedIn</span><span className="cl-arrow">↗</span></a>}
            {info.github && <a href={info.github} target="_blank" className="cl-item"><span className="cl-label">GitHub</span><span className="cl-arrow">↗</span></a>}
            {info.cv_url && info.cv_url !== "#" && <a href={info.cv_url} target="_blank" className="cl-item"><span className="cl-label">Descargar CV</span><span className="cl-arrow">↗</span></a>}
            <a href={`mailto:${info.email}`} className="cl-item"><span className="cl-label">Enviar email</span><span className="cl-arrow">↗</span></a>
          </div>
        </div>
      </section>

      <footer>
        <span className="ft">© 2025 {info.name}</span>
        <span className="ft-logo">{info.logo_text}</span>
        <span className="ft">Lima, Perú</span>
      </footer>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lb-overlay" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          <img src={lightbox.image_url} alt={lightbox.caption || ""} className="lb-img" onClick={(e) => e.stopPropagation()} />
          {lightbox.caption && <div className="lb-caption">{lightbox.caption}</div>}
        </div>
      )}
    </>
  );
}