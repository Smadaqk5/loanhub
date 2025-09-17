'use client'

import React from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { 
  Home, 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Users,
  BarChart3,
  FileText
} from 'lucide-react'
import { useState } from 'react'

export function Navigation() {
  const { user, signOut, isAdmin } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userNavItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/loans', label: 'My Loans', icon: CreditCard },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const adminNavItems = [
    { href: '/admin', label: 'Admin Dashboard', icon: BarChart3 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/loans', label: 'Loans', icon: CreditCard },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
    { href: '/admin/reports', label: 'Reports', icon: FileText },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="nav-gradient shadow-2xl border-b-4 border-lime-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center group">
              <div className="bg-white p-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
                <CreditCard className="h-8 w-8 text-lime-600" />
              </div>
              <span className="ml-3 text-2xl font-bold text-white group-hover:text-lime-100 transition-colors duration-300">
                LoanHub Kenya
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                {isAdmin ? (
                  adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white hover:text-lime-100 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  ))
                ) : (
                  userNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-white hover:text-lime-100 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  ))
                )}
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="flex items-center bg-white/20 border-white/30 text-white hover:bg-white hover:text-lime-600 transition-all duration-300 hover:scale-105"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white hover:text-lime-600 transition-all duration-300 hover:scale-105">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-white text-lime-600 hover:bg-lime-100 hover:scale-105 transition-all duration-300">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/95 backdrop-blur-sm border-t-2 border-lime-200">
            {user ? (
              <>
                {isAdmin ? (
                  adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-xl text-base font-semibold text-lime-700 hover:text-lime-600 hover:bg-lime-100 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  ))
                ) : (
                  userNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center px-3 py-2 rounded-xl text-base font-semibold text-lime-700 hover:text-lime-600 hover:bg-lime-100 transition-all duration-300"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  ))
                )}
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center mt-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
