import React from 'react';
import { Link } from 'react-router-dom';
import './ItemCard.css';

const categoryEmoji = {
  Tools: '🔧', Books: '📚', Electronics: '💻', Appliances: '🏠',
  Sports: '⚽', Furniture: '🪑', Clothing: '👕', Other: '📦',
};

const ItemCard = ({ item }) => {
  const owner = item.ownerId;
  const isAvailable = item.availabilityStatus === 'available';

  return (
    <Link to={`/items/${item._id}`} className="item-card">
      <div className="item-card-img">
        {item.image ? (
          <img src={`http://localhost:5000${item.image}`} alt={item.title} />
        ) : (
          <div className="item-card-placeholder">
            <span>{categoryEmoji[item.category] || '📦'}</span>
          </div>
        )}
        <span className={`item-card-status ${isAvailable ? 'available' : 'borrowed'}`}>
          {isAvailable ? 'Available' : 'Borrowed'}
        </span>
      </div>
      <div className="item-card-body">
        <div className="item-card-category">
          <span>{categoryEmoji[item.category]}</span> {item.category}
        </div>
        <h3 className="item-card-title">{item.title}</h3>
        <p className="item-card-desc">{item.description}</p>
        <div className="item-card-footer">
          <div className="item-card-owner">
            <span className="owner-avatar">{owner?.name?.charAt(0).toUpperCase()}</span>
            <span className="owner-name">{owner?.name}</span>
          </div>
          {item.location && (
            <span className="item-card-location">📍 {item.location}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
