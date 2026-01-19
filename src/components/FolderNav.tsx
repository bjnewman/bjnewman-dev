import { useState, useCallback, useEffect, useRef } from 'react';

interface Folder {
  id: string;
  label: string;
  href: string;
  rotation: number;
  position: { x: string; y: string };
  description: string;
  isSpecial?: boolean;
}

const folders: Folder[] = [
  {
    id: 'welcome',
    label: 'Welcome',
    href: '#welcome',
    rotation: -3,
    position: { x: '20%', y: '25%' },
    description: 'Introduction and overview',
    isSpecial: true,
  },
  {
    id: 'about',
    label: 'About',
    href: '/about',
    rotation: 5,
    position: { x: '55%', y: '18%' },
    description: 'Learn more about me',
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    rotation: -2,
    position: { x: '30%', y: '55%' },
    description: 'View my work',
  },
  {
    id: 'resume',
    label: 'Resume',
    href: '/resume',
    rotation: 4,
    position: { x: '65%', y: '42%' },
    description: 'My professional experience',
  },
  {
    id: 'blog',
    label: 'Blog',
    href: '/blog',
    rotation: -4,
    position: { x: '45%', y: '78%' },
    description: 'Thoughts and tutorials',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    rotation: 2,
    position: { x: '78%', y: '68%' },
    description: 'Stats and metrics',
  },
];

export default function FolderNav() {
  const [hoveredFolder, setHoveredFolder] = useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = useCallback((id: string) => {
    setHoveredFolder(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredFolder(null);
  }, []);

  const handleFolderClick = useCallback(
    (e: React.MouseEvent, folder: Folder) => {
      if (folder.isSpecial) {
        e.preventDefault();
        setShowWelcome(true);
      }
    },
    []
  );

  const closeWelcome = useCallback(() => {
    setShowWelcome(false);
  }, []);

  // Handle escape key and focus trap
  useEffect(() => {
    if (!showWelcome) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWelcome();
      }
    };

    // Focus the close button when overlay opens
    closeButtonRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome, closeWelcome]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (showWelcome) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showWelcome]);

  return (
    <>
      <nav className="folder-desk" aria-label="Site navigation">
        <h1 className="desk-title">Ben Newman</h1>
        <p className="desk-subtitle">Software Engineer</p>

        {folders.map((folder) => (
          <a
            key={folder.id}
            href={folder.href}
            className={`folder ${hoveredFolder === folder.id ? 'folder--hover' : ''}`}
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
            onClick={(e) => handleFolderClick(e, folder)}
            aria-label={`${folder.label}: ${folder.description}`}
          >
            <span className="folder__tab">{folder.label}</span>
            <span className="folder__body">
              <span className="folder__label">{folder.label}</span>
            </span>
          </a>
        ))}
      </nav>

      {/* Welcome Overlay */}
      {showWelcome && (
        <div
          className="welcome-overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          onClick={(e) => {
            if (e.target === overlayRef.current) closeWelcome();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (e.target === overlayRef.current) closeWelcome();
            }
          }}
        >
          <div className="welcome-card">
            <button
              ref={closeButtonRef}
              className="welcome-close"
              onClick={closeWelcome}
              aria-label="Close welcome message"
            >
              &times;
            </button>

            <h2 id="welcome-title" className="welcome-title">
              Welcome
            </h2>

            <div className="welcome-content">
              <p>
                I'm Ben Newman — a former lawyer turned software engineer. Now I
                build systems that handle millions of healthcare transactions
                daily.
              </p>

              <p>
                As a Tech Lead at Availity, I work with React, TypeScript, and
                AWS to create the infrastructure that helps healthcare providers
                and insurance companies exchange information.
              </p>

              <p>
                Explore the folders on my desk to learn more about my work,
                projects, and thoughts on software development.
              </p>
            </div>

            <div className="welcome-links">
              <a href="/about" className="welcome-link">
                About Me
              </a>
              <a href="/projects" className="welcome-link">
                My Projects
              </a>
              <a href="/blog" className="welcome-link">
                Read the Blog
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
