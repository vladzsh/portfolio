"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const NAV_ITEMS = [
  { label: "Experience", href: "/#experience" },
  { label: "Projects", href: "/#projects" },
  { label: "Skills", href: "/#skills" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
  { label: "Blog", href: "/blog" },
  { label: "CV", href: "/cv" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [isDark, setIsDark] = useState(true);
  const sectionCacheRef = useRef<{ id: string; top: number; bottom: number }[]>([]);

  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => {
      setIsDark(html.getAttribute("data-theme") === "dark");
    };
    updateTheme();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-theme") updateTheme();
      }
    });
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const cacheSections = useCallback(() => {
    const sections = document.querySelectorAll("section[id]");
    sectionCacheRef.current = Array.from(sections).map((s) => ({
      id: s.getAttribute("id") || "",
      top: (s as HTMLElement).offsetTop,
      bottom: (s as HTMLElement).offsetTop + (s as HTMLElement).offsetHeight,
    }));
  }, []);

  useEffect(() => {
    cacheSections();
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const threshold = window.innerWidth <= 920 ? 20 : 300;
      setScrolled(window.scrollY > threshold);

      if (Math.abs(window.scrollY - lastScrollY) > 50) {
        setMenuOpen(false);
        lastScrollY = window.scrollY;
      }

      const scrollY = window.scrollY + 120;
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 50;
      const cache = sectionCacheRef.current;
      let currentId = "";
      if (atBottom && cache.length) {
        currentId = cache[cache.length - 1].id;
      } else {
        for (const s of cache) {
          if (scrollY >= s.top && scrollY < s.bottom) { currentId = s.id; break; }
        }
      }
      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", cacheSections, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", cacheSections);
    };
  }, [cacheSections]);

  const logoSrc = isDark ? "/img/logo-white.svg" : "/img/logo-black.svg";

  return (
    <nav className={`nav sticky top-0 z-100 flex justify-between items-center border-b border-transparent tracking-[3px] px-12 py-4 max-[920px]:px-4 max-[920px]:py-3${scrolled || menuOpen ? " scrolled" : ""}`}>
      <Link href="/" className="flex items-center gap-4">
        <Image src={logoSrc} alt="Logo" width={40} height={40} className="h-[40px] w-auto" priority />
        <span style={{ color: "var(--color-text-primary)" }} className="text-lg">vladzsh</span>
      </Link>

      <button
        className="hidden max-[920px]:block border-none bg-transparent text-2xl cursor-pointer"
        style={{ color: "var(--color-text-secondary)" }}
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        &#9776;
      </button>

      <div className={`nav-menu${menuOpen ? " open" : ""}`}>
        {NAV_ITEMS.map(({ label, href }) => {
          const isHash = href.startsWith("/#");
          const isActive = isHash && activeId === href.slice(2);
          const cls = `nav-link${isActive ? " active" : ""}`;

          return isHash ? (
            <a key={href} href={href} className={cls} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ) : (
            <Link key={href} href={href} className={cls} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
