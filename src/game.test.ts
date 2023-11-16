import { describe, expect, test } from '@jest/globals';
import { P1, P2, setupGame } from './game';

describe('game can create new game', () => {
    test('game setup adds both players and P2 is CPU player', () => {
        setupGame();
        expect(P1.human).toBe(true)
        expect(P2.human).toBe(false)
    });
});