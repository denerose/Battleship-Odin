import { Player } from "./player";

describe('player can place hits', () => {
  const P1 = new Player("Player1");
  const P2 = new Player("Computer");

  test('P1 places a hit at 0,0', () => {
    P1.placeAttack(P2, 0, 0)
    expect(P2.board.gameBoard[0].hit).toBe(true);
  });

  test('cannot place hit twice', () => {
    P1.placeAttack(P2, 0, 0)
    expect(P1.placeAttack(P2, 0, 0)).toBe(false);
  });

});

describe('player can place ships', () => {
  const P1 = new Player("Player1");

  test('P1 places a ship', () => {
    P1.placeShip("tiny", 1, 0, 0)
    expect(P1.board.gameBoard[0].shipKey?.type).toBe("tiny");
  });
});