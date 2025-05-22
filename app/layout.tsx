import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VoxActive - Learn English with AI",
  description:
    "Practice and learn English by asking and answering questions, translating texts and engaging in conversation with AI - your path to language fluency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <meta
        name="google-site-verification"
        content="Fs5uqTarapNd4D81qOSeMErfIcaUduaYzC5P-kS1R0c"
      />
      <body
        className={` ${geistSans.variable} ${geistMono.variable} antialiased pattern`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
