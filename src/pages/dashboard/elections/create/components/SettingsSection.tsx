import { Icon } from "@/components/icon";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/ui/form";
import { Switch } from "@/ui/switch";
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

interface SettingsSectionProps {
  control: Control<ElectionFormData>;
  isDisabled: boolean;
}

export default function SettingsSection({ control, isDisabled }: SettingsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={control}
        name="allow_multiple_votes"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <FormLabel className="text-base font-medium cursor-pointer">
                  Allow Multiple Votes
                </FormLabel>
                <FormDescription>
                  Students can vote for multiple candidates
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="auto_start"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="space-y-1">
                <FormLabel className="text-base font-medium cursor-pointer">
                  Auto Start
                </FormLabel>
                <FormDescription>
                  Automatically start at scheduled time
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isDisabled}
                />
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}