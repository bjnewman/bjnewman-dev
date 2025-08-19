// filepath: /Users/benjaminnewman/Projects/bjnewman-dev/src/components/Layout.tsx
import React from 'react';
import '../styles/Layout.css';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-logo">🐰 BJ Newman</div>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/blog">Blog</a>
          <a href="/resume">Resume</a>
        </div>
      </nav>
      <main>{children}</main>
      <footer>
        <div className="social-links">
          <a href="https://github.com/bjnewman" target="_blank" rel="noopener">GitHub 🐱</a>
          <a href="https://linkedin.com/in/bjnewman" target="_blank" rel="noopener">LinkedIn 💼</a>
        </div>
      </footer>
    </div>
  );
};