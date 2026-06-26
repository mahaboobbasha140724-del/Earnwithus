import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Users, UserCheck, Clock, ArrowLeft, RefreshCw, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function AdminDashboard() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ total: 0, admins: 0, users: 0 });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usersList = [];
      let adminCount = 0;
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        usersList.push(data);
        if (data.role === 'admin') {
          adminCount++;
        }
      });
      
      usersList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      setUsers(usersList);
      setStats({
        total: usersList.length,
        admins: adminCount,
        users: usersList.length - adminCount
      });
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch registered users. Please make sure Firestore rules allow access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      
      setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role: newRole } : u));
      setStats(prev => {
        const adminDiff = newRole === 'admin' ? 1 : -1;
        return {
          total: prev.total,
          admins: prev.admins + adminDiff,
          users: prev.users - adminDiff
        };
      });
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update user role.");
    }
  };

  if (!isAdmin) {
    return (
      <div style={adminStyles.accessDeniedContainer}>
        <div className="glass-card" style={adminStyles.accessDeniedCard}>
          <Shield size={48} color="#ef4444" style={{ marginBottom: 16 }} />
          <h2 style={{ color: '#ffffff' }}>Access Denied</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 12, lineHeight: 1.5 }}>
            This section is restricted to administrators only. If you are the owner, please log in with your admin credentials.
          </p>
          <Link to="/" className="btn-primary" style={{ marginTop: 24 }}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={adminStyles.container} className="animate-fade-in">
      <div className="page-wrapper">
        
        {/* Header */}
        <div style={adminStyles.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={24} color="#10b981" />
              <span className="badge-glow">ADMIN PORTAL</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', marginTop: 8 }}>User Administration</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: 4 }}>
              Overview and configuration of users registered with Earn With Us.
            </p>
          </div>
          <button onClick={fetchUsers} disabled={loading} style={adminStyles.refreshBtn}>
            <RefreshCw size={14} style={{ marginRight: 6 }} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div style={adminStyles.statsRow}>
          <div className="glass-card" style={adminStyles.statCard}>
            <div style={adminStyles.statIcon}><Users size={20} color="#10b981" /></div>
            <div>
              <div style={adminStyles.statLabel}>Total Members</div>
              <div style={adminStyles.statVal}>{stats.total}</div>
            </div>
          </div>
          
          <div className="glass-card" style={adminStyles.statCard}>
            <div style={adminStyles.statIcon}><Shield size={20} color="#0ea5e9" /></div>
            <div>
              <div style={adminStyles.statLabel}>Administrators</div>
              <div style={adminStyles.statVal}>{stats.admins}</div>
            </div>
          </div>

          <div className="glass-card" style={adminStyles.statCard}>
            <div style={adminStyles.statIcon}><UserCheck size={20} color="#f59e0b" /></div>
            <div>
              <div style={adminStyles.statLabel}>Standard Accounts</div>
              <div style={adminStyles.statVal}>{stats.users}</div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="glass-card" style={adminStyles.tableCard}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: 20 }}>Registered Users Database</h3>
          
          {error && (
            <div style={adminStyles.errorBox}>
              <p style={{ fontSize: '0.85rem', color: '#ef4444' }}>{error}</p>
            </div>
          )}

          {loading ? (
            <div style={adminStyles.loader}>
              <div className="spinner"></div>
              <span style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: 12 }}>Retrieving user profiles...</span>
            </div>
          ) : users.length === 0 ? (
            <div style={adminStyles.emptyState}>
              <Users size={32} color="#64748b" style={{ marginBottom: 12 }} />
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No users found in database.</p>
            </div>
          ) : (
            <div style={adminStyles.tableWrapper}>
              <table style={adminStyles.table}>
                <thead>
                  <tr>
                    <th style={adminStyles.th}>Name</th>
                    <th style={adminStyles.th}>Email</th>
                    <th style={adminStyles.th}>Role</th>
                    <th style={adminStyles.th}>Created At</th>
                    <th style={adminStyles.th}>UID</th>
                    <th style={{ ...adminStyles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} style={adminStyles.tr}>
                      <td style={adminStyles.td}>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{user.displayName || 'Trader'}</div>
                      </td>
                      <td style={adminStyles.td}>
                        <span style={{ color: '#e2e8f0' }}>{user.email}</span>
                      </td>
                      <td style={adminStyles.td}>
                        <span style={{
                          ...adminStyles.roleBadge,
                          color: user.role === 'admin' ? '#10b981' : '#64748b',
                          backgroundColor: user.role === 'admin' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={adminStyles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: '0.8rem' }}>
                          <Clock size={12} />
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td style={adminStyles.td}>
                        <span style={adminStyles.uidStyle}>{user.uid}</span>
                      </td>
                      <td style={{ ...adminStyles.td, textAlign: 'right' }}>
                        {user.email !== 'mahaboobbasha140724@gmail.com' ? (
                          <button 
                            onClick={() => toggleUserRole(user.uid, user.role)}
                            style={{
                              ...adminStyles.actionBtn,
                              borderColor: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                              color: user.role === 'admin' ? '#ef4444' : '#10b981'
                            }}
                          >
                            <Key size={12} style={{ marginRight: 6 }} />
                            {user.role === 'admin' ? 'Revoke Admin' : 'Grant Admin'}
                          </button>
                        ) : (
                          <span style={{ color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic', paddingRight: 10 }}>
                            Super Admin
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const adminStyles = {
  container: {
    padding: '40px 0 80px 0',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '36px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '8px 16px',
    fontWeight: 600,
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    borderStyle: 'solid',
    transition: '0.15s ease',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.08)',
    }
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  statCard: {
    padding: '24px',
    backgroundColor: '#0d0f17',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.04)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statVal: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#ffffff',
    marginTop: 4,
  },
  tableCard: {
    padding: '32px',
    backgroundColor: '#0d0f17',
  },
  tableWrapper: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 16px',
    borderBottom: '2px solid rgba(255,255,255,0.06)',
    color: '#64748b',
    fontSize: '0.8rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.01)',
    }
  },
  td: {
    padding: '16px',
    fontSize: '0.85rem',
    color: '#e2e8f0',
  },
  roleBadge: {
    fontSize: '0.7rem',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  uidStyle: {
    fontFamily: 'monospace',
    color: '#64748b',
    fontSize: '0.75rem',
  },
  actionBtn: {
    backgroundColor: 'transparent',
    border: '1px solid',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: '0.15s ease',
  },
  accessDeniedContainer: {
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
  },
  accessDeniedCard: {
    maxWidth: '440px',
    width: '100%',
    padding: '40px',
    backgroundColor: '#0d0f17',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
  }
};
