"use client";

import useSWR from "swr";

interface GalleryWork {
  _id: string;
  title: string;
  description: string;
  image: string;
  order: number;
}

export function useGalleryWorks() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: GalleryWork[] }>(
    "/api/gallery-works",
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    works: data?.data || [],
    isLoading,
    isError: error,
  };
}
