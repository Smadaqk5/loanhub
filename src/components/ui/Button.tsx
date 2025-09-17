import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95',
          {
            'btn-primary': variant === 'default',
            'bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-xl': variant === 'destructive',
            'border-2 border-lime-500 bg-white text-lime-600 hover:bg-lime-500 hover:text-white shadow-lg hover:shadow-xl': variant === 'outline',
            'bg-lime-100 text-lime-700 hover:bg-lime-200 shadow-lg hover:shadow-xl': variant === 'secondary',
            'hover:bg-lime-100 hover:text-lime-700': variant === 'ghost',
            'text-lime-600 underline-offset-4 hover:underline hover:text-lime-700': variant === 'link',
          },
          {
            'h-12 px-6 py-3': size === 'default',
            'h-9 rounded-lg px-4': size === 'sm',
            'h-14 rounded-xl px-10 text-base': size === 'lg',
            'h-12 w-12 rounded-xl': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
