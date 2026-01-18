import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        portfolio: {
          green: "#2D3E33",    // El verde profundo de la imagen
          yellow: "#E9A228",   // El amarillo mostaza
          cream: "#F1E8D9",    // El fondo crema elegante
          orange: "#F16335",   // El naranja vibrante
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;