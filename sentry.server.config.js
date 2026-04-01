// Sentry — config côté serveur (API routes : webhook, parse, check-access...)
// Ce fichier est chargé automatiquement par Next.js au démarrage côté serveur

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% des transactions
  tracesSampleRate: 0.1,

  // Désactivé en développement local
  enabled: process.env.NODE_ENV === "production",
});
