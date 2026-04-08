import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ItemCard from '../components/ItemCard';
import './Home.css';

const CATEGORIES = ['All', 'Tools', 'Books', 'Electronics', 'Appliances', 'Sports', 'Furniture', 'Clothing', 'Other'];

const Home = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchItems();
  }, [category]);

  const fetchItems = async (searchTerm = search) => {
    setLoading(true);
    try {
      const params = { category };
      if (searchTerm) params.search = searchTerm;
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
          <p className="hero-sub">Borrow tools, books, and more from neighbors — free of charge</p>
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
        </div>

        {loading ? (
          <div className="spinner" />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <h3>No items found</h3>
            <p>Try a different search or category</p>
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
