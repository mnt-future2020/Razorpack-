"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Trash2,
  Save,
  Upload,
  ImageIcon,
  Loader2,
  LayoutGrid,
  Image as ImageLucide,
  X,
} from "lucide-react";
import axios from "axios";

interface GalleryWork {
  _id?: string;
  title: string;
  description: string;
  image: string;
  order?: number;
}

export default function GalleryManagerPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Section 1: Hero Images (uploaded + selected from works)
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [heroFiles, setHeroFiles] = useState<File[]>([]);
  const [selectedWorkImages, setSelectedWorkImages] = useState<string[]>([]);

  // Section 2: Our Works
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [workFiles, setWorkFiles] = useState<(File | null)[]>([]);

  // Load existing data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch gallery banner (hero images)
        const bannerRes = await fetch("/api/banners?pageKey=gallery");
        const bannerData = await bannerRes.json();
        if (bannerData.success && bannerData.data) {
          setHeroImages(bannerData.data.images || []);
          // selectedWorkImages stored as JSON string in heroSource field
          try {
            const parsed = JSON.parse(bannerData.data.heroSource || "[]");
            if (Array.isArray(parsed)) setSelectedWorkImages(parsed);
          } catch { setSelectedWorkImages([]); }
        }

        // Fetch works data
        const token = localStorage.getItem("admin_token");
        const worksRes = await fetch("/api/admin/gallery-works", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const worksData = await worksRes.json();
        if (worksData.success && worksData.data) {
          setWorks(worksData.data.map((w: any) => ({ _id: w._id, title: w.title, description: w.description, image: w.image, order: w.order || 0 })));
          setWorkFiles(worksData.data.map(() => null));
        }
      } catch (error) {
        console.error("Failed to load gallery data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Hero Image Handlers ──
  const handleAddHeroImages = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        setHeroFiles((prev) => [...prev, ...files]);
        setHeroImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
      }
    };
    input.click();
  };

  const removeHeroImage = (idx: number) => {
    const url = heroImages[idx];
    setHeroImages((prev) => prev.filter((_, i) => i !== idx));
    if (url.startsWith("blob:")) {
      const blobIdx = heroImages.filter((u) => u.startsWith("blob:")).indexOf(url);
      if (blobIdx !== -1) {
        setHeroFiles((prev) => prev.filter((_, i) => i !== blobIdx));
      }
    }
  };

  // ── Works Handlers ──
  const addWork = () => {
    setWorks((prev) => [...prev, { title: "", description: "", image: "" }]);
    setWorkFiles((prev) => [...prev, null]);
  };

  const updateWork = (idx: number, field: keyof GalleryWork, value: string) => {
    setWorks((prev) => prev.map((w, i) => (i === idx ? { ...w, [field]: value } : w)));
  };

  const removeWork = async (idx: number) => {
    const work = works[idx];
    if (work._id) {
      try {
        const token = localStorage.getItem("admin_token");
        await axios.delete(`/api/admin/gallery-works/${work._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        console.error("Failed to delete work:", error);
      }
    }
    setWorks((prev) => prev.filter((_, i) => i !== idx));
    setWorkFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleWorkImage = (idx: number) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const newFiles = [...workFiles];
        newFiles[idx] = file;
        setWorkFiles(newFiles);
        updateWork(idx, "image", URL.createObjectURL(file));
      }
    };
    input.click();
  };

  // ── Save All ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast({ title: "Error", description: "Please login again", variant: "destructive" });
        return;
      }

      // Save hero images via banner API
      const heroForm = new FormData();
      heroForm.append("pageKey", "gallery");
      heroForm.append("status", "active");
      heroForm.append("heroSource", JSON.stringify(selectedWorkImages));

      const existingHeroImages = heroImages.filter((img) => img && !img.startsWith("blob:"));
      // Always send existingImages (even empty) so deleted images are cleared
      heroForm.append("existingImages", JSON.stringify(existingHeroImages));
      if (existingHeroImages.length > 0) {
        heroForm.append("existingImage", existingHeroImages[0]);
      }

      heroFiles.forEach((file) => {
        heroForm.append("galleryImages", file);
      });

      await axios.post("/api/admin/banners", heroForm, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setHeroFiles([]);

      // Save works — create new, update existing
      for (let i = 0; i < works.length; i++) {
        const work = works[i];
        const workForm = new FormData();
        workForm.append("title", work.title);
        workForm.append("description", work.description);
        workForm.append("order", String(i));

        if (workFiles[i]) {
          workForm.append("image", workFiles[i]!);
        } else if (work.image && !work.image.startsWith("blob:")) {
          workForm.append("existingImage", work.image);
        }

        if (work._id) {
          await axios.put(`/api/admin/gallery-works/${work._id}`, workForm, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          });
        } else if (work.title && work.description) {
          const res = await axios.post("/api/admin/gallery-works", workForm, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          });
          if (res.data.success) {
            works[i]._id = res.data.data._id;
          }
        }
      }

      toast({ title: "Saved", description: "Gallery saved successfully." });
      setWorkFiles(works.map(() => null));

      // Refresh data
      const bannerRes = await fetch("/api/banners?pageKey=gallery");
      const bannerData = await bannerRes.json();
      if (bannerData.success && bannerData.data) {
        setHeroImages(bannerData.data.images || []);
        try {
          const parsed = JSON.parse(bannerData.data.heroSource || "[]");
          setSelectedWorkImages(Array.isArray(parsed) ? parsed : []);
        } catch { setSelectedWorkImages([]); }
      } else {
        setSelectedWorkImages([]);
      }

      const worksRes = await fetch("/api/admin/gallery-works", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const worksData = await worksRes.json();
      if (worksData.success) {
        setWorks(worksData.data.map((w: any) => ({ _id: w._id, title: w.title, description: w.description, image: w.image, order: w.order || 0 })));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save gallery",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#26A8E0] mx-auto mb-4" />
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#221E1F]">Gallery Manager</h1>
          <p className="text-gray-600 mt-1">Manage your gallery hero images and works showcase</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-[#221E1F] hover:bg-[#333] text-white">
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Save Changes</>
          )}
        </Button>
      </div>

      {/* ═══ SECTION 1: Gallery Hero Images ═══ */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#26A8E0]/10 to-[#221E1F]/10 p-6">
          <CardTitle className="flex items-center gap-2 text-[#221E1F]">
            <LayoutGrid className="h-5 w-5 text-[#26A8E0]" />
            Gallery Hero Images
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          <p className="text-sm text-gray-500">
            Upload images or select from Our Works below. At least 9 images recommended (3 per column).
          </p>

          {/* Upload custom images */}
          <div>
            <p className="text-xs text-[#26A8E0] font-medium mb-2">
              Recommended: 800 × 600px or larger, landscape · 9 or 12 images ideal
            </p>
            <Button type="button" onClick={handleAddHeroImages} variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Upload Hero Images
            </Button>
          </div>

          {/* Uploaded images grid */}
          {heroImages.length > 0 && (
            <>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Uploaded Images</label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {heroImages.map((img, idx) => (
                  <div key={`up-${idx}`} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <Image src={img} alt={`Hero ${idx + 1}`} fill className="object-cover" sizes="200px" />
                    <button
                      type="button"
                      onClick={() => removeHeroImage(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                      {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Select from works */}
          {works.length > 0 && (
            <>
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mt-2 block">
                Select from Our Works ({selectedWorkImages.length} selected)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {works.filter((w) => w.image && !w.image.startsWith("blob:")).map((work, idx) => {
                  const isSelected = selectedWorkImages.includes(work.image);
                  return (
                    <button
                      key={`wk-${idx}`}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedWorkImages((prev) => prev.filter((u) => u !== work.image));
                        } else {
                          setSelectedWorkImages((prev) => [...prev, work.image]);
                        }
                      }}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? "border-[#26A8E0] ring-2 ring-[#26A8E0]/30"
                          : "border-gray-200 hover:border-gray-300 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={work.image} alt={work.title} fill className="object-cover" sizes="200px" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#26A8E0]/20 flex items-center justify-center">
                          <div className="w-7 h-7 bg-[#26A8E0] rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded truncate">
                        {work.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Summary */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-[#221E1F]">{heroImages.length + selectedWorkImages.length}</span> total hero images
              ({heroImages.length} uploaded + {selectedWorkImages.length} from works) · Split into 3 sliding columns
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ SECTION 2: Our Works ═══ */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <ImageLucide className="h-5 w-5 text-[#26A8E0]" />
              Our Works Showcase
            </CardTitle>
            <Button type="button" onClick={addWork} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add Work
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-gray-500">
            These cards appear below the gallery hero. Each work item has a title, description, and image.
          </p>

          {works.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
              <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm mb-4">No works added yet</p>
              <Button type="button" onClick={addWork} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Add First Work
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {works.map((work, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                  {/* Image */}
                  <div className="w-40 h-28 flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    {work.image ? (
                      <Image src={work.image} alt={work.title || "Work"} fill className="object-cover" sizes="160px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="flex-1 space-y-2">
                    <Input
                      value={work.title}
                      onChange={(e) => updateWork(idx, "title", e.target.value)}
                      placeholder="Work title (e.g. VCI Packaging Solutions)"
                      className="text-sm"
                    />
                    <Textarea
                      value={work.description}
                      onChange={(e) => updateWork(idx, "description", e.target.value)}
                      placeholder="Short description..."
                      rows={2}
                      className="text-sm resize-none"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <Button type="button" onClick={() => handleWorkImage(idx)} variant="outline" size="sm">
                      <Upload className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" onClick={() => removeWork(idx)} variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
