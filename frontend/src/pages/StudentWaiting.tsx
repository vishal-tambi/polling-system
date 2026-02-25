import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import useSocket from '../hooks/useSocket';
import BrandPill from '../components/BrandPill';
import ChatFAB from '../components/ChatFAB';

const StudentWaiting = () => {
    const { activePoll, role } = usePoll();
    const navigate = useNavigate();

    // Keep socket connected while waiting for a question
    useSocket(role);

    // If a poll becomes active, jump to the poll page
    useEffect(() => {
        if (activePoll && activePoll.status === 'active') {
            navigate('/student/poll');
        }
    }, [activePoll, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <BrandPill />

            {/* Spinner */}
            <div className="w-12 h-12 border-4 border-[#4f0dce] border-t-transparent rounded-full animate-spin mt-6 mb-6" />

            <p className="text-xl font-bold text-center">
                Wait for the teacher to ask questions..
            </p>

            <ChatFAB />
        </div>
    );
};

export default StudentWaiting;
