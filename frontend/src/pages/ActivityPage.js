import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { activityAPI } from '../services/api';
import '../styles/ActivityPage.css';

const ActivityPage = () => {
  const { user, isOperator } = useAuth();
  const [activeView, setActiveView] = useState('my');
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [activeView, pagination.offset]);

  const loadStats = async () => {
    try {
      const response = await activityAPI.getActivityStats();
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadActivities = async () => {
    try {
      setLoading(true);
      const params = {
        limit: pagination.limit,
        offset: pagination.offset
      };

      const response = activeView === 'my'
        ? await activityAPI.getMyActivity(params)
        : await activityAPI.getAllActivity(params);

      if (response.data.success) {
        setActivities(response.data.activities);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDetails = (details) => {
    if (!details || Object.keys(details).length === 0) return '-';
    try {
      return JSON.stringify(details, null, 2);
    } catch {
      return String(details);
    }
  };

  const nextPage = () => {
    if (pagination.offset + pagination.limit < pagination.total) {
      setPagination(prev => ({
        ...prev,
        offset: prev.offset + prev.limit
      }));
    }
  };

  const prevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({
        ...prev,
        offset: Math.max(0, prev.offset - prev.limit)
      }));
    }
  };

  return (
    <div className="activity-page">
      <div className="activity-container">
        <h1>Activity</h1>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.total_activities || 0}</div>
              <div className="stat-label">Total Activities</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.total_logins || 0}</div>
              <div className="stat-label">Logins</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.settings_changes || 0}</div>
              <div className="stat-label">Settings Changes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.active_days || 0}</div>
              <div className="stat-label">Active Days</div>
            </div>
          </div>
        )}

        {isOperator() && (
          <div className="view-toggle">
            <button
              className={`toggle-btn ${activeView === 'my' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('my');
                setPagination(prev => ({ ...prev, offset: 0 }));
              }}
            >
              My Activity
            </button>
            <button
              className={`toggle-btn ${activeView === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('all');
                setPagination(prev => ({ ...prev, offset: 0 }));
              }}
            >
              All Activity
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading activities...</div>
        ) : (
          <>
            <div className="activity-table-container">
              <table className="activity-table">
                <thead>
                  <tr>
                    {activeView === 'all' && <th>User</th>}
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Details</th>
                    <th>IP Address</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <tr key={activity.id}>
                        {activeView === 'all' && (
                          <td>
                            <div>{activity.name || 'Unknown'}</div>
                            <div className="small-text">{activity.email}</div>
                          </td>
                        )}
                        <td>
                          <span className="action-badge">{activity.action}</span>
                        </td>
                        <td>
                          {activity.resource_type ? (
                            <>
                              <div>{activity.resource_type}</div>
                              {activity.resource_id && (
                                <div className="small-text">ID: {activity.resource_id}</div>
                              )}
                            </>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          {activity.details && Object.keys(activity.details).length > 0 ? (
                            <details>
                              <summary>View details</summary>
                              <pre className="details-content">
                                {formatDetails(activity.details)}
                              </pre>
                            </details>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <div>{activity.ip_address || '-'}</div>
                        </td>
                        <td>{formatDate(activity.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeView === 'all' ? 6 : 5} style={{ textAlign: 'center' }}>
                        No activities found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {activities.length > 0 && (
              <div className="pagination">
                <button
                  onClick={prevPage}
                  disabled={pagination.offset === 0}
                  className="pagination-btn"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Showing {pagination.offset + 1} - {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total}
                </span>
                <button
                  onClick={nextPage}
                  disabled={pagination.offset + pagination.limit >= pagination.total}
                  className="pagination-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
