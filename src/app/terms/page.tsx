'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { FileText, Calendar, Shield, CreditCard } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <FileText className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Terms and Conditions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Please read these terms carefully before using our loan services.
          </p>
        </div>

        <Card className="loan-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-lime-600" />
              Last Updated: December 2024
            </CardTitle>
            <CardDescription>
              These terms govern your use of LoanHub Kenya's services
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing and using LoanHub Kenya's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Loan Services</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    LoanHub Kenya provides personal and business loan services to qualified applicants in Kenya. Our services include:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Personal loans from KES 1,000 to KES 100,000</li>
                    <li>Flexible repayment periods from 30 days to 365 days</li>
                    <li>Online loan application and management</li>
                    <li>Customer support and assistance</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility Requirements</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    To be eligible for our loan services, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Be a Kenyan citizen or legal resident</li>
                    <li>Be at least 18 years old</li>
                    <li>Have a valid National ID</li>
                    <li>Provide proof of income</li>
                    <li>Have a valid bank account</li>
                    <li>Meet our credit assessment criteria</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Interest Rates and Fees</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Our current rates and fees are as follows:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Interest Rate: 15% per annum</li>
                    <li>Processing Fee: 5% of loan amount (deducted upfront)</li>
                    <li>Late Payment Fee: KES 500 per occurrence</li>
                    <li>Extension Fee: 2% of outstanding amount</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    Rates and fees are subject to change with 30 days notice. Current rates will be clearly displayed during the application process.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Loan Application Process</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    The loan application process includes:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                    <li>Complete online application form</li>
                    <li>Submit required documents</li>
                    <li>Credit assessment and verification</li>
                    <li>Loan approval or rejection notification</li>
                    <li>Loan disbursement upon approval</li>
                  </ol>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Repayment Terms</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Borrowers are required to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Repay the full loan amount plus interest by the due date</li>
                    <li>Make payments through approved channels (M-Pesa, bank transfer)</li>
                    <li>Notify us immediately of any payment difficulties</li>
                    <li>Maintain current contact information</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
                <p className="text-gray-600 leading-relaxed">
                  We are committed to protecting your personal information in accordance with Kenyan data protection laws. Your information is used solely for loan processing and will not be shared with third parties without your consent, except as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed">
                  LoanHub Kenya shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed">
                  These terms shall be governed by and construed in accordance with the laws of Kenya. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Kenya.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
                <div className="bg-lime-50 border border-lime-200 p-6 rounded-lg">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    For questions about these terms and conditions, please contact us:
                  </p>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Email:</strong> legal@loanhubkenya.com</p>
                    <p><strong>Phone:</strong> +254 700 000 000</p>
                    <p><strong>Address:</strong> Nairobi, Kenya</p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
