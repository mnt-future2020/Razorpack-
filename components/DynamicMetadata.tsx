"use client"

import { useEffect } from "react"
import { useSettings } from "@/hooks/use-settings"

export function DynamicMetadata() {
  const { settings } = useSettings()

  useEffect(() => {
    if (settings?.favicon) {
      // Update favicon
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']")
      
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      
      link.href = settings.favicon
      
      // Also update apple-touch-icon for better mobile support
      let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']")
      
      if (!appleLink) {
        appleLink = document.createElement('link')
        appleLink.rel = 'apple-touch-icon'
        document.head.appendChild(appleLink)
      }
      
      appleLink.href = settings.favicon
    }

    // Update document title with siteName and siteTagline
    if (settings?.siteName || settings?.siteTagline) {
      const siteName = settings.siteName || "Rayzor Industrial Packaging Pvt Ltd"
      const tagline = settings.siteTagline || "Premium Packaging Solutions & LDPE Films"
      document.title = `${siteName} | ${tagline}`
    }
  }, [settings])

  return null
}
