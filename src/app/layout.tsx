import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebAssembly Platform - Build, Deploy, Scale Wasm Applications",
  description: "Comprehensive WebAssembly platform with runtime management, package registry, and global edge deployment. Build, deploy, and scale Wasm applications with ease.",
  keywords: ["WebAssembly", "Wasm", "Edge Computing", "Serverless", "Runtime", "Package Manager", "Wasmer"],
  authors: [{ name: "WebAssembly Platform Team" }],
  icons: {
    icon: "/wasm-logo.png",
  },
  openGraph: {
    title: "WebAssembly Platform",
    description: "Build, deploy, and scale WebAssembly applications globally",
    url: "https://wasmplatform.com",
    siteName: "WebAssembly Platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WebAssembly Platform",
    description: "Build, deploy, and scale WebAssembly applications globally",
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
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
