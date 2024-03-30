"use client";

import { useRef } from "react";

import clsx from "clsx";

const getIsLight = (element: Element | null) => {
  return element?.classList.contains('light') || !element?.classList.contains('dark');
}

// TODO: make this more reusable as a demo even though I won't need to reuse it
// TODO: persist mode in localStorage so it doesn't change on a full-page rerender (like 404)
export const ModePicker = ({ className }: { className?: string }) => {
  const wrapperElement = useRef<HTMLDivElement>(null);

  return (
    <label className={clsx('relative', 'focus-within:shadow-outline', className)}>
      <input
        type="checkbox"
        className="appearance-none absolute"
        onChange={() => {
          const htmlElement = document.querySelector('html');
          const isLight = getIsLight(htmlElement);

          if (isLight) {
            htmlElement?.classList.remove('light');
            htmlElement?.classList.add('dark');
            wrapperElement.current?.classList.remove('before:translate-x-8');
          } else {
            htmlElement?.classList.remove('dark');
            htmlElement?.classList.add('light');
            wrapperElement.current?.classList.add('before:translate-x-8');
          }
        }}
      />
      <div ref={wrapperElement} className={`flex items-center border-solid border-4 border-black dark:border-white before:absolute before:block before:translate-x-8 before:bg-slate-200 dark:before:bg-slate-700 before:w-8 before:h-8 before:z-10 before:transition-all`}>
        <i className="symbol p-1 text-black dark:text-white z-30 select-none">bedtime</i>
        <i className="symbol p-1 text-black dark:text-white z-30 select-none">sunny</i>
      </div>
    </label>
  );
}
