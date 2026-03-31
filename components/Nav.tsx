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

  // Detect theme from data-theme attribute
  useEffect(() => {
    const html = document.documentElement;

    const updateTheme = () => {
      setIsDark(html.getAttribute("data-theme") === "dark");
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateTheme();
        }
      }
    });

    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });

    return () => observer.disconnect();
  }, []);

  // Cache section positions
  const cacheSections = useCallback(() => {
    const sections = document.querySelectorAll("section[id]");
    sectionCacheRef.current = Array.from(sections).map((s) => ({
      id: s.getAttribute("id") || "",
      top: (s as HTMLElement).offsetTop,
      bottom: (s as HTMLElement).offsetTop + (s as HTMLElement).offsetHeight,
    }));
  }, []);

  // Scroll effects: scrolled state, active nav, close mobile menu
  useEffect(() => {
    cacheSections();

    const handleScroll = () => {
      const threshold = window.innerWidth <= 920 ? 20 : 300;
      setScrolled(window.scrollY > threshold);

      // Active section detection
      const scrollY = window.scrollY + 120;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 50;
      const cache = sectionCacheRef.current;

      let currentId = "";
      if (atBottom && cache.length) {
        currentId = cache[cache.length - 1].id;
      } else {
        for (const s of cache) {
          if (scrollY >= s.top && scrollY < s.bottom) {
            currentId = s.id;
            break;
          }
        }
      }
      setActiveId(currentId);
    };

    const handleResize = () => {
      cacheSections();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [cacheSections]);

  const logoSrc = isDark ? "/img/logo-white.svg" : "/img/logo-black.svg";

  return (
    <nav
      className={`nav sticky top-0 z-100 flex justify-between items-center border-b border-transparent tracking-[3px] px-12 py-3 bg-transparent max-[920px]:px-3 max-[920px]:py-2${
        scrolled || menuOpen ? " scrolled" : ""
      }`}
    >
      <Link href="/" className="nav-left flex items-center gap-4">
        <Image
          src={logoSrc}
          alt="Logo"
          width={40}
          height={40}
          className="nav-logo-img h-[40px] w-auto"
          priority
        />
        <span className="nav-logo text-lg text-[var(--color-text-primary)] pt-1">
          vladzsh
        </span>
      </Link>

      <button
        className="nav-hamburger hidden max-[920px]:block bg-none border-none text-2xl text-[var(--color-text-secondary)] cursor-pointer"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Toggle navigation menu"
      >
        &#9776;
      </button>

      <div
        className={`nav nav-links min-[920px]:!flex min-[920px]:!opacity-100 min-[920px]:!pointer-events-auto items-center gap-6 flex flex-col min-[920px]:flex-row gap-4 min-[920px]:gap-6 pt-6 min-[920px]:pt-0 pb-6 min-[920px]:pb-0 w-full min-[920px]:w-auto absolute min-[920px]:relative top-full min-[920px]:top-auto left-0 px-4 min-[920px]:px-0 transition-all duration-[0.4s] ease-out ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none min-[920px]:pointer-events-auto"
        }`}
        style={{ background: "var(--color-nav-bg)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      >
        {NAV_ITEMS.map(({ label, href }) => {
          const isHashLink = href.startsWith("/#");
          const isActive = isHashLink && activeId === href.slice(2);

          if (isHashLink) {
            return (
              <a
                key={href}
                href={href}
                className={`relative text-lg text-[var(--color-text-secondary)] transition-colors duration-[0.4s] hover:text-[var(--color-text-primary)]${
                  isActive ? " active font-semibold text-[var(--color-text-primary)]" : ""
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="relative text-lg text-[var(--color-text-secondary)] transition-colors duration-[0.4s] hover:text-[var(--color-text-primary)]"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
