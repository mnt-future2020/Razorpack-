"use client";

import useSWR from "swr";

interface Banner {
  pageKey: string;
  image?: string;
  images?: string[];
  title?: string;
  label?: string;
  headingLine1?: string;
  headingLine2?: string;
  description?: string;
  mobileImage?: string;
  heroSource?: string;
  status: string;
}

export function useBanner(pageKey: string) {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: Banner }>(
    `/api/banners?pageKey=${pageKey}`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  );

  return {
    banner: data?.data,
    isLoading,
    isError: error,
  };
}
