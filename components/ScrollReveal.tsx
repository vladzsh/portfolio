"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export default function ScrollReveal({
  children,
  className = "",
  stagger = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            if (stagger) {
              const items = entry.target.querySelectorAll(".stagger-item");
              items.forEach((item, i) => {
                const id = setTimeout(() => item.classList.add("visible"), i * 240);
                timersRef.current.push(id);
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.01 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
  }, [stagger]);

  return (
    <div ref={ref} className={`reveal ${className}`.trim()}>
      {children}
    </div>
  );
}
