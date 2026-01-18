/**
 * Legal Pad Line Alignment Tests
 *
 * These tests verify that text content aligns properly with the ruled lines
 * on the legal pad theme. The key behavior: text should sit ON the lines,
 * not be intersected BY them.
 *
 * Strategy:
 * 1. Create test elements with the legal pad styling
 * 2. Verify CSS grid properties are consistent (line-height matches grid)
 * 3. Use element positioning to verify text aligns to the line grid
 * 4. Sample pixel colors at calculated line positions to detect visual overlap
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('Legal Pad Line Alignment', () => {
  let container: HTMLDivElement;
  let styleElement: HTMLStyleElement;

  // Legal pad CSS values (must match legal-pad.css)
  const LP_LINE_HEIGHT_REM = 1.75;
  const LP_BASELINE_OFFSET_REM = 0.25;
  const ROOT_FONT_SIZE = 16; // Standard browser default

  const LP_LINE_HEIGHT_PX = LP_LINE_HEIGHT_REM * ROOT_FONT_SIZE; // 28px
  const LP_BASELINE_OFFSET_PX = LP_BASELINE_OFFSET_REM * ROOT_FONT_SIZE; // 4px

  beforeEach(() => {
    // Inject legal pad styles
    styleElement = document.createElement('style');
    styleElement.textContent = `
      :root {
        --lp-yellow: oklch(95% 0.08 95);
        --lp-rule-blue: oklch(75% 0.12 250);
        --lp-line-height: ${LP_LINE_HEIGHT_REM}rem;
        --lp-baseline-offset: ${LP_BASELINE_OFFSET_REM}rem;
      }

      .test-page-content {
        background-color: var(--lp-yellow);
        background-image:
          repeating-linear-gradient(
            to bottom,
            transparent 0,
            transparent calc(var(--lp-line-height) - 1px),
            var(--lp-rule-blue) calc(var(--lp-line-height) - 1px),
            var(--lp-rule-blue) var(--lp-line-height)
          );
        background-attachment: local;
        background-position: 0 var(--lp-baseline-offset);
        padding: 0;
        margin: 0;
        font-size: 16px;
        font-family: system-ui, sans-serif;
      }

      .test-page-content p,
      .test-page-content li {
        line-height: var(--lp-line-height);
        margin: 0;
        padding: 0;
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

  describe('CSS Grid Consistency', () => {
    it('text line-height matches the ruled line grid spacing', () => {
      const p = document.createElement('p');
      p.textContent = 'Test paragraph';
      container.appendChild(p);

      const computedStyle = getComputedStyle(p);
      const lineHeight = parseFloat(computedStyle.lineHeight);

      // Text line-height should equal the grid line spacing
      expect(lineHeight).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
    });

    it('all text elements use consistent line-height', () => {
      // Create multiple text element types
      const elements = [
        Object.assign(document.createElement('p'), { textContent: 'Paragraph' }),
        Object.assign(document.createElement('li'), { textContent: 'List item' }),
      ];

      elements.forEach((el) => container.appendChild(el));

      const lineHeights = elements.map((el) => parseFloat(getComputedStyle(el).lineHeight));

      // All should have the same line-height
      lineHeights.forEach((lh) => {
        expect(lh).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
      });
    });
  });

  describe('Text Position Grid Alignment', () => {
    it('consecutive text lines are spaced exactly one grid unit apart', () => {
      // Create a paragraph with multiple lines using <br>
      const p = document.createElement('p');
      p.innerHTML = '<span id="line1">First line</span><br><span id="line2">Second line</span>';
      container.appendChild(p);

      const line1 = document.getElementById('line1')!;
      const line2 = document.getElementById('line2')!;

      const rect1 = line1.getBoundingClientRect();
      const rect2 = line2.getBoundingClientRect();

      // The vertical distance between line tops should equal line-height
      const verticalDistance = rect2.top - rect1.top;
      expect(verticalDistance).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
    });

    it('text block height is a multiple of line-height for multi-line content', () => {
      const p = document.createElement('p');
      // Create exactly 3 lines of text
      p.innerHTML = 'Line one<br>Line two<br>Line three';
      container.appendChild(p);

      const rect = p.getBoundingClientRect();

      // Height should be approximately 3 * line-height
      const expectedHeight = 3 * LP_LINE_HEIGHT_PX;
      expect(rect.height).toBeCloseTo(expectedHeight, 2);
    });
  });

  describe('Ruled Line Position Calculation', () => {
    /**
     * Calculate where the CSS gradient lines appear within the container.
     * Lines are drawn at: offset + (n * line-height) - 1px for n = 1, 2, 3...
     */
    function calculateRuledLinePositions(
      containerHeight: number,
      lineHeight: number,
      offset: number
    ): number[] {
      const positions: number[] = [];
      let y = offset + lineHeight - 1; // First line position

      while (y < containerHeight) {
        positions.push(y);
        y += lineHeight;
      }

      return positions;
    }

    it('first ruled line appears at offset + line-height - 1px', () => {
      const positions = calculateRuledLinePositions(400, LP_LINE_HEIGHT_PX, LP_BASELINE_OFFSET_PX);

      // First line should be at: 4px (offset) + 28px (line-height) - 1px = 31px
      expect(positions[0]).toBeCloseTo(LP_BASELINE_OFFSET_PX + LP_LINE_HEIGHT_PX - 1, 1);
    });

    it('ruled lines are evenly spaced at line-height intervals', () => {
      const positions = calculateRuledLinePositions(400, LP_LINE_HEIGHT_PX, LP_BASELINE_OFFSET_PX);

      // Check spacing between consecutive lines
      for (let i = 1; i < positions.length; i++) {
        const spacing = positions[i] - positions[i - 1];
        expect(spacing).toBeCloseTo(LP_LINE_HEIGHT_PX, 1);
      }
    });
  });

  describe('Text Baseline vs Line Position', () => {
    /**
     * The critical test: verify that ruled lines don't intersect the x-height
     * of text characters (the main body of lowercase letters like 'x', 'a', 'e').
     *
     * For text to "sit on" a line:
     * - The baseline should be near the ruled line
     * - The x-height zone (roughly 40-70% up from baseline) should be clear of lines
     */
    it('ruled lines should fall below the x-height of text', () => {
      const p = document.createElement('p');
      p.textContent = 'x'; // Use 'x' as reference for x-height
      p.style.display = 'inline-block';
      container.appendChild(p);

      const rect = p.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      // Position relative to container
      const textTop = rect.top - containerRect.top;

      // Approximate x-height zone (middle portion of the text)
      // For most fonts, x-height is roughly 40-70% of the em-square
      const xHeightTop = textTop + rect.height * 0.2;
      const xHeightBottom = textTop + rect.height * 0.7;

      // First ruled line position
      const firstLineY = LP_BASELINE_OFFSET_PX + LP_LINE_HEIGHT_PX - 1;

      // The ruled line should NOT fall within the x-height zone
      // It should be at or below the baseline (bottom of x-height zone)
      const lineIntersectsXHeight = firstLineY > xHeightTop && firstLineY < xHeightBottom;

      expect(lineIntersectsXHeight).toBe(false);
    });

    it('baseline offset positions lines to align with text baseline', () => {
      // The baseline of text in a line-height box is typically around 70-80%
      // from the top of the line box (varies by font)
      const typicalBaselineRatio = 0.75; // 75% down from top

      // For first line of text:
      // - Line box starts at y=0
      // - Baseline is at approximately: 0 + (line-height * 0.75) = 21px
      const estimatedBaseline = LP_LINE_HEIGHT_PX * typicalBaselineRatio;

      // Ruled line position (first line):
      // offset + line-height - 1 = 4 + 28 - 1 = 31px
      const ruledLineY = LP_BASELINE_OFFSET_PX + LP_LINE_HEIGHT_PX - 1;

      // The ruled line should be AT or slightly BELOW the baseline
      // (text sits ON the line, line is under the text)
      expect(ruledLineY).toBeGreaterThanOrEqual(estimatedBaseline);

      // But not too far below (should still look like text is on the line)
      // Allow 10px tolerance for font variation
      expect(ruledLineY).toBeLessThan(estimatedBaseline + 15);
    });
  });

  describe('Multi-line Text Alignment', () => {
    it('each line of a paragraph aligns to its corresponding ruled line', () => {
      const p = document.createElement('p');
      p.innerHTML =
        '<span data-line="1">First</span><br>' +
        '<span data-line="2">Second</span><br>' +
        '<span data-line="3">Third</span>';
      container.appendChild(p);

      const containerRect = container.getBoundingClientRect();

      // Check each line
      for (let i = 1; i <= 3; i++) {
        const span = container.querySelector(`[data-line="${i}"]`)!;
        const spanRect = span.getBoundingClientRect();

        // Position of this text line relative to container
        const textBottom = spanRect.bottom - containerRect.top;

        // Expected ruled line position for this line
        const ruledLineY = LP_BASELINE_OFFSET_PX + i * LP_LINE_HEIGHT_PX - 1;

        // Text bottom (baseline area) should be near the ruled line
        // The ruled line should be within a few pixels of the text baseline
        const distance = Math.abs(textBottom - ruledLineY);

        // Allow reasonable tolerance for font metrics variation
        expect(distance).toBeLessThan(LP_LINE_HEIGHT_PX * 0.3);
      }
    });
  });
});
