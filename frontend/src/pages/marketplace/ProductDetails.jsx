import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";

import { ReportModal } from "./ReportModal";

import { useWishlist } from "../../context/WishlistContext";

import { marketplaceService } from "../../services/marketplaceService";
import { messageService } from "../../services/messageService";
import { reportService } from "../../services/reportService";
import { reviewService } from "../../services/reviewService";
import { marketplaceTransactionService } from "../../services/marketplaceTransactionService";

import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters";

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

function getPhotos(product) {
  const API_BASE_URL = "https://localhost:7235";
  const photos = [];

  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "";
    }

    // Already a full URL
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:") ||
      imageUrl.startsWith("blob:")
    ) {
      return imageUrl;
    }

    // Local placeholder image
    if (imageUrl.startsWith("/images/")) {
      return imageUrl;
    }

    // Backend uploaded image
    return `${API_BASE_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  };

  // Multiple photos
  if (Array.isArray(product?.photos)) {
    product.photos.forEach((photo) => {
      const url =
        typeof photo === "string"
          ? photo
          : photo?.imageUrl ||
            photo?.url ||
            photo?.path;

      if (url) {
        photos.push(buildImageUrl(url));
      }
    });
  }

  // Images collection
  if (Array.isArray(product?.images)) {
    product.images.forEach((image) => {
      const url =
        typeof image === "string"
          ? image
          : image?.imageUrl ||
            image?.url ||
            image?.path;

      if (url) {
        const fullUrl = buildImageUrl(url);

        if (!photos.includes(fullUrl)) {
          photos.push(fullUrl);
        }
      }
    });
  }

  // Single image
  const singleImage =
    product?.imageUrl ||
    product?.imagePreview ||
    product?.image;

  if (singleImage) {
    const fullUrl = buildImageUrl(singleImage);

    if (!photos.includes(fullUrl)) {
      photos.unshift(fullUrl);
    }
  }

  // Placeholder
  if (photos.length === 0) {
    photos.push("/images/marketplace-placeholder.jpg");
  }

  return photos;
}

export function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedPhoto, setSelectedPhoto] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [messageSent, setMessageSent] =
    useState(false);

  const [sendingMessage, setSendingMessage] =
    useState(false);

  const [messageError, setMessageError] =
    useState("");

  const [reportModalOpen, setReportModalOpen] =
    useState(false);

  const [reportType, setReportType] =
    useState("listing");

  const [reportSubmitting, setReportSubmitting] =
    useState(false);

  const [reportError, setReportError] =
    useState("");

  const [reportSuccess, setReportSuccess] =
    useState("");

  const [interestSubmitting, setInterestSubmitting] =
    useState(false);

  const [interestSuccess, setInterestSuccess] =
    useState("");

  const [interestError, setInterestError] =
    useState("");

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const [reviewSummary, setReviewSummary] =
    useState({
      averageRating: 0,
      totalReviews: 0,
    });

  const [reviewsLoading, setReviewsLoading] =
    useState(true);

  const { isSaved, toggleWishlist } =
    useWishlist();

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setPageError("");

        const listing =
          await marketplaceService.getListingById(
            id
          );

        if (cancelled) {
          return;
        }

        setProduct(listing);

        const listingPhotos =
          getPhotos(listing);

        setSelectedPhoto(
          listingPhotos[0] ||
            "/images/marketplace-placeholder.jpg"
        );
      } catch (error) {
        console.error(
          "Could not load listing:",
          error
        );

        if (!cancelled) {
          setProduct(null);

          setPageError(
            error?.message ||
              "The listing could not be loaded."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    async function loadSellerRating() {
      if (!product) {
        return;
      }

      const currentSellerId =
        product.sellerId ??
        product.userId ??
        product.ownerId ??
        product.user?.userId ??
        product.user?.id;

      if (!currentSellerId) {
        if (!cancelled) {
          setReviewsLoading(false);
        }

        return;
      }

      try {
        setReviewsLoading(true);

        const summary =
          await reviewService.getSellerSummary(
            currentSellerId
          );

        if (cancelled) {
          return;
        }

        setReviewSummary({
          averageRating:
            Number(
              summary?.averageRating
            ) || 0,

          totalReviews:
            Number(
              summary?.totalReviews
            ) || 0,
        });
      } catch (error) {
        console.error(
          "Could not load seller rating:",
          error
        );

        if (!cancelled) {
          setReviewSummary({
            averageRating: 0,
            totalReviews: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setReviewsLoading(false);
        }
      }
    }

    loadSellerRating();

    return () => {
      cancelled = true;
    };
  }, [product]);

  if (loading) {
    return (
      <LoadingState label="Loading listing details..." />
    );
  }

  if (!product) {
    return (
      <Card className="success-page-card">
        <h2>Listing not found</h2>

        {pageError && (
          <div className="error-box">
            {pageError}
          </div>
        )}

        <Link
          className="btn btn-primary btn-md"
          to="/marketplace"
        >
          Back to Marketplace
        </Link>
      </Card>
    );
  }

  const productId =
    product.listingId ?? product.id;

  const sellerId =
    product.sellerId ??
    product.userId ??
    product.ownerId ??
    product.user?.userId ??
    product.user?.id;

  const sellerName =
    product.sellerName ||
    product.seller ||
    product.user?.fullName ||
    product.user?.name ||
    "Student Seller";

  const numericStatus =
    Number(product.status);

  const statusText =
    getStatusText(numericStatus);

  const isUnavailable =
    numericStatus === 2 ||
    numericStatus === 3 ||
    numericStatus === 4;

  const photos = getPhotos(product);

  async function handleExpressInterest() {
    setInterestSuccess("");
    setInterestError("");

    if (!productId) {
      setInterestError("Listing information is missing.");
      return;
    }

    if (isUnavailable) {
      setInterestError(
        `This listing is currently ${statusText.toLowerCase()}.`
      );
      return;
    }

    try {
      setInterestSubmitting(true);

      await marketplaceTransactionService.expressInterest(
        productId
      );

      setInterestSuccess(
        "Your interest was sent to the seller successfully."
      );
    } catch (error) {
      console.error(
        "Could not express interest:",
        error
      );

      setInterestError(
        error?.message ||
          "Your interest could not be submitted."
      );
    } finally {
      setInterestSubmitting(false);
    }
  }

  async function handleContactSeller() {
    setMessageError("");
    setMessageSent(false);

    if (isUnavailable) {
      setMessageError(
        `This listing is currently ${statusText.toLowerCase()}.`
      );

      return;
    }

    if (
      sellerId === undefined ||
      sellerId === null ||
      sellerId === ""
    ) {
      setMessageError(
        "Seller information is missing."
      );

      return;
    }

    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      setMessageError(
        "Listing information is missing."
      );

      return;
    }

    const messageText = window.prompt(
      "Enter your message to the seller:",
      `Hi, I am interested in ${product.title}. Is it still available?`
    );

    if (!messageText?.trim()) {
      return;
    }

    try {
      setSendingMessage(true);

      await messageService.sendMessage({
        receiverId: Number(sellerId),
        listingId: Number(productId),
        messageText:
          messageText.trim(),
      });

      setMessageSent(true);
    } catch (error) {
      console.error(
        "Message sending failed:",
        error
      );

      setMessageError(
        error?.message ||
          "The message could not be sent."
      );
    } finally {
      setSendingMessage(false);
    }
  }

  function openListingReport() {
    setReportType("listing");
    setReportError("");
    setReportSuccess("");
    setReportModalOpen(true);
  }

  function openSellerReport() {
    if (!sellerId) {
      setReportSuccess("");

      setReportError(
        "Seller information is missing."
      );

      return;
    }

    setReportType("user");
    setReportError("");
    setReportSuccess("");
    setReportModalOpen(true);
  }

  function closeReportModal() {
    if (reportSubmitting) {
      return;
    }

    setReportModalOpen(false);
    setReportError("");
  }

  async function handleSubmitReport(
    reportData
  ) {
    try {
      setReportSubmitting(true);
      setReportError("");
      setReportSuccess("");

      if (reportType === "user") {
        if (!sellerId) {
          throw new Error(
            "Seller information is missing."
          );
        }

        await reportService.reportUser(
          sellerId,
          reportData
        );

        setReportSuccess(
          "Seller report submitted successfully."
        );
      } else {
        await reportService.reportListing(
          productId,
          reportData
        );

        setReportSuccess(
          "Listing report submitted successfully."
        );
      }

      setReportModalOpen(false);
    } catch (error) {
      console.error(
        "Report submission failed:",
        error
      );

      setReportError(
        error?.message ||
          "The report could not be submitted."
      );
    } finally {
      setReportSubmitting(false);
    }
  }

  async function handleSubmitReview(event) {
    event.preventDefault();

    setReviewError("");
    setReviewSuccess("");

    if (!sellerId) {
      setReviewError("Seller information is missing.");
      return;
    }

    if (!productId) {
      setReviewError("Listing information is missing.");
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError("Please select a rating from 1 to 5 stars.");
      return;
    }

    try {
      setReviewSubmitting(true);

      await reviewService.createReview({
        sellerId: Number(sellerId),
        listingId: Number(productId),
        rating: Number(reviewRating),
        comment: reviewComment.trim() || null,
      });

      setReviewSuccess("Review submitted successfully.");
      setReviewRating(0);
      setReviewComment("");

      const updatedSummary =
        await reviewService.getSellerSummary(sellerId);

      setReviewSummary({
        averageRating:
          Number(updatedSummary?.averageRating) || 0,
        totalReviews:
          Number(updatedSummary?.totalReviews) || 0,
      });
    } catch (error) {
      console.error("Review submission failed:", error);

      setReviewError(
        error?.message ||
          "The review could not be submitted."
      );
    } finally {
      setReviewSubmitting(false);
    }
  }

  function handleImageError(event) {
    event.currentTarget.onerror = null;
    event.currentTarget.src =
      "/images/marketplace-placeholder.jpg";
  }

  return (
    <>
      <Link
        className="back-link product-back-link"
        to="/marketplace"
      >
        ← Back to Marketplace
      </Link>

      <section className="product-detail-full-page">
        <div className="product-full-image-card">
          <div className="product-detail-image-wrapper">
            <img
              src={selectedPhoto}
              alt={product.title}
              className={`product-full-main-photo ${
                isUnavailable
                  ? "product-detail-image-unavailable"
                  : ""
              }`}
              onError={handleImageError}
            />

            <span
              className={`product-detail-status status-${statusText.toLowerCase()}`}
            >
              {statusText}
            </span>

            {numericStatus === 2 && (
              <div className="product-detail-status-overlay">
                SOLD
              </div>
            )}

            {numericStatus === 3 && (
              <div className="product-detail-status-overlay">
                RENTED
              </div>
            )}

            {numericStatus === 4 && (
              <div className="product-detail-status-overlay">
                REMOVED
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="product-thumbnail-row full-width-thumbnails">
              {photos
                .slice(0, 5)
                .map((photo, index) => (
                  <button
                    type="button"
                    className={`product-thumbnail ${
                      selectedPhoto === photo
                        ? "active"
                        : ""
                    }`}
                    key={`${photo}-${index}`}
                    onClick={() =>
                      setSelectedPhoto(photo)
                    }
                  >
                    <img
                      src={photo}
                      alt={`${product.title} ${
                        index + 1
                      }`}
                      onError={
                        handleImageError
                      }
                    />
                  </button>
                ))}
            </div>
          )}
        </div>

        <Card className="product-full-info-card">
          <span className="product-category-label">
            {product.category?.name ||
              product.categoryName ||
              product.category ||
              "Marketplace"}
          </span>

          <h1>{product.title}</h1>

          <strong className="detail-price">
            {formatCurrency(product.price)}
          </strong>

          <p className="product-detail-description">
            {product.description ||
              "No description was provided."}
          </p>

          {isUnavailable && (
            <div className="product-unavailable-message">
              This listing is currently{" "}
              <strong>
                {statusText.toLowerCase()}
              </strong>
              .
            </div>
          )}

          <div className="detail-actions">
            <Button
              type="button"
              onClick={handleExpressInterest}
              disabled={
                interestSubmitting ||
                isUnavailable ||
                Boolean(interestSuccess)
              }
            >
              <span className="material-symbols-rounded">
                handshake
              </span>

              {interestSubmitting
                ? "Sending Interest..."
                : interestSuccess
                  ? "Interest Sent"
                  : "I'm Interested"}
            </Button>

            <Button
              onClick={handleContactSeller}
              disabled={
                sendingMessage ||
                isUnavailable
              }
            >
              <span className="material-symbols-rounded">
                mail
              </span>

              {sendingMessage
                ? "Sending..."
                : "Contact Seller"}
            </Button>

            <Button
              variant="outline"
              onClick={() =>
                toggleWishlist(productId)
              }
              disabled={isUnavailable}
            >
              {isSaved(productId)
                ? "Remove Wishlist"
                : "Add Wishlist"}
            </Button>

            <Button
              variant="ghost"
              onClick={openListingReport}
            >
              <span className="material-symbols-rounded">
                flag
              </span>

              Report Listing
            </Button>
          </div>

          {interestSuccess && (
            <div className="success-box">
              {interestSuccess}
            </div>
          )}

          {interestError && (
            <div className="error-box">
              {interestError}
            </div>
          )}

          {messageSent && (
            <div className="success-box">
              Message sent successfully. The
              seller has received a
              notification.
            </div>
          )}

          {messageError && (
            <div className="error-box">
              {messageError}
            </div>
          )}

          {reportSuccess && (
            <div className="success-box">
              {reportSuccess}
            </div>
          )}
        </Card>

        <Card className="seller-full-card">
          <div className="seller-card-heading-row">
            <h2>Seller Information</h2>

            <button
              type="button"
              className="report-seller-button"
              onClick={openSellerReport}
            >
              <span className="material-symbols-rounded">
                person_alert
              </span>

              Report Seller
            </button>
          </div>

          <div className="seller-profile-row">
            <div className="seller-avatar">
              {sellerName
                .split(" ")
                .filter(Boolean)
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="seller-profile-information">
             <Link
  to={`/seller/${sellerId}`}
  className="seller-profile-name-link"
>
  {sellerName}
</Link>

              <div className="seller-rating-summary">
                {reviewsLoading ? (
                  <span>
                    Loading rating...
                  </span>
                ) : reviewSummary.totalReviews >
                  0 ? (
                  <>
                    <span className="seller-rating-stars">
                      ★
                    </span>

                    <strong>
                      {reviewSummary.averageRating.toFixed(
                        1
                      )}
                    </strong>

                    <span>
                      (
                      {
                        reviewSummary.totalReviews
                      }{" "}
                      {reviewSummary.totalReviews ===
                      1
                        ? "review"
                        : "reviews"}
                      )
                    </span>
                  </>
                ) : (
                  <span>
                    No reviews yet
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="seller-description">
            {product.sellerBio ||
              product.user?.bio ||
              "Student seller on UniLife. Message the seller to confirm item details, pickup location, and availability."}
          </p>

          <div className="seller-review-section">
            <h3>Leave a Review</h3>

            <form
              className="seller-review-form"
              onSubmit={handleSubmitReview}
            >
              <div
                className="seller-review-stars"
                role="radiogroup"
                aria-label="Seller rating"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={`seller-review-star ${
                      star <= reviewRating ? "active" : ""
                    }`}
                    onClick={() => setReviewRating(star)}
                    disabled={reviewSubmitting}
                    aria-label={`${star} star rating`}
                    aria-pressed={star === reviewRating}
                  >
                    ★
                  </button>
                ))}
              </div>

              <textarea
                rows="4"
                maxLength="500"
                value={reviewComment}
                onChange={(event) =>
                  setReviewComment(event.target.value)
                }
                placeholder="Write a short review about your experience with this seller."
                disabled={reviewSubmitting}
              />

              <small className="seller-review-character-count">
                {reviewComment.length}/500
              </small>

              {reviewError && (
                <div className="error-box">
                  {reviewError}
                </div>
              )}

              {reviewSuccess && (
                <div className="success-box">
                  {reviewSuccess}
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  reviewSubmitting || reviewRating < 1
                }
              >
                <span className="material-symbols-rounded">
                  star
                </span>

                {reviewSubmitting
                  ? "Submitting..."
                  : "Submit Review"}
              </Button>
            </form>
          </div>

          <small>
            Posted on{" "}
            {product.postedAt
              ? formatDate(
                  product.postedAt
                )
              : product.createdAt
                ? formatDate(
                    product.createdAt
                  )
                : product.date ||
                  "Recently"}
          </small>
        </Card>
      </section>

      <ReportModal
        isOpen={reportModalOpen}
        reportType={reportType}
        targetName={
          reportType === "user"
            ? sellerName
            : product.title
        }
        submitting={reportSubmitting}
        error={reportError}
        onClose={closeReportModal}
        onSubmit={handleSubmitReport}
      />
    </>
  );
}