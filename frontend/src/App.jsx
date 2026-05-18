// frontend/src/App.jsx
import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  // State to track if a user is logged in and store their data
  const [currentUser, setCurrentUser] = useState(null);

  // Function to pass to the Login component
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  // Function to handle logging out
  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <>
      {/* Conditional Rendering: If currentUser exists, show Dashboard, else show Login */}
      {currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;