import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProofLane — Evidence Gateway",
  description:
    "Tamper-evident evidence capture for actions that change digital risk.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <SiteNav />
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <footer className="border-t py-4 text-center text-xs text-muted-foreground">
            ProofLane — hackathon demo environment. Receipts are verified
            against cold integrity roots; attestation is{" "}
            <span className="font-mono">simulated</span>, not hardware-backed.
          </footer>
        </Providers>
      </body>
    </html>
  );
}