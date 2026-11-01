import React from "react";
interface LogoProps { className?: string; variant?: "yellow" | "light" | "navy"; }
export default function Logo({ className = "h-12" }: LogoProps) {
 return <div className={`inline-flex items-center gap-2.5 select-none min-w-0 ${className}`} aria-label="attappadi online">
  <img src="/attappadi-mark.svg" alt="" className="h-full w-auto aspect-square shrink-0" />
  <span className="ao-brand-wordmark whitespace-nowrap text-[clamp(1rem,2.4vw,2rem)] font-extrabold tracking-[-0.055em] leading-none"><span>attappadi</span> <span className="text-[#94d900]">online</span></span>
 </div>;
}
