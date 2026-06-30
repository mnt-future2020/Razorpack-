import { NextRequest, NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import connectDB from "@/config/models/connectDB";
import Settings from "@/config/utils/admin/settings/settingsSchema";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    const settings = await Settings.findOne({ isActive: true }).lean();

    if (!settings?.ga4PropertyId || !settings?.ga4ServiceAccountKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Google Analytics is not configured. Add your GA4 Property ID and Service Account Key in Settings > Integrations.",
        },
        { status: 400 }
      );
    }

    let credentials;
    try {
      credentials = JSON.parse(settings.ga4ServiceAccountKey as string);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid service account key JSON." },
        { status: 400 }
      );
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
    const propertyId = settings.ga4PropertyId as string;

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || "30";
    const startDate = `${period}daysAgo`;

    // Run all reports in parallel
    const [overviewRes, topPagesRes, trafficRes, devicesRes, dailyRes] =
      await Promise.all([
        // Overview metrics
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: "today" }],
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" },
            { name: "sessions" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
            { name: "newUsers" },
          ],
        }),
        // Top pages
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "pagePath" }],
          metrics: [
            { name: "screenPageViews" },
            { name: "activeUsers" },
          ],
          orderBys: [
            { metric: { metricName: "screenPageViews" }, desc: true },
          ],
          limit: 10,
        }),
        // Traffic sources
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        }),
        // Devices
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "activeUsers" }],
          orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        }),
        // Daily trend (last N days)
        analyticsDataClient.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate, endDate: "today" }],
          dimensions: [{ name: "date" }],
          metrics: [
            { name: "activeUsers" },
            { name: "screenPageViews" },
          ],
          orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
        }),
      ]);

    // Parse overview
    const overviewRow = overviewRes[0]?.rows?.[0];
    const overview = {
      activeUsers: Number(overviewRow?.metricValues?.[0]?.value || 0),
      pageViews: Number(overviewRow?.metricValues?.[1]?.value || 0),
      sessions: Number(overviewRow?.metricValues?.[2]?.value || 0),
      bounceRate: Number(
        Number(overviewRow?.metricValues?.[3]?.value || 0).toFixed(1)
      ),
      avgSessionDuration: Number(
        Number(overviewRow?.metricValues?.[4]?.value || 0).toFixed(0)
      ),
      newUsers: Number(overviewRow?.metricValues?.[5]?.value || 0),
    };

    // Parse top pages
    const topPages = (topPagesRes[0]?.rows || []).map((row) => ({
      page: row.dimensionValues?.[0]?.value || "",
      views: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    }));

    // Parse traffic sources
    const trafficSources = (trafficRes[0]?.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "",
      sessions: Number(row.metricValues?.[0]?.value || 0),
      users: Number(row.metricValues?.[1]?.value || 0),
    }));

    // Parse devices
    const devices = (devicesRes[0]?.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "",
      users: Number(row.metricValues?.[0]?.value || 0),
    }));

    // Parse daily trend
    const dailyTrend = (dailyRes[0]?.rows || []).map((row) => {
      const dateStr = row.dimensionValues?.[0]?.value || "";
      const formatted = dateStr
        ? `${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`
        : "";
      return {
        date: formatted,
        users: Number(row.metricValues?.[0]?.value || 0),
        pageViews: Number(row.metricValues?.[1]?.value || 0),
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: { overview, topPages, trafficSources, devices, dailyTrend },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
