import { describe, expect, test } from '@jest/globals';
import { GameBoard } from './gameboard';

describe('gameboard setup', () => {
  test('new gameboard creates a gameboard array', () => {
    const p1board = new GameBoard(3)
    expect(p1board.gameBoard.length).toBe(9);
  });
});

describe('find a tile', () => {
  test('findTile(0,0) returns gameBoard[0]', () => {
    const p1board = new GameBoard(3)
    expect(p1board.findTile(0, 0)).toBe(p1board.gameBoard[0]);
  });
});

describe('find a ship', () => {
  test('findShipFromKey returns a Ship', () => {
    const P1 = new GameBoard(3)
    const target = P1.gameBoard[0]
    P1.placeShip("tiny", 1, target)
    console.log(target.shipKey)
    expect(P1.findShipFromKey(target.shipKey as string)).toEqual(P1.activeShips[0]);
  });
});


describe('place a ship', () => {
  test('2 tile ship can be placed', () => {
    const p1board = new GameBoard(3)
    p1board.placeShip('tiny', 2, p1board.gameBoard[0])
    const placedShip = p1board.activeShips[0]
    expect(p1board.gameBoard[0].occupied).toBe(true);
    expect(p1board.gameBoard[1].occupied).toBe(true);
    expect(p1board.gameBoard[3].occupied).toBe(false);
    expect(p1board.gameBoard[0].shipKey).toEqual(placedShip.key)
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

describe('board can take hits', () => {
  const p1board = new GameBoard(3)
  p1board.placeShip('small', 2, p1board.gameBoard[0])
  const testShip = p1board.activeShips[0]

  test('unoccupied tile records a miss', () => {
    p1board.receiveAttack(p1board.gameBoard[3])
    expect(p1board.gameBoard[3].hit).toBeTruthy
  })

  test('occupied tile pushes a hit to relevant ship', () => {
    p1board.receiveAttack(p1board.gameBoard[0])
    expect(testShip?.hits).toBe(1)
    expect(p1board.gameBoard[0].hit).toBeTruthy
  })

  test('cannot re-hit same tile', () => {
    p1board.receiveAttack(p1board.gameBoard[0])
    p1board.receiveAttack(p1board.gameBoard[0])
    expect(testShip?.hits).toBe(1)
  })

});

describe('gameboard can report if sunk', () => {
  const p1board = new GameBoard(3)
  p1board.placeShip('small', 2, p1board.gameBoard[0])
  p1board.receiveAttack(p1board.gameBoard[0])

  test('unsunk returns false', () => {
    expect(p1board.checkIfAllSunk()).toBe(false)
  })

  test('all sunk returns true', () => {
    p1board.receiveAttack(p1board.gameBoard[1])
    console.log(p1board.activeShips)
    expect(p1board.checkIfAllSunk()).toBe(true)
  })
})