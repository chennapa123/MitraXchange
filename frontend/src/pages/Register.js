import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', location: '' });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 50) return 'Name must be less than 50 characters';
    if (!/^[a-zA-Z\s'-]+$/.test(name)) return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    if (/\d/.test(name)) return 'Name cannot contain numbers';
    if (name.trim().split(' ').some(word => word.length === 1 && word !== '-' && word !== "'")) return 'Name parts must be at least 2 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    // RFC 5322 compliant email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (email.split('@')[0].length < 2) return 'Email local part must be at least 2 characters';
    if (!email.includes('.com') && !email.includes('.in') && !email.includes('.org') && !email.includes('.net') && !email.includes('.edu') && !email.includes('.co')) {
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

  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, text: '', color: 'gray' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/(?=.*[a-z])/.test(password) && /(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;
    
    if (strength <= 1) return { level: 1, text: 'Weak', color: '#dc3545' };
    if (strength <= 2) return { level: 2, text: 'Fair', color: '#fd7e14' };
    if (strength <= 3) return { level: 3, text: 'Good', color: '#ffc107' };
    if (strength <= 4) return { level: 4, text: 'Strong', color: '#17a2b8' };
    return { level: 5, text: 'Very Strong', color: '#28a745' };
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
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
    newErrors.name = validateName(form.name);
    newErrors.email = validateEmail(form.email);
    newErrors.password = validatePassword(form.password);
    newErrors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword);
    setErrors(newErrors);
    return !Object.values(newErrors).some(err => err !== '');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.location);
      navigate('/');
    } catch (err) {
      setGeneralError(err.response?.data?.message || 'Registration failed. Please try again.');
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
      setGeneralError(err.response?.data?.message || err.message || 'Google registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <div className="auth-logo">🏘️</div>
          <h2>Join NeighborShare</h2>
          <p>Start sharing with your community</p>
        </div>
        {generalError && <div className="alert alert-error">{generalError}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input 
              className={`input ${errors.name ? 'input-error' : ''}`} 
              type="text" 
              name="name" 
              placeholder="Your full name"
              value={form.name} 
              onChange={handleChange}
              onBlur={() => setErrors({ ...errors, name: validateName(form.name) })}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
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
              placeholder="Min 8 chars: Aa1@special"
              value={form.password} 
              onChange={handleChange}
              onBlur={() => setErrors({ ...errors, password: validatePassword(form.password) })}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
            {form.password && (
              <div style={{marginTop: '8px'}}>
                <div style={{fontSize: '0.85rem', color: getPasswordStrength(form.password).color, fontWeight: 500}}>
                  Strength: {getPasswordStrength(form.password).text}
                </div>
                <div style={{marginTop: '8px'}}>
                  <div style={{fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: '6px'}}>Requirements:</div>
                  <div style={{fontSize: '0.8rem', color: /(?=.*[a-z])/.test(form.password) ? '#28a745' : 'var(--gray-600)', marginBottom: '3px'}}>
                    {/(?=.*[a-z])/.test(form.password) ? '✓' : '○'} One lowercase letter
                  </div>
                  <div style={{fontSize: '0.8rem', color: /(?=.*[A-Z])/.test(form.password) ? '#28a745' : 'var(--gray-600)', marginBottom: '3px'}}>
                    {/(?=.*[A-Z])/.test(form.password) ? '✓' : '○'} One uppercase letter
                  </div>
                  <div style={{fontSize: '0.8rem', color: /(?=.*\d)/.test(form.password) ? '#28a745' : 'var(--gray-600)', marginBottom: '3px'}}>
                    {/(?=.*\d)/.test(form.password) ? '✓' : '○'} One number
                  </div>
                  <div style={{fontSize: '0.8rem', color: /(?=.*[@$!%*?&])/.test(form.password) ? '#28a745' : 'var(--gray-600)', marginBottom: '3px'}}>
                    {/(?=.*[@$!%*?&])/.test(form.password) ? '✓' : '○'} One special character (@$!%*?&)
                  </div>
                  <div style={{fontSize: '0.8rem', color: form.password.length >= 8 ? '#28a745' : 'var(--gray-600)'}}>
                    {form.password.length >= 8 ? '✓' : '○'} At least 8 characters
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input 
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`} 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm your password"
              value={form.confirmPassword} 
              onChange={handleChange}
              onBlur={() => setErrors({ ...errors, confirmPassword: validateConfirmPassword(form.password, form.confirmPassword) })}
            />
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            {form.password && form.confirmPassword && !errors.confirmPassword && <span style={{color: 'var(--success-color)', fontSize: '0.85rem', marginTop: '4px', display: 'block'}}>✓ Passwords match</span>}
          </div>
          
          <div className="form-group">
            <label>Neighborhood / Location <span style={{color:'var(--gray-400)',fontWeight:400}}>(optional)</span></label>
            <input 
              className="input" 
              type="text" 
              name="location" 
              placeholder="e.g. Mangalagiri, AP"
              value={form.location} 
              onChange={handleChange} 
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="google-login-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setGeneralError('Google registration failed. Please try again.')}
            theme="outline"
            size="large"
            width="100%"
          />
        </div>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
