import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import WarningSuppressor from "../components/layout/WarningSuppressor";
import SWRProvider from "../components/layout/SWRProvider";
import GlobalProviders from "../providers/GlobalProviders";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pastil ni Liling | Swak sa Bulsa, Sarap na Babalik-balikan",
  description: "Experience authentic Mindanao Pastil. Premium quality, affordable, and undeniably delicious.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1b2d16",
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
      className={`${outfit.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <WarningSuppressor />
        <SWRProvider>
          <GlobalProviders>
            {children}
          </GlobalProviders>
        </SWRProvider>
      </body>
    </html>
  );
}
