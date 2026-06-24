"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Star,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Heart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LeadDetails {
  leadId: string;
  customerName: string;
  subject: string;
  submittedAt: string;
  email: string;
}

function ReviewPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [leadDetails, setLeadDetails] = useState<LeadDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    rating: 5,
    content: "",
    location: "",
    serviceType: "",
  });

  // Fetch lead details
  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!token) {
        setError("Invalid review link");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/review?token=${token}`);
        const result = await response.json();

        if (result.success) {
          setLeadDetails(result.data);
          setFormData((prev) => ({
            ...prev,
            serviceType: result.data.subject || "",
          }));
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Error fetching lead details:", error);
        setError("Failed to load review form");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeadDetails();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      toast({
        title: "Error",
        description: "Please write your review",
        variant: "destructive",
      });
      return;
    }

    if (!formData.location.trim()) {
      toast({
        title: "Error",
        description: "Please enter your location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          rating: formData.rating,
          content: formData.content,
          location: formData.location,
          serviceType: formData.serviceType,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
        toast({
          title: "Review Submitted!",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9E8] to-[#E8F5E0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8CC63F]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9E8] to-[#E8F5E0] flex items-center justify-center px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Invalid Review Link
            </h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F0F9E8] to-[#E8F5E0] flex items-center justify-center px-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-[#8CC63F] mb-4" />
            <h2 className="text-xl font-semibold text-[#1E3A5F] mb-2">
              Thank You!
            </h2>
            <p className="text-gray-600">
              Your review has been submitted successfully. It will be published
              after admin approval.
            </p>
            <div className="mt-6">
              <Heart className="h-6 w-6 mx-auto text-[#8CC63F]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0F9E8] to-[#E8F5E0] py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">
              Share Your Experience
            </h1>
            <p className="text-gray-600">
              Help others by sharing your experience with Rayzor Industrial Packaging Pvt Ltd
            </p>
          </div>

          {leadDetails && (
            <Card className="mb-6 border-l-4 border-[#8CC63F]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#1E3A5F]">
                  <User className="h-5 w-5 text-[#8CC63F]" />
                  Your Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Name:</span>
                  <span>{leadDetails.customerName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Service Enquiry:</span>
                  <span>{leadDetails.subject}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(leadDetails.submittedAt).toLocaleDateString(
                      "en-AU",
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-[#1E3A5F]">
                Write Your Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">
                    How would you rate your experience?
                  </Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, rating: star }))
                        }
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= formData.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.rating === 1 && "Poor"}
                    {formData.rating === 2 && "Fair"}
                    {formData.rating === 3 && "Good"}
                    {formData.rating === 4 && "Very Good"}
                    {formData.rating === 5 && "Excellent"}
                  </p>
                </div>

                {/* Service Type */}
                <div>
                  <Label htmlFor="serviceType" className="text-sm font-medium">
                    Service Type *
                  </Label>
                  <Input
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        serviceType: e.target.value,
                      }))
                    }
                    placeholder="e.g., NDIS Support, Daily Living Assistance"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Location */}
                <div>
                  <Label htmlFor="location" className="text-sm font-medium">
                    Your Location *
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="e.g., Sydney, Melbourne, Brisbane"
                    className="mt-1"
                    required
                  />
                </div>

                {/* Review Content */}
                <div>
                  <Label htmlFor="content" className="text-sm font-medium">
                    Your Review *
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    placeholder="Share your experience with our service..."
                    className="mt-1 min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#8CC63F] hover:bg-[#7AB52F] text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting Review...
                    </>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-gray-500 mt-6">
            Your review helps us improve our services and assists others in
            making informed decisions.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#F0F9E8] to-[#E8F5E0] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8CC63F]"></div>
        </div>
      }
    >
      <ReviewPageContent />
    </Suspense>
  );
}
