import React from "react";
import { useEffect, useState } from 'react';
import { ProductCard } from '../../components/ProductCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { useWishlist } from '../../context/WishlistContext';
import { marketplaceService } from '../../services/marketplaceService';

export function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleWishlist, wishlistIds } = useWishlist();

  useEffect(() => {
    marketplaceService.getWishlist()
      .then(setItems)
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  return (
    <>
      <PageHeader eyebrow="Marketplace" title="Wishlist" description="Saved products from Marketplace. Backend will later return the authenticated user's saved listings." />
      {loading ? <LoadingState label="Loading saved items..." /> : null}
      {!loading && items.length === 0 ? <EmptyState icon="favorite" title="No saved products" body="Save items from Marketplace to see them here." /> : null}
      {!loading && items.length > 0 ? (
        <div className="product-grid">
          {items.map((product) => <ProductCard key={product.id} product={product} saved={isSaved(product.id)} onToggleWishlist={toggleWishlist} />)}
        </div>
      ) : null}
    </>
  );
}

