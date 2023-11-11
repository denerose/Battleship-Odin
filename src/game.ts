import { Ship } from "./ship"

class Tile {

    constructor(
        public x: number,
        public y: number,
        myBoard?: GameBoard,
        public occupied: boolean = false,
        public hit: boolean = false,
        public shipKey?: Ship) { }

    triggerPlaceShip() {
        if (!this.occupied) {

        } else { return new Error('occupied!!') }
    }
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

    checkTiles(startTile: Tile, length: number) {
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
        const placementArea = this.checkTiles(startTile, size)
        if (placementArea.length === 0) { return new Error('Ship will overflow the board') }
        else if (placementArea.some((tile) => tile.occupied)) { return new Error('Already occupied') }
        else {
            const shipToPlace = new Ship(type, size)
            placementArea.forEach((tile) => {
                tile.occupied = true
                tile.shipKey = shipToPlace
            })
        }
    }


}