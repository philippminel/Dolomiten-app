import { useState, useEffect } from "react";

export function useViewport() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return {
    width,
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1100,
    isDesktop: width >= 1100,
  };
}
