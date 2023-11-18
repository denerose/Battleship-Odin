import { Ship } from "./ship"

export class Tile {

    constructor(
        public x: number,
        public y: number,
        public occupied: boolean = false,
        public hit: boolean = false,
        public shipKey?: string) { }
}

export class GameBoard {
    gameBoard: Tile[] = []
    activeShips: Ship[] = []

    constructor(
        size: number
    ) {
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                this.gameBoard.push(new Tile(x, y))
            }
        }
    }

    placementGrid(startTile: Tile, shipSize: number) {
        const tilesToCheck = []
        let currentTile: Tile = startTile
        if (tilesToCheck.length === 0) {
            tilesToCheck.push(currentTile)
        }
        while (shipSize > tilesToCheck.length) {
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
                tile.shipKey = shipToPlace.key
            })
            this.activeShips.push(shipToPlace)
        }
        return true;
    }

    public receiveAttack(attackedTile: Tile) {
        if (attackedTile.hit) { return false }
        else if (attackedTile.occupied) {
            attackedTile.hit = true
            if (attackedTile.shipKey) {
                const attackedShip = this.findShipFromKey(attackedTile.shipKey)
                if (attackedShip) attackedShip.takeHit()
            }
        }
        else attackedTile.hit = true
        return true
    }

    public findTile(x: number, y: number) {
        return this.gameBoard.find((tile) => tile.x == x && tile.y == y)
    }

    findShipFromKey(keyToFind: string) {
        const foundShip = this.activeShips.find((ship) => ship.key === keyToFind)
        return foundShip
    }

    public checkIfAllSunk() {
        // const occupiedTiles = this.gameBoard.filter((tile) => tile.occupied)
        return this.activeShips.every((ship) => ship.isSunk())
    }

    public getVacantTiles() {
        return this.gameBoard.filter((tile) => !tile.hit);
    }

}