import { buildings } from './mapData';

export function AccessibleNav() {
  return (
    <nav
      className="overworld__accessible-nav"
      aria-label="Site navigation (keyboard accessible)"
    >
      <h2>Navigate the Village</h2>
      <ul className="overworld__text-fallback__list">
        {buildings.map((building) => (
          <li key={building.id}>
            <a
              href={building.page}
              className="overworld__text-fallback__link"
            >
              <strong>{building.name}</strong> — {building.description}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function TextOnlyFallback() {
  return (
    <div className="overworld__text-fallback">
      <h1>Ben Newman</h1>
      <p>Welcome to the village! Choose a destination:</p>
      <ul className="overworld__text-fallback__list">
        {buildings.map((building) => (
          <li key={building.id}>
            <a href={building.page} className="overworld__text-fallback__link">
              <strong>{building.name}</strong>
              <br />
              {building.description}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
