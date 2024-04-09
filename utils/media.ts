export const MAX_MOBILE_SCREEN_WIDTH = 640;

const MOBILE_QUERY = `(max-width: ${MAX_MOBILE_SCREEN_WIDTH}px)`;
export const getIsMobile = () => window.matchMedia(MOBILE_QUERY).matches;
export const getIsDesktop = () => !getIsMobile();
