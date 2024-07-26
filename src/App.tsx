import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { auth } from './firebaseConfig';
import Login from './components/login';
import Chat from './components/chat';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Yoga Assistant AI</h1>
        </header>
        <main>
          {user ? <Chat user={user} /> : <Login />}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;