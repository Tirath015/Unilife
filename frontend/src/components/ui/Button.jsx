import React from "react";
export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {children}
    </button>
  );
}

