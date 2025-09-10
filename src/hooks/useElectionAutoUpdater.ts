import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateElectionSchedules } from "@/services/electionScheduler";

export const useElectionAutoUpdater = () => {
	const queryClient = useQueryClient();
	const channelRef = useRef<any>(null);
	const intervalRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Set up realtime subscription for election changes
		channelRef.current = supabase
			.channel("election-realtime-updates")
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "elections",
				},
				(payload) => {
					// Invalidate relevant queries to refresh the UI immediately
					queryClient.invalidateQueries({ queryKey: ["elections"] });
					queryClient.invalidateQueries({ queryKey: ["active-elections"] });

					// Show toast notification for status changes
					const { new: newElection, old: oldElection } = payload;
					if (newElection.status !== oldElection.status) {
						const statusMessages = {
							active: `🟢 Election "${newElection.title}" is now active`,
							completed: `✅ Election "${newElection.title}" has been completed`,
							archived: `📁 Election "${newElection.title}" has been archived`,
							draft: `📝 Election "${newElection.title}" is back to draft`,
						};

						const message = statusMessages[newElection.status as keyof typeof statusMessages];
						if (message) {
							toast.success(message);
						}
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "elections",
				},
				(payload) => {
					queryClient.invalidateQueries({ queryKey: ["elections"] });

					const election = payload.new as any;
					toast.success(`🗳️ New election created: "${election.title}"`);
				},
			)
			.subscribe();

		// Set up periodic auto-scheduling check (every minute)
		const runSchedulerCheck = async () => {
			try {
				const result = await updateElectionSchedules();

				// Show toast notifications for auto-started/completed elections
				if (result.started > 0) {
					toast.success(`🟢 ${result.started} election${result.started > 1 ? "s" : ""} automatically started`);
					queryClient.invalidateQueries({ queryKey: ["elections"] });
				}

				if (result.completed > 0) {
					toast.success(`✅ ${result.completed} election${result.completed > 1 ? "s" : ""} automatically completed`);
					queryClient.invalidateQueries({ queryKey: ["elections"] });
				}

				// Log any errors (in production, you might want to send to error tracking service)
				result.errors.forEach((error) => {
					console.warn("Election scheduler error:", error);
				});
			} catch (error) {
				console.error("Failed to run election scheduler:", error);
			}
		};

		// Run scheduler check immediately
		runSchedulerCheck();

		// Then run every minute
		intervalRef.current = setInterval(runSchedulerCheck, 60000);

		return () => {
			// Cleanup
			if (channelRef.current) {
				supabase.removeChannel(channelRef.current);
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
			}
		};
	}, [queryClient]);

	return {
		// Return empty object since this is just a realtime subscription hook
	};
};
