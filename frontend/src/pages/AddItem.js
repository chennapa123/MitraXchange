import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './AddItem.css';

const CATEGORIES = ['Tools', 'Books', 'Electronics', 'Appliances', 'Sports', 'Furniture', 'Clothing', 'Other'];
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];

const AddItem = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: 'Tools', condition: 'Good', location: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/items/${id}`).then(res => {
        const { title, description, category, condition, location } = res.data;
        setForm({ title, description, category, condition, location: location || '' });
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

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
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
            <label>Location <span style={{color:'var(--gray-400)',fontWeight:400}}>(optional)</span></label>
            <input className="input" name="location" placeholder="e.g. Mangalagiri, AP"
              value={form.location} onChange={handleChange} />
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
