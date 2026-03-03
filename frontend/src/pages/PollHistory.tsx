import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { Poll } from '../types/poll.types';
import PollCard from '../components/PollCard';
import BrandPill from '../components/BrandPill';

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
        <div className="min-h-screen flex flex-col items-center px-4 py-10">
            <div className="w-full max-w-3xl">

                {/* Brand pill */}
                <BrandPill className="h-8 mb-6 w-auto" />

                {/* Page header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/teacher')}
                        className="text-[#7765da] hover:opacity-75 text-sm font-medium cursor-pointer transition-opacity"
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl">
                        View <strong>Poll History</strong>
                    </h1>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex flex-col gap-6">
                        {[1, 2].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 w-28 bg-gray-200 rounded mb-3" />
                                <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                                    <div className="h-14 bg-gray-200" />
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="h-12 bg-gray-100 rounded-lg" />
                                        <div className="h-12 bg-gray-100 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && polls.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-5xl mb-4">📋</div>
                        <p className="text-xl font-semibold text-[#1a1a1a] mb-1">No poll history yet</p>
                        <p className="text-[#6e6e6e] text-sm mb-6">
                            Once you ask questions and receive responses, they'll appear here.
                        </p>
                        <button
                            onClick={() => navigate('/teacher')}
                            className="bg-[#7765da] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            Create a Poll
                        </button>
                    </div>
                )}

                {/* Poll list */}
                {!loading && polls.length > 0 && (
                    <div className="flex flex-col gap-8">
                        {polls.map((poll, pollIndex) => {
                            const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
                            return (
                                <div key={poll._id}>
                                    {/* Question label */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="w-7 h-7 rounded-full bg-[#5767d0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {pollIndex + 1}
                                        </span>
                                        <p className="font-bold text-base text-[#1a1a1a]">
                                            Question {pollIndex + 1}
                                        </p>
                                        <span className="ml-auto text-xs text-[#9e9e9e] font-medium bg-gray-100 px-3 py-1 rounded-full">
                                            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                                        </span>
                                    </div>

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
                )}
            </div>
        </div>
    );
};

export default PollHistory;
