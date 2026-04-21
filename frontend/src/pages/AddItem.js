import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import MapView from '../components/MapView';
import './AddItem.css';

const CATEGORIES = ['Tools', 'Books', 'Electronics', 'Appliances', 'Sports', 'Furniture', 'Clothing', 'Other'];
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

const AddItem = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: 'Tools', condition: 'Good', lat: 20, lng: 78,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLocationInfo, setShowLocationInfo] = useState(false);

  useEffect(() => {
    // Get user's current location on mount
    if (!isEdit && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(prev => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }));
          setSelectedLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error('Geolocation error:', err)
      );
    }

    if (isEdit) {
      axios.get(`/api/items/${id}`).then(res => {
        const { title, description, category, condition, lat, lng } = res.data;
        setForm({ title, description, category, condition, lat: lat || 20, lng: lng || 78 });
        setSelectedLocation({ lat: lat || 20, lng: lng || 78 });
        if (res.data.image) setPreview(`http://localhost:5000${res.data.image}`);
      });
    }
  }, [id, isEdit]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setForm(prev => ({
      ...prev,
      lat: location.lat,
      lng: location.lng,
    }));
    setShowLocationInfo(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.lat || !form.lng) {
      setError('Please select a location on the map');
      return;
    }
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (image) data.append('image', image);

      if (isEdit) {
        await axios.put(`/api/items/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post('/api/items', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-item-page container">
      <div className="add-item-card card">
        <h2 className="page-title">{isEdit ? '✏️ Edit Item' : '➕ List an Item'}</h2>
        <p className="page-sub">{isEdit ? 'Update your item details' : 'Share something you\'re willing to lend'}</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Item Title *</label>
            <input className="input" name="title" placeholder="e.g. Power Drill, Harry Potter Book..."
              value={form.title} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select className="select" name="category" value={form.category} onChange={handleChange}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select className="select" name="condition" value={form.condition} onChange={handleChange}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea className="textarea" name="description" rows={4}
              placeholder="Describe the item — brand, size, any notes for borrowers..."
              value={form.description} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>📍 Item Location *</label>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-600)', marginBottom: '12px' }}>
              Click on the map to select where this item is located
            </p>
            <MapView
              items={[]}
              onSelectLocation={handleLocationSelect}
              selectable={true}
              showUserLocation={true}
            />
            {showLocationInfo && selectedLocation && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#f0fdf4',
                borderRadius: '6px',
                border: '1px solid #dcfce7'
              }}>
                <p style={{ margin: '0 0 8px 0', color: '#22c55e', fontWeight: 'bold' }}>✓ Location Selected</p>
                <small style={{ color: 'var(--gray-600)' }}>
                  Latitude: {selectedLocation.lat.toFixed(6)}<br />
                  Longitude: {selectedLocation.lng.toFixed(6)}
                </small>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Photo <span style={{color:'var(--gray-400)',fontWeight:400}}>(optional)</span></label>
            <div className="image-upload-area" onClick={() => document.getElementById('img-input').click()}>
              {preview ? (
                <img src={preview} alt="preview" className="image-preview" />
              ) : (
                <div className="upload-placeholder">
                  <span>📷</span>
                  <p>Click to upload image</p>
                  <small>JPEG, PNG, WebP — max 5MB</small>
                </div>
              )}
            </div>
            <input id="img-input" type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Item' : 'List Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItem;
