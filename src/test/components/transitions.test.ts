import { describe, it, expect, beforeEach } from 'vitest';
import { setIrisCenter } from '../../components/transitions';

describe('setIrisCenter', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-iris-x');
    document.documentElement.removeAttribute('data-iris-y');
    document.documentElement.removeAttribute('data-iris-direction');
  });

  it('should set data attributes on document element', () => {
    setIrisCenter(100, 200, 'enter');
    expect(document.documentElement.getAttribute('data-iris-x')).toBe('100');
    expect(document.documentElement.getAttribute('data-iris-y')).toBe('200');
    expect(document.documentElement.getAttribute('data-iris-direction')).toBe('enter');
  });

  it('should round coordinates', () => {
    setIrisCenter(100.7, 200.3, 'exit');
    expect(document.documentElement.getAttribute('data-iris-x')).toBe('101');
    expect(document.documentElement.getAttribute('data-iris-y')).toBe('200');
  });

  it('should set exit direction', () => {
    setIrisCenter(50, 50, 'exit');
    expect(document.documentElement.getAttribute('data-iris-direction')).toBe('exit');
  });
});
