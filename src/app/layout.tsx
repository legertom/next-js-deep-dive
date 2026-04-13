import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ProgressProvider } from "@/components/progress-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeScript } from "@/components/theme-script";
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
  title: "Next.js 16 Deep Dive",
  description: "A hands-on course to master every feature of Next.js 16 — from first principles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
