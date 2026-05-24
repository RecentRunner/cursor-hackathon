import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Share_Tech_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { AmbientAudioProvider } from "@/components/layout/ambient-audio-provider";
import { GlobalBottomNav } from "@/components/layout/global-bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "HaBit",
  description: "Build habits, grow your digital self, and track wellness every day.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

const bodyFont = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pixelFont.variable} ${bodyFont.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <AmbientAudioProvider>
              <SiteHeader />
              <div className="flex min-h-dvh flex-col pt-topbar">{children}</div>
              <GlobalBottomNav />
            </AmbientAudioProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
