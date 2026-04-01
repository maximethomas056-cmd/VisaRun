// Sentry — config côté navigateur (pages, composants React)
// Ce fichier est chargé automatiquement par Next.js au démarrage côté client

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10% des transactions en prod pour pas saturer le quota free
  tracesSampleRate: 0.1,

  // Désactivé en développement local
  enabled: process.env.NODE_ENV === "production",
});
