import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Link from "next/link";
import { ModePicker } from "./components/ModePicker";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { SideNav } from "./components/SideNav";
import clsx from "clsx";

const noto_sans = Noto_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans',
  weight: '600'
});

// https://github.com/vercel/next.js/discussions/42881#discussioncomment-5952355
const materialSymbols = localFont({
  variable: '--font-family-symbols',
  style: 'normal',
  src: '../node_modules/material-symbols/material-symbols-rounded.woff2',
  display: 'block',
  weight: '600',
})

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
    <html lang="en" className={`${materialSymbols.variable} transition-colors`}>
      <body className={clsx(
        noto_sans.className,
        'bg-background text-foreground',
        'dark:bg-background-dark dark:text-foreground-dark'
      )}>
        <div className="grid grid-rows-layout grid-cols-layout p-6">
          <div className={clsx(
            'h-full',
            'border-r-4 border-b-4 border-solid border-foreground dark:border-foreground-dark',
            'flex justify-center items-center',
          )}>
            <ModePicker />
          </div>
          <div className="flex border-b-4 border-solid border-foreground dark:border-foreground-dark">
            <Link href="/" className="px-6 py-3 h-full self-stretch text-2xl">
              <h1>
                Luke Schaack
              </h1>
            </Link>
          </div>
          <SideNav />
          <main className="p-6 flex flex-col">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
