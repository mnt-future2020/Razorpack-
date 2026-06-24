"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("/api/admin/auth/login", {
        email: formData.email,
        password: formData.password,
      })

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("admin_token", response.data.token)
        
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        })

        // Redirect to admin dashboard
        setTimeout(() => {
          router.push("/admin")
        }, 500)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      
      const errorMessage = error.response?.data?.error || "Login failed. Please try again."
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Toaster />
      <main className="min-h-screen flex flex-col"><section className="flex-1 flex items-center justify-center py-12 sm:py-16 bg-[#fefaf6]">
        <div className="w-full max-w-md mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <span className="text-2xl font-bold">
                <span className="text-[#014a74]">blu</span>
                <span className="text-[#f58420]">facade</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-center text-[#014a74] mb-2">Welcome Back</h1>
            <p className="text-gray-600 text-center text-sm mb-8">Sign in to access your account</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#014a74] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#f58420] focus:border-transparent outline-none transition-all disabled:opacity-50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#014a74] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded focus:ring-2 focus:ring-[#f58420] focus:border-transparent outline-none transition-all disabled:opacity-50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#014a74] text-white font-medium py-3 rounded hover:bg-[#012d47] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link href="/" className="text-[#f58420] hover:underline">
                Back to Home
              </Link>
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            © {new Date().getFullYear()} Rayzor Industrial Packaging Pvt Ltd. All rights reserved.
          </p>
        </div>
      </section></main>
    </>
  )
}
