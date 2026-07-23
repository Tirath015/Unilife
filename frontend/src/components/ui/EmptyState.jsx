import React from "react";
export function EmptyState({ icon = 'search_off', title, body }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-rounded">{icon}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

