"use client";

import useSWR from "swr";

export interface HeroSlide {
  imageUrl: string;
  title: string;
  highlight: string;
  tagline: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

interface BannerResponse {
  success: boolean;
  data: {
    slides?: HeroSlide[];
    images?: string[];
  };
}

export function useHeroSlides() {
  const { data, error, isLoading } = useSWR<BannerResponse>(
    "/api/banners?pageKey=home",
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res.json();
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const raw = data?.data?.slides || [];
  const images = data?.data?.images || [];

  // Fix slides: fill empty imageUrl from images array, normalize escaped newlines
  const slides: HeroSlide[] = raw.map((s, i) => ({
    ...s,
    imageUrl: s.imageUrl || images[i] || "",
    highlight: s.highlight?.replace(/\\n/g, "\n") || "",
    tagline: s.tagline?.replace(/\\n/g, "\n") || "",
  }));

  return {
    slides,
    isLoading,
    isError: error,
  };
}
