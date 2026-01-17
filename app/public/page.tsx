export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-portfolio-cream">
      {/* SECCIÓN VERDE SUPERIOR */}
      <section className="bg-portfolio-green text-portfolio-cream p-8 md:p-16 relative min-h-[600px] overflow-hidden">
        
        {/* Navbar */}
        <nav className="flex justify-between items-center relative z-20 mb-20">
          <div className="font-serif text-2xl font-bold italic">Tu Nombre</div>
          <div className="hidden md:flex gap-8 items-center text-xs uppercase tracking-widest font-sans">
            <a href="#" className="hover:text-portfolio-yellow transition-colors">About me</a>
            <a href="#" className="hover:text-portfolio-yellow transition-colors">Resume</a>
            <a href="#" className="hover:text-portfolio-yellow transition-colors">Work</a>
            <button className="bg-portfolio-yellow text-portfolio-green px-6 py-2 rounded-full font-bold">
              GET IN TOUCH!
            </button>
          </div>
        </nav>

        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12 relative">
          
          {/* Título de fondo gigante */}
          <h1 className="absolute -top-20 left-0 text-[12vw] font-serif font-black opacity-10 leading-none pointer-events-none">
            PORTFOLIO
          </h1>

          {/* Cuadro Naranja con Imagen */}
          <div className="relative z-10">
            <div className="w-72 h-96 bg-portfolio-orange border-[6px] border-portfolio-yellow relative">
               {/* Aquí irá tu foto cuando conectemos el CMS */}
               <div className="absolute inset-0 bg-black/20 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-500"></div>
            </div>
          </div>

          {/* Información Derecha */}
          <div className="relative z-10 flex flex-col gap-6">
            <h2 className="text-8xl font-serif italic font-bold leading-tight">
              Portfolio
            </h2>
            <div className="flex gap-6 py-4 border-t border-portfolio-yellow text-xs font-sans uppercase tracking-tighter">
              <span>BE: /tunombre</span>
              <span>IG: @tunombre</span>
              <span>LI: /in/tunombre</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed font-sans opacity-80">
              I love design and anything related to art. I approach problems in a rational and pragmatic way and seek the simplest and most functional solutions possible.
            </p>
          </div>
        </div>

        {/* Botón Scroll Down */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-28 h-28 bg-portfolio-yellow rounded-full border-[10px] border-portfolio-cream flex items-center justify-center text-center leading-none z-30">
          <span className="text-portfolio-green font-bold text-[10px] uppercase tracking-tighter">
            Scroll <br /> Down
          </span>
        </div>
      </section>

      {/* SECCIÓN INFERIOR (CONTENIDO ADICIONAL) */}
      <section className="bg-portfolio-cream pt-32 px-8 container mx-auto">
          {/* Aquí continuaremos con el resto del diseño */}
      </section>
    </main>
  );
}