import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Poll } from '../types/poll.types';
import PollCard from '../components/PollCard';

const PollHistory = () => {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/polls/history');
                setPolls(res.data.polls);
            } catch (error) {
                console.error('Failed to load poll history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen px-8 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/teacher')}
                    className="text-[#7765da] hover:underline text-sm cursor-pointer"
                >
                    ← Back
                </button>
                <h1 className="text-3xl">
                    View <strong>Poll History</strong>
                </h1>
            </div>

            {loading && <p className="text-[#6e6e6e]">Loading...</p>}

            {!loading && polls.length === 0 && (
                <p className="text-[#6e6e6e]">No past polls yet.</p>
            )}

            <div className="max-w-2xl flex flex-col gap-10">
                {polls.map((poll, pollIndex) => {
                    const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                    return (
                        <div key={poll._id}>
                            <p className="font-bold text-lg mb-3">Question {pollIndex + 1}</p>
                            <PollCard
                                poll={poll}
                                isResultsView={true}
                                selectedOptionIndex={null}
                                totalVotes={totalVotes}
                                onSelectOption={() => { }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PollHistory;
