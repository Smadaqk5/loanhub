'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  CreditCard,
  Clock,
  Shield,
  DollarSign,
  Users,
  FileText
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  icon: React.ComponentType<any>
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I apply for a loan?',
    answer: 'To apply for a loan, simply create an account, complete your profile verification, and fill out the loan application form. You can apply for loans ranging from KES 1,000 to KES 100,000 with flexible repayment periods.',
    category: 'Application',
    icon: CreditCard
  },
  {
    id: '2',
    question: 'How long does the approval process take?',
    answer: 'Most loan applications are reviewed and approved within 24 hours. You will receive an email notification once your application has been processed. In some cases, additional verification may be required.',
    category: 'Application',
    icon: Clock
  },
  {
    id: '3',
    question: 'What documents do I need to provide?',
    answer: 'You will need a valid National ID, proof of income (payslip or bank statement), and your bank account details. Additional documents may be requested based on your specific application.',
    category: 'Application',
    icon: FileText
  },
  {
    id: '4',
    question: 'What are the interest rates and fees?',
    answer: 'Our interest rate is 15% per annum with a 5% processing fee deducted upfront. The total cost of your loan will be clearly displayed before you submit your application.',
    category: 'Fees',
    icon: DollarSign
  },
  {
    id: '5',
    question: 'How do I make loan repayments?',
    answer: 'You can make repayments through M-Pesa, bank transfer, or set up automatic deductions from your bank account. All payment options are available in your dashboard.',
    category: 'Repayment',
    icon: CreditCard
  },
  {
    id: '6',
    question: 'Can I extend my loan repayment period?',
    answer: 'Yes, you can request a loan extension through your dashboard. Additional fees may apply for extended repayment periods. Contact our support team for assistance.',
    category: 'Repayment',
    icon: Clock
  },
  {
    id: '7',
    question: 'Is my personal information secure?',
    answer: 'Yes, we use bank-level security with SSL encryption to protect your personal and financial information. We are fully compliant with Kenyan data protection regulations.',
    category: 'Security',
    icon: Shield
  },
  {
    id: '8',
    question: 'What happens if I miss a payment?',
    answer: 'If you miss a payment, you will be charged a late fee. We recommend contacting our support team immediately to discuss payment arrangements and avoid additional charges.',
    category: 'Repayment',
    icon: Clock
  },
  {
    id: '9',
    question: 'Can I apply for multiple loans?',
    answer: 'You can apply for additional loans once your current loan is fully repaid or if you have a good repayment history. Each application is evaluated individually.',
    category: 'Application',
    icon: Users
  },
  {
    id: '10',
    question: 'How do I contact customer support?',
    answer: 'You can contact us via phone at +254 700 000 000, email at support@loanhubkenya.com, or through the contact form on our website. We respond within 24 hours.',
    category: 'Support',
    icon: HelpCircle
  }
]

const categories = ['All', 'Application', 'Fees', 'Repayment', 'Security', 'Support']

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const filteredFAQs = selectedCategory === 'All' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory)

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="bg-lime-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-10 w-10 text-lime-600" />
          </div>
          <h1 className="text-4xl font-bold text-gradient mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our loan services and application process.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category 
                    ? 'btn-primary' 
                    : 'bg-white text-gray-700 hover:bg-lime-50'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => {
            const isExpanded = expandedItems.includes(faq.id)
            const IconComponent = faq.icon

            return (
              <Card key={faq.id} className="loan-card">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(faq.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-lime-100 p-2 rounded-lg">
                        <IconComponent className="h-5 w-5 text-lime-600" />
                      </div>
                      <CardTitle className="text-lg">{faq.question}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-lime-100 text-lime-700 px-2 py-1 rounded-full">
                        {faq.category}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        {/* Contact Support Section */}
        <div className="mt-16">
          <Card className="loan-card bg-gradient-to-r from-lime-50 to-emerald-50 border-lime-200">
            <CardContent className="text-center py-12">
              <div className="bg-lime-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="h-8 w-8 text-lime-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Still have questions?</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-primary">
                  Contact Support
                </Button>
                <Button variant="outline" className="btn-secondary">
                  Call Us: +254 700 000 000
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
