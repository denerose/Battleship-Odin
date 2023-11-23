// src/ai.ts
function aiTurn(aiPlayer, targetPlayer) {
  if (aiPlayer.placingShips) {
    const legalMoves = aiPlayer.board.getVacantTiles();
    const chooseTarget = Math.floor(Math.random() * legalMoves.length);
    const target = legalMoves[chooseTarget];
    aiPlayer.placeShip(target.x, target.y);
  } else if (!aiPlayer.placingShips) {
    const legalMoves = targetPlayer.board.getVacantTiles();
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
  getVacantTiles() {
    return this.gameBoard.filter((tile) => !tile.hit);
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
    checkWinner();
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
  P1Ships.forEach((ship) => {
    const newShipDiv = document.createElement("div");
    newShipDiv.innerText = `${ship.type} (${ship.size})`;
    if (ship === getShipBeingPlaced()) {
      newShipDiv.className = "currentShip";
    } else {
      newShipDiv.className = "harbourShip";
    }
    P1Harbour.appendChild(newShipDiv);
  });
  P2Ships.forEach((ship) => {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9haS50cyIsIi4uLy4uL3NyYy9zaGlwLnRzIiwiLi4vLi4vc3JjL2dhbWVib2FyZC50cyIsIi4uLy4uL3NyYy9wbGF5ZXIudHMiLCIuLi8uLi9zcmMvZ2FtZS50cyIsIi4uLy4uL3NyYy9jb250cm9sLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbIm5ld0NoZWNrZWRUaWxlIl0sIm1hcHBpbmdzIjoiO0FBRU8sU0FBUyxPQUFPLFVBQWtCLGNBQXNCO0FBQzNELE1BQUksU0FBUyxjQUFjO0FBQ3ZCLFVBQU0sYUFBYSxTQUFTLE1BQU0sZUFBZTtBQUNqRCxVQUFNLGVBQWUsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTTtBQUNqRSxVQUFNLFNBQVMsV0FBVyxZQUFZO0FBQ3RDLGFBQVMsVUFBVSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekMsV0FDUyxDQUFDLFNBQVMsY0FBYztBQUM3QixVQUFNLGFBQWEsYUFBYSxNQUFNLGVBQWU7QUFDckQsVUFBTSxlQUFlLEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxXQUFXLE1BQU07QUFDakUsVUFBTSxTQUFTLFdBQVcsWUFBWTtBQUN0QyxhQUFTLFlBQVksY0FBYyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekQ7QUFDSjs7O0FDVk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQU1kLFlBQVksTUFBYyxNQUFjO0FBTHhDLGdCQUFlO0FBRWYsZ0JBQWU7QUFTZixTQUFPLFNBQVMsTUFBTTtBQUFFLGFBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxPQUFPO0FBQUEsSUFBTTtBQUxqRSxTQUFLLE9BQU87QUFDWixTQUFLLE9BQU87QUFDWixTQUFLLE1BQU0sT0FBTyxXQUFXO0FBQUEsRUFDakM7QUFBQSxFQUlPLFVBQVU7QUFDYixTQUFLO0FBQUEsRUFDVDtBQUNKOzs7QUNwQk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQUVkLFlBQ1csR0FDQSxHQUNBLFdBQW9CLE9B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V0FBaUI7QUFDaEQsUUFBTSxjQUFtQixtQkFBbUI7QUFDNUMsUUFBTSxnQkFBK0IsQ0FBQztBQUN0QyxXQUFTLFFBQVEsR0FBRyxRQUFRLFlBQVksTUFBTSxTQUFTO0FBQ25ELFVBQU0sU0FBUyxHQUFHLEtBQUssSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLElBQUksS0FBSztBQUM3RCxVQUFNLGtCQUFrQixTQUFTLGVBQWUsTUFBTTtBQUN0RCxRQUFJLGlCQUFpQjtBQUFFLG9CQUFjLEtBQUssZUFBZTtBQUFBLElBQUU7QUFDdEQ7QUFBQSxFQUNUO0FBQ0EsTUFBSSxjQUFjLFdBQVcsWUFBWSxNQUFNO0FBQzNDLGtCQUFjLFFBQVEsQ0FBQyxvQkFBb0I7QUFDdkMsc0JBQWdCLFlBQVk7QUFBQSxJQUNoQyxDQUFDO0FBQUEsRUFDTDtBQUNKO0FBRUEsU0FBUyxpQkFBaUIsT0FBZSxXQUFpQjtBQUN0RCxRQUFNLGNBQW1CLG1CQUFtQjtBQUM1QyxRQUFNLGdCQUErQixDQUFDO0FBQ3RDLFdBQVMsUUFBUSxHQUFHLFFBQVEsWUFBWSxNQUFNLFNBQVM7QUFDbkQsVUFBTSxTQUFTLEdBQUcsS0FBSyxJQUFJLFVBQVUsQ0FBQyxJQUFJLFVBQVUsSUFBSSxLQUFLO0FBQzdELFVBQU0sa0JBQWtCLFNBQVMsZUFBZSxNQUFNO0FBQ3RELFFBQUksaUJBQWlCO0FBQUUsb0JBQWMsS0FBSyxlQUFlO0FBQUEsSUFBRTtBQUN0RDtBQUFBLEVBQ1Q7QUFDQSxnQkFBYyxRQUFRLENBQUMsb0JBQW9CO0FBQ3ZDLGdCQUFZLGVBQWU7QUFBQSxFQUMvQixDQUFDO0FBQ0w7OztBQ3hJQSxVQUFVO0FBQ04sY0FBYztBQUNkLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBsYXllciB9IGZyb20gJy4vcGxheWVyJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFpVHVybihhaVBsYXllcjogUGxheWVyLCB0YXJnZXRQbGF5ZXI6IFBsYXllcikge1xuICAgIGlmIChhaVBsYXllci5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgY29uc3QgbGVnYWxNb3ZlcyA9IGFpUGxheWVyLmJvYXJkLmdldFZhY2FudFRpbGVzKClcbiAgICAgICAgY29uc3QgY2hvb3NlVGFyZ2V0ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVnYWxNb3Zlcy5sZW5ndGgpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBsZWdhbE1vdmVzW2Nob29zZVRhcmdldF1cbiAgICAgICAgYWlQbGF5ZXIucGxhY2VTaGlwKHRhcmdldC54LCB0YXJnZXQueSlcbiAgICB9XG4gICAgZWxzZSBpZiAoIWFpUGxheWVyLnBsYWNpbmdTaGlwcykge1xuICAgICAgICBjb25zdCBsZWdhbE1vdmVzID0gdGFyZ2V0UGxheWVyLmJvYXJkLmdldFZhY2FudFRpbGVzKClcbiAgICAgICAgY29uc3QgY2hvb3NlVGFyZ2V0ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVnYWxNb3Zlcy5sZW5ndGgpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBsZWdhbE1vdmVzW2Nob29zZVRhcmdldF1cbiAgICAgICAgYWlQbGF5ZXIucGxhY2VBdHRhY2sodGFyZ2V0UGxheWVyLCB0YXJnZXQueCwgdGFyZ2V0LnkpXG4gICAgfVxufSIsImV4cG9ydCBpbnRlcmZhY2Ugc2hpcFByb3BzIHtcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgc2l6ZTogbnVtYmVyLFxufVxuXG5leHBvcnQgY2xhc3MgU2hpcCB7XG4gICAgdHlwZTogc3RyaW5nID0gJ3NtYWxsJ1xuICAgIHNpemU6IG51bWJlclxuICAgIGhpdHM6IG51bWJlciA9IDBcbiAgICBrZXlcblxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMua2V5ID0gY3J5cHRvLnJhbmRvbVVVSUQoKVxuICAgIH1cblxuICAgIHB1YmxpYyBpc1N1bmsgPSAoKSA9PiB7IHJldHVybiB0aGlzLmhpdHMgPj0gdGhpcy5zaXplID8gdHJ1ZSA6IGZhbHNlIH07XG5cbiAgICBwdWJsaWMgdGFrZUhpdCgpIHtcbiAgICAgICAgdGhpcy5oaXRzKytcbiAgICB9XG59IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIlxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHg6IG51bWJlcixcbiAgICAgICAgcHVibGljIHk6IG51bWJlcixcbiAgICAgICAgcHVibGljIG9jY3VwaWVkOiBib29sZWFuID0gZmFsc2UsXG4gICAgICAgIHB1YmxpYyBoaXQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgcHVibGljIHNoaXBLZXk/OiBzdHJpbmcpIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZUJvYXJkIHtcbiAgICBnYW1lQm9hcmQ6IFRpbGVbXSA9IFtdXG4gICAgYWN0aXZlU2hpcHM6IFNoaXBbXSA9IFtdXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc2l6ZTogbnVtYmVyXG4gICAgKSB7XG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgc2l6ZTsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHNpemU7IHkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUJvYXJkLnB1c2gobmV3IFRpbGUoeCwgeSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGFjZW1lbnRHcmlkKHN0YXJ0VGlsZTogVGlsZSwgc2hpcFNpemU6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0aWxlc1RvQ2hlY2sgPSBbXVxuICAgICAgICBsZXQgY3VycmVudFRpbGU6IFRpbGUgPSBzdGFydFRpbGVcbiAgICAgICAgaWYgKHRpbGVzVG9DaGVjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRpbGVzVG9DaGVjay5wdXNoKGN1cnJlbnRUaWxlKVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzaGlwU2l6ZSA+IHRpbGVzVG9DaGVjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBuZXdDaGVja2VkVGlsZSA9IHRoaXMuZ2FtZUJvYXJkLmZpbmQoKG5ld0NoZWNrZWRUaWxlKSA9PiBuZXdDaGVja2VkVGlsZS54ID09PSBjdXJyZW50VGlsZS54ICYmIG5ld0NoZWNrZWRUaWxlLnkgPT09IGN1cnJlbnRUaWxlLnkgKyAxKTtcbiAgICAgICAgICAgIGlmIChuZXdDaGVja2VkVGlsZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUaWxlID0gbmV3Q2hlY2tlZFRpbGVcbiAgICAgICAgICAgICAgICB0aWxlc1RvQ2hlY2sucHVzaChjdXJyZW50VGlsZSlcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gW11cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZXNUb0NoZWNrO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZVNoaXAodHlwZTogc3RyaW5nLCBzaXplOiBudW1iZXIsIHN0YXJ0VGlsZTogVGlsZSkge1xuICAgICAgICBjb25zdCBwbGFjZW1lbnRBcmVhID0gdGhpcy5wbGFjZW1lbnRHcmlkKHN0YXJ0VGlsZSwgc2l6ZSlcbiAgICAgICAgaWYgKHBsYWNlbWVudEFyZWEubGVuZ3RoID09PSAwKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2UgaWYgKHBsYWNlbWVudEFyZWEuc29tZSgodGlsZSkgPT4gdGlsZS5vY2N1cGllZCkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzaGlwVG9QbGFjZSA9IG5ldyBTaGlwKHR5cGUsIHNpemUpXG4gICAgICAgICAgICBwbGFjZW1lbnRBcmVhLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLm9jY3VwaWVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRpbGUuc2hpcEtleSA9IHNoaXBUb1BsYWNlLmtleVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU2hpcHMucHVzaChzaGlwVG9QbGFjZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVjZWl2ZUF0dGFjayhhdHRhY2tlZFRpbGU6IFRpbGUpIHtcbiAgICAgICAgaWYgKGF0dGFja2VkVGlsZS5oaXQpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSBpZiAoYXR0YWNrZWRUaWxlLm9jY3VwaWVkKSB7XG4gICAgICAgICAgICBhdHRhY2tlZFRpbGUuaGl0ID0gdHJ1ZVxuICAgICAgICAgICAgaWYgKGF0dGFja2VkVGlsZS5zaGlwS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0YWNrZWRTaGlwID0gdGhpcy5maW5kU2hpcEZyb21LZXkoYXR0YWNrZWRUaWxlLnNoaXBLZXkpXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VkU2hpcCkgYXR0YWNrZWRTaGlwLnRha2VIaXQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgYXR0YWNrZWRUaWxlLmhpdCA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluZFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbmQoKHRpbGUpID0+IHRpbGUueCA9PSB4ICYmIHRpbGUueSA9PSB5KVxuICAgIH1cblxuICAgIGZpbmRTaGlwRnJvbUtleShrZXlUb0ZpbmQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBmb3VuZFNoaXAgPSB0aGlzLmFjdGl2ZVNoaXBzLmZpbmQoKHNoaXApID0+IHNoaXAua2V5ID09PSBrZXlUb0ZpbmQpXG4gICAgICAgIHJldHVybiBmb3VuZFNoaXBcbiAgICB9XG5cbiAgICBwdWJsaWMgY2hlY2tJZkFsbFN1bmsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWNhbnRUaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbHRlcigodGlsZSkgPT4gIXRpbGUuaGl0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNPY2N1cGllZCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmZpbmRUaWxlKHgsIHkpXG4gICAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5vY2N1cGllZCA/IHRydWUgOiBmYWxzZVxuICAgIH1cblxufSIsImltcG9ydCB7IEdhbWVCb2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgc2hpcFByb3BzLCBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBzaGlwQmVpbmdQbGFjZWQ/OiBzaGlwUHJvcHNcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgaHVtYW46IGJvb2xlYW4gPSB0cnVlLFxuICAgICAgICBwdWJsaWMgdGFraW5nVHVybiA9IHRydWUsXG4gICAgICAgIHB1YmxpYyBzaGlwc0F2YWlsYWJsZTogc2hpcFByb3BzW10gPSBbeyB0eXBlOiAndGlueScsIHNpemU6IDEgfSwgeyB0eXBlOiAnc21hbGwnLCBzaXplOiAyIH1dLFxuICAgICAgICBwdWJsaWMgYm9hcmQgPSBuZXcgR2FtZUJvYXJkKDkpLFxuICAgICAgICBwdWJsaWMgcGxhY2luZ1NoaXBzID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5zaGlwQmVpbmdQbGFjZWQgPSB0aGlzLnNoaXBzQXZhaWxhYmxlLmF0KC0xKVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZUF0dGFjayhlbmVteVBsYXllcjogUGxheWVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlbmVteVBsYXllci5ib2FyZC5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGFyZ2V0ICYmICF0YXJnZXQuaGl0KSB7XG4gICAgICAgICAgICBlbmVteVBsYXllci5ib2FyZC5yZWNlaXZlQXR0YWNrKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnRha2luZ1R1cm4gPSBmYWxzZVxuICAgICAgICAgICAgZW5lbXlQbGF5ZXIuc2V0VHVybigpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VHVybigpIHtcbiAgICAgICAgdGhpcy50YWtpbmdUdXJuID0gdHJ1ZVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZVNoaXAoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaGlwc0F2YWlsYWJsZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gdGhpcy5zaGlwQmVpbmdQbGFjZWRcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYm9hcmQuZmluZFRpbGUoeCwgeSlcbiAgICAgICAgICAgIGlmICh0YXJnZXQgJiYgc2hpcFRvUGxhY2UgJiYgIXRhcmdldC5vY2N1cGllZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucGxhY2VTaGlwKHNoaXBUb1BsYWNlLnR5cGUsIHNoaXBUb1BsYWNlLnNpemUsIHRhcmdldClcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBzQXZhaWxhYmxlLnBvcCgpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hpcHNBdmFpbGFibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHRoaXMuc2hpcHNBdmFpbGFibGUuYXQoLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHJldHVybiBmYWxzZVxuICAgIH1cbn0iLCJpbXBvcnQgeyBhaVR1cm4gfSBmcm9tIFwiLi9haVwiO1xuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5leHBvcnQgbGV0IFAxOiBQbGF5ZXIgPSBuZXcgUGxheWVyKFwiUDFcIilcbmV4cG9ydCBsZXQgUDI6IFBsYXllciA9IG5ldyBQbGF5ZXIoXCJQMlwiLCBmYWxzZSwgZmFsc2UpXG5leHBvcnQgbGV0IHdpbm5lciA9IFwiVEJDXCJcbmV4cG9ydCBsZXQgZ2FtZUluUGxheSA9IHRydWVcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwR2FtZSgpIHtcbiAgICBQMSA9IG5ldyBQbGF5ZXIoXCJQMVwiKVxuICAgIFAyID0gbmV3IFBsYXllcihcIlAyXCIsIGZhbHNlLCBmYWxzZSlcbiAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxufVxuXG5leHBvcnQgY29uc3QgZ2V0Q3VycmVudFBsYXllciA9ICgpID0+IHtcbiAgICBpZiAoUDEudGFraW5nVHVybiAmJiAhUDIudGFraW5nVHVybikgeyByZXR1cm4gUDEgfVxuICAgIGlmIChQMi50YWtpbmdUdXJuICYmICFQMS50YWtpbmdUdXJuKSB7IHJldHVybiBQMiB9XG59XG5cbmNvbnN0IGdldEVuZW15UGxheWVyID0gKCkgPT4ge1xuICAgIGlmIChQMS50YWtpbmdUdXJuICYmICFQMi50YWtpbmdUdXJuKSB7IHJldHVybiBQMiB9XG4gICAgaWYgKFAyLnRha2luZ1R1cm4gJiYgIVAxLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAxIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAxU2hpcHNBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIFAxLnNoaXBzQXZhaWxhYmxlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMlNoaXBzQXZhaWxhYmxlKCkge1xuICAgIHJldHVybiBQMi5zaGlwc0F2YWlsYWJsZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQ2xpY2soYm9hcmROYW1lOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgY29uc3QgY3VycmVudFBsYXllcjogUGxheWVyID0gZ2V0Q3VycmVudFBsYXllcigpIGFzIFBsYXllclxuICAgIGNvbnN0IGVuZW15UGxheWVyOiBQbGF5ZXIgPSBnZXRFbmVteVBsYXllcigpIGFzIFBsYXllclxuICAgIGlmIChib2FyZE5hbWUgPT09IGN1cnJlbnRQbGF5ZXIubmFtZSkge1xuICAgICAgICBpZiAoIWN1cnJlbnRQbGF5ZXIucGxhY2luZ1NoaXBzKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudFBsYXllci5wbGFjZVNoaXAoeCwgeSlcbiAgICAgICAgICAgIGlmIChnYW1lSW5QbGF5ICYmICFlbmVteVBsYXllci5odW1hbikge1xuICAgICAgICAgICAgICAgIGFpVHVybihlbmVteVBsYXllciwgY3VycmVudFBsYXllcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJvYXJkTmFtZSA9PT0gZW5lbXlQbGF5ZXIubmFtZSAmJiAhY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgaWYgKGVuZW15UGxheWVyLmJvYXJkLmZpbmRUaWxlKHgsIHkpPy5oaXQpIHJldHVybiBmYWxzZVxuICAgICAgICBjdXJyZW50UGxheWVyLnBsYWNlQXR0YWNrKGVuZW15UGxheWVyLCB4LCB5KVxuICAgICAgICBsZXQgaXNXaW5uZXIgPSBjaGVja1dpbm5lcigpXG4gICAgICAgIGlmIChnYW1lSW5QbGF5ICYmICFlbmVteVBsYXllci5odW1hbikge1xuICAgICAgICAgICAgYWlUdXJuKGVuZW15UGxheWVyLCBjdXJyZW50UGxheWVyKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxufVxuXG5mdW5jdGlvbiBjaGVja1dpbm5lcigpIHtcbiAgICBpZiAoIVAxLmJvYXJkLmNoZWNrSWZBbGxTdW5rKCkgJiYgIVAyLmJvYXJkLmNoZWNrSWZBbGxTdW5rKCkpIHtcbiAgICAgICAgZ2FtZUluUGxheSA9IHRydWVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGVsc2UgaWYgKFAxLmJvYXJkLmNoZWNrSWZBbGxTdW5rKCkgPT09IHRydWUpIHtcbiAgICAgICAgd2lubmVyID0gUDIubmFtZVxuICAgICAgICBnYW1lSW5QbGF5ID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHdpbm5lclxuICAgIH1cbiAgICBlbHNlIGlmIChQMi5ib2FyZC5jaGVja0lmQWxsU3VuaygpID09PSB0cnVlKSB7XG4gICAgICAgIHdpbm5lciA9IFAxLm5hbWVcbiAgICAgICAgZ2FtZUluUGxheSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB3aW5uZXJcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdhbWVJblBsYXkgPSB0cnVlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAxQm9hcmQoKSB7XG4gICAgcmV0dXJuIFAxLmJvYXJkLmdhbWVCb2FyZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDJCb2FyZCgpIHtcbiAgICByZXR1cm4gUDIuYm9hcmQuZ2FtZUJvYXJkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTaGlwQmVpbmdQbGFjZWQoKSB7XG4gICAgY29uc3QgY3VycmVudFBsYXllciA9IGdldEN1cnJlbnRQbGF5ZXIoKVxuICAgIGlmIChjdXJyZW50UGxheWVyICYmIGN1cnJlbnRQbGF5ZXIucGxhY2luZ1NoaXBzKSByZXR1cm4gY3VycmVudFBsYXllci5zaGlwQmVpbmdQbGFjZWRcbn0iLCJpbXBvcnQgKiBhcyBnYW1lIGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IFRpbGUgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IHNoaXBQcm9wcyB9IGZyb20gXCIuL3NoaXBcIjtcblxuXG5jb25zdCBQMUZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUZyYW1lXCIpIGFzIEhUTUxEaXZFbGVtZW50XG5jb25zdCBQMkZyYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkZyYW1lXCIpIGFzIEhUTUxEaXZFbGVtZW50XG5cbmZ1bmN0aW9uIGNyZWF0ZVRpbGUob3duZXI6IHN0cmluZywgdGlsZTogVGlsZSkge1xuICAgIGNvbnN0IG5ld1RpbGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIG5ld1RpbGUuaWQgPSBgJHtvd25lcn0tJHt0aWxlLnh9LSR7dGlsZS55fWBcbiAgICBpZiAob3duZXIgPT09IFwiUDFcIiAmJiB0aWxlLm9jY3VwaWVkICYmICF0aWxlLmhpdCkge1xuICAgICAgICBuZXdUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBteXNoaXBcIlxuICAgIH1cbiAgICBlbHNlIGlmICh0aWxlLmhpdCAmJiAhdGlsZS5vY2N1cGllZCkge1xuICAgICAgICBuZXdUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBtaXNzXCJcbiAgICAgICAgbmV3VGlsZS5pbm5lclRleHQgPSBcInhcIlxuICAgIH1cbiAgICBlbHNlIGlmICh0aWxlLmhpdCAmJiB0aWxlLm9jY3VwaWVkKSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIGhpdFwiXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBuZXdUaWxlLmNsYXNzTmFtZSA9IFwidGlsZVwiXG4gICAgfVxuICAgIG5ld1RpbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmIChnYW1lLmdhbWVJblBsYXkpIHtcbiAgICAgICAgICAgIGdhbWUuaGFuZGxlQ2xpY2sob3duZXIsIHRpbGUueCwgdGlsZS55KVxuICAgICAgICAgICAgcmVmcmVzaEJvYXJkcygpXG4gICAgICAgICAgICByZWZyZXNoSGFyYm91cnMoKVxuICAgICAgICB9XG4gICAgfSlcbiAgICBpZiAoZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk/LnBsYWNpbmdTaGlwcyAmJiBvd25lciA9PT0gZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk/Lm5hbWUpIHtcbiAgICAgICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgc2hpcFNoYWRvdyhvd25lciwgdGlsZSlcbiAgICAgICAgfSlcbiAgICAgICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgcmVtb3ZlU2hpcFNoYWRvdyhvd25lciwgdGlsZSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIG5ld1RpbGVcbn1cblxuZnVuY3Rpb24gY2xpY2tSZWYoaWRTdHJpbmc6IHN0cmluZykge1xuICAgIGNvbnN0IHBhcmFtcyA9IGlkU3RyaW5nLnNwbGl0KCctJylcbiAgICByZXR1cm4gcGFyYW1zXG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hUaWxlKHJlZmVyZW5jZVRpbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgaWRBcnJheSA9IGNsaWNrUmVmKHJlZmVyZW5jZVRpbGUuaWQpXG4gICAgY29uc3Qgb3duZXIgPSBpZEFycmF5WzBdXG4gICAgY29uc3QgeCA9IE51bWJlcihpZEFycmF5WzFdKVxuICAgIGNvbnN0IHkgPSBOdW1iZXIoaWRBcnJheVsyXSlcbiAgICBpZiAob3duZXIgPT09ICdQMScpIHtcbiAgICAgICAgY29uc3QgYm9hcmRJbmZvID0gZ2FtZS5QMS5ib2FyZFxuICAgICAgICBjb25zdCB0aWxlSW5mbyA9IGJvYXJkSW5mby5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGlsZUluZm8/Lm9jY3VwaWVkKSB7XG4gICAgICAgICAgICByZWZlcmVuY2VUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBteXNoaXBcIlxuICAgICAgICB9IGVsc2UgeyByZWZlcmVuY2VUaWxlLmNsYXNzTmFtZSA9IFwidGlsZVwiIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnJlc2hCb2FyZHMoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnbm9uZSc7XG5cbiAgICBjb25zdCBQMUJvYXJkID0gZ2FtZS5nZXRQMUJvYXJkKClcbiAgICBjb25zdCBQMkJvYXJkID0gZ2FtZS5nZXRQMkJvYXJkKClcblxuICAgIC8vIGNyZWF0ZSBET00gZWxlbWVudHMgZm9yIFAxIGJvYXJkXG4gICAgUDFGcmFtZS5pbm5lckhUTUwgPSAnJ1xuICAgIFAxQm9hcmQuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IGNyZWF0ZVRpbGUoXCJQMVwiLCB0aWxlKVxuICAgICAgICBQMUZyYW1lLmFwcGVuZENoaWxkKG5ld1RpbGUpXG4gICAgfSlcblxuICAgIC8vIGNyZWF0ZSBET00gZWxlbWVudHMgZm9yIFAyIGJvYXJkXG4gICAgUDJGcmFtZS5pbm5lckhUTUwgPSAnJ1xuICAgIFAyQm9hcmQuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IGNyZWF0ZVRpbGUoXCJQMlwiLCB0aWxlKVxuICAgICAgICBQMkZyYW1lLmFwcGVuZENoaWxkKG5ld1RpbGUpXG4gICAgfSlcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdhdXRvJztcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaEhhcmJvdXJzKCkge1xuICAgIGNvbnN0IFAxU2hpcHMgPSBnYW1lLmdldFAxU2hpcHNBdmFpbGFibGUoKVxuICAgIGNvbnN0IFAyU2hpcHMgPSBnYW1lLmdldFAyU2hpcHNBdmFpbGFibGUoKVxuICAgIGNvbnN0IFAxSGFyYm91ciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFIYXJib3VyXCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICAgUDFIYXJib3VyLmlubmVySFRNTCA9ICc8aDQ+SGFyYm91ciAoc2hpcHMgdG8gcGxhY2UpPC9oND4nXG4gICAgY29uc3QgUDJIYXJib3VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkhhcmJvdXJcIikgYXMgSFRNTERpdkVsZW1lbnRcbiAgICBQMkhhcmJvdXIuaW5uZXJIVE1MID0gJzxoND5IYXJib3VyPC9oND4nXG4gICAgUDFTaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBuZXdTaGlwRGl2LmlubmVyVGV4dCA9IGAke3NoaXAudHlwZX0gKCR7c2hpcC5zaXplfSlgXG4gICAgICAgIGlmIChzaGlwID09PSBnYW1lLmdldFNoaXBCZWluZ1BsYWNlZCgpKSB7XG4gICAgICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiY3VycmVudFNoaXBcIlxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV3U2hpcERpdi5jbGFzc05hbWUgPSBcImhhcmJvdXJTaGlwXCJcbiAgICAgICAgfVxuICAgICAgICBQMUhhcmJvdXIuYXBwZW5kQ2hpbGQobmV3U2hpcERpdilcbiAgICB9KVxuICAgIFAyU2hpcHMuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgbmV3U2hpcERpdi5pbm5lclRleHQgPSBgJHtzaGlwLnR5cGV9ICgke3NoaXAuc2l6ZX0pYFxuICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiaGFyYm91clNoaXBcIlxuICAgICAgICBQMkhhcmJvdXIuYXBwZW5kQ2hpbGQobmV3U2hpcERpdilcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBzaGlwU2hhZG93KG93bmVyOiBzdHJpbmcsIGhvdmVyVGlsZTogVGlsZSkge1xuICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSBhcyBzaGlwUHJvcHNcbiAgICBjb25zdCBoaWdobGlnaHRBcmVhOiBIVE1MRWxlbWVudFtdID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgc2hpcFRvUGxhY2Uuc2l6ZTsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0aWxlSUQgPSBgJHtvd25lcn0tJHtob3ZlclRpbGUueH0tJHtob3ZlclRpbGUueSArIGluZGV4fWBcbiAgICAgICAgY29uc3QgdGlsZVRvSGlnaGxpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGlsZUlEKVxuICAgICAgICBpZiAodGlsZVRvSGlnaGxpZ2h0KSB7IGhpZ2hsaWdodEFyZWEucHVzaCh0aWxlVG9IaWdobGlnaHQpIH1cbiAgICAgICAgZWxzZSBicmVha1xuICAgIH1cbiAgICBpZiAoaGlnaGxpZ2h0QXJlYS5sZW5ndGggPT09IHNoaXBUb1BsYWNlLnNpemUpIHtcbiAgICAgICAgaGlnaGxpZ2h0QXJlYS5mb3JFYWNoKChoaWdobGlnaHRlZFRpbGUpID0+IHtcbiAgICAgICAgICAgIGhpZ2hsaWdodGVkVGlsZS5jbGFzc05hbWUgPSBcInRpbGUgc2hhZG93XCJcbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNoaXBTaGFkb3cob3duZXI6IHN0cmluZywgaG92ZXJUaWxlOiBUaWxlKSB7XG4gICAgY29uc3Qgc2hpcFRvUGxhY2UgPSBnYW1lLmdldFNoaXBCZWluZ1BsYWNlZCgpIGFzIHNoaXBQcm9wc1xuICAgIGNvbnN0IGhpZ2hsaWdodEFyZWE6IEhUTUxFbGVtZW50W10gPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBzaGlwVG9QbGFjZS5zaXplOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHRpbGVJRCA9IGAke293bmVyfS0ke2hvdmVyVGlsZS54fS0ke2hvdmVyVGlsZS55ICsgaW5kZXh9YFxuICAgICAgICBjb25zdCB0aWxlVG9IaWdobGlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aWxlSUQpXG4gICAgICAgIGlmICh0aWxlVG9IaWdobGlnaHQpIHsgaGlnaGxpZ2h0QXJlYS5wdXNoKHRpbGVUb0hpZ2hsaWdodCkgfVxuICAgICAgICBlbHNlIGJyZWFrXG4gICAgfVxuICAgIGhpZ2hsaWdodEFyZWEuZm9yRWFjaCgoaGlnaGxpZ2h0ZWRUaWxlKSA9PiB7XG4gICAgICAgIHJlZnJlc2hUaWxlKGhpZ2hsaWdodGVkVGlsZSlcbiAgICB9KVxufSIsImltcG9ydCAqIGFzIERPTSBmcm9tIFwiLi9jb250cm9sXCJcbmltcG9ydCB7IHNldHVwR2FtZSB9IGZyb20gXCIuL2dhbWVcIlxuXG5zZXR1cEdhbWUoKVxuRE9NLnJlZnJlc2hCb2FyZHMoKVxuRE9NLnJlZnJlc2hIYXJib3VycygpIl19