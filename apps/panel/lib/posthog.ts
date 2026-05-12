import { PostHog } from "posthog-node";

export const posthogServer = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  { host: "https://eu.posthog.com", flushAt: 1, flushInterval: 0 }
);
