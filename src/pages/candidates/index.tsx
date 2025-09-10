import { useState } from "react";
import { CandidateList } from "@/components/candidates/CandidateList";
import { ElectionSelector } from "@/components/candidates/ElectionSelector";
import { CandidateForm } from "@/components/admin/CandidateForm";
import { useElections } from "@/hooks/elections";
import { useCandidates } from "@/hooks/candidates";
import { Users } from "lucide-react";

type ViewState = "list" | "create" | "edit";

interface SelectedCandidate {
	id: string;
	name: string;
	description?: string;
	position: number;
	profile_image_url?: string;
	election_symbol_url?: string;
}

export default function Candidates() {
	const [viewState, setViewState] = useState<ViewState>("list");
	const [selectedElectionId, setSelectedElectionId] = useState<string | null>(null);
	const [editingCandidate, setEditingCandidate] = useState<SelectedCandidate | null>(null);

	const { elections, isLoading: electionsLoading } = useElections();
	const {
		candidates,
		deleteCandidate,
		isLoading: candidatesLoading,
		isDeleting,
	} = useCandidates(selectedElectionId || undefined);

	const selectedElection = elections.find((e) => e.id === selectedElectionId);

	const handleElectionChange = (electionId: string | null) => {
		setSelectedElectionId(electionId);
		setViewState("list");
		setEditingCandidate(null);
	};

	const handleAddCandidate = () => {
		if (!selectedElectionId) return;
		setEditingCandidate(null);
		setViewState("create");
	};

	const handleEditCandidate = (candidate: any) => {
		setEditingCandidate(candidate);
		setViewState("edit");
	};

	const handleFormSuccess = () => {
		setViewState("list");
		setEditingCandidate(null);
	};

	const handleFormCancel = () => {
		setViewState("list");
		setEditingCandidate(null);
	};

	const handleDeleteCandidate = async (candidateId: string) => {
		await deleteCandidate(candidateId);
	};

	// Show form views
	if (viewState === "create" && selectedElectionId) {
		return <CandidateForm electionId={selectedElectionId} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />;
	}

	if (viewState === "edit" && selectedElectionId && editingCandidate) {
		return (
			<CandidateForm
				electionId={selectedElectionId}
				initialData={editingCandidate}
				onSuccess={handleFormSuccess}
				onCancel={handleFormCancel}
			/>
		);
	}

	// Main list view
	return (
		<div className="w-full p-6 space-y-6">
			<ElectionSelector
				elections={elections}
				selectedElectionId={selectedElectionId}
				onElectionChange={handleElectionChange}
				isLoading={electionsLoading}
			/>

			{selectedElectionId ? (
				<CandidateList
					candidates={candidates}
					onEdit={handleEditCandidate}
					onDelete={handleDeleteCandidate}
					onAdd={handleAddCandidate}
					isLoading={candidatesLoading}
					isDeleting={isDeleting}
					electionTitle={selectedElection?.title}
				/>
			) : (
				<div className="text-center py-16">
					<Users className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
					<p className="text-muted-foreground">Select an election above to manage its candidates</p>
				</div>
			)}
		</div>
	);
}
