"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Upload, Save, Loader2, ImageIcon, X } from "lucide-react";

export default function BannersPage() {
  const pageOptions = [
    { key: "home", label: "Home" },
    { key: "about", label: "About Us" },
    { key: "products", label: "Products" },
    { key: "services", label: "Services" },
    { key: "portfolio", label: "Portfolio" },
    { key: "careers", label: "Careers" },
    { key: "contact", label: "Contact" },
  ];

  const [pageKey, setPageKey] = useState<string>("home");
  const [status, setStatus] = useState<string>("active");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  // For home page - multiple images
  const [homeImages, setHomeImages] = useState<string[]>([]);
  const [homeFiles, setHomeFiles] = useState<(File | null)[]>([null, null, null]);

  // Hero slides content (for home page)
  const [slides, setSlides] = useState([
    { imageUrl: "", title: "", highlight: "", tagline: "", description: "", primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "" },
    { imageUrl: "", title: "", highlight: "", tagline: "", description: "", primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "" },
    { imageUrl: "", title: "", highlight: "", tagline: "", description: "", primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "" },
  ]);

  // Page hero text fields (for non-home pages)
  const [heroLabel, setHeroLabel] = useState("");
  const [heroHeadingLine1, setHeroHeadingLine1] = useState("");
  const [heroHeadingLine2, setHeroHeadingLine2] = useState("");
  const [heroDescription, setHeroDescription] = useState("");

  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const homeFileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const fetchBanner = async (key: string) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/admin/banners/${encodeURIComponent(key)}`
      );
      if (res.data?.success && res.data.data) {
        const b = res.data.data as {
          image: string;
          images?: string[];
          slides?: any[];
          status?: string;
          label?: string;
          headingLine1?: string;
          headingLine2?: string;
          description?: string;
        };
        setImageUrl(b.image || "");
        setStatus(b.status || "active");

        // Load hero text fields for non-home pages
        setHeroLabel(b.label || "");
        setHeroHeadingLine1(b.headingLine1 || "");
        setHeroHeadingLine2(b.headingLine2 || "");
        setHeroDescription(b.description || "");

        // For home page, load multiple images and ensure we have 3 slots
        if (key === "home" && b.images && b.images.length > 0) {
          const paddedImages = [...b.images];
          while (paddedImages.length < 3) {
            paddedImages.push("");
          }
          setHomeImages(paddedImages.slice(0, 3));
        } else if (key === "home") {
          setHomeImages(["", "", ""]);
        } else {
          setHomeImages([]);
        }

        // Load slides data
        if (key === "home" && b.slides && b.slides.length > 0) {
          const paddedSlides = [...b.slides];
          while (paddedSlides.length < 3) {
            paddedSlides.push({ imageUrl: "", title: "", highlight: "", tagline: "", description: "", primaryCtaLabel: "", primaryCtaHref: "", secondaryCtaLabel: "", secondaryCtaHref: "" });
          }
          setSlides(paddedSlides.slice(0, 3));
        }
      } else {
        setImageUrl("");
        setHomeImages(key === "home" ? ["", "", ""] : []);
        setStatus("active");
        setHeroLabel(""); setHeroHeadingLine1(""); setHeroHeadingLine2(""); setHeroDescription("");
      }
    } catch (e) {
      setImageUrl("");
      setHomeImages(key === "home" ? ["", "", ""] : []);
      setStatus("active");
      setHeroLabel(""); setHeroHeadingLine1(""); setHeroHeadingLine2(""); setHeroDescription("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner(pageKey);
    // Reset files when changing page
    setFile(null);
    setHomeFiles([null, null, null]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageKey]);

  const onChooseImage = () => {
    fileInputRef.current?.click();
  };

  const onChooseHomeImage = (index: number) => {
    homeFileInputRefs[index].current?.click();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f || null);
    if (f) {
      setImageUrl(URL.createObjectURL(f));
    }
  };

  const onHomeFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const f = e.target.files?.[0] || null;
    const newFiles = [...homeFiles];
    newFiles[index] = f;
    setHomeFiles(newFiles);

    if (f) {
      const newImages = [...homeImages];
      newImages[index] = URL.createObjectURL(f);
      setHomeImages(newImages);
    }
  };

  const removeHomeImage = (index: number) => {
    const newFiles = [...homeFiles];
    newFiles[index] = null;
    setHomeFiles(newFiles);

    const newImages = [...homeImages];
    newImages[index] = "";
    setHomeImages(newImages);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again to continue.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const form = new FormData();
      form.append("pageKey", pageKey);
      form.append("status", status);

      if (pageKey === "home") {
        // For home page, send existing images
        const existingImagesOnly = homeImages.filter(
          (img) => img && !img.startsWith("blob:")
        );

        if (existingImagesOnly.length > 0) {
          form.append("existingImages", JSON.stringify(existingImagesOnly));
        }

        // Send new files
        homeFiles.forEach((file, index) => {
          if (file) {
            form.append(`image${index + 1}`, file);
          }
        });

        // Send slides data
        const validSlides = slides.filter(s => s.title || s.imageUrl);
        if (validSlides.length > 0) {
          form.append("slides", JSON.stringify(validSlides));
        }
      } else {
        // For other pages, single image
        if (imageUrl && !file) {
          form.append("existingImage", imageUrl);
        }
        if (file) {
          form.append("image", file);
        }
        // Hero text fields
        if (heroLabel) form.append("label", heroLabel);
        if (heroHeadingLine1) form.append("headingLine1", heroHeadingLine1);
        if (heroHeadingLine2) form.append("headingLine2", heroHeadingLine2);
        if (heroDescription) form.append("description", heroDescription);
      }

      const res = await axios.post(`/api/admin/banners`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        toast({ title: "Saved", description: "Banner saved successfully." });
        fetchBanner(pageKey);
        setFile(null);
        setHomeFiles([null, null, null]);
      } else {
        toast({
          title: "Error",
          description: res.data?.message || "Failed to save banner",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Failed to save banner",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#221E1F]">
            Banner Manager
          </h1>
          <p className="text-gray-600 mt-1">
            Manage hero banners for each page
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="font-semibold">Page</Label>
                <Select value={pageKey} onValueChange={(v) => setPageKey(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageOptions.map((p) => (
                      <SelectItem key={p.key} value={p.key}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pageKey !== "home" && (
                <>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={onChooseImage}
                      className="bg-[#26A8E0] hover:bg-[#1a8abf] text-white"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onFileChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Tip: If you don't select a new image, the existing banner
                    image will be kept.
                  </p>
                  <p className="text-xs text-[#26A8E0] font-medium mt-1">
                    Recommended: 1600 × 1000px (landscape, 16:10 ratio)
                  </p>

                  {/* Hero Text Fields */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-6 bg-[#26A8E0] rounded-full" />
                      <div>
                        <h3 className="font-bold text-base text-[#221E1F]">Hero Content</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Manage the hero section text for this page</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Label</label>
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                        placeholder="e.g. Our Services"
                        value={heroLabel}
                        onChange={(e) => setHeroLabel(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Heading Line 1</label>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                          placeholder="e.g. SOLUTIONS"
                          value={heroHeadingLine1}
                          onChange={(e) => setHeroHeadingLine1(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Heading Line 2</label>
                        <input
                          className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                          placeholder="e.g. SECTORS"
                          value={heroHeadingLine2}
                          onChange={(e) => setHeroHeadingLine2(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Description</label>
                      <textarea
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors resize-none"
                        rows={3}
                        placeholder="Hero section description text..."
                        value={heroDescription}
                        onChange={(e) => setHeroDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ── HERO SLIDE CONTENT EDITOR (Home only) ── */}
              {pageKey === "home" && (
                <div className="mt-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-[#26A8E0] rounded-full" />
                    <div>
                      <h3 className="font-bold text-base text-[#221E1F]">Hero Carousel Slides</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Manage the content for each homepage hero slide</p>
                    </div>
                  </div>

                  {slides.map((slide, idx) => (
                    <details key={idx} className="group border border-gray-200 rounded-xl overflow-hidden" open={idx === 0}>
                      <summary className="flex items-center justify-between px-5 py-3.5 bg-gray-50/80 cursor-pointer select-none hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#26A8E0]/10 text-[#26A8E0] font-bold text-xs flex items-center justify-center">{idx + 1}</span>
                          <span className="font-semibold text-sm text-[#221E1F]">{slide.title || `Slide ${idx + 1}`}</span>
                        </div>
                        <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </summary>

                      <div className="px-5 py-4 space-y-4 border-t border-gray-100">
                        {/* Image is managed via upload on the right side */}

                        {/* Row 2: Title + Highlight */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Subtitle</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                              placeholder="We're India's —"
                              value={slide.title}
                              onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], title: e.target.value }; setSlides(s); }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Headline (use \n for break)</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                              placeholder="Packaging\nEngineers."
                              value={slide.highlight}
                              onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], highlight: e.target.value }; setSlides(s); }}
                            />
                          </div>
                        </div>

                        {/* Row 3: Tagline + Description */}
                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Tagline (right side)</label>
                          <input
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                            placeholder="Top performance requires\nmore than protection"
                            value={slide.tagline}
                            onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], tagline: e.target.value }; setSlides(s); }}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Description</label>
                          <input
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                            placeholder="Engineering your entire packaging supply chain..."
                            value={slide.description}
                            onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], description: e.target.value }; setSlides(s); }}
                          />
                        </div>

                        {/* Row 4: CTA */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Button Text</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                              placeholder="Explore Products"
                              value={slide.primaryCtaLabel}
                              onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], primaryCtaLabel: e.target.value }; setSlides(s); }}
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 block">Button Link</label>
                            <input
                              className="w-full border border-gray-200 rounded-lg px-3.5 py-2 text-sm focus:border-[#26A8E0] focus:ring-1 focus:ring-[#26A8E0]/20 outline-none transition-colors"
                              placeholder="/products"
                              value={slide.primaryCtaHref}
                              onChange={(e) => { const s = [...slides]; s[idx] = { ...s[idx], primaryCtaHref: e.target.value }; setSlides(s); }}
                            />
                          </div>
                        </div>
                      </div>
                    </details>
                  ))}
                </div>
              )}

              <Button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-[#221E1F] hover:bg-[#333] text-white mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Banner
                  </>
                )}
              </Button>
            </div>

            <div className="md:col-span-2">
              <Label className="font-semibold">Preview</Label>

              {pageKey === "home" ? (
                <div className="mt-2 space-y-4">
                  <p className="text-xs text-gray-400 mb-3">Live preview of your hero slides</p>

                  {/* Slide image upload + preview */}
                  {slides.map((slide, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold">Slide {idx + 1} Image</Label>
                        {homeImages[idx] && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeHomeImage(idx)} className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs">
                            <X className="h-3 w-3 mr-1" /> Remove
                          </Button>
                        )}
                      </div>

                      {/* Preview card */}
                      <div className="relative w-full h-40 rounded-xl overflow-hidden bg-[#221E1F] border border-gray-200">
                        {homeImages[idx] ? (
                          <Image src={homeImages[idx]} alt={`Slide ${idx + 1}`} fill className="object-cover opacity-60" />
                        ) : slide.imageUrl ? (
                          <Image src={slide.imageUrl} alt={`Slide ${idx + 1}`} fill className="object-cover opacity-60" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-[#221E1F] to-[#333]" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                        <div className="relative z-10 h-full flex flex-col justify-center px-4 py-3">
                          <span className="text-white/50 text-[9px] font-bold uppercase tracking-widest mb-1">Slide {idx + 1}</span>
                          <p className="text-white/70 text-[10px] mb-0.5">{slide.title || "Subtitle..."}</p>
                          <h3 className="text-white font-extrabold text-base leading-tight tracking-tight">
                            {slide.highlight ? slide.highlight.replace(/\\n/g, " ") : "Headline..."}
                          </h3>
                        </div>
                      </div>

                      {/* Upload button */}
                      <Button type="button" onClick={() => onChooseHomeImage(idx)} variant="outline" size="sm" className="w-full text-xs">
                        <Upload className="mr-2 h-3.5 w-3.5" />
                        {homeImages[idx] ? "Change Image" : "Upload Slide Image"}
                      </Button>
                      <input ref={homeFileInputRefs[idx]} type="file" accept="image/*" className="hidden" onChange={(e) => onHomeFileChange(e, idx)} />
                    </div>
                  ))}

                  {/* 
                    Commented out - Additional image slots not needed
                    
                    {[1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Image {index + 1}</Label>
                          {homeImages[index] && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeHomeImage(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100 border">
                          {homeImages[index] ? (
                            <Image
                              src={homeImages[index]}
                              alt={`Home banner ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <ImageIcon className="h-8 w-8 mb-2" />
                              <p className="text-sm">No image selected</p>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => onChooseHomeImage(index)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Choose Image {index + 1}
                        </Button>
                        <input
                          ref={homeFileInputRefs[index]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onHomeFileChange(e, index)}
                        />
                      </div>
                    ))}
                  */}
                </div>
              ) : (
                <div className="mt-2 relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 border">
                  {imageUrl ? (
                    <>
                      <Image
                        src={imageUrl}
                        alt={pageKey}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30" />
                      {pageKey ? (
                        <div className="absolute bottom-4 left-4 right-4">
                          <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm mb-2">
                            {
                              pageOptions.find((p) => p.key === pageKey)
                                ?.label
                            }
                          </Badge>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ImageIcon className="h-8 w-8 mb-2" />
                      No image selected
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
