"use client";

import { ElementType, ReactNode, useEffect, useRef } from "react";

type Props = {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
  threshold?: number | number[];
  rootMargin?: string;
};

export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
  threshold = [0, 0.15],
  rootMargin = "0px 0px -50px 0px",
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => {
      if (delay > 0) el.style.transitionDelay = `${delay}ms`;
      el.classList.add("is-visible");
    };

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      show();
      return;
    }

    const isInViewport = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const vw = window.innerWidth || document.documentElement.clientWidth;
      return (
        rect.bottom > 0 &&
        rect.right > 0 &&
        rect.top < vh &&
        rect.left < vw
      );
    };

    let frame = 0;
    const immediateCheck = () => {
      if (isInViewport()) {
        show();
        return true;
      }
      return false;
    };

    frame = requestAnimationFrame(() => {
      if (immediateCheck()) return;

      const observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              show();
              obs.unobserve(entry.target);
            }
          }
        },
        { threshold, rootMargin }
      );

      observer.observe(el);

      const onLoad = () => {
        if (isInViewport()) {
          show();
          observer.disconnect();
          window.removeEventListener("load", onLoad);
        }
      };
      window.addEventListener("load", onLoad);

      (el as HTMLElement & { _revealCleanup?: () => void })._revealCleanup =
        () => {
          observer.disconnect();
          window.removeEventListener("load", onLoad);
        };
    });

    return () => {
      cancelAnimationFrame(frame);
      const cleanup = (el as HTMLElement & { _revealCleanup?: () => void })
        ._revealCleanup;
      if (cleanup) cleanup();
    };
  }, [delay, threshold, rootMargin]);

  return (
    <Tag ref={ref} className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
