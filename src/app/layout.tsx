import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio — Aqua OS",
  description: "CGI, VFX & Graphic Design Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, overflow: 'hidden', fontFamily: '-apple-system, "Lucida Grande", "Helvetica Neue", sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
