// frontend/src/pages/Login.jsx
import React, { useState } from "react";
import "./Login.css";
import siteModel from "../assets/siteModel.png";

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  // State to hold form data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    height: "",
    gender: "",
  });

  const toggleMode = () => setIsLogin(!isLogin);

  // Handle input typing
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "/api/login" : "/api/register";
    const url = `http://localhost:3000${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          // If they successfully logged in, trigger the flow to the Dashboard
          onLoginSuccess(data.user);
        } else {
          // If they successfully signed up, alert them and switch to login mode
          alert(data.message);
          setIsLogin(true);
        }
      } else {
        alert(data.error); // Show error (e.g., "Email already exists")
      }
    } catch (error) {
      console.error("Failed to connect to server", error);
      alert("Cannot connect to server. Is your backend running?");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-section">
        <div className="form-header">
          <h2>
            {isLogin ? "Login" : "Sign Up"}{" "}
            <span className="diamond-icon">✧</span>
          </h2>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="First Last"
                required
                onChange={handleChange}
              />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="maxi@yahoo.com"
              required
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              onChange={handleChange}
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group row">
                <div style={{ flex: 1 }}>
                  <label>Age</label>
                  <input
                    type="number"
                    name="age"
                    placeholder="25"
                    required
                    style={{ width: "100%" }}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    placeholder="75"
                    required
                    style={{ width: "100%" }}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    placeholder="180"
                    required
                    style={{ width: "100%" }}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      required
                      onChange={handleChange}
                    />{" "}
                    Male
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      onChange={handleChange}
                    />{" "}
                    Female
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="nonbinary"
                      onChange={handleChange}
                    />{" "}
                    Non-binary
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="gender"
                      value="unspecified"
                      onChange={handleChange}
                    />{" "}
                    Prefer not to say
                  </label>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? "Login" : "Create Account"}
          </button>
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className="toggle-link">
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>

      <div className="auth-image-section">
        <img src={siteModel} alt="Male Fitness Model" className="bg-image" />
        <div className="orange-brand-box">
          <h3>fitzi</h3>
        </div>
      </div>
    </div>
  );
};

export default Login;
