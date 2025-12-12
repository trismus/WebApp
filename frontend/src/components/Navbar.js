import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import RoleBadge from './RoleBadge';
import '../styles/Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          WebApp
        </Link>
        <div className="nav-menu">
          {isAuthenticated ? (
            <>
              <span className="nav-user">
                Welcome, {user?.name} <RoleBadge role={user?.role} />
              </span>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/analytics" className="nav-link">
                Analytics
              </Link>
              <Link to="/activity" className="nav-link">
                Activity
              </Link>
              <Link to="/settings" className="nav-link">
                Settings
              </Link>
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
