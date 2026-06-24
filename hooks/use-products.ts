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
    (url) => fetch(url).then((r) => r.json()),
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
