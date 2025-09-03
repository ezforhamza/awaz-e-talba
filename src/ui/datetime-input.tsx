import * as React from "react"
import { cn } from "@/utils/index"

export interface DateTimeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
  ({ className, type = "datetime-local", ...props }, ref) => {
    return (
      <>
        <style jsx>{`
          input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
          }
          
          input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
            opacity: 1;
          }
          
          [data-theme-mode="dark"] input[type="datetime-local"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
          }
          
          [data-theme-mode="dark"] input[type="datetime-local"] {
            color-scheme: dark;
          }
          
          [data-theme-mode="light"] input[type="datetime-local"] {
            color-scheme: light;
          }
        `}</style>
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </>
    )
  }
)
DateTimeInput.displayName = "DateTimeInput"

export { DateTimeInput }