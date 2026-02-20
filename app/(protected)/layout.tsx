import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/src/components/Navbar";
import FloatingButton from "@/src/components/FloatingButton";
import ToastProvider from "@/src/components/ui/ToastProvider";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dominio = "https://financeiro.cristiansemh.com.br";

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description: "Organize suas finanças, acompanhe despesas e atinja suas metas com clareza e controle.",

  metadataBase: new URL(dominio),

  openGraph: {
    title: "Controle Financeiro",
    description: "Gerencie suas receitas, despesas e metas em um só lugar.",
    url: dominio,
    siteName: "Controle Financeiro",
    images: [
      {
        url: "/og-image.png",
        width: 512,
        height: 512,
        alt: "Controle Financeiro Dashboard",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Controle Financeiro",
    description: "Tenha controle total das suas finanças.",
    images: ["/og-image.png"],
  },

  icons: {
    icon: "/favicon.svg",
  },
};

export default function ProtectedLayout({
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
