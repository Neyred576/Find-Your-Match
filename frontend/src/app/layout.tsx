import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Find Your Match — Meet New People Instantly',
  description: 'Connect with strangers around the world instantly through text or video chat. No sign-up required. Start chatting in seconds.',
  keywords: 'random chat, video chat, meet strangers, online chat, find match, anonymous chat',
  authors: [{ name: 'Find Your Match' }],
  openGraph: {
    title: 'Find Your Match — Meet New People Instantly',
    description: 'Connect with strangers around the world instantly through text or video chat.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Match — Meet New People Instantly',
    description: 'Connect with strangers around the world instantly through text or video chat.',
  },
  robots: { index: true, follow: true },
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-dark-900 text-white antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#B71C1C', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
