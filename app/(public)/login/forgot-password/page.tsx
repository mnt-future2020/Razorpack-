"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import axios from "axios"

export default function ForgotPassword() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  
  useEffect(() => {
    localStorage.removeItem("admin_token")
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter your email address.",
        duration: 3000,
      })
      return
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      toast({
        variant: "destructive",
        title: "Invalid Email Format",
        description: "Please enter a valid email address (e.g., user@example.com)",
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("/api/admin/auth/forgot-password", { email });
      
      if (response.data.success) {
        setEmail("");
        
        toast({
          variant: "default",
          title: "Reset Link Sent",
          description: "Password reset instructions have been sent to your email.",
          duration: 5000,
        });

        setTimeout(() => {
          toast({
            variant: "default",
            title: "Important",
            description: "The reset link will expire in 1 hour. Please check spam folder if not received.",
            duration: 6000,
          });
        }, 1000);
      }
    } catch (error: any) {
      let errorTitle = "Request Failed";
      let errorMessage;
      
      if (error.response?.status === 400) {
        errorTitle = "Invalid Email Format";
        errorMessage = "Please enter a valid email address.";
      } else if (error.response?.status === 401) {
        errorTitle = "Account Not Found";
        errorMessage = "The email address you entered is not registered as an admin account.";
      } else if (error.response?.status === 403) {
        errorTitle = "Account Inactive";
        errorMessage = "Your admin account is currently inactive. Please contact support.";
      } else if (error.response?.status === 500) {
        errorTitle = "Server Error";
        errorMessage = "Unable to process your request. Please try again later.";
      } else {
        errorMessage = "An unexpected error occurred. Please try again.";
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: error.response?.data?.error || errorMessage,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar /><section className="flex-1 flex items-center justify-center py-12 sm:py-16 bg-[#F5F5F5]">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>

            <h1 className="text-2xl font-bold text-center text-[#1E3A5F] mb-2">Forgot Password</h1>
            <p className="text-gray-600 text-center text-sm mb-8">
              Enter your email address and we'll send you a link to reset your password
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent outline-none transition-all disabled:opacity-50"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#8CC63F] text-white font-medium py-3 rounded hover:bg-[#7AB82F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center text-sm text-[#8CC63F] hover:underline"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section></main>
  )
}
