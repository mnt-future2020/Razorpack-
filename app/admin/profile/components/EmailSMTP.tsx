"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Save,
  TestTube,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

interface EmailSettings {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  fromEmail: string;
  fromName: string;
}

interface TestEmailData {
  email: string;
  message: string;
}

export default function EmailSMTP() {
  const { toast } = useToast();

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "Rayzor Industrial Packaging Pvt Ltd",
  });

  const [testEmailData, setTestEmailData] = useState<TestEmailData>({
    email: "",
    message:
      "Greetings from Rayzor Industrial Packaging Pvt Ltd! This is a test email to verify our SMTP configuration is working correctly for sending notifications and updates.",
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "success" | "failed" | "never";
    lastTested: string | null;
  }>({
    status: "never",
    lastTested: null,
  });

  useEffect(() => {
    fetchSMTPSettings();
  }, []);

  const fetchSMTPSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/EmailSmtp");
      const data = await response.json();

      if (data.success) {
        const settings = data.data;
        setEmailSettings({
          smtpHost: settings.smtpHost,
          smtpPort: settings.smtpPort,
          smtpUser: settings.smtpUser,
          smtpPassword: "",
          fromEmail: settings.fromEmail,
          fromName: settings.fromName,
        });

        setConnectionStatus({
          status: settings.testStatus || "never",
          lastTested: settings.lastTested,
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch SMTP settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch SMTP settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSave = async () => {
    if (
      !emailSettings.smtpHost ||
      !emailSettings.smtpPort ||
      !emailSettings.smtpUser ||
      !emailSettings.smtpPassword ||
      !emailSettings.fromEmail ||
      !emailSettings.fromName
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required SMTP fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/EmailSmtp", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailSettings),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Email Settings Updated",
          description:
            "Your email configuration has been successfully updated.",
        });
        await fetchSMTPSettings();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update email settings",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update email settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setIsTestingConnection(true);

    try {
      const response = await fetch("/api/admin/EmailSmtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "test-connection",
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConnectionStatus({
          status: "success",
          lastTested: new Date().toISOString(),
        });
        toast({
          title: "Connection Successful",
          description: "SMTP connection established successfully.",
        });
      } else {
        setConnectionStatus({
          status: "failed",
          lastTested: new Date().toISOString(),
        });
        toast({
          title: "Connection Failed",
          description: data.message || "SMTP connection failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus({
        status: "failed",
        lastTested: new Date().toISOString(),
      });
      toast({
        title: "Connection Failed",
        description: "Failed to test SMTP connection",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmailData.email || !testEmailData.message) {
      toast({
        title: "Missing Information",
        description: "Please enter test email and message.",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingTestEmail(true);

    try {
      const response = await fetch("/api/admin/EmailSmtp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "send-test-email",
          testEmail: testEmailData.email,
          message: testEmailData.message,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Test Email Sent",
          description: `Test email sent successfully to ${testEmailData.email}`,
        });
        setTestEmailData({
          email: "",
          message:
            "Greetings from Rayzor Industrial Packaging Pvt Ltd! This is a test email to verify our SMTP configuration is working correctly for sending notifications and updates.",
        });
      } else {
        toast({
          title: "Failed to Send",
          description: data.message || "Failed to send test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Failed to Send",
        description: "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SMTP Configuration */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#221E1F]">
            SMTP Email Configuration
          </h4>
          {connectionStatus.status !== "never" && (
            <div className="flex items-center space-x-2">
              {connectionStatus.status === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span
                className={`text-sm ${
                  connectionStatus.status === "success"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {connectionStatus.status === "success"
                  ? "Connected"
                  : "Connection Failed"}
              </span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="smtpHost" className="text-base font-semibold">
              SMTP Host *
            </Label>
            <Input
              id="smtpHost"
              value={emailSettings.smtpHost}
              onChange={(e) =>
                setEmailSettings({ ...emailSettings, smtpHost: e.target.value })
              }
              placeholder="smtp.gmail.com"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Common hosts: smtp.gmail.com, smtp.outlook.com
            </p>
          </div>
          <div>
            <Label htmlFor="smtpPort" className="text-base font-semibold">
              SMTP Port *
            </Label>
            <Input
              id="smtpPort"
              value={emailSettings.smtpPort}
              onChange={(e) =>
                setEmailSettings({ ...emailSettings, smtpPort: e.target.value })
              }
              placeholder="587"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Common ports: 587 (TLS), 465 (SSL)
            </p>
          </div>
          <div>
            <Label htmlFor="smtpUser" className="text-base font-semibold">
              SMTP Username *
            </Label>
            <Input
              id="smtpUser"
              type="email"
              value={emailSettings.smtpUser}
              onChange={(e) =>
                setEmailSettings({ ...emailSettings, smtpUser: e.target.value })
              }
              placeholder="your-email@gmail.com"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Usually your full email address
            </p>
          </div>
          <div>
            <Label htmlFor="smtpPassword" className="text-base font-semibold">
              SMTP Password *
            </Label>
            <Input
              id="smtpPassword"
              type="password"
              value={emailSettings.smtpPassword}
              onChange={(e) =>
                setEmailSettings({
                  ...emailSettings,
                  smtpPassword: e.target.value,
                })
              }
              placeholder="Your app password"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              For Gmail, use an App Password
            </p>
          </div>
          <div>
            <Label htmlFor="fromEmail" className="text-base font-semibold">
              From Email *
            </Label>
            <Input
              id="fromEmail"
              type="email"
              value={emailSettings.fromEmail}
              onChange={(e) =>
                setEmailSettings({
                  ...emailSettings,
                  fromEmail: e.target.value,
                })
              }
              placeholder="noreply@rayzorpack.com"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address that will appear as sender
            </p>
          </div>
          <div>
            <Label htmlFor="fromName" className="text-base font-semibold">
              From Name *
            </Label>
            <Input
              id="fromName"
              value={emailSettings.fromName}
              onChange={(e) =>
                setEmailSettings({ ...emailSettings, fromName: e.target.value })
              }
              placeholder="Rayzor Industrial Packaging Pvt Ltd"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Name that will appear as sender
            </p>
          </div>
        </div>

        {/* Connection Test */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <Button
              onClick={testEmailConnection}
              disabled={isTestingConnection || loading}
              variant="outline"
              className="border-[#221E1F] text-[#221E1F] hover:bg-[#221E1F] hover:text-white"
            >
              {isTestingConnection ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            {connectionStatus.lastTested && (
              <span className="text-sm text-gray-500">
                Last tested:{" "}
                {new Date(connectionStatus.lastTested).toLocaleString()}
              </span>
            )}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleEmailSave}
            disabled={loading}
            className="bg-[#221E1F] hover:bg-[#333] text-white"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Email Settings
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Test Email Section */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-[#221E1F]">
          Send Test Email
        </h4>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="testEmail" className="text-base font-semibold">
              Test Email Address *
            </Label>
            <Input
              id="testEmail"
              type="email"
              value={testEmailData.email}
              onChange={(e) =>
                setTestEmailData({ ...testEmailData, email: e.target.value })
              }
              placeholder="test@example.com"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address to send the test email to
            </p>
          </div>
          <div>
            <Label htmlFor="testMessage" className="text-base font-semibold">
              Test Message
            </Label>
            <Textarea
              id="testMessage"
              value={testEmailData.message}
              onChange={(e) =>
                setTestEmailData({ ...testEmailData, message: e.target.value })
              }
              className="mt-2"
              placeholder="Enter your test message here..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This message will be included in the test email
            </p>
          </div>
        </div>
        <div className="justify-center">
          <div className="flex items-end">
            <Button
              onClick={sendTestEmail}
              disabled={isSendingTestEmail || !testEmailData.email}
              className="bg-[#26A8E0] hover:bg-[#1a8abf] text-white w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSendingTestEmail ? "Sending..." : "Send Test Email"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
