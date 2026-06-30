"use client"

import { useState, useEffect } from "react"
import { adminFetch } from "@/lib/admin-fetch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Save, Search, Edit, Loader2, ImageIcon, X } from "lucide-react"
import Image from "next/image"

interface SEOPage {
  _id?: string;
  id: string;
  pageName: string;
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  lastUpdated: string;
}

export default function SEOManagerPage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seoPages, setSeoPages] = useState<SEOPage[]>([])

  const [formData, setFormData] = useState({
    pageName: "",
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
  })
  const [ogImageFile, setOgImageFile] = useState<File | null>(null)
  const [ogImagePreview, setOgImagePreview] = useState<string>("")

  useEffect(() => {
    fetchSEOData();
  }, [])

  const fetchSEOData = async () => {
    try {
      setLoading(true);
      const response = await adminFetch('/api/admin/seo');
      const result = await response.json();
      
      if (result.success) {
        setSeoPages(result.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch SEO data",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching SEO data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch SEO data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (page: SEOPage) => {
    setEditingId(page.id)
    setFormData({
      pageName: page.pageName,
      title: page.title,
      description: page.description,
      keywords: page.keywords,
      ogImage: page.ogImage || "",
    })
    setOgImageFile(null)
    setOgImagePreview(page.ogImage || "")
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!formData.pageName || !formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (editingId) {
      try {
        setSaving(true);
        
        const submitData = new FormData();
        submitData.append("id", editingId);
        submitData.append("title", formData.title);
        submitData.append("description", formData.description);
        submitData.append("keywords", formData.keywords);

        if (ogImageFile) {
          submitData.append("ogImage", ogImageFile);
        } else if (formData.ogImage) {
          submitData.append("existingOgImage", formData.ogImage);
        } else if (ogImagePreview === "" && !formData.ogImage) {
          submitData.append("removeOgImage", "true");
        }

        const response = await adminFetch('/api/admin/seo', {
          method: 'PUT',
          body: submitData,
        });

        const result = await response.json();

        if (result.success) {
          setSeoPages(seoPages.map(page => 
            page.id === editingId 
              ? { ...page, ...formData, lastUpdated: new Date().toISOString().split('T')[0] }
              : page
          ));
          
          toast({
            title: "Success",
            description: "SEO page updated successfully",
          })
          
          handleCancel()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update SEO data",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error("Error updating SEO:", error);
        toast({
          title: "Error",
          description: "Failed to update SEO data",
          variant: "destructive"
        })
      } finally {
        setSaving(false);
      }
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditingId(null)
    setFormData({
      pageName: "",
      title: "",
      description: "",
      keywords: "",
      ogImage: "",
    })
    setOgImageFile(null)
    setOgImagePreview("")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#221E1F]">SEO Manager</h1>
          <p className="text-gray-600 mt-2">Optimize SEO for Rayzor Industrial Packaging Pvt Ltd website pages - manage meta titles, descriptions, and keywords</p>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#221E1F]">
              Edit Page SEO
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-6">
            <div>
              <Label htmlFor="pageName" className="text-base font-semibold">
                Page Name *
              </Label>
              <Input
                id="pageName"
                value={formData.pageName}
                className="mt-2"
                disabled
              />
            </div>

            <div>
              <Label htmlFor="title" className="text-base font-semibold">
                Meta Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="SEO optimized page title"
                className={`mt-2 ${formData.title.length > 60 ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <p className={`text-sm mt-1 ${formData.title.length > 60 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                Length: {formData.title.length}/60 characters
                {formData.title.length > 60 && ' - Exceeds recommended limit!'}
              </p>
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                Meta Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description for search engines"
                rows={4}
                className={`mt-2 ${formData.description.length > 160 ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <p className={`text-sm mt-1 ${formData.description.length > 160 ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                Length: {formData.description.length}/160 characters
                {formData.description.length > 160 && ' - Exceeds recommended limit!'}
              </p>
            </div>

            <div>
              <Label htmlFor="keywords" className="text-base font-semibold">
                Keywords
              </Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="keyword1, keyword2, keyword3"
                className="mt-2"
              />
              <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
            </div>

            {/* OG Image */}
            <div>
              <Label className="text-base font-semibold">
                OG Image (Social Sharing Preview)
              </Label>
              <p className="text-sm text-gray-500 mt-1 mb-3">
                Image shown when this page is shared on Facebook, LinkedIn, WhatsApp, Twitter. Recommended: 1200 x 630px. Uploaded to Cloudinary.
              </p>

              {(ogImagePreview || formData.ogImage) ? (
                <div className="space-y-3">
                  <div className="relative w-full max-w-md aspect-[1200/630] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <Image
                      src={ogImagePreview || formData.ogImage}
                      alt="OG Image Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, ogImage: "" });
                        setOgImageFile(null);
                        setOgImagePreview("");
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-md"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id={`og-image-upload-${editingId}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOgImageFile(file);
                          setOgImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label
                      htmlFor={`og-image-upload-${editingId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Change Image
                    </label>
                    {ogImageFile && (
                      <span className="ml-3 text-xs text-amber-600 font-medium">New image selected — save to upload</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-full max-w-md aspect-[1200/630] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">No OG image set</p>
                    <p className="text-xs">Upload an image (1200 x 630px)</p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id={`og-image-upload-${editingId}`}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setOgImageFile(file);
                          setOgImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <label
                      htmlFor={`og-image-upload-${editingId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-[#26A8E0] text-white rounded-lg cursor-pointer hover:bg-[#1a8abf] transition-colors"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Upload OG Image
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Button onClick={handleSave} className="bg-[#221E1F] hover:bg-[#333] text-white" disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? "Saving..." : "Save SEO Settings"}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEO Pages List */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-4 border-b">
          <CardTitle className="flex items-center gap-2 text-[#221E1F]">
            <Search className="h-5 w-5 text-[#26A8E0]" />
            Page SEO Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#221E1F]" />
              <span className="ml-2 text-gray-600">Loading SEO data...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {seoPages.map((page) => (
                <div key={page.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-[#221E1F]">{page.pageName}</h3>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(page)} className="border-[#26A8E0] text-[#26A8E0] hover:bg-[#EBF7FC]">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Title: </span>
                      <span className="text-sm text-gray-600">{page.title}</span>
                      <span className={`text-xs ml-2 ${page.title.length > 60 ? "text-red-500" : "text-green-500"}`}>
                        ({page.title.length}/60)
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Description: </span>
                      <span className="text-sm text-gray-600">{page.description}</span>
                      <span className={`text-xs ml-2 ${page.description.length > 160 ? "text-red-500" : "text-green-500"}`}>
                        ({page.description.length}/160)
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Keywords: </span>
                      <span className="text-sm text-gray-600">{page.keywords}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">OG Image: </span>
                      <span className="text-sm text-gray-600">{page.ogImage ? "Set" : "Not set"}</span>
                      {page.ogImage && (
                        <span className="text-green-500 text-xs ml-1">✓</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">Last updated: {new Date(page.lastUpdated).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
