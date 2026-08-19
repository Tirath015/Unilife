import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { listingService } from "../../services/listingService";
import { marketplaceTransactionService } from "../../services/marketplaceTransactionService";

const getStatusText = (status) => {
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
};

const getTransactionStatusText = (status) => {
  switch (Number(status)) {
    case 1:
      return "Interested";
    case 2:
      return "Accepted";
    case 3:
      return "Waiting for buyer confirmation";
    case 4:
      return "Completed";
    case 5:
      return "Cancelled";
    case 6:
      return "Rejected";
    default:
      return "Unknown";
  }
};

export function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [expandedListingId, setExpandedListingId] = useState(null);
  const [loadingBuyersId, setLoadingBuyersId] = useState(null);
  const [updatingTransactionId, setUpdatingTransactionId] = useState(null);
  const [buyersByListing, setBuyersByListing] = useState({});
  const [transactionMessage, setTransactionMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyListings();
  }, []);

  async function loadMyListings() {
    try {
      setLoading(true);
      setError("");

      const response = await listingService.getMyListings();

      const listingData = Array.isArray(response)
        ? response
        : response?.data || [];

      setListings(listingData);
    } catch (err) {
      console.error("Could not load listings:", err);

      setError(
        err?.message || "Your listings could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(listingId, newStatus) {
    try {
      setUpdatingStatusId(listingId);
      setError("");
      setTransactionMessage("");

      await listingService.updateListingStatus(
        listingId,
        newStatus
      );

      setListings((currentListings) =>
        currentListings.map((listing) => {
          const currentListingId =
            listing.listingId ?? listing.id;

          if (currentListingId === listingId) {
            return {
              ...listing,
              status: newStatus,
            };
          }

          return listing;
        })
      );
    } catch (err) {
      console.error(
        "Failed to update listing status:",
        err
      );

      setError(
        err?.message ||
          "Unable to update the listing status."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  }

  async function handleDelete(listingId, listingTitle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${listingTitle}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(listingId);
      setError("");
      setTransactionMessage("");

      await listingService.deleteListing(listingId);

      setListings((currentListings) =>
        currentListings.filter((listing) => {
          const currentListingId =
            listing.listingId ?? listing.id;

          return currentListingId !== listingId;
        })
      );

      setBuyersByListing((current) => {
        const next = { ...current };
        delete next[listingId];
        return next;
      });

      if (expandedListingId === listingId) {
        setExpandedListingId(null);
      }
    } catch (err) {
      console.error("Could not delete listing:", err);

      setError(
        err?.message || "The listing could not be deleted."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function loadInterestedBuyers(
    listingId,
    forceReload = false
  ) {
    if (
      !forceReload &&
      Array.isArray(buyersByListing[listingId])
    ) {
      return;
    }

    try {
      setLoadingBuyersId(listingId);
      setError("");

      const response =
        await marketplaceTransactionService.getInterestedBuyers(
          listingId
        );

      const buyers = Array.isArray(response)
        ? response
        : response?.data || [];

      setBuyersByListing((current) => ({
        ...current,
        [listingId]: buyers,
      }));
    } catch (err) {
      console.error(
        "Could not load interested buyers:",
        err
      );

      setError(
        err?.message ||
          "Interested buyers could not be loaded."
      );

      setBuyersByListing((current) => ({
        ...current,
        [listingId]: [],
      }));
    } finally {
      setLoadingBuyersId(null);
    }
  }

  async function handleToggleInterestedBuyers(listingId) {
    setTransactionMessage("");
    setError("");

    if (expandedListingId === listingId) {
      setExpandedListingId(null);
      return;
    }

    setExpandedListingId(listingId);
    await loadInterestedBuyers(listingId);
  }

  async function handleAcceptBuyer(
    listingId,
    transactionId,
    buyerName
  ) {
    const confirmed = window.confirm(
      `Accept ${buyerName || "this buyer"} for this listing?\n\nOther pending requests for the same listing will be rejected.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingTransactionId(transactionId);
      setError("");
      setTransactionMessage("");

      await marketplaceTransactionService.acceptBuyer(
        transactionId
      );

      await loadInterestedBuyers(listingId, true);

      setTransactionMessage(
        `${buyerName || "The buyer"} was accepted successfully.`
      );
    } catch (err) {
      console.error("Could not accept buyer:", err);

      setError(
        err?.message ||
          "The buyer could not be accepted."
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  async function handleSellerComplete(
    listingId,
    transactionId,
    buyerName
  ) {
    const confirmed = window.confirm(
      `Mark the transaction with ${
        buyerName || "this buyer"
      } as completed?\n\nThe buyer will still need to confirm receipt.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingTransactionId(transactionId);
      setError("");
      setTransactionMessage("");

      await marketplaceTransactionService.sellerComplete(
        transactionId
      );

      await loadInterestedBuyers(listingId, true);

      setTransactionMessage(
        "The transaction is now waiting for buyer confirmation."
      );
    } catch (err) {
      console.error(
        "Could not mark transaction complete:",
        err
      );

      setError(
        err?.message ||
          "The transaction could not be marked complete."
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  async function handleCancelTransaction(
    listingId,
    transactionId,
    buyerName
  ) {
    const confirmed = window.confirm(
      `Cancel the transaction with ${
        buyerName || "this buyer"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingTransactionId(transactionId);
      setError("");
      setTransactionMessage("");

      await marketplaceTransactionService.cancelTransaction(
        transactionId
      );

      await loadInterestedBuyers(listingId, true);

      setTransactionMessage(
        "The transaction was cancelled."
      );
    } catch (err) {
      console.error(
        "Could not cancel transaction:",
        err
      );

      setError(
        err?.message ||
          "The transaction could not be cancelled."
      );
    } finally {
      setUpdatingTransactionId(null);
    }
  }

  function getImageUrl(listing) {
    const imageUrl =
      listing?.images?.[0]?.imageUrl ||
      listing?.imageUrl ||
      listing?.image;

    if (!imageUrl) {
      return "/placeholder-listing.png";
    }

    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:") ||
      imageUrl.startsWith("blob:")
    ) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/images/")) {
      return imageUrl;
    }

    return `https://localhost:7235${
      imageUrl.startsWith("/") ? "" : "/"
    }${imageUrl}`;
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
    }).format(Number(price || 0));
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <section className="my-listings-page">
        <div className="my-listings-loading">
          <div className="my-listings-spinner" />
          <p>Loading your listings...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-listings-page">
      <div className="my-listings-header">
        <div>
          <span className="my-listings-eyebrow">
            Seller Dashboard
          </span>

          <h1>My Listings</h1>

          <p>
            Manage listings, review interested buyers and
            complete marketplace transactions.
          </p>
        </div>

        <Link
          to="/marketplace/create"
          className="my-listings-create-button"
        >
          <span className="material-symbols-rounded">
            add
          </span>

          Create Listing
        </Link>
      </div>

      {transactionMessage && (
        <div className="my-listings-success">
          <span className="material-symbols-rounded">
            check_circle
          </span>

          <span>{transactionMessage}</span>
        </div>
      )}

      {error && (
        <div className="my-listings-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <span>{error}</span>
        </div>
      )}

      {listings.length === 0 ? (
        <div className="my-listings-empty">
          <span className="material-symbols-rounded">
            inventory_2
          </span>

          <h2>No listings yet</h2>

          <p>
            Create your first marketplace listing and start
            connecting with buyers.
          </p>

          <Link
            to="/marketplace/create"
            className="my-listings-create-button"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <>
          <div className="my-listings-summary">
            <strong>{listings.length}</strong>

            <span>
              {listings.length === 1
                ? "listing"
                : "listings"}
            </span>
          </div>

          <div className="my-listings-grid">
            {listings.map((listing) => {
              const listingId =
                listing.listingId ?? listing.id;

              const numericStatus = Number(
                listing.status
              );

              const statusText =
                getStatusText(numericStatus);

              const isDeleting =
                deletingId === listingId;

              const isUpdatingStatus =
                updatingStatusId === listingId;

              const isLoadingBuyers =
                loadingBuyersId === listingId;

              const isExpanded =
                expandedListingId === listingId;

              const buyers =
                buyersByListing[listingId] || [];

              const unavailableImage =
                numericStatus === 2 ||
                numericStatus === 4;

              return (
                <article
                  className="my-listing-card"
                  key={listingId}
                >
                  <Link
                    to={`/marketplace/${listingId}`}
                    className="my-listing-image-link"
                  >
                    <img
                      src={getImageUrl(listing)}
                      alt={
                        listing.title ||
                        "Marketplace listing"
                      }
                      className={`my-listing-image ${
                        unavailableImage
                          ? "listing-image-unavailable"
                          : ""
                      }`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src =
                          "/placeholder-listing.png";
                      }}
                    />

                    <span
                      className={`my-listing-status status-${statusText.toLowerCase()}`}
                    >
                      {statusText}
                    </span>

                    {numericStatus === 2 && (
                      <div className="listing-image-message">
                        SOLD
                      </div>
                    )}

                    {numericStatus === 4 && (
                      <div className="listing-image-message">
                        REMOVED
                      </div>
                    )}
                  </Link>

                  <div className="my-listing-content">
                    <div className="my-listing-top">
                      <div>
                        <span className="my-listing-category">
                          {listing.category?.name ||
                            listing.categoryName ||
                            "Marketplace"}
                        </span>

                        <Link
                          to={`/marketplace/${listingId}`}
                        >
                          <h2>{listing.title}</h2>
                        </Link>
                      </div>

                      <strong className="my-listing-price">
                        {formatPrice(listing.price)}
                      </strong>
                    </div>

                    <p className="my-listing-description">
                      {listing.description ||
                        "No description available."}
                    </p>

                    <div className="my-listing-details">
                      <span>
                        <span className="material-symbols-rounded">
                          location_on
                        </span>

                        {listing.location ||
                          "Location unavailable"}
                      </span>

                      <span>
                        <span className="material-symbols-rounded">
                          calendar_month
                        </span>

                        {formatDate(
                          listing.createdAt
                        )}
                      </span>

                      <span>
                        <span className="material-symbols-rounded">
                          visibility
                        </span>

                        {listing.viewCount || 0} views
                      </span>
                    </div>

                    <div className="my-listing-transaction-section">
                      <button
                        type="button"
                        className="interested-buyers-toggle"
                        onClick={() =>
                          handleToggleInterestedBuyers(
                            listingId
                          )
                        }
                        disabled={isLoadingBuyers}
                      >
                        <span className="material-symbols-rounded">
                          group
                        </span>

                        {isLoadingBuyers
                          ? "Loading Buyers..."
                          : isExpanded
                            ? "Hide Interested Buyers"
                            : "Interested Buyers"}

                        {Array.isArray(
                          buyersByListing[listingId]
                        ) && (
                          <span className="interested-buyers-count">
                            {
                              buyersByListing[listingId]
                                .length
                            }
                          </span>
                        )}
                      </button>

                      {isExpanded && (
                        <div className="interested-buyers-panel">
                          <div className="interested-buyers-heading">
                            <div>
                              <h3>Interested Buyers</h3>
                              <p>
                                Accept one buyer and complete
                                the transaction after the item
                                is exchanged.
                              </p>
                            </div>

                            <button
                              type="button"
                              className="refresh-buyers-button"
                              onClick={() =>
                                loadInterestedBuyers(
                                  listingId,
                                  true
                                )
                              }
                              disabled={isLoadingBuyers}
                              aria-label="Refresh interested buyers"
                            >
                              <span className="material-symbols-rounded">
                                refresh
                              </span>
                            </button>
                          </div>

                          {isLoadingBuyers ? (
                            <div className="interested-buyers-loading">
                              <div className="my-listings-spinner" />
                              <span>
                                Loading interested buyers...
                              </span>
                            </div>
                          ) : buyers.length === 0 ? (
                            <div className="interested-buyers-empty">
                              <span className="material-symbols-rounded">
                                person_search
                              </span>

                              <strong>
                                No interested buyers yet
                              </strong>

                              <p>
                                Buyer requests for this listing
                                will appear here.
                              </p>
                            </div>
                          ) : (
                            <div className="interested-buyers-list">
                              {buyers.map((buyer) => {
                                const transactionId =
                                  buyer.transactionId ??
                                  buyer.id;

                                const transactionStatus =
                                  Number(buyer.status);

                                const transactionStatusText =
                                  getTransactionStatusText(
                                    transactionStatus
                                  );

                                const isUpdatingTransaction =
                                  updatingTransactionId ===
                                  transactionId;

                                return (
                                  <div
                                    className="interested-buyer-card"
                                    key={transactionId}
                                  >
                                    <div className="interested-buyer-main">
                                      <div className="interested-buyer-avatar">
                                        {String(
                                          buyer.buyerName ||
                                            "Buyer"
                                        )
                                          .split(" ")
                                          .filter(Boolean)
                                          .map(
                                            (name) => name[0]
                                          )
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                      </div>

                                      <div className="interested-buyer-info">
                                        <strong>
                                          {buyer.buyerName ||
                                            "Marketplace Buyer"}
                                        </strong>

                                        {buyer.buyerEmail && (
                                          <span>
                                            {buyer.buyerEmail}
                                          </span>
                                        )}

                                        <small>
                                          Requested{" "}
                                          {formatDate(
                                            buyer.createdAt
                                          )}
                                        </small>
                                      </div>
                                    </div>

                                    <div className="interested-buyer-status-row">
                                      <span
                                        className={`transaction-status transaction-status-${transactionStatus}`}
                                      >
                                        {
                                          transactionStatusText
                                        }
                                      </span>

                                      <div className="interested-buyer-actions">
                                        {transactionStatus ===
                                          1 && (
                                          <button
                                            type="button"
                                            className="accept-buyer-button"
                                            disabled={
                                              isUpdatingTransaction
                                            }
                                            onClick={() =>
                                              handleAcceptBuyer(
                                                listingId,
                                                transactionId,
                                                buyer.buyerName
                                              )
                                            }
                                          >
                                            <span className="material-symbols-rounded">
                                              person_check
                                            </span>

                                            {isUpdatingTransaction
                                              ? "Accepting..."
                                              : "Accept Buyer"}
                                          </button>
                                        )}

                                        {transactionStatus ===
                                          2 && (
                                          <>
                                            <button
                                              type="button"
                                              className="complete-transaction-button"
                                              disabled={
                                                isUpdatingTransaction
                                              }
                                              onClick={() =>
                                                handleSellerComplete(
                                                  listingId,
                                                  transactionId,
                                                  buyer.buyerName
                                                )
                                              }
                                            >
                                              <span className="material-symbols-rounded">
                                                task_alt
                                              </span>

                                              {isUpdatingTransaction
                                                ? "Updating..."
                                                : "Mark Complete"}
                                            </button>

                                            <button
                                              type="button"
                                              className="cancel-transaction-button"
                                              disabled={
                                                isUpdatingTransaction
                                              }
                                              onClick={() =>
                                                handleCancelTransaction(
                                                  listingId,
                                                  transactionId,
                                                  buyer.buyerName
                                                )
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </>
                                        )}

                                        {transactionStatus ===
                                          3 && (
                                          <span className="transaction-help-text">
                                            Buyer must confirm
                                            receipt.
                                          </span>
                                        )}

                                        {transactionStatus ===
                                          4 && (
                                          <span className="transaction-complete-label">
                                            <span className="material-symbols-rounded">
                                              verified
                                            </span>

                                            Verified transaction
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="listing-status-actions">
                      {numericStatus === 1 && (
                        <>
                          <button
                            type="button"
                            className="status-button rented-button"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleStatusChange(
                                listingId,
                                3
                              )
                            }
                          >
                            <span className="material-symbols-rounded">
                              key
                            </span>

                            {isUpdatingStatus
                              ? "Updating..."
                              : "Mark Rented"}
                          </button>

                          <button
                            type="button"
                            className="status-button sold-button"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleStatusChange(
                                listingId,
                                2
                              )
                            }
                          >
                            <span className="material-symbols-rounded">
                              sell
                            </span>

                            {isUpdatingStatus
                              ? "Updating..."
                              : "Mark Sold"}
                          </button>

                          <button
                            type="button"
                            className="status-button removed-button"
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              handleStatusChange(
                                listingId,
                                4
                              )
                            }
                          >
                            <span className="material-symbols-rounded">
                              visibility_off
                            </span>

                            {isUpdatingStatus
                              ? "Updating..."
                              : "Remove Listing"}
                          </button>
                        </>
                      )}

                      {(numericStatus === 2 ||
                        numericStatus === 3 ||
                        numericStatus === 4) && (
                        <button
                          type="button"
                          className="status-button available-button"
                          disabled={isUpdatingStatus}
                          onClick={() =>
                            handleStatusChange(
                              listingId,
                              1
                            )
                          }
                        >
                          <span className="material-symbols-rounded">
                            restart_alt
                          </span>

                          {isUpdatingStatus
                            ? "Updating..."
                            : "Mark Available"}
                        </button>
                      )}

                      {(numericStatus === 2 ||
                        numericStatus === 3) && (
                        <button
                          type="button"
                          className="status-button removed-button"
                          disabled={isUpdatingStatus}
                          onClick={() =>
                            handleStatusChange(
                              listingId,
                              4
                            )
                          }
                        >
                          <span className="material-symbols-rounded">
                            visibility_off
                          </span>

                          {isUpdatingStatus
                            ? "Updating..."
                            : "Remove Listing"}
                        </button>
                      )}
                    </div>

                    <div className="my-listing-actions">
                      <Link
                        to={`/marketplace/${listingId}`}
                        className="my-listing-view-button"
                      >
                        <span className="material-symbols-rounded">
                          visibility
                        </span>

                        View
                      </Link>

                      <Link
                        to={`/marketplace/edit/${listingId}`}
                        className="my-listing-edit-button"
                      >
                        <span className="material-symbols-rounded">
                          edit
                        </span>

                        Edit
                      </Link>

                      <button
                        type="button"
                        className="my-listing-delete-button"
                        disabled={
                          isDeleting ||
                          isUpdatingStatus ||
                          updatingTransactionId !== null
                        }
                        onClick={() =>
                          handleDelete(
                            listingId,
                            listing.title
                          )
                        }
                      >
                        <span className="material-symbols-rounded">
                          delete
                        </span>

                        {isDeleting
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}