export function Badge({ children, className = "", variant = "default", ...props }) {
    const variantStyles = {
      default: "bg-primary text-primary-foreground hover:bg-primary/80",
      outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
    }
  
    const style = variantStyles[variant] || variantStyles.default
  
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${style} ${className}`}
        {...props}
      >
        {children}
      </span>
    )
  }
  
  