import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import usePollTimer from '../hooks/usePollTimer';
import useSocket from '../hooks/useSocket';
import PollCard from '../components/PollCard';
import ChatFAB from '../components/ChatFAB';
import socket from '../lib/socket';
import { toast } from 'sonner';

const StudentPoll = () => {
    const {
        activePoll,
        role,
        studentId,
        serverTimeOffset,
        hasVoted,
        setHasVoted,
        selectedOptionIndex,
        setSelectedOptionIndex,
        studentName,
    } = usePoll();

    // Connect socket and register student name
    useSocket(role, studentName);
    const navigate = useNavigate();

    // Calculate how many seconds are left (server-synced)
    const computeRemainingSeconds = () => {
        if (!activePoll || !activePoll.startedAt) return activePoll?.durationSeconds ?? 60;
        const serverNow = Date.now() + serverTimeOffset;
        const elapsed = Math.floor((serverNow - new Date(activePoll.startedAt).getTime()) / 1000);
        return Math.max(0, activePoll.durationSeconds - elapsed);
    };

    const { formatted, isExpired } = usePollTimer(computeRemainingSeconds());

    // If no active poll, go back to waiting
    useEffect(() => {
        if (!activePoll) {
            navigate('/student/waiting');
        }
    }, [activePoll, navigate]);

    // When poll closes, show results (hasVoted state keeps the card visible)
    useEffect(() => {
        if (activePoll?.status === 'closed') {
            setHasVoted(true);
        }
    }, [activePoll?.status, setHasVoted]);

    const handleSelectOption = (index: number) => {
        if (hasVoted || isExpired) return;
        // Optimistic UI: immediately highlight the option
        setSelectedOptionIndex(index);
    };

    const handleSubmit = () => {
        if (selectedOptionIndex === null || !activePoll) return;
        if (hasVoted) return;

        // Optimistically mark as voted so the UI updates immediately
        setHasVoted(true);

        socket.emit('poll:vote', {
            pollId: activePoll._id,
            optionIndex: selectedOptionIndex,
            studentIdentifier: studentId,
        });

        toast.success('Your answer has been submitted!');
    };

    if (!activePoll) return null;

    const isResultsView = hasVoted || isExpired || activePoll.status === 'closed';
    const totalVotes = activePoll.options.reduce((sum, o) => sum + o.votes, 0);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <div className="w-full max-w-2xl">
                {/* Header row: Question label + timer */}
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-bold">Question 1</span>
                    <span className="text-lg">⏱</span>
                    <span className="text-xl font-bold text-[#e53e3e]">{formatted}</span>
                </div>

                <PollCard
                    poll={activePoll}
                    isResultsView={isResultsView}
                    selectedOptionIndex={selectedOptionIndex}
                    totalVotes={totalVotes}
                    onSelectOption={handleSelectOption}
                />

                {/* Submit button (only when not yet voted) */}
                {!isResultsView && (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSubmit}
                            disabled={selectedOptionIndex === null}
                            className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-10 py-3 rounded-full font-medium disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            Submit
                        </button>
                    </div>
                )}

                {/* Post-vote waiting message */}
                {isResultsView && activePoll.status !== 'closed' && (
                    <p className="text-center font-bold mt-6 text-[#1a1a1a]">
                        Wait for the teacher to ask a new question..
                    </p>
                )}
                {isResultsView && activePoll.status === 'closed' && (
                    <p className="text-center font-bold mt-6 text-[#1a1a1a]">
                        Wait for the teacher to ask a new question..
                    </p>
                )}
            </div>

            <ChatFAB />
        </div>
    );
};

export default StudentPoll;
