import { Player } from './player';

export function aiTurn(aiPlayer: Player, targetPlayer: Player) {
    if (aiPlayer.placingShips) {
        return
    }
    else if (!aiPlayer.placingShips) {
        const legalMoves = targetPlayer.board.getVacantTiles()
        const coords = Math.floor(Math.random() * legalMoves.length) + 1;
        const target = legalMoves[coords]
        aiPlayer.placeAttack(targetPlayer, target.x, target.y)
    }
}