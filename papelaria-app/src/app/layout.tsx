import type { Metadata } from "next";
import { DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Papelaria Arapoanga — Painel Admin",
  description:
    "Painel administrativo para gerenciar produtos e pedidos da Papelaria Arapoanga.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${dmSans.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col grain-overlay">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-dm-sans)",
              borderRadius: "12px",
            },
          }}
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
