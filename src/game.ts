import { aiTurn } from "./ai";
import { Player } from "./player";
export let P1: Player = new Player("P1")
export let P2: Player = new Player("P2", false, false)
export let winner = "TBC"
export let gameInPlay = true

export function setupGame() {
    P1 = new Player("P1")
    P2 = new Player("P2", false, false)
    gameInPlay = true
    winner = "TBC"
}

export const getCurrentPlayer = () => {
    if (P1.takingTurn && !P2.takingTurn) { return P1 }
    if (P2.takingTurn && !P1.takingTurn) { return P2 }
}

const getEnemyPlayer = () => {
    if (P1.takingTurn && !P2.takingTurn) { return P2 }
    if (P2.takingTurn && !P1.takingTurn) { return P1 }
}

export function getP1ShipsAvailable() {
    return P1.shipsAvailable
}

export function getP2ShipsAvailable() {
    return P2.shipsAvailable
}

export function handleClick(boardName: string, x: number, y: number) {
    const currentPlayer: Player = getCurrentPlayer() as Player
    const enemyPlayer: Player = getEnemyPlayer() as Player
    if (boardName === currentPlayer.name) {
        if (!currentPlayer.placingShips) {
            alert("Your ships are places. Attack the enemy board by clicking a vacant square.")
            return false
        }
        else {
            if (currentPlayer.placeShip(x, y) && gameInPlay && !enemyPlayer.human) {
                aiTurn(enemyPlayer, currentPlayer)
            }
            return true
        }
    }
    if (boardName === enemyPlayer.name && !currentPlayer.placingShips) {
        if (enemyPlayer.board.findTile(x, y)?.hit) return false
        currentPlayer.placeAttack(enemyPlayer, x, y)
        checkWinner()
        if (gameInPlay && !enemyPlayer.human) {
            aiTurn(enemyPlayer, currentPlayer)
        }
        return true
    }
}

export function checkWinner() {
    if (P1.placingShips || P2.placingShips) { return false }
    if (!P1.board.checkIfAllSunk() && !P2.board.checkIfAllSunk()) {
        gameInPlay = true
        return false
    }
    else if (P1.board.checkIfAllSunk() === true) {
        winner = P2.name
        gameInPlay = false
        declareWinner()
        return winner
    }
    else if (P2.board.checkIfAllSunk() === true) {
        winner = P1.name
        gameInPlay = false
        declareWinner()
        return winner
    }
    else {
        gameInPlay = true
        return false
    }
}

function declareWinner() {
    if (winner != "TBC") {
        if (confirm(`**${winner} won the game!**\nPlay again?`) == true) {
            setupGame()
        }
        else {
            let main = document.getElementById('main') as HTMLElement
            main.style.display = "none"
            alert('Okay, bye bye!')
        }
    } else return
}

export function getP1Board() {
    return P1.board.gameBoard
}

export function getP2Board() {
    return P2.board.gameBoard
}

export function getShipBeingPlaced() {
    const currentPlayer = getCurrentPlayer()
    if (currentPlayer && currentPlayer.placingShips) return currentPlayer.shipBeingPlaced
}