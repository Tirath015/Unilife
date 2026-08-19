import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";

import { marketplaceTransactionService } from "../../services/marketplaceTransactionService";

function getTransactionStatusText(status) {
  switch (Number(status)) {
    case 1:
      return "Interested";
    case 2:
      return "Accepted";
    case 3:
      return "Waiting for Buyer";
    case 4:
      return "Completed";
    case 5:
      return "Cancelled";
    case 6:
      return "Rejected";
    default:
      return "Unknown";
  }
}

function getTransactionStatusClass(status) {
  switch (Number(status)) {
    case 1:
      return "interested";
    case 2:
      return "accepted";
    case 3:
      return "waiting";
    case 4:
      return "completed";
    case 5:
      return "cancelled";
    case 6:
      return "rejected";
    default:
      return "unknown";
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MyTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    loadTransactions();
  }, []);

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");

      const response =
        await marketplaceTransactionService.getMyTransactions();

      const transactionData = Array.isArray(response)
        ? response
        : response?.data || [];

      setTransactions(transactionData);
    } catch (err) {
      console.error(
        "Could not load transactions:",
        err
      );

      setError(
        err?.message ||
          "Your marketplace transactions could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleBuyerConfirm(
    transactionId,
    listingTitle
  ) {
    const confirmed = window.confirm(
      `Confirm that you received "${listingTitle}" and completed the transaction?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(transactionId);
      setError("");
      setSuccessMessage("");

      await marketplaceTransactionService.buyerConfirm(
        transactionId
      );

      setSuccessMessage(
        "Transaction confirmed successfully. You may now review the seller."
      );

      await loadTransactions();
    } catch (err) {
      console.error(
        "Could not confirm transaction:",
        err
      );

      setError(
        err?.message ||
          "The transaction could not be confirmed."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleSellerComplete(
    transactionId,
    listingTitle
  ) {
    const confirmed = window.confirm(
      `Mark the transaction for "${listingTitle}" as completed by the seller?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(transactionId);
      setError("");
      setSuccessMessage("");

      await marketplaceTransactionService.sellerComplete(
        transactionId
      );

      setSuccessMessage(
        "Transaction marked complete. Waiting for the buyer to confirm receipt."
      );

      await loadTransactions();
    } catch (err) {
      console.error(
        "Could not complete transaction:",
        err
      );

      setError(
        err?.message ||
          "The transaction could not be completed."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancelTransaction(
    transactionId,
    listingTitle
  ) {
    const confirmed = window.confirm(
      `Cancel the transaction for "${listingTitle}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(transactionId);
      setError("");
      setSuccessMessage("");

      await marketplaceTransactionService.cancelTransaction(
        transactionId
      );

      setSuccessMessage(
        "Transaction cancelled successfully."
      );

      await loadTransactions();
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
      setUpdatingId(null);
    }
  }

  const filteredTransactions =
    transactions.filter((transaction) => {
      const role = String(
        transaction.role || ""
      ).toLowerCase();

      if (activeTab === "buyer") {
        return role === "buyer";
      }

      if (activeTab === "seller") {
        return role === "seller";
      }

      if (activeTab === "completed") {
        return Number(transaction.status) === 4;
      }

      return true;
    });

  if (loading) {
    return (
      <LoadingState label="Loading your transactions..." />
    );
  }

  return (
    <section className="my-transactions-page">
      <div className="my-transactions-header">
        <div>
          <span className="my-transactions-eyebrow">
            Marketplace Activity
          </span>

          <h1>My Transactions</h1>

          <p>
            Track purchases, sales and completed marketplace
            exchanges.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="my-transactions-marketplace-link"
        >
          <span className="material-symbols-rounded">
            storefront
          </span>

          Browse Marketplace
        </Link>
      </div>

      {successMessage && (
        <div className="my-transactions-success">
          <span className="material-symbols-rounded">
            check_circle
          </span>

          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="my-transactions-error">
          <span className="material-symbols-rounded">
            error
          </span>

          <span>{error}</span>
        </div>
      )}

      <div className="my-transactions-tabs">
        <button
          type="button"
          className={
            activeTab === "all" ? "active" : ""
          }
          onClick={() => setActiveTab("all")}
        >
          All
        </button>

        <button
          type="button"
          className={
            activeTab === "buyer" ? "active" : ""
          }
          onClick={() => setActiveTab("buyer")}
        >
          Purchases
        </button>

        <button
          type="button"
          className={
            activeTab === "seller" ? "active" : ""
          }
          onClick={() => setActiveTab("seller")}
        >
          Sales
        </button>

        <button
          type="button"
          className={
            activeTab === "completed" ? "active" : ""
          }
          onClick={() => setActiveTab("completed")}
        >
          Completed
        </button>
      </div>

      {filteredTransactions.length === 0 ? (
        <Card className="my-transactions-empty">
          <span className="material-symbols-rounded">
            handshake
          </span>

          <h2>No transactions found</h2>

          <p>
            Your buyer and seller transactions will appear
            here.
          </p>

          <Link
            to="/marketplace"
            className="my-transactions-marketplace-link"
          >
            Browse Marketplace
          </Link>
        </Card>
      ) : (
        <div className="my-transactions-list">
          {filteredTransactions.map((transaction) => {
            const transactionId =
              transaction.transactionId ??
              transaction.id;

            const status = Number(
              transaction.status
            );

            const role = String(
              transaction.role || ""
            );

            const isBuyer =
              role.toLowerCase() === "buyer";

            const isSeller =
              role.toLowerCase() === "seller";

            const isUpdating =
              updatingId === transactionId;

            const statusText =
              getTransactionStatusText(status);

            const statusClass =
              getTransactionStatusClass(status);

            return (
              <Card
                className="my-transaction-card"
                key={transactionId}
              >
                <div className="my-transaction-top">
                  <div>
                    <span className="my-transaction-role">
                      {isBuyer
                        ? "Buyer Transaction"
                        : "Seller Transaction"}
                    </span>

                    <Link
                      to={`/marketplace/${transaction.listingId}`}
                      className="my-transaction-title-link"
                    >
                      <h2>
                        {transaction.listingTitle ||
                          "Marketplace Listing"}
                      </h2>
                    </Link>
                  </div>

                  <span
                    className={`my-transaction-status ${statusClass}`}
                  >
                    {statusText}
                  </span>
                </div>

                <div className="my-transaction-people">
                  <div>
                    <span>Buyer</span>

                    <strong>
                      {transaction.buyerName ||
                        "Marketplace Buyer"}
                    </strong>
                  </div>

                  <span className="material-symbols-rounded">
                    arrow_forward
                  </span>

                  <div>
                    <span>Seller</span>

                    <strong>
                      {transaction.sellerName ||
                        "Marketplace Seller"}
                    </strong>
                  </div>
                </div>

                <div className="my-transaction-timeline">
                  <div className="my-transaction-timeline-item active">
                    <span className="material-symbols-rounded">
                      favorite
                    </span>

                    <div>
                      <strong>Interest Sent</strong>

                      <small>
                        {formatDate(
                          transaction.createdAt
                        )}
                      </small>
                    </div>
                  </div>

                  <div
                    className={`my-transaction-timeline-item ${
                      status >= 2 ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-rounded">
                      person_check
                    </span>

                    <div>
                      <strong>Buyer Accepted</strong>

                      <small>
                        {transaction.acceptedAt
                          ? formatDate(
                              transaction.acceptedAt
                            )
                          : "Pending"}
                      </small>
                    </div>
                  </div>

                  <div
                    className={`my-transaction-timeline-item ${
                      status >= 3 ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-rounded">
                      inventory
                    </span>

                    <div>
                      <strong>
                        Seller Completed
                      </strong>

                      <small>
                        {transaction.sellerCompletedAt
                          ? formatDate(
                              transaction.sellerCompletedAt
                            )
                          : "Pending"}
                      </small>
                    </div>
                  </div>

                  <div
                    className={`my-transaction-timeline-item ${
                      status === 4 ? "active" : ""
                    }`}
                  >
                    <span className="material-symbols-rounded">
                      verified
                    </span>

                    <div>
                      <strong>
                        Buyer Confirmed
                      </strong>

                      <small>
                        {transaction.buyerConfirmedAt
                          ? formatDate(
                              transaction.buyerConfirmedAt
                            )
                          : "Pending"}
                      </small>
                    </div>
                  </div>
                </div>

                {status === 1 && isBuyer && (
                  <div className="my-transaction-info-message">
                    Your interest has been sent. Wait for the
                    seller to accept your request.
                  </div>
                )}

                {status === 1 && isSeller && (
                  <div className="my-transaction-info-message">
                    Open My Listings to accept or reject this
                    buyer.
                  </div>
                )}

                {status === 2 && isBuyer && (
                  <div className="my-transaction-info-message accepted">
                    The seller accepted your request. Arrange
                    pickup or delivery with the seller.
                  </div>
                )}

                {status === 2 && isSeller && (
                  <div className="my-transaction-info-message accepted">
                    Complete the exchange, then mark the
                    transaction complete.
                  </div>
                )}

                {status === 3 && isBuyer && (
                  <div className="my-transaction-info-message waiting">
                    The seller marked the transaction complete.
                    Confirm only after receiving the item.
                  </div>
                )}

                {status === 3 && isSeller && (
                  <div className="my-transaction-info-message waiting">
                    Waiting for the buyer to confirm receipt.
                  </div>
                )}

                {status === 4 && (
                  <div className="my-transaction-completed-message">
                    <span className="material-symbols-rounded">
                      verified
                    </span>

                    Verified marketplace transaction completed.
                  </div>
                )}

                <div className="my-transaction-actions">
                  <Link
                    to={`/marketplace/${transaction.listingId}`}
                    className="my-transaction-view-button"
                  >
                    <span className="material-symbols-rounded">
                      visibility
                    </span>

                    View Listing
                  </Link>

                  {isSeller && status === 2 && (
                    <button
                      type="button"
                      className="my-transaction-complete-button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleSellerComplete(
                          transactionId,
                          transaction.listingTitle
                        )
                      }
                    >
                      <span className="material-symbols-rounded">
                        task_alt
                      </span>

                      {isUpdating
                        ? "Updating..."
                        : "Mark Complete"}
                    </button>
                  )}

                  {isBuyer && status === 3 && (
                    <button
                      type="button"
                      className="my-transaction-confirm-button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleBuyerConfirm(
                          transactionId,
                          transaction.listingTitle
                        )
                      }
                    >
                      <span className="material-symbols-rounded">
                        inventory_2
                      </span>

                      {isUpdating
                        ? "Confirming..."
                        : "Confirm Received"}
                    </button>
                  )}

                  {isBuyer && status === 4 && (
                    <Link
                      to={`/marketplace/${transaction.listingId}`}
                      className="my-transaction-review-button"
                    >
                      <span className="material-symbols-rounded">
                        star
                      </span>

                      Leave Review
                    </Link>
                  )}

                  {[1, 2].includes(status) && (
                    <button
                      type="button"
                      className="my-transaction-cancel-button"
                      disabled={isUpdating}
                      onClick={() =>
                        handleCancelTransaction(
                          transactionId,
                          transaction.listingTitle
                        )
                      }
                    >
                      <span className="material-symbols-rounded">
                        close
                      </span>

                      {isUpdating
                        ? "Cancelling..."
                        : "Cancel"}
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}