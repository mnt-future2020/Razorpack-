"use client";

import useSWR from "swr";

interface Service {
  _id: string;
  serviceName: string;
  category?: string;
  shortDescription?: string;
  description: string;
  image: string;
  gallery?: string[];
  features: string[];
  slug: string;
  status: string;
  order: number;
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface ServicesResponse {
  success: boolean;
  data: Service[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalServices: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useServices(page: number = 1, limit: number = 20) {
  const { data, error, isLoading } = useSWR<ServicesResponse>(
    `/api/services?page=${page}&limit=${limit}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res.json();
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 60000,
    }
  );

  return {
    services: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
  };
}
