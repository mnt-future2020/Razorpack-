"use client"

import useSWR from "swr"

interface SiteSettings {
  siteName: string
  siteNameAccent: string
  siteTagline: string
  siteUrl: string
  logo: string | null
  favicon: string | null
  companyProfile: string | null
  googleAnalyticsId: string | null
  ga4PropertyId: string | null
  ga4ServiceAccountKeyConfigured: boolean
}

export function useSettings() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: SiteSettings }>(
    '/api/admin/settings',
    async url => {
      const res = await fetch(url)
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }
      return res.json()
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    },
  )

  return {
    settings: data?.data,
    isLoading,
    isError: error,
  }
}
