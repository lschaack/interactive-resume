import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import localFont from 'next/font/local';
import "./globals.css";
import Link from "next/link";
import { ModePicker } from "./components/ModePicker";
import { FC } from "react";
import { usePathname } from "next/navigation";
import { SideNav } from "./components/SideNav";

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
      <body className={`${noto_sans.className} bg-white text-black dark:bg-black dark:text-white`}>
        <div className="grid grid-rows-layout grid-cols-layout p-6">
          <div className="h-full border-r-4 border-b-4 border-solid border-black dark:border-white flex justify-center items-center">
            <ModePicker />
          </div>
          <h1 className="p-3 self-end text-2xl border-b-4 border-solid border-black dark:border-white">Luke Schaack</h1>
          <SideNav />
          {children}
        </div>
      </body>
    </html>
  );
}
