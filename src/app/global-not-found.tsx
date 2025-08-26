// Import global styles and fonts
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
 
const inter = Inter({ subsets: ['latin'] })
 
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}
 
// eslint-disable-next-line @next/next/no-html-link-for-pages
export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <div style={{ 
          margin: 0, 
          padding: 0, 
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
          backgroundColor: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '6rem', 
              fontWeight: 'bold', 
              margin: '0 0 1rem 0',
              color: '#111827'
            }}>
              404
            </h1>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: '600', 
              margin: '0 0 1rem 0',
              color: '#374151'
            }}>
              Page Not Found
            </h2>
            <p style={{ 
              color: '#6b7280', 
              margin: '0 0 2rem 0',
              fontSize: '1.125rem'
            }}>
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a 
              href="/" 
              style={{
                backgroundColor: '#f97316',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.375rem',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'inline-block'
              }}
            >
              Go Back Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}