import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";

import { sellerProfileService } from "../../services/sellerProfileService";
import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters";

const API_BASE_URL = "https://localhost:7235";

function getStatusText(status) {
  switch (Number(status)) {
    case 1:
      return "Available";

    case 2:
      return "Sold";

    case 3:
      return "Rented";

    case 4:
      return "Removed";

    default:
      return "Available";
  }
}

function buildImageUrl(imageUrl) {
  if (!imageUrl) {
    return "/images/marketplace-placeholder.jpg";
  }

  const cleanUrl = String(imageUrl).trim();

  if (
    cleanUrl.startsWith("http://") ||
    cleanUrl.startsWith("https://") ||
    cleanUrl.startsWith("data:") ||
    cleanUrl.startsWith("blob:")
  ) {
    return cleanUrl;
  }

  if (cleanUrl.startsWith("/images/")) {
    return cleanUrl;
  }

  return `${API_BASE_URL}${
    cleanUrl.startsWith("/") ? "" : "/"
  }${cleanUrl}`;
}

function getSellerInitials(fullName) {
  return String(fullName || "Student Seller")
    .split(" ")
    .filter(Boolean)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getReviewStars(rating) {
  const safeRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return {
    filled: "★".repeat(safeRating),
    empty: "☆".repeat(5 - safeRating),
  };
}

export function SellerProfile() {
  const { sellerId } = useParams();

  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("active");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadSellerProfile() {
      try {
        setLoading(true);
        setError("");

        const response =
          await sellerProfileService.getSellerProfile(
            sellerId
          );

        if (!cancelled) {
          setProfile(response);
        }
      } catch (loadError) {
        console.error(
          "Could not load seller profile:",
          loadError
        );

        if (!cancelled) {
          setProfile(null);

          setError(
            loadError?.message ||
              "Unable to load the seller profile."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (sellerId) {
      loadSellerProfile();
    } else {
      setError("Invalid seller ID.");
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [sellerId]);

  const seller = profile?.seller || {};
  const rating = profile?.rating || {
    averageRating: 0,
    totalReviews: 0,
  };

  const statistics = profile?.statistics || {
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    rentedListings: 0,
  };

  const listings = Array.isArray(profile?.listings)
    ? profile.listings
    : [];

  const reviews = Array.isArray(profile?.reviews)
    ? profile.reviews
    : [];

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const numericStatus = Number(listing.status);

      if (activeTab === "active") {
        return numericStatus === 1;
      }

      if (activeTab === "sold") {
        return numericStatus === 2;
      }

      if (activeTab === "rented") {
        return numericStatus === 3;
      }

      return numericStatus !== 4;
    });
  }, [listings, activeTab]);

  if (loading) {
    return (
      <LoadingState label="Loading seller profile..." />
    );
  }

  if (!profile) {
    return (
      <Card className="seller-profile-error-card">
        <span className="material-symbols-rounded">
          person_off
        </span>

        <h2>Seller profile unavailable</h2>

        <p>
          {error ||
            "The seller profile could not be found."}
        </p>

        <Link
          to="/marketplace"
          className="btn btn-primary btn-md"
        >
          Back to Marketplace
        </Link>
      </Card>
    );
  }

  const profileImageUrl = buildImageUrl(
    seller.profileImageUrl
  );

  const averageRating =
    Number(rating.averageRating) || 0;

  const totalReviews =
    Number(rating.totalReviews) || 0;

  function handleImageError(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      "/images/marketplace-placeholder.jpg";
  }

  return (
    <section className="seller-profile-page">
      <Link
        to="/marketplace"
        className="back-link seller-profile-back-link"
      >
        ← Back to Marketplace
      </Link>

      <Card className="seller-profile-hero">
        <div className="seller-profile-cover" />

        <div className="seller-profile-hero-content">
          <div className="seller-profile-avatar-large">
            {seller.profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={seller.fullName || "Seller"}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              getSellerInitials(seller.fullName)
            )}
          </div>

          <div className="seller-profile-identity">
            <span className="seller-profile-eyebrow">
              Marketplace Seller
            </span>

            <h1>
              {seller.fullName || "Student Seller"}
            </h1>

            <div className="seller-profile-rating-row">
              <span className="seller-profile-rating-star">
                ★
              </span>

              <strong>
                {averageRating.toFixed(1)}
              </strong>

              <span>
                {totalReviews}{" "}
                {totalReviews === 1
                  ? "review"
                  : "reviews"}
              </span>
            </div>

            <div className="seller-profile-meta">
              {seller.city && (
                <span>
                  <span className="material-symbols-rounded">
                    location_on
                  </span>

                  {seller.city}
                  {seller.province
                    ? `, ${seller.province}`
                    : ""}
                </span>
              )}

              {seller.createdAt && (
                <span>
                  <span className="material-symbols-rounded">
                    calendar_month
                  </span>

                  Joined {formatDate(seller.createdAt)}
                </span>
              )}

              {seller.preferredContactMethod && (
                <span>
                  <span className="material-symbols-rounded">
                    contact_mail
                  </span>

                  {seller.preferredContactMethod}
                </span>
              )}
            </div>
          </div>
        </div>

        <p className="seller-profile-bio">
          {seller.bio ||
            "This seller has not added a marketplace bio yet."}
        </p>
      </Card>

      <div className="seller-profile-stat-grid">
        <Card className="seller-profile-stat-card">
          <span className="material-symbols-rounded">
            inventory_2
          </span>

          <strong>
            {statistics.totalListings || 0}
          </strong>

          <small>Total Listings</small>
        </Card>

        <Card className="seller-profile-stat-card">
          <span className="material-symbols-rounded">
            storefront
          </span>

          <strong>
            {statistics.activeListings || 0}
          </strong>

          <small>Active Listings</small>
        </Card>

        <Card className="seller-profile-stat-card">
          <span className="material-symbols-rounded">
            sell
          </span>

          <strong>
            {statistics.soldListings || 0}
          </strong>

          <small>Sold Items</small>
        </Card>

        <Card className="seller-profile-stat-card">
          <span className="material-symbols-rounded">
            key
          </span>

          <strong>
            {statistics.rentedListings || 0}
          </strong>

          <small>Rented Items</small>
        </Card>
      </div>

      <section className="seller-profile-section">
        <div className="seller-profile-section-heading">
          <div>
            <span className="eyebrow">
              Seller Inventory
            </span>

            <h2>Marketplace Listings</h2>
          </div>

          <div className="seller-profile-tabs">
            <button
              type="button"
              className={
                activeTab === "active"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("active")
              }
            >
              Active
            </button>

            <button
              type="button"
              className={
                activeTab === "sold"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("sold")
              }
            >
              Sold
            </button>

            <button
              type="button"
              className={
                activeTab === "rented"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("rented")
              }
            >
              Rented
            </button>

            <button
              type="button"
              className={
                activeTab === "all"
                  ? "active"
                  : ""
              }
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
          </div>
        </div>

        {filteredListings.length === 0 ? (
          <Card className="seller-profile-empty">
            <span className="material-symbols-rounded">
              inventory
            </span>

            <h3>No listings found</h3>

            <p>
              This seller does not currently have
              listings in this category.
            </p>
          </Card>
        ) : (
          <div className="seller-profile-listings-grid">
            {filteredListings.map((listing) => {
              const listingId =
                listing.listingId ?? listing.id;

              const numericStatus = Number(
                listing.status
              );

              const statusText =
                getStatusText(numericStatus);

              const listingImageUrl =
                buildImageUrl(listing.imageUrl);

              return (
                <Card
                  key={listingId}
                  className="seller-profile-listing-card"
                >
                  <Link
                    to={`/marketplace/${listingId}`}
                    className="seller-profile-listing-image-link"
                  >
                    <img
                      src={listingImageUrl}
                      alt={
                        listing.title ||
                        "Marketplace listing"
                      }
                      onError={handleImageError}
                    />

                    <span
                      className={`seller-profile-listing-status status-${statusText.toLowerCase()}`}
                    >
                      {statusText}
                    </span>
                  </Link>

                  <div className="seller-profile-listing-content">
                    <span className="seller-profile-listing-category">
                      {listing.categoryName ||
                        "Marketplace"}
                    </span>

                    <Link
                      to={`/marketplace/${listingId}`}
                    >
                      <h3>{listing.title}</h3>
                    </Link>

                    <strong>
                      {formatCurrency(listing.price)}
                    </strong>

                    <div className="seller-profile-listing-meta">
                      <span>
                        <span className="material-symbols-rounded">
                          location_on
                        </span>

                        {listing.location ||
                          "Location unavailable"}
                      </span>

                      <span>
                        <span className="material-symbols-rounded">
                          visibility
                        </span>

                        {listing.viewCount || 0} views
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="seller-profile-section">
        <div className="seller-profile-section-heading">
          <div>
            <span className="eyebrow">
              Seller Reputation
            </span>

            <h2>Reviews</h2>
          </div>

          <div className="seller-profile-review-summary">
            <span>★</span>

            <strong>
              {averageRating.toFixed(1)}
            </strong>

            <small>
              Based on {totalReviews}{" "}
              {totalReviews === 1
                ? "review"
                : "reviews"}
            </small>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card className="seller-profile-empty">
            <span className="material-symbols-rounded">
              rate_review
            </span>

            <h3>No reviews yet</h3>

            <p>
              Reviews left by buyers will appear here.
            </p>
          </Card>
        ) : (
          <div className="seller-profile-reviews-list">
            {reviews.map((review) => {
              const stars = getReviewStars(
                review.rating
              );

              return (
                <Card
                  key={review.reviewId}
                  className="seller-profile-review-card"
                >
                  <div className="seller-profile-review-top">
                    <div className="seller-profile-review-user">
                      <span>
                        {getSellerInitials(
                          review.buyerName
                        )}
                      </span>

                      <div>
                        <strong>
                          {review.buyerName ||
                            "Marketplace User"}
                        </strong>

                        <small>
                          {review.listingTitle ||
                            "Marketplace Listing"}
                        </small>
                      </div>
                    </div>

                    <small>
                      {formatDate(review.createdAt)}
                    </small>
                  </div>

                  <div className="seller-profile-review-stars">
                    <span>{stars.filled}</span>
                    <span>{stars.empty}</span>
                  </div>

                  <p>
                    {review.comment ||
                      "The buyer left a rating without a written comment."}
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}