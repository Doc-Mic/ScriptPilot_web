import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
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
  description:
    "ScriptPilot is an AI-powered YouTube creator assistant for finding trends, generating ideas, writing scripts, creating Shorts, and optimizing SEO.",
  icons: {
    apple: "/scriptpilot-logo.png",
    icon: "/scriptpilot-logo.png",
    shortcut: "/scriptpilot-logo.png",
  },
  metadataBase: new URL("https://scriptpilot.studio"),
  openGraph: {
    description:
      "Find YouTube trends, generate video ideas, write scripts, create Shorts, and build SEO packages from one AI-powered creator workspace.",
    images: [
      {
        alt: "ScriptPilot logo",
        height: 1200,
        url: "/scriptpilot-logo.png",
        width: 1200,
      },
    ],
    siteName: "ScriptPilot",
    title: "ScriptPilot - AI-powered YouTube creator assistant",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    description:
      "AI-powered YouTube creator tools for trends, ideas, scripts, Shorts, and SEO.",
    images: ["/scriptpilot-logo.png"],
    title: "ScriptPilot - AI-powered YouTube creator assistant",
  },
  title: "ScriptPilot",
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
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
