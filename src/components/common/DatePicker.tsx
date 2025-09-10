import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

interface DatePickerProps {
	date?: Date;
	onDateChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	minDate?: Date;
	className?: string;
}

export function DatePicker({
	date,
	onDateChange,
	placeholder = "Pick a date",
	disabled = false,
	minDate,
	className,
}: DatePickerProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn("w-full justify-start text-left font-normal h-12", !date && "text-muted-foreground", className)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-3 h-4 w-4" />
					{date ? format(date, "PPP") : <span>{placeholder}</span>}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					selected={date}
					onSelect={onDateChange}
					disabled={minDate ? (date) => date < minDate : undefined}
					initialFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
