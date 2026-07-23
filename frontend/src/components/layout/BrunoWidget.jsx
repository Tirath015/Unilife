import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { brunoService } from "../../services/brunoService";

const starterMessages = [
  {
    role: "assistant",
    text: "Hi, I am Bruno. Ask me about marketplace listings, campus resources, jobs, events, or notifications.",
  },
];

export function BrunoWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleOpenBruno() {
      setOpen(true);
    }

    window.addEventListener("open-bruno-widget", handleOpenBruno);

    return () => {
      window.removeEventListener("open-bruno-widget", handleOpenBruno);
    };
  }, []);

  async function sendMessage(text = input) {
    const message = text.trim();

    if (!message) return;

    setMessages((current) => [...current, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const response = await brunoService.ask(message);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: response.reply,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Sorry, Bruno could not respond right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const widget = (
    <div className="bruno-widget">
      {open && (
        <section className="bruno-panel" aria-label="Bruno AI assistant">
          <header>
            <div className="bruno-header-left">
              <img
                src="/images/bruno-cutout.png"
                alt="Bruno AI"
                className="bruno-header-img"
              />

              <div>
                <strong>Bruno AI</strong>
                <span>Campus assistant</span>
              </div>
            </div>

            <button type="button" onClick={() => setOpen(false)}>
              ×
            </button>
          </header>

          <div className="bruno-messages">
            {messages.map((message, index) => (
              <p
                key={`${message.role}-${index}`}
                className={`chat-bubble ${message.role}`}
              >
                {message.text}
              </p>
            ))}

            {loading && (
              <p className="chat-bubble assistant typing">
                Bruno is typing...
              </p>
            )}
          </div>

          <div className="bruno-suggestions">
            {["How do I sell?", "Find campus help", "Show jobs"].map(
              (suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                >
                  {suggestion}
                </button>
              )
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask Bruno..."
            />

            <button type="submit" aria-label="Send message">
              <span className="material-symbols-rounded">send</span>
            </button>
          </form>
        </section>
      )}

      <button
        type="button"
        className="bruno-fab"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open Bruno AI"
      >
        <img
          src="/images/bruno-cutout.png"
          alt="Bruno AI"
          className="bruno-fab-img"
        />
      </button>
    </div>
  );

  return createPortal(widget, document.body);
}
