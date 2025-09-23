import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-12 w-full appearance-none rounded-xl border-2 border-lime-200 bg-white px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = 'Select'

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  error?: boolean
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex h-12 w-full items-center justify-between rounded-xl border-2 border-lime-200 bg-white px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectTrigger.displayName = 'SelectTrigger'

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ className, placeholder, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('text-gray-500', className)}
        {...props}
      >
        {placeholder}
      </span>
    )
  }
)
SelectValue.displayName = 'SelectValue'

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute top-full left-0 z-50 w-full mt-1 bg-white border-2 border-lime-200 rounded-xl shadow-lg max-h-60 overflow-auto',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'px-4 py-3 text-sm hover:bg-lime-50 cursor-pointer transition-colors duration-200',
          className
        )}
        data-value={value}
        {...props}
      >
        {children}
      </div>
    )
  }
)
SelectItem.displayName = 'SelectItem'

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
