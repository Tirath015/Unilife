import React from "react";
import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { resourcesService } from '../../services/resourcesService';

export function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resourcesService.getResources().then(setResources).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title="Campus Resources" description="Quick access to student support services and emergency information." />
      {loading ? <LoadingState label="Loading resources..." /> : null}
      <div className="resource-grid">
        {resources.map((resource) => (
          <Card key={resource.id} className="resource-card">
            <span className="icon-circle material-symbols-rounded">{resource.icon}</span>
            <h3>{resource.title}</h3>
            <p>{resource.body}</p>
            <div className="resource-meta">
              <span>{resource.hours}</span>
              <a href={`mailto:${resource.contact}`}>{resource.contact}</a>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

