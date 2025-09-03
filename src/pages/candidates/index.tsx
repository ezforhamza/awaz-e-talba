import { Icon } from "@/components/icon";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useCandidates } from "@/hooks/useCandidates";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";

export default function Candidates() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const { 
    candidates, 
    stats, 
    isLoading, 
    deleteCandidate,
    isDeleting 
  } = useCandidates();

  const filteredCandidates = candidates.filter(candidate => {
    return candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (candidate.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
  });


  const handleDeleteCandidate = (id: string, name: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Candidate",
      description: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteCandidate(id);
          toast.success("Candidate deleted successfully!");
        } catch (error: any) {
          toast.error(error.message || "Failed to delete candidate");
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Candidates Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage election candidates and their profiles
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => router.push("/candidates/create")}
        >
          <Icon icon="solar:user-plus-outline" className="w-4 h-4 mr-2" />
          Add Candidate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon icon="solar:users-group-rounded-outline" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon icon="solar:camera-outline" className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">With Photos</p>
                <p className="text-2xl font-bold">{stats?.withImages || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Icon icon="solar:document-text-outline" className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">With Descriptions</p>
                <p className="text-2xl font-bold">{stats?.withDescriptions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Candidates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <Card key={candidate.id} className="overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  <img
                    src={candidate.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${candidate.name}`}
                    alt={candidate.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {candidate.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Added {new Date(candidate.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => router.push(`/candidates/edit/${candidate.id}`)}
                        >
                          <Icon icon="solar:pen-outline" className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCandidate(candidate.id, candidate.name)}
                          disabled={isDeleting}
                        >
                          <Icon icon="solar:trash-bin-minimalistic-outline" className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCandidates.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:user-search-outline" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No candidates found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? "Try adjusting your search"
                  : "Get started by adding your first candidate"
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push("/candidates/create")}>
                  <Icon icon="solar:user-plus-outline" className="w-4 h-4 mr-2" />
                  Add Candidate
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>


      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant={confirmDialog.variant}
        isLoading={isDeleting}
        confirmText="Delete"
      />
    </div>
  );
}