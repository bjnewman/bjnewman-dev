import { useState } from 'react';

interface Place {
  name: string;
  state: string;
  years: string;
  description: string;
  x: number; // percentage position on map
  y: number;
}

const places: Place[] = [
  {
    name: 'Evanston',
    state: 'IL',
    years: 'Born & Raised',
    description: "Where I was born and raised. The only place I can actually give people directions.",
    x: 63,
    y: 38,
  },
  {
    name: 'Claremont',
    state: 'CA',
    years: '2003-2007',
    description: "Southern California will always have my heart, and the theme song for The OC makes me cry with nostalgia.",
    x: 10,
    y: 58,
  },
  {
    name: 'Phoenix',
    state: 'AZ',
    years: '2008',
    description: "Spent a year campaigning for my uncle. Learned a lot about politics, desert heat, and why people move to Arizona for the winter.",
    x: 22,
    y: 55,
  },
  {
    name: 'Chicago',
    state: 'IL',
    years: '2010-2018',
    description: "My favorite city in the world. The best people and my closest friends are still there. Will always talk to you about my love for public transit.",
    x: 61,
    y: 40,
  },
  {
    name: 'Asheville',
    state: 'NC',
    years: '2018-2019',
    description: "Beautiful city in the mountains. Was only there for a few months.",
    x: 74,
    y: 56,
  },
  {
    name: 'St Augustine',
    state: 'FL',
    years: '2019-2023',
    description: "Followed my parents to Florida after their retirement. Gorgeous beaches, too many gator fumes.",
    x: 76,
    y: 76,
  },
  {
    name: 'Happy Valley',
    state: 'OR',
    years: '2023-Now',
    description: "Moved to be closer to my brother, niece, and in-laws. Love the hills and the trees and the river and the gorge. Can't stand the rain like Missy Elliott.",
    x: 8,
    y: 20,
  },
];

export const PlacesMap = () => {
  const [activePlace, setActivePlace] = useState<number | null>(null);

  return (
    <div className="places-map">
      <div className="places-map__container">
        {/* US Map background image */}
        <img
          src="/images/us-map-outline.png"
          alt=""
          className="places-map__bg"
          aria-hidden="true"
        />

        {/* Location pins */}
        {places.map((place, index) => (
          <button
            key={place.name}
            className={`places-map__pin ${activePlace === index ? 'places-map__pin--active' : ''}`}
            style={{ left: `${place.x}%`, top: `${place.y}%` }}
            onClick={() => setActivePlace(activePlace === index ? null : index)}
            aria-label={`${place.name}, ${place.state}`}
          >
            <span className="places-map__pin-dot" />
            <span className="places-map__pin-label">{place.name}</span>
          </button>
        ))}
      </div>

      {/* Place details */}
      <div className="places-map__details">
        {activePlace !== null ? (
          <div className="places-map__card">
            <div className="places-map__card-header">
              <h4 className="places-map__card-title">
                {places[activePlace].name}, {places[activePlace].state}
              </h4>
              <span className="places-map__card-years">{places[activePlace].years}</span>
            </div>
            <p className="places-map__card-description">{places[activePlace].description}</p>
          </div>
        ) : (
          <p className="places-map__hint">Click a pin to learn more about my journey</p>
        )}
      </div>

      {/* Timeline list for mobile/accessibility */}
      <div className="places-map__list">
        {places.map((place, index) => (
          <div
            key={place.name}
            className={`places-map__list-item ${activePlace === index ? 'places-map__list-item--active' : ''}`}
            onClick={() => setActivePlace(activePlace === index ? null : index)}
          >
            <div className="places-map__list-marker">
              <span className="places-map__list-dot" />
              {index < places.length - 1 && <span className="places-map__list-line" />}
            </div>
            <div className="places-map__list-content">
              <div className="places-map__list-header">
                <strong>{place.name}, {place.state}</strong>
                <span>{place.years}</span>
              </div>
              {activePlace === index && (
                <p className="places-map__list-description">{place.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
