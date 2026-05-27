import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import BottomTab from "@/components/layout/BottomTab";
import { NaviThreadProvider } from "@/contexts/NaviThreadContext";

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

export const metadata: Metadata = {
  title: "TripDiary",
  description: "旅行管理SNS風アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <NaviThreadProvider>
          <main className="max-w-md mx-auto min-h-screen pb-16">
            {children}
          </main>
          <BottomTab />
        </NaviThreadProvider>
      </body>
    </html>
  );
}
