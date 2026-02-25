import type { Poll } from '../types/poll.types';

interface PollCardProps {
    poll: Poll;
    isResultsView: boolean;
    selectedOptionIndex: number | null;
    totalVotes: number;
    onSelectOption: (index: number) => void;
}

// Shared component used by both Student and Teacher for showing poll options
const PollCard = ({ poll, isResultsView, selectedOptionIndex, totalVotes, onSelectOption }: PollCardProps) => {
    return (
        <div className="rounded-xl border-2 border-[#7765da] overflow-hidden">
            {/* Question header */}
            <div className="bg-[#595959] px-5 py-4">
                <p className="text-white font-medium">{poll.question}</p>
            </div>

            {/* Options */}
            <div className="bg-white p-4 flex flex-col gap-3">
                {poll.options.map((option, index) => {
                    const isSelected = selectedOptionIndex === index;
                    const votePercent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                    if (isResultsView) {
                        // Results bar view
                        return (
                            <div key={index} className="relative h-12 rounded-lg overflow-hidden bg-[#f2f2f2] flex items-center">
                                {/* Bar fill */}
                                <div
                                    className="absolute left-0 top-0 bottom-0 bg-[#5767d0] transition-all duration-700"
                                    style={{ width: `${votePercent}%` }}
                                />
                                {/* Content row */}
                                <div className="relative z-10 flex items-center gap-3 px-4 w-full">
                                    <div className="w-7 h-7 rounded-full bg-[#5767d0] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm font-medium">{option.text}</span>
                                    <span className="ml-auto font-semibold text-sm">{votePercent}%</span>
                                </div>
                            </div>
                        );
                    }

                    // Voting view
                    return (
                        <button
                            key={index}
                            onClick={() => onSelectOption(index)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left w-full transition-colors ${isSelected
                                ? 'border-2 border-[#7765da] bg-white'
                                : 'bg-[#f2f2f2] border-2 border-transparent'
                                }`}
                        >
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSelected ? 'bg-[#5767d0] text-white' : 'bg-gray-400 text-white'
                                }`}>
                                {index + 1}
                            </div>
                            <span className="text-sm font-medium">{option.text}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default PollCard;
