'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle } from 'lucide-react'

interface ProgressStep {
  id: string
  title: string
  description?: string
  completed: boolean
  current: boolean
}

interface ProgressIndicatorProps {
  steps: ProgressStep[]
  className?: string
}

export function ProgressIndicator({ steps, className = '' }: ProgressIndicatorProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step.completed
                    ? 'bg-lime-600 border-lime-600 text-white'
                    : step.current
                    ? 'bg-lime-100 border-lime-600 text-lime-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </motion.div>
              <div className="mt-2 text-center">
                <p className={`text-sm font-medium ${
                  step.completed || step.current ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                step.completed ? 'bg-lime-600' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function LoanProgressSteps({ currentStep }: { currentStep: string }) {
  const steps: ProgressStep[] = [
    {
      id: 'application',
      title: 'Application',
      description: 'Fill loan details',
      completed: ['payment', 'processing', 'approved', 'disbursed'].includes(currentStep),
      current: currentStep === 'application'
    },
    {
      id: 'payment',
      title: 'Payment',
      description: 'Pay processing fee',
      completed: ['processing', 'approved', 'disbursed'].includes(currentStep),
      current: currentStep === 'payment'
    },
    {
      id: 'processing',
      title: 'Processing',
      description: 'Under review',
      completed: ['approved', 'disbursed'].includes(currentStep),
      current: currentStep === 'processing'
    },
    {
      id: 'approved',
      title: 'Approved',
      description: 'Loan approved',
      completed: ['disbursed'].includes(currentStep),
      current: currentStep === 'approved'
    },
    {
      id: 'disbursed',
      title: 'Disbursed',
      description: 'Funds released',
      completed: currentStep === 'disbursed',
      current: currentStep === 'disbursed'
    }
  ]

  return <ProgressIndicator steps={steps} />
}
