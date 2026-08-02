import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { sitePath } from "./site-path";

const siteUrl = process.env.GITHUB_PAGES === "true"
  ? "https://admindomepath.github.io/Coorder-Web"
  : "https://coorder.domepath.com";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Coorder — Visual order management for restaurant teams",
    template: "%s · Coorder",
  },
  description:
    "Organize, prepare, and track restaurant orders in a visual workspace for Apple devices, with an optional Clover integration.",
  icons: {
    icon: sitePath("/assets/coorder-logo.png"),
    shortcut: sitePath("/assets/coorder-logo.png"),
    apple: sitePath("/assets/coorder-logo.png"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Coorder",
    title: "Coorder — Every order, exactly where your team needs it",
    description:
      "A clear, visual restaurant order workflow for Apple devices, with an optional Clover integration.",
    url: siteUrl,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Coorder — Every order, exactly where your team needs it",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coorder — A clearer workflow for every order",
    description:
      "Visual restaurant order management for Apple devices, with optional Clover synchronization.",
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
      <body className={nunito.variable}>{children}</body>
    </html>
  );
}
