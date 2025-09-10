import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useCurrentAdmin } from "@/hooks/useCurrentAdmin";

interface Election {
	id: string;
	title: string;
	description: string | null;
	category: string;
	start_date: string;
	end_date: string;
	status: "draft" | "active" | "completed" | "archived";
	voting_instructions: string | null;
	admin_id: string;
	created_at: string;
	updated_at: string;
}

interface ElectionWithCandidates extends Election {
	candidates?: Array<{
		id: string;
		name: string;
		description: string | null;
		profile_image_url: string | null;
		election_symbol_url: string | null;
		position: number;
	}>;
}

interface ElectionStats {
	total: number;
	draft: number;
	active: number;
	completed: number;
	archived: number;
}

export const useElectionQueries = () => {
	const { adminId, isLoading: isAdminLoading } = useCurrentAdmin();

	// Fetch elections for current admin
	const electionsQuery = useQuery({
		queryKey: ["elections", adminId],
		enabled: !!adminId && !isAdminLoading,
		queryFn: async () => {
			const { data, error } = await supabase
				.from("elections")
				.select(`
          *,
          candidates (
            id,
            name,
            description,
            profile_image_url,
            election_symbol_url,
            position
          )
        `)
				.eq("admin_id", adminId)
				.order("created_at", { ascending: false });

			if (error) throw new Error(error.message);
			return data as ElectionWithCandidates[];
		},
	});

	// Fetch active elections (public access for voting interface)
	const activeElectionsQuery = useQuery({
		queryKey: ["elections", "active"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("elections")
				.select(`
          *,
          candidates (
            id,
            name,
            description,
            profile_image_url,
            election_symbol_url,
            position
          )
        `)
				.eq("status", "active")
				.lte("start_date", new Date().toISOString())
				.gte("end_date", new Date().toISOString())
				.order("start_date", { ascending: true });

			if (error) throw new Error(error.message);
			return data as ElectionWithCandidates[];
		},
		refetchInterval: 30000, // Refetch every 30 seconds for active elections
	});

	// Calculate election statistics
	const stats: ElectionStats | null = electionsQuery.data
		? {
				total: electionsQuery.data.length,
				draft: electionsQuery.data.filter((e) => e.status === "draft").length,
				active: electionsQuery.data.filter((e) => e.status === "active").length,
				completed: electionsQuery.data.filter((e) => e.status === "completed").length,
				archived: electionsQuery.data.filter((e) => e.status === "archived").length,
			}
		: null;

	// Helper functions
	const getElectionById = (id: string) => electionsQuery.data?.find((e) => e.id === id);

	const getElectionsByStatus = (status: Election["status"]) =>
		electionsQuery.data?.filter((e) => e.status === status) || [];

	const isElectionActive = (election: Election) => {
		const now = new Date();
		const startDate = new Date(election.start_date);
		const endDate = new Date(election.end_date);
		return election.status === "active" && now >= startDate && now <= endDate;
	};

	return {
		// Query data
		elections: electionsQuery.data || [],
		activeElections: activeElectionsQuery.data || [],
		stats,

		// Query states
		isLoading: electionsQuery.isLoading,
		error: electionsQuery.error?.message,

		// Helper functions
		getElectionById,
		getElectionsByStatus,
		isElectionActive,
	};
};

export type { Election, ElectionWithCandidates, ElectionStats };
