import React from "react";
export function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      <p>{label}</p>
    </div>
  );
}

