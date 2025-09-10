import { supabase } from "@/lib/supabase";
import { useCandidateQueries } from "./useCandidateQueries";
import { useCandidateMutations } from "./useCandidateMutations";
import { useCandidateActions } from "./useCandidateActions";

// Combined hook that provides all candidate functionality
export const useCandidates = (electionId?: string) => {
	const queries = useCandidateQueries(electionId);
	const mutations = useCandidateMutations();
	const actions = useCandidateActions();

	// Upload image to Supabase Storage (using uploads bucket)
	const uploadImage = async (file: File, folder: string): Promise<string> => {
		const fileExt = file.name.split(".").pop();
		const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

		const { data, error: uploadError } = await supabase.storage.from("uploads").upload(fileName, file, {
			cacheControl: "3600",
			upsert: false,
		});

		if (uploadError) {
			throw new Error(`Failed to upload image: ${uploadError.message}`);
		}

		const { data: publicUrl } = supabase.storage.from("uploads").getPublicUrl(data.path);

		return publicUrl.publicUrl;
	};

	return {
		// Query data
		...queries,

		// Mutations
		...mutations,

		// Actions
		...actions,

		// Utilities
		uploadImage,
	};
};

// Re-export types and individual hooks for granular usage
export { useCandidateQueries } from "./useCandidateQueries";
export { useCandidateMutations } from "./useCandidateMutations";
export { useCandidateActions } from "./useCandidateActions";

export type {
	Candidate,
	CandidateWithVoteCount,
} from "./useCandidateQueries";

export type {
	CreateCandidateData,
	UpdateCandidateData,
} from "./useCandidateMutations";
