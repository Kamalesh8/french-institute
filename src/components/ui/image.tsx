"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CustomImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  quality?: number;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function CustomImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  placeholder = "blur",
  quality = 80,
  sizes = "100vw",
  fill = false,
  style,
}: CustomImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        priority={priority}
        placeholder={placeholder}
        quality={quality}
        sizes={sizes}
        fill={fill}
        style={style}
        onLoadingComplete={() => setIsLoading(false)}
      />
      {isLoading && (
        <div
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse",
            className
          )}
        />
      )}
    </>
  );
}

