import React from "react";
import { Link } from 'react-router-dom';

export function Logo({ to = '/' }) {
  return (
    <Link className="logo" to={to}>
      <span className="logo-mark material-symbols-rounded">school</span>
      <span>UniLife</span>
    </Link>
  );
}

