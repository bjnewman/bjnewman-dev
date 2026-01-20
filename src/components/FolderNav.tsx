import { useState, useCallback } from 'react';
import { FolderDoodle } from './FolderDoodle';
import { TypewriterCode } from './TypewriterCode';

type DoodleType = 'home' | 'computer' | 'pencil' | 'document' | 'chart';

interface Folder {
  id: string;
  label: string;
  href: string;
  rotation: number;
  position: { x: string; y: string };
  description: string;
  doodle: DoodleType;
}

// Folders positioned around the legal pad, closer to center
const folders: Folder[] = [
  {
    id: 'about',
    label: 'About',
    href: '/about',
    rotation: -5,
    position: { x: '15%', y: '28%' },
    description: 'Learn more about me',
    doodle: 'home',
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    rotation: 4,
    position: { x: '85%', y: '25%' },
    description: 'View my work',
    doodle: 'computer',
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '/blog',
    rotation: -3,
    position: { x: '12%', y: '62%' },
    description: 'Thoughts and tutorials',
    doodle: 'pencil',
  },
  {
    id: 'resume',
    label: 'Resume',
    href: '/resume',
    rotation: 6,
    position: { x: '88%', y: '58%' },
    description: 'My professional experience',
    doodle: 'document',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    rotation: -2,
    position: { x: '82%', y: '82%' },
    description: 'Stats and metrics',
    doodle: 'chart',
  },
];

export default function FolderNav() {
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredFolder(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredFolder(null);
  }, []);

  return (
    <nav className="folder-desk" aria-label="Site navigation">
      {/* Open legal pad with hero content */}
      <article className="desk-pad" aria-label="Welcome">
        <div className="desk-pad__page">
          <h1 className="desk-pad__title">Ben Newman</h1>
          <p className="desk-pad__subtitle">
            Former lawyer. Now I build systems that handle millions of healthcare transactions daily.
          </p>
          <p className="desk-pad__tagline">
            Tech Lead at Availity · React · TypeScript · AWS
          </p>
          <div className="desk-pad__code">
            <TypewriterCode />
          </div>
        </div>
        <div className="desk-pad__binding" aria-hidden="true" />
      </article>

      {folders.map((folder) => (
        <a
          key={folder.id}
          href={folder.href}
          className={`folder ${hoveredFolder === folder.id ? 'folder--hover' : ''}`}
          data-folder-id={folder.id}
          style={
            {
              '--rotation': `${folder.rotation}deg`,
              '--pos-x': folder.position.x,
              '--pos-y': folder.position.y,
            } as React.CSSProperties
          }
          onMouseEnter={() => handleMouseEnter(folder.id)}
          onMouseLeave={handleMouseLeave}
          onFocus={() => handleMouseEnter(folder.id)}
          onBlur={handleMouseLeave}
          aria-label={`${folder.label}: ${folder.description}`}
        >
          <span className="folder__tab">{folder.label}</span>
          <span className="folder__body">
            <FolderDoodle type={folder.doodle} />
          </span>
        </a>
      ))}
    </nav>
  );
}
