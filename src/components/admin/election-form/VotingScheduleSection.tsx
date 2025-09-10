import { UseFormSetValue } from "react-hook-form";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { DateTimePicker } from "@/components/common/DateTimePicker";
import { Calendar, Play, Zap } from "lucide-react";

interface ElectionFormData {
	title: string;
	description?: string;
	category: string;
	start_date: string;
	end_date: string;
	voting_instructions?: string;
	auto_start: boolean;
	auto_end: boolean;
}

interface VotingScheduleSectionProps {
	startDateTime: Date | undefined;
	endDateTime: Date | undefined;
	setStartDateTime: (date: Date | undefined) => void;
	setEndDateTime: (date: Date | undefined) => void;
	startNow: boolean;
	setStartNow: (startNow: boolean) => void;
	autoStart: boolean;
	autoEnd: boolean;
	setValue: UseFormSetValue<ElectionFormData>;
	isLoading: boolean;
	isEditing: boolean;
}

export function VotingScheduleSection({
	startDateTime,
	endDateTime,
	setStartDateTime,
	setEndDateTime,
	startNow,
	setStartNow,
	autoStart,
	autoEnd,
	setValue,
	isLoading,
	isEditing,
}: VotingScheduleSectionProps) {
	const today = new Date();

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 mb-4">
				<Calendar className="h-5 w-5 text-primary" />
				<h3 className="text-lg font-semibold">Voting Schedule</h3>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				<div className="space-y-3">
					<Label className="text-base font-medium">Start Date & Time *</Label>

					{/* Start Now Toggle */}
					<div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
						<div className="space-y-1">
							<Label className="text-sm font-medium text-green-800">Start Election Now</Label>
							<p className="text-xs text-green-600">Begin voting immediately after creation</p>
						</div>
						<Switch checked={startNow} onCheckedChange={setStartNow} disabled={isLoading || isEditing} />
					</div>

					{!startNow && (
						<DateTimePicker
							date={startDateTime}
							onDateChange={setStartDateTime}
							placeholder="Select start date and time"
							minDate={today}
							disabled={isLoading}
						/>
					)}

					{startNow && (
						<div className="p-3 bg-green-100 rounded-lg border border-green-200">
							<div className="flex items-center gap-2 text-green-800">
								<Play className="w-4 h-4" />
								<span className="text-sm font-medium">Election will start immediately</span>
							</div>
							<p className="text-xs text-green-600 mt-1">Start time: {new Date().toLocaleString()}</p>
						</div>
					)}

					{!startDateTime && !startNow && (
						<p className="text-sm text-destructive mt-1">Start date and time is required</p>
					)}
				</div>

				<div className="space-y-3">
					<Label className="text-base font-medium">End Date & Time *</Label>
					<DateTimePicker
						date={endDateTime}
						onDateChange={setEndDateTime}
						placeholder="Select end date and time"
						minDate={startNow ? new Date() : startDateTime || today}
						disabled={isLoading}
					/>
					{!endDateTime && <p className="text-sm text-destructive mt-1">End date and time is required</p>}
					{endDateTime && (startDateTime || startNow) && endDateTime <= (startNow ? new Date() : startDateTime!) && (
						<p className="text-sm text-destructive mt-1">End date must be after start date</p>
					)}
				</div>
			</div>

			{/* Duration Preview */}
			{((startDateTime && endDateTime && endDateTime > startDateTime) ||
				(startNow && endDateTime && endDateTime > new Date())) && (
				<div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
					<p className="text-sm text-blue-800">
						🗳️ Voting will be open for{" "}
						<strong>
							{startNow
								? Math.ceil((endDateTime.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
								: Math.ceil((endDateTime.getTime() - startDateTime!.getTime()) / (1000 * 60 * 60 * 24))}{" "}
							days
						</strong>{" "}
						from {startNow ? "now" : `${startDateTime!.toLocaleDateString()} at ${startDateTime!.toLocaleTimeString()}`}{" "}
						to {endDateTime.toLocaleDateString()} at {endDateTime.toLocaleTimeString()}
					</p>
				</div>
			)}

			{/* Auto Start/End Controls */}
			<div className="space-y-4">
				<div className="flex items-center gap-2 mb-3">
					<Zap className="h-5 w-5 text-primary" />
					<h4 className="text-base font-semibold">Automation Settings</h4>
				</div>

				<div className="grid gap-4 md:grid-cols-2">
					<div className="flex items-center justify-between p-4 border rounded-lg">
						<div className="space-y-1">
							<Label className="text-sm font-medium">Auto Start Election</Label>
							<p className="text-xs text-muted-foreground">Automatically activate election at start time</p>
						</div>
						<Switch
							checked={autoStart}
							onCheckedChange={(checked) => setValue("auto_start", checked)}
							disabled={isLoading}
						/>
					</div>

					<div className="flex items-center justify-between p-4 border rounded-lg">
						<div className="space-y-1">
							<Label className="text-sm font-medium">Auto End Election</Label>
							<p className="text-xs text-muted-foreground">Automatically complete election at end time</p>
						</div>
						<Switch
							checked={autoEnd}
							onCheckedChange={(checked) => setValue("auto_end", checked)}
							disabled={isLoading}
						/>
					</div>
				</div>

				{(autoStart || autoEnd) && (
					<div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
						<p className="text-sm text-amber-800">
							⚡ <strong>Automation Enabled:</strong> Election will be {autoStart ? "automatically started" : ""}
							{autoStart && autoEnd ? " and " : ""}
							{autoEnd ? "automatically ended" : ""} at the scheduled times.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
