// frontend/src/pages/DietPlan.jsx
import React, { useState, useEffect } from 'react';

const DietPlan = ({ user }) => {
  const [plan, setPlan] = useState([]);
  const [totalCals, setTotalCals] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hungerStatus, setHungerStatus] = useState('normal');
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, hungerStatus })
      });
      const data = await response.json();
      
      if (response.ok) {
        setPlan(data.plan);
        setTotalCals(data.totalCalories);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error fetching plan", error);
    }
    setIsLoading(false);
  };

  // Only fetch automatically if the plan is empty
  useEffect(() => {
    if (plan.length === 0) fetchPlan();
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '2rem auto', fontFamily: 'Inter, sans-serif', backgroundColor: '#f7fafc', borderRadius: '12px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a202c' }}>Today's Live Diet Plan</h2>
          <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '0.9rem', color: '#4a5568', fontWeight: 'bold' }}>Feeling extra hungry?</label>
            <select 
              value={hungerStatus} 
              onChange={(e) => setHungerStatus(e.target.value)}
              style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e0' }}
            >
              <option value="normal">Normal (Standard Portions)</option>
              <option value="starving">Starving (Apply Fitzi Volumizer)</option>
            </select>
          </div>
        </div>
        
        <div style={{ textAlign: 'right', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <p style={{ margin: 0, color: '#718096', fontSize: '0.85rem', textTransform: 'uppercase' }}>Daily Target</p>
          <h3 style={{ margin: 0, color: '#ff7f50', fontSize: '1.8rem' }}>{totalCals} <span style={{fontSize:'1rem', color:'#000'}}>kcal</span></h3>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#718096' }}>
          <h3>Cooking up your custom plan...</h3>
          <p>Searching thousands of recipes to match your exact macros.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {plan.map((meal, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedRecipe(meal)}
              style={{ 
                backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden', 
                boxShadow: '0 4px 10px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ position: 'relative', height: '180px' }}>
                <img src={meal.image} alt={meal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#000', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {meal.type}
                </div>
              </div>
              
              <div style={{ padding: '1rem' }}>
                <div style={{ padding: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#1a202c', height: '40px', overflow: 'hidden' }}>{meal.name}</h4>
                
                {/* ⚖️ Added Gram Weight Display */}
                <p style={{ margin: '0 0 1rem 0', color: '#718096', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  ⚖️ Portion: {meal.portion}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' }}>
                  <span style={{ color: '#e53e3e' }}>🔥 {meal.calories} kcal</span>
                  <span style={{ color: '#3182ce' }}>🥩 {meal.protein}g P</span>
                </div>
              </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: '#4a5568' }}>
                  <span style={{ color: '#e53e3e' }}>🔥 {meal.calories} kcal</span>
                  <span style={{ color: '#3182ce' }}>🥩 {meal.protein}g P</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
         <button onClick={() => fetchPlan()} className="submit-btn" style={{ width: 'auto', padding: '0.8rem 2rem', borderRadius: '8px' }}>
           Generate New Meals
         </button>
      </div>

      {/* RECIPE MODAL */}
      {selectedRecipe && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedRecipe.name}</h3>
              <button onClick={() => setSelectedRecipe(null)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', lineHeight: '1' }}>&times;</button>
            </div>
            
            <img src={selectedRecipe.image} alt={selectedRecipe.name} style={{ width: '100%', height: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#e2e8f0', borderRadius: '8px', fontWeight: 'bold' }}>
              <span>Calories: {selectedRecipe.calories}</span>
              <span>Protein: {selectedRecipe.protein}g</span>
              <span>Carbs: {selectedRecipe.carbs}g</span>
              <span>Fats: {selectedRecipe.fats}g</span>
            </div>

            <h4 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Preparation Instructions:</h4>
            <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: '#2d3748' }}>{selectedRecipe.recipe}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlan;