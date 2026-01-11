import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "QorvexFlow",
  description:
    "QorvexFlow is a next-generation personal workspace that transforms your browser into a dynamic, fully customizable dashboard. Built with Next.js, it empowers you to organize your tools, apps, and tasks in one fluid and futuristic interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={`h-full ${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
