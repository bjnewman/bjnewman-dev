import React, { useState, useEffect } from 'react';

// Code tokens with syntax highlighting classes
interface Token {
  text: string;
  className?: string;
}

const codeTokens: Token[] = [
  { text: '// building reliable systems\n', className: 'code-comment' },
  { text: 'const ', className: 'code-keyword' },
  { text: 'ben', className: 'code-property' },
  { text: ' = {\n' },
  { text: '  stack', className: 'code-property' },
  { text: ': [' },
  { text: '"React"', className: 'code-string' },
  { text: ', ' },
  { text: '"Java"', className: 'code-string' },
  { text: ', ' },
  { text: '"AWS"', className: 'code-string' },
  { text: '],\n' },
  { text: '  solve', className: 'code-function' },
  { text: ': ' },
  { text: 'async ', className: 'code-keyword' },
  { text: '(p) => ' },
  { text: '"🌈🦄💰"', className: 'code-string' },
  { text: '\n};\n\n' },
  { text: 'const ', className: 'code-keyword' },
  { text: 'problem', className: 'code-property' },
  { text: ' = ' },
  { text: '"🐛🔥💀"', className: 'code-string' },
  { text: ';\n' },
  { text: 'await ', className: 'code-keyword' },
  { text: 'ben', className: 'code-property' },
  { text: '.' },
  { text: 'solve', className: 'code-function' },
  { text: '(problem);' },
];

// Pre-compute full text for length calculation
const fullText = codeTokens.map((t) => t.text).join('');

// Character typing speed in ms
const TYPING_SPEED = 40;

interface TypewriterCodeProps {
  /** Change this to restart animation */
  restartKey?: number;
}

export function TypewriterCode({ restartKey = 0 }: TypewriterCodeProps) {
  const [internalRestartKey, setInternalRestartKey] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const restartAnimation = () => {
    setInternalRestartKey((prev) => prev + 1);
  };

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Reset animation when restartKey changes (external or internal)
  useEffect(() => {
    setCharIndex(0);
    setIsComplete(false);
  }, [restartKey, internalRestartKey]);

  // Typing animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setCharIndex(fullText.length);
      setIsComplete(true);
      return;
    }

    if (charIndex >= fullText.length) {
      setIsComplete(true);
      return;
    }

    const timeout = setTimeout(() => {
      setCharIndex((prev) => prev + 1);
    }, TYPING_SPEED);

    return () => clearTimeout(timeout);
  }, [charIndex, prefersReducedMotion]);

  // Render tokens up to current character index
  const renderCode = () => {
    let remainingChars = charIndex;
    const elements: React.ReactElement[] = [];

    for (let i = 0; i < codeTokens.length && remainingChars > 0; i++) {
      const token = codeTokens[i];
      const charsToShow = Math.min(remainingChars, token.text.length);
      const displayText = token.text.slice(0, charsToShow);
      remainingChars -= charsToShow;

      elements.push(
        <span key={i} className={token.className}>
          {displayText}
        </span>
      );
    }

    return elements;
  };

  return (
    <div
      className="typewriter-container typewriter-clickable"
      role="img"
      aria-label="Code snippet showing: building reliable systems with React, Java, and AWS stack, handling 10M+ transactions per day"
      tabIndex={0}
      onClick={restartAnimation}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          restartAnimation();
        }
      }}
      title="Click to replay animation"
    >
      <code className="typewriter-code">
        {renderCode()}
        {!isComplete && <span className="typewriter-cursor" aria-hidden="true" />}
      </code>
    </div>
  );
}
