
import type { Metadata } from "next";

import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { ClerkProvider } from '@clerk/nextjs';
import { env } from '@/lib/env';

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
  // Check if Clerk keys are available
  const publishableKey = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // Add more detailed logging for debugging
  console.log('🔍 Environment check in layout:');
  console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
  console.log('🔍 NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY exists:', !!publishableKey);
  console.log('🔍 Key length:', publishableKey ? publishableKey.length : 0);
  
  if (!publishableKey) {
    console.warn('❌ Clerk publishable key not found. Authentication features will not work.');
    console.warn('❌ This will cause build failures in production.');
  } else {
    console.log('✅ Clerk publishable key found and ready');
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
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
