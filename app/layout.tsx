import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import { AppSettingsProvider } from "@/lib/contexts/app-settings-context";
import { LayoutProvider } from "@/lib/contexts/layout-context";
import { WidgetSettingsProvider } from "@/lib/contexts/widget-settings-context";
import { FocusTrackerProvider } from "@/lib/contexts/focus-tracker-context";
import { Toaster } from "sonner";
import { FloatingWidgetProvider } from "@/components/floating-widget/floating-widget-context";
import FloatingWidgetWindow from "@/components/floating-widget/floating-widget-window";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qorvex",
  description:
    "Qorvex is a next-generation personal workspace that transforms your browser into a dynamic, fully customizable dashboard. Built with Next.js, it empowers you to organize your tools, apps, and tasks in one fluid and futuristic interface.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body
        className={`h-full ${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AppSettingsProvider>
            <LayoutProvider>
              <WidgetSettingsProvider>
                <FocusTrackerProvider>
                  <FloatingWidgetProvider>
                    {children}
                    <FloatingWidgetWindow />
                    <Toaster position="bottom-right" richColors />
                  </FloatingWidgetProvider>
                </FocusTrackerProvider>
              </WidgetSettingsProvider>
            </LayoutProvider>
          </AppSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
