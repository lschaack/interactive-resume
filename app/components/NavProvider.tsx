"use client";

import { Dispatch, FC, ReactNode, SetStateAction, createContext, useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";

export const MAX_MOBILE_SCREEN_WIDTH = 640;

export const getIsMobile = () => window.innerWidth <= MAX_MOBILE_SCREEN_WIDTH;

type NavContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  isMobile: boolean;
  toggle: () => void;
}
const NavContext = createContext<NavContextType>({
  isOpen: false,
  setIsOpen: () => undefined,
  isMobile: false,
  toggle: () => undefined,
});

export const useNav = () => useContext(NavContext);

export const NavProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(getIsMobile());
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // useLayoutEffect to hopefully hide component before rerender
  useLayoutEffect(() => {
    const handleResize = () => {
      const isMobile = getIsMobile();

      setIsMobile(isMobile)
      setIsOpen(!isMobile);
    }

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <NavContext.Provider value={{
      isOpen,
      setIsOpen,
      isMobile,
      toggle,
    }}>
      {children}
    </NavContext.Provider>
  );
};
