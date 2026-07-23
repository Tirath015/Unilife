import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";
import { useWishlist } from "../../context/WishlistContext";
import { marketplaceService } from "../../services/marketplaceService";
import { formatCurrency, formatDate } from "../../utils/formatters";

export function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const [messageSent, setMessageSent] = useState(false);

  const { isSaved, toggleWishlist } = useWishlist();

  useEffect(() => {
    marketplaceService
      .getListingById(id)
      .then((listing) => {
        setProduct(listing);

        const photos = listing?.photos?.length
          ? listing.photos
          : [
              listing?.imageUrl ||
                listing?.imagePreview ||
                listing?.image ||
                "/images/marketplace-placeholder.jpg",
            ];

        setSelectedPhoto(photos[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <LoadingState label="Loading listing details..." />;
  }

  if (!product) {
    return (
      <Card className="success-page-card">
        <h2>Listing not found</h2>
        <Link className="btn btn-primary btn-md" to="/marketplace">
          Back to Marketplace
        </Link>
      </Card>
    );
  }

  const photos = product.photos?.length
    ? product.photos
    : [
        product.imageUrl ||
          product.imagePreview ||
          product.image ||
          "/images/marketplace-placeholder.jpg",
      ];

  const sellerName = product.sellerName || product.seller || "Student Seller";
  const sellerRating = product.sellerRating || product.rating || 5;

  return (
    <>
      <Link className="back-link product-back-link" to="/marketplace">
        ← Back to Marketplace
      </Link>

      <section className="product-detail-full-page">
        <div className="product-full-image-card">
          <img
            src={selectedPhoto}
            alt={product.title}
            className="product-full-main-photo"
          />

          {photos.length > 1 && (
            <div className="product-thumbnail-row full-width-thumbnails">
              {photos.slice(0, 5).map((photo, index) => (
                <button
                  type="button"
                  className={`product-thumbnail ${
                    selectedPhoto === photo ? "active" : ""
                  }`}
                  key={`${photo}-${index}`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img src={photo} alt={`${product.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <Card className="product-full-info-card">
          <span className="product-category-label">{product.category}</span>

          <h1>{product.title}</h1>

          <strong className="detail-price">
            {formatCurrency(product.price)}
          </strong>

          <p className="product-detail-description">{product.description}</p>

          <div className="detail-actions">
            <Button onClick={() => setMessageSent(true)}>
              <span className="material-symbols-rounded">mail</span>
              Contact Seller
            </Button>

            <Button variant="outline" onClick={() => toggleWishlist(product.id)}>
              {isSaved(product.id) ? "Remove Wishlist" : "Add Wishlist"}
            </Button>

            <Button
  variant="ghost"
  onClick={async () => {
    const reason = window.prompt(
      "Why are you reporting this listing?",
      "This listing seems suspicious."
    );

    if (!reason) return;

    await marketplaceService.reportListing(product.id, reason);
    alert("Report sent to admin.");
  }}
>
  <span className="material-symbols-rounded">flag</span>
  Report
</Button>
          </div>

          {messageSent && (
            <div className="success-box">
              Message request created. Backend will later send this to the seller
              messaging API.
            </div>
          )}
        </Card>

        <Card className="seller-full-card">
          <h2>Seller Information</h2>

          <div className="seller-profile-row">
            <div className="seller-avatar">
              {sellerName
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div>
              <strong>{sellerName}</strong>
              <span>Rating {sellerRating}★</span>
            </div>
          </div>

          <p className="seller-description">
            {product.sellerBio ||
              "Student seller on UniLife. Message the seller to confirm item details, pickup location, and availability."}
          </p>

          <small>
            Posted on{" "}
            {product.postedAt
              ? formatDate(product.postedAt)
              : product.date || "Recently"}
          </small>
        </Card>
      </section>
    </>
  );
}
