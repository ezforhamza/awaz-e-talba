import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";

interface DateTimePickerProps {
	date?: Date;
	onDateChange: (date: Date | undefined) => void;
	placeholder?: string;
	disabled?: boolean;
	minDate?: Date;
	className?: string;
}

export function DateTimePicker({
	date,
	onDateChange,
	placeholder = "Pick date and time",
	disabled = false,
	minDate,
	className,
}: DateTimePickerProps) {
	const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
	const [timeValue, setTimeValue] = useState<string>(date ? format(date, "HH:mm") : "09:00");

	const handleDateSelect = (newDate: Date | undefined) => {
		if (!newDate) {
			setSelectedDate(undefined);
			onDateChange(undefined);
			return;
		}

		// Combine the new date with the current time
		const [hours, minutes] = timeValue.split(":").map(Number);
		const combinedDateTime = new Date(newDate);
		combinedDateTime.setHours(hours, minutes, 0, 0);

		setSelectedDate(combinedDateTime);
		onDateChange(combinedDateTime);
	};

	const handleTimeChange = (newTime: string) => {
		setTimeValue(newTime);

		if (selectedDate) {
			const [hours, minutes] = newTime.split(":").map(Number);
			const newDateTime = new Date(selectedDate);
			newDateTime.setHours(hours, minutes, 0, 0);

			setSelectedDate(newDateTime);
			onDateChange(newDateTime);
		}
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className={cn("w-full justify-start text-left font-normal h-12", !date && "text-muted-foreground", className)}
					disabled={disabled}
				>
					<CalendarIcon className="mr-3 h-4 w-4" />
					{date ? (
						<div className="flex items-center gap-2">
							<span>{format(date, "PPP")}</span>
							<div className="flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs">
								<Clock className="h-3 w-3" />
								{format(date, "HH:mm")}
							</div>
						</div>
					) : (
						<span>{placeholder}</span>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<div className="flex">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleDateSelect}
						disabled={
							minDate
								? (date) => {
										const today = new Date();
										today.setHours(0, 0, 0, 0);
										const checkDate = new Date(date);
										checkDate.setHours(0, 0, 0, 0);
										return checkDate < today;
									}
								: undefined
						}
						initialFocus
					/>
					<div className="flex flex-col gap-2 p-4 border-l">
						<Label htmlFor="time" className="text-sm font-medium">
							Time
						</Label>
						<div className="flex items-center gap-2">
							<Clock className="h-4 w-4 text-muted-foreground" />
							<Input
								id="time"
								type="time"
								value={timeValue}
								onChange={(e) => handleTimeChange(e.target.value)}
								className="w-24 text-sm"
							/>
						</div>
						<div className="text-xs text-muted-foreground mt-2">
							<div>Selected:</div>
							<div className="font-medium">{selectedDate ? format(selectedDate, "PPP 'at' HH:mm") : "None"}</div>
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
