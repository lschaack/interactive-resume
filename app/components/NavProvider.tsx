"use client";

import { FC, ReactNode, createContext, useCallback, useContext, useState } from "react";

export const MAX_MOBILE_SCREEN_WIDTH = 640;

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
  const [isOpen, setIsOpen] = useState(
    typeof window !== 'undefined'
      ? window.innerWidth > MAX_MOBILE_SCREEN_WIDTH
      : true
  );

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

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
