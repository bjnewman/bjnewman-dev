import { useState } from 'react';
import { flushSync } from 'react-dom';

// Animated SVG icons
const ComputerIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    viewBox="0 0 64 64"
    className={`education-icon ${isExpanded ? 'education-icon--animated' : ''}`}
    aria-hidden="true"
  >
    {/* Monitor */}
    <rect
      x="8"
      y="8"
      width="48"
      height="36"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Screen */}
    <rect x="12" y="12" width="40" height="28" fill="var(--bg-tertiary)" />
    {/* Stand */}
    <path d="M28 44 L28 52 L20 52" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M36 44 L36 52 L44 52" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="16" y1="52" x2="48" y2="52" stroke="currentColor" strokeWidth="2" />
    {/* Code lines - animate these */}
    <g className="education-icon__code">
      <rect x="16" y="16" width="16" height="2" fill="var(--primary)" rx="1" />
      <rect x="16" y="22" width="24" height="2" fill="var(--primary-light)" rx="1" />
      <rect x="20" y="28" width="20" height="2" fill="var(--primary)" rx="1" />
      <rect x="16" y="34" width="12" height="2" fill="var(--primary-light)" rx="1" />
    </g>
    {/* Cursor blink */}
    <rect
      x="32"
      y="34"
      width="2"
      height="4"
      fill="var(--primary)"
      className="education-icon__cursor"
    />
  </svg>
);

const GavelIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    viewBox="0 0 64 64"
    className={`education-icon ${isExpanded ? 'education-icon--animated' : ''}`}
    aria-hidden="true"
  >
    {/* Gavel head */}
    <g className="education-icon__gavel-head">
      <rect x="12" y="16" width="24" height="12" rx="2" fill="var(--primary)" />
      <rect x="8" y="18" width="6" height="8" rx="1" fill="var(--primary-dark)" />
      <rect x="34" y="18" width="6" height="8" rx="1" fill="var(--primary-dark)" />
    </g>
    {/* Handle */}
    <rect x="22" y="26" width="4" height="24" rx="1" fill="currentColor" />
    {/* Sound block */}
    <ellipse
      cx="48"
      cy="48"
      rx="10"
      ry="4"
      fill="var(--bg-tertiary)"
      stroke="currentColor"
      strokeWidth="2"
    />
    <ellipse
      cx="48"
      cy="44"
      rx="10"
      ry="4"
      fill="var(--primary-light)"
      stroke="currentColor"
      strokeWidth="2"
    />
    {/* Impact lines */}
    <g className="education-icon__impact">
      <line
        x1="40"
        y1="36"
        x2="36"
        y2="32"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="48"
        y1="34"
        x2="48"
        y2="28"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="56"
        y1="36"
        x2="60"
        y2="32"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  </svg>
);

const ThinkerIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <svg
    viewBox="0 0 64 64"
    className={`education-icon ${isExpanded ? 'education-icon--animated' : ''}`}
    aria-hidden="true"
  >
    {/* Simplified seated figure */}
    {/* Head */}
    <circle cx="28" cy="16" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
    {/* Thinking hand near chin */}
    <path
      d="M24 24 Q20 28 22 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Body */}
    <path
      d="M28 24 L28 36 Q28 44 36 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Arm to chin */}
    <path
      d="M28 30 L22 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Legs */}
    <path
      d="M28 36 L20 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M28 40 L36 52"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Base/pedestal */}
    <rect
      x="12"
      y="52"
      width="32"
      height="4"
      rx="1"
      fill="var(--bg-tertiary)"
      stroke="currentColor"
      strokeWidth="1"
    />
    {/* Thought bubbles */}
    <g className="education-icon__thoughts">
      <circle cx="44" cy="12" r="3" fill="var(--primary-light)" />
      <circle cx="52" cy="8" r="4" fill="var(--primary)" />
      <circle cx="48" cy="20" r="2" fill="var(--primary-light)" />
    </g>
    {/* Question mark */}
    <g className="education-icon__question">
      <text x="50" y="14" fontSize="12" fill="var(--primary)" fontWeight="bold">
        ?
      </text>
    </g>
  </svg>
);

interface Education {
  degree: string;
  school: string;
  location: string;
  year: string;
  icon: 'computer' | 'gavel' | 'thinker';
  note?: string;
  highlights?: string[];
}

const education: Education[] = [
  {
    degree: 'Certificate in Computer Science',
    school: 'Dev Bootcamp',
    location: 'Chicago, IL',
    year: '2016',
    icon: 'computer',
    note: 'Where the pivot happened',
    highlights: [
      'Intensive 19-week full-stack program',
      'Ruby, Rails, JavaScript, React',
      'Pair programming and agile methodologies',
      'Built several production-ready apps',
    ],
  },
  {
    degree: 'Juris Doctor (J.D.)',
    school: 'Chicago-Kent School of Law',
    location: 'Chicago, IL',
    year: '2010-2012',
    icon: 'gavel',
    note: 'Learned to think in edge cases',
    highlights: [
      'Focus on intellectual property law',
      'Moot court competitor',
      'Legal writing and research training',
      'Passed Illinois Bar Exam',
    ],
  },
  {
    degree: 'B.A. in Philosophy',
    school: 'Pomona College',
    location: 'Claremont, CA',
    year: '2003-2007',
    icon: 'thinker',
    note: 'Learned to ask "but why?"',
    highlights: [
      'Focus on logic and philosophy of mind',
      'Liberal arts foundation',
      'Critical thinking and argumentation',
      'Senior thesis on consciousness',
    ],
  },
];

const IconMap = {
  computer: ComputerIcon,
  gavel: GavelIcon,
  thinker: ThinkerIcon,
};

export const EducationCards = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
    <div className="education-cards">
      {education.map((edu, index) => {
        const Icon = IconMap[edu.icon];
        const isExpanded = expandedIndex === index;

        return (
          <div
            key={index}
            style={{ viewTransitionName: `education-card-${index}` }}
            className={`education-card ${isExpanded ? 'education-card--expanded' : ''}`}
          >
            <button
              className="education-card__header"
              onClick={() => handleToggle(index)}
              aria-expanded={isExpanded}
            >
              <div className="education-card__icon-wrapper">
                <Icon isExpanded={isExpanded} />
              </div>
              <div className="education-card__content">
                <div className="education-card__row">
                  <h4 className="education-card__degree">{edu.degree}</h4>
                  <span className="education-card__year">{edu.year}</span>
                </div>
                <p className="education-card__school">{edu.school}</p>
              </div>
            </button>
            {isExpanded && (
              <div className="education-card__details">
                <div className="education-card__meta">
                  <span>{edu.location}</span>
                  {edu.note && (
                    <>
                      <span>•</span>
                      <span className="education-card__note">{edu.note}</span>
                    </>
                  )}
                </div>
                {edu.highlights && (
                  <ul className="education-card__highlights">
                    {edu.highlights.map((highlight, i) => (
                      <li key={i}>{highlight}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
