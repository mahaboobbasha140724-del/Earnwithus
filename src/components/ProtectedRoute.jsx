import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { currentUser, hasFeatureAccess, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div className="spinner"></div>
        <span style={styles.loaderText}>Checking credentials...</span>
      </div>
    );
  }

  if (!currentUser) {
    // Redirect unauthenticated users to home page and trigger login
    const targetPath = encodeURIComponent(location.pathname);
    return <Navigate to={`/?authAction=login&redirect=${targetPath}`} replace />;
  }

  if (!hasFeatureAccess) {
    // Redirect authenticated users with expired trial to pricing page
    return <Navigate to="/pricing?reason=trial_expired" replace />;
  }

  return children;
}

const styles = {
  loaderContainer: {
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#07080d',
    gap: '16px'
  },
  loaderText: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: 500
  }
};
