import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import type { Role } from '../types/poll.types';
import BrandPill from '../components/BrandPill';

const RoleSelect = () => {
    const [selected, setSelected] = useState<Role>(null);
    const { setRole } = usePoll();
    const navigate = useNavigate();

    const handleContinue = () => {
        if (!selected) return;
        setRole(selected);
        if (selected === 'student') {
            navigate('/student/name');
        } else {
            navigate('/teacher');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            {/* Brand pill */}
            <BrandPill />

            {/* Heading */}
            <h1 className="text-4xl text-center mt-4 mb-2">
                Welcome to the <strong>Live Polling System</strong>
            </h1>
            <p className="text-[#6e6e6e] text-center mb-10 max-w-md">
                Please select the role that best describes you to begin using the live polling system
            </p>

            {/* Role cards */}
            <div className="flex gap-6 mb-10 w-full max-w-2xl">
                {/* Student card */}
                <button
                    onClick={() => setSelected('student')}
                    className={`flex-1 p-6 rounded-xl text-left border-2 transition-colors cursor-pointer ${selected === 'student'
                        ? 'border-[#4f0dce]'
                        : 'border-gray-200'
                        }`}
                >
                    <p className="text-lg font-bold mb-2">I'm a Student</p>
                    <p className="text-[#6e6e6e] text-sm">
                        Submit your answers, participate in live polls, and see how your responses compare with your classmates
                    </p>
                </button>

                {/* Teacher card */}
                <button
                    onClick={() => setSelected('teacher')}
                    className={`flex-1 p-6 rounded-xl text-left border-2 transition-colors cursor-pointer ${selected === 'teacher'
                        ? 'border-[#4f0dce]'
                        : 'border-gray-200'
                        }`}
                >
                    <p className="text-lg font-bold mb-2">I'm a Teacher</p>
                    <p className="text-[#6e6e6e] text-sm">
                        Submit answers and view live poll results in real-time.
                    </p>
                </button>
            </div>

            {/* Continue button */}
            <button
                onClick={handleContinue}
                disabled={!selected}
                className="bg-[#7765da] text-white px-12 py-3 rounded-full font-medium disabled:opacity-40 cursor-pointer hover:opacity-90 transition-opacity"
            >
                Continue
            </button>
        </div>
    );
};

export default RoleSelect;
