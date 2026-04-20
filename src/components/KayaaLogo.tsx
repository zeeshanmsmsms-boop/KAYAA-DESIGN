import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KayaaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'overlay';
}

export function KayaaLogo({ className, variant = 'light' }: KayaaLogoProps) {
  const isOverlay = variant === 'overlay';
  
  return (
    <div className={cn(
      "inline-flex flex-col items-center leading-none select-none",
      isOverlay ? "bg-white/95 backdrop-blur-sm p-3 rounded-sm border border-black/5" : "",
      className
    )}>
      <span className={cn(
        "font-serif font-bold tracking-[3px] uppercase",
        variant === 'dark' ? "text-ink" : (isOverlay ? "text-ink" : "text-gold"),
        isOverlay ? "text-[14px]" : "text-[24px]"
      )}>
        KAYAA
      </span>
      <div className={cn(
        "w-full h-px my-1",
        variant === 'dark' || isOverlay ? "bg-ink/10" : "bg-gold/20"
      )} />
      <span className={cn(
        "font-sans tracking-[2px] font-bold uppercase",
        variant === 'dark' || isOverlay ? "text-ink/60" : "text-white/40",
        isOverlay ? "text-[7px]" : "text-[9px]"
      )}>
        Clothing
      </span>
    </div>
  );
}
