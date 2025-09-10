// Export utilities using browser APIs

interface ElectionResult {
	id: string;
	title: string;
	category: string;
	description?: string;
	status: string;
	start_date: string;
	end_date: string;
	total_votes: number;
	candidates: Array<{
		id: string;
		name: string;
		profile_image_url?: string;
		election_symbol_url?: string;
		position: number;
		description?: string;
		vote_count: number;
	}>;
}

interface VoteRecord {
	id: string;
	voted_at: string;
	candidate: {
		id: string;
		name: string;
		profile_image_url?: string;
	};
	election: {
		id: string;
		title: string;
		category: string;
	};
	voter: {
		id: string;
		name: string;
		voting_id: string;
		roll_number: string;
	};
	voter_sequence: number;
}

// Helper function to download file
const downloadFile = (content: string, filename: string, contentType: string) => {
	const blob = new Blob([content], { type: contentType });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

// CSV Export Functions
export const exportElectionResultsToCSV = (elections: ElectionResult[]) => {
	const csvRows: string[] = [];

	// Header
	csvRows.push(
		[
			"Election Title",
			"Category",
			"Status",
			"Total Votes",
			"Candidate Position",
			"Candidate Name",
			"Votes Received",
			"Vote Percentage",
			"Start Date",
			"End Date",
		].join(","),
	);

	// Data rows
	elections.forEach((election) => {
		const sortedCandidates = [...election.candidates].sort((a, b) => b.vote_count - a.vote_count);
		sortedCandidates.forEach((candidate, index) => {
			const percentage =
				election.total_votes > 0 ? ((candidate.vote_count / election.total_votes) * 100).toFixed(2) + "%" : "0%";

			csvRows.push(
				[
					`"${election.title}"`,
					`"${election.category}"`,
					`"${election.status}"`,
					election.total_votes.toString(),
					(index + 1).toString(),
					`"${candidate.name}"`,
					candidate.vote_count.toString(),
					`"${percentage}"`,
					`"${new Date(election.start_date).toLocaleDateString()}"`,
					`"${new Date(election.end_date).toLocaleDateString()}"`,
				].join(","),
			);
		});
	});

	const csvContent = csvRows.join("\n");
	const filename = `Election_Results_${new Date().toISOString().split("T")[0]}.csv`;
	downloadFile(csvContent, filename, "text/csv");
};

export const exportVotingActivityToCSV = (votes: VoteRecord[]) => {
	const csvRows: string[] = [];

	// Header
	csvRows.push(
		[
			"Serial No.",
			"Voter Name",
			"Roll Number",
			"Voting ID",
			"Election Title",
			"Election Category",
			"Candidate Voted For",
			"Vote Date",
			"Vote Time",
			"Full Timestamp",
		].join(","),
	);

	// Data rows
	votes.forEach((vote, index) => {
		const voteDate = new Date(vote.voted_at);
		csvRows.push(
			[
				(index + 1).toString(),
				`"${vote.voter.name}"`,
				`"${vote.voter.roll_number}"`,
				`"${vote.voter.voting_id}"`,
				`"${vote.election.title}"`,
				`"${vote.election.category}"`,
				`"${vote.candidate.name}"`,
				`"${voteDate.toLocaleDateString()}"`,
				`"${voteDate.toLocaleTimeString()}"`,
				`"${voteDate.toLocaleString()}"`,
			].join(","),
		);
	});

	const csvContent = csvRows.join("\n");
	const filename = `Voting_Activity_${new Date().toISOString().split("T")[0]}.csv`;
	downloadFile(csvContent, filename, "text/csv");
};

// JSON Export Functions
export const exportElectionResultsToJSON = (elections: ElectionResult[]) => {
	const exportData = {
		exportDate: new Date().toISOString(),
		exportType: "Election Results",
		summary: {
			totalElections: elections.length,
			totalVotes: elections.reduce((sum, e) => sum + e.total_votes, 0),
			activeElections: elections.filter((e) => e.status === "active").length,
			completedElections: elections.filter((e) => e.status === "completed").length,
		},
		elections: elections.map((election) => ({
			...election,
			candidates: [...election.candidates]
				.sort((a, b) => b.vote_count - a.vote_count)
				.map((candidate, index) => ({
					...candidate,
					rank: index + 1,
					percentage: election.total_votes > 0 ? ((candidate.vote_count / election.total_votes) * 100).toFixed(2) : "0",
					status:
						index === 0 && candidate.vote_count > 0
							? "Winner"
							: candidate.vote_count === election.candidates[0]?.vote_count && candidate.vote_count > 0
								? "Tied"
								: "Runner-up",
				})),
		})),
	};

	const jsonContent = JSON.stringify(exportData, null, 2);
	const filename = `Election_Results_${new Date().toISOString().split("T")[0]}.json`;
	downloadFile(jsonContent, filename, "application/json");
};

export const exportVotingActivityToJSON = (votes: VoteRecord[]) => {
	const electionGroups = votes.reduce((acc: any, vote) => {
		const key = vote.election.id;
		if (!acc[key]) {
			acc[key] = {
				election: vote.election,
				votes: [],
			};
		}
		acc[key].votes.push(vote);
		return acc;
	}, {});

	const exportData = {
		exportDate: new Date().toISOString(),
		exportType: "Voting Activity",
		summary: {
			totalVotes: votes.length,
			uniqueVoters: new Set(votes.map((v) => v.voter.id)).size,
			electionsWithVotes: Object.keys(electionGroups).length,
			dateRange: {
				earliest:
					votes.length > 0
						? new Date(Math.min(...votes.map((v) => new Date(v.voted_at).getTime()))).toISOString()
						: null,
				latest:
					votes.length > 0
						? new Date(Math.max(...votes.map((v) => new Date(v.voted_at).getTime()))).toISOString()
						: null,
			},
		},
		votingActivity: votes.map((vote, index) => ({
			serialNumber: index + 1,
			voter: vote.voter,
			election: vote.election,
			candidate: vote.candidate,
			timestamp: vote.voted_at,
			formattedDate: new Date(vote.voted_at).toLocaleString(),
		})),
		byElection: Object.values(electionGroups),
	};

	const jsonContent = JSON.stringify(exportData, null, 2);
	const filename = `Voting_Activity_${new Date().toISOString().split("T")[0]}.json`;
	downloadFile(jsonContent, filename, "application/json");
};

// HTML Report Export Functions
export const exportElectionResultsToHTML = (elections: ElectionResult[]) => {
	const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Election Results Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #667eea;
            font-size: 2em;
        }
        .summary-card p {
            margin: 0;
            color: #666;
        }
        .election {
            background: white;
            margin-bottom: 30px;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .election-header {
            background: #667eea;
            color: white;
            padding: 20px;
        }
        .election-header h2 {
            margin: 0 0 10px 0;
            font-size: 1.5em;
        }
        .election-meta {
            opacity: 0.9;
            font-size: 0.9em;
        }
        .results-table {
            width: 100%;
            border-collapse: collapse;
        }
        .results-table th {
            background: #f8f9fa;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        .results-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #dee2e6;
        }
        .results-table tr:hover {
            background: #f8f9fa;
        }
        .winner {
            background: #d4edda !important;
            border-left: 4px solid #28a745;
        }
        .tied {
            background: #fff3cd !important;
            border-left: 4px solid #ffc107;
        }
        .rank {
            font-weight: bold;
            color: #667eea;
            text-align: center;
        }
        .votes {
            font-weight: 600;
        }
        .percentage {
            color: #28a745;
            font-weight: 500;
        }
        @media print {
            body { background: white; }
            .election { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🗳️ Election Results Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>${elections.length}</h3>
            <p>Total Elections</p>
        </div>
        <div class="summary-card">
            <h3>${elections.reduce((sum, e) => sum + e.total_votes, 0)}</h3>
            <p>Total Votes Cast</p>
        </div>
        <div class="summary-card">
            <h3>${elections.filter((e) => e.status === "active").length}</h3>
            <p>Active Elections</p>
        </div>
        <div class="summary-card">
            <h3>${elections.filter((e) => e.status === "completed").length}</h3>
            <p>Completed Elections</p>
        </div>
    </div>

    ${elections
			.map((election) => {
				const sortedCandidates = [...election.candidates].sort((a, b) => b.vote_count - a.vote_count);
				const maxVotes = sortedCandidates[0]?.vote_count || 0;

				return `
    <div class="election">
        <div class="election-header">
            <h2>${election.title}</h2>
            <div class="election-meta">
                <strong>Category:</strong> ${election.category} | 
                <strong>Status:</strong> ${election.status} | 
                <strong>Total Votes:</strong> ${election.total_votes}<br>
                <strong>Period:</strong> ${new Date(election.start_date).toLocaleDateString()} - ${new Date(election.end_date).toLocaleDateString()}
            </div>
        </div>
        <table class="results-table">
            <thead>
                <tr>
                    <th style="width: 60px;">Rank</th>
                    <th>Candidate Name</th>
                    <th style="width: 100px;">Votes</th>
                    <th style="width: 100px;">Percentage</th>
                    <th style="width: 100px;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${sortedCandidates
									.map((candidate, index) => {
										const percentage =
											election.total_votes > 0 ? ((candidate.vote_count / election.total_votes) * 100).toFixed(1) : "0";
										const isWinner = index === 0 && candidate.vote_count > 0;
										const isTied =
											candidate.vote_count === maxVotes &&
											candidate.vote_count > 0 &&
											sortedCandidates.filter((c) => c.vote_count === maxVotes).length > 1;
										const status = isWinner ? "Winner" : isTied ? "Tied" : "Runner-up";
										const rowClass = isWinner ? "winner" : isTied ? "tied" : "";

										return `
                <tr class="${rowClass}">
                    <td class="rank">#${index + 1}</td>
                    <td>${candidate.name}</td>
                    <td class="votes">${candidate.vote_count}</td>
                    <td class="percentage">${percentage}%</td>
                    <td>${status}</td>
                </tr>`;
									})
									.join("")}
            </tbody>
        </table>
    </div>`;
			})
			.join("")}

    <div style="margin-top: 40px; text-align: center; color: #6c757d; font-size: 0.9em;">
        <p>📊 Report generated by Awaz-e-Talba Election System</p>
    </div>
</body>
</html>`;

	const filename = `Election_Results_Report_${new Date().toISOString().split("T")[0]}.html`;
	downloadFile(htmlContent, filename, "text/html");
};

export const exportVotingActivityToHTML = (votes: VoteRecord[]) => {
	const electionGroups = votes.reduce((acc: any, vote) => {
		const key = vote.election.id;
		if (!acc[key]) {
			acc[key] = {
				election: vote.election,
				votes: [],
			};
		}
		acc[key].votes.push(vote);
		return acc;
	}, {});

	const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voting Activity Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #11998e;
            font-size: 2em;
        }
        .voting-table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        .voting-table h2 {
            background: #11998e;
            color: white;
            margin: 0;
            padding: 20px;
            font-size: 1.3em;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #495057;
            border-bottom: 2px solid #dee2e6;
        }
        .table td {
            padding: 10px 12px;
            border-bottom: 1px solid #dee2e6;
            font-size: 0.9em;
        }
        .table tr:hover {
            background: #f8f9fa;
        }
        .voter-name {
            font-weight: 600;
            color: #495057;
        }
        .candidate-name {
            color: #11998e;
            font-weight: 500;
        }
        @media print {
            body { background: white; }
            .voting-table { box-shadow: none; border: 1px solid #ddd; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Voting Activity Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>${votes.length}</h3>
            <p>Total Votes</p>
        </div>
        <div class="summary-card">
            <h3>${new Set(votes.map((v) => v.voter.id)).size}</h3>
            <p>Unique Voters</p>
        </div>
        <div class="summary-card">
            <h3>${Object.keys(electionGroups).length}</h3>
            <p>Elections</p>
        </div>
    </div>

    <div class="voting-table">
        <h2>📝 Detailed Voting Activity</h2>
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th>Voter Name</th>
                    <th>Roll No.</th>
                    <th>Election</th>
                    <th>Voted For</th>
                    <th>Date & Time</th>
                </tr>
            </thead>
            <tbody>
                ${votes
									.map(
										(vote, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="voter-name">${vote.voter.name}</td>
                    <td>${vote.voter.roll_number}</td>
                    <td>${vote.election.title} <small>(${vote.election.category})</small></td>
                    <td class="candidate-name">${vote.candidate.name}</td>
                    <td>${new Date(vote.voted_at).toLocaleString()}</td>
                </tr>`,
									)
									.join("")}
            </tbody>
        </table>
    </div>

    ${Object.values(electionGroups)
			.map(
				(group: any) => `
    <div class="voting-table">
        <h2>🗳️ ${group.election.title} (${group.votes.length} votes)</h2>
        <table class="table">
            <thead>
                <tr>
                    <th style="width: 50px;">#</th>
                    <th>Voter Name</th>
                    <th>Roll Number</th>
                    <th>Voted For</th>
                    <th>Timestamp</th>
                </tr>
            </thead>
            <tbody>
                ${group.votes
									.map(
										(vote: VoteRecord, index: number) => `
                <tr>
                    <td>${index + 1}</td>
                    <td class="voter-name">${vote.voter.name}</td>
                    <td>${vote.voter.roll_number}</td>
                    <td class="candidate-name">${vote.candidate.name}</td>
                    <td>${new Date(vote.voted_at).toLocaleString()}</td>
                </tr>`,
									)
									.join("")}
            </tbody>
        </table>
    </div>`,
			)
			.join("")}

    <div style="margin-top: 40px; text-align: center; color: #6c757d; font-size: 0.9em;">
        <p>📊 Report generated by Awaz-e-Talba Election System</p>
    </div>
</body>
</html>`;

	const filename = `Voting_Activity_Report_${new Date().toISOString().split("T")[0]}.html`;
	downloadFile(htmlContent, filename, "text/html");
};
