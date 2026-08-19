import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { notificationService } from "../services/notificationService";
import { formatDate } from "../utils/formatters";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setPageError("");

      const response = await notificationService.getNotifications();

      const notificationList = Array.isArray(response)
        ? response
        : response?.notifications || response?.items || [];

      const normalizedNotifications = notificationList.map((notification) => ({
        id:
          notification.notificationId ??
          notification.id,

        title:
          notification.title ||
          notification.type ||
          "New Notification",

        message:
          notification.message ||
          notification.notificationText ||
          notification.text ||
          notification.content ||
          "You have a new notification.",

        isRead:
          notification.isRead ??
          notification.read ??
          false,

        createdAt:
          notification.createdAt ||
          notification.dateCreated ||
          notification.sentAt ||
          notification.date,

        listingId:
          notification.listingId ??
          notification.relatedListingId,

        messageId:
          notification.messageId ??
          notification.chatMessageId,

        senderName:
          notification.senderName ||
          notification.userName ||
          notification.fromUserName,
      }));

      setNotifications(normalizedNotifications);
    } catch (error) {
      console.error("Failed to load notifications:", error);

      setPageError(
        error?.message || "Notifications could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationId) {
    try {
      setUpdatingId(notificationId);

      await notificationService.markAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Could not mark notification as read:", error);

      setPageError(
        error?.message ||
          "The notification could not be marked as read."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleMarkAllAsRead() {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.isRead
    );

    if (unreadNotifications.length === 0) {
      return;
    }

    try {
      setPageError("");

      await Promise.all(
        unreadNotifications.map((notification) =>
          notificationService.markAsRead(notification.id)
        )
      );

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (error) {
      console.error("Could not mark all notifications as read:", error);

      setPageError(
        error?.message ||
          "Some notifications could not be marked as read."
      );
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return <LoadingState label="Loading notifications..." />;
  }

  return (
    <section className="notifications-page">
      <div className="notifications-page-header">
        <div>
          <span className="page-eyebrow">Updates</span>
          <h1>Notifications</h1>
          <p>
            You have {unreadCount} unread{" "}
            {unreadCount === 1 ? "notification" : "notifications"}.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {pageError && (
        <div className="error-box">
          {pageError}
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="notifications-empty-card">
          <span className="material-symbols-rounded">
            notifications
          </span>

          <h2>No notifications yet</h2>

          <p>
            Messages, marketplace activity, and account updates
            will appear here.
          </p>

          <Link
            className="btn btn-primary btn-md"
            to="/marketplace"
          >
            Browse Marketplace
          </Link>
        </Card>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`notification-card ${
                notification.isRead
                  ? "notification-read"
                  : "notification-unread"
              }`}
            >
              <div className="notification-icon">
                <span className="material-symbols-rounded">
                  {notification.isRead
                    ? "notifications"
                    : "notifications_active"}
                </span>
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>

                  {!notification.isRead && (
                    <span className="notification-unread-dot" />
                  )}
                </div>

                {notification.senderName && (
                  <strong className="notification-sender">
                    {notification.senderName}
                  </strong>
                )}

                <p>{notification.message}</p>

                <div className="notification-footer">
                  <small>
                    {notification.createdAt
                      ? formatDate(notification.createdAt)
                      : "Recently"}
                  </small>

                  <div className="notification-actions">
                    {notification.listingId && (
                      <Link
                        className="btn btn-outline btn-sm"
                        to={`/marketplace/${notification.listingId}`}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkAsRead(notification.id);
                          }
                        }}
                      >
                        View Listing
                      </Link>
                    )}

                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        disabled={updatingId === notification.id}
                        onClick={() =>
                          handleMarkAsRead(notification.id)
                        }
                      >
                        {updatingId === notification.id
                          ? "Updating..."
                          : "Mark as read"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}