import { Icon } from "@/components/icon";
import { Button } from "@/ui/button";

interface FormHeaderProps {
  isEditing: boolean;
  onBack: () => void;
}

export default function FormHeader({ isEditing, onBack }: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Election" : "Create New Election"}
        </h1>
        <p className="text-muted-foreground">
          {isEditing ? "Update election details and settings" : "Set up a new election for student voting"}
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <Icon icon="solar:arrow-left-outline" className="w-4 h-4" />
        Back
      </Button>
    </div>
  );
}