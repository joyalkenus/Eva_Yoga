import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { getSessions, createSession, deleteAllSessions } from '../services/sessionService';

interface Session {
  id: string;
  createdAt: Date;
  lastUpdated: Date;
}

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const fetchedSessions = await getSessions();
      console.log('Fetched sessions:', fetchedSessions);
      if (Array.isArray(fetchedSessions)) {
        setSessions(fetchedSessions);
      } else {
        console.error('Fetched sessions is not an array:', fetchedSessions);
        setError('Unable to load sessions. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setError('Failed to load sessions. Please try again later.');
    }
  };

  const handleStartNewSession = async () => {
    console.log("Starting new session...");
    try {
      const newSession = await createSession();
      console.log("New session created:", newSession);
      if (newSession && newSession.id) {
        console.log("Navigating to:", `/preparation/${newSession.id}`);
        navigate(`/preparation/${newSession.id}`);
      } else {
        console.error("New session or session ID is undefined");
        setError('Failed to create a new session. Please try again.');
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      setError('Failed to create a new session. Please try again.');
    }
  };

  const handleContinueSession = (sessionId: string) => {
    console.log("Continuing session:", sessionId); // Add logging
    navigate(`/yoga-session/${sessionId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out', error);
      setError('Failed to log out. Please try again.');
    }
  };

  const handleDeleteAllSessions = async () => {
    if (window.confirm('Are you sure you want to delete all sessions? This action cannot be undone.')) {
      setIsDeleting(true);
      setError(null);
      try {
        await deleteAllSessions();
        setSessions([]);
        alert('All sessions have been deleted successfully.');
      } catch (error) {
        console.error('Error deleting all sessions:', error);
        setError('Failed to delete sessions. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="landing-container">
      <div className="glass-panel floating">
        <h1> Embrace Your Yoga 🧘 Journey </h1>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleStartNewSession} className="btn primary-btn">Start New Session</button>
        {sessions.length > 0 ? (
          <div className="previous-sessions">
            <h2>Continue Previous Session</h2>
            {sessions.map(session => (
              <button 
                key={session.id} 
                onClick={() => handleContinueSession(session.id)}
                className="btn secondary-btn"
              >
                Session from {new Date(session.createdAt).toLocaleString()}
              </button>
            ))}
            <button 
              onClick={handleDeleteAllSessions}
              className="btn delete-btn"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete All Sessions'}
            </button>
          </div>
        ) : (
          <p>No previous sessions found.</p>
        )}
        <button onClick={handleLogout} className="btn logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default LandingPage;
