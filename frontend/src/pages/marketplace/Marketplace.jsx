import React from "react";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '../../components/ProductCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useWishlist } from '../../context/WishlistContext';
import { categories } from '../../data/mockData';
import { marketplaceService } from '../../services/marketplaceService';

export function Marketplace() {
  const [filters, setFilters] = useState({ query: '', category: 'All', sort: 'newest' });
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);
    marketplaceService.getListings(filters)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <>
      <div className="marketplace-header-row">
  <div>
    <span className="eyebrow">Marketplace</span>
    <h1>Campus Marketplace</h1>
    <p>
      Browse listings, save items to your wishlist, and connect with student sellers.
    </p>
  </div>

  <div className="marketplace-header-actions">
    <Link to="/wishlist" className="marketplace-wishlist-button">
      <span className="material-symbols-rounded">favorite</span>
      Wishlist
    </Link>

    <Link to="/marketplace/create" className="marketplace-post-button">
      <span className="material-symbols-rounded">add</span>
      Post Listing
    </Link>
  </div>
</div>

      <section className="marketplace-layout">
        

        <div className="marketplace-main">
          <div className="toolbar card">
            <label className="search-field">
              <span className="material-symbols-rounded">search</span>
              <input placeholder="Search textbooks, electronics, furniture..." value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
            </label>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </select>
            <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })}>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <Button variant="outline" onClick={() => setFilters({ query: '', category: 'All', sort: 'newest' })}>Reset</Button>
          </div>

          {loading ? <LoadingState label="Loading marketplace listings..." /> : null}
          {!loading && listings.length === 0 ? <EmptyState title="No listings found" body="Try another search or clear your filters." /> : null}
          {!loading && listings.length > 0 ? (
            <div className="product-grid">
              {listings.map((product) => (
                <ProductCard key={product.id} product={product} saved={isSaved(product.id)} onToggleWishlist={toggleWishlist} />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}

