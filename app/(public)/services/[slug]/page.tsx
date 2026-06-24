import { notFound } from "next/navigation";
import { PageHero } from "@/components/Blufacade/pages/PageHero";
import { ServiceDetailContent } from "@/components/Blufacade/pages/ServiceDetailContent";
import { OtherServicesAnimation } from "@/components/Blufacade/pages/OtherServicesAnimation";
import { FALLBACK_SERVICES } from "@/lib/fallback-services";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

import { cache } from "react";

// Base fetcher to be deduplicated
const getServiceBase = cache(async (slug: string) => {
  const connectDB = (await import("@/config/models/connectDB")).default;
  const Service = (await import("@/config/utils/admin/services/serviceSchema"))
    .default;

  await connectDB();

  const service = await Service.findOne({
    slug,
    status: "active",
    $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
  })
    .select("-isDeleted -__v")
    .lean();

  return service ? JSON.parse(JSON.stringify(service)) : null;
});

// Fetch single service by slug
async function getServiceBySlug(slug: string, increment = false) {
  try {
    const service = await getServiceBase(slug);

    if (service && increment) {
      const Service = (
        await import("@/config/utils/admin/services/serviceSchema")
      ).default;
      // Increment view count separately from fetch
      await Service.findByIdAndUpdate(service._id, {
        $inc: { views: 1 },
      });
    }

    if (service) {
      return service;
    }

    // If not found in DB, check fallback services
    const fallback = FALLBACK_SERVICES.find((s) => s.slug === slug);
    if (fallback) {
      return fallback;
    }

    return null;
  } catch (error) {
    console.error("Error fetching service:", error);
    // Fallback on error
    const fallback = FALLBACK_SERVICES.find((s) => s.slug === slug);
    return fallback || null;
  }
}

// Fetch all active services for the "Other Services" list
async function getAllServices() {
  try {
    const connectDB = (await import("@/config/models/connectDB")).default;
    const Service = (
      await import("@/config/utils/admin/services/serviceSchema")
    ).default;

    await connectDB();

    const services = await Service.find({
      status: "active",
      $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }],
    })
      .select("serviceName slug -_id")
      .lean();

    if (services && services.length > 0) {
      return JSON.parse(JSON.stringify(services));
    }
    return FALLBACK_SERVICES;
  } catch (error) {
    console.error("Error fetching all services:", error);
    return FALLBACK_SERVICES;
  }
}

export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const serviceData = await getServiceBySlug(resolvedParams.slug);

  if (!serviceData) {
    return {
      title: "Service Not Found - Rayzor Industrial Packaging Pvt Ltd",
      description: "The requested service could not be found.",
    };
  }

  return {
    title:
      serviceData.seoTitle ||
      `${serviceData.serviceName} | Rayzor Industrial Packaging Pvt Ltd`,
    description: serviceData.seoDescription || serviceData.description,
    keywords:
      serviceData.seoKeywords ||
      `${serviceData.serviceName}, industrial packaging, VCI protection, LDPE packaging`,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const serviceData = await getServiceBySlug(resolvedParams.slug, true);

  if (!serviceData) {
    notFound();
  }

  // Format the heading for the PageHero component which uses an '&' between lines
  const words = serviceData.serviceName
    .replace(/&/g, "")
    .split(" ")
    .filter(Boolean);
  const headingLine1 = words[0] || "INDUSTRIAL";
  const headingLine2 = words.slice(1).join(" ") || "SERVICES";

  // Fetch all services for the animation section
  const allServices = await getAllServices();

  return (
    <main className="min-h-screen">
      <PageHero
        label={serviceData.category || "Service Details"}
        headingLine1={headingLine1}
        headingLine2={headingLine2}
        description={
          serviceData.shortDescription ||
          serviceData.description.replace(/<[^>]+>/g, "").substring(0, 150) +
            "..."
        }
        image={serviceData.image || "/images/placeholder.svg"}
        imageAlt={serviceData.serviceName}
        theme="light"
      />
      <ServiceDetailContent serviceData={serviceData} />

      {/* OTHER SERVICES PIXEL-PERFECT ANIMATION */}
      <OtherServicesAnimation
        services={allServices}
        currentSlug={resolvedParams.slug}
      />
    </main>
  );
}
