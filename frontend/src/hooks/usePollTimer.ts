import { useState, useEffect } from 'react';

// usePollTimer counts down from initialSeconds
// It accepts a new initialSeconds when joining mid-poll (timer sync)
const usePollTimer = (initialSeconds: number) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    // Reset timer whenever initialSeconds changes (e.g. student refreshes mid-poll)
    useEffect(() => {
        setTimeLeft(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    // Format as MM:SS (e.g. "00:45")
    const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const seconds = String(timeLeft % 60).padStart(2, '0');
    const formatted = `${minutes}:${seconds}`;

    return {
        timeLeft,
        formatted,
        isExpired: timeLeft <= 0,
    };
};

export default usePollTimer;
