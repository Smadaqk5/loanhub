'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SkeletonLoaderProps {
  className?: string
  count?: number
}

export function SkeletonLoader({ className = '', count = 1 }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <SkeletonLoader className="h-6 w-3/4 mb-4" />
      <SkeletonLoader className="h-4 w-full mb-2" />
      <SkeletonLoader className="h-4 w-2/3 mb-4" />
      <SkeletonLoader className="h-10 w-1/3" />
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <SkeletonLoader className="h-8 w-1/4 mb-6" />
      <div className="space-y-4">
        <SkeletonLoader className="h-4 w-1/6" />
        <SkeletonLoader className="h-12 w-full" />
        <SkeletonLoader className="h-4 w-1/6" />
        <SkeletonLoader className="h-12 w-full" />
        <SkeletonLoader className="h-4 w-1/6" />
        <SkeletonLoader className="h-12 w-full" />
      </div>
      <SkeletonLoader className="h-12 w-1/3" />
    </div>
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonLoader className="h-12 w-full" />
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonLoader key={index} className="h-16 w-full" />
      ))}
    </div>
  )
}
