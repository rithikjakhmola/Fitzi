// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- REGISTRATION ROUTE ---
app.post('/api/register', async (req, res) => {
  const { name, email, password, age, weight, height, gender } = req.body;

  try {
    // 1. Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Insert into MySQL database
    const sql = `INSERT INTO users (name, email, password, age, weight_kg, height_cm, gender) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    // Execute the query
    const [result] = await db.execute(sql, [name, email, hashedPassword, age, weight, height, gender]);
    
    res.status(201).json({ message: 'User created successfully!', userId: result.insertId });

  } catch (error) {
    console.error(error);
    // Handle MySQL duplicate email error code
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// --- LOGIN ROUTE ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email in MySQL
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    
    if (rows.length === 0) {
      return res.status(400).json({ error: 'User not found' });
    }

    const user = rows[0];

    // 2. Compare the hashed password
    const match = await bcrypt.compare(password, user.password);
    
    if (match) {
      res.json({ message: 'Login successful!', user: { id: user.id, name: user.name, email: user.email }});
    } else {
      res.status(400).json({ error: 'Incorrect password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- CALCULATE & SET GOALS ROUTE ---
app.post('/api/set-goals', async (req, res) => {
  const { userId, activityLevel, goal } = req.body;

  try {
    // 1. Fetch user biometrics
    const [rows] = await db.execute(`SELECT age, weight_kg, height_cm, gender FROM users WHERE id = ?`, [userId]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const user = rows[0];

    // 2. Calculate BMR (Mifflin-St Jeor Equation)
    // Formula: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + s (s = +5 for male, -161 for female)
    let bmr = (10 * user.weight_kg) + (6.25 * user.height_cm) - (5 * user.age);
    bmr = user.gender.toLowerCase() === 'male' ? bmr + 5 : bmr - 161;

    // 3. Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2,          // Little or no exercise
      light: 1.375,            // Light exercise/sports 1-3 days/week
      moderate: 1.55,          // Moderate exercise/sports 3-5 days/week
      active: 1.725,           // Hard exercise/sports 6-7 days a week
    };
    
    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));

    // 4. Calculate Safe Target Calories based on Goal
    let targetCalories = tdee;
    if (goal === 'cut') {
      targetCalories = tdee - 500; // Safe deficit (approx 0.5kg loss/week)
      // Guardrail: Never let calories drop below a safe baseline (e.g., 1200)
      if (targetCalories < 1200) targetCalories = 1200; 
    } else if (goal === 'gain') {
      targetCalories = tdee + 500; // Safe surplus
    }

    // 5. Save to the new user_metrics table
    const sql = `
      INSERT INTO user_metrics (user_id, activity_level, goal, bmr, tdee, target_calories) 
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      activity_level = VALUES(activity_level), goal = VALUES(goal), bmr = VALUES(bmr), tdee = VALUES(tdee), target_calories = VALUES(target_calories)
    `;
    
    await db.execute(sql, [userId, activityLevel, goal, bmr, tdee, targetCalories]);

    // 6. Send the results back to the frontend
    res.json({ 
      message: 'Goals calculated and saved!', 
      metrics: { bmr, tdee, targetCalories, goal }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while calculating goals' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});