"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { useTranslations } from "next-intl";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations("common");
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-black/40 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                danger ? "bg-red-50" : "bg-blue-50"
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${danger ? "text-red-500" : "text-blue-500"}`}
              />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-neutral-500 mb-6">{description}</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button
                onClick={onConfirm}
                className={
                  danger
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : undefined
                }
              >
                {confirmLabel ?? t("confirm")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
