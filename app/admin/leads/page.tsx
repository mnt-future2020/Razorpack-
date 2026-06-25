"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useLeads, Lead } from "@/hooks/use-leads"
import { useServices } from "@/hooks/use-services"
import { useProducts } from "@/hooks/use-products"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Star,
  AlertCircle,
  Loader2,
  Eye,
  Download,
  Activity,
  UserPlus,
  User,
  Settings,
  DollarSign,
} from "lucide-react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import ViewLead from "./components/ViewLead"

export default function LeadManager() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isFormSubmitted, setIsFormSubmitted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  
  const { leads, pagination, stats: statsData, isLoading, mutate } = useLeads({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    priority: priorityFilter
  })
  const { services } = useServices(1, 100)
  const { products } = useProducts(1, 100)

  const [formData, setFormData] = useState<Partial<Lead>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    status: "new",
    priority: "medium",
    source: "website",
    estimatedCost: "",
    notes: "",
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800"
      case "contacted": return "bg-orange-100 text-orange-800"
      case "consulting": return "bg-purple-100 text-purple-800"
      case "confirmed": return "bg-[#221E1F]/10 text-[#221E1F]"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800"
      case "medium": return "bg-[#26A8E0]/10 text-[#26A8E0]"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const renderPaginationItems = () => {
    if (!pagination) return []
    const items = []
    const { totalPages } = pagination

    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          onClick={() => handlePageChange(currentPage - 1)}
          className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    )

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className={`cursor-pointer ${currentPage === i ? "bg-[#221E1F] text-white hover:bg-[#333] hover:text-white border-0" : ""}`}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        )
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        items.push(
          <PaginationItem key={i}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
    }

    items.push(
      <PaginationItem key="next">
        <PaginationNext 
          onClick={() => handlePageChange(currentPage + 1)}
          className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
        />
      </PaginationItem>
    )

    return items
  }

  const handleEditLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsEditModalOpen(true)
  }

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead)
    setIsViewModalOpen(true)
  }

  const handleDeleteClick = (lead: Lead) => {
    setLeadToDelete(lead)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return
    try {
      const response = await fetch(`/api/admin/leads?id=${leadToDelete._id}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        mutate()
        toast({ title: "Lead Deleted", description: "Enquiry has been successfully deleted." })
      } else {
        toast({ title: "Error", description: result.error || "Failed to delete lead", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete lead. Please try again.", variant: "destructive" })
    } finally {
      setIsDeleteModalOpen(false)
      setLeadToDelete(null)
    }
  }

  // Handle Add Lead
  const handleAddLead = async () => {
    setIsFormSubmitted(true)
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" })
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        mutate()
        setIsAddModalOpen(false)
        setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "", status: "new", priority: "medium", source: "website", estimatedCost: "", notes: "" })
        setIsFormSubmitted(false)
        toast({ title: "Lead Added", description: "Enquiry has been successfully added." })
      } else {
        toast({ title: "Error", description: result.error || "Failed to add lead", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add lead. Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle Update Lead (only admin fields)
  const handleUpdateLead = async () => {
    if (!selectedLead) return
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: selectedLead._id,
          phone: selectedLead.phone,
          status: selectedLead.status,
          priority: selectedLead.priority,
          source: selectedLead.source,
          estimatedCost: selectedLead.estimatedCost,
          notes: selectedLead.notes,
        }),
      })
      const result = await response.json()
      if (result.success) {
        mutate()
        setIsEditModalOpen(false)
        
        if (result.data?.reviewLink && selectedLead.status === "completed") {
          toast({ 
            title: "Lead Updated & Review Link Generated", 
            description: "Status updated to completed. Review link is ready to share." 
          })
        } else {
          toast({ title: "Lead Updated", description: "Lead information has been updated successfully." })
        }
      } else {
        toast({ title: "Error", description: result.error || "Failed to update lead", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lead. Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Subject", "Status", "Priority", "Source", "Estimated Cost", "Date"]
    const csvContent = [
      headers.join(","),
      ...leads.map(lead => [
        lead.firstName, 
        lead.lastName, 
        lead.email, 
        lead.phone, 
        lead.subject, 
        lead.status, 
        lead.priority, 
        lead.source, 
        lead.estimatedCost || "",
        new Date(lead.submittedAt).toLocaleDateString()
      ].join(","))
    ].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `blufacade-leads-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const stats = [
    { title: "Total Enquiries", value: statsData?.total || 0, icon: Users, color: "text-[#221E1F]" },
    { title: "New Leads", value: statsData?.newLeads || 0, icon: AlertCircle, color: "text-[#26A8E0]" },
    { title: "Active Consulting", value: statsData?.consulting || 0, icon: Activity, color: "text-[#221E1F]" },
    { title: "High Priority", value: statsData?.highPriority || 0, icon: Star, color: "text-[#26A8E0]" },
  ]


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#221E1F]">Lead Manager</h1>
          <p className="text-gray-600 mt-1">Manage enquiries and potential clients for Rayzor Industrial Packaging Pvt Ltd</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => {
              setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "", status: "new", priority: "medium", source: "website", estimatedCost: "", notes: "" })
              setIsAddModalOpen(true)
            }}
            className="bg-[#26A8E0] hover:bg-[#1a8abf] text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-1 text-[#221E1F]">{stat.value}</h3>
                </div>
                <div className={`${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
                  <Star className="h-4 w-4 mr-2 text-gray-400" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-linear-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
          <CardTitle className="flex items-center gap-2 text-[#221E1F]">
            <Users className="h-5 w-5 text-[#26A8E0]" />
            Enquiries List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-[#221E1F]">Name & Contact</TableHead>
                  <TableHead className="font-semibold text-[#221E1F]">Subject</TableHead>
                  <TableHead className="font-semibold text-[#221E1F]">Status</TableHead>
                  <TableHead className="font-semibold text-[#221E1F]">Priority</TableHead>
                  <TableHead className="font-semibold text-[#221E1F]">Est. Cost</TableHead>
                  <TableHead className="font-semibold text-[#221E1F]">Date</TableHead>
                  <TableHead className="text-right font-semibold text-[#221E1F]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#26A8E0] mx-auto mb-2" />
                      <p className="text-gray-500">Loading enquiries...</p>
                    </TableCell>
                  </TableRow>
                ) : leads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-48 text-center text-gray-500">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  leads.map((lead) => (
                    <TableRow key={lead._id} className="hover:bg-gray-50">
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#221E1F]">{lead.firstName} {lead.lastName}</span>
                          <span className="text-xs text-gray-500">{lead.email}</span>
                          {lead.phone && <span className="text-xs text-gray-400">{lead.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-700 py-4">{lead.subject}</TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${getStatusColor(lead.status)} border-0`}>
                          {lead.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge className={`${getPriorityColor(lead.priority)} border-0`}>
                          {lead.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-semibold text-green-600">
                          {lead.estimatedCost || "TBD"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-600">
                            {new Date(lead.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(lead.submittedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleViewLead(lead)} className="h-8 w-8 text-[#221E1F] hover:text-blue-700 hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditLead(lead)} className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(lead)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="p-4 border-t flex justify-center">
              <Pagination>
                <PaginationContent>
                  {renderPaginationItems()}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Lead Modal */}
      <ViewLead lead={selectedLead} isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} />


      {/* Add New Lead Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={(open) => { if (!open) { setIsAddModalOpen(false); setIsFormSubmitted(false) } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#221E1F] flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-[#26A8E0]" />
              Add Manual Lead
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input 
                placeholder="Enter first name"
                value={formData.firstName} 
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
                className={isFormSubmitted && !formData.firstName ? "border-red-500" : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Last Name *</Label>
              <Input 
                placeholder="Enter last name"
                value={formData.lastName} 
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
                className={isFormSubmitted && !formData.lastName ? "border-red-500" : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Email Address *</Label>
              <Input 
                type="email" 
                placeholder="Enter email address"
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                className={isFormSubmitted && !formData.email ? "border-red-500" : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input 
                placeholder="Enter phone number"
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Subject / Service Needed *</Label>
              <Select 
                value={formData.subject || ""} 
                onValueChange={(val) => setFormData({ ...formData, subject: val })}
              >
                <SelectTrigger className={isFormSubmitted && !formData.subject ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a service">
                    {formData.subject || "Select a service"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {services && services.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#26A8E0]">Services</div>
                      {services.map((service: any) => (
                        <SelectItem key={service._id || service.slug} value={service.serviceName}>{service.serviceName}</SelectItem>
                      ))}
                    </>
                  )}
                  {products && products.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#26A8E0] mt-1">Products</div>
                      {products.map((product: any) => (
                        <SelectItem key={product._id || product.slug} value={product.productName}>{product.productName}</SelectItem>
                      ))}
                    </>
                  )}
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">Other</div>
                  <SelectItem value="Custom Solution">Custom Solution</SelectItem>
                  <SelectItem value="General Enquiry">General Enquiry</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Message / Enquiry Details *</Label>
              <Textarea 
                rows={4} 
                placeholder="Enter enquiry details or message"
                value={formData.message} 
                onChange={(e) => setFormData({ ...formData, message: e.target.value })} 
                className={isFormSubmitted && !formData.message ? "border-red-500" : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status || "new"} onValueChange={(val: any) => setFormData({ ...formData, status: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority || "medium"} onValueChange={(val: any) => setFormData({ ...formData, priority: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={formData.source || "website"} onValueChange={(val: any) => setFormData({ ...formData, source: val })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              <Input 
                placeholder="₹50,000 or To be determined"
                value={formData.estimatedCost} 
                onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })} 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Internal Notes</Label>
              <Textarea 
                rows={3} 
                placeholder="Add any internal notes about this lead"
                value={formData.notes} 
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsFormSubmitted(false) }}>Cancel</Button>
            <Button onClick={handleAddLead} disabled={isSaving} className="bg-[#26A8E0] hover:bg-[#1a8abf] text-white min-w-[120px]">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Lead"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* Edit Lead Modal - Update Status & Details */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#221E1F] flex items-center gap-2">
              <Edit className="h-6 w-6 text-[#26A8E0]" />
              Update Lead Status & Details
            </DialogTitle>
            <p className="text-gray-600 text-sm mt-2">
              Customer information is read-only. You can only update administrative fields.
            </p>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 py-4">
              {/* Read-only Customer Information */}
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#221E1F]" />
                  Customer Information (Read-only)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Customer Name</Label>
                    <p className="text-lg font-semibold text-gray-900">{selectedLead.firstName} {selectedLead.lastName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-gray-900">{selectedLead.email}</p>
                  </div>
                  {selectedLead.phone && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Phone</Label>
                      <p className="text-gray-900">{selectedLead.phone}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Service Requested</Label>
                    <p className="text-gray-900">{selectedLead.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Submitted On</Label>
                    <p className="text-gray-900">{new Date(selectedLead.submittedAt).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium text-gray-600">Customer Message</Label>
                  <p className="mt-1 p-3 bg-white rounded border text-gray-900">{selectedLead.message}</p>
                </div>
              </div>

              {/* Editable Administrative Fields */}
              <div className="bg-[#26A8E0]/10 p-6 rounded-lg border border-[#26A8E0]/30">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-[#26A8E0]" />
                  Administrative Details (Editable)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone Number</Label>
                    <Input
                      value={selectedLead.phone || ""}
                      onChange={(e) => setSelectedLead({ ...selectedLead, phone: e.target.value })}
                      placeholder="Add or update phone number"
                    />
                    <p className="text-xs text-gray-500">Optional - can be added if customer didn't provide</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Lead Status</Label>
                    <Select
                      value={selectedLead.status}
                      onValueChange={(value: any) => setSelectedLead({ ...selectedLead, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="consulting">Consulting</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority Level</Label>
                    <Select
                      value={selectedLead.priority}
                      onValueChange={(value: any) => setSelectedLead({ ...selectedLead, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Estimated Cost
                    </Label>
                    <Input
                      value={selectedLead.estimatedCost || ""}
                      onChange={(e) => setSelectedLead({ ...selectedLead, estimatedCost: e.target.value })}
                      placeholder="₹50,000 or To be determined"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Lead Source</Label>
                    <Select
                      value={selectedLead.source}
                      onValueChange={(value: any) => setSelectedLead({ ...selectedLead, source: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <Label className="text-sm font-medium">Internal Notes & Follow-up Details</Label>
                  <Textarea
                    value={selectedLead.notes || ""}
                    onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                    placeholder="Add internal notes, follow-up details, pricing discussions, etc."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleUpdateLead} disabled={isSaving} className="bg-[#26A8E0] hover:bg-[#7AB82F] text-white min-w-[140px]">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Lead
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the enquiry from {leadToDelete?.firstName} {leadToDelete?.lastName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLead} className="bg-red-500 hover:bg-red-600 text-white">Delete Enquiry</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
