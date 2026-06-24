"use client"

import { Suspense } from "react"
import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { Logo } from "@/components/logo"
import { useToast } from "@/hooks/use-toast"
import { Lock, Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import axios from "axios"

export const dynamic = 'force-dynamic'

function ResetPasswordForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Link",
        description: "No reset token found. Please request a new password reset link.",
        duration: 5000,
      })
    }
  }, [searchParams, toast])

  useEffect(() => {
    setPasswordStrength({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      lowercase: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    })
  }, [newPassword])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast({
        variant: "destructive",
        title: "Invalid Token",
        description: "Reset token is missing. Please request a new password reset link.",
        duration: 4000,
      })
      return
    }

    if (!newPassword || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please fill in all fields.",
        duration: 3000,
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords Don't Match",
        description: "Please make sure both passwords are identical.",
        duration: 3000,
      })
      return
    }

    const allRequirementsMet = Object.values(passwordStrength).every(Boolean)
    if (!allRequirementsMet) {
      toast({
        variant: "destructive",
        title: "Weak Password",
        description: "Please meet all password requirements.",
        duration: 4000,
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("/api/admin/auth/reset-password", {
        token,
        newPassword,
      })

      if (response.data.success) {
        toast({
          variant: "default",
          title: "Password Reset Successful",
          description: "Your password has been updated. Redirecting to login...",
          duration: 3000,
        })

        setTimeout(() => {
          router.push("/login")
        }, 2000)
      }
    } catch (error: any) {
      let errorTitle = "Reset Failed"
      let errorMessage = "An error occurred. Please try again."

      if (error.response?.status === 400) {
        errorTitle = "Invalid Request"
        errorMessage = error.response.data.error || "Invalid or expired reset token."
      }

      toast({
        variant: "destructive",
        title: errorTitle,
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-400" />
      )}
      <span className={met ? "text-green-600" : "text-gray-500"}>{text}</span>
    </div>
  )

  return (
    <section className="flex-1 flex items-center justify-center py-12 sm:py-16 bg-[#F5F5F5]">
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>

          <h1 className="text-2xl font-bold text-center text-[#1E3A5F] mb-2">Reset Password</h1>
          <p className="text-gray-600 text-center text-sm mb-8">
            Enter your new password below
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent outline-none transition-all disabled:opacity-50"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#8CC63F] focus:border-transparent outline-none transition-all disabled:opacity-50"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-[#1E3A5F] mb-2">Password Requirements:</p>
              <PasswordRequirement met={passwordStrength.length} text="At least 8 characters" />
              <PasswordRequirement met={passwordStrength.uppercase} text="One uppercase letter" />
              <PasswordRequirement met={passwordStrength.lowercase} text="One lowercase letter" />
              <PasswordRequirement met={passwordStrength.number} text="One number" />
              <PasswordRequirement met={passwordStrength.special} text="One special character" />
            </div>

            <button
              type="submit"
              disabled={isLoading || !token}
              className="w-full bg-[#8CC63F] text-white font-medium py-3 rounded hover:bg-[#7AB82F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-[#8CC63F] hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default function ResetPassword() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopBar /><Suspense fallback={
        <section className="flex-1 flex items-center justify-center py-12 sm:py-16 bg-[#F5F5F5]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8CC63F]"></div>
        </section>
      }>
        <ResetPasswordForm />
      </Suspense></main>
  )
}
