import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoll } from '../context/PollContext';
import useSocket from '../hooks/useSocket';
import BrandPill from '../components/BrandPill';

const StudentName = () => {
    const { studentName, setStudentName, role } = usePoll();
    const [name, setName] = useState(studentName);
    const navigate = useNavigate();

    // Connect socket once we know the role
    useSocket(role);

    const handleContinue = () => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setStudentName(trimmed);
        navigate('/student/waiting');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
            <BrandPill />

            <h1 className="text-4xl text-center mt-4 mb-2">
                Let's <strong>Get Started</strong>
            </h1>
            <p className="text-[#6e6e6e] text-center mb-8 max-w-md">
                If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
            </p>

            <div className="w-full max-w-md mb-6">
                <label className="block text-sm font-medium mb-2">Enter your Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-[#f2f2f2] rounded-lg px-4 py-3 text-base outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                />
            </div>

            <button
                onClick={handleContinue}
                disabled={!name.trim()}
                className="bg-[#7765da] text-white px-12 py-3 rounded-full font-medium disabled:opacity-40 hover:opacity-90 transition-opacity cursor-pointer"
            >
                Continue
            </button>
        </div>
    );
};

export default StudentName;
