import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Find Chefs - Chef Dhundo",
  description: "Search and find professional chefs for your business",
};

export default function FindChefsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // If publishable key is not available, render without Clerk
  if (!publishableKey) {
    return (
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
    );
  }

  return (
    <ClerkProvider 
      publishableKey={publishableKey}
      clerkJSUrl="https://cdn.jsdelivr.net/npm/@clerk/clerk-js@5/dist/clerk.browser.js"
    >
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
