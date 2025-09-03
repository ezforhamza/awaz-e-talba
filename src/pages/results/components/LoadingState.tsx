import { Icon } from "@/components/icon";
import { Card, CardContent } from "@/ui/card";

export function LoadingState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            Loading Results
          </h3>
          <p style={{ color: 'hsl(var(--muted-foreground))' }}>
            Fetching the latest voting data...
          </p>
        </div>
      </CardContent>
    </Card>
  );
}