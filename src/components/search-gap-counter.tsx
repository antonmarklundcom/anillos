"use client";
import { useEffect, useRef } from "react";
import { recordSalesSearchGapAction } from "@/app/actions/sales-workspace";
import type { SEARCH_GAP_INTENTS } from "@/domain/sales-workspace";

/** No search string crosses this boundary; the server enforces the owner's opt-in. */
export function SearchGapCounter({
  intent,
}: {
  intent: (typeof SEARCH_GAP_INTENTS)[number];
}) {
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    void recordSalesSearchGapAction(intent).catch(() => undefined);
  }, [intent]);
  return null;
}
