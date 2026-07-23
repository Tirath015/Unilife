import React from "react";
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { discussionsService } from '../../services/discussionsService';

export function Discussions() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', category: 'Campus Life', body: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    discussionsService.getDiscussions().then(setItems).finally(() => setLoading(false));
  }, []);

  async function submitDiscussion(event) {
    event.preventDefault();
    const created = await discussionsService.createDiscussion(form);
    setItems((current) => [created, ...current]);
    setForm({ title: '', category: 'Campus Life', body: '' });
  }

  return (
    <>
      <PageHeader  title="Student Discussions" description="Future discussion forum for student questions, advice, and campus topics." />
      <section className="discussion-layout">
        <Card className="discussion-form-card">
          <h2>Start a discussion</h2>
          <form onSubmit={submitDiscussion} className="form-grid">
            <label>Title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
            <label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Campus Life</option><option>Frontend</option><option>Marketplace Help</option><option>Jobs</option></select></label>
            <label>Message<textarea rows="4" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required /></label>
            <Button>Post Discussion</Button>
          </form>
        </Card>
        <div className="discussion-list">
          {loading ? <LoadingState label="Loading discussions..." /> : null}
          {items.map((item) => (
            <Card key={item.id} className="discussion-card">
              <div className="discussion-card-header">
                <span className="chip">{item.category}</span>
                <small>{item.lastActive}</small>
              </div>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <footer><span>By {item.author}</span><span>{item.replies} replies</span></footer>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}

