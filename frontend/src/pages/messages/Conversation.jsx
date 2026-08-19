import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LoadingState } from "../../components/ui/LoadingState";
import { messageService } from "../../services/messageService";
import { formatDate } from "../../utils/formatters";

export function Conversation() {
  const { otherUserId, listingId } = useParams();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [pageError, setPageError] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, [otherUserId, listingId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function loadConversation() {
    try {
      setLoading(true);
      setPageError("");

      const response = await messageService.getConversation(
        otherUserId,
        listingId
      );

      const conversationMessages = Array.isArray(response)
        ? response
        : response?.messages || [];

      setConversation(response);
      setMessages(conversationMessages);

      const unreadMessages = conversationMessages.filter(
        (message) =>
          !message.isRead &&
          Number(message.receiverId) === Number(response?.currentUserId)
      );

      await Promise.all(
        unreadMessages.map((message) =>
          messageService.markAsRead(
            message.messageId ?? message.chatMessageId ?? message.id
          )
        )
      );

      if (unreadMessages.length > 0) {
        setMessages((currentMessages) =>
          currentMessages.map((message) =>
            unreadMessages.some(
              (unread) =>
                (unread.messageId ??
                  unread.chatMessageId ??
                  unread.id) ===
                (message.messageId ??
                  message.chatMessageId ??
                  message.id)
            )
              ? { ...message, isRead: true }
              : message
          )
        );
      }
    } catch (error) {
      console.error("Could not load conversation:", error);

      setPageError(
        error?.message || "The conversation could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!messageText.trim()) {
      return;
    }

    try {
      setSending(true);
      setPageError("");

      const response = await messageService.sendMessage({
        receiverId: Number(otherUserId),
        listingId: Number(listingId),
        messageText: messageText.trim(),
      });

      const newMessage = {
        messageId: response.messageId,
        senderId: response.senderId,
        receiverId: response.receiverId,
        listingId: response.listingId,
        messageText: response.messageText,
        sentAt: response.sentAt,
        isRead: response.isRead,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        newMessage,
      ]);

      setMessageText("");
    } catch (error) {
      console.error("Message could not be sent:", error);

      setPageError(
        error?.message || "Your message could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading conversation..." />;
  }

  const currentUserId =
    conversation?.currentUserId;

  const otherUserName =
    conversation?.otherUser?.fullName ||
    conversation?.otherUserName ||
    "Marketplace User";

  const listingTitle =
    conversation?.listing?.title ||
    conversation?.listingTitle ||
    "Marketplace Listing";

  return (
    <section className="conversation-page">
      <Link className="back-link" to="/messages">
        ← Back to Inbox
      </Link>

      <Card className="conversation-card">
        <header className="conversation-header">
          <div>
            <span className="page-eyebrow">Conversation</span>
            <h1>{otherUserName}</h1>

            <Link to={`/marketplace/${listingId}`}>
              {listingTitle}
            </Link>
          </div>
        </header>

        {pageError && <div className="error-box">{pageError}</div>}

        <div className="conversation-messages">
          {messages.length === 0 ? (
            <div className="conversation-empty">
              <span className="material-symbols-rounded">chat</span>
              <p>No messages in this conversation yet.</p>
            </div>
          ) : (
            messages.map((message) => {
              const messageId =
                message.messageId ??
                message.chatMessageId ??
                message.id;

              const isCurrentUser =
                Number(message.senderId) === Number(currentUserId);

              return (
                <div
                  key={messageId}
                  className={`conversation-message-row ${
                    isCurrentUser
                      ? "conversation-message-own"
                      : "conversation-message-other"
                  }`}
                >
                  <div className="conversation-message-bubble">
                    <p>{message.messageText}</p>

                    <small>
                      {message.sentAt
                        ? formatDate(message.sentAt)
                        : "Recently"}
                    </small>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="conversation-form"
          onSubmit={handleSendMessage}
        >
          <textarea
            value={messageText}
            onChange={(event) =>
              setMessageText(event.target.value)
            }
            placeholder="Write a message..."
            rows="2"
            maxLength="1000"
            disabled={sending}
          />

          <Button
            type="submit"
            disabled={sending || !messageText.trim()}
          >
            <span className="material-symbols-rounded">
              send
            </span>

            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </Card>
    </section>
  );
}