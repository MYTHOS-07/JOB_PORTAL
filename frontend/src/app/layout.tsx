import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
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
  title: {
    default: "Elevate Workforce",
    template: "%s · Elevate Workforce",
  },
  description: "A simple employment platform connecting job seekers and employers in Nepal.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ViewTransitions>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased `}
        suppressHydrationWarning
      >
        <body className="min-h-full bg-background font-sans text-foreground">
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
