import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import usePollTimer from '../hooks/usePollTimer';
import useSocket from '../hooks/useSocket';
import PollCard from '../components/PollCard';
import ChatFAB from '../components/ChatFAB';
import socket from '../lib/socket';
import { toast } from 'sonner';

// Timer dropdown options (in seconds)
const TIMER_OPTIONS = [30, 60, 90, 120];

const TeacherDashboard = () => {
    const { activePoll, role, serverTimeOffset, setActivePoll } = usePoll();
    const navigate = useNavigate();

    // Connect socket
    useSocket(role);

    // Poll creation form state
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
    ]);
    const [durationSeconds, setDurationSeconds] = useState(60);

    // Calculate remaining seconds for the timer (server-synced)
    const computeRemainingSeconds = () => {
        if (!activePoll || !activePoll.startedAt) return activePoll?.durationSeconds ?? 60;
        const serverNow = Date.now() + serverTimeOffset;
        const elapsed = Math.floor((serverNow - new Date(activePoll.startedAt).getTime()) / 1000);
        return Math.max(0, activePoll.durationSeconds - elapsed);
    };

    const { formatted } = usePollTimer(activePoll ? computeRemainingSeconds() : 0);

    const totalVotes = activePoll
        ? activePoll.options.reduce((sum, o) => sum + o.votes, 0)
        : 0;

    // Add a new blank option field
    const addOption = () => {
        setOptions([...options, { text: '', isCorrect: false }]);
    };

    // Update option text
    const updateOptionText = (index: number, text: string) => {
        const updated = [...options];
        updated[index] = { ...updated[index], text };
        setOptions(updated);
    };

    // Toggle correct/incorrect for an option
    const updateOptionCorrect = (index: number, isCorrect: boolean) => {
        const updated = [...options];
        updated[index] = { ...updated[index], isCorrect };
        setOptions(updated);
    };

    // Submit the poll to the server
    const handleAskQuestion = () => {
        const trimmedQuestion = question.trim();
        const validOptions = options.filter((o) => o.text.trim());

        if (!trimmedQuestion) {
            toast.error('Please enter a question');
            return;
        }
        if (validOptions.length < 2) {
            toast.error('Please add at least 2 options');
            return;
        }

        socket.emit('poll:create', {
            question: trimmedQuestion,
            options: validOptions,
            durationSeconds,
        });

        // Reset form for next question
        setQuestion('');
        setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    };

    // Ask a new question (clear active poll from local view)
    const handleAskNew = () => {
        setActivePoll(null);
    };

    // ─── Live Results View ───────────────────────────────────────────────────────
    if (activePoll) {
        return (
            <div className="min-h-screen px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div />
                    <button
                        onClick={() => navigate('/teacher/history')}
                        className="flex items-center gap-2 bg-[#7765da] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        👁 View Poll history
                    </button>
                </div>

                <div className="max-w-2xl">
                    {/* Timer label */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-xl font-bold">Question</span>
                        {activePoll.status === 'active' && (
                            <>
                                <span>⏱</span>
                                <span className="text-xl font-bold text-[#e53e3e]">{formatted}</span>
                            </>
                        )}
                    </div>

                    <PollCard
                        poll={activePoll}
                        isResultsView={true}
                        selectedOptionIndex={null}
                        totalVotes={totalVotes}
                        onSelectOption={() => { }}
                    />

                    {/* Ask new question CTA */}
                    <div className="flex justify-end mt-6">
                        <button
                            onClick={handleAskNew}
                            className="bg-[#7765da] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
                        >
                            + Ask a new question
                        </button>
                    </div>
                </div>

                <ChatFAB />
            </div>
        );
    }

    // ─── Poll Creation Form ──────────────────────────────────────────────────────
    return (
        <div className="min-h-screen px-8 py-8">
            {/* Top branding */}
            <div className="inline-flex items-center gap-2 bg-[#4f0dce] text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                <span>✦</span>
                <span>Intervue Poll</span>
            </div>

            <h1 className="text-4xl mb-1">
                Let's <strong>Get Started</strong>
            </h1>
            <p className="text-[#6e6e6e] mb-8">
                you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
            </p>

            {/* Question area */}
            <div className="flex items-center justify-between mb-2">
                <label className="font-semibold">Enter your question</label>
                <select
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer"
                >
                    {TIMER_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                            {t} seconds
                        </option>
                    ))}
                </select>
            </div>

            <div className="relative mb-6">
                <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value.slice(0, 100))}
                    placeholder="Type your question here..."
                    className="w-full bg-[#f2f2f2] rounded-lg p-4 text-sm resize-none h-28 outline-none"
                />
                <span className="absolute bottom-3 right-4 text-xs text-[#6e6e6e]">
                    {question.length}/100
                </span>
            </div>

            {/* Options */}
            <div className="flex gap-12 mb-6">
                <div className="flex-1">
                    <p className="font-semibold mb-3">Edit Options</p>
                    <div className="flex flex-col gap-3">
                        {options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-[#5767d0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {index + 1}
                                </div>
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => updateOptionText(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 bg-[#f2f2f2] rounded-lg px-3 py-2.5 text-sm outline-none"
                                />
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addOption}
                        className="mt-4 border-2 border-[#7765da] text-[#7765da] px-5 py-1.5 rounded-full text-sm font-medium hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                        + Add More option
                    </button>
                </div>

                {/* Correct answer toggles */}
                <div>
                    <p className="font-semibold mb-3">Is it Correct?</p>
                    <div className="flex flex-col gap-3">
                        {options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-4 h-10">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={opt.isCorrect === true}
                                        onChange={() => updateOptionCorrect(index, true)}
                                        className="accent-[#4f0dce]"
                                    />
                                    <span className="text-sm">Yes</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="radio"
                                        name={`correct-${index}`}
                                        checked={opt.isCorrect === false}
                                        onChange={() => updateOptionCorrect(index, false)}
                                        className="accent-[#4f0dce]"
                                    />
                                    <span className="text-sm">No</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer divider + Ask Question CTA */}
            <div className="border-t border-gray-200 pt-4 flex justify-end">
                <button
                    onClick={handleAskQuestion}
                    className="bg-[#7765da] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                    Ask Question
                </button>
            </div>

            <ChatFAB />
        </div>
    );
};

export default TeacherDashboard;
