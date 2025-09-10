import { useMutation } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { createVoterHash, generateSessionId, type VotingSession } from "@/utils/security";
import { useVotingEligibility } from "./useVotingEligibility";

interface VotingSessionData {
	sessionId: string;
	votingId: string;
	ipAddress: string;
	userAgent: string;
}

export const useVotingSession = () => {
	const [currentSession, setCurrentSession] = useState<VotingSession | null>(null);
	const [votingProgress, setVotingProgress] = useState<{
		totalElections: number;
		completedElections: number;
		currentElection?: string;
	}>({ totalElections: 0, completedElections: 0 });

	const { checkEligibility } = useVotingEligibility();

	// Start voting session
	const startVotingSessionMutation = useMutation({
		mutationFn: async (sessionData: VotingSessionData): Promise<VotingSession> => {
			const voterHash = await createVoterHash(sessionData.votingId);

			// Get active elections this voter hasn't voted in yet
			const eligibility = await checkEligibility(sessionData.votingId);
			if (!eligibility.isEligible) {
				throw new Error(eligibility.reason);
			}

			const availableElections = eligibility.elections.filter((e) => !e.hasVoted).map((e) => e.id);

			// Create voting session
			const { data: session, error } = await supabase
				.from("voting_sessions")
				.insert({
					id: sessionData.sessionId,
					encrypted_voter_hash: voterHash,
					elections_voted: [],
					ip_address: sessionData.ipAddress,
					user_agent: sessionData.userAgent,
					status: "active",
				})
				.select()
				.single();

			if (error) {
				throw new Error(error.message);
			}

			// Log session start
			await supabase.from("vote_audit_log").insert({
				action_type: "session_started",
				voting_session_id: sessionData.sessionId,
				details: {
					available_elections: availableElections.length,
					voter_name: eligibility.studentName,
				},
				ip_address: sessionData.ipAddress,
				user_agent: sessionData.userAgent,
			});

			setCurrentSession(session);
			setVotingProgress({
				totalElections: availableElections.length,
				completedElections: 0,
			});

			return session;
		},
	});

	// Complete voting session
	const completeSessionMutation = useMutation({
		mutationFn: async (): Promise<void> => {
			if (!currentSession) {
				throw new Error("No active voting session");
			}

			// Update session status
			const { error } = await supabase
				.from("voting_sessions")
				.update({
					status: "completed",
					session_end: new Date().toISOString(),
				})
				.eq("id", currentSession.id);

			if (error) {
				throw new Error(error.message);
			}

			// Log session completion
			await supabase.from("vote_audit_log").insert({
				action_type: "session_ended",
				voting_session_id: currentSession.id,
				details: {
					elections_completed: (currentSession.elections_voted as string[]).length,
					total_time_seconds: Math.floor(
						(new Date().getTime() - new Date(currentSession.session_start).getTime()) / 1000,
					),
				},
				ip_address: currentSession.ip_address,
				user_agent: currentSession.user_agent,
			});

			// Clear session
			setCurrentSession(null);
			setVotingProgress({ totalElections: 0, completedElections: 0 });
		},
	});

	// Get remaining elections for current voting ID
	const getRemainingElections = useCallback(
		async (votingId: string) => {
			const eligibility = await checkEligibility(votingId);
			return eligibility.elections.filter((e) => !e.hasVoted);
		},
		[checkEligibility],
	);

	// Initialize voting (convenience function)
	const initializeVoting = useCallback(
		async (votingId: string) => {
			const sessionId = generateSessionId();
			const ipAddress = "192.168.1.1"; // In production, get real IP
			const userAgent = navigator.userAgent;

			try {
				const session = await startVotingSessionMutation.mutateAsync({
					sessionId,
					votingId,
					ipAddress,
					userAgent,
				});

				return {
					success: true,
					session,
					message: "Voting session started successfully",
				};
			} catch (error: any) {
				return {
					success: false,
					message: error.message,
				};
			}
		},
		[startVotingSessionMutation],
	);

	// Update progress when session changes
	const updateVotingProgress = useCallback(
		(electionId: string) => {
			if (!currentSession) return;

			const updatedElectionsVoted = [...(currentSession.elections_voted as string[]), electionId];
			const updatedSession = {
				...currentSession,
				elections_voted: updatedElectionsVoted,
			};

			setCurrentSession(updatedSession);
			setVotingProgress((prev) => ({
				...prev,
				completedElections: updatedElectionsVoted.length,
			}));
		},
		[currentSession],
	);

	return {
		// Current state
		currentSession,
		votingProgress,

		// Mutations
		startVotingSession: startVotingSessionMutation.mutateAsync,
		completeSession: completeSessionMutation.mutateAsync,

		// Convenience functions
		initializeVoting,
		getRemainingElections,
		updateVotingProgress,

		// Loading states
		isStartingSession: startVotingSessionMutation.isPending,
		isCompletingSession: completeSessionMutation.isPending,

		// Error states
		sessionError: startVotingSessionMutation.error?.message,
		completionError: completeSessionMutation.error?.message,

		// Session helpers
		isSessionActive: !!currentSession && currentSession.status === "active",
		hasCompletedAllElections:
			votingProgress.totalElections > 0 && votingProgress.completedElections === votingProgress.totalElections,
		votingProgressPercentage:
			votingProgress.totalElections > 0
				? Math.round((votingProgress.completedElections / votingProgress.totalElections) * 100)
				: 0,
	};
};

export type { VotingSessionData };
