"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  ImageIcon,
  Upload,
  Building2,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();

  const [siteName, setSiteName] = useState("Rayzor Industrial Packaging Pvt Ltd");
  const [siteNameAccent, setSiteNameAccent] = useState("PACK");
  const [siteTagline, setSiteTagline] = useState("Premium Packaging Solutions & LDPE Films");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<string | null>(null);
  const [companyProfileName, setCompanyProfileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const result = await response.json();

        if (result.success && result.data) {
          setSiteName(result.data.siteName || "Rayzor Industrial Packaging Pvt Ltd");
          setSiteNameAccent(result.data.siteNameAccent || "PACK");
          setSiteTagline(result.data.siteTagline || "Premium Packaging Solutions & LDPE Films");
          setLogo(result.data.logo || null);
          setFavicon(result.data.favicon || null);
          setCompanyProfile(result.data.companyProfile || null);
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setFetchLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const saveSettings = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteName,
          siteNameAccent,
          siteTagline,
          logo,
          favicon,
          companyProfile,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Site settings saved successfully",
        });
      } else {
        throw new Error(result.message || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save site settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setSiteName("Rayzor Industrial Packaging Pvt Ltd");
        setSiteTagline("Premium Packaging Solutions & LDPE Films");
        setLogo(null);
        setFavicon(null);

        toast({
          title: "Success",
          description: "Site settings reset to default",
        });
      } else {
        throw new Error(result.message || "Failed to reset settings");
      }
    } catch (error) {
      console.error("Error resetting settings:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to reset site settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFavicon(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#221E1F] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-[#221E1F] flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-[#26A8E0]" />
            Site Settings
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your website's basic information and branding
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={resetSettings}
            variant="outline"
            className="flex items-center"
            disabled={loading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={saveSettings}
            className="flex items-center bg-[#221E1F] hover:bg-[#333] text-white"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Site Information */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-6">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <Building2 className="h-5 w-5 text-[#26A8E0]" />
              Site Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Site Name *
              </Label>
              <Input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Enter your site name"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                This will appear in the browser title and throughout the website
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Logo Accent Text (Colored Part)
              </Label>
              <Input
                type="text"
                value={siteNameAccent}
                onChange={(e) => setSiteNameAccent(e.target.value)}
                placeholder="e.g. PACK"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                The part of the site name shown in brand blue. E.g. for &quot;RAYZOR<span className="text-[#26A8E0] font-bold">PACK</span>&quot;, enter &quot;PACK&quot;
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Site Tagline
              </Label>
              <Input
                type="text"
                value={siteTagline}
                onChange={(e) => setSiteTagline(e.target.value)}
                placeholder="Enter your site tagline"
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                A short description of your services (optional)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Brand Assets */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#26A8E0]/10 to-[#221E1F]/10 p-6">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <ImageIcon className="h-5 w-5 text-[#26A8E0]" />
              Brand Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Website Logo
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {logo ? (
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-full h-full object-contain rounded-lg p-2"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label
                    htmlFor="logo-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Label>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: PNG or SVG format, max 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Favicon
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {favicon ? (
                    <img
                      src={favicon}
                      alt="Favicon"
                      className="w-full h-full object-contain rounded-lg p-1"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="hidden"
                    id="favicon-upload"
                  />
                  <Label
                    htmlFor="favicon-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Favicon
                  </Label>
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: 32x32px ICO or PNG format
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile PDF */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-6">
            <CardTitle className="flex items-center gap-2 text-[#221E1F]">
              <Upload className="h-5 w-5 text-[#26A8E0]" />
              Company Profile PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-gray-500">
              Upload your company profile PDF. This will be available for download from the &quot;Download Profile&quot; button in the navbar.
            </p>

            {companyProfile && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <svg className="w-8 h-8 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                  <path d="M8 12h3v1H9.5v1H11v1H8v-3zm4 0h1.5c.28 0 .5.22.5.5v2c0 .28-.22.5-.5.5H12v-3zm1 2.5V13h.5v1.5H13zm2-2.5h1.5c.28 0 .5.22.5.5v.5c0 .28-.22.5-.5.5h-1v1h-1v-3h.5z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">
                    {companyProfileName || "Company Profile.pdf"}
                  </p>
                  <a href={companyProfile} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                    View current PDF
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => { setCompanyProfile(null); setCompanyProfileName(""); }}
                  className="text-red-500 hover:text-red-600 text-xs font-medium"
                >
                  Remove
                </button>
              </div>
            )}

            <div>
              <input
                type="file"
                id="profile-upload"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast({ title: "Error", description: "PDF must be under 10MB", variant: "destructive" });
                      return;
                    }
                    setCompanyProfileName(file.name);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCompanyProfile(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
              <Label
                htmlFor="profile-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-4 w-4" />
                {companyProfile ? "Replace PDF" : "Upload PDF"}
              </Label>
              <p className="text-xs text-gray-500 mt-2">
                Max 10MB, PDF format only
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Card */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-[#221E1F]/10 to-[#26A8E0]/10 p-6">
          <CardTitle className="flex items-center gap-2 text-[#221E1F]">
            <ImageIcon className="h-5 w-5 text-[#26A8E0]" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                {logo ? (
                  <img
                    src={logo}
                    alt="Logo"
                    className="w-12 h-12 object-contain"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#221E1F] flex items-center justify-center text-white text-xl font-bold">
                    {siteName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="font-bold text-[#221E1F] text-lg">
                    {siteName}
                  </div>
                  {siteTagline && (
                    <div className="text-sm text-gray-600">{siteTagline}</div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                This is how your site name and logo will appear on your website
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
