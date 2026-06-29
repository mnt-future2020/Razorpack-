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
import {
  Upload,
  Save,
  Loader2,
  ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Eye,
  Trash2,
  Plus,
  Link as LinkIcon,
  Type,
  AlignLeft,
  MousePointerClick,
} from "lucide-react";

export default function BannersPage() {
  const pageOptions = [
    { key: "home", label: "Home" },
    { key: "about", label: "About Us" },
    { key: "products", label: "Products" },
    { key: "services", label: "Services" },
    { key: "contact", label: "Contact" },
  ];

  const [pageKey, setPageKey] = useState<string>("home");
  const [status, setStatus] = useState<string>("active");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  // For home page - multiple images
  const [homeImages, setHomeImages] = useState<string[]>([]);
  const [homeFiles, setHomeFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
  ]);

  // Hero slides content (for home page)
  const [slides, setSlides] = useState([
    {
      imageUrl: "",
      title: "",
      highlight: "",
      tagline: "",
      description: "",
      primaryCtaLabel: "",
      primaryCtaHref: "",
      secondaryCtaLabel: "",
      secondaryCtaHref: "",
    },
    {
      imageUrl: "",
      title: "",
      highlight: "",
      tagline: "",
      description: "",
      primaryCtaLabel: "",
      primaryCtaHref: "",
      secondaryCtaLabel: "",
      secondaryCtaHref: "",
    },
    {
      imageUrl: "",
      title: "",
      highlight: "",
      tagline: "",
      description: "",
      primaryCtaLabel: "",
      primaryCtaHref: "",
      secondaryCtaLabel: "",
      secondaryCtaHref: "",
    },
  ]);

  // Active slide for home page editor
  const [activeSlide, setActiveSlide] = useState(0);

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
            paddedSlides.push({
              imageUrl: "",
              title: "",
              highlight: "",
              tagline: "",
              description: "",
              primaryCtaLabel: "",
              primaryCtaHref: "",
              secondaryCtaLabel: "",
              secondaryCtaHref: "",
            });
          }
          setSlides(paddedSlides.slice(0, 3));
        }
      } else {
        setImageUrl("");
        setHomeImages(key === "home" ? ["", "", ""] : []);
        setStatus("active");
        setHeroLabel("");
        setHeroHeadingLine1("");
        setHeroHeadingLine2("");
        setHeroDescription("");
      }
    } catch (e) {
      setImageUrl("");
      setHomeImages(key === "home" ? ["", "", ""] : []);
      setStatus("active");
      setHeroLabel("");
      setHeroHeadingLine1("");
      setHeroHeadingLine2("");
      setHeroDescription("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanner(pageKey);
    setFile(null);
    setHomeFiles([null, null, null]);
    setActiveSlide(0);
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

  const updateSlideField = (
    idx: number,
    field: string,
    value: string
  ) => {
    const updated = [...slides];
    updated[idx] = { ...updated[idx], [field]: value };
    setSlides(updated);
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
        // For home page, send existing images (always send, even if empty, to clear removed images)
        const existingImagesOnly = homeImages.filter(
          (img) => img && !img.startsWith("blob:")
        );
        form.append("existingImages", JSON.stringify(existingImagesOnly));

        // Send new files
        homeFiles.forEach((file, index) => {
          if (file) {
            form.append(`image${index + 1}`, file);
          }
        });

        // Send slides data
        const validSlides = slides.filter((s) => s.title || s.imageUrl);
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

  const currentSlide = slides[activeSlide];
  const currentImage = homeImages[activeSlide];

  const statusColor =
    status === "active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "draft"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-gray-50 text-gray-500 border-gray-200";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#221E1F]">Banner Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage hero banners for each page
          </p>
        </div>
        <Button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-[#221E1F] hover:bg-[#333] text-white px-6 h-10"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Page & Status Bar */}
      <Card className="border border-gray-200 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Page
              </Label>
              <Select value={pageKey} onValueChange={(v) => setPageKey(v)}>
                <SelectTrigger className="w-44">
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
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v)}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══════ HOME PAGE: Slide Editor ═══════ */}
      {pageKey === "home" ? (
        <div className="space-y-4">
          {/* Slide Tabs */}
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`
                  relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${
                    idx === activeSlide
                      ? "bg-[#221E1F] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${
                    idx === activeSlide
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="max-w-[120px] truncate">
                  {slide.title || `Slide ${idx + 1}`}
                </span>
                {homeImages[idx] && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${idx === activeSlide ? "bg-emerald-400" : "bg-emerald-500"}`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Active Slide Editor */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* ─── Left: Image Upload ─── */}
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <h3 className="font-semibold text-sm text-[#221E1F]">
                    Slide Image
                  </h3>
                </div>
                {currentImage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHomeImage(activeSlide)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-7 text-xs gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Remove
                  </Button>
                )}
              </div>

              <CardContent className="p-5">
                {/* Image Preview */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#221E1F] border border-gray-200 group">
                  {currentImage ? (
                    <Image
                      src={currentImage}
                      alt={`Slide ${activeSlide + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : currentSlide.imageUrl ? (
                    <Image
                      src={currentSlide.imageUrl}
                      alt={`Slide ${activeSlide + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
                      <ImageIcon className="h-10 w-10 mb-3 text-gray-400" />
                      <p className="text-sm font-medium">No image uploaded</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended: 1920 x 1080px
                      </p>
                    </div>
                  )}

                  {/* Hover overlay for existing images */}
                  {(currentImage || currentSlide.imageUrl) && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        type="button"
                        onClick={() => onChooseHomeImage(activeSlide)}
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload Button (shown when no image) */}
                {!currentImage && !currentSlide.imageUrl && (
                  <Button
                    type="button"
                    onClick={() => onChooseHomeImage(activeSlide)}
                    className="w-full mt-4 bg-[#26A8E0] hover:bg-[#1a8abf] text-white"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Slide Image
                  </Button>
                )}

                <input
                  ref={homeFileInputRefs[activeSlide]}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onHomeFileChange(e, activeSlide)}
                />

                {/* Thumbnail strip */}
                <div className="flex gap-2 mt-4">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`relative w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        idx === activeSlide
                          ? "border-[#26A8E0] ring-2 ring-[#26A8E0]/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {homeImages[idx] ? (
                        <Image
                          src={homeImages[idx]}
                          alt={`Thumb ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="h-3.5 w-3.5 text-gray-300" />
                        </div>
                      )}
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-bold text-white drop-shadow-md">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ─── Right: Slide Content ─── */}
            <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                <Type className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-sm text-[#221E1F]">
                  Slide Content
                </h3>
              </div>

              <CardContent className="p-5 space-y-5">
                {/* Title & Headline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 bg-[#26A8E0] rounded-full" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Heading
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      Subtitle
                    </label>
                    <input
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all"
                      placeholder='e.g. We&apos;re India&apos;s —'
                      value={currentSlide.title}
                      onChange={(e) =>
                        updateSlideField(activeSlide, "title", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center justify-between">
                      <span>Headline</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        Each line becomes a new row
                      </span>
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all resize-none font-semibold"
                      rows={2}
                      placeholder={"Packaging\nEngineers."}
                      value={currentSlide.highlight.replace(/\\n/g, "\n")}
                      onChange={(e) =>
                        updateSlideField(
                          activeSlide,
                          "highlight",
                          e.target.value.replace(/\n/g, "\\n")
                        )
                      }
                    />
                  </div>
                </div>

                {/* Description & Tagline */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 bg-[#26A8E0] rounded-full" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Body
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                      Description
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all resize-none"
                      rows={2}
                      placeholder="Engineering your entire packaging supply chain..."
                      value={currentSlide.description}
                      onChange={(e) =>
                        updateSlideField(
                          activeSlide,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center justify-between">
                      <span>Tagline (right side)</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        Each line becomes a new row
                      </span>
                    </label>
                    <textarea
                      className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all resize-none italic text-gray-600"
                      rows={3}
                      placeholder={"Top performance requires\nmore than protection —\nespecially precision"}
                      value={currentSlide.tagline.replace(/\\n/g, "\n")}
                      onChange={(e) =>
                        updateSlideField(
                          activeSlide,
                          "tagline",
                          e.target.value.replace(/\n/g, "\\n")
                        )
                      }
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-1 h-4 bg-[#26A8E0] rounded-full" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Call to Action
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <MousePointerClick className="w-3 h-3" /> Button Text
                      </label>
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all"
                        placeholder="Explore Products"
                        value={currentSlide.primaryCtaLabel}
                        onChange={(e) =>
                          updateSlideField(
                            activeSlide,
                            "primaryCtaLabel",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 flex items-center gap-1.5">
                        <LinkIcon className="w-3 h-3" /> Button Link
                      </label>
                      <input
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all font-mono text-xs"
                        placeholder="/products"
                        value={currentSlide.primaryCtaHref}
                        onChange={(e) =>
                          updateSlideField(
                            activeSlide,
                            "primaryCtaHref",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Live Preview ─── */}
          <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                <h3 className="font-semibold text-sm text-[#221E1F]">
                  Live Preview
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setActiveSlide((p) => (p > 0 ? p - 1 : slides.length - 1))
                  }
                  className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="text-xs text-gray-400 px-2">
                  {activeSlide + 1} / {slides.length}
                </span>
                <button
                  onClick={() =>
                    setActiveSlide((p) => (p < slides.length - 1 ? p + 1 : 0))
                  }
                  className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <CardContent className="p-0">
              <div className="relative w-full aspect-[21/9] min-h-[280px] bg-[#221E1F] overflow-hidden">
                {/* Background Image */}
                {(currentImage || currentSlide.imageUrl) ? (
                  <Image
                    src={currentImage || currentSlide.imageUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#221E1F]" />
                )}

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 to-black/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/25" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center px-8 sm:px-12 lg:px-16">
                  <div className="w-full flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    {/* Left: Text */}
                    <div className="max-w-[60%]">
                      <p
                        className="text-white/70 mb-1"
                        style={{
                          fontSize: "clamp(0.7rem, 1.5vw, 1.2rem)",
                          fontWeight: 400,
                        }}
                      >
                        {currentSlide.title || "Subtitle..."}
                      </p>
                      <h2
                        className="text-white font-extrabold leading-[0.95] tracking-tight"
                        style={{
                          fontSize: "clamp(1.5rem, 4vw, 3.5rem)",
                        }}
                      >
                        {currentSlide.highlight
                          ? currentSlide.highlight
                              .replace(/\\n/g, "\n")
                              .split("\n")
                              .map((line, i) => (
                                <span key={i} className="block">
                                  {line}
                                </span>
                              ))
                          : "Headline..."}
                      </h2>
                      <p className="text-white/50 text-xs sm:text-sm mt-3 max-w-md">
                        {currentSlide.description || "Description text..."}
                      </p>
                      {currentSlide.primaryCtaLabel && (
                        <div className="mt-5 flex items-center gap-3">
                          <span className="text-white text-xs sm:text-sm font-bold border-b-2 border-white/60 pb-1">
                            {currentSlide.primaryCtaLabel}
                          </span>
                          <span className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center text-white/60">
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M7 17L17 7M17 7H7M17 7v10"
                              />
                            </svg>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right: Tagline */}
                    {currentSlide.tagline && (
                      <div className="hidden lg:block max-w-[30%] pb-4">
                        <div className="border-l-2 border-white/15 pl-5">
                          <p className="text-white/40 text-sm italic leading-relaxed">
                            {currentSlide.tagline
                              .replace(/\\n/g, "\n")
                              .split("\n")
                              .map((line, i) => (
                                <span key={i}>
                                  {line}
                                  {i <
                                    currentSlide.tagline.split("\\n").length -
                                      1 && <br />}
                                </span>
                              ))}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slide indicators */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5">
                  {slides.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 rounded-full transition-all ${
                        idx === activeSlide
                          ? "h-6 bg-white"
                          : "h-2 bg-white/25"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* ═══════ NON-HOME PAGES ═══════ */
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left: Form */}
          <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-sm text-[#221E1F]">
                Banner Image
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 border border-gray-200 group">
                {imageUrl ? (
                  <>
                    <Image
                      src={imageUrl}
                      alt={pageKey}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        type="button"
                        onClick={onChooseImage}
                        variant="secondary"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-gray-800 shadow-lg"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Image
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="h-10 w-10 mb-3" />
                    <p className="text-sm font-medium">No image uploaded</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Recommended: 1600 x 1000px
                    </p>
                  </div>
                )}
              </div>

              {!imageUrl && (
                <Button
                  type="button"
                  onClick={onChooseImage}
                  className="w-full bg-[#26A8E0] hover:bg-[#1a8abf] text-white"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Banner Image
                </Button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </CardContent>
          </Card>

          {/* Right: Hero Content */}
          <Card className="border border-gray-200 shadow-sm bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Type className="w-4 h-4 text-gray-400" />
              <h3 className="font-semibold text-sm text-[#221E1F]">
                Hero Content
              </h3>
            </div>
            <CardContent className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Label
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all"
                  placeholder="e.g. Our Services"
                  value={heroLabel}
                  onChange={(e) => setHeroLabel(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Heading Line 1
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all"
                    placeholder="e.g. SOLUTIONS"
                    value={heroHeadingLine1}
                    onChange={(e) => setHeroHeadingLine1(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Heading Line 2
                  </label>
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all"
                    placeholder="e.g. SECTORS"
                    value={heroHeadingLine2}
                    onChange={(e) => setHeroHeadingLine2(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:border-[#26A8E0] focus:ring-2 focus:ring-[#26A8E0]/10 outline-none transition-all resize-none"
                  rows={3}
                  placeholder="Hero section description text..."
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
