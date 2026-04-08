import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ItemDetail.css';

const categoryEmoji = {
  Tools: '🔧', Books: '📚', Electronics: '💻', Appliances: '🏠',
  Sports: '⚽', Furniture: '🪑', Clothing: '👕', Other: '📦',
};

const ItemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [reqMsg, setReqMsg] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/items/${id}`)
      .then(res => setItem(res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const sendRequest = async () => {
    if (!user) return navigate('/login');
    setRequesting(true);
    setError('');
    try {
      await axios.post('/api/requests', { itemId: id, message: reqMsg, expectedReturnDate: returnDate });
      setSuccess('Borrow request sent! The owner will review it.');
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="spinner" style={{ marginTop: 80 }} />;
  if (!item) return null;

  const owner = item.ownerId;
  const isOwner = user && owner._id === user._id;
  const isAvailable = item.availabilityStatus === 'available';

  return (
    <div className="item-detail-page container">
      <Link to="/" className="back-link">← Back to Browse</Link>

      <div className="item-detail-grid">
        {/* Image */}
        <div className="item-detail-img card">
          {item.image ? (
            <img src={`http://localhost:5000${item.image}`} alt={item.title} />
          ) : (
            <div className="detail-placeholder">
              <span>{categoryEmoji[item.category] || '📦'}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="item-detail-info">
          <div className="detail-meta">
            <span className="badge badge-blue">{categoryEmoji[item.category]} {item.category}</span>
            <span className={`badge ${isAvailable ? 'badge-green' : 'badge-gray'}`}>
              {isAvailable ? '✓ Available' : 'Currently Borrowed'}
            </span>
            {item.condition && <span className="badge badge-yellow">{item.condition} Condition</span>}
          </div>

          <h1 className="detail-title">{item.title}</h1>
          <p className="detail-desc">{item.description}</p>

          {item.location && (
            <p className="detail-location">📍 {item.location}</p>
          )}

          {/* Owner Card */}
          <div className="owner-card card">
            <div className="owner-card-inner">
              <div className="owner-big-avatar">{owner.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="owner-card-name">{owner.name}</p>
                <p className="owner-card-loc">📍 {owner.location || 'Location not set'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {success && <div className="alert alert-success">{success}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          {!isOwner ? (
            isAvailable ? (
              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={() => { if (!user) navigate('/login'); else setShowModal(true); }}
              >
                🤝 Request to Borrow
              </button>
            ) : (
              <button className="btn btn-secondary btn-lg btn-full" disabled>
                Currently Unavailable
              </button>
            )
          ) : (
            <div className="owner-actions">
              <Link to={`/edit-item/${item._id}`} className="btn btn-secondary btn-lg">✏️ Edit Item</Link>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal card" onClick={e => e.stopPropagation()}>
            <h3>Request to Borrow</h3>
            <p className="modal-item-name">📦 {item.title}</p>
            <div className="form-group">
              <label>Message to owner (optional)</label>
              <textarea className="textarea" rows={3}
                placeholder="Hi! I'd like to borrow this for..."
                value={reqMsg} onChange={e => setReqMsg(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Expected return date (optional)</label>
              <input className="input" type="date" value={returnDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setReturnDate(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={sendRequest} disabled={requesting}>
                {requesting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetail;
