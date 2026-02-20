"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * A lightweight top-of-page progress bar that fires on every route change.
 * No external dependencies required.
 */
const NavigationProgress = () => {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    // Start the progress bar immediately
    setProgress(0);
    setVisible(true);

    // Animate to ~80% quickly then stall
    let p = 0;
    timerRef.current = setInterval(() => {
      p = p < 60 ? p + 15 : p < 80 ? p + 5 : p < 90 ? p + 1 : p;
      setProgress(p);
      if (p >= 90) clearInterval(timerRef.current);
    }, 80);

    // Finish (simulate route settled)
    const done = setTimeout(() => {
      clearInterval(timerRef.current);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 350);
    }, 600);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(done);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-violet-500 via-purple-400 to-pink-500 transition-all ease-out shadow-[0_0_10px_2px_rgba(168,85,247,0.7)]"
        style={{ width: `${progress}%`, transitionDuration: progress === 100 ? "200ms" : "80ms" }}
      />
    </div>
  );
};

export default NavigationProgress;
