"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  ImageIcon,
  Loader2,
  Eye,
  Calendar,
  Briefcase,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import RichTextEditor from "@/components/ui/rich-text-editor";
import axios from "axios";

interface Product {
  _id?: string;
  productName: string;
  category?: string;
  shortDescription?: string;
  description: string;
  image: string;
  gallery?: string[];
  features: string[];
  technicalSpecs?: Array<{ label: string; value: string }>;
  applications?: string[];
  slug: string;
  status: string;
  order: number;
  views?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ProductsPage() {
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 6,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    shortDescription: "",
    description: "",
    features: "",
    technicalSpecs: [] as Array<{ label: string; value: string }>,
    applications: [] as string[],
    image: "",
    gallery: [] as string[],
    status: "active",
    order: 0,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
  });

  const [selectedFiles, setSelectedFiles] = useState<{
    image: File | null;
    galleryImages: File[];
  }>({
    image: null,
    galleryImages: [],
  });

  // Fetch products
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get(`/api/admin/products?page=${page}&limit=6`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setProducts(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
        setCurrentPage(page);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const handleEdit = (product: Product) => {
    setEditingId(product._id || null);
    setFormData({
      productName: product.productName,
      category: product.category || "",
      shortDescription: product.shortDescription || "",
      description: product.description,
      features: product.features.join(", "),
      technicalSpecs: product.technicalSpecs || [],
      applications: product.applications || [],
      image: product.image,
      gallery: product.gallery || [],
      status: product.status,
      order: product.order,
      seoTitle: product.seoTitle || "",
      seoDescription: product.seoDescription || "",
      seoKeywords: product.seoKeywords || "",
    });
    setSelectedFiles({
      image: null,
      galleryImages: [],
    });
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.productName || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Product name and description are required.",
        variant: "destructive",
      });
      return;
    }

    if (!editingId && !selectedFiles.image) {
      toast({
        title: "Validation Error",
        description: "Product image is required.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const submitFormData = new FormData();
      submitFormData.append("productName", formData.productName.trim());
      submitFormData.append("category", formData.category.trim());
      submitFormData.append("shortDescription", formData.shortDescription.trim());
      submitFormData.append("description", formData.description.trim());
      submitFormData.append("status", formData.status);
      submitFormData.append("order", formData.order.toString());
      submitFormData.append(
        "features",
        JSON.stringify(
          formData.features
            .split(",")
            .map((f) => f.trim())
            .filter((f) => f)
        )
      );
      submitFormData.append("technicalSpecs", JSON.stringify(formData.technicalSpecs));
      submitFormData.append("applications", JSON.stringify(formData.applications));
      submitFormData.append("seoTitle", formData.seoTitle.trim());
      submitFormData.append("seoDescription", formData.seoDescription.trim());
      submitFormData.append("seoKeywords", formData.seoKeywords.trim());

      if (selectedFiles.image) {
        submitFormData.append("image", selectedFiles.image);
      } else if (formData.image) {
        submitFormData.append("existingImage", formData.image);
      }

      // Add existing gallery URLs
      formData.gallery.forEach((url, index) => {
        if (!url.startsWith('blob:')) {
          submitFormData.append(`existingGallery[${index}]`, url);
        }
      });

      // Add new gallery image files
      selectedFiles.galleryImages.forEach((file) => {
        submitFormData.append(`galleryImages`, file);
      });

      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const method = editingId ? "put" : "post";

      const response = await axios[method](url, submitFormData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast({
          title: editingId ? "Product Updated" : "Product Added",
          description: `Product has been successfully ${
            editingId ? "updated" : "added"
          }.`,
        });
        fetchProducts(currentPage);
        handleCancel();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Please login again",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.delete(`/api/admin/products/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast({
          title: "Product Deleted",
          description: "Product has been successfully deleted.",
        });
        setDeletingProductId(null);
        
        // Check if we need to go back to previous page
        const remainingProducts = Array.isArray(products) ? products.filter((s) => s._id !== id) : [];
        if (remainingProducts.length === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchProducts(currentPage);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsAddModalOpen(false);
    setEditingId(null);
    setFormData({
      productName: "",
      category: "",
      shortDescription: "",
      description: "",
      features: "",
      technicalSpecs: [],
      applications: [],
      image: "",
      gallery: [],
      status: "active",
      order: 0,
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
    });
    setSelectedFiles({
      image: null,
      galleryImages: [],
    });
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setSelectedFiles((prev) => ({ ...prev, image: file }));
        const previewUrl = URL.createObjectURL(file);
        setFormData((prev) => ({ ...prev, image: previewUrl }));
        toast({
          title: "Image Selected",
          description: "Click Save to upload the image.",
        });
      }
    };
    input.click();
  };

  const handleGalleryUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        setSelectedFiles((prev) => ({
          ...prev,
          galleryImages: [...prev.galleryImages, ...files],
        }));
        const previewUrls = files.map((file) => URL.createObjectURL(file));
        setFormData((prev) => ({
          ...prev,
          gallery: [...prev.gallery, ...previewUrls],
        }));
        toast({
          title: "Gallery Images Selected",
          description: `${files.length} image(s) added. Click Save to upload.`,
        });
      }
    };
    input.click();
  };

  const removeGalleryImage = (index: number) => {
    const removedUrl = formData.gallery[index];

    if (removedUrl && removedUrl.startsWith("blob:")) {
      const blobIndex = formData.gallery
        .filter((url) => url.startsWith("blob:"))
        .indexOf(removedUrl);
      if (blobIndex !== -1) {
        setSelectedFiles((prev) => ({
          ...prev,
          galleryImages: prev.galleryImages.filter((_, i) => i !== blobIndex),
        }));
      }
    }

    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPaginationItems = () => {
    if (!pagination) return [];
    
    const items = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={() => handlePageChange(currentPage - 1)}
          className={
            !pagination.hasPrevPage
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    // Page numbers
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className={`cursor-pointer ${
                currentPage === i
                  ? "bg-[#26A8E0] text-white border-0 hover:bg-[#1a8abf]"
                  : ""
              }`}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className={`cursor-pointer ${
              currentPage === 1
                ? "bg-[#221E1F] text-white border-0 hover:bg-[#333]"
                : ""
            }`}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className={`cursor-pointer ${
                currentPage === i
                  ? "bg-[#26A8E0] text-white border-0 hover:bg-[#1a8abf]"
                  : ""
              }`}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className={`cursor-pointer ${
              currentPage === totalPages
                ? "bg-[#221E1F] text-white border-0 hover:bg-[#333]"
                : ""
            }`}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={() => handlePageChange(currentPage + 1)}
          className={
            !pagination.hasNextPage
              ? "pointer-events-none opacity-50"
              : "cursor-pointer"
          }
        />
      </PaginationItem>
    );

    return items;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#221E1F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#221E1F]">
            Products Manager
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your industrial packaging products
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingId(null);
            setFormData({
              productName: "",
              category: "",
              shortDescription: "",
              description: "",
              features: "",
              applications: [],
              image: "",
              gallery: [],
              status: "active",
              order: 0,
              seoTitle: "",
              seoDescription: "",
              seoKeywords: "",
            });
            setSelectedFiles({
              image: null,
              galleryImages: [],
            });
            setIsAddModalOpen(true);
          }}
          className="bg-[#221E1F] hover:bg-[#333] text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Products List - Horizontal Cards */}
      {products.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#221E1F] mb-1">
            No products found
          </h3>
          <p className="text-gray-500 mb-6">
            Get started by creating your first product.
          </p>
          <Button
            onClick={() => {
              setEditingId(null);
              setFormData({
                productName: "",
                category: "",
                shortDescription: "",
                description: "",
                features: "",
                applications: [],
                image: "",
                gallery: [],
                status: "active",
                order: 0,
                seoTitle: "",
                seoDescription: "",
                seoKeywords: "",
              });
              setSelectedFiles({
                image: null,
                galleryImages: [],
              });
              setIsAddModalOpen(true);
            }}
            className="bg-[#221E1F] hover:bg-[#333] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Product
          </Button>
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product) => (
            <Card key={product._id} className="shadow-xl border-0">
              <CardContent className="p-6">
                <div className="flex gap-6 h-full">
                  {/* Left Side - Product Image */}
                  <div className="flex-shrink-0 flex flex-col">
                    <div className="w-80 h-56 rounded-lg overflow-hidden border-0 shadow-md">
                      <Image
                        src={product.image}
                        alt={product.productName}
                        width={320}
                        height={224}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Gallery Preview */}
                    {product.gallery && product.gallery.length > 0 && (
                      <div className="mt-3">
                        <div className="flex gap-2 overflow-x-auto">
                          {product.gallery.slice(0, 4).map((image, index) => (
                            <div key={index} className="flex-shrink-0">
                              <Image
                                src={image}
                                alt={`Gallery ${index + 1}`}
                                width={60}
                                height={40}
                                className="w-15 h-10 object-cover rounded border"
                              />
                            </div>
                          ))}
                          {product.gallery.length > 4 && (
                            <div className="flex-shrink-0 w-15 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-600">
                              +{product.gallery.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Product Content */}
                  <div className="flex-1 flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-semibold text-[#221E1F]">
                          {product.productName}
                        </h3>
                        <Badge
                          className={
                            product.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }
                        >
                          {product.status}
                        </Badge>
                      </div>

                      {product.shortDescription && (
                        <p className="text-gray-600 mb-4">
                          {product.shortDescription}
                        </p>
                      )}

                      <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{product.views || 0} views</span>
                        </div>
                      </div>

                      {product.features && product.features.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Features:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {product.features.slice(0, 3).map((feature, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {feature}
                              </Badge>
                            ))}
                            {product.features.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleEdit(product)}
                        variant="outline"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() =>
                          setDeletingProductId(product._id || null)
                        }
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 whitespace-nowrap"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination>
            <PaginationContent>{renderPaginationItems()}</PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog 
        open={isAddModalOpen} 
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          } else {
            setIsAddModalOpen(open);
          }
        }}
      >
        <DialogContent className="!max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#221E1F]">
              {editingId ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#221E1F]">
                Basic Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={formData.productName}
                    onChange={(e) =>
                      setFormData({ ...formData, productName: e.target.value })
                    }
                    placeholder="e.g., VCI Film Rolls, Export Palletization"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Industrial Packaging, VCI Protection"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Order</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Short Description</Label>
                <Input
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Brief description (max 200 characters)"
                  maxLength={200}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Full Description *</Label>
                <div className="mt-2">
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                    placeholder="Detailed description of the product"
                  />
                </div>
              </div>

              <div>
                <Label>Features (comma-separated)</Label>
                <Textarea
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  placeholder="e.g., Rust Protection, Moisture Barrier, High Tensile Strength"
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Applications & Sectors (comma-separated)</Label>
                <Input
                  value={formData.applications?.join(", ") || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      applications: e.target.value.split(",").map((a) => a.trim()).filter((a) => a),
                    })
                  }
                  placeholder="e.g., Automotive, Electronics, Heavy Machinery, Aerospace"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#221E1F]">
                  Technical Specifications
                </h3>
                <Button
                  type="button"
                  onClick={() => {
                    setFormData({
                      ...formData,
                      technicalSpecs: [
                        ...(formData.technicalSpecs || []),
                        { label: "", value: "" },
                      ],
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Spec
                </Button>
              </div>
              {(formData.technicalSpecs?.length || 0) === 0 ? (
                <p className="text-sm text-gray-500">
                  No specifications added. Click "Add Spec" to add technical details.
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.technicalSpecs?.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <Input
                        value={spec.label || ""}
                        onChange={(e) => {
                          const newSpecs = [...(formData.technicalSpecs || [])];
                          newSpecs[index].label = e.target.value;
                          setFormData({ ...formData, technicalSpecs: newSpecs });
                        }}
                        placeholder="Label (e.g., Thickness)"
                        className="flex-1"
                      />
                      <Input
                        value={spec.value || ""}
                        onChange={(e) => {
                          const newSpecs = [...(formData.technicalSpecs || [])];
                          newSpecs[index].value = e.target.value;
                          setFormData({ ...formData, technicalSpecs: newSpecs });
                        }}
                        placeholder="Value (e.g., 50 - 200 µ)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            technicalSpecs: (formData.technicalSpecs || []).filter(
                              (_, i) => i !== index
                            ),
                          });
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#221E1F]">Image</h3>
              <div>
                <Label>Product Image *</Label>
                <p className="text-xs text-[#26A8E0] font-medium mt-1">Recommended: 1600 × 1000px (landscape, 16:10 ratio)</p>
                <div className="mt-2 border-2 border-dashed rounded-lg p-4">
                  {formData.image ? (
                    <div className="relative h-48">
                      <Image
                        src={formData.image}
                        alt="Product"
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-50">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <Button
                    type="button"
                    onClick={handleImageUpload}
                    variant="outline"
                    className="w-full mt-2"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#221E1F]">
                Gallery Images (Optional)
              </h3>
              <div>
                <Label>Additional Images</Label>
                <div className="mt-2 space-y-4">
                  <Button
                    type="button"
                    onClick={handleGalleryUpload}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add Gallery Images
                  </Button>

                  {formData.gallery.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.gallery.map((url, index) => (
                        <div
                          key={index}
                          className="relative group border-2 border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="relative h-32">
                            <Image
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#221E1F]">Settings</h3>
              <div>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SEO */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#221E1F]">
                SEO (Optional)
              </h3>
              <div>
                <Label>SEO Title</Label>
                <Input
                  value={formData.seoTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, seoTitle: e.target.value })
                  }
                  placeholder="e.g., VCI Film Rolls | Rayzor Industrial Packaging Pvt Ltd"
                  maxLength={200}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>SEO Description</Label>
                <Textarea
                  value={formData.seoDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      seoDescription: e.target.value,
                    })
                  }
                  placeholder="Brief description for search engines (max 300 characters)"
                  maxLength={300}
                  rows={3}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>SEO Keywords</Label>
                <Input
                  value={formData.seoKeywords}
                  onChange={(e) =>
                    setFormData({ ...formData, seoKeywords: e.target.value })
                  }
                  placeholder="e.g., VCI films, industrial packaging, rust prevention"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button onClick={handleCancel} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#221E1F] hover:bg-[#333] text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Product
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={() => setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingProductId && handleDelete(deletingProductId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
