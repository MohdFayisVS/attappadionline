import React from "react";

interface LogoProps {
  className?: string;
  variant?: "yellow" | "light" | "navy";
}

export default function Logo({ className = "h-12", variant = "yellow" }: LogoProps) {
  // Define dynamic colors based on specified theme variations
  let primaryCol: string;
  let secondaryCol: string;

  if (variant === "yellow") {
    primaryCol = "#fff";
    secondaryCol = "#ffe500";
  } else if (variant === "light") {
    primaryCol = "#ffffff";
    secondaryCol = "#f1f5f9";
  } else {
    // Navy brand variant (e.g., for light background footers or widgets)
    primaryCol = "#052962";
    secondaryCol = "#c70000";
  }

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Perfectly scaled responsive custom vector recreating the uploaded brand logo */}
      <svg
        viewBox="0 0 350 100"
        className="h-full w-auto flex-shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Left offset diamond */}
        <path
          d="M 12 50 L 44 18 L 76 50 L 44 82 Z"
          fill={secondaryCol}
        />
        {/* Right offset diamond */}
        <path
          d="M 104 50 L 136 18 L 168 50 L 136 82 Z"
          fill={secondaryCol}
        />
        {/* Central taller diamond */}
        <path
          d="M 58 40 L 90 8 L 122 40 L 90 72 Z"
          fill={primaryCol}
        />
        {/* Lower inverted anchor diamond */}
        <path
          d="M 90 56 L 110 76 L 90 104 L 70 76 Z"
          fill={secondaryCol}
        />

        {/* Custom text brand mapping following the visual layout of uploaded logo */}
        <g transform="translate(185, 0)">
          {/* "attappadi" on top with bold slab typography */}
          <text
            x="0"
            y="44"
            fill={primaryCol}
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 900,
              fontSize: "42px",
              letterSpacing: "-2px"
            }}
          >
            attappadi
          </text>
          {/* "online" on the bottom containing the custom styled vertical bar 'i' */}
          <text
            x="2"
            y="81"
            fill={secondaryCol}
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              fontWeight: 900,
              fontSize: "42px",
              letterSpacing: "-1.5px"
            }}
          >
            online
          </text>
        </g>
      </svg>
    </div>
  );
}
