import type { Metadata } from "next";
import localFont from "next/font/local";
import { Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import BottomTab from "@/components/layout/BottomTab";
import { NaviThreadProvider } from "@/contexts/NaviThreadContext";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
const zenMaruGothic = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-zen-maru",
});

export const metadata: Metadata = {
  title: "Navilog",
  description: "旅をシェアする、AIと旅する",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} ${zenMaruGothic.variable} antialiased bg-parchment overflow-y-scroll`}>
        <SessionProviderWrapper>
          <NaviThreadProvider>
            <main className="max-w-xl mx-auto min-h-screen pb-16">
              {children}
            </main>
            <BottomTab />
          </NaviThreadProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
