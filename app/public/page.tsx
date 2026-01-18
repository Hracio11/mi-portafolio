'use client';

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-portfolio-cream text-portfolio-green">
      {/* --- NAVBAR --- */}
      <nav className="bg-portfolio-green text-portfolio-cream px-6 sm:px-8 md:px-16 py-4 flex justify-between items-center">
        <div className="font-serif text-lg md:text-xl font-bold">
          <span className="text-portfolio-yellow">✦</span> Horacio Rojas
        </div>
        <div className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-wider">
          <a href="#about" className="hover:text-portfolio-yellow transition-colors">Sobre mí</a>
          <a href="#resume" className="hover:text-portfolio-yellow transition-colors">Currículum</a>
          <a href="#work" className="hover:text-portfolio-yellow transition-colors">Trabajo</a>
          <button className="bg-portfolio-yellow text-portfolio-green px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform">
            ¡Contacta!
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="bg-portfolio-green text-portfolio-cream px-6 sm:px-8 md:px-16 py-12 md:py-20 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Left: PORTFOLIO Text */}
          <div className="relative">
            <div className="text-yellow-300 opacity-20 text-7xl md:text-8xl font-black leading-none mb-8">
              PORTFOLIO
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-serif italic font-bold">Portfolio</h1>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-xs font-bold uppercase">
                <div>
                  <p className="text-portfolio-yellow">LI:</p>
                  <p>/in/horacio-rojas</p>
                </div>
                <div>
                  <p className="text-portfolio-yellow">BE:</p>
                  <p>/rehoracio2015</p>
                </div>
                <div>
                  <p className="text-portfolio-yellow">Ubicación:</p>
                  <p>Lima, Perú</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Image Box */}
          <div className="flex justify-center md:justify-end">
            <div className="relative w-64 h-80 md:w-72 md:h-96">
              <div className="absolute inset-0 bg-portfolio-orange border-8 border-portfolio-yellow"></div>
              <div className="absolute inset-8 bg-gradient-to-br from-portfolio-orange to-portfolio-green/50 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-sm font-bold text-white/80">Foto de perfil</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Down Button */}
        <div className="flex justify-center mt-12">
          <div className="bg-portfolio-yellow text-portfolio-green rounded-full w-16 h-16 flex items-center justify-center font-bold text-lg cursor-pointer hover:scale-110 transition-transform animate-bounce">
            ↓
          </div>
        </div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="px-6 sm:px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold italic mb-8">
              ¡Hola,<br/>soy Horacio!
            </h2>
            <p className="text-base md:text-lg leading-relaxed mb-8 text-gray-700">
              Técnico en Desarrollo de Sistemas especializado en el diseño y construcción de soluciones web eficientes y escalables. Con experiencia sólida en PHP, SQL y React, me enfoco en optimizar procesos y asegurar la estabilidad de cada proyecto.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://linkedin.com/in/horacio-rojas" target="_blank" rel="noopener noreferrer" className="bg-portfolio-orange text-white px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform text-center">
                LinkedIn
              </a>
              <button className="border-2 border-portfolio-green text-portfolio-green px-8 py-3 rounded-full font-bold hover:bg-portfolio-green hover:text-portfolio-cream transition-colors">
                Descargar CV
              </button>
            </div>
          </div>

          {/* Contact Info Box */}
          <div className="bg-portfolio-green text-portfolio-cream p-8 rounded-lg space-y-6">
            <h3 className="text-2xl font-bold text-portfolio-yellow">Contacto</h3>
            <div className="space-y-4">
              <div>
                <p className="text-portfolio-yellow text-sm font-bold">Email</p>
                <p>horacio@example.com</p>
              </div>
              <div>
                <p className="text-portfolio-yellow text-sm font-bold">Teléfono</p>
                <p>+51 987 654 321</p>
              </div>
              <div>
                <p className="text-portfolio-yellow text-sm font-bold">Ubicación</p>
                <p>Lima, Perú</p>
              </div>
              <button className="w-full bg-portfolio-yellow text-portfolio-green py-2 rounded font-bold hover:scale-105 transition-transform">
                Enviar mensaje
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- EDUCATION SECTION --- */}
      <section id="resume" className="bg-portfolio-yellow/10 px-6 sm:px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-portfolio-green mb-12">
            Educación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-portfolio-yellow p-6 rounded-lg border-l-4 border-portfolio-orange">
              <p className="text-portfolio-orange font-bold mb-2">2021 - 2023</p>
              <h3 className="text-lg font-bold text-portfolio-green mb-2">Bachiller Técnico</h3>
              <p className="text-sm text-gray-700">ISMEM - Desarrollo de Sistemas de Información</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- EXPERIENCE SECTION --- */}
      <section className="bg-portfolio-orange text-white px-6 sm:px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold mb-12">
            Experiencia
          </h2>
          <div className="space-y-6">
            <div className="bg-portfolio-green/90 p-8 rounded-lg">
              <p className="text-portfolio-yellow font-bold mb-2">2022 - Actualidad</p>
              <h3 className="text-xl font-bold mb-2">Docente de Informática</h3>
              <p className="text-sm mb-4">ISMEM - Lima</p>
              <p className="text-sm leading-relaxed">Capacitación en ofimática y desarrollo de proyectos finales de sistemas. Enseñanza de programación y metodologías de desarrollo.</p>
            </div>

            <div className="bg-portfolio-green/90 p-8 rounded-lg">
              <p className="text-portfolio-yellow font-bold mb-2">2023 (NOV-DIC)</p>
              <h3 className="text-xl font-bold mb-2">Practicante Web</h3>
              <p className="text-sm mb-4">AYPHU</p>
              <p className="text-sm leading-relaxed">Desarrollo de componentes en React e implementación de Strapi. Mejora de interfaces de usuario y optimización de performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- TECHNICAL SKILLS --- */}
      <section className="px-6 sm:px-8 md:px-16 py-16 md:py-24 bg-portfolio-cream">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-portfolio-green mb-8">
                Habilidades Técnicas
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-portfolio-yellow mb-4">Front-end</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'JavaScript', 'HTML', 'CSS', 'Tailwind'].map(skill => (
                      <span key={skill} className="bg-portfolio-yellow text-portfolio-green px-4 py-2 rounded-full text-sm font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-portfolio-yellow mb-4">Back-end</h3>
                  <div className="flex flex-wrap gap-2">
                    {['PHP', 'SQL', 'Strapi', 'WordPress'].map(skill => (
                      <span key={skill} className="bg-portfolio-orange text-white px-4 py-2 rounded-full text-sm font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-portfolio-green mb-8">
                Soft Skills
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-2xl">💬</span>
                  <div>
                    <h3 className="font-bold">Comunicación</h3>
                    <p className="text-sm text-gray-600">Excelente capacidad de comunicación efectiva</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <h3 className="font-bold">Resolución de Problemas</h3>
                    <p className="text-sm text-gray-600">Pensamiento crítico y solución rápida</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h3 className="font-bold">Trabajo en Equipo</h3>
                    <p className="text-sm text-gray-600">Colaboración y sinergia con colegas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOBBIES SECTION --- */}
      <section className="bg-portfolio-green text-portfolio-cream px-6 sm:px-8 md:px-16 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif italic font-bold text-portfolio-yellow mb-12">
            Hobbies e Intereses
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-portfolio-yellow/10 p-6 rounded-lg text-center hover:scale-110 transition-transform">
              <div className="text-4xl mb-3">💻</div>
              <p className="font-bold">Coding</p>
            </div>
            <div className="bg-portfolio-yellow/10 p-6 rounded-lg text-center hover:scale-110 transition-transform">
              <div className="text-4xl mb-3">📚</div>
              <p className="font-bold">Lectura</p>
            </div>
            <div className="bg-portfolio-yellow/10 p-6 rounded-lg text-center hover:scale-110 transition-transform">
              <div className="text-4xl mb-3">🎮</div>
              <p className="font-bold">Gaming</p>
            </div>
            <div className="bg-portfolio-yellow/10 p-6 rounded-lg text-center hover:scale-110 transition-transform">
              <div className="text-4xl mb-3">🎵</div>
              <p className="font-bold">Música</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-portfolio-cream border-t-4 border-portfolio-yellow px-6 sm:px-8 md:px-16 py-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center flex-col md:flex-row gap-4">
          <p className="text-portfolio-green font-bold">© 2026 Horacio Rojas. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="text-portfolio-green hover:text-portfolio-yellow font-bold">LinkedIn</a>
            <a href="#" className="text-portfolio-green hover:text-portfolio-yellow font-bold">GitHub</a>
            <a href="#" className="text-portfolio-green hover:text-portfolio-yellow font-bold">Email</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
