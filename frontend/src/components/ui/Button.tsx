import React from 'react'
import type { ButtonHTMLAttributes, JSX } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

const variantClass: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'border hover:bg-gray-50',
  ghost: 'hover:bg-gray-100',
}

export function Button({ 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }): JSX.Element {
  const baseClasses = 'rounded-md px-3 py-2 text-sm'
  const finalClassName = className.includes('bg-') 
    ? className 
    : `${baseClasses} ${variantClass[variant]} ${className}`

  return (
    <button
      {...props}
      className={finalClassName}
    />
  )
}