import { Player } from './player';

export function aiTurn(aiPlayer: Player, targetPlayer: Player) {
    if (aiPlayer.placingShips) {
        const legalMoves = aiPlayer.board.getVacantTiles()
        const chooseTarget = Math.floor(Math.random() * legalMoves.length);
        const target = legalMoves[chooseTarget]
        aiPlayer.placeShip(target.x, target.y)
    }
    else if (!aiPlayer.placingShips) {
        const legalMoves = targetPlayer.board.getVacantTiles()
        const chooseTarget = Math.floor(Math.random() * legalMoves.length);
        const target = legalMoves[chooseTarget]
        aiPlayer.placeAttack(targetPlayer, target.x, target.y)
    }
}