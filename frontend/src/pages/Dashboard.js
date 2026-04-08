import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const categoryEmoji = {
  Tools: '🔧', Books: '📚', Electronics: '💻', Appliances: '🏠',
  Sports: '⚽', Furniture: '🪑', Clothing: '👕', Other: '📦',
};

const Dashboard = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/items/my')
      .then(res => setItems(res.data))
      .finally(() => setLoading(false));
  }, []);

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await axios.delete(`/api/items/${id}`);
    setItems(items.filter(i => i._id !== id));
  };

  return (
    <div className="dashboard-page container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">👋 Hello, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-sub">Manage the items you're lending to the community</p>
        </div>
        <Link to="/add-item" className="btn btn-primary btn-lg">+ List New Item</Link>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>You haven't listed any items yet</h3>
          <p>Share something with your neighbors!</p>
          <Link to="/add-item" className="btn btn-primary" style={{ marginTop: 16 }}>List Your First Item</Link>
        </div>
      ) : (
        <div className="my-items-grid">
          {items.map(item => (
            <div key={item._id} className="my-item-card card">
              <div className="my-item-img">
                {item.image ? (
                  <img src={`http://localhost:5000${item.image}`} alt={item.title} />
                ) : (
                  <div className="my-item-placeholder">{categoryEmoji[item.category]}</div>
                )}
                <span className={`item-card-status ${item.availabilityStatus}`}>
                  {item.availabilityStatus === 'available' ? 'Available' : 'Borrowed'}
                </span>
              </div>
              <div className="my-item-body">
                <div className="my-item-cat">{categoryEmoji[item.category]} {item.category}</div>
                <h3 className="my-item-title">{item.title}</h3>
                <p className="my-item-desc">{item.description}</p>
                <div className="my-item-actions">
                  <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">View</Link>
                  <Link to={`/edit-item/${item._id}`} className="btn btn-secondary btn-sm">Edit</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteItem(item._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
