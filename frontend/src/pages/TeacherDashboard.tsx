import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import usePollTimer from '../hooks/usePollTimer';
import useSocket from '../hooks/useSocket';
import PollCard from '../components/PollCard';
import ChatFAB from '../components/ChatFAB';
import BrandPill from '../components/BrandPill';
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
            <div className="min-h-screen flex flex-col items-center px-4 py-10">
                {/* Top nav bar */}
                <div className="w-full max-w-3xl flex justify-between items-center mb-8">
                    {/* Brand pill */}
                    <BrandPill />
                    <button
                        onClick={() => navigate('/teacher/history')}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        👁 View Poll history
                    </button>
                </div>

                <div className="w-full max-w-3xl">
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
                            className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity cursor-pointer"
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
        <div className="min-h-screen flex flex-col items-center px-4 py-10">
            {/* Content container */}
            <div className="w-full max-w-3xl">

                {/* Top branding */}
                <BrandPill />

                {/* Heading */}
                <h1 className="text-4xl mb-1">
                    Let's <strong>Get Started</strong>
                </h1>
                <p className="text-[#6e6e6e] mb-8">
                    you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
                </p>

                {/* Question card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4 shadow-sm">
                    {/* Question label + timer dropdown */}
                    <div className="flex items-center justify-between mb-3">
                        <label className="font-semibold text-sm">Enter your question</label>
                        <select
                            value={durationSeconds}
                            onChange={(e) => setDurationSeconds(Number(e.target.value))}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-[#7765da]"
                        >
                            {TIMER_OPTIONS.map((t) => (
                                <option key={t} value={t}>
                                    {t} seconds
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Textarea */}
                    <div className="relative">
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value.slice(0, 100))}
                            placeholder="Type your question here..."
                            className="w-full bg-[#f7f7f8] rounded-xl p-4 text-sm resize-none h-28 outline-none focus:ring-2 focus:ring-[#7765da] transition-shadow"
                        />
                        <span className="absolute bottom-3 right-4 text-xs text-[#9e9e9e]">
                            {question.length}/100
                        </span>
                    </div>
                </div>

                {/* Options card */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
                    {/* Column headers */}
                    <div className="flex gap-4 mb-4">
                        <p className="flex-1 font-semibold text-sm">Edit Options</p>
                        <p className="font-semibold text-sm w-36 text-right">Is it Correct?</p>
                    </div>

                    {/* Option rows */}
                    <div className="flex flex-col gap-3">
                        {options.map((opt, index) => (
                            <div key={index} className="flex items-center gap-3">
                                {/* Number badge */}
                                <div className="w-7 h-7 rounded-full bg-[#5767d0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                    {index + 1}
                                </div>
                                {/* Text input */}
                                <input
                                    type="text"
                                    value={opt.text}
                                    onChange={(e) => updateOptionText(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1 bg-[#f7f7f8] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#7765da] transition-shadow"
                                />
                                {/* Yes / No radios */}
                                <div className="flex items-center gap-4 w-36 justify-end">
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
                            </div>
                        ))}
                    </div>

                    {/* Add more option */}
                    <button
                        onClick={addOption}
                        className="mt-5 border-2 border-[#7765da] text-[#7765da] px-5 py-1.5 rounded-full text-sm font-medium hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                        + Add More option
                    </button>
                </div>

                {/* Footer: Ask Question CTA */}
                <div className="flex justify-end">
                    <button
                        onClick={handleAskQuestion}
                        className="bg-gradient-to-r from-[#8F64E1] to-[#1D68BD] text-white px-10 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                    >
                        Ask Question
                    </button>
                </div>
            </div>

            <ChatFAB />
        </div>
    );
};

export default TeacherDashboard;
