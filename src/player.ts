import { GameBoard } from "./gameboard";
import { shipProps, Ship } from "./ship";

export class Player {
    shipBeingPlaced?: shipProps

    constructor(
        public name: string,
        public human: boolean = true,
        public takingTurn = true,
        public shipsAvailable: shipProps[] = [{ type: 'tiny', size: 1 }, { type: 'small', size: 2 }, { type: 'huge', size: 4 }],
        public board = new GameBoard(9),
        public placingShips = true,
    ) {
        this.shipBeingPlaced = this.shipsAvailable.at(-1)
    }

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
            if (this.shipsAvailable.length === 0) {
                this.shipBeingPlaced = undefined
                this.placingShips = false
                return false
            }
            const shipToPlace = this.shipBeingPlaced
            const target = this.board.findTile(x, y)
            if (target && shipToPlace && !target.occupied) {
                if (this.board.placeShip(shipToPlace.type, shipToPlace.size, target)) {
                    this.shipsAvailable.pop()
                    if (this.shipsAvailable.length === 0) {
                        this.shipBeingPlaced = undefined
                        this.placingShips = false
                        return true
                    }
                    else this.shipBeingPlaced = this.shipsAvailable.at(-1)
                    return true
                }
            }
        }
        else return false
    }
}