import { describe, it, expect } from 'vitest';
import * as Mobile from '../index';

describe('@almadar/mobile', () => {
  it('should export all components', () => {
    expect(Mobile).toBeDefined();
    expect(Mobile.Button).toBeDefined();
    expect(Mobile.Text).toBeDefined();
  });
});
