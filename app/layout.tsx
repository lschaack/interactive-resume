import { FC } from "react";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import localFont from 'next/font/local';
import Link from "next/link";

import clsx from "clsx";
import "./globals.css";

import { ModePicker } from "./components/ModePicker";
import { SideNav } from "./components/SideNav";
import { NavProvider } from "./components/NavProvider";
import { Header } from "./components/Header";

const noto_sans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
  // TODO: get rid of unused font weights
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

// https://github.com/vercel/next.js/discussions/42881#discussioncomment-5952355
const materialSymbols = localFont({
  variable: '--font-family-symbols',
  style: 'normal',
  src: '../node_modules/material-symbols/material-symbols-rounded.woff2',
  display: 'block',
  weight: '600',
});

export const metadata: Metadata = {
  title: "Luke Schaack Interactive Resume",
  description: "It's a resume, but you interact with it",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${materialSymbols.variable} transition-colors font-semibold`}>
      <body className={clsx(
        noto_sans.className,
        'bg-background text-foreground',
        'dark:bg-background-dark dark:text-foreground-dark'
      )}>
        <NavProvider>
          <div className={clsx(
            'grid sm:p-6',
            'grid-rows-layout-mobile grid-cols-layout-mobile',
            'sm:grid-rows-layout-desktop sm:grid-cols-layout-desktop'
          )}>
            <Header />
            <SideNav />
            <main className="p-6 flex flex-col">
              {children}
            </main>
          </div>
        </NavProvider>
      </body>
    </html>
  );
}
