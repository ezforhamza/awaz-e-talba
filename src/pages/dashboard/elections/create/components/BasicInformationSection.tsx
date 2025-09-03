import { Icon } from "@/components/icon";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
import { Input } from "@/ui/input";
import { Textarea } from "@/ui/textarea";
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

interface BasicInformationSectionProps {
  control: Control<ElectionFormData>;
  isDisabled: boolean;
}

export default function BasicInformationSection({ control, isDisabled }: BasicInformationSectionProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="title"
        rules={{ required: "Election title is required" }}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium">
              Election Title *
            </FormLabel>
            <FormControl>
              <Input
                placeholder="e.g., Student Council President Election 2024"
                disabled={isDisabled}
                className="h-11"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel className="text-base font-medium">
              Description
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Brief description of the election and its purpose..."
                className="min-h-[100px] resize-none"
                disabled={isDisabled}
                {...field}
              />
            </FormControl>
            <FormDescription>
              This description will be shown to voters on the voting booth
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}