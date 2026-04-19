import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import AddItem from './pages/AddItem';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import Messages from './pages/Messages';
import './index.css';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  return user ? children : <Navigate to="/login" />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/items/:id" element={<ItemDetail />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/add-item" element={<PrivateRoute><AddItem /></PrivateRoute>} />
      <Route path="/edit-item/:id" element={<PrivateRoute><AddItem /></PrivateRoute>} />
      <Route path="/requests" element={<PrivateRoute><Requests /></PrivateRoute>} />
      <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  </>
);

const App = () => (
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  </GoogleOAuthProvider>
);

export default App;
