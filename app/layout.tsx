import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://coorder.domepath.com"),
  title: {
    default: "Coorder — Visual order management for restaurant teams",
    template: "%s · Coorder",
  },
  description:
    "Connect Clover with Coorder on Apple devices and give your restaurant team a clearer visual workflow for every order.",
  icons: {
    icon: "/assets/coorder-logo.png",
    shortcut: "/assets/coorder-logo.png",
    apple: "/assets/coorder-logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Coorder",
    title: "Coorder — Every order, exactly where your team needs it",
    description:
      "Connect Clover with a clear, visual order workflow designed for Apple devices.",
    url: "https://coorder.domepath.com",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Coorder — Every order, exactly where your team needs it",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coorder — A clearer workflow for every order",
    description:
      "Connect Clover with a visual order workspace on Apple devices.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
