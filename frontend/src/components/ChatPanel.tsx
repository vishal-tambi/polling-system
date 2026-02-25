import { useState, useRef, useEffect } from 'react';
import { usePoll } from '../context/PollContext';
import socket from '../lib/socket';

type Tab = 'chat' | 'participants';

const ChatPanel = () => {
    const { chatMessages, setIsChatOpen, role, studentName } = usePoll();
    const [activeTab, setActiveTab] = useState<Tab>('chat');
    const [messageText, setMessageText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const sendMessage = () => {
        const text = messageText.trim();
        if (!text) return;

        socket.emit('chat:send', {
            senderName: role === 'teacher' ? 'Teacher' : studentName,
            role,
            text,
        });

        setMessageText('');
    };

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const myName = role === 'teacher' ? 'Teacher' : studentName;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={() => setIsChatOpen(false)}
            />

            {/* Panel */}
            <div className="fixed right-0 top-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-4 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'chat'
                            ? 'text-[#1a1a1a] border-b-2 border-[#4f0dce]'
                            : 'text-[#6e6e6e]'
                            }`}
                    >
                        Chat
                    </button>
                    <button
                        onClick={() => setActiveTab('participants')}
                        className={`flex-1 py-4 text-sm font-medium cursor-pointer transition-colors ${activeTab === 'participants'
                            ? 'text-[#1a1a1a] border-b-2 border-[#4f0dce]'
                            : 'text-[#6e6e6e]'
                            }`}
                    >
                        Participants
                    </button>
                </div>

                {/* Chat Tab */}
                {activeTab === 'chat' && (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                            {chatMessages.map((msg) => {
                                const isOwn = msg.senderName === myName;
                                return (
                                    <div
                                        key={msg._id}
                                        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                                    >
                                        <span className={`text-xs font-semibold mb-1 ${isOwn ? 'text-[#7765da]' : 'text-[#4f0dce]'}`}>
                                            {msg.senderName}
                                        </span>
                                        <div
                                            className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${isOwn
                                                ? 'bg-[#7765da] text-white rounded-br-sm'
                                                : 'bg-[#373737] text-white rounded-bl-sm'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message input */}
                        <div className="border-t border-gray-200 p-3 flex gap-2">
                            <input
                                type="text"
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Type a message..."
                                className="flex-1 bg-[#f2f2f2] rounded-full px-4 py-2 text-sm outline-none"
                            />
                            <button
                                onClick={sendMessage}
                                className="bg-[#7765da] text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 cursor-pointer"
                            >
                                Send
                            </button>
                        </div>
                    </>
                )}

                {/* Participants Tab */}
                {activeTab === 'participants' && (
                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="flex justify-between text-xs font-medium text-[#6e6e6e] mb-3 px-1">
                            <span>Name</span>
                            {role === 'teacher' && <span>Action</span>}
                        </div>

                        {/* Participant list — teacher can kick students */}
                        <p className="text-sm text-[#6e6e6e] text-center mt-4">
                            Participant list updates in real-time via socket events.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

export default ChatPanel;
