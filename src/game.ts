
interface Tile {
    x: number
    y: number
    occupied: boolean
}

export class GameBoard {
    gameBoard: Tile[] = []

    constructor(
        size: number
    ) {
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                this.gameBoard.push({ x, y, occupied: false })
            }
        }
    }
}