import { useState } from "react";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Alert, AlertDescription } from "@/ui/alert";
import { CheckCircle, Users, ArrowRight, ArrowLeft, Info, Loader2 } from "lucide-react";

interface Student {
	name: string;
	voting_id: string;
}

interface Election {
	id: string;
	title: string;
	category: string;
	description?: string;
}

interface Candidate {
	id: string;
	name: string;
	description?: string;
	profile_image_url?: string;
}

interface CandidateSelectionStepProps {
	student: Student;
	election: Election;
	candidates: Candidate[];
	onVote: (candidateId: string) => void;
	onBack: () => void;
	isSubmitting: boolean;
}

export function CandidateSelectionStep({
	student,
	election,
	candidates,
	onVote,
	onBack,
	isSubmitting,
}: CandidateSelectionStepProps) {
	const [selectedCandidate, setSelectedCandidate] = useState<string>("");
	const [showConfirmation, setShowConfirmation] = useState(false);

	const handleProceedToConfirm = () => {
		if (selectedCandidate) {
			setShowConfirmation(true);
		}
	};

	const handleConfirmVote = () => {
		onVote(selectedCandidate);
	};

	const handleBackToSelection = () => {
		setShowConfirmation(false);
	};

	const selectedCandidateData = candidates.find((c) => c.id === selectedCandidate);

	// Confirmation Modal
	if (showConfirmation) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-6">
				<Card className="w-full max-w-lg shadow-2xl bg-card/95 backdrop-blur-sm">
					<CardHeader className="text-center pb-6">
						<div className="flex justify-center mb-6">
							<div className="p-4 bg-primary/10 rounded-full shadow-lg">
								{isSubmitting ? (
									<Loader2 className="w-12 h-12 text-primary animate-spin" />
								) : (
									<CheckCircle className="w-12 h-12 text-primary" />
								)}
							</div>
						</div>
						<CardTitle className="text-3xl font-bold text-foreground">Confirm Your Vote</CardTitle>
						<p className="text-muted-foreground text-base mt-2">Please review your selection for {election.title}</p>
					</CardHeader>

					<CardContent className="space-y-6">
						{/* Selected Candidate Display */}
						<div className="p-6 border-2 border-primary/20 rounded-xl bg-primary/5">
							<div className="flex items-center gap-6">
								<Avatar className="h-20 w-20 border-4 border-background shadow-lg">
									<AvatarImage src={selectedCandidateData?.profile_image_url || ""} />
									<AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
										{selectedCandidateData?.name.charAt(0)}
									</AvatarFallback>
								</Avatar>

								<div className="flex-1">
									<h3 className="text-2xl font-bold text-foreground mb-2">{selectedCandidateData?.name}</h3>
									{selectedCandidateData?.description && (
										<p className="text-muted-foreground">{selectedCandidateData.description}</p>
									)}
								</div>

								<div className="text-center">
									<CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
									<Badge className="bg-primary/10 text-primary">Selected</Badge>
								</div>
							</div>
						</div>

						{/* Warning Message */}
						<Alert>
							<Info className="h-4 w-4" />
							<AlertDescription>
								<span className="font-medium">Important:</span> Once submitted, your vote cannot be changed. Please
								confirm this is your final selection.
							</AlertDescription>
						</Alert>

						{/* Action Buttons */}
						<div className="flex gap-4">
							<Button
								variant="outline"
								onClick={handleBackToSelection}
								disabled={isSubmitting}
								className="flex-1 h-14 text-base"
							>
								<ArrowLeft className="w-5 h-5 mr-2" />
								Back to Selection
							</Button>
							<Button
								onClick={handleConfirmVote}
								disabled={isSubmitting}
								className="flex-1 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
							>
								{isSubmitting && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
								{isSubmitting ? "Submitting..." : "Submit Vote"}
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<Card className="mb-8 shadow-xl bg-card/95 backdrop-blur-sm">
					<CardContent className="p-8">
						<div className="flex items-center justify-between mb-6">
							<Button variant="ghost" onClick={onBack} className="h-12 px-6 text-base rounded-xl">
								<ArrowLeft className="w-6 h-6 mr-3" />
								Back to Elections
							</Button>
							<div className="text-right">
								<p className="text-lg font-bold text-foreground">{student.name}</p>
								<p className="text-sm text-muted-foreground font-mono">ID: {student.voting_id}</p>
							</div>
						</div>

						<div className="text-center">
							<h1 className="text-4xl font-bold text-foreground mb-2">{election.title}</h1>
							<Badge variant="secondary" className="mb-2">
								{election.category}
							</Badge>
							{election.description && <p className="text-muted-foreground mt-2">{election.description}</p>}
						</div>
					</CardContent>
				</Card>

				{/* Candidates */}
				<Card className="shadow-xl bg-card/95 backdrop-blur-sm">
					<CardHeader className="text-center pb-8">
						<CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-3">
							<Users className="w-10 h-10 text-primary" />
							Select Your Candidate
						</CardTitle>
						<p className="text-muted-foreground text-lg mt-3">
							Choose one candidate to cast your vote. Click on a candidate card to select them.
						</p>
					</CardHeader>
					<CardContent className="px-8 pb-8">
						<div className="grid gap-8">
							{candidates.map((candidate) => (
								<div
									key={candidate.id}
									className={`group p-8 border-4 rounded-3xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
										selectedCandidate === candidate.id
											? "border-primary bg-primary/5 shadow-2xl ring-2 ring-primary/50"
											: "border-border hover:border-primary hover:shadow-xl bg-card hover:bg-muted/50"
									}`}
									onClick={() => setSelectedCandidate(candidate.id)}
								>
									<div className="flex items-center gap-8">
										<div className="relative">
											<Avatar className="h-28 w-28 border-4 border-background shadow-2xl ring-2 ring-border">
												<AvatarImage src={candidate.profile_image_url || ""} />
												<AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
													{candidate.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											{selectedCandidate === candidate.id && (
												<div className="absolute -bottom-3 -right-3 bg-primary rounded-full p-3 shadow-2xl ring-2 ring-background">
													<CheckCircle className="w-7 h-7 text-primary-foreground animate-pulse" />
												</div>
											)}
										</div>

										<div className="flex-1">
											<h3 className="font-bold text-3xl text-foreground mb-3 group-hover:text-primary transition-colors">
												{candidate.name}
											</h3>
											{candidate.description && (
												<p className="text-muted-foreground text-lg leading-relaxed">{candidate.description}</p>
											)}
										</div>

										<div className="flex flex-col items-center gap-4">
											{selectedCandidate === candidate.id ? (
												<>
													<Badge className="bg-primary text-primary-foreground px-6 py-3 text-lg font-bold shadow-lg animate-pulse">
														<CheckCircle className="w-5 h-5 mr-2" />
														Selected
													</Badge>
													<div className="w-12 h-12 bg-primary border-4 border-background rounded-full flex items-center justify-center shadow-2xl">
														<CheckCircle className="w-6 h-6 text-primary-foreground" />
													</div>
												</>
											) : (
												<>
													<div className="text-base text-muted-foreground font-medium px-4 py-2 bg-muted rounded-lg">
														Tap to select
													</div>
													<div className="w-12 h-12 border-4 border-border rounded-full group-hover:border-primary transition-all duration-200 group-hover:shadow-lg"></div>
												</>
											)}
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="mt-8 flex justify-center">
							<Button
								onClick={handleProceedToConfirm}
								disabled={!selectedCandidate}
								className="h-16 px-12 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<ArrowRight className="w-6 h-6 mr-3" />
								Continue to Confirm
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
