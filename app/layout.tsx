import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootProvider } from "@/components/root-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Archery Inventory Management",
  description: "Modern archery equipment inventory management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} overflow-hidden`}>
        <RootProvider>{children}</RootProvider>
        <Toaster />
      </body>
    </html>
  );
}