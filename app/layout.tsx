import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const serif = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-serif",
  weight: ["400", "700", "900"] 
});

const sans = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans" 
});

export const metadata: Metadata = {
  title: "Mi Portafolio Editorial",
  description: "Desarrollado con Next.js y CMS propio",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${serif.variable} ${sans.variable} font-sans bg-portfolio-cream text-portfolio-green transition-colors duration-200`}>
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}