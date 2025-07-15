import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.Scrollbar className="flex touch-none select-none transition-colors duration-[160ms]">
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-[inherit] bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Scrollbar
      orientation="horizontal"
      className="flex touch-none select-none transition-colors duration-[160ms]"
    >
      <ScrollAreaPrimitive.Thumb className="relative flex-1 rounded-[inherit] bg-border" />
    </ScrollAreaPrimitive.Scrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollAreaViewport = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Viewport
    ref={ref}
    className={cn("h-full w-full rounded-[inherit]", className)}
    {...props}
  />
))
ScrollAreaViewport.displayName = ScrollAreaPrimitive.Viewport.displayName

const ScrollAreaScrollbar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>
>(({ className, orientation, ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors duration-[160ms]",
      orientation === "vertical" && "h-full w-2.5 border-l border-border",
      orientation === "horizontal" && "h-2.5 border-t border-border",
      className
    )}
    {...props}
  />
))
ScrollAreaScrollbar.displayName = ScrollAreaPrimitive.Scrollbar.displayName

const ScrollAreaThumb = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Thumb>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Thumb>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Thumb
    ref={ref}
    className={cn(
      "relative flex-1 rounded-full bg-border transition-colors duration-[160ms] hover:bg-border/80 data-[orientation=horizontal]:h-2.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-2.5",
      className
    )}
    {...props}
  />
))
ScrollAreaThumb.displayName = ScrollAreaPrimitive.Thumb.displayName

const ScrollAreaCorner = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Corner>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Corner>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Corner
    ref={ref}
    className={cn("bg-background", className)}
    {...props}
  />
))
ScrollAreaCorner.displayName = ScrollAreaPrimitive.Corner.displayName

export {
  ScrollArea,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaCorner,
}

