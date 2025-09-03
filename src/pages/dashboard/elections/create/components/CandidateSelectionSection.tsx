import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
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

interface Candidate {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

interface CandidateSelectionSectionProps {
  control: Control<ElectionFormData>;
  candidates: Candidate[];
  isDisabled: boolean;
  onNavigateToCandidates: () => void;
}

export default function CandidateSelectionSection({ 
  control, 
  candidates, 
  isDisabled, 
  onNavigateToCandidates 
}: CandidateSelectionSectionProps) {
  return (
    <FormField
      control={control}
      name="candidate_ids"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-base font-medium flex items-center gap-2">
            <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4 text-blue-600" />
            Select Candidates *
          </FormLabel>
          <FormDescription>
            Choose candidates who will participate in this election
          </FormDescription>
          
          {candidates.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Icon icon="solar:user-plus-bold-duotone" className="w-8 h-8 text-muted-foreground" />
              </div>
              <h4 className="text-lg font-medium mb-2">No candidates available</h4>
              <p className="text-muted-foreground mb-4">Create candidates first to add them to elections</p>
              <Button
                type="button"
                onClick={onNavigateToCandidates}
              >
                <Icon icon="solar:user-plus-outline" className="w-4 h-4 mr-2" />
                Add Candidates
              </Button>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto border rounded-md p-4">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={candidate.id}
                    checked={field.value?.includes(candidate.id) || false}
                    disabled={isDisabled}
                    onCheckedChange={(checked) => {
                      const updatedIds = checked
                        ? [...(field.value || []), candidate.id]
                        : (field.value || []).filter(id => id !== candidate.id);
                      field.onChange(updatedIds);
                    }}
                  />
                  
                  <img
                    src={candidate.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                    alt={candidate.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={candidate.id}
                      className="block font-medium cursor-pointer"
                    >
                      {candidate.name}
                    </label>
                    {candidate.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {candidate.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {field.value && field.value.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {field.value.length} candidate{field.value.length !== 1 ? 's' : ''} selected
            </div>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}