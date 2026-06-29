import React, { useState } from 'react';
import { Mail, Lock, User, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'signup' | 'reset'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signUp, resetPassword, loginWithGoogle } = useAuth();

  if (!isOpen) return null;

  const handleClose = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    onClose();
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (activeTab === 'signup') {
      if (password !== confirmPassword) {
        return setError("Passwords do not match.");
      }
      if (password.length < 6) {
        return setError("Password must be at least 6 characters.");
      }
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        handleClose();
      } else if (activeTab === 'signup') {
        await signUp(email, password, name);
        setMessage("Account created successfully!");
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else if (activeTab === 'reset') {
        await resetPassword(email);
        setMessage("Password reset email sent. Please check your inbox.");
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("This email address is already in use.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid credentials. Please verify your inputs.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setMessage("Signed in with Google successfully!");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={handleClose}>
      <div 
        className="glass-card animate-fade-in" 
        style={modalStyles.modal} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button style={modalStyles.closeBtn} onClick={handleClose} aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Tab Selection (only if not reset mode) */}
        {activeTab !== 'reset' ? (
          <div style={modalStyles.tabs}>
            <button 
              style={{
                ...modalStyles.tabBtn,
                color: activeTab === 'login' ? '#10b981' : '#64748b',
                borderBottomColor: activeTab === 'login' ? '#10b981' : 'transparent',
              }}
              onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
            >
              Log In
            </button>
            <button 
              style={{
                ...modalStyles.tabBtn,
                color: activeTab === 'signup' ? '#10b981' : '#64748b',
                borderBottomColor: activeTab === 'signup' ? '#10b981' : 'transparent',
              }}
              onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
            >
              Create Account
            </button>
          </div>
        ) : (
          <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>Reset Password</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: 4 }}>
              Enter your email and we'll send you a password recovery link.
            </p>
          </div>
        )}

        {/* Alerts */}
        {error && (
          <div style={modalStyles.errorBox}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>
          </div>
        )}

        {message && (
          <div style={modalStyles.successBox}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '0.8rem', color: '#10b981' }}>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleFormSubmit} style={modalStyles.form}>
          
          {/* Name Field (Sign Up Only) */}
          {activeTab === 'signup' && (
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Full Name</label>
              <div style={modalStyles.inputWrapper}>
                <User size={16} style={modalStyles.inputIcon} />
                <input 
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={modalStyles.input}
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>Email Address</label>
            <div style={modalStyles.inputWrapper}>
              <Mail size={16} style={modalStyles.inputIcon} />
              <input 
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={modalStyles.input}
              />
            </div>
          </div>

          {/* Password Field (Not Reset) */}
          {activeTab !== 'reset' && (
            <div style={modalStyles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={modalStyles.label}>Password</label>
                {activeTab === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => { setActiveTab('reset'); setError(''); setMessage(''); }}
                    style={modalStyles.forgotBtn}
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div style={modalStyles.inputWrapper}>
                <Lock size={16} style={modalStyles.inputIcon} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={modalStyles.input}
                />
              </div>
            </div>
          )}

          {/* Confirm Password Field (Sign Up Only) */}
          {activeTab === 'signup' && (
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label}>Confirm Password</label>
              <div style={modalStyles.inputWrapper}>
                <Lock size={16} style={modalStyles.inputIcon} />
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={modalStyles.input}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
          >
            {loading ? "Processing..." : activeTab === 'login' ? "Sign In" : activeTab === 'signup' ? "Create Account" : "Send Reset Email"}
            {!loading && <ArrowRight size={14} style={{ marginLeft: 6 }} />}
          </button>
        </form>

        {/* Google Sign In Divider & Button */}
        {activeTab !== 'reset' && (
          <>
            <div style={modalStyles.dividerContainer}>
              <div style={modalStyles.dividerLine}></div>
              <span style={modalStyles.dividerText}>or continue with</span>
              <div style={modalStyles.dividerLine}></div>
            </div>

            <button 
              type="button" 
              onClick={handleGoogleLogin} 
              disabled={loading}
              style={modalStyles.googleBtn}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
                <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 15.01 1 12 1 7.24 1 3.19 3.74 1.24 7.76l3.96 3.07C6.13 7.82 8.84 5.04 12 5.04z"/>
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.37-4.87 3.37-8.55z"/>
                <path fill="#FBBC05" d="M5.2 14.67c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3L1.24 7.76C.45 9.4 0 11.2 0 13.1c0 1.9.45 3.7 1.24 5.34l3.96-3.07z"/>
                <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.93l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.16 0-5.87-2.78-6.8-5.79l-3.96 3.07C3.19 20.26 7.24 23 12 23z"/>
              </svg>
              Sign In with Google
            </button>
          </>
        )}

        {/* Footer Navigation */}
        <div style={modalStyles.footer}>
          {activeTab === 'reset' ? (
            <button 
              type="button" 
              onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
              style={modalStyles.footerLink}
            >
              Back to Login
            </button>
          ) : activeTab === 'login' ? (
            <span style={modalStyles.footerText}>
              New to Earn With Us?{' '}
              <button 
                type="button" 
                onClick={() => { setActiveTab('signup'); setError(''); setMessage(''); }}
                style={modalStyles.footerLink}
              >
                Sign Up Now
              </button>
            </span>
          ) : (
            <span style={modalStyles.footerText}>
              Already have an account?{' '}
              <button 
                type="button" 
                onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
                style={modalStyles.footerLink}
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(5, 5, 8, 0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    width: '100%',
    maxWidth: '420px',
    maxHeight: '90vh',
    overflowY: 'auto',
    backgroundColor: '#0d0f17',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '32px',
    borderRadius: '16px',
    position: 'relative',
    boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.5)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.15s ease',
  },
  tabs: {
    display: 'flex',
    gap: 16,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    marginBottom: 24,
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0 0 12px 0',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    transition: '0.2s ease',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    color: '#64748b',
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '10px 14px 10px 42px',
    color: '#ffffff',
    fontSize: '0.85rem',
    outline: 'none',
    transition: '0.15s ease',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    transition: '0.15s ease',
  },
  errorBox: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: 16,
  },
  successBox: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: 16,
  },
  dividerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '18px 0',
    gap: '12px',
  },
  dividerLine: {
    flexGrow: 1,
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: 500,
  },
  googleBtn: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: 700,
    padding: '10px 14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.15s ease',
    outline: 'none',
  },
  footer: {
    marginTop: 24,
    textAlign: 'center',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    paddingTop: 16,
  },
  footerText: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  footerLink: {
    background: 'none',
    border: 'none',
    color: '#10b981',
    fontWeight: 700,
    cursor: 'pointer',
    padding: 0,
    transition: '0.15s ease',
  }
};
