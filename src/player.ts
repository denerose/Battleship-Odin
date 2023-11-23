import { GameBoard } from "./gameboard";
import { shipProps, Ship } from "./ship";

export class Player {
    shipBeingPlaced?: shipProps

    constructor(
        public name: string,
        public human: boolean = true,
        public takingTurn = true,
        public shipsAvailable: shipProps[] = [{ type: 'tiny', size: 1 }, { type: 'small', size: 2 }],
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
            if (this.shipsAvailable.length === 0) {
                this.shipBeingPlaced = undefined
                this.placingShips = false
                return false
            }
            const shipToPlace = this.shipsAvailable.pop()
            this.shipBeingPlaced = shipToPlace
            const target = this.board.findTile(x, y)
            if (target && shipToPlace) {
                this.board.placeShip(shipToPlace.type, shipToPlace.size, target)
                if (this.shipsAvailable.length === 0) {
                    this.shipBeingPlaced = undefined
                    this.placingShips = false
                }
                return true
            }
        }
        else return false
    }
}