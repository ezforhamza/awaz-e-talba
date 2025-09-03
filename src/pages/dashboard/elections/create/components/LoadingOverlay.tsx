interface LoadingOverlayProps {
  isVisible: boolean;
  isEditing: boolean;
}

export default function LoadingOverlay({ isVisible, isEditing }: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">
          {isEditing ? "Updating..." : "Creating..."}
        </p>
      </div>
    </div>
  );
}