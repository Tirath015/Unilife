import React from "react";
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

export function NotFound() {
  return (
    <Card className="success-page-card">
      <h1>Page not found</h1>
      <p>This route does not exist in the UniLife frontend.</p>
      <Link className="btn btn-primary btn-md" to="/dashboard">Go to Dashboard</Link>
    </Card>
  );
}

