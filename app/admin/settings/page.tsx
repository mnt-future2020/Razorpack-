"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { adminFetch } from "@/lib/admin-fetch";
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
  BarChart3,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function SettingsPage() {
  const { toast } = useToast();

  const [siteName, setSiteName] = useState("Rayzor Industrial Packaging Pvt Ltd");
  const [siteNameAccent, setSiteNameAccent] = useState("PACK");
  const [siteTagline, setSiteTagline] = useState("Premium Packaging Solutions & LDPE Films");
  const [siteUrl, setSiteUrl] = useState("https://www.rayzorpack.com");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [companyProfile, setCompanyProfile] = useState<string | null>(null);
  const [companyProfileName, setCompanyProfileName] = useState<string>("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState<string>("");
  const [ga4PropertyId, setGa4PropertyId] = useState<string>("");
  const [ga4ServiceAccountKey, setGa4ServiceAccountKey] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await adminFetch("/api/admin/settings");
        const result = await response.json();

        if (result.success && result.data) {
          setSiteName(result.data.siteName || "Rayzor Industrial Packaging Pvt Ltd");
          setSiteNameAccent(result.data.siteNameAccent || "PACK");
          setSiteTagline(result.data.siteTagline || "Premium Packaging Solutions & LDPE Films");
          setSiteUrl(result.data.siteUrl || "https://www.rayzorpack.com");
          setLogo(result.data.logo || null);
          setFavicon(result.data.favicon || null);
          setCompanyProfile(result.data.companyProfile || null);
          setGoogleAnalyticsId(result.data.googleAnalyticsId || "");
          setGa4PropertyId(result.data.ga4PropertyId || "");
          setGa4ServiceAccountKey(result.data.ga4ServiceAccountKeyConfigured ? "********" : "");
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
      const response = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteName,
          siteNameAccent,
          siteTagline,
          siteUrl,
          logo,
          favicon,
          companyProfile,
          googleAnalyticsId: googleAnalyticsId || null,
          ga4PropertyId: ga4PropertyId || null,
          ...(ga4ServiceAccountKey && ga4ServiceAccountKey !== "********" && { ga4ServiceAccountKey }),
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
      const response = await adminFetch("/api/admin/settings", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        setSiteName("Rayzor Industrial Packaging Pvt Ltd");
        setSiteTagline("Premium Packaging Solutions & LDPE Films");
        setSiteUrl("https://www.rayzorpack.com");
        setLogo(null);
        setFavicon(null);
        setGoogleAnalyticsId("");
        setGa4PropertyId("");
        setGa4ServiceAccountKey("");

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

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Site URL
              </Label>
              <Input
                type="text"
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://www.example.com"
                className="w-full font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Your website&apos;s full URL. Used in SEO metadata, JSON-LD, canonical URLs, and sitemap
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

      {/* Integrations */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-[#26A8E0]/10 to-[#221E1F]/10 p-6">
          <CardTitle className="flex items-center gap-2 text-[#221E1F]">
            <BarChart3 className="h-5 w-5 text-[#26A8E0]" />
            Integrations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Setup Guide Toggle */}
          <div className="border border-[#26A8E0]/30 rounded-lg overflow-hidden">
            <button
              onClick={() => setSetupGuideOpen(!setupGuideOpen)}
              className="w-full flex items-center justify-between p-4 bg-[#26A8E0]/5 hover:bg-[#26A8E0]/10 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📖</span>
                <span className="text-sm font-semibold text-[#221E1F]">
                  Setup Guide — How to Configure Google Analytics
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                  setupGuideOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {setupGuideOpen && (
              <div className="p-5 space-y-6 border-t border-[#26A8E0]/20 bg-white text-sm">
                {/* Step A */}
                <div className="space-y-3">
                  <h4 className="font-bold text-[#221E1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#26A8E0] text-white text-xs flex items-center justify-center font-bold">A</span>
                    Get Your Measurement ID
                    <span className="text-xs font-normal text-gray-500">(for website tracking)</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs ml-8">
                    <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[#26A8E0] hover:underline inline-flex items-center gap-0.5">analytics.google.com <ExternalLink className="h-3 w-3" /></a></li>
                    <li>Click <strong>Admin</strong> (gear icon, bottom left)</li>
                    <li>Click <strong>Data Streams</strong> (under Data collection)</li>
                    <li>Click your stream (e.g. &quot;Rayzor Pack Website&quot;)</li>
                    <li>Copy the <strong>Measurement ID</strong> at the top right (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#221E1F]">G-ABC123XYZ</code>)</li>
                    <li>Paste it in the <strong>&quot;Google Analytics Measurement ID&quot;</strong> field below</li>
                    <li>Click <strong>Save Changes</strong></li>
                  </ol>
                  <p className="text-xs text-green-600 ml-8 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Website tracking will be active after save.
                  </p>
                </div>

                {/* Step B */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-bold text-[#221E1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#26A8E0] text-white text-xs flex items-center justify-center font-bold">B</span>
                    Get Your Property ID
                    <span className="text-xs font-normal text-gray-500">(for dashboard analytics)</span>
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs ml-8">
                    <li>In Google Analytics, look at the <strong>URL</strong> in your browser:</li>
                  </ol>
                  <div className="ml-8 bg-gray-50 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                    <div>analytics.google.com/analytics/web/#/<span className="text-[#26A8E0] font-bold">p456789123</span>/...</div>
                    <div className="text-[#26A8E0] mt-1">↑ The number after &quot;p&quot; is your Property ID: <strong>456789123</strong></div>
                  </div>
                  <ol start={2} className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs ml-8">
                    <li>Or: <strong>Admin → Property Settings</strong> → The ID is shown at the top</li>
                    <li>Copy just the <strong>numeric ID</strong> (e.g. <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#221E1F]">456789123</code>)</li>
                    <li>Paste it in the <strong>&quot;GA4 Property ID&quot;</strong> field below</li>
                  </ol>
                </div>

                {/* Step C */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-bold text-[#221E1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#26A8E0] text-white text-xs flex items-center justify-center font-bold">C</span>
                    Create a Google Cloud Service Account
                  </h4>
                  <div className="ml-8 space-y-4">
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-800 flex items-center gap-1"><Circle className="h-2.5 w-2.5 text-[#26A8E0]" /> Step 1: Create a Google Cloud Project</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs ml-4">
                        <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-[#26A8E0] hover:underline inline-flex items-center gap-0.5">console.cloud.google.com <ExternalLink className="h-3 w-3" /></a></li>
                        <li>Click the <strong>project dropdown</strong> (top bar) → <strong>New Project</strong></li>
                        <li>Name it (e.g. &quot;Rayzor Analytics&quot;) → Click <strong>Create</strong></li>
                      </ol>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-800 flex items-center gap-1"><Circle className="h-2.5 w-2.5 text-[#26A8E0]" /> Step 2: Enable the Google Analytics Data API</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs ml-4">
                        <li>Go to <strong>APIs &amp; Services → Library</strong></li>
                        <li>Search for <strong>&quot;Google Analytics Data API&quot;</strong></li>
                        <li>Click it → Click <strong>Enable</strong></li>
                      </ol>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-800 flex items-center gap-1"><Circle className="h-2.5 w-2.5 text-[#26A8E0]" /> Step 3: Create a Service Account</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs ml-4">
                        <li>Go to <strong>IAM &amp; Admin → Service Accounts</strong></li>
                        <li>Click <strong>&quot;+ CREATE SERVICE ACCOUNT&quot;</strong></li>
                        <li>Name: <code className="bg-gray-100 px-1.5 py-0.5 rounded">rayzor-analytics</code></li>
                        <li>Click <strong>CREATE AND CONTINUE → CONTINUE → DONE</strong></li>
                      </ol>
                    </div>

                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-gray-800 flex items-center gap-1"><Circle className="h-2.5 w-2.5 text-[#26A8E0]" /> Step 4: Download the JSON Key</p>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600 text-xs ml-4">
                        <li>Click on the service account you just created</li>
                        <li>Go to <strong>KEYS</strong> tab → <strong>ADD KEY → Create new key</strong></li>
                        <li>Select <strong>JSON</strong> → Click <strong>CREATE</strong></li>
                        <li>A <code className="bg-gray-100 px-1.5 py-0.5 rounded">.json</code> file will download — save it safely</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Step D */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-bold text-[#221E1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#26A8E0] text-white text-xs flex items-center justify-center font-bold">D</span>
                    Grant Service Account Access to GA4
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs ml-8">
                    <li>Go to <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer" className="text-[#26A8E0] hover:underline inline-flex items-center gap-0.5">analytics.google.com <ExternalLink className="h-3 w-3" /></a></li>
                    <li>Click <strong>Admin</strong> → <strong>Property Access Management</strong></li>
                    <li>Click <strong>&quot;+&quot;</strong> → <strong>Add users</strong></li>
                    <li>Paste the service account email from the JSON file (<code className="bg-gray-100 px-1.5 py-0.5 rounded">client_email</code> field)</li>
                    <li>Uncheck &quot;Notify new users by email&quot;</li>
                    <li>Set role to <strong>Viewer</strong> → Click <strong>Add</strong></li>
                  </ol>
                </div>

                {/* Step E */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-bold text-[#221E1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#26A8E0] text-white text-xs flex items-center justify-center font-bold">E</span>
                    Paste the JSON Key Below
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs ml-8">
                    <li>Open the downloaded <code className="bg-gray-100 px-1.5 py-0.5 rounded">.json</code> file with Notepad</li>
                    <li>Press <strong>Ctrl+A</strong> (select all) → <strong>Ctrl+C</strong> (copy)</li>
                    <li>Paste into the <strong>&quot;Service Account Key&quot;</strong> field below</li>
                    <li>Click <strong>Save Changes</strong></li>
                  </ol>
                </div>

                {/* Step F */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-bold text-[#221E1F] flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">F</span>
                    View Your Analytics
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-gray-700 text-xs ml-8">
                    <li>Click <strong>&quot;Analytics&quot;</strong> in the admin sidebar</li>
                    <li>You&apos;ll see: visitors, page views, sessions, top pages, traffic sources, devices</li>
                  </ol>
                  <div className="ml-8 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                    <strong>Note:</strong> Data may take 24–48 hours to appear after initial setup. Visit your website a few times first to generate data.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              Google Analytics Measurement ID
            </Label>
            <Input
              type="text"
              value={googleAnalyticsId}
              onChange={(e) => setGoogleAnalyticsId(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full font-mono"
            />
            <p className="text-xs text-gray-500">
              Enter your GA4 Measurement ID (starts with <strong>G-</strong>). Find it in{" "}
              Google Analytics &gt; Admin &gt; Data Streams. Leave empty to disable tracking.
            </p>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Dashboard Analytics (GA4 Data API)
            </h3>
            <p className="text-xs text-gray-500">
              To display analytics data on your admin dashboard, provide your GA4 Property ID and
              a Google Cloud Service Account key with Viewer access to your GA4 property.
            </p>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                GA4 Property ID
              </Label>
              <Input
                type="text"
                value={ga4PropertyId}
                onChange={(e) => setGa4PropertyId(e.target.value)}
                placeholder="123456789"
                className="w-full font-mono"
              />
              <p className="text-xs text-gray-500">
                Found in Google Analytics URL after <strong>&quot;p&quot;</strong> — just the numeric part. Example: <strong>456789123</strong> (not the full &quot;a...p...&quot; string).
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700">
                Service Account Key (JSON)
              </Label>
              <textarea
                value={ga4ServiceAccountKey}
                onChange={(e) => setGa4ServiceAccountKey(e.target.value)}
                onFocus={(e) => {
                  if (e.target.value === "********") e.target.value = "";
                  setGa4ServiceAccountKey("");
                }}
                placeholder='{"type":"service_account","project_id":"...","private_key":"..."}'
                className="w-full font-mono text-xs p-3 border border-gray-300 rounded-lg min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-[#26A8E0]/50"
              />
              <p className="text-xs text-gray-500">
                Paste the entire JSON key file content from Google Cloud Console &gt; IAM &gt; Service Accounts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
