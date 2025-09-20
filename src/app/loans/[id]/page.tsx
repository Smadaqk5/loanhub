import React from 'react'
import { LoanDetailClient } from './LoanDetailClient'

// Generate static params for static export
export async function generateStaticParams() {
  // For static export, we'll return an empty array
  // In a real app, you might want to pre-generate pages for common loan IDs
  return []
}

export default function LoanDetailPage() {
  return <LoanDetailClient />
}