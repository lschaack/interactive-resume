import Link from "next/link";
import clsx from "clsx";

import { ModePicker } from "./ModePicker";
import { SideNavToggle } from "./SideNav";

export const Header = () => {
  return (
    <>
      <div className={clsx(
        'h-full',
        'border-r-4 border-b-4 border-solid border-foreground dark:border-foreground-dark',
        'flex justify-center items-center',
        'hidden sm:block',
      )} />
      <div className={clsx(
        'flex items-center justify-between',
        'border-b-4 border-solid border-foreground dark:border-foreground-dark',
        'px-2 sm:pl-0',
      )}>
        <SideNavToggle />
        <Link href="/" className="px-6 py-3 h-full self-stretch text-2xl">
          <h1>
            Luke Schaack
          </h1>
        </Link>
        <ModePicker />
      </div>
    </>
  );
}
