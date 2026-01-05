import { useState } from 'react';
import { flushSync } from 'react-dom';
import { UserCog, Rocket, Atom, MessageSquare, Bug, LucideIcon } from 'lucide-react';

interface Role {
  title: string;
  company: string;
  period: string;
  location: string;
  icon: LucideIcon;
  vibe: string;
  highlights: string[];
  isPromotion?: boolean;
}

const roles: Role[] = [
  {
    title: 'Tech Lead',
    company: 'Availity',
    period: '2023 - Now',
    location: 'Remote',
    icon: UserCog,
    vibe: 'Leading a team, breaking up monoliths, trying to make healthcare IT slightly less painful',
    isPromotion: true,
    highlights: [
      'Got promoted to lead a team of 6 devs + QA',
      'Migrated legacy Java to AWS microservices (EKS, Kubernetes, Aurora)',
      'Our app handles 100k daily users — 10% of portal traffic',
      'Host a weekly dev meetup with 30-40 attendees',
      'Mentor juniors, do office hours, contribute to open source',
    ],
  },
  {
    title: 'Software Engineer 2',
    company: 'Availity',
    period: '2021 - 2023',
    location: 'Remote',
    icon: Rocket,
    vibe: 'Owned a product, fixed performance nightmares, modernized builds',
    isPromotion: true,
    highlights: [
      'Primary UI dev for medical attachments product',
      'Built streaming uploads — no more dropped files',
      'Virtualized infinite scroll — memory usage dropped significantly',
      'Rewrote upload flow from blocking to parallel',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Availity',
    period: '2019 - 2021',
    location: 'Remote',
    icon: Atom,
    vibe: 'Solo dev, rewrote Angular apps to React, learned healthcare domain',
    highlights: [
      'Solo UI dev on clinical software team',
      'Migrated Angular and legacy Java UI to React',
      'First time working in healthcare — steep learning curve',
    ],
  },
  {
    title: 'Software Developer',
    company: 'Prevail Health',
    period: '2017 - 2018',
    location: 'Chicago',
    icon: MessageSquare,
    vibe: 'Full-stack on a mental health startup, video chat + real-time features',
    highlights: [
      'Built video and chat features for mental health platform',
      'Migrated chat from Postgres to Firebase',
      'First React job — learned fast',
    ],
  },
  {
    title: 'QA → Dev',
    company: 'Prevail Health',
    period: '2017',
    location: 'Chicago',
    icon: Bug,
    vibe: 'Started in QA, automated myself into a dev role',
    highlights: [
      'Sole QA for multiple apps',
      'Built automation framework from scratch',
      'Proved I could code — got promoted to dev',
    ],
  },
];

export const ResumeTimeline = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  // Handle expand/collapse with View Transitions API
  const handleToggle = (index: number) => {
    const newValue = expandedIndex === index ? null : index;

    // Use View Transitions API if available for smooth animations
    // Skip in automated browser environments (Playwright sets navigator.webdriver = true)
    const isAutomatedBrowser = typeof navigator !== 'undefined' && navigator.webdriver === true;
    if (document.startViewTransition && !isAutomatedBrowser) {
      document.startViewTransition(() => {
        flushSync(() => {
          setExpandedIndex(newValue);
        });
      });
    } else {
      setExpandedIndex(newValue);
    }
  };

  return (
    <div className="timeline">
      {roles.map((role, index) => {
        const isExpanded = expandedIndex === index;
        const prevRole = roles[index + 1];
        const showPromotionLine = role.isPromotion && prevRole?.company === role.company;

        return (
          <div
            key={index}
            style={{ viewTransitionName: `timeline-item-${index}` }}
            className={`timeline__item ${isExpanded ? 'timeline__item--expanded' : ''} ${showPromotionLine ? 'timeline__item--promoted' : ''}`}
          >
            <button
              className="timeline__header"
              onClick={() => handleToggle(index)}
              aria-expanded={isExpanded}
            >
              <role.icon size={20} className="timeline__icon" aria-hidden="true" />
              <div className="timeline__content">
                <div className="timeline__row">
                  <h3 className="timeline__title">{role.title}</h3>
                  <span className="timeline__period">{role.period}</span>
                </div>
                <p className="timeline__vibe">{role.vibe}</p>
              </div>
            </button>
            {isExpanded && (
              <div className="timeline__details">
                <div className="timeline__meta">
                  <span>{role.company}</span>
                  <span>•</span>
                  <span>{role.location}</span>
                </div>
                <ul className="timeline__highlights">
                  {role.highlights.map((highlight, i) => (
                    <li key={i}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
