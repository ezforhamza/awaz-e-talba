import { Icon } from "@/components/icon";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { Progress } from "@/ui/progress";
import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { useRouter } from "@/routes/hooks";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface Election {
  id: string;
  title: string;
  description: string | null;
  status: 'active' | 'draft' | 'completed' | 'cancelled';
  start_date: string;
  end_date: string;
  allow_multiple_votes: boolean;
}

interface Candidate {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  position: number;
  vote_count: number;
}

interface VoteDetail {
  id: string;
  student_name: string;
  student_roll_number: string;
  student_class: string | null;
  student_section: string | null;
  candidate_name: string;
  voted_at: string;
  ip_address: string | null;
}

export default function ViewElection() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [election, setElection] = useState<Election | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voteDetails, setVoteDetails] = useState<VoteDetail[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time subscription
  useEffect(() => {
    if (!id) return;

    // Initial data load
    loadElectionData();

    // Set up real-time subscriptions for votes
    const votesChannel = supabase
      .channel(`votes-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `election_id=eq.${id}`
        },
        () => {
          loadVotingResults();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
    };
  }, [id]);

  const loadElectionData = async () => {
    if (!id) return;
    
    try {
      // Load election details
      const { data: electionData, error: electionError } = await supabase
        .from('elections')
        .select('*')
        .eq('id', id)
        .single();

      if (electionError) throw electionError;

      setElection(electionData);
      
      // Load voting results
      await loadVotingResults();
      
    } catch (error: any) {
      console.error('Failed to load election:', error);
      toast.error('Failed to load election data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadVotingResults = async () => {
    if (!id) return;

    try {
      // Get candidates with vote counts
      const { data: candidatesData, error: candidatesError } = await supabase
        .from('election_candidates')
        .select(`
          candidates!inner (
            id,
            name,
            description,
            image_url,
            position
          )
        `)
        .eq('election_id', id);

      if (candidatesError) throw candidatesError;

      // Get vote counts for each candidate
      const candidatesList: Candidate[] = [];
      let total = 0;

      for (const item of candidatesData || []) {
        const candidate = (item.candidates as any);
        
        // Count votes for this candidate
        const { count, error: countError } = await supabase
          .from('votes')
          .select('*', { count: 'exact', head: true })
          .eq('election_id', id)
          .eq('candidate_id', candidate.id);

        if (countError) {
          console.error('Error counting votes:', countError);
        }

        const voteCount = count || 0;
        total += voteCount;

        candidatesList.push({
          id: candidate.id,
          name: candidate.name,
          description: candidate.description,
          image_url: candidate.image_url,
          position: candidate.position,
          vote_count: voteCount
        });
      }

      // Sort by position
      candidatesList.sort((a, b) => a.position - b.position);
      setCandidates(candidatesList);
      setTotalVotes(total);

      // Load detailed voting records - we need to join manually since Supabase doesn't support complex joins
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select(`
          id,
          voted_at,
          ip_address,
          student_voting_id,
          candidate_id
        `)
        .eq('election_id', id)
        .order('voted_at', { ascending: false });

      let details: VoteDetail[] = [];

      if (!votesError && votesData) {
        // Get candidate and student details for each vote
        details = await Promise.all(
          votesData.map(async (vote: any) => {
            // Get candidate name
            const { data: candidateData } = await supabase
              .from('candidates')
              .select('name')
              .eq('id', vote.candidate_id)
              .single();

            // Get student details by voting_id
            const { data: studentData } = await supabase
              .from('students')
              .select('name, roll_number, class, section')
              .eq('voting_id', vote.student_voting_id)
              .single();

            return {
              id: vote.id,
              student_name: studentData?.name || 'Unknown',
              student_roll_number: studentData?.roll_number || 'N/A',
              student_class: studentData?.class,
              student_section: studentData?.section,
              candidate_name: candidateData?.name || 'Unknown',
              voted_at: vote.voted_at,
              ip_address: vote.ip_address
            } as VoteDetail;
          })
        );
      }

      if (votesError) {
        console.error('Error loading vote details:', votesError);
      }
      
      setVoteDetails(details);

    } catch (error: any) {
      console.error('Failed to load voting results:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "secondary";
      case "active": return "default";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getVotePercentage = (voteCount: number) => {
    return totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <Icon icon="solar:refresh-outline" className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Icon icon="solar:danger-circle-outline" className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Election Not Found</h2>
          <p className="text-muted-foreground mb-4">The election you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/elections")}>
            Back to Elections
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/elections")}>
            <Icon icon="solar:arrow-left-outline" className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{election.title}</h1>
              <Badge variant={getStatusColor(election.status)}>
                {election.status.charAt(0).toUpperCase() + election.status.slice(1)}
              </Badge>
            </div>
            <p className="text-muted-foreground">{election.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon icon="solar:calendar-outline" className="w-4 h-4" />
          <span>{formatDate(election.start_date)} - {formatDate(election.end_date)}</span>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Live Results - Updates in real-time</span>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                <p className="text-3xl font-bold">{totalVotes}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Icon icon="solar:chart-2-outline" className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Candidates</p>
                <p className="text-3xl font-bold">{candidates.length}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Icon icon="solar:users-group-rounded-outline" className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Multiple Votes</p>
                <p className="text-lg font-semibold">
                  {election.allow_multiple_votes ? "Allowed" : "Not Allowed"}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${election.allow_multiple_votes ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Icon 
                  icon={election.allow_multiple_votes ? "solar:check-circle-outline" : "solar:close-circle-outline"} 
                  className={`w-6 h-6 ${election.allow_multiple_votes ? 'text-green-600' : 'text-gray-600'}`} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:chart-2-outline" className="w-5 h-5" />
            Voting Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidate.image_url || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-200 text-blue-700 font-bold">
                      {candidate.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.name}</h3>
                    {candidate.description && (
                      <p className="text-sm text-muted-foreground">{candidate.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{candidate.vote_count}</p>
                  <p className="text-sm text-muted-foreground">{getVotePercentage(candidate.vote_count)}%</p>
                </div>
              </div>
              <Progress value={getVotePercentage(candidate.vote_count)} className="h-3" />
            </div>
          ))}
          
          {candidates.length === 0 && (
            <div className="text-center py-8">
              <Icon icon="solar:users-group-rounded-outline" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No candidates found</p>
              <p className="text-muted-foreground">This election doesn't have any candidates assigned.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vote Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="solar:list-outline" className="w-5 h-5" />
            Vote Details ({voteDetails.length} votes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {voteDetails.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold min-w-[150px]">Student</th>
                    <th className="text-left p-3 font-semibold min-w-[120px]">Roll Number</th>
                    <th className="text-left p-3 font-semibold min-w-[80px]">Class</th>
                    <th className="text-left p-3 font-semibold min-w-[140px]">Voted For</th>
                    <th className="text-left p-3 font-semibold min-w-[140px]">Time</th>
                    <th className="text-left p-3 font-semibold min-w-[120px]">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {voteDetails.map((vote) => (
                    <tr key={vote.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{vote.student_name}</td>
                      <td className="p-3 font-mono text-sm">{vote.student_roll_number}</td>
                      <td className="p-3">
                        {vote.student_class && vote.student_section 
                          ? `${vote.student_class}-${vote.student_section}`
                          : vote.student_class || 'N/A'
                        }
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">{vote.candidate_name}</Badge>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(vote.voted_at)}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground font-mono">
                        {vote.ip_address || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Icon icon="solar:list-outline" className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">No votes yet</p>
              <p className="text-muted-foreground">Votes will appear here in real-time as students vote.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}