"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { adminFetch } from "@/lib/admin-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Loader2,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Star,
  Briefcase,
  Heart,
  Image,
  Globe,
  Settings,
  ChevronRight,
  Eye,
  MessageSquare,
} from "lucide-react";

interface DashboardMetrics {
  totalLeads: number;
  thisMonthLeads: number;
  thisWeekLeads: number;
  leadsGrowth: number;
  completedLeads: number;
  pendingLeads: number;
  newLeads: number;
  completionRate: number;
  totalFeedback: number;
  newFeedback: number;
  resolvedFeedback: number;
  totalTestimonials: number;
  publishedTestimonials: number;
  totalServices: number;
  activeServices: number;
  totalServiceViews: number;
  totalProducts: number;
  activeProducts: number;
  totalPortfolio: number;
  activePortfolio: number;
  totalPortfolioViews: number;
}

interface RecentLead {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  status: string;
  priority: string;
  submittedAt: string;
}

interface DashboardData {
  metrics: DashboardMetrics;
  recentLeads: RecentLead[];
  analytics: {
    leadsByStatus: { status: string; count: number }[];
    feedbackByType: { type: string; count: number }[];
  };
}

interface VisitorData {
  activeUsers: number;
  pageViews: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      const [dashRes, analyticsRes] = await Promise.all([
        adminFetch("/api/admin/dashboard"),
        adminFetch("/api/admin/analytics?period=30").catch(() => null),
      ]);

      const result = await dashRes.json();

      if (result.success) {
        setDashboardData(result.data);
        if (showRefreshToast) {
          toast({
            title: "Dashboard Updated",
            description: "Latest data has been loaded successfully.",
          });
        }
      } else {
        throw new Error(result.message || "Failed to fetch dashboard data");
      }

      if (analyticsRes) {
        const analyticsResult = await analyticsRes.json();
        if (analyticsResult.success) {
          setVisitorData({
            activeUsers: analyticsResult.data.overview.activeUsers,
            pageViews: analyticsResult.data.overview.pageViews,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#26A8E0]" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-400" />
          <p className="text-gray-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={() => fetchDashboardData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const { metrics, recentLeads } = dashboardData;

  const stats = [
    { title: "Total Leads", value: metrics.totalLeads, change: `${metrics.leadsGrowth >= 0 ? "+" : ""}${metrics.leadsGrowth}%`, icon: Users },
    { title: "Pending Leads", value: metrics.pendingLeads, change: `${metrics.newLeads} new`, icon: TrendingUp },
    { title: "Website Visitors", value: visitorData?.activeUsers ?? "—", change: visitorData ? `${visitorData.pageViews} views` : "30 days", icon: Globe },
    { title: "Products", value: metrics.totalProducts, change: `${metrics.activeProducts} active`, icon: Briefcase },
  ];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "consulting": return "bg-purple-100 text-purple-800";
      case "confirmed": return "bg-indigo-100 text-indigo-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const quickActions = [
    { title: "Products", href: "/admin/products", icon: Briefcase },
    { title: "Services", href: "/admin/services", icon: Eye },
    { title: "Leads", href: "/admin/leads", icon: Users },
    { title: "Banners", href: "/admin/banners", icon: Image },
    { title: "Gallery", href: "/admin/gallery", icon: Globe },
    { title: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#221E1F]">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="border-[#221E1F]/20 text-[#221E1F] hover:bg-[#221E1F]/10 hover:text-[#221E1F] hover:border-[#221E1F]/30"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-md bg-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#26A8E0]/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-[#26A8E0]" />
                </div>
                <span className="text-xs font-medium text-[#26A8E0] bg-[#26A8E0]/10 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold text-[#221E1F]">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1 font-medium">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content - Recent Leads & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Leads - Takes 3 columns */}
        <Card className="border-0 shadow-lg lg:col-span-3">
          <CardHeader className="bg-linear-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-[#221E1F]">
                <Users className="h-5 w-5 text-[#26A8E0]" />
                Recent Leads
              </CardTitle>
              <Link href="/admin/leads">
                <Button variant="outline" size="sm" className="text-[#221E1F] hover:bg-[#221E1F]/10 hover:text-[#221E1F] border-[#221E1F]/20 hover:border-[#221E1F]/30">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {recentLeads.length > 0 ? (
              <div className="divide-y">
                {recentLeads.map((lead) => (
                  <div key={lead._id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                    <div className="w-10 h-10 bg-[#221E1F] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-medium text-sm">
                        {lead.fullName.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#221E1F] truncate">{lead.fullName}</p>
                      <p className="text-sm text-gray-500 truncate">{lead.subject}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge className={`${getStatusColor(lead.status)} border-0`}>
                        {lead.status.toUpperCase()}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">{getTimeAgo(lead.submittedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent leads found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Takes 1 column */}
        <Card className="border-0 shadow-lg h-fit">
          <CardHeader className="bg-linear-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <Settings className="h-5 w-5 text-[#26A8E0]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-3 flex flex-col items-center gap-1 hover:bg-[#26A8E0]/10 hover:border-[#26A8E0]"
                  >
                    <action.icon className="h-5 w-5 text-[#221E1F]" />
                    <span className="text-xs font-medium text-[#221E1F]">{action.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
            
            {/* Completion Rate */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Lead Completion</span>
                <span className="font-semibold text-[#26A8E0]">{metrics.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#26A8E0] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.completionRate}%` }}
                />
              </div>
            </div>

            {/* Additional Stats */}
            <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-[#221E1F]">{metrics.thisMonthLeads}</p>
                <p className="text-[10px] text-gray-500">This Month</p>
              </div>
              <div className="text-center p-2 bg-gray-50 rounded-lg">
                <p className="text-lg font-bold text-[#221E1F]">{metrics.completedLeads}</p>
                <p className="text-[10px] text-gray-500">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
