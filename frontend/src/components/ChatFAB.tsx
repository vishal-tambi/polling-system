import { usePoll } from '../context/PollContext';

// Floating chat button (bottom-right) — opens the Chat panel
const ChatFAB = () => {
    const { setIsChatOpen, isChatOpen } = usePoll();

    return (
        <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="fixed bottom-6 right-6 w-13 h-13 bg-[#7765da] text-white rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity cursor-pointer z-40"
            aria-label="Toggle chat"
        >
            💬
        </button>
    );
};

export default ChatFAB;
