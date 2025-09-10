import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
	totalElections: number;
	activeElections: number;
	totalVotes: number;
	totalCandidates: number;
	totalStudents: number;
	participationRate: number;
}

export function useDashboardStats() {
	const [stats, setStats] = useState<DashboardStats>({
		totalElections: 0,
		activeElections: 0,
		totalVotes: 0,
		totalCandidates: 0,
		totalStudents: 0,
		participationRate: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = async () => {
		try {
			setLoading(true);

			// Fetch all stats in parallel
			const [
				{ count: totalElections },
				{ count: activeElections },
				{ count: totalVotes },
				{ count: totalCandidates },
				{ count: totalStudents },
			] = await Promise.all([
				supabase.from("elections").select("*", { count: "exact", head: true }),
				supabase
					.from("elections")
					.select("*", { count: "exact", head: true })
					.eq("status", "active")
					.lte("start_date", new Date().toISOString())
					.gte("end_date", new Date().toISOString()),
				supabase.from("votes").select("*", { count: "exact", head: true }),
				supabase.from("candidates").select("*", { count: "exact", head: true }),
				supabase.from("students").select("*", { count: "exact", head: true }),
			]);

			const participationRate = totalStudents > 0 ? Math.round((totalVotes / totalStudents) * 100) : 0;

			setStats({
				totalElections: totalElections || 0,
				activeElections: activeElections || 0,
				totalVotes: totalVotes || 0,
				totalCandidates: totalCandidates || 0,
				totalStudents: totalStudents || 0,
				participationRate,
			});

			setError(null);
		} catch (err: any) {
			console.error("Error fetching dashboard stats:", err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();

		// Set up real-time subscriptions for live updates
		const votesSubscription = supabase
			.channel("votes-stats-dashboard")
			.on("postgres_changes", { event: "*", schema: "public", table: "votes" }, () => {
				// Debounce stats updates
				setTimeout(fetchStats, 200);
			})
			.subscribe();

		const electionsSubscription = supabase
			.channel("elections-stats-dashboard")
			.on("postgres_changes", { event: "*", schema: "public", table: "elections" }, () => {
				setTimeout(fetchStats, 200);
			})
			.subscribe();

		// Refresh stats every 15 seconds as fallback
		const interval = setInterval(fetchStats, 15000);

		return () => {
			supabase.removeChannel(votesSubscription);
			supabase.removeChannel(electionsSubscription);
			clearInterval(interval);
		};
	}, []);

	return { stats, loading, error, refetch: fetchStats };
}
