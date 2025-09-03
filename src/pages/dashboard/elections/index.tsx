import { Icon } from "@/components/icon";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useElections } from "@/hooks/useElections";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Input } from "@/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/routes/hooks";

export default function Elections() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
    elections, 
    stats, 
    isLoading, 
    deleteElection,
    forceStartElection,
    stopElection,
    isDeleting,
    isStarting,
    isStopping,
    isElectionInPast,
    canStartElection,
    getElectionTimeStatus
  } = useElections();

  const filteredElections = elections.filter(election => {
    const matchesSearch = election.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (election.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === "all" || election.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  const handleStartElection = (id: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: "Start Election",
      description: `Are you sure you want to start "${title}"? This will make it available for voting.`,
      onConfirm: async () => {
        try {
          await forceStartElection(id);
          toast.success("Election started successfully!");
        } catch (error: any) {
          toast.error(error?.message || "Failed to start election");
        }
      }
    });
  };

  const handleStopElection = (id: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: "Stop Election",
      description: `Are you sure you want to stop "${title}"? This will end the voting process and mark it as completed.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await stopElection(id);
          toast.success("Election stopped successfully!");
        } catch (error) {
          toast.error("Failed to stop election");
        }
      }
    });
  };

  const handleDeleteElection = (id: string, title: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Election",
      description: `Are you sure you want to delete "${title}"? This action cannot be undone and all associated data will be permanently removed.`,
      variant: "destructive",
      onConfirm: async () => {
        try {
          await deleteElection(id);
          toast.success("Election deleted successfully!");
        } catch (error) {
          toast.error("Failed to delete election");
        }
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "active": return "default";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleShareVotingBooth = async (election: any) => {
    const votingUrl = `${window.location.origin}/vote?booth=${election.voting_booth_id}`
    
    try {
      await navigator.clipboard.writeText(votingUrl)
      toast.success("Voting booth URL copied to clipboard!")
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = votingUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      toast.success("Voting booth URL copied to clipboard!")
    }
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
          <h1 className="text-3xl font-bold">Elections Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage student elections
          </p>
        </div>
        <Button 
          className="w-full sm:w-auto"
          onClick={() => router.push("/elections/create")}
        >
          <Icon icon="solar:add-circle-outline" className="w-4 h-4 mr-2" />
          Create Election
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon icon="solar:document-text-outline" className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Elections</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Icon icon="solar:play-circle-outline" className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats?.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Icon icon="solar:file-text-outline" className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{stats?.draft || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon icon="solar:check-circle-outline" className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats?.completed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Elections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search elections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Elections List */}
          <div className="space-y-4">
            {filteredElections.map((election) => (
              <Card key={election.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{election.title}</h3>
                        <Badge variant={getStatusColor(election.status)}>
                          {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
                        </Badge>
                        {election.auto_start && (
                          <Badge variant="outline">Auto Start</Badge>
                        )}
                        {election.allow_multiple_votes && (
                          <Badge variant="outline">Multiple Votes</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{election.description}</p>
                      <div className="flex flex-col sm:flex-row gap-2 text-sm text-muted-foreground">
                        <span>
                          <Icon icon="solar:calendar-outline" className="w-4 h-4 inline mr-1" />
                          Start: {formatDate(election.start_date)}
                        </span>
                        <span>
                          <Icon icon="solar:calendar-outline" className="w-4 h-4 inline mr-1" />
                          End: {formatDate(election.end_date)}
                        </span>
                        {isElectionInPast(election) && (
                          <Badge variant="secondary" className="text-xs bg-gray-200">
                            <Icon icon="solar:history-outline" className="w-3 h-3 mr-1" />
                            Past Election
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/elections/view/${election.id}`)}
                      >
                        <Icon icon="solar:eye-outline" className="w-4 h-4 mr-2" />
                        View
                      </Button>

                      {election.status === "active" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShareVotingBooth(election)}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          <Icon icon="solar:share-outline" className="w-4 h-4 mr-2" />
                          Share Booth
                        </Button>
                      )}
                      
                      {(election.status === "draft" || election.status === "active") && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/elections/edit/${election.id}`)}
                        >
                          <Icon icon="solar:pen-outline" className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      )}

                      {election.status === "draft" && (
                        <>
                          {canStartElection(election) ? (
                            <Button 
                              size="sm"
                              onClick={() => handleStartElection(election.id, election.title)}
                              disabled={isStarting}
                            >
                              <Icon icon="solar:play-outline" className="w-4 h-4 mr-2" />
                              Start
                            </Button>
                          ) : isElectionInPast(election) ? (
                            <div className="flex flex-col items-start gap-1">
                              <Button 
                                size="sm"
                                disabled
                                variant="outline"
                                className="opacity-50"
                              >
                                <Icon icon="solar:history-outline" className="w-4 h-4 mr-2" />
                                Cannot Start
                              </Button>
                              <span className="text-xs text-muted-foreground">
                                This election has already ended
                              </span>
                            </div>
                          ) : null}
                        </>
                      )}

                      {election.status === "active" && (
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStopElection(election.id, election.title)}
                          disabled={isStopping}
                        >
                          <Icon icon="solar:stop-outline" className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                      )}

                      {(election.status === "draft" || election.status === "completed") && (
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteElection(election.id, election.title)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Icon icon="solar:trash-bin-minimalistic-outline" className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredElections.length === 0 && (
            <div className="text-center py-12">
              <Icon icon="solar:file-search-outline" className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No elections found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first election"
                }
              </p>
              {!searchTerm && statusFilter === "all" && (
                <Button onClick={() => router.push("/elections/create")}>
                  <Icon icon="solar:add-circle-outline" className="w-4 h-4 mr-2" />
                  Create Election
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
        isLoading={isStarting || isStopping || isDeleting}
        confirmText={
          confirmDialog.title.includes("Delete") ? "Delete" :
          confirmDialog.title.includes("Stop") ? "Stop" : "Start"
        }
      />
    </div>
  );
}
