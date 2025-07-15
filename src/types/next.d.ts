/// <reference types="next" />
/// <reference types="next/image" />
/// <reference types="next/navigation" />
/// <reference types="next/link" />

import type { NextConfig } from 'next';

declare module 'next/config' {
  const config: NextConfig;
  export default config;
}

declare module 'next/navigation' {
  const useRouter: () => {
    push: (path: string) => Promise<boolean>;
    replace: (path: string) => Promise<boolean>;
    prefetch: (path: string) => Promise<void>;
    back: () => void;
    forward: () => void;
    refresh: () => void;
  };
  export { useRouter };
}

declare module 'next/link' {
  const Link: React.ForwardRefExoticComponent<{
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    prefetch?: boolean;
    locale?: string;
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLAnchorElement>>;
  export default Link;
}

declare module 'next/image' {
  const Image: React.ForwardRefExoticComponent<{
    src: string;
    alt: string;
    width?: number;
    height?: number;
    quality?: number;
    priority?: boolean;
    loading?: 'eager' | 'lazy';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    className?: string;
    style?: React.CSSProperties;
    sizes?: string;
    fill?: boolean;
    children?: React.ReactNode;
  } & React.RefAttributes<HTMLImageElement>>;
  export default Image;
}

