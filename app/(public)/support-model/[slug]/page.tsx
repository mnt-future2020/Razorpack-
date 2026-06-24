import { notFound } from "next/navigation";
import { TopBar } from "@/components/top-bar";
import { CtaBanner } from "@/components/cta-banner";
import { DynamicPageBanner } from "@/components/DynamicPageBanner";
import SupportModelDetailClient from "@/components/SupportModel/SupportModelDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { cache } from "react";

// Base fetcher to be deduplicated
const getSupportModelBase = cache(async (slug: string) => {
  const connectDB = (await import("@/config/models/connectDB")).default;
  const Portfolio = (
    await import("@/config/utils/admin/portfolio/portfolioSchema")
  ).default;

  await connectDB();

  const supportModel = await Portfolio.findOne({
    slug,
    status: "active",
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  })
    .select("-isDeleted -__v")
    .lean();

  return supportModel ? JSON.parse(JSON.stringify(supportModel)) : null;
});

// Fetch single support model by slug
async function getSupportModelBySlug(slug: string, increment = false) {
  try {
    const supportModel = await getSupportModelBase(slug);

    if (supportModel && increment) {
      const Portfolio = (
        await import("@/config/utils/admin/portfolio/portfolioSchema")
      ).default;
      // Increment view count separately from fetch
      await Portfolio.findByIdAndUpdate(supportModel._id, {
        $inc: { views: 1 },
      });
    }

    return supportModel;
  } catch (error) {
    console.error("Error fetching support model:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const supportModelData = await getSupportModelBySlug(resolvedParams.slug);

  if (!supportModelData) {
    return {
      title: "Support Model Not Found - Rayzor Industrial Packaging Pvt Ltd",
      description: "The requested support model could not be found.",
    };
  }

  return {
    title:
      supportModelData.seoTitle ||
      `${supportModelData.projectName} - Rayzor Industrial Packaging Pvt Ltd`,
    description:
      supportModelData.seoDescription || supportModelData.description,
    keywords:
      supportModelData.seoKeywords ||
      `${supportModelData.projectName}, facade solutions, architectural solutions, Rayzor Industrial Packaging Pvt Ltd`,
  };
}

export default async function SupportModelDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const supportModelData = await getSupportModelBySlug(
    resolvedParams.slug,
    true,
  );

  if (!supportModelData) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <TopBar /><DynamicPageBanner
        pageKey="support-model"
        title={supportModelData.title.toUpperCase()}
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Support Model", href: "/support-model" },
          {
            label: supportModelData.title,
            href: `/support-model/${resolvedParams.slug}`,
          },
        ]}
      />
      <SupportModelDetailClient supportModelData={supportModelData} />
      <CtaBanner /></main>
  );
}
