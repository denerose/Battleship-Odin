// src/ai.ts
function aiTurn(aiPlayer, targetPlayer) {
  if (aiPlayer.placingShips) {
    return;
  } else if (!aiPlayer.placingShips) {
    const legalMoves = targetPlayer.board.getVacantTiles();
    const chooseTarget = Math.floor(Math.random() * legalMoves.length);
    const target = legalMoves[chooseTarget];
    console.log(`${target.x}, ${target.y}`);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9haS50cyIsIi4uLy4uL3NyYy9zaGlwLnRzIiwiLi4vLi4vc3JjL2dhbWVib2FyZC50cyIsIi4uLy4uL3NyYy9wbGF5ZXIudHMiLCIuLi8uLi9zcmMvZ2FtZS50cyIsIi4uLy4uL3NyYy9jb250cm9sLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbIm5ld0NoZWNrZWRUaWxlIl0sIm1hcHBpbmdzIjoiO0FBRU8sU0FBUyxPQUFPLFVBQWtCLGNBQXNCO0FBQzNELE1BQUksU0FBUyxjQUFjO0FBQ3ZCO0FBQUEsRUFDSixXQUNTLENBQUMsU0FBUyxjQUFjO0FBQzdCLFVBQU0sYUFBYSxhQUFhLE1BQU0sZUFBZTtBQUNyRCxVQUFNLGVBQWUsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTTtBQUNqRSxVQUFNLFNBQVMsV0FBVyxZQUFZO0FBQ3RDLFlBQVEsSUFBSSxHQUFHLE9BQU8sQ0FBQyxLQUFLLE9BQU8sQ0FBQyxFQUFFO0FBQ3RDLGFBQVMsWUFBWSxjQUFjLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFBQSxFQUN6RDtBQUNKOzs7QUNSTyxJQUFNLE9BQU4sTUFBVztBQUFBLEVBTWQsWUFBWSxNQUFjLE1BQWM7QUFMeEMsZ0JBQWU7QUFFZixnQkFBZTtBQVNmLFNBQU8sU0FBUyxNQUFNO0FBQUUsYUFBTyxLQUFLLFFBQVEsS0FBSyxPQUFPLE9BQU87QUFBQSxJQUFNO0FBTGpFLFNBQUssT0FBTztBQUNaLFNBQUssT0FBTztBQUNaLFNBQUssTUFBTSxPQUFPLFdBQVc7QUFBQSxFQUNqQztBQUFBLEVBSU8sVUFBVTtBQUNiLFNBQUs7QUFBQSxFQUNUO0FBQ0o7OztBQ3BCTyxJQUFNLE9BQU4sTUFBVztBQUFBLEVBRWQsWUFDVyxHQUNBLEdBQ0EsV0FBb0IsT0FDcEIsTUFBZSxPQUNmLFNBQWtCO0FBSmxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQSxFQUFvQjtBQUNuQztBQUVPLElBQU0sWUFBTixNQUFnQjtBQUFB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LE1BQU0sU0FBUztBQUNuRCxVQUFNLFNBQVMsR0FBRyxLQUFLLElBQUksVUFBVSxDQUFDLElBQUksVUFBVSxJQUFJLEtBQUs7QUFDN0QsVUFBTSxrQkFBa0IsU0FBUyxlQUFlLE1BQU07QUFDdEQsUUFBSSxpQkFBaUI7QUFBRSxvQkFBYyxLQUFLLGVBQWU7QUFBQSxJQUFFO0FBQ3REO0FBQUEsRUFDVDtBQUNBLE1BQUksY0FBYyxXQUFXLFlBQVksTUFBTTtBQUMzQyxrQkFBYyxRQUFRLENBQUMsb0JBQW9CO0FBQ3ZDLHNCQUFnQixZQUFZO0FBQUEsSUFDaEMsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUVBLFNBQVMsaUJBQWlCLE9BQWUsV0FBaUI7QUFDdEQsUUFBTSxjQUFtQixtQkFBbUI7QUFDNUMsUUFBTSxnQkFBK0IsQ0FBQztBQUN0QyxXQUFTLFFBQVEsR0FBRyxRQUFRLFlBQVksTUFBTSxTQUFTO0FBQ25ELFVBQU0sU0FBUyxHQUFHLEtBQUssSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLElBQUksS0FBSztBQUM3RCxVQUFNLGtCQUFrQixTQUFTLGVBQWUsTUFBTTtBQUN0RCxRQUFJLGlCQUFpQjtBQUFFLG9CQUFjLEtBQUssZUFBZTtBQUFBLElBQUU7QUFDdEQ7QUFBQSxFQUNUO0FBQ0EsZ0JBQWMsUUFBUSxDQUFDLG9CQUFvQjtBQUN2QyxnQkFBWSxlQUFlO0FBQUEsRUFDL0IsQ0FBQztBQUNMOzs7QUN4SUEsVUFBVTtBQUNOLGNBQWM7QUFDZCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBhaVR1cm4oYWlQbGF5ZXI6IFBsYXllciwgdGFyZ2V0UGxheWVyOiBQbGF5ZXIpIHtcbiAgICBpZiAoYWlQbGF5ZXIucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgIHJldHVyblxuICAgIH1cbiAgICBlbHNlIGlmICghYWlQbGF5ZXIucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FsTW92ZXMgPSB0YXJnZXRQbGF5ZXIuYm9hcmQuZ2V0VmFjYW50VGlsZXMoKVxuICAgICAgICBjb25zdCBjaG9vc2VUYXJnZXQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZWdhbE1vdmVzLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxlZ2FsTW92ZXNbY2hvb3NlVGFyZ2V0XVxuICAgICAgICBjb25zb2xlLmxvZyhgJHt0YXJnZXQueH0sICR7dGFyZ2V0Lnl9YClcbiAgICAgICAgYWlQbGF5ZXIucGxhY2VBdHRhY2sodGFyZ2V0UGxheWVyLCB0YXJnZXQueCwgdGFyZ2V0LnkpXG4gICAgfVxufSIsImV4cG9ydCBpbnRlcmZhY2Ugc2hpcFByb3BzIHtcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgc2l6ZTogbnVtYmVyLFxufVxuXG5leHBvcnQgY2xhc3MgU2hpcCB7XG4gICAgdHlwZTogc3RyaW5nID0gJ3NtYWxsJ1xuICAgIHNpemU6IG51bWJlclxuICAgIGhpdHM6IG51bWJlciA9IDBcbiAgICBrZXlcblxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMua2V5ID0gY3J5cHRvLnJhbmRvbVVVSUQoKVxuICAgIH1cblxuICAgIHB1YmxpYyBpc1N1bmsgPSAoKSA9PiB7IHJldHVybiB0aGlzLmhpdHMgPj0gdGhpcy5zaXplID8gdHJ1ZSA6IGZhbHNlIH07XG5cbiAgICBwdWJsaWMgdGFrZUhpdCgpIHtcbiAgICAgICAgdGhpcy5oaXRzKytcbiAgICB9XG59IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIlxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHg6IG51bWJlcixcbiAgICAgICAgcHVibGljIHk6IG51bWJlcixcbiAgICAgICAgcHVibGljIG9jY3VwaWVkOiBib29sZWFuID0gZmFsc2UsXG4gICAgICAgIHB1YmxpYyBoaXQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgcHVibGljIHNoaXBLZXk/OiBzdHJpbmcpIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZUJvYXJkIHtcbiAgICBnYW1lQm9hcmQ6IFRpbGVbXSA9IFtdXG4gICAgYWN0aXZlU2hpcHM6IFNoaXBbXSA9IFtdXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc2l6ZTogbnVtYmVyXG4gICAgKSB7XG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgc2l6ZTsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHNpemU7IHkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUJvYXJkLnB1c2gobmV3IFRpbGUoeCwgeSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGFjZW1lbnRHcmlkKHN0YXJ0VGlsZTogVGlsZSwgc2hpcFNpemU6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0aWxlc1RvQ2hlY2sgPSBbXVxuICAgICAgICBsZXQgY3VycmVudFRpbGU6IFRpbGUgPSBzdGFydFRpbGVcbiAgICAgICAgaWYgKHRpbGVzVG9DaGVjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRpbGVzVG9DaGVjay5wdXNoKGN1cnJlbnRUaWxlKVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzaGlwU2l6ZSA+IHRpbGVzVG9DaGVjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBuZXdDaGVja2VkVGlsZSA9IHRoaXMuZ2FtZUJvYXJkLmZpbmQoKG5ld0NoZWNrZWRUaWxlKSA9PiBuZXdDaGVja2VkVGlsZS54ID09PSBjdXJyZW50VGlsZS54ICYmIG5ld0NoZWNrZWRUaWxlLnkgPT09IGN1cnJlbnRUaWxlLnkgKyAxKTtcbiAgICAgICAgICAgIGlmIChuZXdDaGVja2VkVGlsZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUaWxlID0gbmV3Q2hlY2tlZFRpbGVcbiAgICAgICAgICAgICAgICB0aWxlc1RvQ2hlY2sucHVzaChjdXJyZW50VGlsZSlcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gW11cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZXNUb0NoZWNrO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZVNoaXAodHlwZTogc3RyaW5nLCBzaXplOiBudW1iZXIsIHN0YXJ0VGlsZTogVGlsZSkge1xuICAgICAgICBjb25zdCBwbGFjZW1lbnRBcmVhID0gdGhpcy5wbGFjZW1lbnRHcmlkKHN0YXJ0VGlsZSwgc2l6ZSlcbiAgICAgICAgaWYgKHBsYWNlbWVudEFyZWEubGVuZ3RoID09PSAwKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2UgaWYgKHBsYWNlbWVudEFyZWEuc29tZSgodGlsZSkgPT4gdGlsZS5vY2N1cGllZCkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzaGlwVG9QbGFjZSA9IG5ldyBTaGlwKHR5cGUsIHNpemUpXG4gICAgICAgICAgICBwbGFjZW1lbnRBcmVhLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLm9jY3VwaWVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRpbGUuc2hpcEtleSA9IHNoaXBUb1BsYWNlLmtleVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU2hpcHMucHVzaChzaGlwVG9QbGFjZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVjZWl2ZUF0dGFjayhhdHRhY2tlZFRpbGU6IFRpbGUpIHtcbiAgICAgICAgaWYgKGF0dGFja2VkVGlsZS5oaXQpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSBpZiAoYXR0YWNrZWRUaWxlLm9jY3VwaWVkKSB7XG4gICAgICAgICAgICBhdHRhY2tlZFRpbGUuaGl0ID0gdHJ1ZVxuICAgICAgICAgICAgaWYgKGF0dGFja2VkVGlsZS5zaGlwS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0YWNrZWRTaGlwID0gdGhpcy5maW5kU2hpcEZyb21LZXkoYXR0YWNrZWRUaWxlLnNoaXBLZXkpXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VkU2hpcCkgYXR0YWNrZWRTaGlwLnRha2VIaXQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgYXR0YWNrZWRUaWxlLmhpdCA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluZFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbmQoKHRpbGUpID0+IHRpbGUueCA9PSB4ICYmIHRpbGUueSA9PSB5KVxuICAgIH1cblxuICAgIGZpbmRTaGlwRnJvbUtleShrZXlUb0ZpbmQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBmb3VuZFNoaXAgPSB0aGlzLmFjdGl2ZVNoaXBzLmZpbmQoKHNoaXApID0+IHNoaXAua2V5ID09PSBrZXlUb0ZpbmQpXG4gICAgICAgIHJldHVybiBmb3VuZFNoaXBcbiAgICB9XG5cbiAgICBwdWJsaWMgY2hlY2tJZkFsbFN1bmsoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNoaXBzLmV2ZXJ5KChzaGlwKSA9PiBzaGlwLmlzU3VuaygpKVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWYWNhbnRUaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbHRlcigodGlsZSkgPT4gIXRpbGUuaGl0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNPY2N1cGllZCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmZpbmRUaWxlKHgsIHkpXG4gICAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5vY2N1cGllZCA/IHRydWUgOiBmYWxzZVxuICAgIH1cblxufSIsImltcG9ydCB7IEdhbWVCb2FyZCB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgc2hpcFByb3BzLCBTaGlwIH0gZnJvbSBcIi4vc2hpcFwiO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyIHtcbiAgICBzaGlwQmVpbmdQbGFjZWQ/OiBzaGlwUHJvcHNcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgICAgICBwdWJsaWMgaHVtYW46IGJvb2xlYW4gPSB0cnVlLFxuICAgICAgICBwdWJsaWMgdGFraW5nVHVybiA9IHRydWUsXG4gICAgICAgIHB1YmxpYyBzaGlwc0F2YWlsYWJsZTogc2hpcFByb3BzW10gPSBbeyB0eXBlOiAndGlueScsIHNpemU6IDEgfSwgeyB0eXBlOiAnc21hbGwnLCBzaXplOiAyIH1dLFxuICAgICAgICBwdWJsaWMgYm9hcmQgPSBuZXcgR2FtZUJvYXJkKDkpLFxuICAgICAgICBwdWJsaWMgcGxhY2luZ1NoaXBzID0gdHJ1ZSxcbiAgICApIHtcbiAgICAgICAgdGhpcy5zaGlwQmVpbmdQbGFjZWQgPSB0aGlzLnNoaXBzQXZhaWxhYmxlLmF0KC0xKVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZUF0dGFjayhlbmVteVBsYXllcjogUGxheWVyLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBlbmVteVBsYXllci5ib2FyZC5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGFyZ2V0ICYmICF0YXJnZXQuaGl0KSB7XG4gICAgICAgICAgICBlbmVteVBsYXllci5ib2FyZC5yZWNlaXZlQXR0YWNrKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnRha2luZ1R1cm4gPSBmYWxzZVxuICAgICAgICAgICAgZW5lbXlQbGF5ZXIuc2V0VHVybigpXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0VHVybigpIHtcbiAgICAgICAgdGhpcy50YWtpbmdUdXJuID0gdHJ1ZVxuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZVNoaXAoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHRoaXMucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaGlwc0F2YWlsYWJsZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gZmFsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gdGhpcy5zaGlwQmVpbmdQbGFjZWRcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMuYm9hcmQuZmluZFRpbGUoeCwgeSlcbiAgICAgICAgICAgIGlmICh0YXJnZXQgJiYgc2hpcFRvUGxhY2UgJiYgIXRhcmdldC5vY2N1cGllZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9hcmQucGxhY2VTaGlwKHNoaXBUb1BsYWNlLnR5cGUsIHNoaXBUb1BsYWNlLnNpemUsIHRhcmdldClcbiAgICAgICAgICAgICAgICB0aGlzLnNoaXBzQXZhaWxhYmxlLnBvcCgpXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hpcHNBdmFpbGFibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGxhY2luZ1NoaXBzID0gZmFsc2VcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHRoaXMuc2hpcHNBdmFpbGFibGUuYXQoLTEpXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHJldHVybiBmYWxzZVxuICAgIH1cbn0iLCJpbXBvcnQgeyBhaVR1cm4gfSBmcm9tIFwiLi9haVwiO1xuaW1wb3J0IHsgUGxheWVyIH0gZnJvbSBcIi4vcGxheWVyXCI7XG5leHBvcnQgbGV0IFAxOiBQbGF5ZXIgPSBuZXcgUGxheWVyKFwiUDFcIilcbmV4cG9ydCBsZXQgUDI6IFBsYXllciA9IG5ldyBQbGF5ZXIoXCJQMlwiLCBmYWxzZSwgZmFsc2UpXG5leHBvcnQgbGV0IHdpbm5lciA9IFwiVEJDXCJcbmV4cG9ydCBsZXQgZ2FtZUluUGxheSA9IHRydWVcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwR2FtZSgpIHtcbiAgICBQMSA9IG5ldyBQbGF5ZXIoXCJQMVwiKVxuICAgIFAyID0gbmV3IFBsYXllcihcIlAyXCIsIGZhbHNlLCBmYWxzZSlcbiAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuXG4gICAgLy8gdGVtcG9yYXJ5IHNoaXAgcGxhY2VtZW50IGFuZCBzZXR1cFxuICAgIFAyLnBsYWNlU2hpcCgxLCAxKVxuICAgIFAyLnBsYWNlU2hpcCgyLCAyKVxuICAgIFAyLnBsYWNpbmdTaGlwcyA9IGZhbHNlXG59XG5cbmV4cG9ydCBjb25zdCBnZXRDdXJyZW50UGxheWVyID0gKCkgPT4ge1xuICAgIGlmIChQMS50YWtpbmdUdXJuICYmICFQMi50YWtpbmdUdXJuKSB7IHJldHVybiBQMSB9XG4gICAgaWYgKFAyLnRha2luZ1R1cm4gJiYgIVAxLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAyIH1cbn1cblxuY29uc3QgZ2V0RW5lbXlQbGF5ZXIgPSAoKSA9PiB7XG4gICAgaWYgKFAxLnRha2luZ1R1cm4gJiYgIVAyLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAyIH1cbiAgICBpZiAoUDIudGFraW5nVHVybiAmJiAhUDEudGFraW5nVHVybikgeyByZXR1cm4gUDEgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDFTaGlwc0F2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gUDEuc2hpcHNBdmFpbGFibGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAyU2hpcHNBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIFAyLnNoaXBzQXZhaWxhYmxlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVDbGljayhib2FyZE5hbWU6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBjb25zdCBjdXJyZW50UGxheWVyOiBQbGF5ZXIgPSBnZXRDdXJyZW50UGxheWVyKCkgYXMgUGxheWVyXG4gICAgY29uc3QgZW5lbXlQbGF5ZXI6IFBsYXllciA9IGdldEVuZW15UGxheWVyKCkgYXMgUGxheWVyXG4gICAgaWYgKGJvYXJkTmFtZSA9PT0gY3VycmVudFBsYXllci5uYW1lKSB7XG4gICAgICAgIGlmICghY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50UGxheWVyLnBsYWNlU2hpcCh4LCB5KVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYm9hcmROYW1lID09PSBlbmVteVBsYXllci5uYW1lICYmICFjdXJyZW50UGxheWVyLnBsYWNpbmdTaGlwcykge1xuICAgICAgICBpZiAoZW5lbXlQbGF5ZXIuYm9hcmQuZmluZFRpbGUoeCwgeSk/LmhpdCkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2VBdHRhY2soZW5lbXlQbGF5ZXIsIHgsIHkpXG4gICAgICAgIGxldCBpc1dpbm5lciA9IGNoZWNrV2lubmVyKClcbiAgICAgICAgaWYgKGdhbWVJblBsYXkgJiYgIWVuZW15UGxheWVyLmh1bWFuKSB7XG4gICAgICAgICAgICBhaVR1cm4oZW5lbXlQbGF5ZXIsIGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGNoZWNrV2lubmVyKCkge1xuICAgIGlmICghUDEuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSAmJiAhUDIuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSkge1xuICAgICAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgZWxzZSBpZiAoUDEuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSA9PT0gdHJ1ZSkge1xuICAgICAgICB3aW5uZXIgPSBQMi5uYW1lXG4gICAgICAgIGdhbWVJblBsYXkgPSBmYWxzZVxuICAgICAgICByZXR1cm4gd2lubmVyXG4gICAgfVxuICAgIGVsc2UgaWYgKFAyLmJvYXJkLmNoZWNrSWZBbGxTdW5rKCkgPT09IHRydWUpIHtcbiAgICAgICAgd2lubmVyID0gUDEubmFtZVxuICAgICAgICBnYW1lSW5QbGF5ID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIHdpbm5lclxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2FtZUluUGxheSA9IHRydWVcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDFCb2FyZCgpIHtcbiAgICByZXR1cm4gUDEuYm9hcmQuZ2FtZUJvYXJkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMkJvYXJkKCkge1xuICAgIHJldHVybiBQMi5ib2FyZC5nYW1lQm9hcmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNoaXBCZWluZ1BsYWNlZCgpIHtcbiAgICBjb25zdCBjdXJyZW50UGxheWVyID0gZ2V0Q3VycmVudFBsYXllcigpXG4gICAgaWYgKGN1cnJlbnRQbGF5ZXIgJiYgY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHJldHVybiBjdXJyZW50UGxheWVyLnNoaXBCZWluZ1BsYWNlZFxufSIsImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgVGlsZSB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgc2hpcFByb3BzIH0gZnJvbSBcIi4vc2hpcFwiO1xuXG5cbmNvbnN0IFAxRnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxRnJhbWVcIikgYXMgSFRNTERpdkVsZW1lbnRcbmNvbnN0IFAyRnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyRnJhbWVcIikgYXMgSFRNTERpdkVsZW1lbnRcblxuZnVuY3Rpb24gY3JlYXRlVGlsZShvd25lcjogc3RyaW5nLCB0aWxlOiBUaWxlKSB7XG4gICAgY29uc3QgbmV3VGlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgbmV3VGlsZS5pZCA9IGAke293bmVyfS0ke3RpbGUueH0tJHt0aWxlLnl9YFxuICAgIGlmIChvd25lciA9PT0gXCJQMVwiICYmIHRpbGUub2NjdXBpZWQgJiYgIXRpbGUuaGl0KSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG15c2hpcFwiXG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbGUuaGl0ICYmICF0aWxlLm9jY3VwaWVkKSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG1pc3NcIlxuICAgICAgICBuZXdUaWxlLmlubmVyVGV4dCA9IFwieFwiXG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbGUuaGl0ICYmIHRpbGUub2NjdXBpZWQpIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGUgaGl0XCJcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlXCJcbiAgICB9XG4gICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgaWYgKGdhbWUuZ2FtZUluUGxheSkge1xuICAgICAgICAgICAgZ2FtZS5oYW5kbGVDbGljayhvd25lciwgdGlsZS54LCB0aWxlLnkpXG4gICAgICAgICAgICByZWZyZXNoQm9hcmRzKClcbiAgICAgICAgICAgIHJlZnJlc2hIYXJib3VycygpXG4gICAgICAgIH1cbiAgICB9KVxuICAgIGlmIChnYW1lLmdldEN1cnJlbnRQbGF5ZXIoKT8ucGxhY2luZ1NoaXBzICYmIG93bmVyID09PSBnYW1lLmdldEN1cnJlbnRQbGF5ZXIoKT8ubmFtZSkge1xuICAgICAgICBuZXdUaWxlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgICAgICAgICBzaGlwU2hhZG93KG93bmVyLCB0aWxlKVxuICAgICAgICB9KVxuICAgICAgICBuZXdUaWxlLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgICAgICAgICByZW1vdmVTaGlwU2hhZG93KG93bmVyLCB0aWxlKVxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gbmV3VGlsZVxufVxuXG5mdW5jdGlvbiBjbGlja1JlZihpZFN0cmluZzogc3RyaW5nKSB7XG4gICAgY29uc3QgcGFyYW1zID0gaWRTdHJpbmcuc3BsaXQoJy0nKVxuICAgIHJldHVybiBwYXJhbXNcbn1cblxuZnVuY3Rpb24gcmVmcmVzaFRpbGUocmVmZXJlbmNlVGlsZTogSFRNTEVsZW1lbnQpIHtcbiAgICBjb25zdCBpZEFycmF5ID0gY2xpY2tSZWYocmVmZXJlbmNlVGlsZS5pZClcbiAgICBjb25zdCBvd25lciA9IGlkQXJyYXlbMF1cbiAgICBjb25zdCB4ID0gTnVtYmVyKGlkQXJyYXlbMV0pXG4gICAgY29uc3QgeSA9IE51bWJlcihpZEFycmF5WzJdKVxuICAgIGlmIChvd25lciA9PT0gJ1AxJykge1xuICAgICAgICBjb25zdCBib2FyZEluZm8gPSBnYW1lLlAxLmJvYXJkXG4gICAgICAgIGNvbnN0IHRpbGVJbmZvID0gYm9hcmRJbmZvLmZpbmRUaWxlKHgsIHkpXG4gICAgICAgIGlmICh0aWxlSW5mbz8ub2NjdXBpZWQpIHtcbiAgICAgICAgICAgIHJlZmVyZW5jZVRpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG15c2hpcFwiXG4gICAgICAgIH0gZWxzZSB7IHJlZmVyZW5jZVRpbGUuY2xhc3NOYW1lID0gXCJ0aWxlXCIgfVxuICAgIH1cblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaEJvYXJkcygpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdub25lJztcblxuICAgIGNvbnN0IFAxQm9hcmQgPSBnYW1lLmdldFAxQm9hcmQoKVxuICAgIGNvbnN0IFAyQm9hcmQgPSBnYW1lLmdldFAyQm9hcmQoKVxuXG4gICAgLy8gY3JlYXRlIERPTSBlbGVtZW50cyBmb3IgUDEgYm9hcmRcbiAgICBQMUZyYW1lLmlubmVySFRNTCA9ICcnXG4gICAgUDFCb2FyZC5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgICBjb25zdCBuZXdUaWxlID0gY3JlYXRlVGlsZShcIlAxXCIsIHRpbGUpXG4gICAgICAgIFAxRnJhbWUuYXBwZW5kQ2hpbGQobmV3VGlsZSlcbiAgICB9KVxuXG4gICAgLy8gY3JlYXRlIERPTSBlbGVtZW50cyBmb3IgUDIgYm9hcmRcbiAgICBQMkZyYW1lLmlubmVySFRNTCA9ICcnXG4gICAgUDJCb2FyZC5mb3JFYWNoKHRpbGUgPT4ge1xuICAgICAgICBjb25zdCBuZXdUaWxlID0gY3JlYXRlVGlsZShcIlAyXCIsIHRpbGUpXG4gICAgICAgIFAyRnJhbWUuYXBwZW5kQ2hpbGQobmV3VGlsZSlcbiAgICB9KVxuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUuY3Vyc29yID0gJ2F1dG8nO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWZyZXNoSGFyYm91cnMoKSB7XG4gICAgY29uc3QgUDFTaGlwcyA9IGdhbWUuZ2V0UDFTaGlwc0F2YWlsYWJsZSgpXG4gICAgY29uc3QgUDJTaGlwcyA9IGdhbWUuZ2V0UDJTaGlwc0F2YWlsYWJsZSgpXG4gICAgY29uc3QgUDFIYXJib3VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMUhhcmJvdXJcIikgYXMgSFRNTERpdkVsZW1lbnRcbiAgICBQMUhhcmJvdXIuaW5uZXJIVE1MID0gJzxoND5IYXJib3VyIChzaGlwcyB0byBwbGFjZSk8L2g0PidcbiAgICBjb25zdCBQMkhhcmJvdXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAySGFyYm91clwiKSBhcyBIVE1MRGl2RWxlbWVudFxuICAgIFAySGFyYm91ci5pbm5lckhUTUwgPSAnPGg0PkhhcmJvdXI8L2g0PidcbiAgICBQMVNoaXBzLmZvckVhY2goKHNoaXApID0+IHtcbiAgICAgICAgY29uc3QgbmV3U2hpcERpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICAgIG5ld1NoaXBEaXYuaW5uZXJUZXh0ID0gYCR7c2hpcC50eXBlfSAoJHtzaGlwLnNpemV9KWBcbiAgICAgICAgaWYgKHNoaXAgPT09IGdhbWUuZ2V0U2hpcEJlaW5nUGxhY2VkKCkpIHtcbiAgICAgICAgICAgIG5ld1NoaXBEaXYuY2xhc3NOYW1lID0gXCJjdXJyZW50U2hpcFwiXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiaGFyYm91clNoaXBcIlxuICAgICAgICB9XG4gICAgICAgIFAxSGFyYm91ci5hcHBlbmRDaGlsZChuZXdTaGlwRGl2KVxuICAgIH0pXG4gICAgUDJTaGlwcy5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBuZXdTaGlwRGl2LmlubmVyVGV4dCA9IGAke3NoaXAudHlwZX0gKCR7c2hpcC5zaXplfSlgXG4gICAgICAgIG5ld1NoaXBEaXYuY2xhc3NOYW1lID0gXCJoYXJib3VyU2hpcFwiXG4gICAgICAgIFAySGFyYm91ci5hcHBlbmRDaGlsZChuZXdTaGlwRGl2KVxuICAgIH0pXG59XG5cbmZ1bmN0aW9uIHNoaXBTaGFkb3cob3duZXI6IHN0cmluZywgaG92ZXJUaWxlOiBUaWxlKSB7XG4gICAgY29uc3Qgc2hpcFRvUGxhY2UgPSBnYW1lLmdldFNoaXBCZWluZ1BsYWNlZCgpIGFzIHNoaXBQcm9wc1xuICAgIGNvbnN0IGhpZ2hsaWdodEFyZWE6IEhUTUxFbGVtZW50W10gPSBbXVxuICAgIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBzaGlwVG9QbGFjZS5zaXplOyBpbmRleCsrKSB7XG4gICAgICAgIGNvbnN0IHRpbGVJRCA9IGAke293bmVyfS0ke2hvdmVyVGlsZS54fS0ke2hvdmVyVGlsZS55ICsgaW5kZXh9YFxuICAgICAgICBjb25zdCB0aWxlVG9IaWdobGlnaHQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCh0aWxlSUQpXG4gICAgICAgIGlmICh0aWxlVG9IaWdobGlnaHQpIHsgaGlnaGxpZ2h0QXJlYS5wdXNoKHRpbGVUb0hpZ2hsaWdodCkgfVxuICAgICAgICBlbHNlIGJyZWFrXG4gICAgfVxuICAgIGlmIChoaWdobGlnaHRBcmVhLmxlbmd0aCA9PT0gc2hpcFRvUGxhY2Uuc2l6ZSkge1xuICAgICAgICBoaWdobGlnaHRBcmVhLmZvckVhY2goKGhpZ2hsaWdodGVkVGlsZSkgPT4ge1xuICAgICAgICAgICAgaGlnaGxpZ2h0ZWRUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBzaGFkb3dcIlxuICAgICAgICB9KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU2hpcFNoYWRvdyhvd25lcjogc3RyaW5nLCBob3ZlclRpbGU6IFRpbGUpIHtcbiAgICBjb25zdCBzaGlwVG9QbGFjZSA9IGdhbWUuZ2V0U2hpcEJlaW5nUGxhY2VkKCkgYXMgc2hpcFByb3BzXG4gICAgY29uc3QgaGlnaGxpZ2h0QXJlYTogSFRNTEVsZW1lbnRbXSA9IFtdXG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHNoaXBUb1BsYWNlLnNpemU7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdGlsZUlEID0gYCR7b3duZXJ9LSR7aG92ZXJUaWxlLnh9LSR7aG92ZXJUaWxlLnkgKyBpbmRleH1gXG4gICAgICAgIGNvbnN0IHRpbGVUb0hpZ2hsaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRpbGVJRClcbiAgICAgICAgaWYgKHRpbGVUb0hpZ2hsaWdodCkgeyBoaWdobGlnaHRBcmVhLnB1c2godGlsZVRvSGlnaGxpZ2h0KSB9XG4gICAgICAgIGVsc2UgYnJlYWtcbiAgICB9XG4gICAgaGlnaGxpZ2h0QXJlYS5mb3JFYWNoKChoaWdobGlnaHRlZFRpbGUpID0+IHtcbiAgICAgICAgcmVmcmVzaFRpbGUoaGlnaGxpZ2h0ZWRUaWxlKVxuICAgIH0pXG59IiwiaW1wb3J0ICogYXMgRE9NIGZyb20gXCIuL2NvbnRyb2xcIlxuaW1wb3J0IHsgc2V0dXBHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiXG5cbnNldHVwR2FtZSgpXG5ET00ucmVmcmVzaEJvYXJkcygpXG5ET00ucmVmcmVzaEhhcmJvdXJzKCkiXX0=