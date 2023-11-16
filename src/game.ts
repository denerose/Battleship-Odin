import { Player } from "./player";
export let P1: Player = new Player("P1")
export let P2: Player = new Player("P2")
export let winner = "TBC"
export let gameInPlay = true

export function setupGame() {
    P1 = new Player("P1")
    P2 = new Player("P2", false, false)
    gameInPlay = true

    // temporary ship placement and setup
    P1.placeShip(1, 1)
    P1.placeShip(2, 2)
    P2.placeShip(1, 1)
    P2.placeShip(2, 2)
}

const getCurrentPlayer = () => {
    if (P1.takingTurn && !P2.takingTurn) { return P1 }
    if (P2.takingTurn && !P1.takingTurn) { return P2 }
}

const getEnemyPlayer = () => {
    if (P1.takingTurn && !P2.takingTurn) { return P2 }
    if (P2.takingTurn && !P1.takingTurn) { return P1 }
}

export function handleClick(boardName: string, x: number, y: number) {
    const currentPlayer: Player = getCurrentPlayer() as Player
    const enemyPlayer: Player = getEnemyPlayer() as Player
    if (boardName === currentPlayer.name) {
        if (!currentPlayer.placingShips) { return false }
        else {
            currentPlayer.placeShip(x, y)
            return true
        }
    }
    if (boardName === enemyPlayer.name && !currentPlayer.placingShips) {
        currentPlayer.placeAttack(enemyPlayer, x, y)
        checkWinner()
        return true
    }
}

function checkWinner() {
    if (!P1.board.checkSunk() && !P2.board.checkSunk()) { return false }
    else if (P1.board.checkSunk()) {
        winner = P2.name
        gameInPlay = false
        return winner
    }
    else if (P2.board.checkSunk()) {
        winner = P1.name
        gameInPlay = false
        return winner
    }
    else return false
}

export function getP1Board() {
    return P1.board.gameBoard
}

export function getP2Board() {
    return P2.board.gameBoard
}