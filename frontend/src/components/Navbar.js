import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏘️</span>
          <span className="brand-name">NeighbourShare</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Browse</Link>

          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>My Items</Link>
              <Link to="/requests" className={`nav-link ${isActive('/requests') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Requests</Link>
              <Link to="/messages" className={`nav-link ${isActive('/messages') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Messages</Link>
              <Link to="/add-item" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>+ List Item</Link>
              <div className="nav-user">
                <span className="nav-avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="nav-username">{user.name?.split(' ')[0]}</span>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Join</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
