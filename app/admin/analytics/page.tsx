"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Users,
  Eye,
  MousePointerClick,
  Clock,
  UserPlus,
  RefreshCw,
  Loader2,
  AlertCircle,
  Monitor,
  Smartphone,
  Tablet,
  ArrowUpRight,
  Globe,
  TrendingUp,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    activeUsers: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
  };
  topPages: { page: string; views: number; users: number }[];
  trafficSources: { source: string; sessions: number; users: number }[];
  devices: { device: string; users: number }[];
  dailyTrend: { date: string; users: number; pageViews: number }[];
}

const PERIODS = [
  { label: "7 Days", value: "7" },
  { label: "14 Days", value: "14" },
  { label: "30 Days", value: "30" },
  { label: "90 Days", value: "90" },
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("30");

  const fetchAnalytics = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const response = await adminFetch(`/api/admin/analytics?period=${period}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to fetch analytics");
      }
    } catch {
      setError("Failed to connect to analytics service");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return Monitor;
      case "mobile":
        return Smartphone;
      case "tablet":
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getMaxPageViews = () => {
    if (!data?.dailyTrend.length) return 1;
    return Math.max(...data.dailyTrend.map((d) => d.pageViews), 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#26A8E0]" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-10 w-10 mx-auto mb-4 text-amber-500" />
          <h2 className="text-lg font-semibold text-[#221E1F] mb-2">
            Analytics Not Available
          </h2>
          <p className="text-gray-600 mb-6 text-sm">{error}</p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => fetchAnalytics()}
              variant="outline"
              className="border-[#221E1F]/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button
              onClick={() => (window.location.href = "/admin/settings")}
              className="bg-[#221E1F] hover:bg-[#333] text-white"
            >
              Go to Settings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalDeviceUsers = data.devices.reduce((sum, d) => sum + d.users, 0) || 1;

  const statCards = [
    {
      title: "Active Users",
      value: data.overview.activeUsers.toLocaleString(),
      icon: Users,
      color: "#26A8E0",
    },
    {
      title: "Page Views",
      value: data.overview.pageViews.toLocaleString(),
      icon: Eye,
      color: "#22c55e",
    },
    {
      title: "Sessions",
      value: data.overview.sessions.toLocaleString(),
      icon: MousePointerClick,
      color: "#a855f7",
    },
    {
      title: "New Users",
      value: data.overview.newUsers.toLocaleString(),
      icon: UserPlus,
      color: "#f59e0b",
    },
    {
      title: "Bounce Rate",
      value: `${data.overview.bounceRate}%`,
      icon: ArrowUpRight,
      color: "#ef4444",
    },
    {
      title: "Avg. Duration",
      value: formatDuration(data.overview.avgSessionDuration),
      icon: Clock,
      color: "#6366f1",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#221E1F] flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-[#26A8E0]" />
            Website Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Google Analytics data for your website
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  period === p.value
                    ? "bg-white text-[#221E1F] shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Button
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="border-[#221E1F]/20"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md">
            <CardContent className="p-4">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${stat.color}15` }}
              >
                <stat.icon
                  className="h-4.5 w-4.5"
                  style={{ color: stat.color }}
                />
              </div>
              <p className="text-2xl font-bold text-[#221E1F]">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Daily Trend Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-linear-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
          <CardTitle className="flex items-center gap-2 text-[#221E1F] text-base">
            <TrendingUp className="h-5 w-5 text-[#26A8E0]" />
            Daily Page Views
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {data.dailyTrend.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-end gap-[2px] h-40">
                {data.dailyTrend.map((day, i) => {
                  const height = (day.pageViews / getMaxPageViews()) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 group relative"
                      title={`${day.date}: ${day.pageViews} views, ${day.users} users`}
                    >
                      <div
                        className="bg-[#26A8E0] rounded-t-sm hover:bg-[#1a8bc0] transition-colors cursor-pointer w-full"
                        style={{
                          height: `${Math.max(height, 2)}%`,
                        }}
                      />
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#221E1F] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                        {day.date}: {day.pageViews} views
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 px-1">
                <span>{data.dailyTrend[0]?.date}</span>
                <span>{data.dailyTrend[data.dailyTrend.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="bg-linear-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
            <CardTitle className="flex items-center gap-2 text-[#221E1F] text-base">
              <Eye className="h-5 w-5 text-[#26A8E0]" />
              Top Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.topPages.length > 0 ? (
              <div className="divide-y">
                {data.topPages.map((page, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#221E1F] truncate font-mono">
                        {page.page}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-[#221E1F]">
                        {page.views.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {page.users} users
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Traffic Sources & Devices */}
        <div className="space-y-6">
          {/* Traffic Sources */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#26A8E0]/10 to-[#221E1F]/10 p-4 border-b">
              <CardTitle className="flex items-center gap-2 text-[#221E1F] text-base">
                <Globe className="h-5 w-5 text-[#26A8E0]" />
                Traffic Sources
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {data.trafficSources.length > 0 ? (
                data.trafficSources.map((source, i) => {
                  const totalSessions =
                    data.trafficSources.reduce(
                      (sum, s) => sum + s.sessions,
                      0
                    ) || 1;
                  const percentage = (
                    (source.sessions / totalSessions) *
                    100
                  ).toFixed(0);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{source.source}</span>
                        <span className="font-medium text-[#221E1F]">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-[#26A8E0] h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No data</p>
              )}
            </CardContent>
          </Card>

          {/* Devices */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-linear-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
              <CardTitle className="flex items-center gap-2 text-[#221E1F] text-base">
                <Monitor className="h-5 w-5 text-[#26A8E0]" />
                Devices
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {data.devices.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {data.devices.map((device, i) => {
                    const DeviceIcon = getDeviceIcon(device.device);
                    const percentage = (
                      (device.users / totalDeviceUsers) *
                      100
                    ).toFixed(0);
                    return (
                      <div
                        key={i}
                        className="text-center p-3 bg-gray-50 rounded-lg"
                      >
                        <DeviceIcon className="h-5 w-5 mx-auto mb-1 text-[#26A8E0]" />
                        <p className="text-lg font-bold text-[#221E1F]">
                          {percentage}%
                        </p>
                        <p className="text-[10px] text-gray-500 capitalize">
                          {device.device}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No data</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
