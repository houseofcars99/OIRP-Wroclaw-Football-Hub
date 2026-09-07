import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./auth.css";
import "./dashboard.css";
import "./interaction.css";

export const metadata: Metadata = {
  title: "OIRP Wrocław Football Hub",
  description: "Centrum drużyny OIRP Wrocław",
  applicationName: "OIRP Football Hub",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071912",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
