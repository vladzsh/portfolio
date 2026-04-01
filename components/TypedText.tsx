"use client";

import { useEffect, useRef, useState } from "react";

interface TypedTextProps {
  text: string;
  speed?: number;
}

export default function TypedText({ text, speed = 80 }: TypedTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            setStarted(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!started) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [started, text, speed]);

  return (
    <p
      ref={ref}
      className="text-lg md:text-xl tracking-[1px] md:tracking-[3px] mb-5 whitespace-nowrap"
      style={{ color: "green" }}
    >
      {displayed}
      <span className="typed-cursor">_</span>
    </p>
  );
}
