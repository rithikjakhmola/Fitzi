// frontend/src/pages/DietPlan.jsx
import React, { useState, useEffect } from "react";

const DietPlan = ({ user, refreshTrigger }) => {
  const [plan, setPlan] = useState([]);
  const [dynamicMetrics, setDynamicMetrics] = useState({
    target: 0,
    consumed: 0,
    remaining: 0,
  });
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [hungerStatus, setHungerStatus] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlan = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://fitzi-backend.onrender.com/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, hungerStatus }),
      });
      const data = await response.json();

      if (response.ok) {
        setPlan(data.plan);
        setDynamicMetrics(data.metrics); // Updates with the math from Phase 4
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Error fetching plan", error);
    }
    setIsLoading(false);
  };

  // Listens to the refreshTrigger from the Dashboard.
  // When a meal is logged, this fires and fetches the newly shrunken diet plan.
  useEffect(() => {
    fetchPlan();
  }, [refreshTrigger]);

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "1000px",
        margin: "2rem auto",
        fontFamily: "Inter, sans-serif",
        backgroundColor: "#f7fafc",
        borderRadius: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h2 style={{ margin: 0, color: "#1a202c" }}>
            Today's Live Diet Plan
          </h2>
          <div
            style={{
              marginTop: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <label
              style={{
                fontSize: "0.9rem",
                color: "#4a5568",
                fontWeight: "bold",
              }}
            >
              Feeling extra hungry?
            </label>
            <select
              value={hungerStatus}
              onChange={(e) => setHungerStatus(e.target.value)}
              style={{
                padding: "0.4rem",
                borderRadius: "4px",
                border: "1px solid #cbd5e0",
                outline: "none",
              }}
            >
              <option value="normal">Normal (Standard Portions)</option>
              <option value="starving">Starving (Apply Fitzi Volumizer)</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC PROGRESS METRICS HEADER */}
        <div style={{ display: "flex", gap: "1rem", textAlign: "right" }}>
          <div
            style={{
              backgroundColor: "#fff",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
              borderBottom: "4px solid #e53e3e",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "0.80rem",
                textTransform: "uppercase",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              Eaten Today
            </p>
            <h3 style={{ margin: 0, color: "#e53e3e", fontSize: "1.8rem" }}>
              {dynamicMetrics.consumed}{" "}
              <span style={{ fontSize: "1rem", color: "#a0aec0" }}>kcal</span>
            </h3>
          </div>

          <div
            style={{
              backgroundColor: "#fff",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
              borderBottom: "4px solid #38a169",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#718096",
                fontSize: "0.80rem",
                textTransform: "uppercase",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              Remaining
            </p>
            <h3 style={{ margin: 0, color: "#38a169", fontSize: "1.8rem" }}>
              {dynamicMetrics.remaining}{" "}
              <span style={{ fontSize: "1rem", color: "#a0aec0" }}>kcal</span>
            </h3>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#718096" }}>
          <h3>Recalculating your custom plan...</h3>
          <p>
            Adjusting portions and fetching recipes to fit your remaining
            macros.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {plan.map((meal, index) => (
            <div
              key={index}
              onClick={() => setSelectedRecipe(meal)}
              style={{
                backgroundColor: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 4px 15px rgba(0,0,0,0.04)",
                cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.08)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.04)";
              }}
            >
              <div style={{ position: "relative", height: "180px" }}>
                <img
                  src={meal.image}
                  alt={meal.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "12px",
                    left: "12px",
                    backgroundColor: "rgba(26, 32, 44, 0.85)",
                    backdropFilter: "blur(4px)",
                    color: "#fff",
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                  }}
                >
                  {meal.type}
                </div>
              </div>

              <div style={{ padding: "1.2rem" }}>
                <h4
                  style={{
                    margin: "0 0 0.8rem 0",
                    fontSize: "1.05rem",
                    color: "#1a202c",
                    height: "45px",
                    overflow: "hidden",
                    lineHeight: "1.4",
                  }}
                >
                  {meal.name}
                </h4>

                <p
                  style={{
                    margin: "0 0 1rem 0",
                    color: "#718096",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span style={{ fontSize: "1.2rem" }}>⚖️</span> {meal.portion}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    borderTop: "1px solid #edf2f7",
                    fontSize: "0.9rem",
                    fontWeight: "700",
                  }}
                >
                  <span
                    style={{
                      color: "#e53e3e",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    🔥 {meal.calories} kcal
                  </span>
                  <span
                    style={{
                      color: "#3182ce",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    🥩 {meal.protein}g P
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: "3rem", textAlign: "center" }}>
        <button
          onClick={() => fetchPlan()}
          className="submit-btn"
          style={{
            width: "auto",
            padding: "1rem 2.5rem",
            borderRadius: "12px",
            background: "#1a202c",
            color: "#fff",
            fontWeight: "bold",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = "#2d3748")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#1a202c")}
        >
          Shuffle Remaining Meals
        </button>
      </div>

      {/* RECIPE MODAL */}
      {selectedRecipe && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedRecipe(null)} // Click background to close
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "2.5rem",
              borderRadius: "20px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "85vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "1.6rem",
                  color: "#1a202c",
                  paddingRight: "2rem",
                }}
              >
                {selectedRecipe.name}
              </h3>
              <button
                onClick={() => setSelectedRecipe(null)}
                style={{
                  background: "#edf2f7",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4a5568",
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.background = "#e2e8f0")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.background = "#edf2f7")
                }
              >
                &times;
              </button>
            </div>

            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.name}
              style={{
                width: "100%",
                height: "280px",
                objectFit: "cover",
                borderRadius: "12px",
                marginBottom: "1.5rem",
                boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                padding: "1.2rem",
                backgroundColor: "#f8fafc",
                borderRadius: "12px",
                fontWeight: "bold",
                justifyContent: "space-between",
                border: "1px solid #edf2f7",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "#718096",
                    textTransform: "uppercase",
                  }}
                >
                  Calories
                </span>
                <span style={{ color: "#e53e3e", fontSize: "1.1rem" }}>
                  {selectedRecipe.calories}
                </span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "#718096",
                    textTransform: "uppercase",
                  }}
                >
                  Protein
                </span>
                <span style={{ color: "#3182ce", fontSize: "1.1rem" }}>
                  {selectedRecipe.protein}g
                </span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "#718096",
                    textTransform: "uppercase",
                  }}
                >
                  Carbs
                </span>
                <span style={{ color: "#dd6b20", fontSize: "1.1rem" }}>
                  {selectedRecipe.carbs}g
                </span>
              </div>
              <div style={{ textAlign: "center" }}>
                <span
                  style={{
                    display: "block",
                    fontSize: "0.8rem",
                    color: "#718096",
                    textTransform: "uppercase",
                  }}
                >
                  Fats
                </span>
                <span style={{ color: "#805ad5", fontSize: "1.1rem" }}>
                  {selectedRecipe.fats}g
                </span>
              </div>
            </div>

            <h4
              style={{
                borderBottom: "2px solid #edf2f7",
                paddingBottom: "0.8rem",
                marginBottom: "1.2rem",
                color: "#2d3748",
                fontSize: "1.2rem",
              }}
            >
              Preparation Instructions
            </h4>
            <p
              style={{
                whiteSpace: "pre-line",
                lineHeight: "1.8",
                color: "#4a5568",
                fontSize: "1rem",
              }}
            >
              {selectedRecipe.recipe}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DietPlan;
