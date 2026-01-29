import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../src/components/NavBar";

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
      <body 
        className="font-sans antialiased subpixel-antialiased font-medium tracking-tight relative"
        suppressHydrationWarning
      >
        {/* Navigation Bar - shows on all pages except landing page */}
        <NavBar />
        {children}
      </body>
    </html>
  );
}