"use client";

import useSWR from "swr";

interface Product {
  _id: string;
  productName: string;
  category?: string;
  shortDescription?: string;
  description: string;
  image: string;
  gallery?: string[];
  features: string[];
  slug: string;
  status: string;
  order: number;
}

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export function useProducts(page: number = 1, limit: number = 20) {
  const { data, error, isLoading } = useSWR<ProductsResponse>(
    `/api/products?page=${page}&limit=${limit}`,
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
    products: data?.data || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
  };
}
