import React from "react";
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { notificationsService } from '../../services/notificationsService';

const iconByType = {
  message: 'mail',
  marketplace: 'storefront',
  event: 'calendar_month',
};

export function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsService.getNotifications().then(setItems).finally(() => setLoading(false));
  }, []);

  async function markAllRead() {
    await notificationsService.markAllRead();
    setItems((current) => current.map((item) => ({ ...item, unread: false })));
  }

  return (
    <>
      <PageHeader
        eyebrow="Alerts"
        title="Notifications"
        description="Marketplace updates, seller messages, and event reminders."
        action={<Button variant="outline" onClick={markAllRead}>Mark all read</Button>}
      />
      {loading ? <LoadingState label="Loading notifications..." /> : null}
      <div className="stack-list">
        {items.map((item) => (
          <Card key={item.id} className={`notification-card ${item.unread ? 'unread' : ''}`}>
            <span className="icon-circle material-symbols-rounded">{iconByType[item.type] || 'notifications'}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
            </div>
            {item.unread && <span className="unread-dot" />}
          </Card>
        ))}
      </div>
    </>
  );
}

