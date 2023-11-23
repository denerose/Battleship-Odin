import * as game from "./game";
import { Tile } from "./gameboard";
import { shipProps } from "./ship";


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
        newTile.innerText = "hit!"
    }
    else {
        newTile.className = "tile"
    }
    newTile.addEventListener('click', () => {
        if (game.gameInPlay) {
            game.handleClick(owner, tile.x, tile.y)
            refreshBoards()
            refreshHarbours()
        }
    })
    if (game.getCurrentPlayer()?.placingShips && owner === game.getCurrentPlayer()?.name) {
        newTile.addEventListener('mouseenter', () => {
            shipShadow(owner, tile)
        })
        newTile.addEventListener('mouseleave', () => {
            removeShipShadow(owner, tile)
        })
    }
    return newTile
}

function clickRef(idString: string) {
    const params = idString.split('-')
    return params
}

function refreshTile(referenceTile: HTMLElement) {
    const idArray = clickRef(referenceTile.id)
    const owner = idArray[0]
    const x = Number(idArray[1])
    const y = Number(idArray[2])
    if (owner === 'P1') {
        const boardInfo = game.P1.board
        const tileInfo = boardInfo.findTile(x, y)
        if (tileInfo?.occupied) {
            referenceTile.className = "tile myship"
        } else { referenceTile.className = "tile" }
    }

}

export function refreshBoards() {
    document.body.style.cursor = 'none';

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
    document.body.style.cursor = 'auto';

}

export function refreshHarbours() {
    const P1Ships = game.getP1ShipsAvailable()
    const P2Ships = game.getP2ShipsAvailable()
    const P1Harbour = document.getElementById("P1Harbour") as HTMLDivElement
    P1Harbour.innerHTML = '<h4>Harbour (ships to place)</h4>'
    const P2Harbour = document.getElementById("P2Harbour") as HTMLDivElement
    P2Harbour.innerHTML = '<h4>Harbour</h4>'
    P1Ships.slice().reverse().forEach((ship) => {
        const newShipDiv = document.createElement('div')
        newShipDiv.innerText = `${ship.type} (${ship.size})`
        if (ship === game.getShipBeingPlaced()) {
            newShipDiv.className = "harbourShip currentShip"
        }
        else {
            newShipDiv.className = "harbourShip"
        }
        P1Harbour.appendChild(newShipDiv)
    })
    P2Ships.slice().reverse().forEach((ship) => {
        const newShipDiv = document.createElement('div')
        newShipDiv.innerText = `${ship.type} (${ship.size})`
        newShipDiv.className = "harbourShip"
        P2Harbour.appendChild(newShipDiv)
    })
}

function shipShadow(owner: string, hoverTile: Tile) {
    const shipToPlace = game.getShipBeingPlaced() as shipProps
    const highlightArea: HTMLElement[] = []
    for (let index = 0; index < shipToPlace.size; index++) {
        const tileID = `${owner}-${hoverTile.x}-${hoverTile.y + index}`
        const tileToHighlight = document.getElementById(tileID)
        if (tileToHighlight) { highlightArea.push(tileToHighlight) }
        else break
    }
    if (highlightArea.length === shipToPlace.size) {
        highlightArea.forEach((highlightedTile) => {
            highlightedTile.className = "tile shadow"
        })
    }
}

function removeShipShadow(owner: string, hoverTile: Tile) {
    const shipToPlace = game.getShipBeingPlaced() as shipProps
    const highlightArea: HTMLElement[] = []
    for (let index = 0; index < shipToPlace.size; index++) {
        const tileID = `${owner}-${hoverTile.x}-${hoverTile.y + index}`
        const tileToHighlight = document.getElementById(tileID)
        if (tileToHighlight) { highlightArea.push(tileToHighlight) }
        else break
    }
    highlightArea.forEach((highlightedTile) => {
        refreshTile(highlightedTile)
    })
}