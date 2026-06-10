import type { Metadata } from "next";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "HUB AI Assistant - Dashboard",
  description: "Panel administrativo HUB AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-bg antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
