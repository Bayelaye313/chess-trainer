import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/ui/nav";
import { EngineProvider } from "@/client/engine/engine-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chess Trainer",
  description: "Entraîneur d'échecs local : analyse tes parties, révise tes erreurs.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/*
          Le moteur est monté une fois pour toute l'application : le charger par
          écran coûterait 7 Mo de WASM à chaque navigation.
        */}
        <EngineProvider>
          <Nav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
        </EngineProvider>
      </body>
    </html>
  );
}
