-- ============================================================================
-- Phase 1: Database Schema for Role System and Dashboard Features
-- ============================================================================

-- Add role column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user'
CHECK (role IN ('administrator', 'operator', 'user'));

-- Set the first user as administrator (if exists)
UPDATE users
SET role = 'administrator'
WHERE id = (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)
AND role = 'user';

-- ============================================================================
-- Activity Logs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for activity_logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON activity_logs(resource_type, resource_id);

-- ============================================================================
-- User Settings Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    notifications_enabled BOOLEAN DEFAULT true,
    email_notifications BOOLEAN DEFAULT true,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    settings_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_settings for existing users
INSERT INTO user_settings (user_id, theme, notifications_enabled, email_notifications, language, timezone)
SELECT
    id,
    'light',
    true,
    true,
    'en',
    'UTC'
FROM users
WHERE id NOT IN (SELECT user_id FROM user_settings);

-- Trigger to update user_settings updated_at
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_settings_updated_at();

-- ============================================================================
-- Analytics Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics_events
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session ON analytics_events(session_id);

-- ============================================================================
-- Materialized View for Analytics Summary
-- ============================================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS user_analytics_summary AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    COUNT(DISTINCT al.id) as total_activities,
    COUNT(DISTINCT CASE WHEN al.action = 'login' THEN al.id END) as total_logins,
    COUNT(DISTINCT CASE WHEN al.action = 'settings_update' THEN al.id END) as settings_changes,
    COUNT(DISTINCT DATE(al.created_at)) as active_days,
    MAX(al.created_at) as last_activity_at,
    COUNT(DISTINCT ae.id) as total_events
FROM users u
LEFT JOIN activity_logs al ON u.id = al.user_id
LEFT JOIN analytics_events ae ON u.id = ae.user_id
GROUP BY u.id, u.name, u.email, u.role;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_analytics_summary_user_id
ON user_analytics_summary(user_id);

-- ============================================================================
-- Function to Refresh Analytics Summary
-- ============================================================================
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_analytics_summary;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Insert Initial Analytics Event for Existing Users
-- ============================================================================
INSERT INTO analytics_events (user_id, event_type, event_category, event_data)
SELECT
    id,
    'user_created',
    'system',
    jsonb_build_object('created_at', created_at)
FROM users
WHERE id NOT IN (
    SELECT user_id FROM analytics_events
    WHERE event_type = 'user_created' AND user_id IS NOT NULL
);

-- ============================================================================
-- Initial Refresh of Materialized View
-- ============================================================================
REFRESH MATERIALIZED VIEW user_analytics_summary;

-- ============================================================================
-- Grant Permissions (if needed)
-- ============================================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO webapp_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO webapp_user;

-- ============================================================================
-- Summary Output
-- ============================================================================
DO $$
DECLARE
    admin_count INTEGER;
    operator_count INTEGER;
    user_count INTEGER;
    total_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO admin_count FROM users WHERE role = 'administrator';
    SELECT COUNT(*) INTO operator_count FROM users WHERE role = 'operator';
    SELECT COUNT(*) INTO user_count FROM users WHERE role = 'user';
    SELECT COUNT(*) INTO total_users FROM users;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Migration Completed Successfully';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total Users: %', total_users;
    RAISE NOTICE 'Administrators: %', admin_count;
    RAISE NOTICE 'Operators: %', operator_count;
    RAISE NOTICE 'Users: %', user_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '  - activity_logs';
    RAISE NOTICE '  - user_settings';
    RAISE NOTICE '  - analytics_events';
    RAISE NOTICE '  - user_analytics_summary (materialized view)';
    RAISE NOTICE '========================================';
END $$;
