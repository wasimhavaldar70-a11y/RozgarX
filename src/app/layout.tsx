import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'RozgarX - Maharashtra Job Portal',
  description:
    'RozgarX connects job seekers with verified employers across all 36 districts of Maharashtra. Complete with job search, employer subscriptions, resume builder, and recruiter tools.',
  openGraph: {
    title: 'RozgarX - Maharashtra Job Portal',
    description:
      'RozgarX connects job seekers with verified employers across all 36 districts of Maharashtra. Complete with job search, employer subscriptions, resume builder, and recruiter tools.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={plusJakartaSans.className}>{children}</body>
    </html>
  );
}
