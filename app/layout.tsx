import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/src/components/Navbar";
import FloatingButton from "@/src/components/FloatingButton";
import ToastProvider from "@/src/components/ui/ToastProvider";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description: "Gerencie seus gastos e metas",
  manifest: "/manifest.json",
  themeColor: "#6366F1",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-800 antialiased pb-24 h-screen">
        <ToastProvider>
          {children}
        </ToastProvider>
        <FloatingButton />
        <Navbar />
      </body>

    </html>
  );
}
