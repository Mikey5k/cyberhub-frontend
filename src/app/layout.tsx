import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veritas CyberHub",
  description: "Premium digital services with real-time WhatsApp support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased subpixel-antialiased font-medium tracking-tight">
        {children}
      </body>
    </html>
  );
}