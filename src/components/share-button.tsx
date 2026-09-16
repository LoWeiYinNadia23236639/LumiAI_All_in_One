"use client";

import { useState, useCallback } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url?: string;
  label?: string;
  variant?: "outline" | "ghost" | "primary";
  className?: string;
}

export function ShareButton({
  url,
  label = "Share",
  variant = "outline",
  className,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

    try {
      if (navigator.share && !url) {
        await navigator.share({
          title: document.title,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Silently fail
      }
    }
  }, [url]);

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleShare}
      leftIcon={copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
    >
      {copied ? "Copied!" : label}
    </Button>
  );
}
