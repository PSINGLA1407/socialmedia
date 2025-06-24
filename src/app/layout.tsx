import './globals.css';
import SessionProviderWrapper from './SessionProviderWrapper';
import { ThemeProvider } from '../lib/ThemeContext';
import NavBar from './NavBar';
import FAB from './FAB';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Future University',
  description: 'A social media platform for university students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={poppins.className}>
        <SessionProviderWrapper>
          <ThemeProvider>
            <NavBar />
            {children}
            <FAB />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
