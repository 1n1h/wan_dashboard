"use client";

import { useEffect, useRef, useState, type ElementType, type RefObject } from "react";
import { cn } from "@/lib/utils";

type TimelineContentProps<T extends ElementType = "div"> = {
  as?: T;
  animationNum: number;
  timelineRef: RefObject<HTMLElement | null>;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "ref" | "className" | "children">;

/**
 * Lightweight scroll-reveal wrapper. Children fade-up + de-blur in sequence
 * once the parent (`timelineRef`) enters the viewport. `animationNum` controls
 * the stagger order. CSS-driven, no animation library required.
 */
export function TimelineContent<T extends ElementType = "div">({
  as,
  animationNum,
  timelineRef,
  className,
  children,
  ...rest
}: TimelineContentProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const [visible, setVisible] = useState(false);
  const ownRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const target = timelineRef.current;
    if (!target) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.05 }
    );
    obs.observe(target);
    return () => obs.disconnect();
  }, [timelineRef]);

  const delay = `${animationNum * 80}ms`;

  return (
    <Tag
      {...rest}
      ref={(node: HTMLElement | null) => {
        ownRef.current = node;
      }}
      className={cn(
        "transition-[opacity,transform,filter] duration-700 ease-out will-change-transform",
        visible
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-4 blur-md",
        className
      )}
      style={{ transitionDelay: visible ? delay : "0ms", ...(rest as { style?: React.CSSProperties }).style }}
    >
      {children}
    </Tag>
  );
}
