import { describe, expect, test } from '@jest/globals';
import { GameBoard } from './game';

describe('gameboard setup', () => {
  test('new gameboard creates a gameboard array', () => {
    const p1board = new GameBoard(3)
    expect(p1board.gameBoard.length).toBe(9);
  });
});

describe('place a ship', () => {
  test('2 tile ship can be placed', () => {
    const p1board = new GameBoard(3)
    p1board.placeShip('tiny', 2, p1board.gameBoard[0])
    expect(p1board.gameBoard[0].occupied).toBe(true);
    expect(p1board.gameBoard[1].occupied).toBe(true);
    expect(p1board.gameBoard[3].occupied).toBe(false);
  });
});

describe('cannot place a ship on occupied tile', () => {
  test('cannot place ship twice on gameBoard[1]', () => {
    const p1board = new GameBoard(3)
    p1board.placeShip('small', 2, p1board.gameBoard[0])
    const secondShipPlacement = p1board.placeShip('tiny', 1, p1board.gameBoard[1])
    expect(secondShipPlacement).toBe(false);
  });
});

describe('cannot place a ship on edge of board', () => {
  test('cannot place 2 tile ship twice on gameBoard[2]', () => {
    const p1board = new GameBoard(3)
    const shipPlaced = p1board.placeShip('small', 2, p1board.gameBoard[2])
    expect(shipPlaced).toBe(false);
  });
});