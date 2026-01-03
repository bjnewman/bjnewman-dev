import { useState, useEffect } from 'react';

interface Skill {
  name: string;
  level: number; // 1-5 scale
}

interface SkillCategory {
  name: string;
  emoji: string;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    name: 'Frontend',
    emoji: '⚛️',
    skills: [
      { name: 'React', level: 5 },
      { name: 'TypeScript', level: 5 },
      { name: 'JavaScript', level: 5 },
      { name: 'CSS', level: 4 },
      { name: 'HTML5', level: 5 },
    ],
  },
  {
    name: 'Backend',
    emoji: '⚙️',
    skills: [
      { name: 'Java', level: 4 },
      { name: 'Spring Boot', level: 4 },
      { name: 'Node.js', level: 3 },
      { name: 'SQL', level: 4 },
    ],
  },
  {
    name: 'Cloud & DevOps',
    emoji: '☁️',
    skills: [
      { name: 'AWS', level: 4 },
      { name: 'Kubernetes', level: 3 },
      { name: 'Docker', level: 4 },
      { name: 'CI/CD', level: 4 },
    ],
  },
  {
    name: 'Architecture',
    emoji: '🏗️',
    skills: [
      { name: 'Microservices', level: 4 },
      { name: 'REST APIs', level: 5 },
      { name: 'System Design', level: 4 },
    ],
  },
  {
    name: 'Leadership',
    emoji: '👥',
    skills: [
      { name: 'Team Lead', level: 4 },
      { name: 'Mentoring', level: 5 },
      { name: 'Code Review', level: 5 },
    ],
  },
];

const levelLabels = ['', 'Learning', 'Familiar', 'Proficient', 'Expert', 'Master'];

export const SkillsGrid = () => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="skills-grid">
      {skillCategories.map((category) => {
        const isExpanded = expandedCategory === category.name;

        return (
          <div
            key={category.name}
            className={`skills-category ${isExpanded ? 'skills-category--expanded' : ''}`}
          >
            <button
              className="skills-category__header"
              onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
              aria-expanded={isExpanded}
            >
              <span className="skills-category__emoji">{category.emoji}</span>
              <h4 className="skills-category__name">{category.name}</h4>
              <span className="skills-category__toggle">{isExpanded ? '−' : '+'}</span>
            </button>

            {isExpanded && (
              <div className="skills-category__content">
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
              </div>
            )}

            {!isExpanded && (
              <div className="skills-category__preview">
                {category.skills.slice(0, 3).map((skill) => (
                  <span key={skill.name} className="skill-tag">
                    {skill.name}
                  </span>
                ))}
                {category.skills.length > 3 && (
                  <span className="skill-tag skill-tag--more">
                    +{category.skills.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
