import * as React from "react"
import { cn } from "@/lib/utils"

interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  leftLabel: string
  rightLabel: string
  className?: string
}

export function Toggle({ checked, onCheckedChange, leftLabel, rightLabel, className }: ToggleProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className={cn(
        "font-medium transition-colors duration-200",
        !checked ? "text-purple-600" : "text-gray-500"
      )}>
        {leftLabel}
      </span>
      
      <button
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
          checked ? "bg-gradient-to-r from-purple-600 to-blue-500" : "bg-gray-200"
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
      
      <span className={cn(
        "font-medium transition-colors duration-200",
        checked ? "text-purple-600" : "text-gray-500"
      )}>
        {rightLabel}
      </span>
    </div>
  )
}