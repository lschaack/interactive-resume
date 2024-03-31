"use client";

import { FC, ReactNode, createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";

export const MAX_MOBILE_SCREEN_WIDTH = 640;

export const getIsDesktop = () => window.innerWidth > MAX_MOBILE_SCREEN_WIDTH;

type NavContextType = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  toggle: () => void;
}
const NavContext = createContext<NavContextType>({
  isOpen: false,
  setIsOpen: () => undefined,
  toggle: () => undefined,
});

export const useNav = () => useContext(NavContext);

export const NavProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // useLayoutEffect to hopefully hide component before rerender
  useLayoutEffect(() => {
    const handleResize = () => setIsOpen(getIsDesktop());

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <NavContext.Provider value={{
      isOpen,
      setIsOpen,
      toggle
    }}>
      {children}
    </NavContext.Provider>
  );
};
