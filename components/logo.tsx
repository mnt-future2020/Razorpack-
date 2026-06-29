"use client";

import { useSettings } from "@/hooks/use-settings";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  const { settings } = useSettings();

  return (
    <div className={`relative inline-block h-8 w-48 sm:h-9 sm:w-56 shrink-0 ${className}`}>
      <Image
        src={settings?.logo || "/images/rayzor/logo/Rayzor_Logo.png"}
        alt={settings?.siteName ? `${settings.siteName} Logo` : "Rayzor Industrial Packaging Pvt Ltd Logo"}
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  );
}
