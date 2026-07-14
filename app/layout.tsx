import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalNavbar from "@/components/ConditionalNavbar";

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
    default: "Brilliant Chess Academy | Premium Chess Coaching & Training",
    template: "%s | Brilliant Chess Academy",
  },
  description:
    "Elevate your game with Brilliant Chess Academy. We offer expert chess training, online & offline classes, tactical puzzles, and tournament preparation for beginners to advanced players.",
  keywords: [
    "chess academy",
    "chess coaching",
    "learn chess",
    "chess classes online",
    "chess school",
    "chess classes Nagpur",
    "chess lessons for beginners",
    "advanced chess training",
    "chess tournaments",
    "grandmaster chess coaching",
    "Brilliant Chess Academy"
  ],
  authors: [{ name: "Brilliant Chess Academy" }],
  creator: "Brilliant Chess Academy",
  publisher: "Brilliant Chess Academy",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://brilliantchessacademy.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Brilliant Chess Academy | Premium Chess Coaching & Training",
    description:
      "Elevate your game with Brilliant Chess Academy. We offer expert chess training, online & offline classes, tactical puzzles, and tournament preparation.",
    url: "https://brilliantchessacademy.com",
    siteName: "Brilliant Chess Academy",
    images: [
      {
        url: "/assets/BCA Logo (Transparent).png",
        width: 800,
        height: 800,
        alt: "Brilliant Chess Academy Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Brilliant Chess Academy | Premium Chess Coaching & Training",
    description:
      "Elevate your game with Brilliant Chess Academy. We offer expert chess training, online & offline classes, tactical puzzles, and tournament preparation.",
    images: ["/assets/BCA Logo (Transparent).png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
