import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { enforceGuestRateLimit } from "../src/lib/ai/server";
import { GUEST_RATE_LIMITS } from "../src/lib/ai/access";

const request = (ip: string) => new NextRequest("http://localhost/api/test", {
  headers: { "x-forwarded-for": ip },
});

const guest = request("203.0.113.10");
for (let count = 0; count < GUEST_RATE_LIMITS.text; count += 1) {
  assert.equal(enforceGuestRateLimit(guest, "text"), null, `request ${count + 1} should pass`);
}
const blocked = enforceGuestRateLimit(guest, "text");
assert.equal(blocked?.status, 429, "the request after the allowance should be blocked");
assert.ok(Number(blocked?.headers.get("Retry-After")) > 0, "Retry-After should be present");
assert.equal(enforceGuestRateLimit(request("203.0.113.11"), "text"), null, "another IP should be independent");
assert.equal(enforceGuestRateLimit(guest, "image"), null, "another tool scope should be independent");

console.log(`Guest limit passed: ${GUEST_RATE_LIMITS.text} allowed, next request 429; IP and scope isolation confirmed.`);
