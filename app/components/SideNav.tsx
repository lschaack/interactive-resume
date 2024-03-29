"use client";

import { FC } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import clsx from "clsx";

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
    <Link
      href={pathname}
      className={clsx(
        'outline-none',
        'hover:bg-highlight focus:bg-highlight',
        'dark:hover:bg-highlight-dark dark:focus:bg-highlight-dark',
        isSelected ? 'bg-highlight dark:bg-highlight-dark' : ''
      )}
    >
      <p className="px-4 py-2 bg-inherit transition-colors">{name}</p>
    </Link>
  );
}

export const SideNav = () => {
  return (
    <nav className="flex flex-col pt-3 h-full border-r-4 border-solid border-foreground dark:border-foreground-dark">
      {SECTIONS.map(section => <NavEntry key={section.name} section={section} />)}
    </nav>
  );
}
