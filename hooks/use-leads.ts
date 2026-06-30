"use client"

import useSWR from "swr"
import { adminFetch } from "@/lib/admin-fetch"

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "new" | "contacted" | "consulting" | "confirmed" | "completed" | "cancelled";
  priority: "low" | "medium" | "high";
  source: "website" | "whatsapp" | "phone" | "referral";
  estimatedCost?: string;
  notes: string;
  reviewLink?: string;
  reviewToken?: string;
  submittedAt: string;
  lastUpdated: string;
}

const fetcher = (url: string) => adminFetch(url).then((res) => res.json());

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface LeadsResponse {
  success: boolean;
  data: Lead[];
  pagination?: PaginationData;
  stats?: {
    total: number;
    newLeads: number;
    consulting: number;
    highPriority: number;
  };
}

export function useLeads(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  priority?: string;
} = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);
  if (params.priority && params.priority !== 'all') queryParams.append('priority', params.priority);

  const queryString = queryParams.toString();
  const url = `/api/admin/leads${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<LeadsResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 60000,
    },
  )

  return {
    leads: data?.data || [],
    pagination: data?.pagination,
    stats: data?.stats,
    isLoading,
    isError: error,
    mutate,
  }
}
