"use client";

import { FC, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import clsx from "clsx";
import { MAX_MOBILE_SCREEN_WIDTH, useNav } from "./NavProvider";
import { IconButton } from "./IconButton";

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
    name: 'Minesweeper',
    pathname: '/minesweeper'
  }
];

type NavEntryProps = {
  section: Section;
  autoFocus?: boolean;
}
const NavEntry: FC<NavEntryProps> = ({ section: { name, pathname }, autoFocus = false }) => {
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
      autoFocus={autoFocus}
    >
      <p className="px-4 py-2 bg-inherit transition-colors">{name}</p>
    </Link>
  );
}

export const SideNav = () => {
  // NOTE: isOpen only has an effect on mobile - on desktop the nav is always open
  const { isOpen, setIsOpen } = useNav();

  return (
    <nav className={clsx(
      'h-full w-fit',
      'hidden sm:flex',
      isOpen && '!flex',
      'absolute sm:static',
      'border-r-4 border-solid border-foreground dark:border-foreground-dark',
      'bg-background dark:bg-background-dark',
    )}>
      <div className="flex flex-col">
        {SECTIONS.map((section, index) => (
          <NavEntry key={section.name} section={section} autoFocus={index === 0} />
        ))}
      </div>

      <IconButton onClick={() => setIsOpen(false)} className="self-start p-2 m-1">
        close
      </IconButton>
    </nav>
  );
}

export const SideNavToggle = () => {
  const { toggle } = useNav();

  return (
    <IconButton onClick={toggle} className="p-3">
      menu
    </IconButton>
  )
}
