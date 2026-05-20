// frontend/src/pages/Dashboard.jsx

import React, { useState } from "react";
import "./Login.css";
import DietPlan from "./DietPlan";

const Dashboard = ({ user, onLogout }) => {
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("maintain");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculateGoals = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3000/api/set-goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          activityLevel,
          goal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMetrics(data.metrics);
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error setting goals:", error);
      alert("Server Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    // MAIN WRAPPER - Locked to screen height to prevent full-page scrolling
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100%",
        background: "#f4f7fb",
        overflow: "hidden", // Crucial: stops the main window from scrolling
      }}
    >
      {/* LEFT COLUMN - Form & Metrics (Independent Scroll) */}
      <div
        style={{
          flex: metrics ? "0 0 50%" : "1", // Takes 50% width if right panel is open, otherwise 100%
          height: "100%",
          overflowY: "auto", // Crucial: enables independent scrolling for this column
          padding: "2rem",
          transition: "flex 0.4s ease", // Smooth transition when split screen opens
        }}
      >
        <div
          className="auth-form-section"
          style={{
            width: "100%",
            maxWidth: "800px",
            margin: "0 auto",
            background: "#ffffff",
            borderRadius: "24px",
            padding: "2.5rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2.2rem",
                  color: "#1a202c",
                  marginBottom: "0.3rem",
                }}
              >
                Welcome, {user.name} 👋
              </h1>

              <p
                style={{
                  color: "#718096",
                  fontSize: "1rem",
                }}
              >
                Let’s build your perfect fitness blueprint.
              </p>
            </div>

            <button
              onClick={onLogout}
              className="social-btn"
              style={{
                width: "auto",
                padding: "0.7rem 1.4rem",
                borderRadius: "12px",
                background: "#ff6b35",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "1rem",
              }}
            >
              Logout
            </button>
          </div>

          {/* Goal Form */}
          <div
            style={{
              background: "#f8fafc",
              padding: "2rem",
              borderRadius: "20px",
            }}
          >
            <h2
              style={{
                marginBottom: "1.8rem",
                fontSize: "1.7rem",
                color: "#1a202c",
              }}
            >
              ⚡ Step 1: Set Your Fitness Engine
            </h2>

            <form
              onSubmit={calculateGoals}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "2rem",
              }}
            >
              {/* Activity Level */}
              <div className="input-group">
                <label
                  style={{
                    fontWeight: "700",
                    color: "#1a202c",
                    marginBottom: "0.6rem",
                    display: "block",
                  }}
                >
                  Activity Level
                </label>

                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid #cbd5e0",
                    fontSize: "1rem",
                    outline: "none",
                  }}
                >
                  <option value="sedentary">
                    Sedentary (Little to no exercise)
                  </option>
                  <option value="light">
                    Lightly Active (1-3 workouts/week)
                  </option>
                  <option value="moderate">
                    Moderately Active (3-5 workouts/week)
                  </option>
                  <option value="active">
                    Highly Active (6-7 intense workouts/week)
                  </option>
                </select>
              </div>

              {/* Goal */}
              <div className="input-group">
                <label
                  style={{
                    fontWeight: "700",
                    color: "#1a202c",
                    marginBottom: "1rem",
                    display: "block",
                  }}
                >
                  Primary Goal
                </label>

                <div
                  className="radio-group"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "1rem",
                  }}
                >
                  {/* Cut */}
                  <label
                    style={{
                      flex: 1,
                      minWidth: "180px",
                      background: goal === "cut" ? "#ffe5dc" : "#fff",
                      border:
                        goal === "cut"
                          ? "2px solid #ff6b35"
                          : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "14px",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value="cut"
                      checked={goal === "cut"}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                    <span style={{ marginLeft: "0.5rem", fontWeight: "600" }}>
                      🔥 Cut Fat
                    </span>
                  </label>

                  {/* Maintain */}
                  <label
                    style={{
                      flex: 1,
                      minWidth: "180px",
                      background: goal === "maintain" ? "#e6fffa" : "#fff",
                      border:
                        goal === "maintain"
                          ? "2px solid #38b2ac"
                          : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "14px",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value="maintain"
                      checked={goal === "maintain"}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                    <span style={{ marginLeft: "0.5rem", fontWeight: "600" }}>
                      ⚖️ Maintain
                    </span>
                  </label>

                  {/* Gain */}
                  <label
                    style={{
                      flex: 1,
                      minWidth: "180px",
                      background: goal === "gain" ? "#ebf8ff" : "#fff",
                      border:
                        goal === "gain"
                          ? "2px solid #3182ce"
                          : "1px solid #e2e8f0",
                      padding: "1rem",
                      borderRadius: "14px",
                      cursor: "pointer",
                      transition: "0.3s",
                    }}
                  >
                    <input
                      type="radio"
                      name="goal"
                      value="gain"
                      checked={goal === "gain"}
                      onChange={(e) => setGoal(e.target.value)}
                    />
                    <span style={{ marginLeft: "0.5rem", fontWeight: "600" }}>
                      💪 Build Muscle
                    </span>
                  </label>
                </div>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: "#ff6b35",
                  color: "#fff",
                  padding: "1rem",
                  border: "none",
                  borderRadius: "14px",
                  fontSize: "1rem",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
              >
                {loading ? "Calculating..." : "Calculate My Blueprint"}
              </button>
            </form>

            {/* Metrics */}
            {metrics && (
              <div
                style={{
                  marginTop: "2.5rem",
                  background: "#ffffff",
                  borderRadius: "20px",
                  padding: "2rem",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                }}
              >
                <h2
                  style={{
                    marginBottom: "1.5rem",
                    color: "#1a202c",
                    fontSize: "1.6rem",
                  }}
                >
                  📊 Your Fitzi Blueprint
                </h2>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1.5rem",
                  }}
                >
                  {/* Calories */}
                  <div
                    style={{
                      background: "#fff7ed",
                      padding: "1.5rem",
                      borderRadius: "18px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#718096",
                        fontSize: "0.9rem",
                        marginBottom: "0.7rem",
                      }}
                    >
                      DAILY CALORIES
                    </p>

                    <h1
                      style={{
                        color: "#ff6b35",
                        fontSize: "2.3rem",
                      }}
                    >
                      {metrics.targetCalories}
                    </h1>

                    <span style={{ color: "#4a5568" }}>kcal</span>
                  </div>

                  {/* TDEE */}
                  <div
                    style={{
                      background: "#edf2ff",
                      padding: "1.5rem",
                      borderRadius: "18px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#718096",
                        fontSize: "0.9rem",
                        marginBottom: "0.7rem",
                      }}
                    >
                      MAINTENANCE (TDEE)
                    </p>

                    <h1
                      style={{
                        color: "#5a67d8",
                        fontSize: "2.3rem",
                      }}
                    >
                      {metrics.tdee}
                    </h1>
                  </div>

                  {/* BMR */}
                  <div
                    style={{
                      background: "#f0fff4",
                      padding: "1.5rem",
                      borderRadius: "18px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        color: "#718096",
                        fontSize: "0.9rem",
                        marginBottom: "0.7rem",
                      }}
                    >
                      RESTING BURN (BMR)
                    </p>

                    <h1
                      style={{
                        color: "#38a169",
                        fontSize: "2.3rem",
                      }}
                    >
                      {Math.round(metrics.bmr)}
                    </h1>
                  </div>
                </div>

                <p
                  style={{
                    marginTop: "1.5rem",
                    color: "#718096",
                    textAlign: "center",
                    fontSize: "0.95rem",
                  }}
                >
                  *Calories are adjusted safely for sustainable progress.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Diet Plan (Independent Scroll) */}
      {metrics && (
        <div
          style={{
            flex: "1",
            height: "100%",
            overflowY: "auto", // Crucial: enables independent scrolling for this column
            background: "#ffffff",
            borderLeft: "2px solid #e2e8f0",
            boxShadow: "-4px 0 15px rgba(0,0,0,0.03)", // subtle shadow to separate sides
          }}
        >
          <DietPlan user={user} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
