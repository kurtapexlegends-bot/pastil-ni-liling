import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import WarningSuppressor from "../components/WarningSuppressor";
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
  title: "Pastil ni Liling | Swak sa Bulsa, Sarap na Babalik-balikan",
  description: "Experience authentic Mindanao Pastil. Premium quality, affordable, and undeniably delicious.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <WarningSuppressor />
        {children}
      </body>
    </html>
  );
}
