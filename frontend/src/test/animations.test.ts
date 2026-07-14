import { describe, it, expect } from 'vitest';
import { staggerContainer, staggerItem, spring } from '../lib/animations';

describe('animations', () => {
  it('staggerContainer has hidden and visible states', () => {
    expect(staggerContainer.hidden).toBeDefined();
    expect(staggerContainer.visible).toBeDefined();
  });

  it('staggerItem has hidden and visible states', () => {
    expect(staggerItem.hidden).toBeDefined();
    expect(staggerItem.visible).toBeDefined();
  });

  it('spring is a Transition object', () => {
    expect(spring.type).toBe('spring');
    expect(spring.stiffness).toBe(400);
    expect(spring.damping).toBe(20);
  });
});
