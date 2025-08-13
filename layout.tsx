import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Personal Assistant - Secure & Intelligent",
  description: "Your secure AI-powered personal assistant for managing emails, calendar, and tasks with advanced authentication and privacy protection.",
  keywords: ["AI Assistant", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "Authentication", "Security"],
  authors: [{ name: "AI Assistant Team" }],
  openGraph: {
    title: "AI Personal Assistant",
    description: "Secure AI-powered personal productivity assistant",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Personal Assistant",
    description: "Secure AI-powered personal productivity assistant",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
