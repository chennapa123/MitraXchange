import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import MapView from '../components/MapView';
import './Home.css';

const CATEGORIES = ['All', 'Tools', 'Books', 'Electronics', 'Appliances', 'Sports', 'Furniture', 'Clothing', 'Other'];

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(10); // km
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    // Get user's location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => console.error('Geolocation error:', err)
      );
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [category, userLocation, radius]);

  const fetchItems = async (searchTerm = search) => {
    setLoading(true);
    try {
      const params = { category };
      if (searchTerm) params.search = searchTerm;
      // Add location-based filtering if user location is available
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
        params.radius = radius;
      }
      const res = await axios.get('/api/items', { params });
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchItems(search);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <div className="hero">
        <div className="container">
          <h1 className="hero-title">Share More, Waste Less 🌱</h1>
          <p className="hero-sub">Borrow tools, books, and more from neighbours — free of charge</p>
          <form className="search-bar" onSubmit={handleSearch}>
            <input
              className="input search-input"
              placeholder="Search for items... (drill, ladder, book...)"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      </div>

      <div className="container browse-section">
        {/* Map Section */}
        {showMap && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3>📍 Items Near You</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label>
                  Radius:
                  <select
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    style={{
                      marginLeft: '8px',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1px solid var(--gray-300)',
                      fontSize: '14px'
                    }}
                  >
                    <option value={5}>5 km</option>
                    <option value={10}>10 km</option>
                    <option value={25}>25 km</option>
                    <option value={50}>50 km</option>
                  </select>
                </label>
                <button
                  onClick={() => setShowMap(false)}
                  style={{
                    padding: '6px 12px',
                    background: 'var(--gray-200)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Hide Map
                </button>
              </div>
            </div>
            <MapView items={items} showUserLocation={true} />
          </div>
        )}

        {!showMap && (
          <button
            onClick={() => setShowMap(true)}
            className="btn btn-primary"
            style={{ marginBottom: '20px' }}
          >
            📍 Show Map
          </button>
        )}

        {/* Category Filter */}
        <div className="category-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`cat-btn ${category === cat ? 'active' : ''}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="results-header">
          <span className="results-count">{items.length} item{items.length !== 1 ? 's' : ''} available</span>
          {userLocation && (
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-600)' }}>
              📍 Near {userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}
            </span>
          )}
        </div>

        {loading ? (
          <div className="spinner" />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No items found</h3>
            <p>Try a different search, category, or increase the radius</p>
          </div>
        ) : (
          <div className="items-grid">
            {items.map(item => <ItemCard key={item._id} item={item} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
