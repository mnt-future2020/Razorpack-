"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, type Variants } from "motion/react"
import { ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react"
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
        localStorage.setItem("admin_token", response.data.token)
        toast({ title: "Success", description: "Login successful! Redirecting..." })
        setTimeout(() => router.push("/admin"), 500)
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Login failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  }

  return (
    <>
      <Toaster />
      <div className="flex min-h-screen w-full flex-col bg-white font-sans text-neutral-950 antialiased selection:bg-[var(--brand-blue)]/30 selection:text-neutral-900 lg:flex-row">
        {/* Left Image Panel */}
        <div className="relative flex w-full flex-col justify-end overflow-hidden p-8 md:p-12 lg:w-1/2 min-h-[40vh] lg:min-h-screen">
          <img
            src="/images/login_bg.png"
            alt="Abstract brand background"
            className="absolute inset-0 h-full w-full object-cover"
          />


          <div className="relative z-10 mt-12 lg:mt-0">
            <h1 className="mb-4 max-w-xl text-4xl font-medium leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Packaging Excellence
              <br />
              Since 2012.
            </h1>
            <p className="max-w-md text-base leading-relaxed text-white/90 sm:text-lg">
              Rayzorpack empowers businesses to scale and protect their products with high-quality packaging solutions.
            </p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex w-full flex-col items-center justify-center p-6 sm:p-12 lg:w-1/2">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-md md:max-w-lg xl:max-w-xl"
          >
            {/* Titles */}
            <motion.div variants={itemVariants} className="mb-6">
              <h2 className="mb-2 text-3xl font-medium tracking-tight text-neutral-900">
                Welcome Back
              </h2>
              <p className="text-[15px] text-neutral-500">
                Log in to access your admin dashboard
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-neutral-900">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-blue)]"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-neutral-900">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    required
                    disabled={isLoading}
                    className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[var(--brand-blue)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-blue)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </motion.div>

              {/* Checkbox */}
              <motion.div variants={itemVariants} className="mt-1 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-5 items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 rounded border-neutral-300 text-[var(--brand-blue)] focus:ring-[var(--brand-blue)]"
                    />
                  </div>
                  <label htmlFor="remember" className="text-sm text-neutral-600">
                    Remember me
                  </label>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div variants={itemVariants} className="mt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-lg flex items-center justify-center gap-2 bg-[var(--brand-blue)] py-3.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1a8abf] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Log In"}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  )
}
