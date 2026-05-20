// frontend/src/pages/Dashboard.jsx

import React, { useState } from "react";
import "./Login.css";
import DietPlan from "./DietPlan";
import FoodLogger from "./FoodLogger";
import ProgressChart from "./ProgressChart";

const Dashboard = ({ user, onLogout }) => {
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [goal, setGoal] = useState("maintain");
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Phase 5: Tab Navigation State
  const [activeTab, setActiveTab] = useState("blueprint");

  // Phase 4: Dynamic Recalibration Trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
        // Force a fresh plan generation when goals change
        setRefreshTrigger((prev) => prev + 1);
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
      {/* LEFT COLUMN - Form, Metrics, & Analytics (Independent Scroll) */}
      <div
        style={{
          flex: metrics ? "0 0 50%" : "1", // Takes 50% width if right panel is open, otherwise 100%
          height: "100%",
          overflowY: "auto",
          padding: "2rem",
          transition: "flex 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* 🔥 PHASE 5 TOGGLE SWITCH */}
        {metrics && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "2.5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                background: "#e2e8f0",
                padding: "0.4rem",
                borderRadius: "16px",
                gap: "0.5rem",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
                width: "100%",
                maxWidth: "450px",
              }}
            >
              <button
                onClick={() => setActiveTab("blueprint")}
                style={{
                  flex: 1,
                  padding: "0.8rem 1.5rem",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background:
                    activeTab === "blueprint" ? "#fff" : "transparent",
                  color: activeTab === "blueprint" ? "#1a202c" : "#718096",
                  boxShadow:
                    activeTab === "blueprint"
                      ? "0 4px 10px rgba(0,0,0,0.08)"
                      : "none",
                  fontSize: "0.95rem",
                }}
              >
                ⚙️ Blueprint
              </button>
              <button
                onClick={() => setActiveTab("progress")}
                style={{
                  flex: 1,
                  padding: "0.8rem 1.5rem",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: activeTab === "progress" ? "#fff" : "transparent",
                  color: activeTab === "progress" ? "#1a202c" : "#718096",
                  boxShadow:
                    activeTab === "progress"
                      ? "0 4px 10px rgba(0,0,0,0.08)"
                      : "none",
                  fontSize: "0.95rem",
                }}
              >
                📈 Progress
              </button>
            </div>
          </div>
        )}

        {/* CONDITION 1: Show Blueprint & Food Logger */}
        {activeTab === "blueprint" && (
          <div style={{ animation: "fadeIn 0.4s ease-in-out" }}>
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
                      letterSpacing: "-0.5px",
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
                    boxShadow: "0 4px 10px rgba(255, 107, 53, 0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 15px rgba(255, 107, 53, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 10px rgba(255, 107, 53, 0.3)";
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
                  border: "1px solid #edf2f7",
                }}
              >
                <h2
                  style={{
                    marginBottom: "1.8rem",
                    fontSize: "1.5rem",
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
                        marginBottom: "0.8rem",
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
                        backgroundColor: "#fff",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
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
                          transition: "all 0.2s ease",
                          boxShadow:
                            goal === "cut"
                              ? "0 4px 10px rgba(255,107,53,0.15)"
                              : "none",
                        }}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value="cut"
                          checked={goal === "cut"}
                          onChange={(e) => setGoal(e.target.value)}
                          style={{ accentColor: "#ff6b35" }}
                        />
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontWeight: "600",
                            color: "#1a202c",
                          }}
                        >
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
                          transition: "all 0.2s ease",
                          boxShadow:
                            goal === "maintain"
                              ? "0 4px 10px rgba(56,178,172,0.15)"
                              : "none",
                        }}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value="maintain"
                          checked={goal === "maintain"}
                          onChange={(e) => setGoal(e.target.value)}
                          style={{ accentColor: "#38b2ac" }}
                        />
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontWeight: "600",
                            color: "#1a202c",
                          }}
                        >
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
                          transition: "all 0.2s ease",
                          boxShadow:
                            goal === "gain"
                              ? "0 4px 10px rgba(49,130,206,0.15)"
                              : "none",
                        }}
                      >
                        <input
                          type="radio"
                          name="goal"
                          value="gain"
                          checked={goal === "gain"}
                          onChange={(e) => setGoal(e.target.value)}
                          style={{ accentColor: "#3182ce" }}
                        />
                        <span
                          style={{
                            marginLeft: "0.5rem",
                            fontWeight: "600",
                            color: "#1a202c",
                          }}
                        >
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
                      background: "#1a202c",
                      color: "#fff",
                      padding: "1.2rem",
                      border: "none",
                      borderRadius: "14px",
                      fontSize: "1rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "0.3s",
                      marginTop: "1rem",
                      boxShadow: "0 4px 12px rgba(26, 32, 44, 0.2)",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.background = "#2d3748")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.background = "#1a202c")
                    }
                  >
                    {loading ? "Calculating..." : "Calculate My Blueprint"}
                  </button>
                </form>

                {/* Metrics Display */}
                {metrics && (
                  <div
                    style={{
                      marginTop: "3rem",
                      background: "#ffffff",
                      borderRadius: "20px",
                      padding: "2rem",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                      border: "1px solid #edf2f7",
                    }}
                  >
                    <h2
                      style={{
                        marginBottom: "1.5rem",
                        color: "#1a202c",
                        fontSize: "1.5rem",
                      }}
                    >
                      📊 Your Fitzi Blueprint
                    </h2>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1.5rem",
                      }}
                    >
                      {/* Calories */}
                      <div
                        style={{
                          background: "#fff7ed",
                          padding: "1.5rem",
                          borderRadius: "16px",
                          textAlign: "center",
                          border: "1px solid #ffedd5",
                        }}
                      >
                        <p
                          style={{
                            color: "#dd6b20",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            marginBottom: "0.5rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          DAILY CALORIES
                        </p>
                        <h1
                          style={{
                            color: "#ff6b35",
                            fontSize: "2.5rem",
                            margin: "0",
                          }}
                        >
                          {metrics.targetCalories}
                        </h1>
                        <span
                          style={{
                            color: "#c05621",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                          }}
                        >
                          kcal
                        </span>
                      </div>

                      {/* TDEE */}
                      <div
                        style={{
                          background: "#edf2ff",
                          padding: "1.5rem",
                          borderRadius: "16px",
                          textAlign: "center",
                          border: "1px solid #e0e7ff",
                        }}
                      >
                        <p
                          style={{
                            color: "#4c51bf",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            marginBottom: "0.5rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          MAINTENANCE (TDEE)
                        </p>
                        <h1
                          style={{
                            color: "#5a67d8",
                            fontSize: "2.5rem",
                            margin: "0",
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
                          borderRadius: "16px",
                          textAlign: "center",
                          border: "1px solid #d1fae5",
                        }}
                      >
                        <p
                          style={{
                            color: "#2f855a",
                            fontSize: "0.85rem",
                            fontWeight: "700",
                            marginBottom: "0.5rem",
                            letterSpacing: "0.5px",
                          }}
                        >
                          RESTING BURN (BMR)
                        </p>
                        <h1
                          style={{
                            color: "#38a169",
                            fontSize: "2.5rem",
                            margin: "0",
                          }}
                        >
                          {Math.round(metrics.bmr)}
                        </h1>
                      </div>
                    </div>

                    <p
                      style={{
                        marginTop: "2rem",
                        color: "#718096",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        fontStyle: "italic",
                      }}
                    >
                      *Calories are adjusted safely for sustainable progress.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 📸 INTEGRATED FOOD LOGGER WITH REFRESH TRIGGER */}
            {metrics && (
              <div style={{ marginTop: "2.5rem" }}>
                <FoodLogger
                  user={user}
                  onMealLogged={() => setRefreshTrigger((prev) => prev + 1)}
                />
              </div>
            )}
          </div>
        )}

        {/* CONDITION 2: Show Analytics Chart */}
        {activeTab === "progress" && (
          <div style={{ animation: "fadeIn 0.4s ease-in-out" }}>
            <ProgressChart user={user} refreshTrigger={refreshTrigger} />
          </div>
        )}
      </div>

      {/* RIGHT COLUMN - Diet Plan (Independent Scroll) */}
      {metrics && (
        <div
          style={{
            flex: "1",
            height: "100%",
            overflowY: "auto", // Crucial: enables independent scrolling for this column
            background: "#ffffff",
            borderLeft: "1px solid #e2e8f0",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.02)", // Deep, subtle shadow
          }}
        >
          <DietPlan user={user} refreshTrigger={refreshTrigger} />
        </div>
      )}

      {/* Simple fade animation for switching tabs smoothly */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
