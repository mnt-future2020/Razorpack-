"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  User,
  Search,
  Phone,
  LogOut,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Briefcase,
  Package,
  Heart,
  MessageSquare,
  ImageIcon,
  Globe,
  BarChart3,
} from "lucide-react"
import { Suspense } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Toaster } from "@/components/ui/toaster"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import axios from "axios"

interface AdminProfile {
  firstName: string
  lastName: string
  email: string
  avatar: string
  role: string
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarOpen')
      return saved !== null ? JSON.parse(saved) : true
    }
    return true
  })
  const [pageManagerOpen, setPageManagerOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => {
    setSidebarOpen((prev: boolean): boolean => {
      const newState: boolean = !prev
      localStorage.setItem('sidebarOpen', JSON.stringify(newState))
      return newState
    })
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem("admin_token")
      if (!token) return

      const response = await axios.get("/api/admin/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setAdminProfile(response.data.admin)
      }
    } catch (error) {
      console.error("Failed to fetch admin profile:", error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token")
      const publicPaths = ["/login", "/login/forgot-password", "/login/reset-password"]

      if (token) {
        setIsAuthenticated(true)
        await fetchAdminProfile()
      } else {
        setIsAuthenticated(false)
        if (!publicPaths.some(path => pathname.startsWith(path))) {
          router.push("/login")
        }
      }
      setIsLoading(false)
    }

    const timer = setTimeout(checkAuth, 100)
    return () => clearTimeout(timer)
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      await axios.post("/api/admin/auth/logout")
    } catch (error) {
      console.error("Logout error:", error)
    }
    localStorage.removeItem("admin_token")
    setIsAuthenticated(false)
    setUserDropdownOpen(false)
    router.push("/login")
  }

  const sidebarItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      color: "text-[#221E1F]",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      color: "text-[#26A8E0]",
    },
    {
      name: "SEO Manager",
      href: "/admin/seo",
      icon: <Search className="h-5 w-5" />,
      color: "text-[#26A8E0]",
    },
    {
      name: "Page Manager",
      icon: <Globe className="h-5 w-5" />,
      color: "text-[#221E1F]",
      isCollapsible: true,
      collapsibleKey: "pageManager",
      subItems: [
        { name: "Banner Manager", href: "/admin/banners", icon: <FileText className="h-4 w-4" /> },
        { name: "Contact Manager", href: "/admin/contact", icon: <Phone className="h-4 w-4" /> },
        { name: "Products", href: "/admin/products", icon: <Package className="h-4 w-4" /> },
        { name: "Services", href: "/admin/services", icon: <Briefcase className="h-4 w-4" /> },
        { name: "Gallery", href: "/admin/gallery", icon: <ImageIcon className="h-4 w-4" /> },
        // { name: "Client Logos", href: "/admin/client-logos", icon: <Users className="h-4 w-4" /> },
      ],
    },
    {
      name: "Lead Manager",
      href: "/admin/leads",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-[#26A8E0]",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      color: "text-[#221E1F]",
    },
    {
      name: "Profile",
      href: "/admin/profile",
      icon: <User className="h-5 w-5" />,
      color: "text-[#26A8E0]",
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="text-center">
          <div className="mb-4">
            <Logo />
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#221E1F] mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const publicPaths = ["/login", "/login/forgot-password", "/login/reset-password"]

  if (!isAuthenticated && !publicPaths.some(path => pathname.startsWith(path))) {
    return null
  }

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return children
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#221E1F]"></div></div>}>
      <Toaster />
      <div className="min-h-screen bg-[#F5F5F5] flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-all duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } border-r border-gray-200 flex flex-col h-screen overflow-hidden`}
        >
          <div className="flex items-center justify-start h-16 px-6 border-b border-gray-200 shrink-0">
            <Logo />
          </div>

          <nav className="flex-1 px-4 py-6 overflow-y-auto">
            <div className="space-y-1">
              {sidebarItems.map((item) => {
                if (item.isCollapsible) {
                  const isOpen = pageManagerOpen
                  const setIsOpen = setPageManagerOpen
                  
                  return (
                    <Collapsible key={item.name} open={isOpen} onOpenChange={setIsOpen}>
                      <CollapsibleTrigger asChild>
                        <button
                          className={`flex items-center justify-between w-full px-4 py-3 text-[#221E1F] hover:bg-[#EBF7FC] transition-all duration-200 rounded-lg group ${
                            isOpen ? "bg-[#EBF7FC]" : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`${item.color} group-hover:scale-110 transition-transform duration-200`}>
                              {item.icon}
                            </div>
                            <span className="ml-3 font-medium">{item.name}</span>
                          </div>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1 mt-1">
                        {item.subItems?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={`flex items-center px-4 py-2 ml-6 text-[#221E1F] hover:bg-[#EBF7FC] transition-all duration-200 rounded-lg text-sm ${
                              pathname === subItem.href ? "bg-[#EBF7FC] text-[#26A8E0] border-r-2 border-[#26A8E0]" : ""
                            }`}
                            onClick={() => {
                              if (window.innerWidth < 1024) {
                                setSidebarOpen(false)
                              }
                            }}
                          >
                            <div className="text-gray-500 mr-3">{subItem.icon}</div>
                            <span className="font-medium">{subItem.name}</span>
                          </Link>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className={`flex items-center px-4 py-3 text-[#221E1F] hover:bg-[#EBF7FC] transition-all duration-200 rounded-lg group ${
                      pathname === item.href ? "bg-[#EBF7FC] text-[#26A8E0] border-r-2 border-[#26A8E0]" : ""
                    }`}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false)
                      }
                    }}
                  >
                    <div className={`${item.color} group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </div>
                    <span className="ml-3 font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-gray-200 shrink-0">
            <div className="flex items-center mb-4 p-3 bg-[#EBF7FC] rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={adminProfile?.avatar || ""} alt="Admin" />
                <AvatarFallback className="bg-[#221E1F] text-white font-semibold text-sm">
                  {adminProfile ? `${adminProfile.firstName.charAt(0)}${adminProfile.lastName.charAt(0)}` : 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <div className="font-semibold text-[#221E1F] text-sm">
                  {adminProfile ? `${adminProfile.firstName} ${adminProfile.lastName}` : 'Admin User'}
                </div>
                <div className="text-xs text-gray-500">{adminProfile?.role || 'Administrator'}</div>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        }`}>
          <div className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
            <div className="flex items-center">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 mr-4"
                onClick={toggleSidebar}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeft className="h-5 w-5" />
                )}
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#221E1F]">
                  {pathname === "/admin" ? "Dashboard" : pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || "Admin Panel"}
                </h1>
                <p className="text-sm text-gray-500">Manage your packaging solutions</p>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={adminProfile?.avatar || ""} alt="Admin" />
                  <AvatarFallback className="bg-[#221E1F] text-white text-sm font-semibold">
                    {adminProfile ? `${adminProfile.firstName.charAt(0)}${adminProfile.lastName.charAt(0)}` : 'A'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown 
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    userDropdownOpen ? "rotate-180" : ""
                  }`} 
                />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <Link
                      href="/admin/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      <User className="h-4 w-4 mr-3 text-[#221E1F]" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </Suspense>
  )
}
