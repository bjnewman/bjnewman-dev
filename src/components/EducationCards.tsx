import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Terminal, Scale, Lightbulb } from 'lucide-react';

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
      'VP, American Constitution Society student chapter',
      'Legal aid at Daley Center Courthouse and Tax Clinic',
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
    ],
  }
];

const IconMap = {
  computer: Terminal,
  gavel: Scale,
  thinker: Lightbulb,
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
              <div
                className="education-card__icon-wrapper"
                style={{ viewTransitionName: `education-icon-${index}` }}
              >
                <Icon size={32} className="education-icon" aria-hidden="true" />
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
