"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Globe,
  TrendingUp,
  Activity,
  Copy,
  X,
  Star,
  DollarSign,
  Briefcase
} from "lucide-react"
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon"
import { Lead } from "@/hooks/use-leads"
import { useToast } from "@/hooks/use-toast"

interface ViewLeadProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export default function ViewLead({ lead, isOpen, onClose }: ViewLeadProps) {
  const { toast } = useToast()
  
  if (!lead) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new": return <AlertCircle className="h-3.5 w-3.5" />
      case "contacted": return <Clock className="h-3.5 w-3.5" />
      case "consulting": return <Activity className="h-3.5 w-3.5" />
      case "confirmed": return <CheckCircle className="h-3.5 w-3.5" />
      case "completed": return <CheckCircle className="h-3.5 w-3.5" />
      case "cancelled": return <X className="h-3.5 w-3.5" />
      default: return <AlertCircle className="h-3.5 w-3.5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-700"
      case "contacted": return "bg-orange-100 text-orange-700"
      case "consulting": return "bg-purple-100 text-purple-700"
      case "confirmed": return "bg-[#221E1F]/10 text-[#221E1F]"
      case "completed": return "bg-green-100 text-green-700"
      case "cancelled": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700"
      case "medium": return "bg-[#26A8E0]/10 text-[#26A8E0]"
      case "low": return "bg-green-100 text-green-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "website": return "bg-blue-100 text-blue-700"
      case "whatsapp": return "bg-green-100 text-green-700"
      case "phone": return "bg-purple-100 text-purple-700"
      case "referral": return "bg-orange-100 text-orange-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "Copied to clipboard" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Lead Details for {lead.firstName} {lead.lastName}</DialogTitle>
        </DialogHeader>
        
        {/* Header */}
        <div className="bg-[#221E1F] p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-white/80 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {lead.email}
                  </span>
                  {lead.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-4 w-4" />
                      {lead.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge className={`${getStatusColor(lead.status)} border-0 flex items-center gap-1.5`}>
              {getStatusIcon(lead.status)}
              {lead.status.toUpperCase()}
            </Badge>
            <Badge className={`${getPriorityColor(lead.priority)} border-0 flex items-center gap-1.5`}>
              <TrendingUp className="h-3.5 w-3.5" />
              {lead.priority.toUpperCase()} PRIORITY
            </Badge>
            <Badge className={`${getSourceColor(lead.source)} border-0 flex items-center gap-1.5`}>
              {lead.source === 'whatsapp' ? <WhatsAppIcon className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />}
              {lead.source.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact & Service Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <User className="h-4 w-4 text-[#26A8E0]" />
                Contact Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Full Name</p>
                    <p className="font-semibold text-[#221E1F]">{lead.firstName} {lead.lastName}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(`${lead.firstName} ${lead.lastName}`)}>
                    <Copy className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Email Address</p>
                    <p className="font-medium text-[#221E1F]">{lead.email}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(lead.email)}>
                    <Copy className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
                {lead.phone && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="font-medium text-[#221E1F]">{lead.phone}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(lead.phone)}>
                        <Copy className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Service & Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-[#26A8E0]" />
                Service Details
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Service Requested</p>
                  <p className="font-semibold text-[#221E1F]">{lead.subject}</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Estimated Cost
                    </p>
                    <p className="font-bold text-lg text-[#26A8E0]">
                      {lead.estimatedCost || "To be determined"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Message */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-[#26A8E0]" />
              Customer Message
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {lead.message || "No message provided."}
              </p>
            </div>
          </div>

          {/* Internal Notes */}
          {lead.notes && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#26A8E0]" />
                Internal Notes
              </h3>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <p className="text-amber-900 leading-relaxed whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            </div>
          )}

          {/* Review Link (for completed leads) */}
          {lead.status === "completed" && lead.reviewLink && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Star className="h-4 w-4 text-[#26A8E0]" />
                Review Link
              </h3>
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm text-green-800 font-mono break-all pr-4">{lead.reviewLink}</p>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyToClipboard(lead.reviewLink!)}>
                  <Copy className="h-4 w-4 text-green-600" />
                </Button>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Calendar className="h-3.5 w-3.5" />
                Submitted On
              </div>
              <p className="font-medium text-[#221E1F]">{formatDate(lead.submittedAt)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                <Clock className="h-3.5 w-3.5" />
                Last Updated
              </div>
              <p className="font-medium text-[#221E1F]">{formatDate(lead.lastUpdated)}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#26A8E0]" />
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => window.open(`mailto:${lead.email}`)}
                className="bg-[#221E1F] hover:bg-[#2c5282] text-white"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              {lead.phone && (
                <>
                  <Button
                    onClick={() => window.open(`tel:${lead.phone}`)}
                    variant="outline"
                    className="border-[#221E1F] text-[#221E1F] hover:bg-[#221E1F] hover:text-white"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    onClick={() => window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`)}
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white"
                  >
                    <WhatsAppIcon className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </>
              )}
              {lead.status === "completed" && lead.reviewLink && lead.phone && (
                <Button
                  onClick={() => {
                    const reviewMessage = `Hi ${lead.firstName}, thank you for choosing Rayzor Industrial Packaging Pvt Ltd! We hope you had a great experience with our ${lead.subject} service.\n\nPlease take a moment to share your feedback: ${lead.reviewLink}\n\nYour feedback helps us serve you better! 🙏`;
                    window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(reviewMessage)}`);
                  }}
                  className="bg-[#26A8E0] hover:bg-[#1a8abf] text-white"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Share Review Link
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
