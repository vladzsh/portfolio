import type { Metadata } from "next";
import { Quantico } from "next/font/google";
import "./globals.css";

import DotAccent from "@/components/DotAccent";
import Nav from "@/components/Nav";
import ThemeToggle from "@/components/ThemeToggle";
import Footer from "@/components/Footer";

const quantico = Quantico({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Vladyslav Zhuravel — Portfolio",
  description:
    "Full Stack Web Developer — Python, Odoo, React, k8s, CI/CD & DevOps, AI Agents",
  openGraph: {
    title: "Vladyslav Zhuravel — Portfolio",
    description:
      "Full Stack Web Developer — Python, Odoo, React, k8s, CI/CD & DevOps, AI Agents",
    url: "https://vladzsh.org/",
    images: ["https://vladzsh.org/img/og.jpg"],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t!=="light")document.documentElement.setAttribute("data-theme","dark")}catch(e){}})();`,
          }}
        />
      </head>
      <body className={`${quantico.className} min-h-screen flex flex-col`}>
        <DotAccent />
        <Nav />
        <main className="flex-1">{children}</main>
        <ThemeToggle />
        <Footer />
      </body>
    </html>
  );
}
