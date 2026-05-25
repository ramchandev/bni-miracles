import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BNI Miracles — Hybrid Business Networking Chapter | Chennai",
  description:
    "BNI Miracles is a hybrid BNI chapter meeting every Thursday in Chennai. Connect with 36+ business categories, pass referrals, and grow your business.",
  keywords: [
    "BNI Miracles",
    "BNI Chennai",
    "business networking Chennai",
    "BNI chapter Tamil Nadu",
  ],
  openGraph: {
    title: "BNI Miracles — Business Networking Chennai",
    description:
      "BNI Miracles is a hybrid BNI chapter meeting every Thursday in Chennai. Connect with 36+ business categories, pass referrals, and grow your business.",
    url: "https://bnimiracles.in",
    siteName: "BNI Miracles",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    locale: "en_IN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-full flex flex-col"
        style={{ fontFamily: "var(--font-plus-jakarta), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
