"use client"

export function Button({ children, className = "", variant = "default", disabled, onClick, ...props }) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  }

  const variantStyle = variants[variant] || variants.default

  return (
    <button className={`${baseStyles} ${variantStyle} ${className}`} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}

