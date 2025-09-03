import { Icon } from "@/components/icon";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { DateTimeInput } from "@/ui/datetime-input";
import { Control } from "react-hook-form";

interface ElectionFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  allow_multiple_votes: boolean;
  auto_start: boolean;
  candidate_ids: string[];
}

interface ScheduleSectionProps {
  control: Control<ElectionFormData>;
  isDisabled: boolean;
}

export default function ScheduleSection({ control, isDisabled }: ScheduleSectionProps) {
  return (
    <div className="space-y-6">
      {/* Timezone info */}
      <div className="text-sm text-muted-foreground">
        Times are in your local timezone: <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
      </div>
      
      {/* Date Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="start_date"
          rules={{ required: "Start date is required" }}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                <Icon icon="solar:play-circle-bold" className="w-4 h-4 text-green-600" />
                Start Date & Time *
              </FormLabel>
              <FormControl>
                <DateTimeInput
                  disabled={isDisabled}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                When voting will begin
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="end_date"
          rules={{ required: "End date is required" }}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-base font-medium flex items-center gap-2">
                <Icon icon="solar:stop-circle-bold" className="w-4 h-4 text-red-600" />
                End Date & Time *
              </FormLabel>
              <FormControl>
                <DateTimeInput
                  disabled={isDisabled}
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                When voting will end
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}