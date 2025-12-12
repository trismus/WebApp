import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { activityAPI, analyticsAPI } from '../services/api';
import Navbar from '../components/Navbar';
import RoleBadge from '../components/RoleBadge';
import '../styles/Dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [activityResponse, analyticsResponse] = await Promise.all([
        activityAPI.getActivityStats(),
        analyticsAPI.getMyAnalytics()
      ]);

      setStats({
        activity: activityResponse.data.stats,
        analytics: analyticsResponse.data.analytics.summary
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>

        <div className="dashboard-content">
          {/* Profile Card */}
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
                <span className="info-label">Role:</span>
                <span className="info-value">
                  <RoleBadge role={user?.role} />
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Member Since:</span>
                <span className="info-value">
                  {formatDate(user?.createdAt || user?.created_at)}
                </span>
              </div>
              {stats?.activity?.last_activity_at && (
                <div className="info-row">
                  <span className="info-label">Last Activity:</span>
                  <span className="info-value">
                    {formatDateTime(stats.activity.last_activity_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h2>Quick Stats</h2>
            {loading ? (
              <div className="stats-loading">Loading statistics...</div>
            ) : (
              <div className="stats-overview">
                <div className="stat-item">
                  <div className="stat-number">{stats?.activity?.total_activities || 0}</div>
                  <div className="stat-text">Total Activities</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats?.activity?.total_logins || 0}</div>
                  <div className="stat-text">Total Logins</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats?.activity?.active_days || 0}</div>
                  <div className="stat-text">Active Days</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats?.analytics?.total_events || 0}</div>
                  <div className="stat-text">Events</div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Cards */}
          <div className="stats-grid">
            <div className="stat-card clickable" onClick={() => navigate('/analytics')}>
              <div className="stat-icon">📊</div>
              <h3>Analytics</h3>
              <p>View your statistics and insights</p>
              <div className="card-arrow">→</div>
            </div>
            <div className="stat-card clickable" onClick={() => navigate('/settings')}>
              <div className="stat-icon">⚙️</div>
              <h3>Settings</h3>
              <p>Manage your account settings</p>
              <div className="card-arrow">→</div>
            </div>
            <div className="stat-card clickable" onClick={() => navigate('/activity')}>
              <div className="stat-icon">📝</div>
              <h3>Activity</h3>
              <p>Track your recent activity</p>
              <div className="card-arrow">→</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => navigate('/settings')}>
                <span className="action-icon">⚙️</span>
                <span className="action-text">Change Settings</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/activity')}>
                <span className="action-icon">📋</span>
                <span className="action-text">View Activity</span>
              </button>
              <button className="action-btn" onClick={() => navigate('/analytics')}>
                <span className="action-icon">📈</span>
                <span className="action-text">View Analytics</span>
              </button>
              <button className="action-btn" onClick={() => loadStats()}>
                <span className="action-icon">🔄</span>
                <span className="action-text">Refresh Stats</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
