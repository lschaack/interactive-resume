"use client";

import { FC } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Section = {
  name: string;
  pathname: string;
}
export const SECTIONS: Section[] = [
  {
    name: 'About',
    pathname: '/',
  },
  {
    name: 'Experience',
    pathname: '/experience',
  },
  {
    name: 'Education',
    pathname: '/education',
  },
  {
    name: 'Tools',
    pathname: '/tools',
  },
  {
    name: 'Skills',
    pathname: '/skills',
  },
];

type NavEntryProps = {
  section: Section;
}
const NavEntry: FC<NavEntryProps> = ({ section: { name, pathname } }) => {
  const currentPathname = usePathname();

  const isSelected = pathname === currentPathname;

  return (
    <Link href={pathname} className={`hover:bg-slate-100 focus:bg-slate-100 focus:outline-none dark:hover:bg-slate-800 ${isSelected ? 'bg-slate-100 dark:bg-slate-800' : ''}`}>
      <p className="px-4 py-2 bg-inherit transition-colors">{name}</p>
    </Link>
  );
}

export const SideNav = () => {
  return (
    <nav className="pt-3 h-full border-r-4 border-solid border-black dark:border-white">
      {SECTIONS.map(section => <NavEntry key={section.name} section={section} />)}
    </nav>
  );
}
