import * as game from "./game";
import { Tile } from "./gameboard";


const P1Frame = document.getElementById("P1Frame") as HTMLDivElement
const P2Frame = document.getElementById("P2Frame") as HTMLDivElement

function createTile(owner: string, tile: Tile) {
    const newTile = document.createElement('div')
    newTile.id = `${owner}-${tile.x}-${tile.y}`
    if (owner === "P1" && tile.occupied && !tile.hit) {
        newTile.className = "tile myship"
    }
    else if (tile.hit && !tile.occupied) {
        newTile.className = "tile miss"
        newTile.innerText = "x"
    }
    else if (tile.hit && tile.occupied) {
        newTile.className = "tile hit"
    }
    else {
        newTile.className = "tile"
    }
    newTile.addEventListener('click', () => {
        if (game.gameInPlay) {
            game.handleClick(owner, tile.x, tile.y)
            refreshBoards()
        }
    })
    return newTile
}

function clickRef(idString: string) {
    const params = idString.split('-')
    return params
}

function refreshTile(tile: Tile) {

}

export function refreshBoards() {
    const P1Board = game.getP1Board()
    const P2Board = game.getP2Board()

    // create DOM elements for P1 board
    P1Frame.innerHTML = ''
    P1Board.forEach(tile => {
        const newTile = createTile("P1", tile)
        P1Frame.appendChild(newTile)
    })

    // create DOM elements for P2 board
    P2Frame.innerHTML = ''
    P2Board.forEach(tile => {
        const newTile = createTile("P2", tile)
        P2Frame.appendChild(newTile)
    })
}