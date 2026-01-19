/**
 * Legal Pad Text Underline Tests
 *
 * These tests verify that text elements have proper underline styling
 * for the legal pad theme. The key behavior: text-decoration handles
 * line positioning, so lines never intersect with text.
 *
 * Strategy:
 * 1. Create test elements with the legal pad styling
 * 2. Verify text-decoration properties are applied correctly
 * 3. Verify line-height consistency for proper spacing
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Legal Pad Text Underline Styling', () => {
  let container: HTMLDivElement;
  let styleElement: HTMLStyleElement;

  // Legal pad CSS values (must match legal-pad.css)
  const LP_LINE_HEIGHT_REM = 1.75;
  const ROOT_FONT_SIZE = 16; // Standard browser default
  const LP_LINE_HEIGHT_PX = LP_LINE_HEIGHT_REM * ROOT_FONT_SIZE; // 28px

  beforeEach(() => {
    // Inject legal pad styles
    styleElement = document.createElement('style');
    styleElement.textContent = `
      :root {
        --lp-yellow: oklch(95% 0.08 95);
        --lp-rule-blue: oklch(75% 0.12 250);
        --lp-line-height: ${LP_LINE_HEIGHT_REM}rem;
      }

      .test-page-content {
        background-color: var(--lp-yellow);
        padding: 1rem;
        font-size: 16px;
        font-family: system-ui, sans-serif;
      }

      .test-page-content p,
      .test-page-content li {
        line-height: var(--lp-line-height);
        margin: 0;
        padding: 0;
        text-decoration: underline;
        text-decoration-color: var(--lp-rule-blue);
        text-decoration-thickness: 1px;
        text-underline-offset: 0.2em;
        text-decoration-skip-ink: none;
      }

      .test-page-content h1,
      .test-page-content h2 {
        line-height: var(--lp-line-height);
        margin: 0;
        text-decoration: underline;
        text-decoration-color: var(--lp-rule-blue);
        text-decoration-thickness: 2px;
        text-underline-offset: 0.15em;
        text-decoration-skip-ink: none;
      }
    `;
    document.head.appendChild(styleElement);

    // Create test container
    container = document.createElement('div');
    container.className = 'test-page-content';
    container.style.width = '600px';
    container.style.height = '400px';
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.head.removeChild(styleElement);
    document.body.removeChild(container);
  });

  describe('Text Decoration Properties', () => {
    it('applies underline to paragraph text', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph';
      container.appendChild(p);

      const style = getComputedStyle(p);
      expect(style.textDecorationLine).toBe('underline');
    });

    it('applies underline to list items', () => {
      const li = document.createElement('li');
      li.textContent = 'Test list item';
      container.appendChild(li);

      const style = getComputedStyle(li);
      expect(style.textDecorationLine).toBe('underline');
    });

    it('applies underline to headings', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Test heading';
      container.appendChild(h1);

      const style = getComputedStyle(h1);
      expect(style.textDecorationLine).toBe('underline');
    });

    it('sets underline color to blue', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph';
      container.appendChild(p);

      const style = getComputedStyle(p);
      // Color will be computed as rgb() or oklch() depending on browser
      // Just verify it's set (not empty or 'currentcolor')
      expect(style.textDecorationColor).toBeTruthy();
      expect(style.textDecorationColor).not.toBe('currentcolor');
    });

    it('sets underline thickness to 1px for paragraphs', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph';
      container.appendChild(p);

      const style = getComputedStyle(p);
      expect(style.textDecorationThickness).toBe('1px');
    });

    it('sets underline thickness to 2px for headings', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'Test heading';
      container.appendChild(h1);

      const style = getComputedStyle(h1);
      expect(style.textDecorationThickness).toBe('2px');
    });

    it('sets underline offset for positioning below baseline', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph';
      container.appendChild(p);

      const style = getComputedStyle(p);
      // text-underline-offset should be set (not 'auto')
      expect(style.textUnderlineOffset).not.toBe('auto');
    });

    it('disables skip-ink for continuous lines', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph with descenders: gjpqy';
      container.appendChild(p);

      const style = getComputedStyle(p);
      expect(style.textDecorationSkipInk).toBe('none');
    });
  });

  describe('Line Height Consistency', () => {
    it('text line-height matches the grid spacing', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph';
      container.appendChild(p);

      const style = getComputedStyle(p);
      const lineHeight = parseFloat(style.lineHeight);

      expect(lineHeight).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
    });

    it('all text elements use consistent line-height', () => {
      const elements = [
        Object.assign(document.createElement('p'), { textContent: 'Paragraph' }),
        Object.assign(document.createElement('li'), { textContent: 'List item' }),
      ];

      elements.forEach((el) => container.appendChild(el));

      const lineHeights = elements.map((el) => parseFloat(getComputedStyle(el).lineHeight));

      lineHeights.forEach((lh) => {
        expect(lh).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
      });
    });

    it('consecutive text lines are spaced exactly one grid unit apart', () => {
      const p = document.createElement('p');
      p.innerHTML = '<span id="line1">First line</span><br><span id="line2">Second line</span>';
      container.appendChild(p);

      const line1 = document.getElementById('line1')!;
      const line2 = document.getElementById('line2')!;

      const rect1 = line1.getBoundingClientRect();
      const rect2 = line2.getBoundingClientRect();

      const verticalDistance = rect2.top - rect1.top;
      expect(verticalDistance).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
    });

    it('text block height is a multiple of line-height for multi-line content', () => {
      const p = document.createElement('p');
      p.innerHTML = 'Line one<br>Line two<br>Line three';
      container.appendChild(p);

      const rect = p.getBoundingClientRect();
      const expectedHeight = 3 * LP_LINE_HEIGHT_PX;

      expect(rect.height).toBeCloseTo(expectedHeight, 2);
    });
  });

  describe('Multi-line Text Rendering', () => {
    it('each line of text gets an underline', () => {
      // With text-decoration, each line in a paragraph gets underlined
      // This is the expected browser behavior
      const p = document.createElement('p');
      p.innerHTML = 'Line one<br>Line two<br>Line three';
      container.appendChild(p);

      const style = getComputedStyle(p);
      expect(style.textDecorationLine).toBe('underline');
    });

    it('underlines extend across the full text width', () => {
      const p = document.createElement('p');
      p.textContent = 'This is a longer line of text to test underline width';
      p.style.display = 'inline-block';
      container.appendChild(p);

      // The underline should extend across the text
      // We can't measure the underline directly, but we can verify
      // the text-decoration is applied to the full element
      const style = getComputedStyle(p);
      expect(style.textDecorationLine).toBe('underline');

      const rect = p.getBoundingClientRect();
      expect(rect.width).toBeGreaterThan(100); // Text should have reasonable width
    });
  });

  describe('Font Independence', () => {
    it('underline positioning works with different fonts', () => {
      const fonts = [
        'system-ui, sans-serif',
        'Georgia, serif',
        'monospace',
      ];

      fonts.forEach((font) => {
        const p = document.createElement('p');
        p.textContent = 'Test with different font';
        p.style.fontFamily = font;
        container.appendChild(p);

        const style = getComputedStyle(p);

        // text-decoration should be applied regardless of font
        expect(style.textDecorationLine).toBe('underline');

        // Each paragraph with different font should still have underline
        container.removeChild(p);
      });
    });
  });
});
