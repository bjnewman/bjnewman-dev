import { useState, useRef, useEffect, useMemo } from 'react';

// Animation constants
const SPIN_BASE = 12;
const SPIN_VARIANCE = 8;
const INITIAL_DELAY_MS = 40;
const SLOWDOWN_FACTOR = 1.4;
const SLOWDOWN_START_FROM_END = 5;
const STAGGER_DELAY_MS = 80;
const JACKPOT_CHECK_DELAY_MS = 100;
const JACKPOT_DISPLAY_MS = 3000;

interface FunFormFieldsProps {
  isVisible: boolean;
}

const urgencyDescriptions: Record<number, string> = {
  1: "Whenever you get around to it, no rush",
  10: "This week would be nice",
  25: "Pretty important, actually",
  50: "Getting urgent now",
  75: "I'm refreshing my inbox every 5 minutes",
  90: "My keyboard is smoking from all the typing",
  100: "THE BUILDING IS ON FIRE (metaphorically)",
};

const getUrgencyDescription = (value: number): string => {
  const thresholds = [1, 10, 25, 50, 75, 90, 100];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value >= thresholds[i]) {
      return urgencyDescriptions[thresholds[i]];
    }
  }
  return urgencyDescriptions[1];
};

const contactMethods = [
  { value: 'email', label: 'Email (boring but effective)', emoji: '📧' },
  { value: 'carrier_pigeon', label: 'Carrier Pigeon', emoji: '🐦' },
  { value: 'smoke_signals', label: 'Smoke Signals', emoji: '💨' },
  { value: 'telepathy', label: 'Telepathy', emoji: '🧠' },
  { value: 'message_in_bottle', label: 'Message in a Bottle', emoji: '🍾' },
  { value: 'yelling', label: 'Just Yell Really Loud', emoji: '📢' },
];

// Slot Machine Digit - Spin to randomize, nudge to adjust
interface SlotDigitProps {
  value: number;
  onChange: (value: number) => void;
  index: number;
  isSpinning?: boolean;
}

const SlotDigit = ({ value, onChange, index, isSpinning: externalSpinning }: SlotDigitProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const spinning = externalSpinning || isSpinning;

  const spin = () => {
    if (spinning) return;
    setIsSpinning(true);

    let spins = 0;
    const maxSpins = SPIN_BASE + Math.floor(Math.random() * SPIN_VARIANCE);
    let delay = INITIAL_DELAY_MS;

    const doSpin = () => {
      onChange(Math.floor(Math.random() * 10));
      spins++;

      if (spins >= maxSpins) {
        setIsSpinning(false);
        return;
      }

      if (spins > maxSpins - SLOWDOWN_START_FROM_END) {
        delay = delay * SLOWDOWN_FACTOR;
      }

      setTimeout(doSpin, delay);
    };

    doSpin();
  };

  const nudgeUp = () => {
    if (!spinning) onChange((value + 1) % 10);
  };
  const nudgeDown = () => {
    if (!spinning) onChange((value + 9) % 10);
  };

  return (
    <div className="slot-digit">
      <button
        type="button"
        className="slot-digit__nudge slot-digit__nudge--up"
        onClick={nudgeUp}
        disabled={spinning}
        aria-label={`Increase digit ${index + 1}`}
      >
        ▲
      </button>
      <button
        type="button"
        className={`slot-digit__display ${spinning ? 'slot-digit__display--spinning' : ''}`}
        onClick={spin}
        disabled={spinning}
        aria-label={`Spin digit ${index + 1}, current value ${value}`}
      >
        {value}
      </button>
      <button
        type="button"
        className="slot-digit__nudge slot-digit__nudge--down"
        onClick={nudgeDown}
        disabled={spinning}
        aria-label={`Decrease digit ${index + 1}`}
      >
        ▼
      </button>
    </div>
  );
};

export const FunFormFields = ({ isVisible }: FunFormFieldsProps) => {
  const [urgency, setUrgency] = useState(1);
  const [contactMethod, setContactMethod] = useState('email');
  const [phoneDigits, setPhoneDigits] = useState<number[]>([5, 5, 5, 5, 5, 5, 5, 5, 5, 5]);
  const [spinningAll, setSpinningAll] = useState(false);
  const [isJackpot, setIsJackpot] = useState(false);

  // Track timeouts and spin completion for cleanup
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completedSpins = useRef(0);

  // Cleanup timeouts on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const updateDigit = (index: number, value: number) => {
    setPhoneDigits((prev) => {
      const newDigits = [...prev];
      newDigits[index] = value;
      return newDigits;
    });
  };

  const formattedPhone = useMemo(() => {
    const d = phoneDigits;
    return `(${d[0]}${d[1]}${d[2]}) ${d[3]}${d[4]}${d[5]}-${d[6]}${d[7]}${d[8]}${d[9]}`;
  }, [phoneDigits]);

  // Takes digits as parameter to avoid stale closure
  const checkJackpot = (digits: number[]) => {
    const allSame = digits.every((d) => d === digits[0]);
    if (allSame) {
      setIsJackpot(true);
      const timeout = setTimeout(() => setIsJackpot(false), JACKPOT_DISPLAY_MS);
      timeoutRefs.current.push(timeout);
    }
  };

  const spinAll = () => {
    if (spinningAll) return;
    setSpinningAll(true);
    completedSpins.current = 0;
    setIsJackpot(false);

    // Clear previous timeouts
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];

    // Stagger the spins for a wave effect
    phoneDigits.forEach((_, index) => {
      const staggerTimeout = setTimeout(() => {
        const maxSpins = SPIN_BASE + Math.floor(Math.random() * SPIN_VARIANCE);
        let spins = 0;
        let delay = INITIAL_DELAY_MS;

        const doSpin = () => {
          setPhoneDigits((prev) => {
            const newDigits = [...prev];
            newDigits[index] = Math.floor(Math.random() * 10);
            return newDigits;
          });
          spins++;

          if (spins >= maxSpins) {
            completedSpins.current++;
            if (completedSpins.current >= 10) {
              setSpinningAll(false);
              // Get fresh digits via callback and check jackpot
              setPhoneDigits((currentDigits) => {
                const jackpotTimeout = setTimeout(() => checkJackpot(currentDigits), JACKPOT_CHECK_DELAY_MS);
                timeoutRefs.current.push(jackpotTimeout);
                return currentDigits;
              });
            }
            return;
          }

          if (spins > maxSpins - SLOWDOWN_START_FROM_END) {
            delay = delay * SLOWDOWN_FACTOR;
          }

          const spinTimeout = setTimeout(doSpin, delay);
          timeoutRefs.current.push(spinTimeout);
        };

        doSpin();
      }, index * STAGGER_DELAY_MS);
      timeoutRefs.current.push(staggerTimeout);
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fun-fields" aria-label="Fun optional fields">
      <div className="fun-fields__header">
        <span className="fun-fields__badge">Fun Mode</span>
        <span className="fun-fields__subtitle">These don't do anything. They're just for fun.</span>
      </div>

      <div className="fun-field">
        <label htmlFor="urgency" className="fun-field__label">
          Rate Your Urgency
          <span className="fun-field__hint">(1-100)</span>
        </label>
        <div className="urgency-slider">
          <input
            type="range"
            id="urgency"
            min="1"
            max="100"
            value={urgency}
            onChange={(e) => setUrgency(Number(e.target.value))}
            className="urgency-slider__input"
          />
          <div className="urgency-slider__value">{urgency}</div>
        </div>
        <div className="urgency-slider__description">
          {getUrgencyDescription(urgency)}
        </div>
      </div>

      <div className="fun-field">
        <label className="fun-field__label">Preferred Contact Method</label>
        <div className="contact-methods">
          {contactMethods.map((method) => (
            <button
              key={method.value}
              type="button"
              className={`contact-method ${contactMethod === method.value ? 'contact-method--selected' : ''}`}
              onClick={() => setContactMethod(method.value)}
            >
              <span className="contact-method__emoji">{method.emoji}</span>
              <span className="contact-method__label">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="fun-field">
        <label className="fun-field__label">
          World's Worst Phone Input
          <span className="fun-field__hint">(Good luck!)</span>
        </label>
        <div className={`rotary-phone ${isJackpot ? 'rotary-phone--jackpot' : ''}`}>
          <div className={`rotary-phone__display ${isJackpot ? 'rotary-phone__display--jackpot' : ''}`}>
            {isJackpot ? '🎰 JACKPOT! 🎰' : formattedPhone}
          </div>
          <div className="slot-phone__dials">
            {/* First 3 digits */}
            <div className="slot-phone__group">
              {[0, 1, 2].map((i) => (
                <SlotDigit
                  key={i}
                  value={phoneDigits[i]}
                  onChange={(v) => updateDigit(i, v)}
                  index={i}
                  isSpinning={spinningAll}
                />
              ))}
            </div>
            <span className="slot-phone__separator">-</span>
            {/* Middle 3 digits */}
            <div className="slot-phone__group">
              {[3, 4, 5].map((i) => (
                <SlotDigit
                  key={i}
                  value={phoneDigits[i]}
                  onChange={(v) => updateDigit(i, v)}
                  index={i}
                  isSpinning={spinningAll}
                />
              ))}
            </div>
            <span className="slot-phone__separator">-</span>
            {/* Last 4 digits */}
            <div className="slot-phone__group">
              {[6, 7, 8, 9].map((i) => (
                <SlotDigit
                  key={i}
                  value={phoneDigits[i]}
                  onChange={(v) => updateDigit(i, v)}
                  index={i}
                  isSpinning={spinningAll}
                />
              ))}
            </div>
          </div>
          <div className="slot-phone__actions">
            <button
              type="button"
              className="slot-phone__spin-all"
              onClick={spinAll}
              disabled={spinningAll}
            >
              {spinningAll ? '🎰 Spinning...' : '🎰 Spin All!'}
            </button>
          </div>
          <div className="slot-phone__hint">
            Click digits to spin individually, or go for broke!
          </div>
        </div>
      </div>
    </div>
  );
};

interface FunModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

export const FunModeToggle = ({ isActive, onToggle }: FunModeToggleProps) => {
  return (
    <button
      type="button"
      className={`fun-mode-toggle ${isActive ? 'fun-mode-toggle--active' : ''}`}
      onClick={onToggle}
      aria-pressed={isActive}
      title="Toggle Fun Mode"
    >
      <span className="fun-mode-toggle__icon">{isActive ? '🎉' : '✨'}</span>
      <span className="fun-mode-toggle__text">
        {isActive ? 'Fun Mode: ON' : 'Boring Form?'}
      </span>
    </button>
  );
};
