import React from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebaseConfig';

const Login: React.FC = () => {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="login-container">
      <h2>Welcome to Yoga Assistant AI</h2>
      <p>Please sign in to start your yoga journey</p>
      <button onClick={handleLogin} className="login-button">
        Sign in with Google
      </button>
    </div>
  );
};

export default Login;