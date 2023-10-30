import { describe, expect, test } from '@jest/globals';
import { Ship } from './ship';

describe('new ship has 0 hits', () => {
  test('new ship created and has 0 hits', () => {
    const newShip = new Ship('tiny', 1)
    expect(newShip.hits).toBe(0);
  });
});

describe('ship can take hits', () => {
  test('ship takes 1 hit', () => {
    const newShip = new Ship('tiny', 1)
    newShip.takeHit()
    expect(newShip.hits).toBe(1);
  });
});

describe('hits > length = sunk', () => {
  test('ship takes 2 hits and is sunk', () => {
    const newShip = new Ship('small', 2)
    newShip.takeHit()
    newShip.takeHit()
    expect(newShip.isSunk).toBe(true);
  });
});