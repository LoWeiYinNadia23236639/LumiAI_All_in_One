/**
 * Temporary public demo access for the AI Hub.
 *
 * Set to false to restore the normal signed-in-only behaviour across the
 * AI pages, browser clients and API routes. Guest generations are never
 * written to a user's private generation history.
 */
export const AI_GUEST_ACCESS_ENABLED = true;

/** Guest request allowances per IP during each 24-hour window. */
export const GUEST_RATE_LIMITS = {
  text: 20,
  image: 18,
  identity: 5,
  aiVideo: 2,
  animatic: 5,
} as const;

export type GuestRateScope = keyof typeof GUEST_RATE_LIMITS;
