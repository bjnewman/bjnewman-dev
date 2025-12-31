import React, { useState } from 'react';

export const ProjectFilter: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'web' | 'mobile'>('all');

  return (
    <div className="project-filter">
      <h2>Interactive Project Filter</h2>
      <div className="filter-buttons">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? 'active' : ''}
        >
          All Projects
        </button>
        <button
          onClick={() => setFilter('web')}
          className={filter === 'web' ? 'active' : ''}
        >
          Web
        </button>
        <button
          onClick={() => setFilter('mobile')}
          className={filter === 'mobile' ? 'active' : ''}
        >
          Mobile
        </button>
      </div>
      <p className="filter-status">Currently showing: <strong>{filter}</strong> projects</p>
    </div>
  );
};
