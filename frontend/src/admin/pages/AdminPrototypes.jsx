import React from "react";
import { Card } from "../../components/ui/Card";

const futureModules = [
  {
    title: "Discussions Moderation",
    body: "Future admin tools for pinning, locking, editing, and deleting student discussions.",
    icon: "forum",
  },
  {
    title: "Campus Events Management",
    body: "Future admin tools for creating, editing, and removing campus events.",
    icon: "calendar_month",
  },
  {
    title: "Resources Management",
    body: "Future admin tools for updating library, IT support, counselling, tutoring, and emergency contacts.",
    icon: "local_library",
  },
];

export function AdminPrototypes() {
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="eyebrow">Future Scope</span>
          <h2>Prototype Admin Modules</h2>
          <p>
            These sections are planned for future development after users,
            listings, and reports are completed.
          </p>
        </div>
      </div>

      <section className="admin-module-grid">
        {futureModules.map((module) => (
          <Card className="admin-module-card" key={module.title}>
            <span className="material-symbols-rounded">{module.icon}</span>

            <div>
              <h3>{module.title}</h3>
              <p>{module.body}</p>
            </div>
          </Card>
        ))}
      </section>
    </>
  );
}
