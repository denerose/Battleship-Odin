import {describe, expect, test} from '@jest/globals';
import {GameBoard} from './game';

describe('gameboard setup', () => {
  test('new gameboard creates a gameboard array', () => {
    const p1board = new GameBoard(3)
    expect(p1board.gameBoard.length).toBe(9);
  });
});