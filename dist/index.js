"use strict";

// src/ai.ts
function aiTurn(aiPlayer, targetPlayer) {
  if (aiPlayer.placingShips) {
    return;
  } else if (!aiPlayer.placingShips) {
    const legalMoves = targetPlayer.board.getVacantTiles();
    const coords = Math.floor(Math.random() * legalMoves.length) + 1;
    const target = legalMoves[coords];
    aiPlayer.placeAttack(targetPlayer, target.x, target.y);
  }
}

// src/ship.ts
var import_uuid = require("uuid");
var Ship = class {
  constructor(type, size) {
    this.type = "small";
    this.hits = 0;
    this.isSunk = () => {
      return this.hits >= this.size ? true : false;
    };
    this.size = size;
    this.type = type;
    this.key = (0, import_uuid.v4)();
  }
  takeHit() {
    this.hits++;
  }
};

// src/gameboard.ts
var Tile = class {
  constructor(x, y, occupied = false, hit = false, shipKey) {
    this.x = x;
    this.y = y;
    this.occupied = occupied;
    this.hit = hit;
    this.shipKey = shipKey;
  }
};
var GameBoard = class {
  constructor(size) {
    this.gameBoard = [];
    this.activeShips = [];
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        this.gameBoard.push(new Tile(x, y));
      }
    }
  }
  placementGrid(startTile, shipSize) {
    const tilesToCheck = [];
    let currentTile = startTile;
    if (tilesToCheck.length === 0) {
      tilesToCheck.push(currentTile);
    }
    while (shipSize > tilesToCheck.length) {
      let newTile = this.gameBoard.find((newTile2) => newTile2.x === currentTile.x && newTile2.y === currentTile.y + 1);
      if (newTile) {
        currentTile = newTile;
        tilesToCheck.push(currentTile);
      } else
        return [];
    }
    return tilesToCheck;
  }
  placeShip(type, size, startTile) {
    const placementArea = this.placementGrid(startTile, size);
    if (placementArea.length === 0) {
      return false;
    } else if (placementArea.some((tile) => tile.occupied)) {
      return false;
    } else {
      const shipToPlace = new Ship(type, size);
      placementArea.forEach((tile) => {
        tile.occupied = true;
        tile.shipKey = shipToPlace.key;
      });
      this.activeShips.push(shipToPlace);
    }
    return true;
  }
  receiveAttack(attackedTile) {
    if (attackedTile.hit) {
      return false;
    } else if (attackedTile.occupied) {
      attackedTile.hit = true;
      if (attackedTile.shipKey) {
        const attackedShip = this.findShipFromKey(attackedTile.shipKey);
        if (attackedShip)
          attackedShip.takeHit();
      }
    } else
      attackedTile.hit = true;
    return true;
  }
  findTile(x, y) {
    return this.gameBoard.find((tile) => tile.x == x && tile.y == y);
  }
  findShipFromKey(keyToFind) {
    const foundShip = this.activeShips.find((ship) => ship.key === keyToFind);
    return foundShip;
  }
  checkIfAllSunk() {
    return this.activeShips.every((ship) => ship.isSunk());
  }
  getVacantTiles() {
    return this.gameBoard.filter((tile) => !tile.hit);
  }
};

// src/player.ts
var Player = class {
  constructor(name, human = true, takingTurn = true, ships = [{ type: "tiny", size: 1 }, { type: "small", size: 2 }], board = new GameBoard(9), placingShips = true) {
    this.name = name;
    this.human = human;
    this.takingTurn = takingTurn;
    this.ships = ships;
    this.board = board;
    this.placingShips = placingShips;
  }
  placeAttack(enemyPlayer, x, y) {
    const target = enemyPlayer.board.findTile(x, y);
    if (target && !target.hit) {
      enemyPlayer.board.receiveAttack(target);
      this.takingTurn = false;
      enemyPlayer.setTurn();
      return true;
    } else {
      return false;
    }
  }
  setTurn() {
    this.takingTurn = true;
  }
  placeShip(x, y) {
    if (this.placingShips) {
      if (this.ships.length === 0) {
        this.placingShips = false;
        return false;
      }
      const shipToPlace = this.ships.pop();
      const target = this.board.findTile(x, y);
      if (target && shipToPlace) {
        this.board.placeShip(shipToPlace.type, shipToPlace.size, target);
        return true;
      }
    } else
      return false;
  }
};

// src/game.ts
var P1 = new Player("P1");
var P2 = new Player("P2", false, false);
var winner = "TBC";
var gameInPlay = true;
function setupGame() {
  P1 = new Player("P1");
  P2 = new Player("P2", false, false);
  gameInPlay = true;
  P1.placeShip(1, 1);
  P1.placeShip(2, 2);
  P1.placingShips = false;
  P2.placeShip(1, 1);
  P2.placeShip(2, 2);
  P2.placingShips = false;
}
var getCurrentPlayer = () => {
  if (P1.takingTurn && !P2.takingTurn) {
    return P1;
  }
  if (P2.takingTurn && !P1.takingTurn) {
    return P2;
  }
};
var getEnemyPlayer = () => {
  if (P1.takingTurn && !P2.takingTurn) {
    return P2;
  }
  if (P2.takingTurn && !P1.takingTurn) {
    return P1;
  }
};
function handleClick(boardName, x, y) {
  const currentPlayer = getCurrentPlayer();
  const enemyPlayer = getEnemyPlayer();
  if (boardName === currentPlayer.name) {
    if (!currentPlayer.placingShips) {
      return false;
    } else {
      currentPlayer.placeShip(x, y);
      return true;
    }
  }
  if (boardName === enemyPlayer.name && !currentPlayer.placingShips) {
    currentPlayer.placeAttack(enemyPlayer, x, y);
    let isWinner = checkWinner();
    if (gameInPlay && !enemyPlayer.human) {
      aiTurn(enemyPlayer, currentPlayer);
    }
    return true;
  }
}
function checkWinner() {
  if (!P1.board.checkIfAllSunk() && !P2.board.checkIfAllSunk()) {
    gameInPlay = true;
    return false;
  } else if (P1.board.checkIfAllSunk() === true) {
    winner = P2.name;
    gameInPlay = false;
    return winner;
  } else if (P2.board.checkIfAllSunk() === true) {
    winner = P1.name;
    gameInPlay = false;
    return winner;
  } else {
    gameInPlay = true;
    return false;
  }
}
function getP1Board() {
  return P1.board.gameBoard;
}
function getP2Board() {
  return P2.board.gameBoard;
}

// src/control.ts
var P1Frame = document.getElementById("P1Frame");
var P2Frame = document.getElementById("P2Frame");
function createTile(owner, tile) {
  const newTile = document.createElement("div");
  newTile.id = `${owner}-${tile.x}-${tile.y}`;
  if (owner === "P1" && tile.occupied && !tile.hit) {
    newTile.className = "tile myship";
  } else if (tile.hit && !tile.occupied) {
    newTile.className = "tile miss";
    newTile.innerText = "x";
  } else if (tile.hit && tile.occupied) {
    newTile.className = "tile hit";
  } else {
    newTile.className = "tile";
  }
  newTile.addEventListener("click", () => {
    if (gameInPlay) {
      handleClick(owner, tile.x, tile.y);
      refreshBoards();
    }
  });
  return newTile;
}
function refreshBoards() {
  const P1Board = getP1Board();
  const P2Board = getP2Board();
  P1Frame.innerHTML = "";
  P1Board.forEach((tile) => {
    const newTile = createTile("P1", tile);
    P1Frame.appendChild(newTile);
  });
  P2Frame.innerHTML = "";
  P2Board.forEach((tile) => {
    const newTile = createTile("P2", tile);
    P2Frame.appendChild(newTile);
  });
}

// src/index.ts
setupGame();
refreshBoards();
//# sourceMappingURL=index.js.map