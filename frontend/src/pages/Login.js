import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    // RFC 5322 compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (!email.includes('.com') && !email.includes('.in') && !email.includes('.org') && !email.includes('.net') && !email.includes('.edu')) {
      return 'Email must be from a valid domain';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 50) return 'Password must be less than 50 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character (@$!%*?&)';
    return '';
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.email = validateEmail(form.email);
    newErrors.password = validatePassword(form.password);
    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== '');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setGeneralError('');
    setLoading(true);
    try {
      await googleLogin(credentialResponse);
      navigate('/');
    } catch (err) {
      setGeneralError(err.response?.data?.message || err.message || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🏘️</div>
          <h2>Welcome back</h2>
          <p>Sign in to NeighborShare</p>
        </div>
        {generalError && <div className="alert alert-error">{generalError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input 
              className={`input ${errors.email ? 'input-error' : ''}`} 
              type="email" 
              name="email" 
              placeholder="you@example.com"
              value={form.email} 
              onChange={handleChange}
              onBlur={() => setErrors({ ...errors, email: validateEmail(form.email) })}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input 
              className={`input ${errors.password ? 'input-error' : ''}`} 
              type="password" 
              name="password" 
              placeholder="Min 8 characters with uppercase, lowercase, number, and special character"
              value={form.password} 
              onChange={handleChange}
              onBlur={() => setErrors({ ...errors, password: validatePassword(form.password) })}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            {form.password && !errors.password && <span style={{color: 'var(--success-color)', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>✓ Password requirements met</span>}
          </div>
          
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setGeneralError('Google login failed. Please try again.')}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
