"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase/client";

type Generation = {
  id: string;
  type: string;
  prompt: string;
  result: string;
  created_at: string;
};

/**
 * Shows the signed-in user's past generations for the given tool types.
 * Re-fetches whenever refreshKey changes (i.e. after a new generation).
 */
export function AiGenerationHistory({ types, refreshKey }: { types: string[]; refreshKey: number }) {
  const t = useTranslations("aiTools");
  const [items, setItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const typeKey = types.join(",");
  useEffect(() => {
    let cancelled = false;
    getSupabaseClient()
      .from("generations")
      .select("id, type, prompt, result, created_at")
      .in("type", typeKey.split(","))
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (cancelled) return;
        setItems(data ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [typeKey, refreshKey]);

  return (
    <div className="bg-paper rounded-lg border p-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-neutral-500" />
        <h3 className="font-bold text-lg">{t("historyTitle")}</h3>
      </div>
      {loading ? null : items.length === 0 ? (
        <p className="text-sm text-neutral-500">{t("historyEmpty")}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isOpen = expandedId === item.id;
            let summary = item.prompt;
            try {
              const parsed = JSON.parse(item.prompt);
              summary = parsed.prompt || parsed.campaignName || parsed.brandName || parsed.clientName || parsed.niche || parsed.goal || parsed.brief || item.type;
            } catch {}
            return (
              <div key={item.id} className="bg-gray-50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-3 p-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{summary}</p>
                    <p className="text-xs text-neutral-400">
                      {item.type} • {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 flex-shrink-0 text-neutral-400" />
                  )}
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="px-3 pb-3 text-xs text-neutral-600 whitespace-pre-wrap font-sans max-h-64 overflow-y-auto">
                        {item.result}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
