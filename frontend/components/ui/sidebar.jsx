"use client"

import { createContext, useContext, useState } from "react"
import { Separator } from "@/components/ui/separator"

const SidebarContext = createContext({
  collapsed: false,
  setCollapsed: () => {},
})

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="flex min-h-screen">{children}</div>
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children, className = "", ...props }) {
  const { collapsed } = useContext(SidebarContext)

  return (
    <div
      className={`flex flex-col border-r bg-background ${collapsed ? "w-16" : "w-64"} transition-all ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function SidebarHeader({ children, className = "", ...props }) {
  return (
    <div className={`flex h-14 items-center border-b px-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarContent({ children, className = "", ...props }) {
  return (
    <div className={`flex-1 overflow-auto py-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarFooter({ children, className = "", ...props }) {
  return (
    <div className={`border-t px-4 py-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarTrigger({ className = "", ...props }) {
  const { collapsed, setCollapsed } = useContext(SidebarContext)

  return (
    <button
      className={`inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      onClick={() => setCollapsed(!collapsed)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    </button>
  )
}

export function SidebarInset({ children, className = "", ...props }) {
  return (
    <div className={`flex flex-1 flex-col overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenu({ children, className = "", ...props }) {
  return (
    <nav className={`space-y-1 ${className}`} {...props}>
      {children}
    </nav>
  )
}

export function SidebarMenuItem({ children, className = "", ...props }) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarMenuButton({ children, className = "", isActive = false, asChild = false, ...props }) {
  const Component = asChild ? "a" : "button"

  return (
    <Component
      className={`flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      } ${className}`}
      {...props}
    >
      {children}
    </Component>
  )
}

export function SidebarGroup({ children, className = "", ...props }) {
  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupLabel({ children, className = "", ...props }) {
  return (
    <div className={`px-3 py-2 text-sm font-semibold ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarGroupContent({ children, className = "", ...props }) {
  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarRail() {
  const { collapsed, setCollapsed } = useContext(SidebarContext)

  const handleMouseMove = (e) => {
    // You can implement the logic to update the sidebar width here
    // based on the mouse movement. For example:
    // const newWidth = e.clientX;
    // setSidebarWidth(newWidth); // Assuming you have a state for sidebar width
  }

  const handleMouseUp = () => {
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  return (
    <div
      className="absolute right-0 top-0 h-full w-1 cursor-ew-resize bg-transparent transition-colors hover:bg-border"
      onMouseDown={(e) => {
        e.preventDefault()
        document.addEventListener("mousemove", handleMouseMove)
        document.addEventListener("mouseup", handleMouseUp)
      }}
    />
  )
}

export function SidebarSeparator({ className = "", ...props }) {
  return <Separator className={`my-2 ${className}`} {...props} />
}

