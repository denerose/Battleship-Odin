import { GameBoard } from "./gameboard";
import { shipProps } from "./ship";

export class Player {

    constructor(
        public name: string,
        public human: boolean = true,
        public takingTurn = true,
        public ships: shipProps[] = [{ type: 'tiny', size: 1 }, { type: 'small', size: 2 }],
        public board = new GameBoard(9),
        public placingShips = true,
    ) { }

    public placeAttack(enemyPlayer: Player, x: number, y: number) {
        const target = enemyPlayer.board.findTile(x, y)
        if (target && !target.hit) {
            enemyPlayer.board.receiveAttack(target);
            this.takingTurn = false
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

    public placeShip(x: number, y: number) {
        if (this.placingShips) {
            if (this.ships.length === 0) {
                this.placingShips = false
                return false
            }
            const shipToPlace = this.ships.pop()
            const target = this.board.findTile(x, y)
            if (target && shipToPlace) {
                this.board.placeShip(shipToPlace.type, shipToPlace.size, target)
                return true
            }
        }
        else return false
    }
}