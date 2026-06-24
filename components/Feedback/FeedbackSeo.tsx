"use client"

import { useSEOMeta } from "@/hooks/use-seo-meta"

export function FeedbackSeo() {
  useSEOMeta({
    pageId: 'feedback',
    fallback: {
      title: 'Feedback | Rayzor Industrial Packaging Pvt Ltd',
      description: 'We value your feedback! Share your compliments, suggestions, or concerns about our NDIS support services. Your input helps us improve and deliver better care.',
      keywords: 'feedback, customer feedback, service feedback, NDIS feedback, compliments, suggestions, concerns'
    }
  })

  return null
}
