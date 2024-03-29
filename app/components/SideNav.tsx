"use client";

import { FC } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavEntryProps = {
  section: string;
}
const NavEntry: FC<NavEntryProps> = ({ section }) => {
  const pathname = usePathname();

  const isSelected = pathname.includes(section.toLowerCase());

  return (
    <Link href={`/${section.replaceAll(/\s+/g, '-').toLowerCase()}`} className={`hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-slate-800 ${isSelected ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
      <p className="px-4 py-2 bg-inherit transition-colors">{section}</p>
    </Link>
  );
}

export const SECTIONS = [
  'About',
  'Experience',
  'Education',
  'Tools',
  'Skills',
];

export const SideNav = () => {
  return (
    <nav className="pt-3 h-full border-r-4 border-solid border-black dark:border-white">
      {SECTIONS.map(section => <NavEntry key={section} section={section} />)}
    </nav>
  );
}
