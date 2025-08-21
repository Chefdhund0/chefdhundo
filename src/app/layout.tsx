
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chef Dhundo",
  description: "Chef Dhun - Your Personal Chef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          {children}
          <Toaster
            toastOptions={{
              classNames: {
                toast: 'bg-white border-gray-200',
                title: 'text-black',
                description: 'text-gray-600',
                actionButton: 'bg-gray-800 text-white',
                cancelButton: 'bg-gray-200 text-black',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
