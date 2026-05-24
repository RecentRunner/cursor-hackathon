import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { GlobalBottomNav } from "@/components/layout/global-bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Habit Pet",
  description: "Build habits, care for your pixel pet, and track wellness every day.",
};

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${pixelFont.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            {children}
            <GlobalBottomNav />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
