import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ children, requiredRole }) => {
  const { user, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px'
      }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '1rem', color: '#e74c3c' }}>403</h1>
        <h2 style={{ marginBottom: '1rem' }}>Access Denied</h2>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          You don't have permission to access this page.
          <br />
          Required role: <strong>{requiredRole}</strong>, Your role: <strong>{user.role}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return children;
};

export default RoleRoute;
