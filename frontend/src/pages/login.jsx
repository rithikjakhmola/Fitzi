// src/pages/Login.jsx
import React, { useState } from 'react';
import './Login.css'; // Importing the styles we just created
import siteModel from "../assets/siteModel.png";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="auth-container">
      {/* Left Side - Form Area */}
      <div className="auth-form-section">
        <div className="form-header">
          <h2>{isLogin ? 'Login' : 'Sign Up'} <span className="diamond-icon">✧</span></h2>
        </div>

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div className="input-group">
              <label>Name</label>
              <input type="text" placeholder="First Last" required />
            </div>
          )}

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="maxi@yahoo.com" required />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          {/* Extra fields only show when in Sign Up mode */}
          {!isLogin && (
            <>
              <div className="input-group row">
                <div style={{ flex: 1 }}>
                  <label>Age</label>
                  <input type="number" placeholder="25" required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Weight (kg)</label>
                  <input type="number" placeholder="75" required style={{ width: '100%' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label>Height (cm)</label>
                  <input type="number" placeholder="180" required style={{ width: '100%' }} />
                </div>
              </div>
              
              <div className="input-group">
                <label>Gender</label>
                <div className="radio-group">
                  <label><input type="radio" name="gender" value="male" required /> Male</label>
                  <label><input type="radio" name="gender" value="female" /> Female</label>
                  <label><input type="radio" name="gender" value="nonbinary" /> Non-binary</label>
                  <label><input type="radio" name="gender" value="unspecified" /> Prefer not to say</label>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Create Account'}
          </button>

          {isLogin && (
            <div className="social-login">
              <button type="button" className="social-btn">Log in with Facebook</button>
              <button type="button" className="social-btn">Log in with Google</button>
            </div>
          )}
        </form>

        <p className="toggle-text">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode} className="toggle-link">
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>

      {/* Right Side - Image Area */}
      <div className="auth-image-section">
        {/* Using a high-quality Unsplash image of a male athlete in an industrial gym setting */}
        <img
          src={siteModel}
          alt="Male Fitness Model"
          className="bg-image"
        />
        <div className="orange-brand-box">
          <h3>fitzi</h3>
        </div>
      </div>
    </div>
  );
};

export default Login;