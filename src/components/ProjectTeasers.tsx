import { useState } from 'react';

interface ProjectTeaser {
  title: string;
  description: string;
  icon: string;
  tags: string[];
  status: 'exploring' | 'planning' | 'building';
}

const teasers: ProjectTeaser[] = [
  {
    title: 'React Server Components',
    description: 'Exploring the new React paradigm with Next.js App Router. Building something that showcases streaming, suspense, and server actions.',
    icon: '⚛️',
    tags: ['React 19', 'Next.js', 'Server Components'],
    status: 'exploring',
  },
  {
    title: 'Open Source Contribution',
    description: 'Contributing to developer tools I use daily. Looking at Astro plugins, testing libraries, and accessibility tooling.',
    icon: '🔧',
    tags: ['Open Source', 'TypeScript', 'Community'],
    status: 'planning',
  },
  {
    title: 'CLI Tool',
    description: 'A command-line utility for something I do repeatedly. Probably involving Git workflows or project scaffolding.',
    icon: '⌨️',
    tags: ['Node.js', 'CLI', 'Developer Experience'],
    status: 'exploring',
  },
];

const statusLabels = {
  exploring: { label: 'Exploring', color: 'var(--text-muted)' },
  planning: { label: 'Planning', color: 'var(--accent)' },
  building: { label: 'Building', color: 'var(--primary)' },
};

export const ProjectTeasers = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="project-teasers">
      <div className="project-teasers__counter">
        <span className="project-teasers__count">1</span>
        <span className="project-teasers__separator">/</span>
        <span className="project-teasers__total">?</span>
        <span className="project-teasers__label">projects shipped</span>
      </div>

      <div className="project-teasers__grid">
        {teasers.map((teaser, index) => {
          const isExpanded = expandedIndex === index;
          const status = statusLabels[teaser.status];

          return (
            <button
              key={index}
              className={`project-teaser ${isExpanded ? 'project-teaser--expanded' : ''}`}
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              aria-expanded={isExpanded}
            >
              <div className="project-teaser__header">
                <span className="project-teaser__icon">{teaser.icon}</span>
                <div className="project-teaser__info">
                  <h4 className="project-teaser__title">{teaser.title}</h4>
                  <span
                    className="project-teaser__status"
                    style={{ color: status.color }}
                  >
                    {status.label}
                  </span>
                </div>
              </div>
              {isExpanded && (
                <div className="project-teaser__content">
                  <p className="project-teaser__description">{teaser.description}</p>
                  <div className="project-teaser__tags">
                    {teaser.tags.map((tag) => (
                      <span key={tag} className="project-teaser__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
