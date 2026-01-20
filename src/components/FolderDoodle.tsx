import { useEffect, useRef } from 'react';
import rough from 'roughjs';

interface FolderDoodleProps {
  type: 'home' | 'computer' | 'pencil' | 'document' | 'chart';
  size?: number;
}

export function FolderDoodle({ type, size = 64 }: FolderDoodleProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    svgRef.current.innerHTML = '';

    const rc = rough.svg(svgRef.current);
    const options = {
      stroke: 'oklch(35% 0.05 55)',
      strokeWidth: 1.5,
      roughness: 1.2,
      bowing: 1,
    };

    let node: SVGGElement;

    switch (type) {
      case 'home':
        // House with stick figure and dog - "about me" scene
        // House (left side)
        // Roof
        node = rc.line(size * 0.08, size * 0.45, size * 0.25, size * 0.25, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.25, size * 0.25, size * 0.42, size * 0.45, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Walls
        node = rc.rectangle(size * 0.1, size * 0.45, size * 0.3, size * 0.35, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Door
        node = rc.rectangle(size * 0.2, size * 0.55, size * 0.1, size * 0.25, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);

        // Stick figure (right side)
        // Head
        node = rc.circle(size * 0.65, size * 0.35, size * 0.12, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Body
        node = rc.line(size * 0.65, size * 0.41, size * 0.65, size * 0.6, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Arms
        node = rc.line(size * 0.55, size * 0.48, size * 0.75, size * 0.48, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Legs
        node = rc.line(size * 0.65, size * 0.6, size * 0.55, size * 0.75, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.65, size * 0.6, size * 0.75, size * 0.75, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);

        // Dog (bottom right, simple)
        // Body oval
        node = rc.ellipse(size * 0.82, size * 0.72, size * 0.12, size * 0.08, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Head
        node = rc.circle(size * 0.9, size * 0.68, size * 0.06, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Tail
        node = rc.line(size * 0.76, size * 0.7, size * 0.72, size * 0.62, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Legs
        node = rc.line(size * 0.78, size * 0.75, size * 0.78, size * 0.82, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.86, size * 0.75, size * 0.86, size * 0.82, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        break;

      case 'computer':
        // Retro desktop computer - monitor + base
        // Monitor body
        node = rc.rectangle(size * 0.15, size * 0.12, size * 0.7, size * 0.5, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Screen (inner rectangle)
        node = rc.rectangle(size * 0.22, size * 0.18, size * 0.56, size * 0.35, {
          ...options,
          fill: 'oklch(35% 0.05 55 / 0.1)',
          fillStyle: 'solid',
        }) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Screen content - code lines
        node = rc.line(size * 0.28, size * 0.28, size * 0.55, size * 0.28, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.28, size * 0.38, size * 0.48, size * 0.38, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Monitor stand
        node = rc.line(size * 0.45, size * 0.62, size * 0.45, size * 0.72, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.55, size * 0.62, size * 0.55, size * 0.72, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Base
        node = rc.rectangle(size * 0.3, size * 0.72, size * 0.4, size * 0.1, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Keyboard
        node = rc.rectangle(size * 0.2, size * 0.85, size * 0.6, size * 0.08, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        break;

      case 'pencil':
        // Pen and paper - blog/writing icon
        // Paper (slightly tilted)
        node = rc.rectangle(size * 0.12, size * 0.15, size * 0.55, size * 0.7, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Writing lines on paper
        node = rc.line(size * 0.2, size * 0.3, size * 0.55, size * 0.3, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.2, size * 0.42, size * 0.5, size * 0.42, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.2, size * 0.54, size * 0.55, size * 0.54, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.2, size * 0.66, size * 0.42, size * 0.66, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);

        // Pen (diagonal, overlapping paper)
        const penOptions = { ...options, fill: 'oklch(35% 0.05 55 / 0.2)', fillStyle: 'solid' as const };
        // Pen body
        node = rc.polygon([
          [size * 0.5, size * 0.88],
          [size * 0.55, size * 0.82],
          [size * 0.88, size * 0.32],
          [size * 0.83, size * 0.38],
        ], penOptions) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Pen tip
        node = rc.polygon([
          [size * 0.88, size * 0.32],
          [size * 0.83, size * 0.38],
          [size * 0.92, size * 0.22],
        ], options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Pen cap/grip
        node = rc.line(size * 0.52, size * 0.85, size * 0.57, size * 0.8, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        break;

      case 'document':
        // Resume/CV - formal document with photo and sections
        node = rc.rectangle(size * 0.18, size * 0.1, size * 0.64, size * 0.8, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Photo placeholder (top left)
        node = rc.rectangle(size * 0.24, size * 0.16, size * 0.18, size * 0.22, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Name line (bold/thick next to photo)
        node = rc.line(size * 0.48, size * 0.2, size * 0.72, size * 0.2, { ...options, strokeWidth: 2.5 }) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Title line (under name)
        node = rc.line(size * 0.48, size * 0.3, size * 0.68, size * 0.3, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Section divider
        node = rc.line(size * 0.24, size * 0.44, size * 0.76, size * 0.44, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Bullet points (experience section)
        node = rc.circle(size * 0.28, size * 0.54, size * 0.03, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.34, size * 0.54, size * 0.72, size * 0.54, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.circle(size * 0.28, size * 0.64, size * 0.03, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.34, size * 0.64, size * 0.68, size * 0.64, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.circle(size * 0.28, size * 0.74, size * 0.03, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.34, size * 0.74, size * 0.7, size * 0.74, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        break;

      case 'chart':
        // Bar chart - sized up
        // Axes
        node = rc.line(size * 0.12, size * 0.88, size * 0.12, size * 0.15, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.line(size * 0.12, size * 0.88, size * 0.88, size * 0.88, options) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        // Bars - wider and taller
        node = rc.rectangle(size * 0.2, size * 0.55, size * 0.15, size * 0.33, {
          ...options,
          fill: 'oklch(35% 0.05 55 / 0.3)',
          fillStyle: 'hachure',
        }) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.rectangle(size * 0.42, size * 0.3, size * 0.15, size * 0.58, {
          ...options,
          fill: 'oklch(35% 0.05 55 / 0.3)',
          fillStyle: 'hachure',
        }) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        node = rc.rectangle(size * 0.64, size * 0.45, size * 0.15, size * 0.43, {
          ...options,
          fill: 'oklch(35% 0.05 55 / 0.3)',
          fillStyle: 'hachure',
        }) as unknown as SVGGElement;
        svgRef.current.appendChild(node);
        break;
    }
  }, [type, size]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="folder__doodle"
    />
  );
}
