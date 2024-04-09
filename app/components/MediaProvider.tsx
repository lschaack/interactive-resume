"use client";

import { FC, ReactNode, createContext, useContext, useEffect, useState } from "react";

import { getIsMobile } from "@/utils/media";

const Media = createContext<{ isMobile: boolean, isDesktop: boolean }>({
  isMobile: false,
  isDesktop: true,
});

export const useIsMobile = () => useContext(Media);

export const MediaProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(getIsMobile());

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Media.Provider value={{
      isMobile,
      isDesktop: !isMobile,
    }}>
      {children}
    </Media.Provider>
  );
}
