import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TokenProvider } from "@/lib/token-context";

const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Excel Certificates Console",
  description: "Admin console for generating and distributing event certificates — Excel MEC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased dark font-sans",
        manrope.variable,
        geistMono.variable
      )}
    >
      <body className="min-h-full flex flex-col">
        <TokenProvider>{children}</TokenProvider>
      </body>
    </html>
  );
}

