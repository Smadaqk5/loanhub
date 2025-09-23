'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface SmoothLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function SmoothLink({ href, children, className = '', onClick }: SmoothLinkProps) {
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick?.()
    
    // Add smooth transition
    document.body.style.opacity = '0.8'
    document.body.style.transition = 'opacity 0.2s ease-in-out'
    
    setTimeout(() => {
      router.push(href)
      document.body.style.opacity = '1'
    }, 200)
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <Link href={href} onClick={handleClick} className={className}>
        {children}
      </Link>
    </motion.div>
  )
}

interface SmoothButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
}

export function SmoothButton({ 
  onClick, 
  children, 
  className = '', 
  disabled = false, 
  loading = false 
}: SmoothButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </motion.button>
  )
}
