import { Ship } from "./ship"

class Tile {

    constructor(
        public x: number,
        public y: number,
        public occupied: boolean = false,
        public hit: boolean = false,
        public shipKey?: Ship) { }
}

export class GameBoard {
    gameBoard: Tile[] = []

    constructor(
        size: number
    ) {
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                this.gameBoard.push(new Tile(x, y))
            }
        }
    }

    placementGrid(startTile: Tile, length: number) {
        const tilesToCheck = []
        let currentTile: Tile = startTile
        if (tilesToCheck.length === 0) {
            tilesToCheck.push(currentTile)
        }
        while (length > tilesToCheck.length) {
            let newTile = this.gameBoard.find((newTile) => newTile.x === currentTile.x && newTile.y === currentTile.y + 1);
            if (newTile) {
                currentTile = newTile
                tilesToCheck.push(currentTile)
            } else return []
        }
        return tilesToCheck;
    }

    public placeShip(type: string, size: number, startTile: Tile) {
        const placementArea = this.placementGrid(startTile, size)
        if (placementArea.length === 0) { return false }
        else if (placementArea.some((tile) => tile.occupied)) { return false }
        else {
            const shipToPlace = new Ship(type, size)
            placementArea.forEach((tile) => {
                tile.occupied = true
                tile.shipKey = shipToPlace
            })
        }
        return true;
    }

    public receiveAttack(attackedTile: Tile) {
        if (attackedTile.hit) { return false }
        else if (attackedTile.occupied) {
            attackedTile.hit = true
            attackedTile.shipKey?.takeHit()
        }
        else attackedTile.hit = true
        return true
    }

    public findTile(x: number, y: number) {
        return this.gameBoard.find((tile) => tile.x == x && tile.y == y)
    }

}