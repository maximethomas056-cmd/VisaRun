const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const globalStore = globalThis.__visarunRateLimitStore || new Map();
if (!globalThis.__visarunRateLimitStore) {
  globalThis.__visarunRateLimitStore = globalStore;
}

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function isValidEmail(email = "") {
  return EMAIL_RE.test(normalizeEmail(email));
}

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

export function isRateLimited(key, limit, windowMs) {
  const now = Date.now();
  const bucket = globalStore.get(key) || [];
  const fresh = bucket.filter((ts) => now - ts < windowMs);

  if (fresh.length >= limit) {
    globalStore.set(key, fresh);
    return true;
  }

  fresh.push(now);
  globalStore.set(key, fresh);
  return false;
}
