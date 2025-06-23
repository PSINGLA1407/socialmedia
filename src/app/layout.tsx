import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from 'react';
import StyledNav from './NavBar';
import SessionProviderWrapper from './SessionProviderWrapper';

export const metadata: Metadata = {
  title: "Future University",
  description: "A social platform for university students",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <SessionProviderWrapper>
          {children}
          <StyledNav />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
