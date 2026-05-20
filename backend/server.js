// backend/server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const FormData = require("form-data");
const axios = require("axios");
const mysql = require("mysql2/promise"); // Added for the cloud database connection

const app = express();

// --- DEPLOYMENT SAFE PORT & DATABASE CONNECTION ---
// The cloud provider will automatically inject a port into process.env.PORT
const PORT = process.env.PORT || 3000;

// The database pool now reads from your .env file, but falls back to your local 
// settings if the .env file isn't found (so it still works on your computer!)
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'YOUR_LOCAL_PASSWORD_HERE', // <-- Put your local MySQL password here
  database: process.env.DB_NAME || 'fitzi_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false 
  }
});

// Middleware
app.use(cors());
// Increase the payload limit to allow Base64 image uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// --- REGISTRATION ROUTE ---
app.post("/api/register", async (req, res) => {
  const { name, email, password, age, weight, height, gender } = req.body;

  try {
    // 1. Hash the password securely
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 2. Insert into MySQL database
    const sql = `INSERT INTO users (name, email, password, age, weight_kg, height_cm, gender) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    // Execute the query
    const [result] = await db.execute(sql, [
      name,
      email,
      hashedPassword,
      age,
      weight,
      height,
      gender,
    ]);

    res
      .status(201)
      .json({ message: "User created successfully!", userId: result.insertId });
  } catch (error) {
    console.error(error);
    // Handle MySQL duplicate email error code
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

// --- LOGIN ROUTE ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email in MySQL
    const [rows] = await db.execute(`SELECT * FROM users WHERE email = ?`, [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const user = rows[0];

    // 2. Compare the hashed password
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      res.json({
        message: "Login successful!",
        user: { id: user.id, name: user.name, email: user.email },
      });
    } else {
      res.status(400).json({ error: "Incorrect password" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// --- CALCULATE & SET GOALS ROUTE ---
app.post("/api/set-goals", async (req, res) => {
  const { userId, activityLevel, goal } = req.body;

  try {
    // 1. Fetch user biometrics
    const [rows] = await db.execute(
      `SELECT age, weight_kg, height_cm, gender FROM users WHERE id = ?`,
      [userId],
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    const user = rows[0];

    // 2. Calculate BMR (Mifflin-St Jeor Equation)
    let bmr = 10 * user.weight_kg + 6.25 * user.height_cm - 5 * user.age;
    bmr = user.gender.toLowerCase() === "male" ? bmr + 5 : bmr - 161;

    // 3. Calculate TDEE based on activity level
    const activityMultipliers = {
      sedentary: 1.2, 
      light: 1.375, 
      moderate: 1.55, 
      active: 1.725, 
    };

    const tdee = Math.round(bmr * (activityMultipliers[activityLevel] || 1.2));

    // 4. Calculate Safe Target Calories based on Goal
    let targetCalories = tdee;
    if (goal === "cut") {
      targetCalories = tdee - 500; 
      if (targetCalories < 1200) targetCalories = 1200;
    } else if (goal === "gain") {
      targetCalories = tdee + 500; 
    }

    // 5. Save to the new user_metrics table
    const sql = `
      INSERT INTO user_metrics (user_id, activity_level, goal, bmr, tdee, target_calories) 
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      activity_level = VALUES(activity_level), goal = VALUES(goal), bmr = VALUES(bmr), tdee = VALUES(tdee), target_calories = VALUES(target_calories)
    `;

    await db.execute(sql, [
      userId,
      activityLevel,
      goal,
      bmr,
      tdee,
      targetCalories,
    ]);

    // 6. Send the results back to the frontend
    res.json({
      message: "Goals calculated and saved!",
      metrics: { bmr, tdee, targetCalories, goal },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while calculating goals" });
  }
});

// --- PHASE 4: DYNAMIC RECALIBRATION ENGINE ---
app.post("/api/generate-plan", async (req, res) => {
  const { userId, hungerStatus = "normal" } = req.body;

  // 🔴 PASTE YOUR FREE SPOONACULAR API KEY HERE
  const SPOONACULAR_API_KEY = "ce433f883d60464fbe9515217ca72f1e";

  try {
    // 1. Fetch the user's total daily target
    const [userRows] = await db.execute(
      `SELECT target_calories FROM user_metrics WHERE user_id = ?`,
      [userId],
    );
    if (userRows.length === 0)
      return res.status(400).json({ error: "Please set your goals first." });
    const targetCalories = userRows[0].target_calories;

    // 2. Fetch the sum of calories already eaten today from the memory table
    const [logRows] = await db.execute(
      `
      SELECT SUM(calories) as total_eaten 
      FROM daily_logs 
      WHERE user_id = ? AND DATE(logged_at) = CURDATE()
    `,
      [userId],
    );

    const consumedCalories = logRows[0].total_eaten || 0;

    // 3. The Recalibration Math
    let remainingCalories = targetCalories - consumedCalories;
    if (remainingCalories < 0) remainingCalories = 0; 

    // 4. Chronological Logic: What time is it, and what meals are left?
    const currentHour = new Date().getHours();
    let remainingMealsConfig = [];

    if (currentHour < 11) {
      remainingMealsConfig = [
        { name: "Lunch", tag: "main course", percent: 0.4 },
        { name: "Dinner", tag: "main course", percent: 0.4 },
        { name: "Snack", tag: "snack", percent: 0.2 },
      ];
    } else if (currentHour < 16) {
      remainingMealsConfig = [
        { name: "Dinner", tag: "main course", percent: 0.7 },
        { name: "Late Snack", tag: "snack", percent: 0.3 },
      ];
    } else {
      remainingMealsConfig = [
        { name: "Final Meal", tag: "main course", percent: 1.0 },
      ];
    }

    const dailyPlan = [];

    // 5. Fetch ONLY the remaining meals using the newly shrunken budget
    for (const meal of remainingMealsConfig) {
      if (remainingCalories <= 100) break;

      const maxMealCalories = remainingCalories * meal.percent;

      let apiParams = {
        apiKey: SPOONACULAR_API_KEY,
        type: meal.tag,
        maxCalories: Math.round(maxMealCalories),
        minProtein: 10,
        number: 1,
        sort: "random",
        addRecipeInformation: true,
        addRecipeNutrition: true,
      };

      if (hungerStatus === "starving" && meal.tag !== "snack") {
        apiParams.type = "soup,salad";
        apiParams.maxFat = 12;
        apiParams.minFiber = 5;
      }

      const response = await axios.get(
        `https://api.spoonacular.com/recipes/complexSearch`,
        { params: apiParams },
      );

      if (response.data.results && response.data.results.length > 0) {
        const recipe = response.data.results[0];

        const nutrients = recipe.nutrition.nutrients;
        const calories =
          nutrients.find((n) => n.name === "Calories")?.amount || 0;

        // 🍳 ULTRA-SAFE RECIPE EXTRACTION
        let instructions = "Combine ingredients as shown.";

        if (
          recipe.analyzedInstructions &&
          recipe.analyzedInstructions.length > 0 &&
          recipe.analyzedInstructions[0].steps &&
          recipe.analyzedInstructions[0].steps.length > 0
        ) {
          instructions = recipe.analyzedInstructions[0].steps
            .map((s) => `${s.number}. ${s.step}`)
            .join("\n\n");
        } else if (recipe.instructions && recipe.instructions.trim() !== "") {
          instructions = recipe.instructions.replace(/<[^>]*>?/gm, "");
        } else if (recipe.summary && recipe.summary.trim() !== "") {
          instructions = recipe.summary.replace(/<[^>]*>?/gm, "");
        }

        dailyPlan.push({
          id: recipe.id,
          type: meal.name,
          name: recipe.title,
          image: recipe.image,
          recipe: instructions,
          calories: Math.round(calories),
          protein: Math.round(
            nutrients.find((n) => n.name === "Protein")?.amount || 0,
          ),
          carbs: Math.round(
            nutrients.find((n) => n.name === "Carbohydrates")?.amount || 0,
          ),
          fats: Math.round(
            nutrients.find((n) => n.name === "Fat")?.amount || 0,
          ),
          portion: recipe.nutrition.weightPerServing
            ? `${Math.round(recipe.nutrition.weightPerServing.amount)}${recipe.nutrition.weightPerServing.unit}`
            : "1 Serving",
        });
      }
    }

    res.json({
      message: "Dynamic plan generated",
      plan: dailyPlan,
      metrics: {
        target: targetCalories,
        consumed: consumedCalories,
        remaining: remainingCalories,
      },
    });
  } catch (error) {
    console.error(
      "Recalibration Error:",
      error?.response?.data || error.message,
    );
    res
      .status(500)
      .json({
        error: "Failed to dynamically generate the remaining diet plan.",
      });
  }
});

// --- PHASE 3: LOGMEAL VISION FOOD ANALYZER ---
app.post("/api/analyze-food", async (req, res) => {
  const { imageBase64, weightGrams } = req.body;

  // 🔴 PASTE YOUR FREE LOGMEAL API TOKEN HERE
  const LOGMEAL_API_TOKEN = "736fcd303a4c049e881fc23c20c2392e0cddb482";

  try {
    // 1. Clean the Base64 string and convert it back to a binary file buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // 2. Prepare multipart form data for LogMeal
    const form = new FormData();
    form.append("image", imageBuffer, {
      filename: "meal.jpg",
      contentType: "image/jpeg",
    });

    // 3. Send image to LogMeal for segmentation and recognition
    const recognitionResponse = await axios.post(
      "https://api.logmeal.es/v2/image/segmentation/complete",
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${LOGMEAL_API_TOKEN}`,
        },
      },
    );

    const imageId = recognitionResponse.data?.imageId;

    // Check inside segmentation_results first, then fallback to standard recognition_results
    const foodName =
      recognitionResponse.data?.segmentation_results?.[0]
        ?.recognition_results?.[0]?.name ||
      recognitionResponse.data?.recognition_results?.[0]?.name ||
      "Unknown Meal";

    // 4. Fetch the structural nutrition breakdown using the imageId
    const nutritionResponse = await axios.post(
      "https://api.logmeal.es/v2/recipe/nutritionalInfo",
      { imageId },
      {
        headers: { Authorization: `Bearer ${LOGMEAL_API_TOKEN}` },
      },
    );

    const nutritionData = nutritionResponse.data.nutritional_info;

    // 5. Calculate final scaling values based on user's input weight (LogMeal baseline is per 100g)
    const multiplier = weightGrams / 100;

    res.json({
      foodName: foodName,
      calories: Math.round((nutritionData?.calories || 0) * multiplier),
      protein: Math.round(
        (nutritionData?.totalNutrients?.PROCNT?.quantity || 0) * multiplier,
      ),
      carbs: Math.round(
        (nutritionData?.totalNutrients?.CHOCDF?.quantity || 0) * multiplier,
      ),
      fats: Math.round(
        (nutritionData?.totalNutrients?.FAT?.quantity || 0) * multiplier,
      ),
      weight: weightGrams,
    });
  } catch (error) {
    console.error(
      "LogMeal Error detail:",
      error?.response?.data || error.message,
    );
    res
      .status(500)
      .json({ error: "Vision integration failed to analyze the image." });
  }
});

// --- PHASE 3: SAVE CONFIRMED MEAL TO DATABASE ---
app.post("/api/log-meal", async (req, res) => {
  const { userId, foodName, calories, protein, carbs, fats, weight } = req.body;

  try {
    const sql = `INSERT INTO daily_logs (user_id, food_name, calories, protein, carbs, fats, weight_g) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    await db.execute(sql, [
      userId,
      foodName,
      calories,
      protein,
      carbs,
      fats,
      weight,
    ]);
    res.json({ message: "Meal successfully committed to database logs!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log meal to SQL storage." });
  }
});

// --- PHASE 5: ANALYTICS & PROGRESS API ---
app.get('/api/weekly-progress/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Get the user's daily target
    const [userRows] = await db.execute(`SELECT target_calories FROM user_metrics WHERE user_id = ?`, [userId]);
    const target = userRows.length > 0 ? userRows[0].target_calories : 2000;

    // 2. Query the database for the last 7 days of logs, grouped by day
    const [logs] = await db.execute(`
      SELECT DATE_FORMAT(logged_at, '%Y-%m-%d') as log_date, SUM(calories) as total_calories 
      FROM daily_logs 
      WHERE user_id = ? AND logged_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY log_date
      ORDER BY log_date ASC
    `, [userId]);

    // 3. Format the data for the frontend chart (Ensuring we fill in missing days with 0s)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      // Get the exact date string for the last 7 days
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0]; 
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); 

      // Match the date with our SQL results
      const logForDay = logs.find(l => l.log_date === dateStr);

      chartData.push({
        day: dayName,
        calories: logForDay ? Number(logForDay.total_calories) : 0,
        target: target
      });
    }

    res.json(chartData);

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: "Failed to fetch progress data" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});