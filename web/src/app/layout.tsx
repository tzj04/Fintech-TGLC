import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/ui/Header";
import TransactionStatusIndicator from "@/components/ui/TransactionStatusIndicator";
import { NavigationProvider } from "@/context/NavigationContext";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TGLC - Trust-Gated Liquidity Corridors",
  description: "XRPL liquidity platform for banks and businesses",
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
        <ErrorBoundary>
          <NavigationProvider>
            <Header />
            <TransactionStatusIndicator />
            <main className="pt-16">
              {children}
            </main>
          </NavigationProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
