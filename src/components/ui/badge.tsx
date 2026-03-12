"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "gradient";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-100 text-gray-800",
      success: "bg-green-100 text-green-700",
      warning: "bg-yellow-100 text-yellow-700",
      danger: "bg-red-100 text-red-700",
      info: "bg-blue-100 text-blue-700",
      gradient: "bg-gradient-to-r from-violet-500 to-pink-500 text-white",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
