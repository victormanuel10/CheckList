import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checklist HITO 6 - Barrido predial",
  description:
    "Panel de avance para entregables HITO 6 de barrido predial por operador y municipio.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
