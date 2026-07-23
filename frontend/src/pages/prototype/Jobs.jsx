import React from "react";
import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { jobsService } from '../../services/jobsService';
import { formatDate } from '../../utils/formatters';

export function Jobs() {
  const [filters, setFilters] = useState({ query: '', type: 'All' });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    jobsService.getJobs(filters).then(setJobs).finally(() => setLoading(false));
  }, [filters]);

  return (
    <>
      <PageHeader  title="Student Jobs" description="Future job board for part-time, co-op, tutoring, and campus opportunities." />
      <div className="toolbar card">
        <label className="search-field">
          <span className="material-symbols-rounded">search</span>
          <input placeholder="Search jobs, companies, skills..." value={filters.query} onChange={(e) => setFilters({ ...filters, query: e.target.value })} />
        </label>
        <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option>All</option>
          <option>Co-op</option>
          <option>Part-time</option>
        </select>
      </div>
      {loading ? <LoadingState label="Loading job..." /> : null}
      {!loading && jobs.length === 0 ? <EmptyState icon="work_off" title="No jobs found" body="Try another search term or job type." /> : null}
      <div className="job-list">
        {jobs.map((job) => (
          <Card key={job.id} className="job-card">
            <div>
              <small>{job.type}</small>
              <h3>{job.title}</h3>
              <p>{job.company} • {job.location}</p>
              <div className="chip-row">{job.skills.map((skill) => <span key={skill} className="chip">{skill}</span>)}</div>
            </div>
            <div className="job-side">
              <strong>{job.pay}</strong>
              <span>Deadline: {formatDate(job.deadline)}</span>
              <Button variant="outline">View Job</Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

