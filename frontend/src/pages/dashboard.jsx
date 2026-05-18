// frontend/src/pages/Dashboard.jsx
import React, { useState } from 'react';
import './Login.css'; // Reusing your existing styles for a consistent look

const Dashboard = ({ user, onLogout }) => {
  const [activityLevel, setActivityLevel] = useState('sedentary');
  const [goal, setGoal] = useState('maintain');
  const [metrics, setMetrics] = useState(null);

  const calculateGoals = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3000/api/set-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, activityLevel, goal })
      });

      const data = await response.json();
      if (response.ok) {
        setMetrics(data.metrics);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error setting goals:", error);
    }
  };

  return (
    <div className="auth-container" style={{ overflowY: 'auto' }}>
      <div className="auth-form-section" style={{ flex: 'none', width: '100%', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2>Welcome, {user.name}!</h2>
          <button onClick={onLogout} className="social-btn" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Logout</button>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Step 1: Set Your Physics Engine</h3>
          
          <form onSubmit={calculateGoals} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="input-group">
              <label style={{ fontWeight: 'bold', color: '#1a202c' }}>Activity Level</label>
              <select 
                value={activityLevel} 
                onChange={(e) => setActivityLevel(e.target.value)}
                style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid #cbd5e0', borderRadius: '4px' }}
              >
                <option value="sedentary">Sedentary (Office job, little to no exercise)</option>
                <option value="light">Lightly Active (1-3 days of exercise/week)</option>
                <option value="moderate">Moderately Active (3-5 days of exercise/week)</option>
                <option value="active">Highly Active (6-7 days of intense exercise)</option>
              </select>
            </div>

            <div className="input-group">
              <label style={{ fontWeight: 'bold', color: '#1a202c' }}>Primary Goal</label>
              <div className="radio-group" style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="goal" value="cut" checked={goal === 'cut'} onChange={(e) => setGoal(e.target.value)} /> 
                  Cut (Lose Fat)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="goal" value="maintain" checked={goal === 'maintain'} onChange={(e) => setGoal(e.target.value)} /> 
                  Maintain Weight
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="radio" name="goal" value="gain" checked={goal === 'gain'} onChange={(e) => setGoal(e.target.value)} /> 
                  Gain (Build Muscle)
                </label>
              </div>
            </div>

            <button type="submit" className="submit-btn" style={{ marginTop: '0' }}>Calculate My Blueprint</button>
          </form>

          {/* Results Display */}
          {metrics && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#e2e8f0', borderRadius: '8px', borderLeft: '5px solid #ff7f50' }}>
              <h3 style={{ marginBottom: '1rem', color: '#1a202c' }}>Your Personal Fitzi Blueprint</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                
                <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Calorie Goal</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff7f50' }}>{metrics.targetCalories} <span style={{fontSize: '1rem', color: '#000'}}>kcal</span></p>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Maintenance (TDEE)</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.tdee}</p>
                </div>

                <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '4px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.875rem', color: '#718096', textTransform: 'uppercase', letterSpacing: '1px' }}>Resting Burn (BMR)</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.round(metrics.bmr)}</p>
                </div>

              </div>
              <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#4a5568', textAlign: 'center' }}>
                *We've applied a safe, science-backed modifier of ±500 calories to ensure sustainable progress.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;