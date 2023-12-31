import { describe, expect, test } from "@jest/globals";
import { setupGame, P1, P2 } from "./game";
import { aiTurn } from "./ai";

describe('AI Player Attacks', () => {
    setupGame()
    test('ai can fetch valid moves ', () => {
        expect(P1.board.getUnhitTiles().length).toBe(81)
    });
    test('AI player can attack make an attack', () => {
        P1.takingTurn = false
        P1.placingShips = false
        P2.takingTurn = true
        P2.placingShips = false

        aiTurn(P2, P1)
        let afterAttack = P1.board.getUnhitTiles()
        expect(afterAttack.length).toBe(80)
    });
});

describe('AI Player Places Ships', () => {
    setupGame()
    test('ai can fetch valid moves ', () => {
        expect(P2.board.getUnhitTiles().length).toBe(81)
    });
    test('AI player can place ship', () => {
        P1.takingTurn = false
        P2.takingTurn = true
        aiTurn(P2, P1)
        let afterAttack = P1.board.getUnhitTiles()
        expect(afterAttack.length).toBe(80)
    });
});