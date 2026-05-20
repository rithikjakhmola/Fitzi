// frontend/src/pages/FoodLogger.jsx
import React, { useState } from 'react';

const FoodLogger = ({ user,onMealLogged }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzedData, setAnalyzedData] = useState(null);

  // Convert uploaded image file to string representation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeFood = async () => {
    if (!imagePreview || !weight) return alert("Please specify a photo and the container gram weight.");
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imagePreview, weightGrams: Number(weight) })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAnalyzedData(data);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error trying to interface with vision endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/log-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...analyzedData })
      });
      
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setImagePreview(null);
        setWeight('');
        setAnalyzedData(null);
        
        // 🚀 FIRE THE TRIGGER: Tell the Dashboard a meal was logged
        if (onMealLogged) onMealLogged(); 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error logging meal metrics.");
    }
  };

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '20px', boxShadow: '0 6px 20px rgba(0,0,0,0.06)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#1a202c', fontSize: '1.6rem' }}>📸 Snap & Log Off-Plan Meal</h2>
      
      {!analyzedData ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#4a5568' }}>Upload Food Photo</label>
            <input type="file" accept="image/*" onChange={handleImageChange} style={{ padding: '0.5rem', border: '1px solid #cbd5e0', borderRadius: '8px' }} />
            {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '12px', marginTop: '1rem' }} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#4a5568' }}>Food Weight (grams)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 250" style={{ padding: '1rem', border: '1px solid #cbd5e0', borderRadius: '8px', fontSize: '1rem' }} />
          </div>

          <button onClick={analyzeFood} disabled={loading} className="submit-btn" style={{ marginTop: '0.5rem', borderRadius: '12px' }}>
            {loading ? "AI Analysis in progress..." : "Identify & Analyze"}
          </button>
        </div>
      ) : (
        <div style={{ background: '#edf2f7', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem', color: '#2d3748' }}>AI Detected: {analyzedData.foodName}</h3>
          <p style={{ color: '#718096', marginBottom: '1.5rem' }}>Calculated details for {analyzedData.weight}g:</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', fontWeight: 'bold', marginBottom: '2rem', fontSize: '1.2rem' }}>
            <span style={{ color: '#e53e3e' }}>🔥 {analyzedData.calories} kcal</span>
            <span style={{ color: '#3182ce' }}>🥩 {analyzedData.protein}g Protein</span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setAnalyzedData(null)} style={{ flex: 1, padding: '1rem', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Re-take
            </button>
            <button onClick={logMeal} style={{ flex: 2, padding: '1rem', background: '#ff6b35', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              Confirm & Log
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodLogger;