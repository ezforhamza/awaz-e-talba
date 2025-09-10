import { supabase } from "@/lib/supabase";

interface ElectionScheduleResult {
	started: number;
	completed: number;
	errors: string[];
}

/**
 * Checks and updates election statuses based on their scheduled times
 * This function should be called periodically (e.g., every minute)
 */
export async function updateElectionSchedules(): Promise<ElectionScheduleResult> {
	const result: ElectionScheduleResult = {
		started: 0,
		completed: 0,
		errors: [],
	};

	try {
		const now = new Date().toISOString();

		// Auto-start elections that should be active
		const { data: electionsToStart, error: startError } = await supabase
			.from("elections")
			.select("id, title, start_date")
			.eq("status", "draft")
			.eq("auto_start", true)
			.lte("start_date", now);

		if (startError) {
			result.errors.push(`Failed to fetch elections to start: ${startError.message}`);
		} else if (electionsToStart && electionsToStart.length > 0) {
			for (const election of electionsToStart) {
				// Check if election has at least 2 candidates before auto-starting
				const { data: candidates } = await supabase.from("candidates").select("id").eq("election_id", election.id);

				if (!candidates || candidates.length < 2) {
					result.errors.push(`Cannot auto-start election "${election.title}" - needs at least 2 candidates`);
					continue;
				}

				// Auto-start the election
				const { error: updateError } = await supabase
					.from("elections")
					.update({
						status: "active",
						updated_at: new Date().toISOString(),
					})
					.eq("id", election.id);

				if (updateError) {
					result.errors.push(`Failed to start election "${election.title}": ${updateError.message}`);
				} else {
					result.started++;

					// Log the auto-start
					await supabase.from("vote_audit_log").insert({
						action_type: "election_auto_started",
						election_id: election.id,
						details: {
							election_title: election.title,
							scheduled_time: election.start_date,
							actual_time: now,
						},
						ip_address: "system",
						user_agent: "auto-scheduler",
					});
				}
			}
		}

		// Auto-complete elections that should be finished
		const { data: electionsToComplete, error: completeError } = await supabase
			.from("elections")
			.select("id, title, end_date")
			.eq("status", "active")
			.eq("auto_end", true)
			.lte("end_date", now);

		if (completeError) {
			result.errors.push(`Failed to fetch elections to complete: ${completeError.message}`);
		} else if (electionsToComplete && electionsToComplete.length > 0) {
			for (const election of electionsToComplete) {
				const { error: updateError } = await supabase
					.from("elections")
					.update({
						status: "completed",
						updated_at: new Date().toISOString(),
					})
					.eq("id", election.id);

				if (updateError) {
					result.errors.push(`Failed to complete election "${election.title}": ${updateError.message}`);
				} else {
					result.completed++;

					// Log the auto-completion
					await supabase.from("vote_audit_log").insert({
						action_type: "election_auto_completed",
						election_id: election.id,
						details: {
							election_title: election.title,
							scheduled_time: election.end_date,
							actual_time: now,
						},
						ip_address: "system",
						user_agent: "auto-scheduler",
					});
				}
			}
		}
	} catch (error) {
		result.errors.push(`Unexpected error in election scheduler: ${error}`);
	}

	return result;
}

/**
 * Gets upcoming election schedule events
 */
export async function getUpcomingScheduleEvents() {
	const now = new Date();
	const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

	const { data: upcomingStarts } = await supabase
		.from("elections")
		.select("id, title, start_date")
		.eq("status", "draft")
		.eq("auto_start", true)
		.gte("start_date", now.toISOString())
		.lte("start_date", next24Hours.toISOString());

	const { data: upcomingEnds } = await supabase
		.from("elections")
		.select("id, title, end_date")
		.eq("status", "active")
		.eq("auto_end", true)
		.gte("end_date", now.toISOString())
		.lte("end_date", next24Hours.toISOString());

	return {
		starting: upcomingStarts || [],
		ending: upcomingEnds || [],
	};
}
