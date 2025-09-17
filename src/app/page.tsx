'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  CreditCard, 
  Shield, 
  Clock, 
  CheckCircle, 
  Users, 
  TrendingUp,
  Smartphone,
  Globe
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Secure Loans for{' '}
              <span className="block gradient-text-animated">Kenya</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-lime-100 max-w-3xl mx-auto">
              Get the financial support you need with transparent terms and flexible repayment options. 
              Your dreams are just a loan away!
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-white text-lime-600 hover:bg-lime-100 text-lg px-8 py-4 shimmer-effect">
                  Apply for Loan
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-lime-600 text-lg px-8 py-4 glass-effect">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/20 rounded-full animate-pulse floating-animation"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-1000 floating-animation" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/15 rounded-full animate-pulse delay-500 floating-animation" style={{animationDelay: '1s'}}></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-white to-lime-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              Why Choose LoanHub Kenya?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide secure, transparent, and accessible loan services designed specifically for Kenyans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <div className="bg-lime-100 p-3 rounded-xl w-fit mb-4 group-hover:bg-lime-200 transition-colors duration-300 floating-animation">
                  <Shield className="h-12 w-12 text-lime-600" />
                </div>
                <CardTitle>Secure & Safe</CardTitle>
                <CardDescription>
                  Bank-level security with SSL encryption and secure data handling
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <div className="bg-emerald-100 p-3 rounded-xl w-fit mb-4 group-hover:bg-emerald-200 transition-colors duration-300 floating-animation" style={{animationDelay: '1s'}}>
                  <Clock className="h-12 w-12 text-emerald-600" />
                </div>
                <CardTitle>Quick Approval</CardTitle>
                <CardDescription>
                  Fast loan processing with same-day approval for qualified applicants
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <div className="bg-lime-100 p-3 rounded-xl w-fit mb-4 group-hover:bg-lime-200 transition-colors duration-300 floating-animation" style={{animationDelay: '2s'}}>
                  <CreditCard className="h-12 w-12 text-lime-600" />
                </div>
                <CardTitle>Flexible Repayment</CardTitle>
                <CardDescription>
                  Choose your repayment period from 30 days to 12 months
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <div className="bg-green-100 p-3 rounded-xl w-fit mb-4 group-hover:bg-green-200 transition-colors duration-300 floating-animation" style={{animationDelay: '3s'}}>
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <CardTitle>Transparent Terms</CardTitle>
                <CardDescription>
                  Clear loan terms with no hidden fees or charges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <div className="bg-orange-100 p-3 rounded-xl w-fit mb-4 group-hover:bg-orange-200 transition-colors duration-300 floating-animation" style={{animationDelay: '4s'}}>
                  <Smartphone className="h-12 w-12 text-orange-600" />
                </div>
                <CardTitle>Mobile Friendly</CardTitle>
                <CardDescription>
                  Access your account and manage loans from any device
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="loan-card enhanced-card group">
              <CardHeader>
                <div className="bg-teal-100 p-3 rounded-xl w-fit mb-4 group-hover:bg-teal-200 transition-colors duration-300 floating-animation" style={{animationDelay: '5s'}}>
                  <Globe className="h-12 w-12 text-teal-600" />
                </div>
                <CardTitle>Kenya Focused</CardTitle>
                <CardDescription>
                  Designed specifically for Kenyan borrowers with local support
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gradient-to-br from-lime-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your loan in 4 simple steps - it's that easy!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="hero-gradient text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gradient">Sign Up</h3>
              <p className="text-gray-600 leading-relaxed">
                Create your account and complete KYC verification in minutes
              </p>
            </div>

            <div className="text-center group">
              <div className="hero-gradient text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gradient">Apply</h3>
              <p className="text-gray-600 leading-relaxed">
                Fill out the loan application with your requirements and preferences
              </p>
            </div>

            <div className="text-center group">
              <div className="hero-gradient text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gradient">Get Approved</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team reviews and approves your application quickly
              </p>
            </div>

            <div className="text-center group">
              <div className="hero-gradient text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                4
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gradient">Receive Funds</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your loan disbursed directly to your account instantly
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">1000+</div>
              <div className="text-2xl text-lime-100 font-semibold">Loans Disbursed</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">KES 50M+</div>
              <div className="text-2xl text-lime-100 font-semibold">Total Value</div>
            </div>
            <div className="group">
              <div className="text-5xl md:text-6xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">98%</div>
              <div className="text-2xl text-lime-100 font-semibold">Customer Satisfaction</div>
            </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-white/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/15 rounded-full animate-pulse delay-1000"></div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-white to-lime-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join thousands of Kenyans who have trusted us with their financial needs. 
            Your journey to financial freedom starts here!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="btn-primary text-lg px-10 py-4 shimmer-effect">
                Apply Now
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button size="lg" variant="outline" className="btn-secondary text-lg px-10 py-4 glass-effect">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-lime-500 p-2 rounded-xl mr-3">
                  <CreditCard className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold">LoanHub Kenya</span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                Secure and transparent loan lending platform designed specifically for Kenya. 
                Your trusted financial partner.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-lime-400">Services</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Personal Loans</li>
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Business Loans</li>
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Emergency Loans</li>
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Loan Calculator</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-lime-400">Support</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Help Center</li>
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Contact Us</li>
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Terms of Service</li>
                <li className="hover:text-lime-400 transition-colors duration-300 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-6 text-lime-400">Contact</h3>
              <ul className="space-y-3 text-gray-300">
                <li>📧 support@loanhubkenya.com</li>
                <li>📞 +254 700 000 000</li>
                <li>📍 Nairobi, Kenya</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 LoanHub Kenya. All rights reserved. | Made with ❤️ for Kenya</p>
          </div>
        </div>
      </footer>
    </div>
  )
}