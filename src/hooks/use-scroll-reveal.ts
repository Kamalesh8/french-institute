import { useEffect } from "react";

/**
 * Adds scroll-reveal animation to any element with `data-reveal` attribute.
 * The element should start with `opacity-0 translate-y-6` (or similar) and transition utilities.
 * When it enters the viewport 15% from the bottom, the attribute `data-reveal="in"` is set,
 * allowing the element to reach full opacity & position via Tailwind classes.
 */
export default function useScrollReveal() {
  useEffect(() => {
    const elements: HTMLElement[] = Array.from(
      document.querySelectorAll('[data-reveal]')
    );

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-reveal', 'in');
            
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);
}
