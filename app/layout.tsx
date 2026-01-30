import type { Metadata } from "next";
import "./globals.css";
import NavBar from "../src/components/NavBar";
import Provider from "./provider";

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
        <Provider>
          {/* Navigation Bar - shows on all pages except landing page */}
          <NavBar />
          {children}
        </Provider>
      </body>
    </html>
  );
}