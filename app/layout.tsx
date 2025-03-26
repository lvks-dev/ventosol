import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ventosol",
  description:
    "Uma plataforma interativa que demonstra como as condições ambientais afetam a geração de energia renovável.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
