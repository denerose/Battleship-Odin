import { GameBoard } from "./game";

export class Player {

    constructor(
        public name: string,
        public ships = [{ type: 'tiny', length: 1 }, { type: 'small', length: 2 }],
        public board = new GameBoard(9),
        public placingShips = true

    ) { }

    public placeAttack(enemyBoard: GameBoard, x: number, y: number) {
        const target = enemyBoard.findTile(x, y)
        if (target && target.hit == false) {
            enemyBoard.receiveAttack(target);
            return true
        }
        else {
            return false
        }
    }
}