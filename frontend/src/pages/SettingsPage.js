import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { settingsAPI } from '../services/api';
import '../styles/SettingsPage.css';

const SettingsPage = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Account settings state
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications_enabled: true,
    email_notifications: true,
    language: 'en',
    timezone: 'UTC'
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      if (response.data.success) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    if (!isAdmin()) return;

    try {
      const response = await settingsAPI.getSystemSettings();
      if (response.data.success) {
        setSystemSettings(response.data.system);
      }
    } catch (error) {
      console.error('Failed to load system settings:', error);
      setMessage({ type: 'error', text: 'Failed to load system settings' });
    }
  };

  useEffect(() => {
    if (activeTab === 'system' && !systemSettings) {
      loadSystemSettings();
    }
  }, [activeTab]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const response = await settingsAPI.updateSettings(settings);

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-page"><div className="loading">Loading settings...</div></div>;
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1>Settings</h1>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-tabs">
          <button
            className={`tab ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account Settings
          </button>
          {isAdmin() && (
            <button
              className={`tab ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              System Settings
            </button>
          )}
        </div>

        {activeTab === 'account' && (
          <div className="settings-content">
            <div className="settings-section">
              <h2>Appearance</h2>
              <div className="setting-item">
                <label>Theme</label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="settings-section">
              <h2>Notifications</h2>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.notifications_enabled}
                    onChange={(e) => handleSettingChange('notifications_enabled', e.target.checked)}
                  />
                  Enable notifications
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input
                    type="checkbox"
                    checked={settings.email_notifications}
                    onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                  />
                  Email notifications
                </label>
              </div>
            </div>

            <div className="settings-section">
              <h2>Localization</h2>
              <div className="setting-item">
                <label>Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </div>
              <div className="setting-item">
                <label>Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
            </div>

            <div className="settings-actions">
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                className="btn-secondary"
                onClick={loadSettings}
                disabled={saving}
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {activeTab === 'system' && isAdmin() && (
          <div className="settings-content">
            <div className="settings-section">
              <h2>User Statistics</h2>
              {systemSettings ? (
                <div className="system-stats-grid">
                  <div className="stat-item">
                    <div className="stat-label">Total Users</div>
                    <div className="stat-value">{systemSettings.statistics.total_users}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Administrators</div>
                    <div className="stat-value">{systemSettings.statistics.admin_count}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Operators</div>
                    <div className="stat-value">{systemSettings.statistics.operator_count}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Regular Users</div>
                    <div className="stat-value">{systemSettings.statistics.user_count}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total Activities</div>
                    <div className="stat-value">{systemSettings.statistics.total_activities}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Total Events</div>
                    <div className="stat-value">{systemSettings.statistics.total_events}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Active Users (7d)</div>
                    <div className="stat-value">{systemSettings.statistics.active_users_7d}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Active Users (30d)</div>
                    <div className="stat-value">{systemSettings.statistics.active_users_30d}</div>
                  </div>
                </div>
              ) : (
                <div className="loading">Loading system statistics...</div>
              )}
            </div>

            {systemSettings && (
              <>
                <div className="settings-section">
                  <h2>Database Information</h2>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Database Name:</div>
                      <div className="info-value">{systemSettings.database.database_name}</div>
                    </div>
                    <div className="info-item">
                      <div className="info-label">Database Size:</div>
                      <div className="info-value">{systemSettings.database.database_size}</div>
                    </div>
                  </div>
                </div>

                <div className="settings-section">
                  <h2>Recent Activity (24h)</h2>
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {systemSettings.recentActivity.map((activity, index) => (
                        <tr key={index}>
                          <td>{activity.action}</td>
                          <td>{activity.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
