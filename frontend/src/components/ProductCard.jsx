import React from "react";
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/formatters';

export function ProductCard({ product, saved, onToggleWishlist }) {
  return (
    <Card className="product-card">
      <div className="product-image-wrap">
        <img src={product.imageUrl} alt={product.title} />
        <button className={`heart-button ${saved ? 'active' : ''}`} onClick={() => onToggleWishlist(product.id)} aria-label="Toggle wishlist">
          <span className="material-symbols-rounded">favorite</span>
        </button>
      </div>
      <div className="product-card-body">
        <div>
          <small>{product.category}</small>
          <h3>{product.title}</h3>
        </div>
        <strong>{formatCurrency(product.price)}</strong>
        <p>Seller: {product.seller} </p>
        <Link className="btn btn-outline btn-sm" to={`/marketplace/${product.id}`}>View Details</Link>
      </div>
    </Card>
  );
}

