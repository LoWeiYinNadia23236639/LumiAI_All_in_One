"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

export function AiLoadingText({ toolKey, className = "" }: { toolKey: string; className?: string }) {
  const t = useTranslations("aiTools");
  const messages = t.raw(`loadingMessages.${toolKey}`) as string[];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 800);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={index}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        className={`text-sm text-neutral-500 ${className}`}
      >
        {messages[index % messages.length]}
      </motion.p>
    </AnimatePresence>
  );
}
