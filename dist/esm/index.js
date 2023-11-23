// src/ai.ts
function aiTurn(aiPlayer, targetPlayer) {
  if (aiPlayer.placingShips) {
    const legalMoves = aiPlayer.board.getVacantTiles();
    const chooseTarget = Math.floor(Math.random() * legalMoves.length);
    const target = legalMoves[chooseTarget];
    aiPlayer.placeShip(target.x, target.y);
  } else if (!aiPlayer.placingShips) {
    const legalMoves = targetPlayer.board.getUnhitTiles();
    const chooseTarget = Math.floor(Math.random() * legalMoves.length);
    const target = legalMoves[chooseTarget];
    aiPlayer.placeAttack(targetPlayer, target.x, target.y);
  }
}

// src/ship.ts
var Ship = class {
  constructor(type, size) {
    this.type = "small";
    this.hits = 0;
    this.isSunk = () => {
      return this.hits >= this.size ? true : false;
    };
    this.size = size;
    this.type = type;
    this.key = crypto.randomUUID();
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
      let newCheckedTile = this.gameBoard.find((newCheckedTile2) => newCheckedTile2.x === currentTile.x && newCheckedTile2.y === currentTile.y + 1);
      if (newCheckedTile) {
        currentTile = newCheckedTile;
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
  getUnhitTiles() {
    return this.gameBoard.filter((tile) => !tile.hit);
  }
  getVacantTiles() {
    return this.gameBoard.filter((tile) => !tile.occupied);
  }
  isOccupied(x, y) {
    const target = this.findTile(x, y);
    if (target)
      target.occupied ? true : false;
  }
};

// src/player.ts
var Player = class {
  constructor(name, human = true, takingTurn = true, shipsAvailable = [{ type: "tiny", size: 1 }, { type: "small", size: 2 }], board = new GameBoard(9), placingShips = true) {
    this.name = name;
    this.human = human;
    this.takingTurn = takingTurn;
    this.shipsAvailable = shipsAvailable;
    this.board = board;
    this.placingShips = placingShips;
    this.shipBeingPlaced = this.shipsAvailable.at(-1);
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
      if (this.shipsAvailable.length === 0) {
        this.shipBeingPlaced = void 0;
        this.placingShips = false;
        return false;
      }
      const shipToPlace = this.shipBeingPlaced;
      const target = this.board.findTile(x, y);
      if (target && shipToPlace && !target.occupied) {
        this.board.placeShip(shipToPlace.type, shipToPlace.size, target);
        this.shipsAvailable.pop();
        if (this.shipsAvailable.length === 0) {
          this.shipBeingPlaced = void 0;
          this.placingShips = false;
        } else
          this.shipBeingPlaced = this.shipsAvailable.at(-1);
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
  winner = "TBC";
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
function getP1ShipsAvailable() {
  return P1.shipsAvailable;
}
function getP2ShipsAvailable() {
  return P2.shipsAvailable;
}
function handleClick(boardName, x, y) {
  var _a;
  const currentPlayer = getCurrentPlayer();
  const enemyPlayer = getEnemyPlayer();
  if (boardName === currentPlayer.name) {
    if (!currentPlayer.placingShips) {
      return false;
    } else {
      currentPlayer.placeShip(x, y);
      if (gameInPlay && !enemyPlayer.human) {
        aiTurn(enemyPlayer, currentPlayer);
      }
      return true;
    }
  }
  if (boardName === enemyPlayer.name && !currentPlayer.placingShips) {
    if ((_a = enemyPlayer.board.findTile(x, y)) == null ? void 0 : _a.hit)
      return false;
    currentPlayer.placeAttack(enemyPlayer, x, y);
    let isWinner = checkWinner();
    if (isWinner) {
      if (confirm(`${winner} won the game!
Play again?`) == true) {
        setupGame();
      } else
        alert("Okay, bye bye!");
    }
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
function getShipBeingPlaced() {
  const currentPlayer = getCurrentPlayer();
  if (currentPlayer && currentPlayer.placingShips)
    return currentPlayer.shipBeingPlaced;
}

// src/control.ts
var P1Frame = document.getElementById("P1Frame");
var P2Frame = document.getElementById("P2Frame");
function createTile(owner, tile) {
  var _a, _b;
  const newTile = document.createElement("div");
  newTile.id = `${owner}-${tile.x}-${tile.y}`;
  if (owner === "P1" && tile.occupied && !tile.hit) {
    newTile.className = "tile myship";
  } else if (tile.hit && !tile.occupied) {
    newTile.className = "tile miss";
    newTile.innerText = "x";
  } else if (tile.hit && tile.occupied) {
    newTile.className = "tile hit";
    newTile.innerText = "hit!";
  } else {
    newTile.className = "tile";
  }
  newTile.addEventListener("click", () => {
    if (gameInPlay) {
      handleClick(owner, tile.x, tile.y);
      refreshBoards();
      refreshHarbours();
    }
  });
  if (((_a = getCurrentPlayer()) == null ? void 0 : _a.placingShips) && owner === ((_b = getCurrentPlayer()) == null ? void 0 : _b.name)) {
    newTile.addEventListener("mouseenter", () => {
      shipShadow(owner, tile);
    });
    newTile.addEventListener("mouseleave", () => {
      removeShipShadow(owner, tile);
    });
  }
  return newTile;
}
function clickRef(idString) {
  const params = idString.split("-");
  return params;
}
function refreshTile(referenceTile) {
  const idArray = clickRef(referenceTile.id);
  const owner = idArray[0];
  const x = Number(idArray[1]);
  const y = Number(idArray[2]);
  if (owner === "P1") {
    const boardInfo = P1.board;
    const tileInfo = boardInfo.findTile(x, y);
    if (tileInfo == null ? void 0 : tileInfo.occupied) {
      referenceTile.className = "tile myship";
    } else {
      referenceTile.className = "tile";
    }
  }
}
function refreshBoards() {
  document.body.style.cursor = "none";
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
  document.body.style.cursor = "auto";
}
function refreshHarbours() {
  const P1Ships = getP1ShipsAvailable();
  const P2Ships = getP2ShipsAvailable();
  const P1Harbour = document.getElementById("P1Harbour");
  P1Harbour.innerHTML = "<h4>Harbour (ships to place)</h4>";
  const P2Harbour = document.getElementById("P2Harbour");
  P2Harbour.innerHTML = "<h4>Harbour</h4>";
  P1Ships.slice().reverse().forEach((ship) => {
    const newShipDiv = document.createElement("div");
    newShipDiv.innerText = `${ship.type} (${ship.size})`;
    if (ship === getShipBeingPlaced()) {
      newShipDiv.className = "harbourShip currentShip";
    } else {
      newShipDiv.className = "harbourShip";
    }
    P1Harbour.appendChild(newShipDiv);
  });
  P2Ships.slice().reverse().forEach((ship) => {
    const newShipDiv = document.createElement("div");
    newShipDiv.innerText = `${ship.type} (${ship.size})`;
    newShipDiv.className = "harbourShip";
    P2Harbour.appendChild(newShipDiv);
  });
}
function shipShadow(owner, hoverTile) {
  const shipToPlace = getShipBeingPlaced();
  const highlightArea = [];
  for (let index = 0; index < shipToPlace.size; index++) {
    const tileID = `${owner}-${hoverTile.x}-${hoverTile.y + index}`;
    const tileToHighlight = document.getElementById(tileID);
    if (tileToHighlight) {
      highlightArea.push(tileToHighlight);
    } else
      break;
  }
  if (highlightArea.length === shipToPlace.size) {
    highlightArea.forEach((highlightedTile) => {
      highlightedTile.className = "tile shadow";
    });
  }
}
function removeShipShadow(owner, hoverTile) {
  const shipToPlace = getShipBeingPlaced();
  const highlightArea = [];
  for (let index = 0; index < shipToPlace.size; index++) {
    const tileID = `${owner}-${hoverTile.x}-${hoverTile.y + index}`;
    const tileToHighlight = document.getElementById(tileID);
    if (tileToHighlight) {
      highlightArea.push(tileToHighlight);
    } else
      break;
  }
  highlightArea.forEach((highlightedTile) => {
    refreshTile(highlightedTile);
  });
}

// src/index.ts
setupGame();
refreshBoards();
refreshHarbours();
//# sourceMappingURL=out.js.map
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9haS50cyIsIi4uLy4uL3NyYy9zaGlwLnRzIiwiLi4vLi4vc3JjL2dhbWVib2FyZC50cyIsIi4uLy4uL3NyYy9wbGF5ZXIudHMiLCIuLi8uLi9zcmMvZ2FtZS50cyIsIi4uLy4uL3NyYy9jb250cm9sLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbIm5ld0NoZWNrZWRUaWxlIl0sIm1hcHBpbmdzIjoiO0FBRU8sU0FBUyxPQUFPLFVBQWtCLGNBQXNCO0FBQzNELE1BQUksU0FBUyxjQUFjO0FBQ3ZCLFVBQU0sYUFBYSxTQUFTLE1BQU0sZUFBZTtBQUNqRCxVQUFNLGVBQWUsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTTtBQUNqRSxVQUFNLFNBQVMsV0FBVyxZQUFZO0FBQ3RDLGFBQVMsVUFBVSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekMsV0FDUyxDQUFDLFNBQVMsY0FBYztBQUM3QixVQUFNLGFBQWEsYUFBYSxNQUFNLGNBQWM7QUFDcEQsVUFBTSxlQUFlLEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxXQUFXLE1BQU07QUFDakUsVUFBTSxTQUFTLFdBQVcsWUFBWTtBQUN0QyxhQUFTLFlBQVksY0FBYyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekQ7QUFDSjs7O0FDVk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQU1kLFlBQVksTUFBYyxNQUFjO0FBTHhDLGdCQUFlO0FBRWYsZ0JBQWU7QUFTZixTQUFPLFNBQVMsTUFBTTtBQUFFLGFBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxPQUFPO0FBQUEsSUFBTTtBQUxqRSxTQUFLLE9BQU87QUFDWixTQUFLLE9BQU87QUFDWixTQUFLLE1BQU0sT0FBTyxXQUFXO0FBQUEsRUFDakM7QUFBQSxFQUlPLFVBQVU7QUFDYixTQUFLO0FBQUEsRUFDVDtBQUNKOzs7QUNwQk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQUVkLFlBQ1csR0FDQSxHQUNBLFdBQW9CLE9BQ3BCLE1BQWUsT0FDZixTQUFrQjtBQUpsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQUEsRUFBb0I7QUFDbkM7QUFFTyxJQUFNLFlBQU4sTUFBZ0I7QUFBQSxFQUluQixZQUNJLE1BQ0Y7QUFMRixxQkFBb0IsQ0FBQztBQUNyQix1QkFBc0IsQ0FBQztBQUtuQixhQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sS0FBSztBQUMzQixlQUFTLElBQUksR0FBRyxJQUFJLE1BQU0sS0FBSztBQUMzQixhQUFLLFVBQVUsS0FBSyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7QUFBQSxNQUN0QztBQUFBLElBQ0o7QUFBQSxFQUNKO0FBQUEsRUFFQSxjQUFjLFdBQWlCLFVBQWtCO0FBQzdDLFVBQU0sZUFBZSxDQUFDO0FBQ3RCLFFBQUksY0FBb0I7QUFDeEIsUUFBSSxhQUFhLFdBQVcsR0FBRztBQUMzQixtQkFBYSxLQUFLLFdBQVc7QUFBQSxJQUNqQztBQUNBLFdBQU8sV0FBVyxhQUFhLFFBQVE7QUFDbkMsVUFBSSxpQkFBaUIsS0FBSyxVQUFVLEtBQUssQ0FBQ0Esb0JBQW1CQSxnQkFBZSxNQUFNLFlBQVksS0FBS0EsZ0JBQWUsTUFBTSxZQUFZLElBQUksQ0FBQztBQUN6SSxVQUFJLGdCQUFnQjtBQUNoQixzQkFBYztBQUNkLHFCQUFhLEtBQUssV0FBVztBQUFBLE1BQ2pDO0FBQU8sZUFBTyxDQUFDO0FBQUEsSUFDbkI7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUFBLEVBRU8sVUFBVSxNQUFjLE1BQWMsV0FBaUI7QUFDMUQsVUFBTSxnQkFBZ0IsS0FBSyxjQUFjLFdBQVcsSUFBSTtBQUN4RCxRQUFJLGNBQWMsV0FBVyxHQUFHO0FBQUUsYUFBTztBQUFBLElBQU0sV0FDdEMsY0FBYyxLQUFLLENBQUMsU0FBUyxLQUFLLFFBQVEsR0FBRztBQUFFLGFBQU87QUFBQSxJQUFNLE9BQ2hFO0FBQ0QsWUFBTSxjQUFjLElBQUksS0FBSyxNQUFNLElBQUk7QUFDdkMsb0JBQWMsUUFBUSxDQUFDLFNBQVM7QUFDNUIsYUFBSyxXQUFXO0FBQ2hCLGFBQUssVUFBVSxZQUFZO0FBQUEsTUFDL0IsQ0FBQztBQUNELFdBQUssWUFBWSxLQUFLLFdBQVc7QUFBQSxJQUNyQztBQUNBLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFTyxjQUFjLGNBQW9CO0FBQ3JDLFFBQUksYUFBYSxLQUFLO0FBQUUsYUFBTztBQUFBLElBQU0sV0FDNUIsYUFBYSxVQUFVO0FBQzVCLG1CQUFhLE1BQU07QUFDbkIsVUFBSSxhQUFhLFNBQVM7QUFDdEIsY0FBTSxlQUFlLEtBQUssZ0JBQWdCLGFBQWEsT0FBTztBQUM5RCxZQUFJO0FBQWMsdUJBQWEsUUFBUTtBQUFBLE1BQzNDO0FBQUEsSUFDSjtBQUNLLG1CQUFhLE1BQU07QUFDeEIsV0FBTztBQUFBLEVBQ1g7QUFBQSxFQUVPLFNBQVMsR0FBVyxHQUFXO0FBQ2xDLFdBQU8sS0FBSyxVQUFVLEtBQUssQ0FBQyxTQUFTLEtBQUssS0FBSyxLQUFLLEtBQUssS0FBSyxDQUFDO0FBQUEsRUFDbkU7QUFBQSxFQUVPLGdCQUFnQixXQUFtQjtBQUN0QyxVQUFNLFlBQVksS0FBSyxZQUFZLEtBQUssQ0FBQyxTQUFTLEtBQUssUUFBUSxTQUFTO0FBQ3hFLFdBQU87QUFBQSxFQUNYO0FBQUEsRUFFTyxpQkFBaUI7QUFDcEIsV0FBTyxLQUFLLFlBQVksTUFBTSxDQUFDLFNBQVMsS0FBSyxPQUFPLENBQUM7QUFBQSxFQUN6RDtBQUFBLEVBRU8sZ0JBQWdCO0FBQ25CLFdBQU8sS0FBSyxVQUFVLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHO0FBQUEsRUFDcEQ7QUFBQSxFQUVPLGlCQUFpQjtBQUNwQixXQUFPLEtBQUssVUFBVSxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssUUFBUTtBQUFBLEVBQ3pEO0FBQUEsRUFFTyxXQUFXLEdBQVcsR0FBVztBQUNwQyxVQUFNLFNBQVMsS0FBSyxTQUFTLEdBQUcsQ0FBQztBQUNqQyxRQUFJO0FBQVEsYUFBTyxXQUFXLE9BQU87QUFBQSxFQUN6QztBQUNKOzs7QUM1Rk8sSUFBTSxTQUFOLE1BQWE7QUFBQSxFQUdoQixZQUNXLE1BQ0EsUUFBaUIsTUFDakIsYUFBYSxNQUNiLGlCQUE4QixDQUFDLEVBQUUsTUFBTSxRQUFRLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxTQUFTLE1BQU0sRUFBRSxDQUFDLEdBQ3BGLFFBQVEsSUFBSSxVQUFVLENBQUMsR0FDdkIsZUFBZSxNQUN4QjtBQU5TO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVQLFNBQUssa0JBQWtCLEtBQUssZUFBZSxHQUFHLEVBQUU7QUFBQSxFQUNwRDtBQUFBLEVBRU8sWUFBWSxhQUFxQixHQUFXLEdBQVc7QUFDMUQsVUFBTSxTQUFTLFlBQVksTUFBTSxTQUFTLEdBQUcsQ0FBQztBQUM5QyxRQUFJLFVBQVUsQ0FBQyxPQUFPLEtBQUs7QUFDdkIsa0JBQVksTUFBTSxjQUFjLE1BQU07QUFDdEMsV0FBSyxhQUFhO0FBQ2xCLGtCQUFZLFFBQVE7QUFDcEIsYUFBTztBQUFBLElBQ1gsT0FDSztBQUNELGFBQU87QUFBQSxJQUNYO0FBQUEsRUFDSjtBQUFBLEVBRU8sVUFBVTtBQUNiLFNBQUssYUFBYTtBQUFBLEVBQ3RCO0FBQUEsRUFFTyxVQUFVLEdBQVcsR0FBVztBQUNuQyxRQUFJLEtBQUssY0FBYztBQUNuQixVQUFJLEtBQUssZUFBZSxXQUFXLEdBQUc7QUFDbEMsYUFBSyxrQkFBa0I7QUFDdkIsYUFBSyxlQUFlO0FBQ3BCLGVBQU87QUFBQSxNQUNYO0FBQ0EsWUFBTSxjQUFjLEtBQUs7QUFDekIsWUFBTSxTQUFTLEtBQUssTUFBTSxTQUFTLEdBQUcsQ0FBQztBQUN2QyxVQUFJLFVBQVUsZUFBZSxDQUFDLE9BQU8sVUFBVTtBQUMzQyxhQUFLLE1BQU0sVUFBVSxZQUFZLE1BQU0sWUFBWSxNQUFNLE1BQU07QUFDL0QsYUFBSyxlQUFlLElBQUk7QUFDeEIsWUFBSSxLQUFLLGVBQWUsV0FBVyxHQUFHO0FBQ2xDLGVBQUssa0JBQWtCO0FBQ3ZCLGVBQUssZUFBZTtBQUFBLFFBQ3hCO0FBQ0ssZUFBSyxrQkFBa0IsS0FBSyxlQUFlLEdBQUcsRUFBRTtBQUNyRCxlQUFPO0FBQUEsTUFDWDtBQUFBLElBQ0o7QUFDSyxhQUFPO0FBQUEsRUFDaEI7QUFDSjs7O0FDdERPLElBQUksS0FBYSxJQUFJLE9BQU8sSUFBSTtBQUNoQyxJQUFJLEtBQWEsSUFBSSxPQUFPLE1BQU0sT0FBTyxLQUFLO0FBQzlDLElBQUksU0FBUztBQUNiLElBQUksYUFBYTtBQUVqQixTQUFTLFlBQVk7QUFDeEIsT0FBSyxJQUFJLE9BQU8sSUFBSTtBQUNwQixPQUFLLElBQUksT0FBTyxNQUFNLE9BQU8sS0FBSztBQUNsQyxlQUFhO0FBQ2IsV0FBUztBQUNiO0FBRU8sSUFBTSxtQkFBbUIsTUFBTTtBQUNsQyxNQUFJLEdBQUcsY0FBYyxDQUFDLEdBQUcsWUFBWTtBQUFFLFdBQU87QUFBQSxFQUFHO0FBQ2pELE1BQUksR0FBRyxjQUFjLENBQUMsR0FBRyxZQUFZO0FBQUUsV0FBTztBQUFBLEVBQUc7QUFDckQ7QUFFQSxJQUFNLGlCQUFpQixNQUFNO0FBQ3pCLE1BQUksR0FBRyxjQUFjLENBQUMsR0FBRyxZQUFZO0FBQUUsV0FBTztBQUFBLEVBQUc7QUFDakQsTUFBSSxHQUFHLGNBQWMsQ0FBQyxHQUFHLFlBQVk7QUFBRSxXQUFPO0FBQUEsRUFBRztBQUNyRDtBQUVPLFNBQVMsc0JBQXNCO0FBQ2xDLFNBQU8sR0FBRztBQUNkO0FBRU8sU0FBUyxzQkFBc0I7QUFDbEMsU0FBTyxHQUFHO0FBQ2Q7QUFFTyxTQUFTLFlBQVksV0FBbUIsR0FBVyxHQUFXO0FBaENyRTtBQWlDSSxRQUFNLGdCQUF3QixpQkFBaUI7QUFDL0MsUUFBTSxjQUFzQixlQUFlO0FBQzNDLE1BQUksY0FBYyxjQUFjLE1BQU07QUFDbEMsUUFBSSxDQUFDLGNBQWMsY0FBYztBQUFFLGFBQU87QUFBQSxJQUFNLE9BQzNDO0FBQ0Qsb0JBQWMsVUFBVSxHQUFHLENBQUM7QUFDNUIsVUFBSSxjQUFjLENBQUMsWUFBWSxPQUFPO0FBQ2xDLGVBQU8sYUFBYSxhQUFhO0FBQUEsTUFDckM7QUFDQSxhQUFPO0FBQUEsSUFDWDtBQUFBLEVBQ0o7QUFDQSxNQUFJLGNBQWMsWUFBWSxRQUFRLENBQUMsY0FBYyxjQUFjO0FBQy9ELFNBQUksaUJBQVksTUFBTSxTQUFTLEdBQUcsQ0FBQyxNQUEvQixtQkFBa0M7QUFBSyxhQUFPO0FBQ2xELGtCQUFjLFlBQVksYUFBYSxHQUFHLENBQUM7QUFDM0MsUUFBSSxXQUFXLFlBQVk7QUFDM0IsUUFBSSxVQUFVO0FBQ1YsVUFBSSxRQUFRLEdBQUcsTUFBTTtBQUFBLFlBQTZCLEtBQUssTUFBTTtBQUN6RCxrQkFBVTtBQUFBLE1BQ2Q7QUFDSyxjQUFNLGdCQUFnQjtBQUFBLElBQy9CO0FBQ0EsUUFBSSxjQUFjLENBQUMsWUFBWSxPQUFPO0FBQ2xDLGFBQU8sYUFBYSxhQUFhO0FBQUEsSUFDckM7QUFDQSxXQUFPO0FBQUEsRUFDWDtBQUNKO0FBRUEsU0FBUyxjQUFjO0FBQ25CLE1BQUksQ0FBQyxHQUFHLE1BQU0sZUFBZSxLQUFLLENBQUMsR0FBRyxNQUFNLGVBQWUsR0FBRztBQUMxRCxpQkFBYTtBQUNiLFdBQU87QUFBQSxFQUNYLFdBQ1MsR0FBRyxNQUFNLGVBQWUsTUFBTSxNQUFNO0FBQ3pDLGFBQVMsR0FBRztBQUNaLGlCQUFhO0FBQ2IsV0FBTztBQUFBLEVBQ1gsV0FDUyxHQUFHLE1BQU0sZUFBZSxNQUFNLE1BQU07QUFDekMsYUFBUyxHQUFHO0FBQ1osaUJBQWE7QUFDYixXQUFPO0FBQUEsRUFDWCxPQUNLO0FBQ0QsaUJBQWE7QUFDYixXQUFPO0FBQUEsRUFDWDtBQUNKO0FBRU8sU0FBUyxhQUFhO0FBQ3pCLFNBQU8sR0FBRyxNQUFNO0FBQ3BCO0FBRU8sU0FBUyxhQUFhO0FBQ3pCLFNBQU8sR0FBRyxNQUFNO0FBQ3BCO0FBRU8sU0FBUyxxQkFBcUI7QUFDakMsUUFBTSxnQkFBZ0IsaUJBQWlCO0FBQ3ZDLE1BQUksaUJBQWlCLGNBQWM7QUFBYyxXQUFPLGNBQWM7QUFDMUU7OztBQ3pGQSxJQUFNLFVBQVUsU0FBUyxlQUFlLFNBQVM7QUFDakQsSUFBTSxVQUFVLFNBQVMsZUFBZSxTQUFTO0FBRWpELFNBQVMsV0FBVyxPQUFlLE1BQVk7QUFSL0M7QUFTSSxRQUFNLFVBQVUsU0FBUyxjQUFjLEtBQUs7QUFDNUMsVUFBUSxLQUFLLEdBQUcsS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQztBQUN6QyxNQUFJLFVBQVUsUUFBUSxLQUFLLFlBQVksQ0FBQyxLQUFLLEtBQUs7QUFDOUMsWUFBUSxZQUFZO0FBQUEsRUFDeEIsV0FDUyxLQUFLLE9BQU8sQ0FBQyxLQUFLLFVBQVU7QUFDakMsWUFBUSxZQUFZO0FBQ3BCLFlBQVEsWUFBWTtBQUFBLEVBQ3hCLFdBQ1MsS0FBSyxPQUFPLEtBQUssVUFBVTtBQUNoQyxZQUFRLFlBQVk7QUFDcEIsWUFBUSxZQUFZO0FBQUEsRUFDeEIsT0FDSztBQUNELFlBQVEsWUFBWTtBQUFBLEVBQ3hCO0FBQ0EsVUFBUSxpQkFBaUIsU0FBUyxNQUFNO0FBQ3BDLFFBQVMsWUFBWTtBQUNqQixNQUFLLFlBQVksT0FBTyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3RDLG9CQUFjO0FBQ2Qsc0JBQWdCO0FBQUEsSUFDcEI7QUFBQSxFQUNKLENBQUM7QUFDRCxRQUFJLEtBQUssaUJBQWlCLE1BQXRCLG1CQUF5QixpQkFBZ0IsWUFBVSxLQUFLLGlCQUFpQixNQUF0QixtQkFBeUIsT0FBTTtBQUNsRixZQUFRLGlCQUFpQixjQUFjLE1BQU07QUFDekMsaUJBQVcsT0FBTyxJQUFJO0FBQUEsSUFDMUIsQ0FBQztBQUNELFlBQVEsaUJBQWlCLGNBQWMsTUFBTTtBQUN6Qyx1QkFBaUIsT0FBTyxJQUFJO0FBQUEsSUFDaEMsQ0FBQztBQUFBLEVBQ0w7QUFDQSxTQUFPO0FBQ1g7QUFFQSxTQUFTLFNBQVMsVUFBa0I7QUFDaEMsUUFBTSxTQUFTLFNBQVMsTUFBTSxHQUFHO0FBQ2pDLFNBQU87QUFDWDtBQUVBLFNBQVMsWUFBWSxlQUE0QjtBQUM3QyxRQUFNLFVBQVUsU0FBUyxjQUFjLEVBQUU7QUFDekMsUUFBTSxRQUFRLFFBQVEsQ0FBQztBQUN2QixRQUFNLElBQUksT0FBTyxRQUFRLENBQUMsQ0FBQztBQUMzQixRQUFNLElBQUksT0FBTyxRQUFRLENBQUMsQ0FBQztBQUMzQixNQUFJLFVBQVUsTUFBTTtBQUNoQixVQUFNLFlBQWlCLEdBQUc7QUFDMUIsVUFBTSxXQUFXLFVBQVUsU0FBUyxHQUFHLENBQUM7QUFDeEMsUUFBSSxxQ0FBVSxVQUFVO0FBQ3BCLG9CQUFjLFlBQVk7QUFBQSxJQUM5QixPQUFPO0FBQUUsb0JBQWMsWUFBWTtBQUFBLElBQU87QUFBQSxFQUM5QztBQUVKO0FBRU8sU0FBUyxnQkFBZ0I7QUFDNUIsV0FBUyxLQUFLLE1BQU0sU0FBUztBQUU3QixRQUFNLFVBQWUsV0FBVztBQUNoQyxRQUFNLFVBQWUsV0FBVztBQUdoQyxVQUFRLFlBQVk7QUFDcEIsVUFBUSxRQUFRLFVBQVE7QUFDcEIsVUFBTSxVQUFVLFdBQVcsTUFBTSxJQUFJO0FBQ3JDLFlBQVEsWUFBWSxPQUFPO0FBQUEsRUFDL0IsQ0FBQztBQUdELFVBQVEsWUFBWTtBQUNwQixVQUFRLFFBQVEsVUFBUTtBQUNwQixVQUFNLFVBQVUsV0FBVyxNQUFNLElBQUk7QUFDckMsWUFBUSxZQUFZLE9BQU87QUFBQSxFQUMvQixDQUFDO0FBQ0QsV0FBUyxLQUFLLE1BQU0sU0FBUztBQUVqQztBQUVPLFNBQVMsa0JBQWtCO0FBQzlCLFFBQU0sVUFBZSxvQkFBb0I7QUFDekMsUUFBTSxVQUFlLG9CQUFvQjtBQUN6QyxRQUFNLFlBQVksU0FBUyxlQUFlLFdBQVc7QUFDckQsWUFBVSxZQUFZO0FBQ3RCLFFBQU0sWUFBWSxTQUFTLGVBQWUsV0FBVztBQUNyRCxZQUFVLFlBQVk7QUFDdEIsVUFBUSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQ3hDLFVBQU0sYUFBYSxTQUFTLGNBQWMsS0FBSztBQUMvQyxlQUFXLFlBQVksR0FBRyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUk7QUFDakQsUUFBSSxTQUFjLG1CQUFtQixHQUFHO0FBQ3BDLGlCQUFXLFlBQVk7QUFBQSxJQUMzQixPQUNLO0FBQ0QsaUJBQVcsWUFBWTtBQUFBLElBQzNCO0FBQ0EsY0FBVSxZQUFZLFVBQVU7QUFBQSxFQUNwQyxDQUFDO0FBQ0QsVUFBUSxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxTQUFTO0FBQ3hDLFVBQU0sYUFBYSxTQUFTLGNBQWMsS0FBSztBQUMvQyxlQUFXLFlBQVksR0FBRyxLQUFLLElBQUksS0FBSyxLQUFLLElBQUk7QUFDakQsZUFBVyxZQUFZO0FBQ3ZCLGNBQVUsWUFBWSxVQUFVO0FBQUEsRUFDcEMsQ0FBQztBQUNMO0FBRUEsU0FBUyxXQUFXLE9BQWUsV0FBaUI7QUFDaEQsUUFBTSxjQUFtQixtQkFBbUI7QUFDNUMsUUFBTSxnQkFBK0IsQ0FBQztBQUN0QyxXQUFTLFFBQVEsR0FBRyxRQUFRLFlBQVksTUFBTSxTQUFTO0FBQ25ELFVBQU0sU0FBUyxHQUFHLEtBQUssSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLElBQUksS0FBSztBQUM3RCxVQUFNLGtCQUFrQixTQUFTLGVBQWUsTUFBTTtBQUN0RCxRQUFJLGlCQUFpQjtBQUFFLG9CQUFjLEtBQUssZUFBZTtBQUFBLElBQUU7QUFDdEQ7QUFBQSxFQUNUO0FBQ0EsTUFBSSxjQUFjLFdBQVcsWUFBWSxNQUFNO0FBQzNDLGtCQUFjLFFBQVEsQ0FBQyxvQkFBb0I7QUFDdkMsc0JBQWdCLFlBQVk7QUFBQSxJQUNoQyxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBRUEsU0FBUyxpQkFBaUIsT0FBZSxXQUFpQjtBQUN0RCxRQUFNLGNBQW1CLG1CQUFtQjtBQUM1QyxRQUFNLGdCQUErQixDQUFDO0FBQ3RDLFdBQVMsUUFBUSxHQUFHLFFBQVEsWUFBWSxNQUFNLFNBQVM7QUFDbkQsVUFBTSxTQUFTLEdBQUcsS0FBSyxJQUFJLFVBQVUsQ0FBQyxJQUFJLFVBQVUsSUFBSSxLQUFLO0FBQzdELFVBQU0sa0JBQWtCLFNBQVMsZUFBZSxNQUFNO0FBQ3RELFFBQUksaUJBQWlCO0FBQUUsb0JBQWMsS0FBSyxlQUFlO0FBQUEsSUFBRTtBQUN0RDtBQUFBLEVBQ1Q7QUFDQSxnQkFBYyxRQUFRLENBQUMsb0JBQW9CO0FBQ3ZDLGdCQUFZLGVBQWU7QUFBQSxFQUMvQixDQUFDO0FBQ0w7OztBQ3pJQSxVQUFVO0FBQ04sY0FBYztBQUNkLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXllciB9IGZyb20gJy4vcGxheWVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFpVHVybihhaVBsYXllcjogUGxheWVyLCB0YXJnZXRQbGF5ZXI6IFBsYXllcikge1xuICAgIGlmIChhaVBsYXllci5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgY29uc3QgbGVnYWxNb3ZlcyA9IGFpUGxheWVyLmJvYXJkLmdldFZhY2FudFRpbGVzKClcbiAgICAgICAgY29uc3QgY2hvb3NlVGFyZ2V0ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVnYWxNb3Zlcy5sZW5ndGgpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBsZWdhbE1vdmVzW2Nob29zZVRhcmdldF1cbiAgICAgICAgYWlQbGF5ZXIucGxhY2VTaGlwKHRhcmdldC54LCB0YXJnZXQueSlcbiAgICB9XG4gICAgZWxzZSBpZiAoIWFpUGxheWVyLnBsYWNpbmdTaGlwcykge1xuICAgICAgICBjb25zdCBsZWdhbE1vdmVzID0gdGFyZ2V0UGxheWVyLmJvYXJkLmdldFVuaGl0VGlsZXMoKVxuICAgICAgICBjb25zdCBjaG9vc2VUYXJnZXQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZWdhbE1vdmVzLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxlZ2FsTW92ZXNbY2hvb3NlVGFyZ2V0XVxuICAgICAgICBhaVBsYXllci5wbGFjZUF0dGFjayh0YXJnZXRQbGF5ZXIsIHRhcmdldC54LCB0YXJnZXQueSlcbiAgICB9XG59IiwiZXhwb3J0IGludGVyZmFjZSBzaGlwUHJvcHMge1xuICAgIHR5cGU6IHN0cmluZyxcbiAgICBzaXplOiBudW1iZXIsXG59XG5cbmV4cG9ydCBjbGFzcyBTaGlwIHtcbiAgICB0eXBlOiBzdHJpbmcgPSAnc21hbGwnXG4gICAgc2l6ZTogbnVtYmVyXG4gICAgaGl0czogbnVtYmVyID0gMFxuICAgIGtleVxuXG4gICAgY29uc3RydWN0b3IodHlwZTogc3RyaW5nLCBzaXplOiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZTtcbiAgICAgICAgdGhpcy5rZXkgPSBjcnlwdG8ucmFuZG9tVVVJRCgpXG4gICAgfVxuXG4gICAgcHVibGljIGlzU3VuayA9ICgpID0+IHsgcmV0dXJuIHRoaXMuaGl0cyA+PSB0aGlzLnNpemUgPyB0cnVlIDogZmFsc2UgfTtcblxuICAgIHB1YmxpYyB0YWtlSGl0KCkge1xuICAgICAgICB0aGlzLmhpdHMrK1xuICAgIH1cbn0iLCJpbXBvcnQgeyBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiXG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgeDogbnVtYmVyLFxuICAgICAgICBwdWJsaWMgeTogbnVtYmVyLFxuICAgICAgICBwdWJsaWMgb2NjdXBpZWQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgcHVibGljIGhpdDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBwdWJsaWMgc2hpcEtleT86IHN0cmluZykgeyB9XG59XG5cbmV4cG9ydCBjbGFzcyBHYW1lQm9hcmQge1xuICAgIGdhbWVCb2FyZDogVGlsZVtdID0gW11cbiAgICBhY3RpdmVTaGlwczogU2hpcFtdID0gW11cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBzaXplOiBudW1iZXJcbiAgICApIHtcbiAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBzaXplOyB4KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgc2l6ZTsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nYW1lQm9hcmQucHVzaChuZXcgVGlsZSh4LCB5KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBsYWNlbWVudEdyaWQoc3RhcnRUaWxlOiBUaWxlLCBzaGlwU2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRpbGVzVG9DaGVjayA9IFtdXG4gICAgICAgIGxldCBjdXJyZW50VGlsZTogVGlsZSA9IHN0YXJ0VGlsZVxuICAgICAgICBpZiAodGlsZXNUb0NoZWNrLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGlsZXNUb0NoZWNrLnB1c2goY3VycmVudFRpbGUpXG4gICAgICAgIH1cbiAgICAgICAgd2hpbGUgKHNoaXBTaXplID4gdGlsZXNUb0NoZWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IG5ld0NoZWNrZWRUaWxlID0gdGhpcy5nYW1lQm9hcmQuZmluZCgobmV3Q2hlY2tlZFRpbGUpID0+IG5ld0NoZWNrZWRUaWxlLnggPT09IGN1cnJlbnRUaWxlLnggJiYgbmV3Q2hlY2tlZFRpbGUueSA9PT0gY3VycmVudFRpbGUueSArIDEpO1xuICAgICAgICAgICAgaWYgKG5ld0NoZWNrZWRUaWxlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFRpbGUgPSBuZXdDaGVja2VkVGlsZVxuICAgICAgICAgICAgICAgIHRpbGVzVG9DaGVjay5wdXNoKGN1cnJlbnRUaWxlKVxuICAgICAgICAgICAgfSBlbHNlIHJldHVybiBbXVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aWxlc1RvQ2hlY2s7XG4gICAgfVxuXG4gICAgcHVibGljIHBsYWNlU2hpcCh0eXBlOiBzdHJpbmcsIHNpemU6IG51bWJlciwgc3RhcnRUaWxlOiBUaWxlKSB7XG4gICAgICAgIGNvbnN0IHBsYWNlbWVudEFyZWEgPSB0aGlzLnBsYWNlbWVudEdyaWQoc3RhcnRUaWxlLCBzaXplKVxuICAgICAgICBpZiAocGxhY2VtZW50QXJlYS5sZW5ndGggPT09IDApIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSBpZiAocGxhY2VtZW50QXJlYS5zb21lKCh0aWxlKSA9PiB0aWxlLm9jY3VwaWVkKSkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gbmV3IFNoaXAodHlwZSwgc2l6ZSlcbiAgICAgICAgICAgIHBsYWNlbWVudEFyZWEuZm9yRWFjaCgodGlsZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRpbGUub2NjdXBpZWQgPSB0cnVlXG4gICAgICAgICAgICAgICAgdGlsZS5zaGlwS2V5ID0gc2hpcFRvUGxhY2Uua2V5XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgdGhpcy5hY3RpdmVTaGlwcy5wdXNoKHNoaXBUb1BsYWNlKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyByZWNlaXZlQXR0YWNrKGF0dGFja2VkVGlsZTogVGlsZSkge1xuICAgICAgICBpZiAoYXR0YWNrZWRUaWxlLmhpdCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBlbHNlIGlmIChhdHRhY2tlZFRpbGUub2NjdXBpZWQpIHtcbiAgICAgICAgICAgIGF0dGFja2VkVGlsZS5oaXQgPSB0cnVlXG4gICAgICAgICAgICBpZiAoYXR0YWNrZWRUaWxlLnNoaXBLZXkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhdHRhY2tlZFNoaXAgPSB0aGlzLmZpbmRTaGlwRnJvbUtleShhdHRhY2tlZFRpbGUuc2hpcEtleSlcbiAgICAgICAgICAgICAgICBpZiAoYXR0YWNrZWRTaGlwKSBhdHRhY2tlZFNoaXAudGFrZUhpdCgpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBhdHRhY2tlZFRpbGUuaGl0ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cblxuICAgIHB1YmxpYyBmaW5kVGlsZSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICByZXR1cm4gdGhpcy5nYW1lQm9hcmQuZmluZCgodGlsZSkgPT4gdGlsZS54ID09IHggJiYgdGlsZS55ID09IHkpXG4gICAgfVxuXG4gICAgcHVibGljIGZpbmRTaGlwRnJvbUtleShrZXlUb0ZpbmQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBmb3VuZFNoaXAgPSB0aGlzLmFjdGl2ZVNoaXBzLmZpbmQoKHNoaXApID0+IHNoaXAua2V5ID09PSBrZXlUb0ZpbmQpXG4gICAgICAgIHJldHVybiBmb3VuZFNoaXBcbiAgICB9XG5cbiAgICBwdWJsaWMgY2hlY2tJZkFsbFN1bmsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRVbmhpdFRpbGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nYW1lQm9hcmQuZmlsdGVyKCh0aWxlKSA9PiAhdGlsZS5oaXQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWNhbnRUaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbHRlcigodGlsZSkgPT4gIXRpbGUub2NjdXBpZWQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBpc09jY3VwaWVkKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuZmluZFRpbGUoeCwgeSlcbiAgICAgICAgaWYgKHRhcmdldCkgdGFyZ2V0Lm9jY3VwaWVkID8gdHJ1ZSA6IGZhbHNlXG4gICAgfVxufSIsImltcG9ydCB7IEdhbWVCb2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgc2hpcFByb3BzLCBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBzaGlwQmVpbmdQbGFjZWQ/OiBzaGlwUHJvcHNcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgaHVtYW46IGJvb2xlYW4gPSB0cnVlLFxuICAgICAgICBwdWJsaWMgdGFraW5nVHVybiA9IHRydWUsXG4gICAgICAgIHB1YmxpYyBzaGlwc0F2YWlsYWJsZTogc2hpcFByb3BzW10gPSBbeyB0eXBlOiAndGlueScsIHNpemU6IDEgfSwgeyB0eXBlOiAnc21hbGwnLCBzaXplOiAyIH1dLFxuICAgICAgICBwdWJsaWMgYm9hcmQgPSBuZXcgR2FtZUJvYXJkKDkpLFxuICAgICAgICBwdWJsaWMgcGxhY2luZ1NoaXBzID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5zaGlwQmVpbmdQbGFjZWQgPSB0aGlzLnNoaXBzQXZhaWxhYmxlLmF0KC0xKVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZUF0dGFjayhlbmVteVBsYXllcjogUGxheWVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlbmVteVBsYXllci5ib2FyZC5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGFyZ2V0ICYmICF0YXJnZXQuaGl0KSB7XG4gICAgICAgICAgICBlbmVteVBsYXllci5ib2FyZC5yZWNlaXZlQXR0YWNrKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnRha2luZ1R1cm4gPSBmYWxzZVxuICAgICAgICAgICAgZW5lbXlQbGF5ZXIuc2V0VHVybigpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VHVybigpIHtcbiAgICAgICAgdGhpcy50YWtpbmdUdXJuID0gdHJ1ZVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZVNoaXAoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaGlwc0F2YWlsYWJsZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gdGhpcy5zaGlwQmVpbmdQbGFjZWRcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYm9hcmQuZmluZFRpbGUoeCwgeSlcbiAgICAgICAgICAgIGlmICh0YXJnZXQgJiYgc2hpcFRvUGxhY2UgJiYgIXRhcmdldC5vY2N1cGllZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucGxhY2VTaGlwKHNoaXBUb1BsYWNlLnR5cGUsIHNoaXBUb1BsYWNlLnNpemUsIHRhcmdldClcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBzQXZhaWxhYmxlLnBvcCgpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hpcHNBdmFpbGFibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHRoaXMuc2hpcHNBdmFpbGFibGUuYXQoLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHJldHVybiBmYWxzZVxuICAgIH1cbn0iLCJpbXBvcnQgeyBhaVR1cm4gfSBmcm9tIFwiLi9haVwiO1xuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5leHBvcnQgbGV0IFAxOiBQbGF5ZXIgPSBuZXcgUGxheWVyKFwiUDFcIilcbmV4cG9ydCBsZXQgUDI6IFBsYXllciA9IG5ldyBQbGF5ZXIoXCJQMlwiLCBmYWxzZSwgZmFsc2UpXG5leHBvcnQgbGV0IHdpbm5lciA9IFwiVEJDXCJcbmV4cG9ydCBsZXQgZ2FtZUluUGxheSA9IHRydWVcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwR2FtZSgpIHtcbiAgICBQMSA9IG5ldyBQbGF5ZXIoXCJQMVwiKVxuICAgIFAyID0gbmV3IFBsYXllcihcIlAyXCIsIGZhbHNlLCBmYWxzZSlcbiAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuICAgIHdpbm5lciA9IFwiVEJDXCJcbn1cblxuZXhwb3J0IGNvbnN0IGdldEN1cnJlbnRQbGF5ZXIgPSAoKSA9PiB7XG4gICAgaWYgKFAxLnRha2luZ1R1cm4gJiYgIVAyLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAxIH1cbiAgICBpZiAoUDIudGFraW5nVHVybiAmJiAhUDEudGFraW5nVHVybikgeyByZXR1cm4gUDIgfVxufVxuXG5jb25zdCBnZXRFbmVteVBsYXllciA9ICgpID0+IHtcbiAgICBpZiAoUDEudGFraW5nVHVybiAmJiAhUDIudGFraW5nVHVybikgeyByZXR1cm4gUDIgfVxuICAgIGlmIChQMi50YWtpbmdUdXJuICYmICFQMS50YWtpbmdUdXJuKSB7IHJldHVybiBQMSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMVNoaXBzQXZhaWxhYmxlKCkge1xuICAgIHJldHVybiBQMS5zaGlwc0F2YWlsYWJsZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDJTaGlwc0F2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gUDIuc2hpcHNBdmFpbGFibGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhbmRsZUNsaWNrKGJvYXJkTmFtZTogc3RyaW5nLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXI6IFBsYXllciA9IGdldEN1cnJlbnRQbGF5ZXIoKSBhcyBQbGF5ZXJcbiAgICBjb25zdCBlbmVteVBsYXllcjogUGxheWVyID0gZ2V0RW5lbXlQbGF5ZXIoKSBhcyBQbGF5ZXJcbiAgICBpZiAoYm9hcmROYW1lID09PSBjdXJyZW50UGxheWVyLm5hbWUpIHtcbiAgICAgICAgaWYgKCFjdXJyZW50UGxheWVyLnBsYWNpbmdTaGlwcykgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2VTaGlwKHgsIHkpXG4gICAgICAgICAgICBpZiAoZ2FtZUluUGxheSAmJiAhZW5lbXlQbGF5ZXIuaHVtYW4pIHtcbiAgICAgICAgICAgICAgICBhaVR1cm4oZW5lbXlQbGF5ZXIsIGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChib2FyZE5hbWUgPT09IGVuZW15UGxheWVyLm5hbWUgJiYgIWN1cnJlbnRQbGF5ZXIucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgIGlmIChlbmVteVBsYXllci5ib2FyZC5maW5kVGlsZSh4LCB5KT8uaGl0KSByZXR1cm4gZmFsc2VcbiAgICAgICAgY3VycmVudFBsYXllci5wbGFjZUF0dGFjayhlbmVteVBsYXllciwgeCwgeSlcbiAgICAgICAgbGV0IGlzV2lubmVyID0gY2hlY2tXaW5uZXIoKVxuICAgICAgICBpZiAoaXNXaW5uZXIpIHtcbiAgICAgICAgICAgIGlmIChjb25maXJtKGAke3dpbm5lcn0gd29uIHRoZSBnYW1lIVxcblBsYXkgYWdhaW4/YCkgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHNldHVwR2FtZSgpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGFsZXJ0KCdPa2F5LCBieWUgYnllIScpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVJblBsYXkgJiYgIWVuZW15UGxheWVyLmh1bWFuKSB7XG4gICAgICAgICAgICBhaVR1cm4oZW5lbXlQbGF5ZXIsIGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrV2lubmVyKCkge1xuICAgIGlmICghUDEuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSAmJiAhUDIuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSkge1xuICAgICAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgZWxzZSBpZiAoUDEuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSA9PT0gdHJ1ZSkge1xuICAgICAgICB3aW5uZXIgPSBQMi5uYW1lXG4gICAgICAgIGdhbWVJblBsYXkgPSBmYWxzZVxuICAgICAgICByZXR1cm4gd2lubmVyXG4gICAgfVxuICAgIGVsc2UgaWYgKFAyLmJvYXJkLmNoZWNrSWZBbGxTdW5rKCkgPT09IHRydWUpIHtcbiAgICAgICAgd2lubmVyID0gUDEubmFtZVxuICAgICAgICBnYW1lSW5QbGF5ID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHdpbm5lclxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2FtZUluUGxheSA9IHRydWVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDFCb2FyZCgpIHtcbiAgICByZXR1cm4gUDEuYm9hcmQuZ2FtZUJvYXJkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMkJvYXJkKCkge1xuICAgIHJldHVybiBQMi5ib2FyZC5nYW1lQm9hcmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNoaXBCZWluZ1BsYWNlZCgpIHtcbiAgICBjb25zdCBjdXJyZW50UGxheWVyID0gZ2V0Q3VycmVudFBsYXllcigpXG4gICAgaWYgKGN1cnJlbnRQbGF5ZXIgJiYgY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHJldHVybiBjdXJyZW50UGxheWVyLnNoaXBCZWluZ1BsYWNlZFxufSIsImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgVGlsZSB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgc2hpcFByb3BzIH0gZnJvbSBcIi4vc2hpcFwiO1xuXG5cbmNvbnN0IFAxRnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxRnJhbWVcIikgYXMgSFRNTERpdkVsZW1lbnRcbmNvbnN0IFAyRnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyRnJhbWVcIikgYXMgSFRNTERpdkVsZW1lbnRcblxuZnVuY3Rpb24gY3JlYXRlVGlsZShvd25lcjogc3RyaW5nLCB0aWxlOiBUaWxlKSB7XG4gICAgY29uc3QgbmV3VGlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgbmV3VGlsZS5pZCA9IGAke293bmVyfS0ke3RpbGUueH0tJHt0aWxlLnl9YFxuICAgIGlmIChvd25lciA9PT0gXCJQMVwiICYmIHRpbGUub2NjdXBpZWQgJiYgIXRpbGUuaGl0KSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG15c2hpcFwiXG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbGUuaGl0ICYmICF0aWxlLm9jY3VwaWVkKSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG1pc3NcIlxuICAgICAgICBuZXdUaWxlLmlubmVyVGV4dCA9IFwieFwiXG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbGUuaGl0ICYmIHRpbGUub2NjdXBpZWQpIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGUgaGl0XCJcbiAgICAgICAgbmV3VGlsZS5pbm5lclRleHQgPSBcImhpdCFcIlxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGVcIlxuICAgIH1cbiAgICBuZXdUaWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZiAoZ2FtZS5nYW1lSW5QbGF5KSB7XG4gICAgICAgICAgICBnYW1lLmhhbmRsZUNsaWNrKG93bmVyLCB0aWxlLngsIHRpbGUueSlcbiAgICAgICAgICAgIHJlZnJlc2hCb2FyZHMoKVxuICAgICAgICAgICAgcmVmcmVzaEhhcmJvdXJzKClcbiAgICAgICAgfVxuICAgIH0pXG4gICAgaWYgKGdhbWUuZ2V0Q3VycmVudFBsYXllcigpPy5wbGFjaW5nU2hpcHMgJiYgb3duZXIgPT09IGdhbWUuZ2V0Q3VycmVudFBsYXllcigpPy5uYW1lKSB7XG4gICAgICAgIG5ld1RpbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcbiAgICAgICAgICAgIHNoaXBTaGFkb3cob3duZXIsIHRpbGUpXG4gICAgICAgIH0pXG4gICAgICAgIG5ld1RpbGUuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcbiAgICAgICAgICAgIHJlbW92ZVNoaXBTaGFkb3cob3duZXIsIHRpbGUpXG4gICAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBuZXdUaWxlXG59XG5cbmZ1bmN0aW9uIGNsaWNrUmVmKGlkU3RyaW5nOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwYXJhbXMgPSBpZFN0cmluZy5zcGxpdCgnLScpXG4gICAgcmV0dXJuIHBhcmFtc1xufVxuXG5mdW5jdGlvbiByZWZyZXNoVGlsZShyZWZlcmVuY2VUaWxlOiBIVE1MRWxlbWVudCkge1xuICAgIGNvbnN0IGlkQXJyYXkgPSBjbGlja1JlZihyZWZlcmVuY2VUaWxlLmlkKVxuICAgIGNvbnN0IG93bmVyID0gaWRBcnJheVswXVxuICAgIGNvbnN0IHggPSBOdW1iZXIoaWRBcnJheVsxXSlcbiAgICBjb25zdCB5ID0gTnVtYmVyKGlkQXJyYXlbMl0pXG4gICAgaWYgKG93bmVyID09PSAnUDEnKSB7XG4gICAgICAgIGNvbnN0IGJvYXJkSW5mbyA9IGdhbWUuUDEuYm9hcmRcbiAgICAgICAgY29uc3QgdGlsZUluZm8gPSBib2FyZEluZm8uZmluZFRpbGUoeCwgeSlcbiAgICAgICAgaWYgKHRpbGVJbmZvPy5vY2N1cGllZCkge1xuICAgICAgICAgICAgcmVmZXJlbmNlVGlsZS5jbGFzc05hbWUgPSBcInRpbGUgbXlzaGlwXCJcbiAgICAgICAgfSBlbHNlIHsgcmVmZXJlbmNlVGlsZS5jbGFzc05hbWUgPSBcInRpbGVcIiB9XG4gICAgfVxuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoQm9hcmRzKCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ25vbmUnO1xuXG4gICAgY29uc3QgUDFCb2FyZCA9IGdhbWUuZ2V0UDFCb2FyZCgpXG4gICAgY29uc3QgUDJCb2FyZCA9IGdhbWUuZ2V0UDJCb2FyZCgpXG5cbiAgICAvLyBjcmVhdGUgRE9NIGVsZW1lbnRzIGZvciBQMSBib2FyZFxuICAgIFAxRnJhbWUuaW5uZXJIVE1MID0gJydcbiAgICBQMUJvYXJkLmZvckVhY2godGlsZSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBjcmVhdGVUaWxlKFwiUDFcIiwgdGlsZSlcbiAgICAgICAgUDFGcmFtZS5hcHBlbmRDaGlsZChuZXdUaWxlKVxuICAgIH0pXG5cbiAgICAvLyBjcmVhdGUgRE9NIGVsZW1lbnRzIGZvciBQMiBib2FyZFxuICAgIFAyRnJhbWUuaW5uZXJIVE1MID0gJydcbiAgICBQMkJvYXJkLmZvckVhY2godGlsZSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1RpbGUgPSBjcmVhdGVUaWxlKFwiUDJcIiwgdGlsZSlcbiAgICAgICAgUDJGcmFtZS5hcHBlbmRDaGlsZChuZXdUaWxlKVxuICAgIH0pXG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnYXV0byc7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnJlc2hIYXJib3VycygpIHtcbiAgICBjb25zdCBQMVNoaXBzID0gZ2FtZS5nZXRQMVNoaXBzQXZhaWxhYmxlKClcbiAgICBjb25zdCBQMlNoaXBzID0gZ2FtZS5nZXRQMlNoaXBzQXZhaWxhYmxlKClcbiAgICBjb25zdCBQMUhhcmJvdXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxSGFyYm91clwiKSBhcyBIVE1MRGl2RWxlbWVudFxuICAgIFAxSGFyYm91ci5pbm5lckhUTUwgPSAnPGg0PkhhcmJvdXIgKHNoaXBzIHRvIHBsYWNlKTwvaDQ+J1xuICAgIGNvbnN0IFAySGFyYm91ciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJIYXJib3VyXCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICAgUDJIYXJib3VyLmlubmVySFRNTCA9ICc8aDQ+SGFyYm91cjwvaDQ+J1xuICAgIFAxU2hpcHMuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgbmV3U2hpcERpdi5pbm5lclRleHQgPSBgJHtzaGlwLnR5cGV9ICgke3NoaXAuc2l6ZX0pYFxuICAgICAgICBpZiAoc2hpcCA9PT0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSkge1xuICAgICAgICAgICAgbmV3U2hpcERpdi5jbGFzc05hbWUgPSBcImhhcmJvdXJTaGlwIGN1cnJlbnRTaGlwXCJcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5ld1NoaXBEaXYuY2xhc3NOYW1lID0gXCJoYXJib3VyU2hpcFwiXG4gICAgICAgIH1cbiAgICAgICAgUDFIYXJib3VyLmFwcGVuZENoaWxkKG5ld1NoaXBEaXYpXG4gICAgfSlcbiAgICBQMlNoaXBzLnNsaWNlKCkucmV2ZXJzZSgpLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgY29uc3QgbmV3U2hpcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIG5ld1NoaXBEaXYuaW5uZXJUZXh0ID0gYCR7c2hpcC50eXBlfSAoJHtzaGlwLnNpemV9KWBcbiAgICAgICAgbmV3U2hpcERpdi5jbGFzc05hbWUgPSBcImhhcmJvdXJTaGlwXCJcbiAgICAgICAgUDJIYXJib3VyLmFwcGVuZENoaWxkKG5ld1NoaXBEaXYpXG4gICAgfSlcbn1cblxuZnVuY3Rpb24gc2hpcFNoYWRvdyhvd25lcjogc3RyaW5nLCBob3ZlclRpbGU6IFRpbGUpIHtcbiAgICBjb25zdCBzaGlwVG9QbGFjZSA9IGdhbWUuZ2V0U2hpcEJlaW5nUGxhY2VkKCkgYXMgc2hpcFByb3BzXG4gICAgY29uc3QgaGlnaGxpZ2h0QXJlYTogSFRNTEVsZW1lbnRbXSA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHNoaXBUb1BsYWNlLnNpemU7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdGlsZUlEID0gYCR7b3duZXJ9LSR7aG92ZXJUaWxlLnh9LSR7aG92ZXJUaWxlLnkgKyBpbmRleH1gXG4gICAgICAgIGNvbnN0IHRpbGVUb0hpZ2hsaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRpbGVJRClcbiAgICAgICAgaWYgKHRpbGVUb0hpZ2hsaWdodCkgeyBoaWdobGlnaHRBcmVhLnB1c2godGlsZVRvSGlnaGxpZ2h0KSB9XG4gICAgICAgIGVsc2UgYnJlYWtcbiAgICB9XG4gICAgaWYgKGhpZ2hsaWdodEFyZWEubGVuZ3RoID09PSBzaGlwVG9QbGFjZS5zaXplKSB7XG4gICAgICAgIGhpZ2hsaWdodEFyZWEuZm9yRWFjaCgoaGlnaGxpZ2h0ZWRUaWxlKSA9PiB7XG4gICAgICAgICAgICBoaWdobGlnaHRlZFRpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIHNoYWRvd1wiXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVTaGlwU2hhZG93KG93bmVyOiBzdHJpbmcsIGhvdmVyVGlsZTogVGlsZSkge1xuICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSBhcyBzaGlwUHJvcHNcbiAgICBjb25zdCBoaWdobGlnaHRBcmVhOiBIVE1MRWxlbWVudFtdID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgc2hpcFRvUGxhY2Uuc2l6ZTsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0aWxlSUQgPSBgJHtvd25lcn0tJHtob3ZlclRpbGUueH0tJHtob3ZlclRpbGUueSArIGluZGV4fWBcbiAgICAgICAgY29uc3QgdGlsZVRvSGlnaGxpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGlsZUlEKVxuICAgICAgICBpZiAodGlsZVRvSGlnaGxpZ2h0KSB7IGhpZ2hsaWdodEFyZWEucHVzaCh0aWxlVG9IaWdobGlnaHQpIH1cbiAgICAgICAgZWxzZSBicmVha1xuICAgIH1cbiAgICBoaWdobGlnaHRBcmVhLmZvckVhY2goKGhpZ2hsaWdodGVkVGlsZSkgPT4ge1xuICAgICAgICByZWZyZXNoVGlsZShoaWdobGlnaHRlZFRpbGUpXG4gICAgfSlcbn0iLCJpbXBvcnQgKiBhcyBET00gZnJvbSBcIi4vY29udHJvbFwiXG5pbXBvcnQgeyBzZXR1cEdhbWUgfSBmcm9tIFwiLi9nYW1lXCJcblxuc2V0dXBHYW1lKClcbkRPTS5yZWZyZXNoQm9hcmRzKClcbkRPTS5yZWZyZXNoSGFyYm91cnMoKSJdfQ==