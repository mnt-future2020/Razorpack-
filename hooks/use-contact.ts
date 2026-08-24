"use client"

import useSWR from "swr"

interface ContactInfo {
  primaryPhone: string
  secondaryPhone?: string
  tertiaryPhone?: string
  whatsappNumber: string
  email: string
  address: string
  city: string
  state: string
  postcode: string
  country: string
  businessHours?: string
  facebook?: string
  twitter?: string
  linkedin?: string
  instagram?: string
  youtube?: string
  whatsapp?: string
  telegram?: string
  mapEmbedCode?: string
  latitude?: string
  longitude?: string
  pageTitle: string
  pageDescription: string
  officeTitle: string
  officeDescription: string
  serviceAreas?: string
}

export function useContact() {
  const { data, error, isLoading } = useSWR<{ success: boolean; data: ContactInfo }>(
    '/api/admin/contact',
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
    contactInfo: data?.data,
    isLoading,
    isError: error,
  }
}
