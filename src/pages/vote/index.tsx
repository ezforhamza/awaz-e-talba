import { Icon } from "@/components/icon";
import { useVotingBooth } from "@/hooks/useVotingBooth";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/ui/avatar";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Theme Toggle Component
const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button
      variant="ghost"
      size="lg"
      onClick={toggleTheme}
      className="absolute top-6 right-6 h-14 w-14 p-0 rounded-full shadow-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 dark:bg-black/10 dark:hover:bg-black/20 border border-white/20 dark:border-black/20"
    >
      {theme === 'light' ? (
        <Icon icon="solar:moon-bold" className="h-7 w-7 text-gray-700 dark:text-yellow-300" />
      ) : (
        <Icon icon="solar:sun-bold" className="h-7 w-7 text-yellow-500" />
      )}
    </Button>
  );
};

// Step 1: Voting ID Entry
const VotingIdStep = ({ onVerify, isVerifying, error }: {
  onVerify: (id: string) => void;
  isVerifying: boolean;
  error?: string;
}) => {
  const [votingId, setVotingId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (votingId.trim()) {
      onVerify(votingId.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 rounded-full shadow-lg">
              <Icon icon="solar:user-id-bold-duotone" className="w-12 h-12 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Enter Voting ID
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-base mt-2">
            Please enter your unique voting ID to access the ballot
          </p>
        </CardHeader>
        
        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Enter your voting ID (e.g., V1234ABCD)"
                value={votingId}
                onChange={(e) => setVotingId(e.target.value.toUpperCase())}
                className="text-center text-xl font-mono tracking-wider h-14 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl transition-all duration-200"
                disabled={isVerifying}
                autoFocus
              />
              {error && (
                <div className="flex items-center gap-3 text-red-600 dark:text-red-400 text-base bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <Icon icon="solar:danger-bold" className="w-6 h-6 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={!votingId.trim() || isVerifying}
            >
              {isVerifying && <Icon icon="solar:refresh-bold" className="w-6 h-6 mr-3 animate-spin" />}
              {isVerifying ? "Verifying..." : "Continue to Ballot"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Need help? Contact election administrator</p>
              <div className="flex justify-center items-center gap-2 text-green-600 dark:text-green-400">
                <Icon icon="solar:shield-check-bold" className="w-5 h-5" />
                <span className="text-sm font-medium">Secure & Anonymous Voting</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Step 2: Ballot (Candidate Selection)
const BallotStep = ({ 
  student, 
  election, 
  candidates, 
  onVote, 
  onBack,
  isSubmitting,
  hasVoted 
}: {
  student: any;
  election: any;
  candidates: any[];
  onVote: (candidateId: string) => void;
  onBack: () => void;
  isSubmitting: boolean;
  hasVoted: boolean;
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleProceedToConfirm = () => {
    if (selectedCandidate) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmVote = () => {
    onVote(selectedCandidate);
  };

  const handleBackToSelection = () => {
    setShowConfirmation(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const selectedCandidateData = candidates.find(c => c.id === selectedCandidate);

  // Confirmation Modal
  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900 dark:to-red-900 p-6">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-800 rounded-full shadow-lg">
                <Icon icon="solar:check-circle-bold-duotone" className="w-12 h-12 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-300 dark:to-orange-300 bg-clip-text text-transparent">
              Confirm Your Vote
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-base mt-2">
              Please review your selection before submitting
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Selected Candidate Display */}
            <div className="p-6 border-2 border-amber-200 dark:border-amber-700 rounded-xl bg-amber-50 dark:bg-amber-900/20">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-white dark:border-gray-700 shadow-lg">
                  <AvatarImage src={selectedCandidateData?.image_url || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-800 text-amber-700 dark:text-amber-300 text-2xl font-bold">
                    {selectedCandidateData?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedCandidateData?.name}
                  </h3>
                  {selectedCandidateData?.description && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {selectedCandidateData.description}
                    </p>
                  )}
                </div>
                
                <div className="text-center">
                  <Icon icon="solar:check-circle-bold" className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Selected
                  </Badge>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Icon icon="solar:info-circle-bold" className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">Important</p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                    Once submitted, your vote cannot be changed. Please confirm this is your final selection.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBackToSelection}
                disabled={isSubmitting}
                className="flex-1 h-14 text-base border-2"
              >
                <Icon icon="solar:arrow-left-bold" className="w-5 h-5 mr-2" />
                Back to Selection
              </Button>
              <Button
                onClick={handleConfirmVote}
                disabled={isSubmitting}
                className="flex-1 h-14 text-base font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isSubmitting && <Icon icon="solar:refresh-bold" className="w-5 h-5 mr-2 animate-spin" />}
                {isSubmitting ? "Submitting..." : "Submit Vote"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-teal-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Card className="mb-8 shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                onClick={onBack} 
                className="h-12 px-6 text-base hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
              >
                <Icon icon="solar:arrow-left-bold" className="w-6 h-6 mr-3" />
                Back to ID Entry
              </Button>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{student.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">ID: {student.voting_id}</p>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent mb-2">
                {election.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Voting ends: {formatDate(election.end_date)}
              </p>
            </div>
            
            {hasVoted && (
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-xl">
                <div className="flex items-center gap-3 text-amber-700 dark:text-amber-300">
                  <Icon icon="solar:info-circle-bold" className="w-6 h-6 flex-shrink-0" />
                  <span className="font-medium">You have already voted in this election. {election.allow_multiple_votes ? 'You can vote again.' : 'This will replace your previous vote.'}</span>
                </div>
              </div>
            )}

            {election.description && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl">
                <p className="text-blue-800 dark:text-blue-200 font-medium">{election.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Candidates */}
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent flex items-center justify-center gap-3">
              <Icon icon="solar:users-group-rounded-bold-duotone" className="w-10 h-10 text-green-600 dark:text-green-300" />
              Select Your Candidate
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 text-lg mt-3">
              Choose one candidate to cast your vote. Click on a candidate card to select them.
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid gap-8">
              {candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`group p-8 border-4 rounded-3xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 ${
                    selectedCandidate === candidate.id
                      ? "border-green-500 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-teal-900/40 shadow-2xl shadow-green-200 dark:shadow-green-900/70 ring-2 ring-green-300 dark:ring-green-600"
                      : "border-gray-200 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 hover:shadow-xl bg-white dark:bg-gray-800/70 hover:bg-gradient-to-br hover:from-gray-50 hover:to-green-50 dark:hover:from-gray-800/90 dark:hover:to-green-900/20"
                  }`}
                  onClick={() => setSelectedCandidate(candidate.id)}
                >
                  <div className="flex items-center gap-8">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-600 shadow-2xl ring-2 ring-gray-100 dark:ring-gray-700">
                        <AvatarImage src={candidate.image_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 text-green-700 dark:text-green-300 text-3xl font-bold">
                          {candidate.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedCandidate === candidate.id && (
                        <div className="absolute -bottom-3 -right-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full p-3 shadow-2xl ring-2 ring-white dark:ring-gray-700">
                          <Icon icon="solar:check-circle-bold" className="w-7 h-7 text-white animate-pulse" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-bold text-3xl text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-300 transition-colors">
                        {candidate.name}
                      </h3>
                      {candidate.description && (
                        <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                          {candidate.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      {selectedCandidate === candidate.id ? (
                        <>
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 text-lg font-bold shadow-lg animate-pulse">
                            <Icon icon="solar:check-circle-bold" className="w-5 h-5 mr-2" />
                            Selected
                          </Badge>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 border-4 border-white dark:border-gray-700 rounded-full flex items-center justify-center shadow-2xl">
                            <Icon icon="solar:check-bold" className="w-6 h-6 text-white" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-base text-gray-500 dark:text-gray-400 font-medium px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            Tap to select
                          </div>
                          <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 rounded-full group-hover:border-green-400 dark:group-hover:border-green-500 transition-all duration-200 group-hover:shadow-lg">
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleProceedToConfirm}
                disabled={!selectedCandidate}
                className="h-16 px-12 text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 dark:from-green-500 dark:to-emerald-500 dark:hover:from-green-600 dark:hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="solar:arrow-right-bold" className="w-6 h-6 mr-3" />
                Continue to Confirm
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Step 3: Success Confirmation
const SuccessStep = ({ onNewVote }: { onNewVote: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900 dark:to-teal-900 p-6">
      <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardContent className="text-center p-12">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900 dark:to-emerald-800 rounded-full shadow-2xl animate-pulse">
              <Icon icon="solar:check-circle-bold-duotone" className="w-16 h-16 text-green-600 dark:text-green-300" />
            </div>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-300 dark:to-emerald-300 bg-clip-text text-transparent mb-4">
            Vote Submitted Successfully!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 leading-relaxed">
            Thank you for participating in the election. Your vote has been recorded securely and anonymously.
          </p>
          
          <Button 
            onClick={onNewVote} 
            className="w-full h-16 text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Icon icon="solar:user-plus-bold" className="w-7 h-7 mr-3" />
            Next Voter
          </Button>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
            <div className="text-center space-y-3">
              <div className="flex justify-center items-center gap-3 text-green-600 dark:text-green-400">
                <Icon icon="solar:shield-check-bold" className="w-6 h-6" />
                <span className="text-base font-semibold">Your vote is anonymous and secure</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No one can see how you voted. Your privacy is protected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Step 0: Election Selection (only shown when multiple elections) - Currently unused
/* const ElectionSelectionStep = ({ elections, onSelectElection }: {
  elections: any[];
  onSelectElection: (electionId: string) => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-6">
      <Card className="w-full max-w-4xl shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-200 dark:from-purple-900 dark:to-blue-800 rounded-full shadow-lg">
              <Icon icon="solar:clipboard-list-bold-duotone" className="w-12 h-12 text-purple-600 dark:text-purple-300" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-300 dark:to-blue-300 bg-clip-text text-transparent">
            Select Election
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-300 text-base mt-2">
            Multiple elections are currently active. Please choose which election you want to vote in.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {elections.map((election) => (
            <div
              key={election.id}
              className="group p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-xl bg-white dark:bg-gray-800/70 hover:bg-gradient-to-br hover:from-gray-50 hover:to-purple-50 dark:hover:from-gray-800/90 dark:hover:to-purple-900/20"
              onClick={() => onSelectElection(election.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
                    {election.title}
                  </h3>
                  {election.description && (
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {election.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Icon icon="solar:calendar-bold" className="w-4 h-4" />
                      <span>Ends: {formatDate(election.end_date)}</span>
                    </div>
                    {election.allow_multiple_votes && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Multiple Votes Allowed
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <div className="text-purple-600 dark:text-purple-400 font-medium text-sm">
                      Click to select
                    </div>
                  </div>
                  <Icon icon="solar:arrow-right-bold" className="w-6 h-6 text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}; */

// Main Voting Page Component
const VotingPage = () => {
  const boothId = new URLSearchParams(window.location.search).get('booth');
  
  const {
    election,
    candidates,
    votingSession,
    isElectionLoading,
    isVerifyingStudent,
    isSubmittingVote,
    isElectionExpired,
    verifyStudent,
    submitVote,
    resetSession,
    electionError,
    verificationError,
    submissionError
  } = useVotingBooth(boothId);

  const [currentStep, setCurrentStep] = useState<'login' | 'ballot' | 'success'>('login');

  // Handle case where booth ID is invalid or election not found
  useEffect(() => {
    if (!boothId) {
      toast.error("Invalid voting booth URL. Please use the link provided by your administrator.");
    } else if (!isElectionLoading && !election && !electionError) {
      toast.error("No active election found. Please contact your administrator.");
    }
  }, [boothId, election, isElectionLoading, electionError]);

  const handleVerifyStudent = async (votingId: string) => {
    try {
      await verifyStudent(votingId);
      setCurrentStep('ballot');
    } catch (error) {
      // Error is handled by the hook and displayed in the UI
    }
  };

  const handleVote = async (candidateId: string) => {
    try {
      await submitVote(candidateId);
      setCurrentStep('success');
      toast.success("Vote submitted successfully!");
    } catch (error) {
      toast.error(submissionError || "Failed to submit vote. Please try again.");
    }
  };

  const handleNewVote = () => {
    resetSession();
    setCurrentStep('login');
  };

  const handleBack = () => {
    resetSession();
    setCurrentStep('login');
  };

  // Loading state
  if (!boothId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-red-900 dark:to-pink-900 p-6">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="text-center p-12">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900 dark:to-orange-800 rounded-full shadow-lg">
                <Icon icon="solar:danger-bold-duotone" className="w-14 h-14 text-red-600 dark:text-red-300" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-300 dark:to-orange-300 bg-clip-text text-transparent mb-4">
              Invalid Voting Link
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              This voting link is invalid. Please use the correct link provided by your administrator.
            </p>
          </CardContent>
        </Card>
        <ThemeToggle />
      </div>
    );
  }

  if (isElectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-6">
        <div className="text-center">
          <div className="p-6 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900 dark:to-indigo-800 rounded-full shadow-lg mb-8">
            <Icon icon="solar:refresh-bold" className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Voting System</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Please wait while we prepare your ballot...</p>
        </div>
        <ThemeToggle />
      </div>
    );
  }

  // Election expired
  if (isElectionExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-50 dark:from-gray-900 dark:via-slate-900 dark:to-zinc-900 p-6">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="text-center p-12">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-gradient-to-br from-gray-100 to-slate-200 dark:from-gray-900 dark:to-slate-800 rounded-full shadow-lg">
                <Icon icon="solar:clock-circle-bold-duotone" className="w-14 h-14 text-gray-600 dark:text-gray-300" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 dark:from-gray-300 dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Election Has Ended
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              This election has ended and voting is no longer available. Thank you for your participation.
            </p>
            {election && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4 mb-6">
                <div className="text-blue-700 dark:text-blue-300">
                  <p className="font-semibold text-lg">{election.title}</p>
                  <p className="text-sm">Ended: {new Date(election.end_date).toLocaleString()}</p>
                </div>
              </div>
            )}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl p-4">
              <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                <Icon icon="solar:chart-bold" className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">Results Available Soon</p>
                  <p className="text-sm">Election results will be published by the administrator</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <ThemeToggle />
      </div>
    );
  }

  // No active election found
  if (!election) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 dark:from-gray-900 dark:via-red-900 dark:to-pink-900 p-6">
        <Card className="w-full max-w-lg shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
          <CardContent className="text-center p-12">
            <div className="flex justify-center mb-8">
              <div className="p-6 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900 dark:to-orange-800 rounded-full shadow-lg">
                <Icon icon="solar:info-circle-bold-duotone" className="w-14 h-14 text-red-600 dark:text-red-300" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-300 dark:to-orange-300 bg-clip-text text-transparent mb-4">
              No Active Election
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              There is currently no active election. Please contact the election administrator for assistance.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                <Icon icon="solar:phone-bold" className="w-6 h-6 flex-shrink-0" />
                <div className="text-left">
                  <p className="font-semibold">Need Help?</p>
                  <p className="text-sm">Contact your election administrator</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <ThemeToggle />
      </div>
    );
  }

  return (
    <div className="relative">
      <ThemeToggle />
      
      {currentStep === 'login' && (
        <VotingIdStep 
          onVerify={handleVerifyStudent}
          isVerifying={isVerifyingStudent}
          error={verificationError}
        />
      )}
      
      {currentStep === 'ballot' && votingSession.student && (
        <BallotStep
          student={votingSession.student}
          election={votingSession.election}
          candidates={candidates || []}
          onVote={handleVote}
          onBack={handleBack}
          isSubmitting={isSubmittingVote}
          hasVoted={votingSession.student?.has_voted || false}
        />
      )}
      
      {currentStep === 'success' && (
        <SuccessStep onNewVote={handleNewVote} />
      )}
    </div>
  );
};

// Wrapped component with Theme Provider
export default function VotePage() {
  return (
    <ThemeProvider>
      <VotingPage />
    </ThemeProvider>
  );
}