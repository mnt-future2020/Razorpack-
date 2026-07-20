import { GoogleAnalytics } from "@next/third-parties/google";
import { getSiteSettings } from "@/lib/site-config";

/**
 * Server component. Resolves the GA id during render instead of firing a
 * client-side fetch to /api/admin/settings after hydration — that round-trip
 * meant fast bounces were never recorded.
 *
 * Precedence is unchanged in spirit: the admin Settings value still wins, with
 * NEXT_PUBLIC_GA_ID as a fallback so analytics work before anything is
 * configured in the panel.
 */
export async function DynamicGoogleAnalytics() {
  const settings = await getSiteSettings();
  const gaId = settings.googleAnalyticsId || process.env.NEXT_PUBLIC_GA_ID;

  if (!gaId) return null;

  return <GoogleAnalytics gaId={gaId} />;
}
