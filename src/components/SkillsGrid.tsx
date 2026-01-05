import { useState, useEffect } from 'react';
import { flushSync } from 'react-dom';
import { Code, Server, Cloud, Layers, Users, LucideIcon } from 'lucide-react';

interface Skill {
  name: string;
  level: number; // 1-5 scale
}

interface SkillCategory {
  name: string;
  icon: LucideIcon;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Frontend',
    icon: Code,
    skills: [
      { name: 'React', level: 5 },
      { name: 'TypeScript', level: 4 },
      { name: 'JavaScript', level: 4 },
      { name: 'CSS', level: 3 },
      { name: 'HTML5', level: 4 },
    ],
  },
  {
    name: 'Backend',
    icon: Server,
    skills: [
      { name: 'Node.js', level: 3 },
      { name: 'SQL', level: 3 },
      { name: 'Java', level: 2 },
      { name: 'Spring Boot', level: 2 },
    ],
  },
  {
    name: 'Cloud & DevOps',
    icon: Cloud,
    skills: [
      { name: 'AWS', level: 4 },
      { name: 'Docker', level: 4 },
      { name: 'CI/CD', level: 4 },
      { name: 'Kubernetes', level: 2 },
    ],
  },
  {
    name: 'Architecture',
    icon: Layers,
    skills: [
      { name: 'Microservices', level: 3 },
      { name: 'REST APIs', level: 4 },
      { name: 'System Design', level: 3 },
    ],
  },
  {
    name: 'Leadership',
    icon: Users,
    skills: [
      { name: 'Team Lead', level: 4 },
      { name: 'Mentoring', level: 4 },
      { name: 'Code Review', level: 4 },
    ],
  },
];

const levelLabels = [
  '',
  'Enthusiastic beginner',
  'Dangerous enough',
  'Production-ready',
  'Go-to person',
  "Send help, I'm the expert now",
];

export const SkillsGrid = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle category click with View Transitions API
  const handleCategoryClick = (categoryName: string) => {
    const newValue = expandedCategory === categoryName ? null : categoryName;

    // Use View Transitions API if available for smooth reordering
    // Skip in automated browser environments (Playwright sets navigator.webdriver = true)
    const isAutomatedBrowser = typeof navigator !== 'undefined' && navigator.webdriver === true;
    if (document.startViewTransition && !isAutomatedBrowser) {
      document.startViewTransition(() => {
        flushSync(() => {
          setExpandedCategory(newValue);
        });
      });
    } else {
      setExpandedCategory(newValue);
    }
  };

  // Reorder categories: expanded one goes first
  const sortedCategories = expandedCategory
    ? [
        ...skillCategories.filter((c) => c.name === expandedCategory),
        ...skillCategories.filter((c) => c.name !== expandedCategory),
      ]
    : skillCategories;

  return (
    <div className="skills-grid">
      {sortedCategories.map((category) => {
        const isExpanded = expandedCategory === category.name;
        const transitionName = `skill-${category.name.replace(/\s+/g, '-').replace(/&/g, 'and').toLowerCase()}`;

        return (
          <div
            key={category.name}
            style={{ viewTransitionName: transitionName }}
            className={`skills-category ${isExpanded ? 'skills-category--expanded' : ''}`}
          >
            <button
              className="skills-category__header"
              onClick={() => handleCategoryClick(category.name)}
              aria-expanded={isExpanded}
            >
              <span className="skills-category__header-content">
                <category.icon size={20} className="skills-category__icon" aria-hidden="true" />
                <h4 className="skills-category__name">{category.name}</h4>
                <span className="skills-category__toggle">{isExpanded ? '−' : '+'}</span>
              </span>
              {!isExpanded && (
                <div className="skills-category__preview">
                  {category.skills.slice(0, 3).map((skill) => (
                    <span key={skill.name} className="skill-tag">
                      {skill.name}
                    </span>
                  ))}
                  {category.skills.length > 3 && (
                    <span className="skill-tag skill-tag--more">+{category.skills.length - 3}</span>
                  )}
                </div>
              )}
            </button>
            {isExpanded && (
              <button
                className="skills-category__content"
                onClick={() => handleCategoryClick(category.name)}
                aria-label={`Close ${category.name} details`}
              >
                {category.skills.map((skill) => (
                  <div key={skill.name} className="skill-bar">
                    <div className="skill-bar__header">
                      <span className="skill-bar__name">{skill.name}</span>
                      <span className="skill-bar__level">{levelLabels[skill.level]}</span>
                    </div>
                    <div className="skill-bar__track">
                      <div
                        className="skill-bar__fill"
                        style={{
                          width: animated ? `${(skill.level / 5) * 100}%` : '0%',
                        }}
                      />
                      <div className="skill-bar__markers">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div key={n} className="skill-bar__marker" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
