import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        <div className="dashboard-content">
          <div className="info-card">
            <h2>Your Profile</h2>
            <div className="profile-info">
              <div className="info-row">
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <h3>Analytics</h3>
              <p>View your statistics and insights</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <h3>Settings</h3>
              <p>Manage your account settings</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <h3>Activity</h3>
              <p>Track your recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
