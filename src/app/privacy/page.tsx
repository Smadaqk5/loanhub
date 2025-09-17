'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Shield, Calendar, Eye, Lock, Database, UserCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>

        <Card className="loan-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-lime-600" />
              Last Updated: December 2024
            </CardTitle>
            <CardDescription>
              This privacy policy explains how LoanHub Kenya handles your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We collect information you provide directly to us, such as when you create an account, apply for a loan, or contact us for support.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                      <UserCheck className="h-5 w-5 mr-2" />
                      Personal Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-blue-800">
                      <li>Full name and contact information</li>
                      <li>National ID number and KRA PIN</li>
                      <li>Phone number and email address</li>
                      <li>Bank account details</li>
                      <li>Employment and income information</li>
                      <li>Loan application details</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <Database className="h-5 w-5 mr-2" />
                      Technical Information
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-green-800">
                      <li>IP address and device information</li>
                      <li>Browser type and version</li>
                      <li>Pages visited and time spent on site</li>
                      <li>Cookies and similar technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We use the information we collect to provide, maintain, and improve our services:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>Process and evaluate loan applications</li>
                    <li>Verify your identity and creditworthiness</li>
                    <li>Communicate with you about your account and loans</li>
                    <li>Provide customer support</li>
                    <li>Comply with legal and regulatory requirements</li>
                    <li>Improve our website and services</li>
                    <li>Send important updates and notifications</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">When We Share Information</h3>
                    <ul className="list-disc list-inside space-y-2 text-yellow-800">
                      <li><strong>With your consent:</strong> When you explicitly authorize us to share your information</li>
                      <li><strong>Service providers:</strong> With trusted third parties who help us operate our business</li>
                      <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                      <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We implement appropriate security measures to protect your personal information:
                  </p>
                  
                  <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                      <Lock className="h-5 w-5 mr-2" />
                      Security Measures
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-red-800">
                      <li>SSL encryption for data transmission</li>
                      <li>Secure servers and databases</li>
                      <li>Regular security audits and updates</li>
                      <li>Access controls and authentication</li>
                      <li>Employee training on data protection</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    Under Kenyan data protection laws, you have the following rights:
                  </p>
                  
                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                      <Eye className="h-5 w-5 mr-2" />
                      Your Data Rights
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-purple-800">
                      <li><strong>Access:</strong> Request a copy of your personal information</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                      <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                      <li><strong>Objection:</strong> Object to processing of your information</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
                <div className="space-y-4">
                  <p className="text-gray-600 leading-relaxed">
                    We use cookies and similar technologies to enhance your experience on our website:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>Essential cookies:</strong> Required for basic website functionality</li>
                    <li><strong>Analytics cookies:</strong> Help us understand how you use our website</li>
                    <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
                  </ul>
                  <p className="text-gray-600 leading-relaxed">
                    You can control cookie settings through your browser preferences.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Loan records are typically retained for 7 years after loan completion, as required by Kenyan banking regulations.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                <div className="bg-lime-50 border border-lime-200 p-6 rounded-lg">
                  <p className="text-gray-600 leading-relaxed mb-4">
                    If you have any questions about this privacy policy or our data practices, please contact us:
                  </p>
                  <div className="space-y-2 text-gray-600">
                    <p><strong>Data Protection Officer:</strong> privacy@loanhubkenya.com</p>
                    <p><strong>General Inquiries:</strong> support@loanhubkenya.com</p>
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
