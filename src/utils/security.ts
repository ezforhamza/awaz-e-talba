/**
 * Security utilities for the Awaz-e-Talba voting system
 * Provides cryptographic functions for voter anonymization and vote integrity
 */

// Salt for voter hash generation - should match database implementation
export const VOTER_HASH_SALT = "salt_2024";

/**
 * Creates an encrypted hash of a voting ID for anonymization
 * This allows us to track votes without revealing voter identity
 */
export const createVoterHash = async (votingId: string, salt: string = VOTER_HASH_SALT): Promise<string> => {
	const encoder = new TextEncoder();
	const data = encoder.encode(votingId + salt);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = new Uint8Array(hashBuffer);
	return Array.from(hashArray)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};

/**
 * Creates a vote integrity hash to prevent tampering
 */
export const createVoteHash = async (sessionId: string, timestamp: string): Promise<string> => {
	const encoder = new TextEncoder();
	const data = encoder.encode(sessionId + timestamp);
	const hashBuffer = await crypto.subtle.digest("SHA-256", data);
	const hashArray = new Uint8Array(hashBuffer);
	return Array.from(hashArray)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
};

/**
 * Generates a cryptographically secure voting ID
 * Format: VT2024-XXXX-YYYY where X and Y are random alphanumeric
 */
export const generateSecureVotingId = (): string => {
	const prefix = "VT2024";

	// Generate random bytes and convert to base64, then clean up
	const randomPart1 = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(4))))
		.replace(/[/+=]/g, "")
		.substring(0, 4);
	const randomPart2 = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(4))))
		.replace(/[/+=]/g, "")
		.substring(0, 4);

	return `${prefix}-${randomPart1}-${randomPart2}`.toUpperCase();
};

/**
 * Validates voting ID format
 */
export const isValidVotingId = (votingId: string): boolean => {
	// Support multiple formats from your system:
	// 1. VROLL followed by 7 digits: VROLL0021694
	// 2. V followed by 4-8 digits: V29248044, V10002625, V50556633, V9995
	const vrollPattern = /^VROLL\d{7}$/;
	const vNumberPattern = /^V\d{4,8}$/;

	return vrollPattern.test(votingId) || vNumberPattern.test(votingId);
};

/**
 * Creates a session ID for voting session tracking
 */
export const generateSessionId = (): string => {
	return crypto.randomUUID();
};

/**
 * Validates if an IP address appears to be from a valid voting booth
 */
export const isValidBoothIP = (ipAddress: string): boolean => {
	// In production, you'd check against a whitelist of booth IPs
	// For now, we'll allow any private network IP
	const privateIPRegex = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/;
	return privateIPRegex.test(ipAddress) || ipAddress === "127.0.0.1";
};

/**
 * Rate limiting check for voting attempts
 */
export const checkRateLimit = (attempts: number, timeWindow: number): boolean => {
	// Allow maximum 3 attempts per 10 minutes
	return attempts < 3 && timeWindow > 10 * 60 * 1000;
};

/**
 * Detects potential fraud patterns
 */
export const detectFraudPattern = (
	ipAddress: string,
	userAgent: string,
	recentVotes: Array<{ ip_address: string; user_agent: string; voted_at: string }>,
): { isSuspicious: boolean; reason?: string } => {
	// Check for too many votes from same IP
	const sameIPCount = recentVotes.filter((vote) => vote.ip_address === ipAddress).length;
	if (sameIPCount > 5) {
		return { isSuspicious: true, reason: "Too many votes from same IP address" };
	}

	// Check for identical user agents (possible automation)
	const sameUserAgentCount = recentVotes.filter((vote) => vote.user_agent === userAgent).length;
	if (sameUserAgentCount > 10) {
		return { isSuspicious: true, reason: "Too many votes with identical user agent" };
	}

	// Check for rapid voting (less than 30 seconds apart from same IP)
	const recentFromIP = recentVotes
		.filter((vote) => vote.ip_address === ipAddress)
		.sort((a, b) => new Date(b.voted_at).getTime() - new Date(a.voted_at).getTime());

	if (recentFromIP.length > 1) {
		const timeDiff = new Date(recentFromIP[0].voted_at).getTime() - new Date(recentFromIP[1].voted_at).getTime();
		if (timeDiff < 30000) {
			// Less than 30 seconds
			return { isSuspicious: true, reason: "Votes cast too rapidly from same location" };
		}
	}

	return { isSuspicious: false };
};

// Export types
export interface VotingSession {
	id: string;
	encrypted_voter_hash: string;
	session_start: string;
	session_end?: string;
	elections_voted: string[];
	ip_address: string;
	user_agent: string;
	status: "active" | "completed" | "expired";
}

export interface VoteAuditLog {
	id: string;
	action_type: "vote_cast" | "vote_verified" | "fraud_attempt" | "session_started" | "session_ended";
	voting_session_id?: string;
	election_id?: string;
	details: Record<string, any>;
	timestamp: string;
	ip_address: string;
	user_agent: string;
}
