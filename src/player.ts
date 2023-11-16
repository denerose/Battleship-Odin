import { GameBoard } from "./gameboard";

export class Player {

    constructor(
        public name: string,
        public ships = [{ type: 'tiny', length: 1 }, { type: 'small', length: 2 }],
        public board = new GameBoard(9),
        public placingShips = true,
        public takingTurn = true
    ) { }

    public placeAttack(enemyPlayer: Player, x: number, y: number) {
        const target = enemyPlayer.board.findTile(x, y)
        if (target && !target.hit) {
            enemyPlayer.board.receiveAttack(target);
            this.takingTurn = false
            if (!enemyPlayer.board.checkSunk())
                enemyPlayer.setTurn()
            return true
        }
        else {
            return false
        }
    }

    public setTurn() {
        this.takingTurn = true
    }
}