// frontend/src/pages/ProgressChart.jsx
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const ProgressChart = ({ user, refreshTrigger }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/weekly-progress/${user.id}`);
      const chartData = await response.json();
      if (response.ok) {
        setData(chartData);
      }
    } catch (error) {
      console.error("Error fetching chart data", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProgress();
  }, [refreshTrigger]); // Will automatically refresh if they log a new meal

  // Custom Tooltip for the chart hover effect
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const cals = payload[0].value;
      const target = payload[0].payload.target;
      const isOver = cals > target;
      
      return (
        <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: '#1a202c' }}>{label}</p>
          <p style={{ margin: 0, color: isOver ? '#e53e3e' : '#3182ce', fontWeight: 'bold' }}>
            {cals} kcal <span style={{ color: '#718096', fontWeight: 'normal' }}>(Target: {target})</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ background: '#fff', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '0.5rem', color: '#1a202c', fontSize: '1.8rem' }}>📈 7-Day Adherence</h2>
      <p style={{ color: '#718096', marginBottom: '2rem' }}>Track your consistency against your Fitzi blueprint.</p>

      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>Loading analytics...</div>
      ) : (
        <div style={{ height: '350px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#718096' }} dy={10} />
              <YAxis hide={true} domain={[0, 'dataMax + 500']} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f7fafc' }} />
              
              {/* The Target Line */}
              {data.length > 0 && (
                <ReferenceLine y={data[0].target} stroke="#ff6b35" strokeDasharray="3 3" label={{ position: 'top', value: 'TARGET', fill: '#ff6b35', fontSize: 12, fontWeight: 'bold' }} />
              )}
              
              {/* Dynamic Bars: Blue if under target, Red if over target */}
              <Bar dataKey="calories" radius={[6, 6, 6, 6]} barSize={40} animationDuration={1500}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.calories > entry.target ? '#fc8181' : '#4299e1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProgressChart;