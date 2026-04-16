import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Verso',
  description: 'Real-time collaborative documents',
  openGraph: {
    title: 'Verso',
    description: 'Shared on Verso',
    url: 'https://verso-editorial.app',
    siteName: 'Verso',
    images: [{ url: '/og-image.png' }],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect width=%22100%22 height=%22100%22 rx=%2220%22 fill=%22%23c8b89a%22/><text x=%2250%22 y=%2272%22 font-family=%22sans-serif%22 font-size=%2265%22 font-weight=%22bold%22 fill=%22%230f0e0d%22 text-anchor=%22middle%22>V</text></svg>" />
        </head>
        <body className="antialiased bg-[#0f0e0d] text-[#e8e3da]" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}