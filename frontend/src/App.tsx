import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { usePoll } from './context/PollContext';
import LandingPage from './pages/LandingPage';
import RoleSelect from './pages/RoleSelect';
import StudentName from './pages/StudentName';
import StudentWaiting from './pages/StudentWaiting';
import StudentPoll from './pages/StudentPoll';
import KickedOut from './pages/KickedOut';
import TeacherDashboard from './pages/TeacherDashboard';
import PollHistory from './pages/PollHistory';
import ChatPanel from './components/ChatPanel';

function App() {
  const { role, isKicked, isChatOpen } = usePoll();

  return (
    <Router>
      <div className="min-h-screen bg-white relative">
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/select" element={<RoleSelect />} />

          {/* Student flow */}
          <Route path="/student/name" element={<StudentName />} />
          <Route path="/student/waiting" element={isKicked ? <KickedOut /> : <StudentWaiting />} />
          <Route path="/student/poll" element={isKicked ? <KickedOut /> : <StudentPoll />} />
          <Route path="/student/kicked" element={<KickedOut />} />

          {/* Teacher flow */}
          <Route path="/teacher" element={role === 'teacher' ? <TeacherDashboard /> : <Navigate to="/" />} />
          <Route path="/teacher/history" element={role === 'teacher' ? <PollHistory /> : <Navigate to="/" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Chat panel is global — shown on top of any page when open */}
        {(role === 'teacher' || role === 'student') && isChatOpen && <ChatPanel />}
      </div>
    </Router>
  );
}

export default App;
