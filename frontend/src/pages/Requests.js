import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Requests.css';

const statusBadge = {
  pending: 'badge-yellow',
  approved: 'badge-green',
  rejected: 'badge-red',
  returned: 'badge-blue',
};

const Requests = () => {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/requests/received'),
      axios.get('/api/requests/sent'),
    ]).then(([r1, r2]) => {
      setReceived(r1.data);
      setSent(r2.data);
    }).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, isReceived) => {
    try {
      const res = await axios.put(`/api/requests/${id}/status`, { status });
      if (isReceived) {
        setReceived(prev => prev.map(r => r._id === id ? res.data : r));
      } else {
        setSent(prev => prev.map(r => r._id === id ? res.data : r));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update');
    }
  };

  const requests = tab === 'received' ? received : sent;

  return (
    <div className="requests-page container">
      <h1 className="page-title">📋 Borrow Requests</h1>
      <p className="page-sub">Manage lending and borrowing requests</p>

      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>
          Received ({received.length})
        </button>
        <button className={`tab-btn ${tab === 'sent' ? 'active' : ''}`} onClick={() => setTab('sent')}>
          Sent ({sent.length})
        </button>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📭</div>
          <h3>No {tab} requests</h3>
          <p>{tab === 'received' ? 'When someone wants to borrow your items, they\'ll appear here.' : 'Browse items and send a borrow request!'}</p>
          {tab === 'sent' && <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Items</Link>}
        </div>
      ) : (
        <div className="requests-list">
          {requests.map(req => (
            <div key={req._id} className="request-card card">
              <div className="request-item-info">
                {req.itemId?.image ? (
                  <img src={`http://localhost:5000${req.itemId.image}`} alt="" className="req-item-img" />
                ) : (
                  <div className="req-item-img-placeholder">📦</div>
                )}
                <div>
                  <h4>{req.itemId?.title}</h4>
                  <p className="req-item-cat">{req.itemId?.category}</p>
                </div>
              </div>

              <div className="request-details">
                {tab === 'received' ? (
                  <p>👤 From: <strong>{req.borrowerId?.name}</strong> — {req.borrowerId?.location}</p>
                ) : (
                  <p>👤 Owner: <strong>{req.ownerId?.name}</strong></p>
                )}
                {req.message && <p className="req-message">💬 "{req.message}"</p>}
                {req.expectedReturnDate && (
                  <p>📅 Return by: {new Date(req.expectedReturnDate).toLocaleDateString()}</p>
                )}
                <p className="req-date">Requested: {new Date(req.requestDate).toLocaleDateString()}</p>
              </div>

              <div className="request-actions">
                <span className={`badge ${statusBadge[req.status]}`}>
                  {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                </span>

                {tab === 'received' && req.status === 'pending' && (
                  <div className="action-btns">
                    <button className="btn btn-primary btn-sm" onClick={() => updateStatus(req._id, 'approved', true)}>
                      ✓ Approve
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => updateStatus(req._id, 'rejected', true)}>
                      ✗ Reject
                    </button>
                  </div>
                )}

                {tab === 'received' && req.status === 'approved' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(req._id, 'returned', true)}>
                    📦 Mark Returned
                  </button>
                )}

                <Link
                  to={`/messages/${tab === 'received' ? req.borrowerId?._id : req.ownerId?._id}`}
                  className="btn btn-outline btn-sm"
                >
                  💬 Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
