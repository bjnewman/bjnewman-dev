import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InteriorScene } from '../../../components/Interior/InteriorScene';

describe('InteriorScene', () => {
  it('should render children content', () => {
    render(
      <InteriorScene buildingId="library" title="The Library">
        <p>Blog content here</p>
      </InteriorScene>
    );
    expect(screen.getByText('Blog content here')).toBeInTheDocument();
  });

  it('should render the door button', () => {
    render(
      <InteriorScene buildingId="library" title="The Library">
        <p>Content</p>
      </InteriorScene>
    );
    expect(screen.getByRole('button', { name: /return to village/i })).toBeInTheDocument();
  });

  it('should render interactive objects when provided', () => {
    render(
      <InteriorScene
        buildingId="library"
        title="The Library"
        interactiveObjects={[
          { id: 'shelf', label: 'Browse shelf', x: '30%', y: '40%', width: '10%', height: '15%', onClick: () => {} },
        ]}
      >
        <p>Content</p>
      </InteriorScene>
    );
    expect(screen.getByRole('button', { name: 'Browse shelf' })).toBeInTheDocument();
  });

  it('should have the interior-scene class', () => {
    const { container } = render(
      <InteriorScene buildingId="library" title="The Library">
        <p>Content</p>
      </InteriorScene>
    );
    expect(container.firstChild).toHaveClass('interior-scene');
  });

  it('should render fallback for unknown buildingId', () => {
    render(
      <InteriorScene buildingId="unknown-place" title="Mystery">
        <p>Fallback content</p>
      </InteriorScene>
    );
    expect(screen.getByText('Fallback content')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /return to village/i })).not.toBeInTheDocument();
  });
});
