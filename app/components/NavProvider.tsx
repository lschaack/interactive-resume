"use client";

import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState
} from "react";

import { useIsMobile } from "./MediaProvider";

type NavContextType = {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  toggle: () => void;
}
const NavContext = createContext<NavContextType>({
  isOpen: false,
  setIsOpen: () => undefined,
  toggle: () => undefined,
});

export const useNav = () => useContext(NavContext);

export const NavProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const { isMobile } = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  // useLayoutEffect to hopefully component before rerender
  useLayoutEffect(() => {
    setIsOpen(!isMobile);
  }, [isMobile]);

  return (
    <NavContext.Provider value={{
      isOpen,
      setIsOpen,
      toggle,
    }}>
      {children}
    </NavContext.Provider>
  );
};
