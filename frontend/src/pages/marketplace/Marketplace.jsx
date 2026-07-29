import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../../components/ProductCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useWishlist } from "../../context/WishlistContext";
import { categories, pickupLocations } from "../../data/mockData";
import { marketplaceService } from "../../services/marketplaceService";

export function Marketplace() {
  const [filters, setFilters] = useState({
    query: "",
    category: "All",
    location: "All",
    sort: "newest",
  });

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isSaved, toggleWishlist } = useWishlist();

  useEffect(() => {
    setLoading(true);

    marketplaceService
      .getListings(filters)
      .then(setListings)
      .finally(() => setLoading(false));
  }, [filters]);

  function resetFilters() {
    setFilters({
      query: "",
      category: "All",
      location: "All",
      sort: "newest",
    });
  }

  return (
    <>
      <div className="marketplace-header-row">
        <div>
          <span className="eyebrow">Marketplace</span>
          <h1>Campus Marketplace</h1>
          <p>
            Search student listings, choose a pickup location, and browse by
            category.
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
          <div className="marketplace-filter-panel card">
            <div className="marketplace-search-row">
              <label className="marketplace-search-field">
                <span className="material-symbols-rounded">search</span>
                <input
                  placeholder="Search textbooks, laptop, jacket..."
                  value={filters.query}
                  onChange={(event) =>
                    setFilters({ ...filters, query: event.target.value })
                  }
                />
              </label>

              <label className="marketplace-select-field">
                <span className="material-symbols-rounded">location_on</span>
                <select
                  value={filters.location}
                  onChange={(event) =>
                    setFilters({ ...filters, location: event.target.value })
                  }
                >
                  <option value="All">All Locations</option>
                  {pickupLocations
                    .filter((location) => location !== "Other")
                    .map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                </select>
              </label>

              <label className="marketplace-select-field">
                <span className="material-symbols-rounded">sort</span>
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    setFilters({ ...filters, sort: event.target.value })
                  }
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </label>

              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>

            <div className="marketplace-category-section">
              <span className="category-section-label">Shop by category</span>

              <div className="category-pill-row">
                {categories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    className={`category-pill ${
                      filters.category === category ? "active" : ""
                    }`}
                    onClick={() =>
                      setFilters({ ...filters, category: category })
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && <LoadingState label="Loading marketplace listings..." />}

          {!loading && listings.length === 0 && (
            <EmptyState
              title="No listings found"
              body="Try another search, category, or pickup location."
            />
          )}

          {!loading && listings.length > 0 && (
            <div className="product-grid">
              {listings.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  saved={isSaved(product.id)}
                  onToggleWishlist={toggleWishlist}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}