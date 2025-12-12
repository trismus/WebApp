import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <Navbar />
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to Our Web App</h1>
          <p className="hero-subtitle">
            A modern full-stack application built with React, Node.js, and PostgreSQL
          </p>
          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="features-section">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Secure Authentication</h3>
            <p>JWT-based authentication with encrypted passwords</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🗄️</div>
            <h3>Database Integration</h3>
            <p>PostgreSQL database for reliable data storage</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Modern Stack</h3>
            <p>Built with React, Node.js, and Docker</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Responsive Design</h3>
            <p>Works seamlessly on all devices</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
