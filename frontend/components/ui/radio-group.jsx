"use client"

import { createContext, useContext } from "react"

const RadioGroupContext = createContext({
  value: "",
  onValueChange: () => {},
  disabled: false,
})

export function RadioGroup({ value, onValueChange, disabled = false, children, className = "", ...props }) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
      <div className={`space-y-2 ${className}`} {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export function RadioGroupItem({ value, id, className = "", ...props }) {
  const { value: groupValue, onValueChange, disabled: groupDisabled } = useContext(RadioGroupContext)
  const checked = value === groupValue

  return (
    <span
      className={`aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background ${checked ? "bg-primary" : ""} ${className}`}
    >
      <input
        type="radio"
        id={id}
        value={value}
        checked={checked}
        disabled={groupDisabled}
        onChange={() => onValueChange(value)}
        className="sr-only"
        {...props}
      />
      {checked && (
        <span className="flex h-full w-full items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-white" />
        </span>
      )}
    </span>
  )
}

