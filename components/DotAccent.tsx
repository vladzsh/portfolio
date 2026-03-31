"use client";

import { useEffect, useRef } from "react";

export default function DotAccent() {
  const elRef = useRef<HTMLDivElement>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      el.style.setProperty("--mx", e.clientX + "px");
      el.style.setProperty("--my", e.clientY + "px");

      if (!activeRef.current) {
        el.classList.add("active");
        activeRef.current = true;
      }

      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }

      fadeTimerRef.current = setTimeout(() => {
        el.classList.remove("active");
        activeRef.current = false;
      }, 1500);
    };

    const handleMouseLeave = () => {
      el.classList.remove("active");
      activeRef.current = false;
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, {
      passive: true,
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  return <div ref={elRef} className="dot-accent" />;
}
