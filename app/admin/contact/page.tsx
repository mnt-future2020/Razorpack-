"use client";

import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  Phone,
  Mail,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    // Basic Contact Information
    primaryPhone: "",
    secondaryPhone: "",
    whatsappNumber: "",
    email: "",
    address: "",
    city: "",
    state: "",
    postcode: "",
    country: "",

    // Business Hours
    businessHours: "",

    // Social Media Links
    facebook: "",
    twitter: "",
    linkedin: "",
    instagram: "",
    youtube: "",
    whatsapp: "",
    telegram: "",

    // Google Maps Integration
    mapEmbedCode: "",
    latitude: "",
    longitude: "",

    // Service Areas
    serviceAreas: "",
  });

  // Fetch contact information from API
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await adminFetch("/api/admin/contact");
        const result = await response.json();

        if (result.success && result.data) {
          setContactInfo({
            ...contactInfo,
            ...result.data,
            whatsapp: result.data.whatsapp || "",
            telegram: result.data.telegram || "",
            serviceAreas: result.data.serviceAreas || "",
          });
        }
      } catch (error) {
        console.error("Error fetching contact info:", error);
        toast({
          title: "Error",
          description: "Failed to load contact information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactInfo();
  }, [toast]);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const response = await adminFetch("/api/admin/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactInfo),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Contact Information Updated",
          description: "All contact information has been successfully saved.",
        });
      } else {
        throw new Error(result.message || "Failed to save contact information");
      }
    } catch (error) {
      console.error("Error saving contact info:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save contact information",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setContactInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#221E1F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#221E1F]">Contact Manager</h1>
          <p className="text-gray-600 mt-2">
            Manage contact details, phone numbers, WhatsApp, emails, address,
            social media links, and Google Map location
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#221E1F] hover:bg-[#333] text-white"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {/* Basic Contact Information */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-6">
          <CardTitle className="flex items-center text-[#221E1F] gap-2">
            <Phone className="h-5 w-5 text-[#26A8E0]" />
            Basic Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primaryPhone" className="text-base font-semibold">
                Primary Phone Number *
              </Label>
              <Input
                id="primaryPhone"
                value={contactInfo.primaryPhone}
                onChange={(e) =>
                  handleInputChange("primaryPhone", e.target.value)
                }
                placeholder="+91 9994162996"
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="secondaryPhone"
                className="text-base font-semibold"
              >
                Secondary Phone Number
              </Label>
              <Input
                id="secondaryPhone"
                value={contactInfo.secondaryPhone}
                onChange={(e) =>
                  handleInputChange("secondaryPhone", e.target.value)
                }
                placeholder="+91 9876543210"
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="whatsappNumber"
                className="text-base font-semibold"
              >
                WhatsApp Number *
              </Label>
              <Input
                id="whatsappNumber"
                value={contactInfo.whatsappNumber}
                onChange={(e) =>
                  handleInputChange("whatsappNumber", e.target.value)
                }
                placeholder="+91 9994162996"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-base font-semibold">
                Email Address *
              </Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="sales@rayzorpack.com"
                className="mt-2"
              />
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#221E1F]">
              Business Information
            </h3>
            <div>
              <Label
                htmlFor="businessHours"
                className="text-base font-semibold"
              >
                Business Hours
              </Label>
              <Input
                id="businessHours"
                value={contactInfo.businessHours}
                onChange={(e) =>
                  handleInputChange("businessHours", e.target.value)
                }
                placeholder="Monday - Friday: 9:00 AM - 5:00 PM"
                className="mt-2"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-[#221E1F]">
              Address Information
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-base font-semibold">
                  Street Address *
                </Label>
                <Input
                  id="address"
                  value={contactInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Enter street address"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="city" className="text-base font-semibold">
                  City *
                </Label>
                <Input
                  id="city"
                  value={contactInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-base font-semibold">
                  State *
                </Label>
                <Input
                  id="state"
                  value={contactInfo.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="Enter state"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="postcode" className="text-base font-semibold">
                  Postcode *
                </Label>
                <Input
                  id="postcode"
                  value={contactInfo.postcode}
                  onChange={(e) =>
                    handleInputChange("postcode", e.target.value)
                  }
                  placeholder="Enter postcode"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="country" className="text-base font-semibold">
                  Country *
                </Label>
                <Input
                  id="country"
                  value={contactInfo.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  placeholder="India"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CardContent>

        {/* Social Media Links */}
        <Card className="shadow-lg border-0 rounded-none">
          <CardHeader className="bg-gradient-to-r from-[#26A8E0]/10 to-[#221E1F]/10 p-6">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <Globe className="h-5 w-5 text-[#26A8E0]" />
              Social Media Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="facebook"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Facebook className="h-4 w-4 text-blue-600" />
                  Facebook URL
                </Label>
                <Input
                  id="facebook"
                  value={contactInfo.facebook}
                  onChange={(e) =>
                    handleInputChange("facebook", e.target.value)
                  }
                  placeholder="https://facebook.com/rayzorpack"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="twitter"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Twitter className="h-4 w-4 text-blue-400" />
                  Twitter URL
                </Label>
                <Input
                  id="twitter"
                  value={contactInfo.twitter}
                  onChange={(e) => handleInputChange("twitter", e.target.value)}
                  placeholder="https://twitter.com/rayzorpack"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="linkedin"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Linkedin className="h-4 w-4 text-blue-700" />
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedin"
                  value={contactInfo.linkedin}
                  onChange={(e) =>
                    handleInputChange("linkedin", e.target.value)
                  }
                  placeholder="https://linkedin.com/company/rayzorpack"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="instagram"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Instagram className="h-4 w-4 text-pink-600" />
                  Instagram URL
                </Label>
                <Input
                  id="instagram"
                  value={contactInfo.instagram}
                  onChange={(e) =>
                    handleInputChange("instagram", e.target.value)
                  }
                  placeholder="https://instagram.com/rayzorpack"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="youtube"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Youtube className="h-4 w-4 text-red-600" />
                  YouTube URL
                </Label>
                <Input
                  id="youtube"
                  value={contactInfo.youtube}
                  onChange={(e) => handleInputChange("youtube", e.target.value)}
                  placeholder="https://youtube.com/@rayzorpack"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="whatsapp"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  WhatsApp Business URL
                </Label>
                <Input
                  id="whatsapp"
                  value={contactInfo.whatsapp}
                  onChange={(e) =>
                    handleInputChange("whatsapp", e.target.value)
                  }
                  placeholder="https://wa.me/919994162996"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="telegram"
                  className="text-base font-semibold flex items-center gap-2"
                >
                  <Send className="h-4 w-4 text-blue-500" />
                  Telegram URL
                </Label>
                <Input
                  id="telegram"
                  value={contactInfo.telegram}
                  onChange={(e) =>
                    handleInputChange("telegram", e.target.value)
                  }
                  placeholder="https://t.me/rayzorpack"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google Maps Integration */}
        <Card className="shadow-lg border-0 rounded-none">
          <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-6">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <MapPin className="h-5 w-5 text-[#26A8E0]" />
              Google Maps Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="latitude" className="text-base font-semibold">
                  Latitude
                </Label>
                <Input
                  id="latitude"
                  value={contactInfo.latitude}
                  onChange={(e) =>
                    handleInputChange("latitude", e.target.value)
                  }
                  placeholder="12.9716"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="longitude" className="text-base font-semibold">
                  Longitude
                </Label>
                <Input
                  id="longitude"
                  value={contactInfo.longitude}
                  onChange={(e) =>
                    handleInputChange("longitude", e.target.value)
                  }
                  placeholder="80.2466"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="mapEmbedCode" className="text-base font-semibold">
                Google Maps Embed Code
              </Label>
              <Textarea
                id="mapEmbedCode"
                value={contactInfo.mapEmbedCode}
                onChange={(e) =>
                  handleInputChange("mapEmbedCode", e.target.value)
                }
                placeholder="<iframe src='https://www.google.com/maps/embed?pb=...' width='100%' height='450' style='border:0;' allowfullscreen='' loading='lazy'></iframe>"
                rows={4}
                className="mt-2 w-full break-words"
                style={{ wordBreak: 'break-all', overflowWrap: 'break-word' }}
              />
              <p className="text-sm text-gray-500 mt-1">
                Embed code from Google Maps for displaying interactive map on
                contact page. Go to Google Maps → Share → Embed a map → Copy
                HTML code.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Service Areas */}
        <Card className="shadow-lg border-0 rounded-none">
          <CardHeader className="bg-gradient-to-r from-[#26A8E0]/10 to-[#221E1F]/10 p-6">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <MapPin className="h-5 w-5 text-[#26A8E0]" />
              Service Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <Label
                htmlFor="serviceAreas"
                className="text-base font-semibold"
              >
                Service Areas (comma-separated)
              </Label>
              <Textarea
                id="serviceAreas"
                value={contactInfo.serviceAreas}
                onChange={(e) =>
                  handleInputChange("serviceAreas", e.target.value)
                }
                placeholder="Madurai, Chennai, Bangalore, Coimbatore, Tamil Nadu, South India"
                rows={3}
                className="mt-2 w-full"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter service areas separated by commas.
              </p>
            </div>
          </CardContent>
        </Card>
      </Card>
    </div>
  );
}
