import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { analyticsAPI } from '../services/api';
import '../styles/AnalyticsPage.css';

const AnalyticsPage = () => {
  const { user, isAdmin, isOperator } = useAuth();
  const [activeView, setActiveView] = useState('personal');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [activeView]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      let response;

      switch (activeView) {
        case 'personal':
          response = await analyticsAPI.getMyAnalytics();
          break;
        case 'operator':
          if (isOperator()) {
            response = await analyticsAPI.getOperatorAnalytics();
          }
          break;
        case 'system':
          if (isAdmin()) {
            response = await analyticsAPI.getSystemAnalytics();
          }
          break;
        default:
          response = await analyticsAPI.getMyAnalytics();
      }

      if (response?.data?.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!isAdmin()) return;

    try {
      setRefreshing(true);
      await analyticsAPI.refreshAnalytics();
      await loadAnalytics();
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Analytics</h1>
          {isAdmin() && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="refresh-btn"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          )}
        </div>

        <div className="view-selector">
          <button
            className={`view-btn ${activeView === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveView('personal')}
          >
            Personal
          </button>
          {isOperator() && (
            <button
              className={`view-btn ${activeView === 'operator' ? 'active' : ''}`}
              onClick={() => setActiveView('operator')}
            >
              Overview
            </button>
          )}
          {isAdmin() && (
            <button
              className={`view-btn ${activeView === 'system' ? 'active' : ''}`}
              onClick={() => setActiveView('system')}
            >
              System
            </button>
          )}
        </div>

        {loading ? (
          <div className="loading">Loading analytics...</div>
        ) : (
          <>
            {activeView === 'personal' && analytics && (
              <div className="analytics-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{analytics.summary?.total_activities || 0}</div>
                    <div className="stat-label">Total Activities</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.summary?.total_logins || 0}</div>
                    <div className="stat-label">Total Logins</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.summary?.settings_changes || 0}</div>
                    <div className="stat-label">Settings Changes</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.summary?.active_days || 0}</div>
                    <div className="stat-label">Active Days</div>
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Login History (Last 30 Days)</h2>
                  <div className="trend-list">
                    {analytics.loginHistory?.length > 0 ? (
                      analytics.loginHistory.map((item, index) => (
                        <div key={index} className="trend-item">
                          <span className="trend-date">{formatDate(item.date)}</span>
                          <div className="trend-bar">
                            <div
                              className="trend-fill"
                              style={{
                                width: `${(item.count / Math.max(...analytics.loginHistory.map(i => i.count))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="trend-value">{item.count}</span>
                        </div>
                      ))
                    ) : (
                      <p>No login history available</p>
                    )}
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Activity Trend (Last 7 Days)</h2>
                  <div className="trend-list">
                    {analytics.activityTrend?.length > 0 ? (
                      analytics.activityTrend.map((item, index) => (
                        <div key={index} className="trend-item">
                          <span className="trend-date">{formatDate(item.date)}</span>
                          <div className="trend-bar">
                            <div
                              className="trend-fill"
                              style={{
                                width: `${(item.count / Math.max(...analytics.activityTrend.map(i => i.count))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="trend-value">{item.count}</span>
                        </div>
                      ))
                    ) : (
                      <p>No activity trend available</p>
                    )}
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Action Breakdown</h2>
                  <div className="action-list">
                    {analytics.actionBreakdown?.length > 0 ? (
                      analytics.actionBreakdown.map((item, index) => (
                        <div key={index} className="action-item">
                          <span className="action-name">{item.action}</span>
                          <span className="action-count">{item.count}</span>
                        </div>
                      ))
                    ) : (
                      <p>No action data available</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeView === 'operator' && analytics && (
              <div className="analytics-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.total_users || 0}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.total_activities || 0}</div>
                    <div className="stat-label">Total Activities</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{Math.round(analytics.stats?.avg_logins_per_user || 0)}</div>
                    <div className="stat-label">Avg Logins/User</div>
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Active Users Trend (Last 30 Days)</h2>
                  <div className="trend-list">
                    {analytics.activeUsersTrend?.length > 0 ? (
                      analytics.activeUsersTrend.map((item, index) => (
                        <div key={index} className="trend-item">
                          <span className="trend-date">{formatDate(item.date)}</span>
                          <div className="trend-bar">
                            <div
                              className="trend-fill"
                              style={{
                                width: `${(item.active_users / Math.max(...analytics.activeUsersTrend.map(i => i.active_users))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="trend-value">{item.active_users}</span>
                        </div>
                      ))
                    ) : (
                      <p>No trend data available</p>
                    )}
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Top Active Users</h2>
                  <table className="top-users-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Activities</th>
                        <th>Logins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topUsers?.length > 0 ? (
                        analytics.topUsers.map((user, index) => (
                          <tr key={index}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td><span className="role-badge">{user.role}</span></td>
                            <td>{user.total_activities}</td>
                            <td>{user.total_logins}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: 'center' }}>No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeView === 'system' && analytics && (
              <div className="analytics-content">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.total_users || 0}</div>
                    <div className="stat-label">Total Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.admin_count || 0}</div>
                    <div className="stat-label">Administrators</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.operator_count || 0}</div>
                    <div className="stat-label">Operators</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.user_count || 0}</div>
                    <div className="stat-label">Regular Users</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.active_24h || 0}</div>
                    <div className="stat-label">Active (24h)</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-value">{analytics.stats?.active_7d || 0}</div>
                    <div className="stat-label">Active (7d)</div>
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Daily Active Users (Last 30 Days)</h2>
                  <div className="trend-list">
                    {analytics.dailyActiveUsers?.slice(-30).map((item, index) => (
                      <div key={index} className="trend-item">
                        <span className="trend-date">{formatDate(item.date)}</span>
                        <div className="trend-bar">
                          <div
                            className="trend-fill"
                            style={{
                              width: `${(item.dau / Math.max(...analytics.dailyActiveUsers.map(i => i.dau))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="trend-value">{item.dau}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="analytics-section">
                  <h2>Top Actions</h2>
                  <table className="top-actions-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Count</th>
                        <th>Unique Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.topActions?.map((action, index) => (
                        <tr key={index}>
                          <td><span className="action-badge">{action.action}</span></td>
                          <td>{action.count}</td>
                          <td>{action.unique_users}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
