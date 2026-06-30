import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/config/models/connectDB";
import { verifyAdmin } from "@/lib/admin-auth";
import Lead from "@/config/utils/admin/lead/leadSchema";
import Feedback from "@/config/utils/admin/feedback/feedbackSchema";
import Testimonial from "@/config/utils/admin/testimonial/testimonialSchema";
import Service from "@/config/utils/admin/services/serviceSchema";
import Product from "@/config/utils/admin/products/productSchema";
import Portfolio from "@/config/utils/admin/portfolio/portfolioSchema";

export async function GET(request: NextRequest) {
  const auth = verifyAdmin(request);
  if (!auth.ok) return auth.error!;

  try {
    await connectDB();

    // Get current date info for calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    // Parallel fetch all metrics
    const [
      // Lead metrics
      totalLeads,
      thisMonthLeads,
      lastMonthLeads,
      thisWeekLeads,
      completedLeads,
      pendingLeads,
      newLeads,
      leadsByStatus,
      recentLeads,

      // Feedback metrics
      totalFeedback,
      newFeedback,
      resolvedFeedback,
      feedbackByType,

      // Testimonial metrics
      totalTestimonials,
      publishedTestimonials,

      // Service metrics
      totalServices,
      activeServices,
      totalServiceViews,

      // Product metrics
      totalProducts,
      activeProducts,

      // Portfolio metrics
      totalPortfolio,
      activePortfolio,
      totalPortfolioViews,
    ] = await Promise.all([
      // Lead queries
      Lead.countDocuments(),
      Lead.countDocuments({ submittedAt: { $gte: startOfMonth } }),
      Lead.countDocuments({ submittedAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Lead.countDocuments({ submittedAt: { $gte: startOfWeek } }),
      Lead.countDocuments({ status: "completed" }),
      Lead.countDocuments({ status: { $in: ["new", "contacted", "consulting", "confirmed"] } }),
      Lead.countDocuments({ status: "new" }),
      Lead.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Lead.find()
        .sort({ submittedAt: -1 })
        .limit(6)
        .select("firstName lastName email subject status priority submittedAt")
        .lean(),

      // Feedback queries
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: "new" }),
      Feedback.countDocuments({ status: "resolved" }),
      Feedback.aggregate([
        { $group: { _id: "$feedbackType", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      // Testimonial queries
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ status: "published" }),

      // Service queries
      Service.countDocuments({ isDeleted: { $ne: true } }),
      Service.countDocuments({ status: "active", isDeleted: { $ne: true } }),
      Service.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
      ]),

      // Product queries
      Product.countDocuments({ isDeleted: { $ne: true } }),
      Product.countDocuments({ status: "active", isDeleted: { $ne: true } }),

      // Portfolio queries
      Portfolio.countDocuments({ isDeleted: { $ne: true } }),
      Portfolio.countDocuments({ status: "active", isDeleted: { $ne: true } }),
      Portfolio.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
      ]),
    ]);

    // Calculate growth percentage
    const leadsGrowth = lastMonthLeads > 0 
      ? Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100) 
      : thisMonthLeads > 0 ? 100 : 0;

    // Calculate completion rate
    const completionRate = totalLeads > 0 
      ? Math.round((completedLeads / totalLeads) * 100) 
      : 0;

    // Format recent leads
    const formattedRecentLeads = recentLeads.map((lead: any) => ({
      _id: lead._id.toString(),
      fullName: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      subject: lead.subject,
      status: lead.status,
      priority: lead.priority,
      submittedAt: lead.submittedAt,
    }));

    // Build response
    const dashboardData = {
      metrics: {
        // Lead metrics
        totalLeads,
        thisMonthLeads,
        thisWeekLeads,
        leadsGrowth,
        completedLeads,
        pendingLeads,
        newLeads,
        completionRate,

        // Feedback metrics
        totalFeedback,
        newFeedback,
        resolvedFeedback,

        // Testimonial metrics
        totalTestimonials,
        publishedTestimonials,

        // Service metrics
        totalServices,
        activeServices,
        totalServiceViews: totalServiceViews[0]?.totalViews || 0,

        // Product metrics
        totalProducts,
        activeProducts,

        // Portfolio metrics
        totalPortfolio,
        activePortfolio,
        totalPortfolioViews: totalPortfolioViews[0]?.totalViews || 0,
      },
      recentLeads: formattedRecentLeads,
      analytics: {
        leadsByStatus: leadsByStatus.map((item: any) => ({
          status: item._id,
          count: item.count,
        })),
        feedbackByType: feedbackByType.map((item: any) => ({
          type: item._id,
          count: item.count,
        })),
      },
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch dashboard data",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
