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
  constructor(name, human = true, takingTurn = true, shipsAvailable = [{ type: "tiny", size: 1 }, { type: "small", size: 2 }, { type: "huge", size: 4 }], board = new GameBoard(9), placingShips = true) {
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
        if (this.board.placeShip(shipToPlace.type, shipToPlace.size, target)) {
          this.shipsAvailable.pop();
          if (this.shipsAvailable.length === 0) {
            this.shipBeingPlaced = void 0;
            this.placingShips = false;
            return true;
          } else
            this.shipBeingPlaced = this.shipsAvailable.at(-1);
          return true;
        }
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
      alert("Your ships are places. Attack the enemy board by clicking a vacant square.");
      return false;
    } else {
      if (currentPlayer.placeShip(x, y) && gameInPlay && !enemyPlayer.human) {
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
  if (P1.placingShips || P2.placingShips) {
    return false;
  }
  if (!P1.board.checkIfAllSunk() && !P2.board.checkIfAllSunk()) {
    gameInPlay = true;
    return false;
  } else if (P1.board.checkIfAllSunk() === true) {
    winner = P2.name;
    gameInPlay = false;
    declareWinner();
    return winner;
  } else if (P2.board.checkIfAllSunk() === true) {
    winner = P1.name;
    gameInPlay = false;
    declareWinner();
    return winner;
  } else {
    gameInPlay = true;
    return false;
  }
}
function declareWinner() {
  if (winner != "TBC") {
    if (confirm(`**${winner} won the game!**
Play again?`) == true) {
      setupGame();
    } else {
      let main = document.getElementById("main");
      main.style.display = "none";
      alert("Okay, bye bye!");
    }
  } else
    return;
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
      checkWinner();
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
  var _a;
  const shipToPlace = getShipBeingPlaced();
  const highlightArea = [];
  if (hoverTile.occupied) {
    return;
  }
  if (owner != ((_a = getCurrentPlayer()) == null ? void 0 : _a.name)) {
    return;
  }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9haS50cyIsIi4uLy4uL3NyYy9zaGlwLnRzIiwiLi4vLi4vc3JjL2dhbWVib2FyZC50cyIsIi4uLy4uL3NyYy9wbGF5ZXIudHMiLCIuLi8uLi9zcmMvZ2FtZS50cyIsIi4uLy4uL3NyYy9jb250cm9sLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbIm5ld0NoZWNrZWRUaWxlIl0sIm1hcHBpbmdzIjoiO0FBRU8sU0FBUyxPQUFPLFVBQWtCLGNBQXNCO0FBQzNELE1BQUksU0FBUyxjQUFjO0FBQ3ZCLFVBQU0sYUFBYSxTQUFTLE1BQU0sZUFBZTtBQUNqRCxVQUFNLGVBQWUsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTTtBQUNqRSxVQUFNLFNBQVMsV0FBVyxZQUFZO0FBQ3RDLGFBQVMsVUFBVSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekMsV0FDUyxDQUFDLFNBQVMsY0FBYztBQUM3QixVQUFNLGFBQWEsYUFBYSxNQUFNLGNBQWM7QUFDcEQsVUFBTSxlQUFlLEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxXQUFXLE1BQU07QUFDakUsVUFBTSxTQUFTLFdBQVcsWUFBWTtBQUN0QyxhQUFTLFlBQVksY0FBYyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekQ7QUFDSjs7O0FDVk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQU1kLFlBQVksTUFBYyxNQUFjO0FBTHhDLGdCQUFlO0FBRWYsZ0JBQWU7QUFTZixTQUFPLFNBQVMsTUFBTTtBQUFFLGFBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxPQUFPO0FBQUEsSUFBTTtBQUxqRSxTQUFLLE9BQU87QUFDWixTQUFLLE9BQU87QUFDWixTQUFLLE1BQU0sT0FBTyxXQUFXO0FBQUEsRUFDakM7QUFBQSxFQUlPLFVBQVU7QUFDYixTQUFLO0FBQUEsRUFDVDtBQUNKOzs7QUNwQk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQUVkLFlBQ1csR0FDQSxHQUNBLFdBQW9CLE9B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TUFBTTtBQUMzQyxrQkFBYyxRQUFRLENBQUMsb0JBQW9CO0FBQ3ZDLHNCQUFnQixZQUFZO0FBQUEsSUFDaEMsQ0FBQztBQUFBLEVBQ0w7QUFDSjtBQUVBLFNBQVMsaUJBQWlCLE9BQWUsV0FBaUI7QUFDdEQsUUFBTSxjQUFtQixtQkFBbUI7QUFDNUMsUUFBTSxnQkFBK0IsQ0FBQztBQUN0QyxXQUFTLFFBQVEsR0FBRyxRQUFRLFlBQVksTUFBTSxTQUFTO0FBQ25ELFVBQU0sU0FBUyxHQUFHLEtBQUssSUFBSSxVQUFVLENBQUMsSUFBSSxVQUFVLElBQUksS0FBSztBQUM3RCxVQUFNLGtCQUFrQixTQUFTLGVBQWUsTUFBTTtBQUN0RCxRQUFJLGlCQUFpQjtBQUFFLG9CQUFjLEtBQUssZUFBZTtBQUFBLElBQUU7QUFDdEQ7QUFBQSxFQUNUO0FBQ0EsZ0JBQWMsUUFBUSxDQUFDLG9CQUFvQjtBQUN2QyxnQkFBWSxlQUFlO0FBQUEsRUFDL0IsQ0FBQztBQUNMOzs7QUM1SUEsVUFBVTtBQUNOLGNBQWM7QUFDZCxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQbGF5ZXIgfSBmcm9tICcuL3BsYXllcic7XG5cbmV4cG9ydCBmdW5jdGlvbiBhaVR1cm4oYWlQbGF5ZXI6IFBsYXllciwgdGFyZ2V0UGxheWVyOiBQbGF5ZXIpIHtcbiAgICBpZiAoYWlQbGF5ZXIucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FsTW92ZXMgPSBhaVBsYXllci5ib2FyZC5nZXRWYWNhbnRUaWxlcygpXG4gICAgICAgIGNvbnN0IGNob29zZVRhcmdldCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlZ2FsTW92ZXMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbGVnYWxNb3Zlc1tjaG9vc2VUYXJnZXRdXG4gICAgICAgIGFpUGxheWVyLnBsYWNlU2hpcCh0YXJnZXQueCwgdGFyZ2V0LnkpXG4gICAgfVxuICAgIGVsc2UgaWYgKCFhaVBsYXllci5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgY29uc3QgbGVnYWxNb3ZlcyA9IHRhcmdldFBsYXllci5ib2FyZC5nZXRVbmhpdFRpbGVzKClcbiAgICAgICAgY29uc3QgY2hvb3NlVGFyZ2V0ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbGVnYWxNb3Zlcy5sZW5ndGgpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBsZWdhbE1vdmVzW2Nob29zZVRhcmdldF1cbiAgICAgICAgYWlQbGF5ZXIucGxhY2VBdHRhY2sodGFyZ2V0UGxheWVyLCB0YXJnZXQueCwgdGFyZ2V0LnkpXG4gICAgfVxufSIsImV4cG9ydCBpbnRlcmZhY2Ugc2hpcFByb3BzIHtcbiAgICB0eXBlOiBzdHJpbmcsXG4gICAgc2l6ZTogbnVtYmVyLFxufVxuXG5leHBvcnQgY2xhc3MgU2hpcCB7XG4gICAgdHlwZTogc3RyaW5nID0gJ3NtYWxsJ1xuICAgIHNpemU6IG51bWJlclxuICAgIGhpdHM6IG51bWJlciA9IDBcbiAgICBrZXlcblxuICAgIGNvbnN0cnVjdG9yKHR5cGU6IHN0cmluZywgc2l6ZTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2l6ZSA9IHNpemU7XG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMua2V5ID0gY3J5cHRvLnJhbmRvbVVVSUQoKVxuICAgIH1cblxuICAgIHB1YmxpYyBpc1N1bmsgPSAoKSA9PiB7IHJldHVybiB0aGlzLmhpdHMgPj0gdGhpcy5zaXplID8gdHJ1ZSA6IGZhbHNlIH07XG5cbiAgICBwdWJsaWMgdGFrZUhpdCgpIHtcbiAgICAgICAgdGhpcy5oaXRzKytcbiAgICB9XG59IiwiaW1wb3J0IHsgU2hpcCB9IGZyb20gXCIuL3NoaXBcIlxuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIHg6IG51bWJlcixcbiAgICAgICAgcHVibGljIHk6IG51bWJlcixcbiAgICAgICAgcHVibGljIG9jY3VwaWVkOiBib29sZWFuID0gZmFsc2UsXG4gICAgICAgIHB1YmxpYyBoaXQ6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgICAgcHVibGljIHNoaXBLZXk/OiBzdHJpbmcpIHsgfVxufVxuXG5leHBvcnQgY2xhc3MgR2FtZUJvYXJkIHtcbiAgICBnYW1lQm9hcmQ6IFRpbGVbXSA9IFtdXG4gICAgYWN0aXZlU2hpcHM6IFNoaXBbXSA9IFtdXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgc2l6ZTogbnVtYmVyXG4gICAgKSB7XG4gICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgc2l6ZTsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHNpemU7IHkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2FtZUJvYXJkLnB1c2gobmV3IFRpbGUoeCwgeSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwbGFjZW1lbnRHcmlkKHN0YXJ0VGlsZTogVGlsZSwgc2hpcFNpemU6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0aWxlc1RvQ2hlY2sgPSBbXVxuICAgICAgICBsZXQgY3VycmVudFRpbGU6IFRpbGUgPSBzdGFydFRpbGVcbiAgICAgICAgaWYgKHRpbGVzVG9DaGVjay5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRpbGVzVG9DaGVjay5wdXNoKGN1cnJlbnRUaWxlKVxuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChzaGlwU2l6ZSA+IHRpbGVzVG9DaGVjay5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBuZXdDaGVja2VkVGlsZSA9IHRoaXMuZ2FtZUJvYXJkLmZpbmQoKG5ld0NoZWNrZWRUaWxlKSA9PiBuZXdDaGVja2VkVGlsZS54ID09PSBjdXJyZW50VGlsZS54ICYmIG5ld0NoZWNrZWRUaWxlLnkgPT09IGN1cnJlbnRUaWxlLnkgKyAxKTtcbiAgICAgICAgICAgIGlmIChuZXdDaGVja2VkVGlsZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUaWxlID0gbmV3Q2hlY2tlZFRpbGVcbiAgICAgICAgICAgICAgICB0aWxlc1RvQ2hlY2sucHVzaChjdXJyZW50VGlsZSlcbiAgICAgICAgICAgIH0gZWxzZSByZXR1cm4gW11cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGlsZXNUb0NoZWNrO1xuICAgIH1cblxuICAgIHB1YmxpYyBwbGFjZVNoaXAodHlwZTogc3RyaW5nLCBzaXplOiBudW1iZXIsIHN0YXJ0VGlsZTogVGlsZSkge1xuICAgICAgICBjb25zdCBwbGFjZW1lbnRBcmVhID0gdGhpcy5wbGFjZW1lbnRHcmlkKHN0YXJ0VGlsZSwgc2l6ZSlcbiAgICAgICAgaWYgKHBsYWNlbWVudEFyZWEubGVuZ3RoID09PSAwKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2UgaWYgKHBsYWNlbWVudEFyZWEuc29tZSgodGlsZSkgPT4gdGlsZS5vY2N1cGllZCkpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBzaGlwVG9QbGFjZSA9IG5ldyBTaGlwKHR5cGUsIHNpemUpXG4gICAgICAgICAgICBwbGFjZW1lbnRBcmVhLmZvckVhY2goKHRpbGUpID0+IHtcbiAgICAgICAgICAgICAgICB0aWxlLm9jY3VwaWVkID0gdHJ1ZVxuICAgICAgICAgICAgICAgIHRpbGUuc2hpcEtleSA9IHNoaXBUb1BsYWNlLmtleVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHRoaXMuYWN0aXZlU2hpcHMucHVzaChzaGlwVG9QbGFjZSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVjZWl2ZUF0dGFjayhhdHRhY2tlZFRpbGU6IFRpbGUpIHtcbiAgICAgICAgaWYgKGF0dGFja2VkVGlsZS5oaXQpIHsgcmV0dXJuIGZhbHNlIH1cbiAgICAgICAgZWxzZSBpZiAoYXR0YWNrZWRUaWxlLm9jY3VwaWVkKSB7XG4gICAgICAgICAgICBhdHRhY2tlZFRpbGUuaGl0ID0gdHJ1ZVxuICAgICAgICAgICAgaWYgKGF0dGFja2VkVGlsZS5zaGlwS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYXR0YWNrZWRTaGlwID0gdGhpcy5maW5kU2hpcEZyb21LZXkoYXR0YWNrZWRUaWxlLnNoaXBLZXkpXG4gICAgICAgICAgICAgICAgaWYgKGF0dGFja2VkU2hpcCkgYXR0YWNrZWRTaGlwLnRha2VIaXQoKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgYXR0YWNrZWRUaWxlLmhpdCA9IHRydWVcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluZFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbmQoKHRpbGUpID0+IHRpbGUueCA9PSB4ICYmIHRpbGUueSA9PSB5KVxuICAgIH1cblxuICAgIHB1YmxpYyBmaW5kU2hpcEZyb21LZXkoa2V5VG9GaW5kOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgZm91bmRTaGlwID0gdGhpcy5hY3RpdmVTaGlwcy5maW5kKChzaGlwKSA9PiBzaGlwLmtleSA9PT0ga2V5VG9GaW5kKVxuICAgICAgICByZXR1cm4gZm91bmRTaGlwXG4gICAgfVxuXG4gICAgcHVibGljIGNoZWNrSWZBbGxTdW5rKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVTaGlwcy5ldmVyeSgoc2hpcCkgPT4gc2hpcC5pc1N1bmsoKSlcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VW5oaXRUaWxlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2FtZUJvYXJkLmZpbHRlcigodGlsZSkgPT4gIXRpbGUuaGl0KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0VmFjYW50VGlsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVCb2FyZC5maWx0ZXIoKHRpbGUpID0+ICF0aWxlLm9jY3VwaWVkKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNPY2N1cGllZCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmZpbmRUaWxlKHgsIHkpXG4gICAgICAgIGlmICh0YXJnZXQpIHRhcmdldC5vY2N1cGllZCA/IHRydWUgOiBmYWxzZVxuICAgIH1cbn0iLCJpbXBvcnQgeyBHYW1lQm9hcmQgfSBmcm9tIFwiLi9nYW1lYm9hcmRcIjtcbmltcG9ydCB7IHNoaXBQcm9wcywgU2hpcCB9IGZyb20gXCIuL3NoaXBcIjtcblxuZXhwb3J0IGNsYXNzIFBsYXllciB7XG4gICAgc2hpcEJlaW5nUGxhY2VkPzogc2hpcFByb3BzXG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIG5hbWU6IHN0cmluZyxcbiAgICAgICAgcHVibGljIGh1bWFuOiBib29sZWFuID0gdHJ1ZSxcbiAgICAgICAgcHVibGljIHRha2luZ1R1cm4gPSB0cnVlLFxuICAgICAgICBwdWJsaWMgc2hpcHNBdmFpbGFibGU6IHNoaXBQcm9wc1tdID0gW3sgdHlwZTogJ3RpbnknLCBzaXplOiAxIH0sIHsgdHlwZTogJ3NtYWxsJywgc2l6ZTogMiB9LCB7IHR5cGU6ICdodWdlJywgc2l6ZTogNCB9XSxcbiAgICAgICAgcHVibGljIGJvYXJkID0gbmV3IEdhbWVCb2FyZCg5KSxcbiAgICAgICAgcHVibGljIHBsYWNpbmdTaGlwcyA9IHRydWUsXG4gICAgKSB7XG4gICAgICAgIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdGhpcy5zaGlwc0F2YWlsYWJsZS5hdCgtMSlcbiAgICB9XG5cbiAgICBwdWJsaWMgcGxhY2VBdHRhY2soZW5lbXlQbGF5ZXI6IFBsYXllciwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZW5lbXlQbGF5ZXIuYm9hcmQuZmluZFRpbGUoeCwgeSlcbiAgICAgICAgaWYgKHRhcmdldCAmJiAhdGFyZ2V0LmhpdCkge1xuICAgICAgICAgICAgZW5lbXlQbGF5ZXIuYm9hcmQucmVjZWl2ZUF0dGFjayh0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy50YWtpbmdUdXJuID0gZmFsc2VcbiAgICAgICAgICAgIGVuZW15UGxheWVyLnNldFR1cm4oKVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNldFR1cm4oKSB7XG4gICAgICAgIHRoaXMudGFraW5nVHVybiA9IHRydWVcbiAgICB9XG5cbiAgICBwdWJsaWMgcGxhY2VTaGlwKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh0aGlzLnBsYWNpbmdTaGlwcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hpcHNBdmFpbGFibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaGlwQmVpbmdQbGFjZWQgPSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICB0aGlzLnBsYWNpbmdTaGlwcyA9IGZhbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzaGlwVG9QbGFjZSA9IHRoaXMuc2hpcEJlaW5nUGxhY2VkXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLmJvYXJkLmZpbmRUaWxlKHgsIHkpXG4gICAgICAgICAgICBpZiAodGFyZ2V0ICYmIHNoaXBUb1BsYWNlICYmICF0YXJnZXQub2NjdXBpZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5ib2FyZC5wbGFjZVNoaXAoc2hpcFRvUGxhY2UudHlwZSwgc2hpcFRvUGxhY2Uuc2l6ZSwgdGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNoaXBzQXZhaWxhYmxlLnBvcCgpXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hpcHNBdmFpbGFibGUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGFjaW5nU2hpcHMgPSBmYWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdGhpcy5zaGlwc0F2YWlsYWJsZS5hdCgtMSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSByZXR1cm4gZmFsc2VcbiAgICB9XG59IiwiaW1wb3J0IHsgYWlUdXJuIH0gZnJvbSBcIi4vYWlcIjtcbmltcG9ydCB7IFBsYXllciB9IGZyb20gXCIuL3BsYXllclwiO1xuZXhwb3J0IGxldCBQMTogUGxheWVyID0gbmV3IFBsYXllcihcIlAxXCIpXG5leHBvcnQgbGV0IFAyOiBQbGF5ZXIgPSBuZXcgUGxheWVyKFwiUDJcIiwgZmFsc2UsIGZhbHNlKVxuZXhwb3J0IGxldCB3aW5uZXIgPSBcIlRCQ1wiXG5leHBvcnQgbGV0IGdhbWVJblBsYXkgPSB0cnVlXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEdhbWUoKSB7XG4gICAgUDEgPSBuZXcgUGxheWVyKFwiUDFcIilcbiAgICBQMiA9IG5ldyBQbGF5ZXIoXCJQMlwiLCBmYWxzZSwgZmFsc2UpXG4gICAgZ2FtZUluUGxheSA9IHRydWVcbiAgICB3aW5uZXIgPSBcIlRCQ1wiXG59XG5cbmV4cG9ydCBjb25zdCBnZXRDdXJyZW50UGxheWVyID0gKCkgPT4ge1xuICAgIGlmIChQMS50YWtpbmdUdXJuICYmICFQMi50YWtpbmdUdXJuKSB7IHJldHVybiBQMSB9XG4gICAgaWYgKFAyLnRha2luZ1R1cm4gJiYgIVAxLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAyIH1cbn1cblxuY29uc3QgZ2V0RW5lbXlQbGF5ZXIgPSAoKSA9PiB7XG4gICAgaWYgKFAxLnRha2luZ1R1cm4gJiYgIVAyLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAyIH1cbiAgICBpZiAoUDIudGFraW5nVHVybiAmJiAhUDEudGFraW5nVHVybikgeyByZXR1cm4gUDEgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDFTaGlwc0F2YWlsYWJsZSgpIHtcbiAgICByZXR1cm4gUDEuc2hpcHNBdmFpbGFibGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAyU2hpcHNBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIFAyLnNoaXBzQXZhaWxhYmxlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYW5kbGVDbGljayhib2FyZE5hbWU6IHN0cmluZywgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBjb25zdCBjdXJyZW50UGxheWVyOiBQbGF5ZXIgPSBnZXRDdXJyZW50UGxheWVyKCkgYXMgUGxheWVyXG4gICAgY29uc3QgZW5lbXlQbGF5ZXI6IFBsYXllciA9IGdldEVuZW15UGxheWVyKCkgYXMgUGxheWVyXG4gICAgaWYgKGJvYXJkTmFtZSA9PT0gY3VycmVudFBsYXllci5uYW1lKSB7XG4gICAgICAgIGlmICghY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiWW91ciBzaGlwcyBhcmUgcGxhY2VzLiBBdHRhY2sgdGhlIGVuZW15IGJvYXJkIGJ5IGNsaWNraW5nIGEgdmFjYW50IHNxdWFyZS5cIilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRQbGF5ZXIucGxhY2VTaGlwKHgsIHkpICYmIGdhbWVJblBsYXkgJiYgIWVuZW15UGxheWVyLmh1bWFuKSB7XG4gICAgICAgICAgICAgICAgYWlUdXJuKGVuZW15UGxheWVyLCBjdXJyZW50UGxheWVyKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoYm9hcmROYW1lID09PSBlbmVteVBsYXllci5uYW1lICYmICFjdXJyZW50UGxheWVyLnBsYWNpbmdTaGlwcykge1xuICAgICAgICBpZiAoZW5lbXlQbGF5ZXIuYm9hcmQuZmluZFRpbGUoeCwgeSk/LmhpdCkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGN1cnJlbnRQbGF5ZXIucGxhY2VBdHRhY2soZW5lbXlQbGF5ZXIsIHgsIHkpXG4gICAgICAgIGNoZWNrV2lubmVyKClcbiAgICAgICAgaWYgKGdhbWVJblBsYXkgJiYgIWVuZW15UGxheWVyLmh1bWFuKSB7XG4gICAgICAgICAgICBhaVR1cm4oZW5lbXlQbGF5ZXIsIGN1cnJlbnRQbGF5ZXIpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1dpbm5lcigpIHtcbiAgICBpZiAoUDEucGxhY2luZ1NoaXBzIHx8IFAyLnBsYWNpbmdTaGlwcykgeyByZXR1cm4gZmFsc2UgfVxuICAgIGlmICghUDEuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSAmJiAhUDIuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSkge1xuICAgICAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgZWxzZSBpZiAoUDEuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSA9PT0gdHJ1ZSkge1xuICAgICAgICB3aW5uZXIgPSBQMi5uYW1lXG4gICAgICAgIGdhbWVJblBsYXkgPSBmYWxzZVxuICAgICAgICBkZWNsYXJlV2lubmVyKClcbiAgICAgICAgcmV0dXJuIHdpbm5lclxuICAgIH1cbiAgICBlbHNlIGlmIChQMi5ib2FyZC5jaGVja0lmQWxsU3VuaygpID09PSB0cnVlKSB7XG4gICAgICAgIHdpbm5lciA9IFAxLm5hbWVcbiAgICAgICAgZ2FtZUluUGxheSA9IGZhbHNlXG4gICAgICAgIGRlY2xhcmVXaW5uZXIoKVxuICAgICAgICByZXR1cm4gd2lubmVyXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRlY2xhcmVXaW5uZXIoKSB7XG4gICAgaWYgKHdpbm5lciAhPSBcIlRCQ1wiKSB7XG4gICAgICAgIGlmIChjb25maXJtKGAqKiR7d2lubmVyfSB3b24gdGhlIGdhbWUhKipcXG5QbGF5IGFnYWluP2ApID09IHRydWUpIHtcbiAgICAgICAgICAgIHNldHVwR2FtZSgpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgbWFpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluJykgYXMgSFRNTEVsZW1lbnRcbiAgICAgICAgICAgIG1haW4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiXG4gICAgICAgICAgICBhbGVydCgnT2theSwgYnllIGJ5ZSEnKVxuICAgICAgICB9XG4gICAgfSBlbHNlIHJldHVyblxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDFCb2FyZCgpIHtcbiAgICByZXR1cm4gUDEuYm9hcmQuZ2FtZUJvYXJkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMkJvYXJkKCkge1xuICAgIHJldHVybiBQMi5ib2FyZC5nYW1lQm9hcmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNoaXBCZWluZ1BsYWNlZCgpIHtcbiAgICBjb25zdCBjdXJyZW50UGxheWVyID0gZ2V0Q3VycmVudFBsYXllcigpXG4gICAgaWYgKGN1cnJlbnRQbGF5ZXIgJiYgY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHJldHVybiBjdXJyZW50UGxheWVyLnNoaXBCZWluZ1BsYWNlZFxufSIsImltcG9ydCAqIGFzIGdhbWUgZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgVGlsZSB9IGZyb20gXCIuL2dhbWVib2FyZFwiO1xuaW1wb3J0IHsgc2hpcFByb3BzIH0gZnJvbSBcIi4vc2hpcFwiO1xuXG5cbmNvbnN0IFAxRnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAxRnJhbWVcIikgYXMgSFRNTERpdkVsZW1lbnRcbmNvbnN0IFAyRnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIlAyRnJhbWVcIikgYXMgSFRNTERpdkVsZW1lbnRcblxuZnVuY3Rpb24gY3JlYXRlVGlsZShvd25lcjogc3RyaW5nLCB0aWxlOiBUaWxlKSB7XG4gICAgY29uc3QgbmV3VGlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgbmV3VGlsZS5pZCA9IGAke293bmVyfS0ke3RpbGUueH0tJHt0aWxlLnl9YFxuICAgIGlmIChvd25lciA9PT0gXCJQMVwiICYmIHRpbGUub2NjdXBpZWQgJiYgIXRpbGUuaGl0KSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG15c2hpcFwiXG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbGUuaGl0ICYmICF0aWxlLm9jY3VwaWVkKSB7XG4gICAgICAgIG5ld1RpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIG1pc3NcIlxuICAgICAgICBuZXdUaWxlLmlubmVyVGV4dCA9IFwieFwiXG4gICAgfVxuICAgIGVsc2UgaWYgKHRpbGUuaGl0ICYmIHRpbGUub2NjdXBpZWQpIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGUgaGl0XCJcbiAgICAgICAgbmV3VGlsZS5pbm5lclRleHQgPSBcImhpdCFcIlxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGVcIlxuICAgIH1cbiAgICBuZXdUaWxlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBpZiAoZ2FtZS5nYW1lSW5QbGF5KSB7XG4gICAgICAgICAgICBnYW1lLmhhbmRsZUNsaWNrKG93bmVyLCB0aWxlLngsIHRpbGUueSlcbiAgICAgICAgICAgIHJlZnJlc2hCb2FyZHMoKVxuICAgICAgICAgICAgcmVmcmVzaEhhcmJvdXJzKClcbiAgICAgICAgICAgIGdhbWUuY2hlY2tXaW5uZXIoKVxuICAgICAgICB9XG4gICAgfSlcbiAgICBpZiAoZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk/LnBsYWNpbmdTaGlwcyAmJiBvd25lciA9PT0gZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk/Lm5hbWUpIHtcbiAgICAgICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgc2hpcFNoYWRvdyhvd25lciwgdGlsZSlcbiAgICAgICAgfSlcbiAgICAgICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgcmVtb3ZlU2hpcFNoYWRvdyhvd25lciwgdGlsZSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIG5ld1RpbGVcbn1cblxuZnVuY3Rpb24gY2xpY2tSZWYoaWRTdHJpbmc6IHN0cmluZykge1xuICAgIGNvbnN0IHBhcmFtcyA9IGlkU3RyaW5nLnNwbGl0KCctJylcbiAgICByZXR1cm4gcGFyYW1zXG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hUaWxlKHJlZmVyZW5jZVRpbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgaWRBcnJheSA9IGNsaWNrUmVmKHJlZmVyZW5jZVRpbGUuaWQpXG4gICAgY29uc3Qgb3duZXIgPSBpZEFycmF5WzBdXG4gICAgY29uc3QgeCA9IE51bWJlcihpZEFycmF5WzFdKVxuICAgIGNvbnN0IHkgPSBOdW1iZXIoaWRBcnJheVsyXSlcbiAgICBpZiAob3duZXIgPT09ICdQMScpIHtcbiAgICAgICAgY29uc3QgYm9hcmRJbmZvID0gZ2FtZS5QMS5ib2FyZFxuICAgICAgICBjb25zdCB0aWxlSW5mbyA9IGJvYXJkSW5mby5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGlsZUluZm8/Lm9jY3VwaWVkKSB7XG4gICAgICAgICAgICByZWZlcmVuY2VUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBteXNoaXBcIlxuICAgICAgICB9IGVsc2UgeyByZWZlcmVuY2VUaWxlLmNsYXNzTmFtZSA9IFwidGlsZVwiIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnJlc2hCb2FyZHMoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnbm9uZSc7XG5cbiAgICBjb25zdCBQMUJvYXJkID0gZ2FtZS5nZXRQMUJvYXJkKClcbiAgICBjb25zdCBQMkJvYXJkID0gZ2FtZS5nZXRQMkJvYXJkKClcblxuICAgIC8vIGNyZWF0ZSBET00gZWxlbWVudHMgZm9yIFAxIGJvYXJkXG4gICAgUDFGcmFtZS5pbm5lckhUTUwgPSAnJ1xuICAgIFAxQm9hcmQuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IGNyZWF0ZVRpbGUoXCJQMVwiLCB0aWxlKVxuICAgICAgICBQMUZyYW1lLmFwcGVuZENoaWxkKG5ld1RpbGUpXG4gICAgfSlcblxuICAgIC8vIGNyZWF0ZSBET00gZWxlbWVudHMgZm9yIFAyIGJvYXJkXG4gICAgUDJGcmFtZS5pbm5lckhUTUwgPSAnJ1xuICAgIFAyQm9hcmQuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IGNyZWF0ZVRpbGUoXCJQMlwiLCB0aWxlKVxuICAgICAgICBQMkZyYW1lLmFwcGVuZENoaWxkKG5ld1RpbGUpXG4gICAgfSlcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdhdXRvJztcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaEhhcmJvdXJzKCkge1xuICAgIGNvbnN0IFAxU2hpcHMgPSBnYW1lLmdldFAxU2hpcHNBdmFpbGFibGUoKVxuICAgIGNvbnN0IFAyU2hpcHMgPSBnYW1lLmdldFAyU2hpcHNBdmFpbGFibGUoKVxuICAgIGNvbnN0IFAxSGFyYm91ciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFIYXJib3VyXCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICAgUDFIYXJib3VyLmlubmVySFRNTCA9ICc8aDQ+SGFyYm91ciAoc2hpcHMgdG8gcGxhY2UpPC9oND4nXG4gICAgY29uc3QgUDJIYXJib3VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkhhcmJvdXJcIikgYXMgSFRNTERpdkVsZW1lbnRcbiAgICBQMkhhcmJvdXIuaW5uZXJIVE1MID0gJzxoND5IYXJib3VyPC9oND4nXG4gICAgUDFTaGlwcy5zbGljZSgpLnJldmVyc2UoKS5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBuZXdTaGlwRGl2LmlubmVyVGV4dCA9IGAke3NoaXAudHlwZX0gKCR7c2hpcC5zaXplfSlgXG4gICAgICAgIGlmIChzaGlwID09PSBnYW1lLmdldFNoaXBCZWluZ1BsYWNlZCgpKSB7XG4gICAgICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiaGFyYm91clNoaXAgY3VycmVudFNoaXBcIlxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV3U2hpcERpdi5jbGFzc05hbWUgPSBcImhhcmJvdXJTaGlwXCJcbiAgICAgICAgfVxuICAgICAgICBQMUhhcmJvdXIuYXBwZW5kQ2hpbGQobmV3U2hpcERpdilcbiAgICB9KVxuICAgIFAyU2hpcHMuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgbmV3U2hpcERpdi5pbm5lclRleHQgPSBgJHtzaGlwLnR5cGV9ICgke3NoaXAuc2l6ZX0pYFxuICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiaGFyYm91clNoaXBcIlxuICAgICAgICBQMkhhcmJvdXIuYXBwZW5kQ2hpbGQobmV3U2hpcERpdilcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBzaGlwU2hhZG93KG93bmVyOiBzdHJpbmcsIGhvdmVyVGlsZTogVGlsZSkge1xuICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSBhcyBzaGlwUHJvcHNcbiAgICBjb25zdCBoaWdobGlnaHRBcmVhOiBIVE1MRWxlbWVudFtdID0gW11cbiAgICBpZiAoaG92ZXJUaWxlLm9jY3VwaWVkKSB7IHJldHVybiB9XG4gICAgaWYgKG93bmVyICE9IGdhbWUuZ2V0Q3VycmVudFBsYXllcigpPy5uYW1lKSB7IHJldHVybiB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHNoaXBUb1BsYWNlLnNpemU7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdGlsZUlEID0gYCR7b3duZXJ9LSR7aG92ZXJUaWxlLnh9LSR7aG92ZXJUaWxlLnkgKyBpbmRleH1gXG4gICAgICAgIGNvbnN0IHRpbGVUb0hpZ2hsaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRpbGVJRClcbiAgICAgICAgaWYgKHRpbGVUb0hpZ2hsaWdodCkgeyBoaWdobGlnaHRBcmVhLnB1c2godGlsZVRvSGlnaGxpZ2h0KSB9XG4gICAgICAgIGVsc2UgYnJlYWtcbiAgICB9XG4gICAgaWYgKGhpZ2hsaWdodEFyZWEubGVuZ3RoID09PSBzaGlwVG9QbGFjZS5zaXplKSB7XG4gICAgICAgIGhpZ2hsaWdodEFyZWEuZm9yRWFjaCgoaGlnaGxpZ2h0ZWRUaWxlKSA9PiB7XG4gICAgICAgICAgICBoaWdobGlnaHRlZFRpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIHNoYWRvd1wiXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVTaGlwU2hhZG93KG93bmVyOiBzdHJpbmcsIGhvdmVyVGlsZTogVGlsZSkge1xuICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSBhcyBzaGlwUHJvcHNcbiAgICBjb25zdCBoaWdobGlnaHRBcmVhOiBIVE1MRWxlbWVudFtdID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgc2hpcFRvUGxhY2Uuc2l6ZTsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0aWxlSUQgPSBgJHtvd25lcn0tJHtob3ZlclRpbGUueH0tJHtob3ZlclRpbGUueSArIGluZGV4fWBcbiAgICAgICAgY29uc3QgdGlsZVRvSGlnaGxpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGlsZUlEKVxuICAgICAgICBpZiAodGlsZVRvSGlnaGxpZ2h0KSB7IGhpZ2hsaWdodEFyZWEucHVzaCh0aWxlVG9IaWdobGlnaHQpIH1cbiAgICAgICAgZWxzZSBicmVha1xuICAgIH1cbiAgICBoaWdobGlnaHRBcmVhLmZvckVhY2goKGhpZ2hsaWdodGVkVGlsZSkgPT4ge1xuICAgICAgICByZWZyZXNoVGlsZShoaWdobGlnaHRlZFRpbGUpXG4gICAgfSlcbn0iLCJpbXBvcnQgKiBhcyBET00gZnJvbSBcIi4vY29udHJvbFwiXG5pbXBvcnQgeyBzZXR1cEdhbWUgfSBmcm9tIFwiLi9nYW1lXCJcblxuc2V0dXBHYW1lKClcbkRPTS5yZWZyZXNoQm9hcmRzKClcbkRPTS5yZWZyZXNoSGFyYm91cnMoKSJdfQ==