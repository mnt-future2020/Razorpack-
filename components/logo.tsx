"use client";

import { useSettings } from "@/hooks/use-settings";
import Image from "next/image";

export function Logo({ className = "" }: { className?: string }) {
  const { settings } = useSettings();

  return (
    <div className={`flex items-center gap-2 sm:gap-3 ${className}`}>
      {settings?.logo ? (
        <Image
          src={settings.logo}
          alt={settings.siteName || "Logo"}
          width={48}
          height={48}
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
          priority
        />
      ) : (
        <Image
          src="/images/rayzor/logo/Rayzor Final Logo File-03.png"
          alt="Rayzor Industrial Packaging Pvt Ltd Logo"
          width={48}
          height={48}
          className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
          priority
        />
      )}
      <div className="flex flex-col">
        <span className="font-bold text-base sm:text-lg leading-tight">
          <span className="text-[var(--brand-dark)]">Rayzor</span>
          <span className="text-[var(--brand-blue)]">pack</span>
        </span>
      </div>
    </div>
  );
}
