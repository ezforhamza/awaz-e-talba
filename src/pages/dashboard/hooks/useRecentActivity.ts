import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ActivityItem {
	id: string;
	type: "vote_cast" | "election_started" | "election_ended" | "student_registered";
	description: string;
	timestamp: string;
	metadata?: {
		election_title?: string;
		student_name?: string;
		candidate_name?: string;
	};
}

export function useRecentActivity() {
	const [activities, setActivities] = useState<ActivityItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchRecentActivity = async () => {
		try {
			setLoading(true);

			// Fetch recent vote audit logs
			const { data: auditLogs, error: auditError } = await supabase
				.from("vote_audit_log")
				.select("*")
				.in("action_type", ["vote_cast", "session_started", "session_ended"])
				.order("timestamp", { ascending: false })
				.limit(20);

			if (auditError) {
				throw auditError;
			}

			// Transform audit logs to activity items
			const activities: ActivityItem[] = [];

			if (auditLogs) {
				for (const log of auditLogs) {
					let description = "";
					let type: ActivityItem["type"] = "vote_cast";

					switch (log.action_type) {
						case "vote_cast":
							description = `New vote cast in election`;
							type = "vote_cast";
							break;
						case "session_started":
							description = `Voting session started`;
							type = "vote_cast";
							break;
						case "session_ended":
							description = `Voting session completed`;
							type = "vote_cast";
							break;
						default:
							continue;
					}

					// Get additional details if available
					let metadata: ActivityItem["metadata"] = {};

					if (log.election_id) {
						const { data: election } = await supabase
							.from("elections")
							.select("title")
							.eq("id", log.election_id)
							.single();

						if (election) {
							metadata.election_title = election.title;
						}
					}

					if (log.details) {
						if (log.details.voter_name) {
							metadata.student_name = log.details.voter_name;
						}
						if (log.details.candidate_name) {
							metadata.candidate_name = log.details.candidate_name;
						}
					}

					activities.push({
						id: log.id,
						type,
						description,
						timestamp: log.timestamp,
						metadata,
					});
				}
			}

			setActivities(activities);
			setError(null);
		} catch (err: any) {
			console.error("Error fetching recent activity:", err);
			setError(err.message);
			setActivities([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRecentActivity();

		// Set up real-time subscription for audit log changes
		const auditSubscription = supabase
			.channel("recent-activity")
			.on("postgres_changes", { event: "INSERT", schema: "public", table: "vote_audit_log" }, () => {
				console.log("New activity detected, refreshing...");
				fetchRecentActivity();
			})
			.subscribe();

		// Refresh every 30 seconds to catch any missed updates
		const interval = setInterval(fetchRecentActivity, 30000);

		return () => {
			supabase.removeChannel(auditSubscription);
			clearInterval(interval);
		};
	}, []);

	return { activities, loading, error, refetch: fetchRecentActivity };
}
