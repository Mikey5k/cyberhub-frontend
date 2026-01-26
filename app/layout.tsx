import type { Metadata } from "next";
import "./globals.css";
import BackButton from "../src/components/BackButton";

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
      <body className="font-sans antialiased subpixel-antialiased font-medium tracking-tight relative">
        {/* Global Back Button - shows on all pages except home */}
        <div className="fixed top-4 left-4 z-50">
          <BackButton />
        </div>
        {children}
      </body>
    </html>
  );
}