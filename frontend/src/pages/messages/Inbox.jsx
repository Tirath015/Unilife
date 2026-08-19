import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";
import { messageService } from "../../services/messageService";
import { formatDate } from "../../utils/formatters";

export function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    loadInbox();
  }, []);

  async function loadInbox() {
    try {
      setLoading(true);
      setPageError("");

      const response = await messageService.getInbox();

      const inboxItems = Array.isArray(response)
        ? response
        : response?.items || response?.conversations || [];

      setConversations(inboxItems);
    } catch (error) {
      console.error("Could not load inbox:", error);

      setPageError(
        error?.message || "Your conversations could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  function getInitials(name) {
    return String(name || "User")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  if (loading) {
    return <LoadingState label="Loading conversations..." />;
  }

  return (
    <section className="inbox-page">
      <div className="inbox-page-header">
        <div>
          <span className="page-eyebrow">Messages</span>
          <h1>Inbox</h1>
          <p>View your marketplace conversations.</p>
        </div>
      </div>

      {pageError && <div className="error-box">{pageError}</div>}

      {conversations.length === 0 ? (
        <Card className="inbox-empty-card">
          <span className="material-symbols-rounded">forum</span>
          <h2>No conversations yet</h2>
          <p>
            When you contact a seller or receive a message, the conversation
            will appear here.
          </p>

          <Link className="btn btn-primary btn-md" to="/marketplace">
            Browse Marketplace
          </Link>
        </Card>
      ) : (
        <div className="inbox-list">
          {conversations.map((conversation) => {
            const otherUserId =
              conversation.otherUserId ?? conversation.userId;

            const listingId =
              conversation.listingId ?? conversation.productId;

            const otherUserName =
              conversation.otherUserName ||
              conversation.userName ||
              "Marketplace User";

            const lastMessage =
              conversation.lastMessage ||
              conversation.messageText ||
              "Open the conversation.";

            const sentAt =
              conversation.sentAt ||
              conversation.lastMessageAt ||
              conversation.createdAt;

            const hasUnreadMessage =
              conversation.hasUnreadMessage ??
              conversation.isUnread ??
              false;

            return (
              <Link
                key={`${otherUserId}-${listingId}`}
                className="inbox-conversation-link"
                to={`/messages/${otherUserId}/${listingId}`}
              >
                <Card
                  className={`inbox-conversation-card ${
                    hasUnreadMessage ? "inbox-unread" : ""
                  }`}
                >
                  <div className="inbox-avatar">
                    {getInitials(otherUserName)}
                  </div>

                  <div className="inbox-conversation-content">
                    <div className="inbox-conversation-top">
                      <div>
                        <h3>{otherUserName}</h3>
                        <span>
                          {conversation.listingTitle || "Marketplace Listing"}
                        </span>
                      </div>

                      <small>{sentAt ? formatDate(sentAt) : "Recently"}</small>
                    </div>

                    <div className="inbox-message-row">
                      <p>{lastMessage}</p>

                      {hasUnreadMessage && (
                        <span className="inbox-unread-badge">New</span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}