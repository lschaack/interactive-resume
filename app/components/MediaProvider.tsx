"use client";

import { FC, ReactNode, createContext, useContext } from "react";

import { getIsMobile } from "@/utils/media";
import { useResizeValue } from "../hooks/useResizeValue";

const Media = createContext<{ isMobile: boolean, isDesktop: boolean }>({
  isMobile: false,
  isDesktop: true,
});

export const useIsMobile = () => useContext(Media);

export const MediaProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const isMobile = useResizeValue(getIsMobile);

  return (
    <Media.Provider value={{
      isMobile,
      isDesktop: !isMobile,
    }}>
      {children}
    </Media.Provider>
  );
}
