import { Player } from './player';

export function aiTurn(aiPlayer: Player, targetPlayer: Player) {
    if (aiPlayer.placingShips) {
        return
    }
    else if (!aiPlayer.placingShips) {
        const legalMoves = targetPlayer.board.getVacantTiles()
        const chooseTarget = Math.floor(Math.random() * legalMoves.length);
        const target = legalMoves[chooseTarget]
        console.log(`${target.x}, ${target.y}`)
        aiPlayer.placeAttack(targetPlayer, target.x, target.y)
    }
}