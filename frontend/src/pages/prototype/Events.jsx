import React from "react";
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { eventsService } from '../../services/eventsService';
import { formatDate } from '../../utils/formatters';

export function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsService.getEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  async function register(eventId) {
    await eventsService.register(eventId);
    setEvents((current) => current.map((event) => event.id === eventId ? { ...event, registered: true, attendees: event.attendees + 1 } : event));
  }

  return (
    <>
      <PageHeader title="Campus Events" description="Future events module with calendar and registration support." />
      <Card className="campus-banner">
        <div>
          <h2>Discover what is happening on campus</h2>
          <p>Workshops, clubs, career sessions, and student community events.</p>
        </div>
        <span className="material-symbols-rounded">event_available</span>
      </Card>
      {loading ? <LoadingState label="Loading events..." /> : null}
      <div className="event-grid">
        {events.map((event) => (
          <Card key={event.id} className="event-card">
            <small>{event.category}</small>
            <h3>{event.title}</h3>
            <p><span className="material-symbols-rounded">calendar_today</span> {formatDate(event.date)} at {event.time}</p>
            <p><span className="material-symbols-rounded">location_on</span> {event.location}</p>
            <p>{event.attendees} students interested</p>
            <Button variant={event.registered ? 'outline' : 'primary'} onClick={() => register(event.id)} disabled={event.registered}>{event.registered ? 'Registered' : 'Register'}</Button>
          </Card>
        ))}
      </div>
    </>
  );
}

