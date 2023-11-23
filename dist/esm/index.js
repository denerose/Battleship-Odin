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
        }
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
  if (hoverTile.occupied) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9haS50cyIsIi4uLy4uL3NyYy9zaGlwLnRzIiwiLi4vLi4vc3JjL2dhbWVib2FyZC50cyIsIi4uLy4uL3NyYy9wbGF5ZXIudHMiLCIuLi8uLi9zcmMvZ2FtZS50cyIsIi4uLy4uL3NyYy9jb250cm9sLnRzIiwiLi4vLi4vc3JjL2luZGV4LnRzIl0sIm5hbWVzIjpbIm5ld0NoZWNrZWRUaWxlIl0sIm1hcHBpbmdzIjoiO0FBRU8sU0FBUyxPQUFPLFVBQWtCLGNBQXNCO0FBQzNELE1BQUksU0FBUyxjQUFjO0FBQ3ZCLFVBQU0sYUFBYSxTQUFTLE1BQU0sZUFBZTtBQUNqRCxVQUFNLGVBQWUsS0FBSyxNQUFNLEtBQUssT0FBTyxJQUFJLFdBQVcsTUFBTTtBQUNqRSxVQUFNLFNBQVMsV0FBVyxZQUFZO0FBQ3RDLGFBQVMsVUFBVSxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekMsV0FDUyxDQUFDLFNBQVMsY0FBYztBQUM3QixVQUFNLGFBQWEsYUFBYSxNQUFNLGNBQWM7QUFDcEQsVUFBTSxlQUFlLEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxXQUFXLE1BQU07QUFDakUsVUFBTSxTQUFTLFdBQVcsWUFBWTtBQUN0QyxhQUFTLFlBQVksY0FBYyxPQUFPLEdBQUcsT0FBTyxDQUFDO0FBQUEsRUFDekQ7QUFDSjs7O0FDVk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQU1kLFlBQVksTUFBYyxNQUFjO0FBTHhDLGdCQUFlO0FBRWYsZ0JBQWU7QUFTZixTQUFPLFNBQVMsTUFBTTtBQUFFLGFBQU8sS0FBSyxRQUFRLEtBQUssT0FBTyxPQUFPO0FBQUEsSUFBTTtBQUxqRSxTQUFLLE9BQU87QUFDWixTQUFLLE9BQU87QUFDWixTQUFLLE1BQU0sT0FBTyxXQUFXO0FBQUEsRUFDakM7QUFBQSxFQUlPLFVBQVU7QUFDYixTQUFLO0FBQUEsRUFDVDtBQUNKOzs7QUNwQk8sSUFBTSxPQUFOLE1BQVc7QUFBQSxFQUVkLFlBQ1csR0FDQSxHQUNBLFdBQW9CLE9B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UyxlQUFlLE1BQU07QUFDdEQsUUFBSSxpQkFBaUI7QUFBRSxvQkFBYyxLQUFLLGVBQWU7QUFBQSxJQUFFO0FBQ3REO0FBQUEsRUFDVDtBQUNBLGdCQUFjLFFBQVEsQ0FBQyxvQkFBb0I7QUFDdkMsZ0JBQVksZUFBZTtBQUFBLEVBQy9CLENBQUM7QUFDTDs7O0FDMUlBLFVBQVU7QUFDTixjQUFjO0FBQ2QsZ0JBQWdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGxheWVyIH0gZnJvbSAnLi9wbGF5ZXInO1xuXG5leHBvcnQgZnVuY3Rpb24gYWlUdXJuKGFpUGxheWVyOiBQbGF5ZXIsIHRhcmdldFBsYXllcjogUGxheWVyKSB7XG4gICAgaWYgKGFpUGxheWVyLnBsYWNpbmdTaGlwcykge1xuICAgICAgICBjb25zdCBsZWdhbE1vdmVzID0gYWlQbGF5ZXIuYm9hcmQuZ2V0VmFjYW50VGlsZXMoKVxuICAgICAgICBjb25zdCBjaG9vc2VUYXJnZXQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBsZWdhbE1vdmVzLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGxlZ2FsTW92ZXNbY2hvb3NlVGFyZ2V0XVxuICAgICAgICBhaVBsYXllci5wbGFjZVNoaXAodGFyZ2V0LngsIHRhcmdldC55KVxuICAgIH1cbiAgICBlbHNlIGlmICghYWlQbGF5ZXIucGxhY2luZ1NoaXBzKSB7XG4gICAgICAgIGNvbnN0IGxlZ2FsTW92ZXMgPSB0YXJnZXRQbGF5ZXIuYm9hcmQuZ2V0VW5oaXRUaWxlcygpXG4gICAgICAgIGNvbnN0IGNob29zZVRhcmdldCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGxlZ2FsTW92ZXMubGVuZ3RoKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gbGVnYWxNb3Zlc1tjaG9vc2VUYXJnZXRdXG4gICAgICAgIGFpUGxheWVyLnBsYWNlQXR0YWNrKHRhcmdldFBsYXllciwgdGFyZ2V0LngsIHRhcmdldC55KVxuICAgIH1cbn0iLCJleHBvcnQgaW50ZXJmYWNlIHNoaXBQcm9wcyB7XG4gICAgdHlwZTogc3RyaW5nLFxuICAgIHNpemU6IG51bWJlcixcbn1cblxuZXhwb3J0IGNsYXNzIFNoaXAge1xuICAgIHR5cGU6IHN0cmluZyA9ICdzbWFsbCdcbiAgICBzaXplOiBudW1iZXJcbiAgICBoaXRzOiBudW1iZXIgPSAwXG4gICAga2V5XG5cbiAgICBjb25zdHJ1Y3Rvcih0eXBlOiBzdHJpbmcsIHNpemU6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNpemUgPSBzaXplO1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmtleSA9IGNyeXB0by5yYW5kb21VVUlEKClcbiAgICB9XG5cbiAgICBwdWJsaWMgaXNTdW5rID0gKCkgPT4geyByZXR1cm4gdGhpcy5oaXRzID49IHRoaXMuc2l6ZSA/IHRydWUgOiBmYWxzZSB9O1xuXG4gICAgcHVibGljIHRha2VIaXQoKSB7XG4gICAgICAgIHRoaXMuaGl0cysrXG4gICAgfVxufSIsImltcG9ydCB7IFNoaXAgfSBmcm9tIFwiLi9zaGlwXCJcblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyB4OiBudW1iZXIsXG4gICAgICAgIHB1YmxpYyB5OiBudW1iZXIsXG4gICAgICAgIHB1YmxpYyBvY2N1cGllZDogYm9vbGVhbiA9IGZhbHNlLFxuICAgICAgICBwdWJsaWMgaGl0OiBib29sZWFuID0gZmFsc2UsXG4gICAgICAgIHB1YmxpYyBzaGlwS2V5Pzogc3RyaW5nKSB7IH1cbn1cblxuZXhwb3J0IGNsYXNzIEdhbWVCb2FyZCB7XG4gICAgZ2FtZUJvYXJkOiBUaWxlW10gPSBbXVxuICAgIGFjdGl2ZVNoaXBzOiBTaGlwW10gPSBbXVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHNpemU6IG51bWJlclxuICAgICkge1xuICAgICAgICBmb3IgKGxldCB4ID0gMDsgeCA8IHNpemU7IHgrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBzaXplOyB5KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdhbWVCb2FyZC5wdXNoKG5ldyBUaWxlKHgsIHkpKVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcGxhY2VtZW50R3JpZChzdGFydFRpbGU6IFRpbGUsIHNoaXBTaXplOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdGlsZXNUb0NoZWNrID0gW11cbiAgICAgICAgbGV0IGN1cnJlbnRUaWxlOiBUaWxlID0gc3RhcnRUaWxlXG4gICAgICAgIGlmICh0aWxlc1RvQ2hlY2subGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aWxlc1RvQ2hlY2sucHVzaChjdXJyZW50VGlsZSlcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoc2hpcFNpemUgPiB0aWxlc1RvQ2hlY2subGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgbmV3Q2hlY2tlZFRpbGUgPSB0aGlzLmdhbWVCb2FyZC5maW5kKChuZXdDaGVja2VkVGlsZSkgPT4gbmV3Q2hlY2tlZFRpbGUueCA9PT0gY3VycmVudFRpbGUueCAmJiBuZXdDaGVja2VkVGlsZS55ID09PSBjdXJyZW50VGlsZS55ICsgMSk7XG4gICAgICAgICAgICBpZiAobmV3Q2hlY2tlZFRpbGUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50VGlsZSA9IG5ld0NoZWNrZWRUaWxlXG4gICAgICAgICAgICAgICAgdGlsZXNUb0NoZWNrLnB1c2goY3VycmVudFRpbGUpXG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIFtdXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRpbGVzVG9DaGVjaztcbiAgICB9XG5cbiAgICBwdWJsaWMgcGxhY2VTaGlwKHR5cGU6IHN0cmluZywgc2l6ZTogbnVtYmVyLCBzdGFydFRpbGU6IFRpbGUpIHtcbiAgICAgICAgY29uc3QgcGxhY2VtZW50QXJlYSA9IHRoaXMucGxhY2VtZW50R3JpZChzdGFydFRpbGUsIHNpemUpXG4gICAgICAgIGlmIChwbGFjZW1lbnRBcmVhLmxlbmd0aCA9PT0gMCkgeyByZXR1cm4gZmFsc2UgfVxuICAgICAgICBlbHNlIGlmIChwbGFjZW1lbnRBcmVhLnNvbWUoKHRpbGUpID0+IHRpbGUub2NjdXBpZWQpKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgc2hpcFRvUGxhY2UgPSBuZXcgU2hpcCh0eXBlLCBzaXplKVxuICAgICAgICAgICAgcGxhY2VtZW50QXJlYS5mb3JFYWNoKCh0aWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgdGlsZS5vY2N1cGllZCA9IHRydWVcbiAgICAgICAgICAgICAgICB0aWxlLnNoaXBLZXkgPSBzaGlwVG9QbGFjZS5rZXlcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZVNoaXBzLnB1c2goc2hpcFRvUGxhY2UpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcHVibGljIHJlY2VpdmVBdHRhY2soYXR0YWNrZWRUaWxlOiBUaWxlKSB7XG4gICAgICAgIGlmIChhdHRhY2tlZFRpbGUuaGl0KSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2UgaWYgKGF0dGFja2VkVGlsZS5vY2N1cGllZCkge1xuICAgICAgICAgICAgYXR0YWNrZWRUaWxlLmhpdCA9IHRydWVcbiAgICAgICAgICAgIGlmIChhdHRhY2tlZFRpbGUuc2hpcEtleSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGF0dGFja2VkU2hpcCA9IHRoaXMuZmluZFNoaXBGcm9tS2V5KGF0dGFja2VkVGlsZS5zaGlwS2V5KVxuICAgICAgICAgICAgICAgIGlmIChhdHRhY2tlZFNoaXApIGF0dGFja2VkU2hpcC50YWtlSGl0KClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGF0dGFja2VkVGlsZS5oaXQgPSB0cnVlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgcHVibGljIGZpbmRUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVCb2FyZC5maW5kKCh0aWxlKSA9PiB0aWxlLnggPT0geCAmJiB0aWxlLnkgPT0geSlcbiAgICB9XG5cbiAgICBwdWJsaWMgZmluZFNoaXBGcm9tS2V5KGtleVRvRmluZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZvdW5kU2hpcCA9IHRoaXMuYWN0aXZlU2hpcHMuZmluZCgoc2hpcCkgPT4gc2hpcC5rZXkgPT09IGtleVRvRmluZClcbiAgICAgICAgcmV0dXJuIGZvdW5kU2hpcFxuICAgIH1cblxuICAgIHB1YmxpYyBjaGVja0lmQWxsU3VuaygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWN0aXZlU2hpcHMuZXZlcnkoKHNoaXApID0+IHNoaXAuaXNTdW5rKCkpXG4gICAgfVxuXG4gICAgcHVibGljIGdldFVuaGl0VGlsZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdhbWVCb2FyZC5maWx0ZXIoKHRpbGUpID0+ICF0aWxlLmhpdCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFZhY2FudFRpbGVzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nYW1lQm9hcmQuZmlsdGVyKCh0aWxlKSA9PiAhdGlsZS5vY2N1cGllZCk7XG4gICAgfVxuXG4gICAgcHVibGljIGlzT2NjdXBpZWQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGFyZ2V0KSB0YXJnZXQub2NjdXBpZWQgPyB0cnVlIDogZmFsc2VcbiAgICB9XG59IiwiaW1wb3J0IHsgR2FtZUJvYXJkIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBzaGlwUHJvcHMsIFNoaXAgfSBmcm9tIFwiLi9zaGlwXCI7XG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXIge1xuICAgIHNoaXBCZWluZ1BsYWNlZD86IHNoaXBQcm9wc1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHB1YmxpYyBuYW1lOiBzdHJpbmcsXG4gICAgICAgIHB1YmxpYyBodW1hbjogYm9vbGVhbiA9IHRydWUsXG4gICAgICAgIHB1YmxpYyB0YWtpbmdUdXJuID0gdHJ1ZSxcbiAgICAgICAgcHVibGljIHNoaXBzQXZhaWxhYmxlOiBzaGlwUHJvcHNbXSA9IFt7IHR5cGU6ICd0aW55Jywgc2l6ZTogMSB9LCB7IHR5cGU6ICdzbWFsbCcsIHNpemU6IDIgfSwgeyB0eXBlOiAnaHVnZScsIHNpemU6IDQgfV0sXG4gICAgICAgIHB1YmxpYyBib2FyZCA9IG5ldyBHYW1lQm9hcmQoOSksXG4gICAgICAgIHB1YmxpYyBwbGFjaW5nU2hpcHMgPSB0cnVlLFxuICAgICkge1xuICAgICAgICB0aGlzLnNoaXBCZWluZ1BsYWNlZCA9IHRoaXMuc2hpcHNBdmFpbGFibGUuYXQoLTEpXG4gICAgfVxuXG4gICAgcHVibGljIHBsYWNlQXR0YWNrKGVuZW15UGxheWVyOiBQbGF5ZXIsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGVuZW15UGxheWVyLmJvYXJkLmZpbmRUaWxlKHgsIHkpXG4gICAgICAgIGlmICh0YXJnZXQgJiYgIXRhcmdldC5oaXQpIHtcbiAgICAgICAgICAgIGVuZW15UGxheWVyLmJvYXJkLnJlY2VpdmVBdHRhY2sodGFyZ2V0KTtcbiAgICAgICAgICAgIHRoaXMudGFraW5nVHVybiA9IGZhbHNlXG4gICAgICAgICAgICBlbmVteVBsYXllci5zZXRUdXJuKClcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZXRUdXJuKCkge1xuICAgICAgICB0aGlzLnRha2luZ1R1cm4gPSB0cnVlXG4gICAgfVxuXG4gICAgcHVibGljIHBsYWNlU2hpcCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICBpZiAodGhpcy5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNoaXBzQXZhaWxhYmxlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgdGhpcy5wbGFjaW5nU2hpcHMgPSBmYWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc2hpcFRvUGxhY2UgPSB0aGlzLnNoaXBCZWluZ1BsYWNlZFxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5ib2FyZC5maW5kVGlsZSh4LCB5KVxuICAgICAgICAgICAgaWYgKHRhcmdldCAmJiBzaGlwVG9QbGFjZSAmJiAhdGFyZ2V0Lm9jY3VwaWVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYm9hcmQucGxhY2VTaGlwKHNoaXBUb1BsYWNlLnR5cGUsIHNoaXBUb1BsYWNlLnNpemUsIHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGlwc0F2YWlsYWJsZS5wb3AoKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGlwc0F2YWlsYWJsZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGlwQmVpbmdQbGFjZWQgPSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wbGFjaW5nU2hpcHMgPSBmYWxzZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHRoaXMuc2hpcEJlaW5nUGxhY2VkID0gdGhpcy5zaGlwc0F2YWlsYWJsZS5hdCgtMSlcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgcmV0dXJuIGZhbHNlXG4gICAgfVxufSIsImltcG9ydCB7IGFpVHVybiB9IGZyb20gXCIuL2FpXCI7XG5pbXBvcnQgeyBQbGF5ZXIgfSBmcm9tIFwiLi9wbGF5ZXJcIjtcbmV4cG9ydCBsZXQgUDE6IFBsYXllciA9IG5ldyBQbGF5ZXIoXCJQMVwiKVxuZXhwb3J0IGxldCBQMjogUGxheWVyID0gbmV3IFBsYXllcihcIlAyXCIsIGZhbHNlLCBmYWxzZSlcbmV4cG9ydCBsZXQgd2lubmVyID0gXCJUQkNcIlxuZXhwb3J0IGxldCBnYW1lSW5QbGF5ID0gdHJ1ZVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBHYW1lKCkge1xuICAgIFAxID0gbmV3IFBsYXllcihcIlAxXCIpXG4gICAgUDIgPSBuZXcgUGxheWVyKFwiUDJcIiwgZmFsc2UsIGZhbHNlKVxuICAgIGdhbWVJblBsYXkgPSB0cnVlXG4gICAgd2lubmVyID0gXCJUQkNcIlxufVxuXG5leHBvcnQgY29uc3QgZ2V0Q3VycmVudFBsYXllciA9ICgpID0+IHtcbiAgICBpZiAoUDEudGFraW5nVHVybiAmJiAhUDIudGFraW5nVHVybikgeyByZXR1cm4gUDEgfVxuICAgIGlmIChQMi50YWtpbmdUdXJuICYmICFQMS50YWtpbmdUdXJuKSB7IHJldHVybiBQMiB9XG59XG5cbmNvbnN0IGdldEVuZW15UGxheWVyID0gKCkgPT4ge1xuICAgIGlmIChQMS50YWtpbmdUdXJuICYmICFQMi50YWtpbmdUdXJuKSB7IHJldHVybiBQMiB9XG4gICAgaWYgKFAyLnRha2luZ1R1cm4gJiYgIVAxLnRha2luZ1R1cm4pIHsgcmV0dXJuIFAxIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAxU2hpcHNBdmFpbGFibGUoKSB7XG4gICAgcmV0dXJuIFAxLnNoaXBzQXZhaWxhYmxlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMlNoaXBzQXZhaWxhYmxlKCkge1xuICAgIHJldHVybiBQMi5zaGlwc0F2YWlsYWJsZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlQ2xpY2soYm9hcmROYW1lOiBzdHJpbmcsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgY29uc3QgY3VycmVudFBsYXllcjogUGxheWVyID0gZ2V0Q3VycmVudFBsYXllcigpIGFzIFBsYXllclxuICAgIGNvbnN0IGVuZW15UGxheWVyOiBQbGF5ZXIgPSBnZXRFbmVteVBsYXllcigpIGFzIFBsYXllclxuICAgIGlmIChib2FyZE5hbWUgPT09IGN1cnJlbnRQbGF5ZXIubmFtZSkge1xuICAgICAgICBpZiAoIWN1cnJlbnRQbGF5ZXIucGxhY2luZ1NoaXBzKSB7IHJldHVybiBmYWxzZSB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudFBsYXllci5wbGFjZVNoaXAoeCwgeSlcbiAgICAgICAgICAgIGlmIChnYW1lSW5QbGF5ICYmICFlbmVteVBsYXllci5odW1hbikge1xuICAgICAgICAgICAgICAgIGFpVHVybihlbmVteVBsYXllciwgY3VycmVudFBsYXllcilcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJvYXJkTmFtZSA9PT0gZW5lbXlQbGF5ZXIubmFtZSAmJiAhY3VycmVudFBsYXllci5wbGFjaW5nU2hpcHMpIHtcbiAgICAgICAgaWYgKGVuZW15UGxheWVyLmJvYXJkLmZpbmRUaWxlKHgsIHkpPy5oaXQpIHJldHVybiBmYWxzZVxuICAgICAgICBjdXJyZW50UGxheWVyLnBsYWNlQXR0YWNrKGVuZW15UGxheWVyLCB4LCB5KVxuICAgICAgICBsZXQgaXNXaW5uZXIgPSBjaGVja1dpbm5lcigpXG4gICAgICAgIGlmIChpc1dpbm5lcikge1xuICAgICAgICAgICAgaWYgKGNvbmZpcm0oYCR7d2lubmVyfSB3b24gdGhlIGdhbWUhXFxuUGxheSBhZ2Fpbj9gKSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgc2V0dXBHYW1lKClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgYWxlcnQoJ09rYXksIGJ5ZSBieWUhJylcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZUluUGxheSAmJiAhZW5lbXlQbGF5ZXIuaHVtYW4pIHtcbiAgICAgICAgICAgIGFpVHVybihlbmVteVBsYXllciwgY3VycmVudFBsYXllcilcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbn1cblxuZnVuY3Rpb24gY2hlY2tXaW5uZXIoKSB7XG4gICAgaWYgKCFQMS5ib2FyZC5jaGVja0lmQWxsU3VuaygpICYmICFQMi5ib2FyZC5jaGVja0lmQWxsU3VuaygpKSB7XG4gICAgICAgIGdhbWVJblBsYXkgPSB0cnVlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBlbHNlIGlmIChQMS5ib2FyZC5jaGVja0lmQWxsU3VuaygpID09PSB0cnVlKSB7XG4gICAgICAgIHdpbm5lciA9IFAyLm5hbWVcbiAgICAgICAgZ2FtZUluUGxheSA9IGZhbHNlXG4gICAgICAgIHJldHVybiB3aW5uZXJcbiAgICB9XG4gICAgZWxzZSBpZiAoUDIuYm9hcmQuY2hlY2tJZkFsbFN1bmsoKSA9PT0gdHJ1ZSkge1xuICAgICAgICB3aW5uZXIgPSBQMS5uYW1lXG4gICAgICAgIGdhbWVJblBsYXkgPSBmYWxzZVxuICAgICAgICByZXR1cm4gd2lubmVyXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnYW1lSW5QbGF5ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQMUJvYXJkKCkge1xuICAgIHJldHVybiBQMS5ib2FyZC5nYW1lQm9hcmRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAyQm9hcmQoKSB7XG4gICAgcmV0dXJuIFAyLmJvYXJkLmdhbWVCb2FyZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2hpcEJlaW5nUGxhY2VkKCkge1xuICAgIGNvbnN0IGN1cnJlbnRQbGF5ZXIgPSBnZXRDdXJyZW50UGxheWVyKClcbiAgICBpZiAoY3VycmVudFBsYXllciAmJiBjdXJyZW50UGxheWVyLnBsYWNpbmdTaGlwcykgcmV0dXJuIGN1cnJlbnRQbGF5ZXIuc2hpcEJlaW5nUGxhY2VkXG59IiwiaW1wb3J0ICogYXMgZ2FtZSBmcm9tIFwiLi9nYW1lXCI7XG5pbXBvcnQgeyBUaWxlIH0gZnJvbSBcIi4vZ2FtZWJvYXJkXCI7XG5pbXBvcnQgeyBzaGlwUHJvcHMgfSBmcm9tIFwiLi9zaGlwXCI7XG5cblxuY29uc3QgUDFGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFGcmFtZVwiKSBhcyBIVE1MRGl2RWxlbWVudFxuY29uc3QgUDJGcmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDJGcmFtZVwiKSBhcyBIVE1MRGl2RWxlbWVudFxuXG5mdW5jdGlvbiBjcmVhdGVUaWxlKG93bmVyOiBzdHJpbmcsIHRpbGU6IFRpbGUpIHtcbiAgICBjb25zdCBuZXdUaWxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICBuZXdUaWxlLmlkID0gYCR7b3duZXJ9LSR7dGlsZS54fS0ke3RpbGUueX1gXG4gICAgaWYgKG93bmVyID09PSBcIlAxXCIgJiYgdGlsZS5vY2N1cGllZCAmJiAhdGlsZS5oaXQpIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGUgbXlzaGlwXCJcbiAgICB9XG4gICAgZWxzZSBpZiAodGlsZS5oaXQgJiYgIXRpbGUub2NjdXBpZWQpIHtcbiAgICAgICAgbmV3VGlsZS5jbGFzc05hbWUgPSBcInRpbGUgbWlzc1wiXG4gICAgICAgIG5ld1RpbGUuaW5uZXJUZXh0ID0gXCJ4XCJcbiAgICB9XG4gICAgZWxzZSBpZiAodGlsZS5oaXQgJiYgdGlsZS5vY2N1cGllZCkge1xuICAgICAgICBuZXdUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBoaXRcIlxuICAgICAgICBuZXdUaWxlLmlubmVyVGV4dCA9IFwiaGl0IVwiXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBuZXdUaWxlLmNsYXNzTmFtZSA9IFwidGlsZVwiXG4gICAgfVxuICAgIG5ld1RpbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIGlmIChnYW1lLmdhbWVJblBsYXkpIHtcbiAgICAgICAgICAgIGdhbWUuaGFuZGxlQ2xpY2sob3duZXIsIHRpbGUueCwgdGlsZS55KVxuICAgICAgICAgICAgcmVmcmVzaEJvYXJkcygpXG4gICAgICAgICAgICByZWZyZXNoSGFyYm91cnMoKVxuICAgICAgICB9XG4gICAgfSlcbiAgICBpZiAoZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk/LnBsYWNpbmdTaGlwcyAmJiBvd25lciA9PT0gZ2FtZS5nZXRDdXJyZW50UGxheWVyKCk/Lm5hbWUpIHtcbiAgICAgICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgKCkgPT4ge1xuICAgICAgICAgICAgc2hpcFNoYWRvdyhvd25lciwgdGlsZSlcbiAgICAgICAgfSlcbiAgICAgICAgbmV3VGlsZS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCkgPT4ge1xuICAgICAgICAgICAgcmVtb3ZlU2hpcFNoYWRvdyhvd25lciwgdGlsZSlcbiAgICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIG5ld1RpbGVcbn1cblxuZnVuY3Rpb24gY2xpY2tSZWYoaWRTdHJpbmc6IHN0cmluZykge1xuICAgIGNvbnN0IHBhcmFtcyA9IGlkU3RyaW5nLnNwbGl0KCctJylcbiAgICByZXR1cm4gcGFyYW1zXG59XG5cbmZ1bmN0aW9uIHJlZnJlc2hUaWxlKHJlZmVyZW5jZVRpbGU6IEhUTUxFbGVtZW50KSB7XG4gICAgY29uc3QgaWRBcnJheSA9IGNsaWNrUmVmKHJlZmVyZW5jZVRpbGUuaWQpXG4gICAgY29uc3Qgb3duZXIgPSBpZEFycmF5WzBdXG4gICAgY29uc3QgeCA9IE51bWJlcihpZEFycmF5WzFdKVxuICAgIGNvbnN0IHkgPSBOdW1iZXIoaWRBcnJheVsyXSlcbiAgICBpZiAob3duZXIgPT09ICdQMScpIHtcbiAgICAgICAgY29uc3QgYm9hcmRJbmZvID0gZ2FtZS5QMS5ib2FyZFxuICAgICAgICBjb25zdCB0aWxlSW5mbyA9IGJvYXJkSW5mby5maW5kVGlsZSh4LCB5KVxuICAgICAgICBpZiAodGlsZUluZm8/Lm9jY3VwaWVkKSB7XG4gICAgICAgICAgICByZWZlcmVuY2VUaWxlLmNsYXNzTmFtZSA9IFwidGlsZSBteXNoaXBcIlxuICAgICAgICB9IGVsc2UgeyByZWZlcmVuY2VUaWxlLmNsYXNzTmFtZSA9IFwidGlsZVwiIH1cbiAgICB9XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlZnJlc2hCb2FyZHMoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5jdXJzb3IgPSAnbm9uZSc7XG5cbiAgICBjb25zdCBQMUJvYXJkID0gZ2FtZS5nZXRQMUJvYXJkKClcbiAgICBjb25zdCBQMkJvYXJkID0gZ2FtZS5nZXRQMkJvYXJkKClcblxuICAgIC8vIGNyZWF0ZSBET00gZWxlbWVudHMgZm9yIFAxIGJvYXJkXG4gICAgUDFGcmFtZS5pbm5lckhUTUwgPSAnJ1xuICAgIFAxQm9hcmQuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IGNyZWF0ZVRpbGUoXCJQMVwiLCB0aWxlKVxuICAgICAgICBQMUZyYW1lLmFwcGVuZENoaWxkKG5ld1RpbGUpXG4gICAgfSlcblxuICAgIC8vIGNyZWF0ZSBET00gZWxlbWVudHMgZm9yIFAyIGJvYXJkXG4gICAgUDJGcmFtZS5pbm5lckhUTUwgPSAnJ1xuICAgIFAyQm9hcmQuZm9yRWFjaCh0aWxlID0+IHtcbiAgICAgICAgY29uc3QgbmV3VGlsZSA9IGNyZWF0ZVRpbGUoXCJQMlwiLCB0aWxlKVxuICAgICAgICBQMkZyYW1lLmFwcGVuZENoaWxkKG5ld1RpbGUpXG4gICAgfSlcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLmN1cnNvciA9ICdhdXRvJztcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVmcmVzaEhhcmJvdXJzKCkge1xuICAgIGNvbnN0IFAxU2hpcHMgPSBnYW1lLmdldFAxU2hpcHNBdmFpbGFibGUoKVxuICAgIGNvbnN0IFAyU2hpcHMgPSBnYW1lLmdldFAyU2hpcHNBdmFpbGFibGUoKVxuICAgIGNvbnN0IFAxSGFyYm91ciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiUDFIYXJib3VyXCIpIGFzIEhUTUxEaXZFbGVtZW50XG4gICAgUDFIYXJib3VyLmlubmVySFRNTCA9ICc8aDQ+SGFyYm91ciAoc2hpcHMgdG8gcGxhY2UpPC9oND4nXG4gICAgY29uc3QgUDJIYXJib3VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJQMkhhcmJvdXJcIikgYXMgSFRNTERpdkVsZW1lbnRcbiAgICBQMkhhcmJvdXIuaW5uZXJIVE1MID0gJzxoND5IYXJib3VyPC9oND4nXG4gICAgUDFTaGlwcy5zbGljZSgpLnJldmVyc2UoKS5mb3JFYWNoKChzaGlwKSA9PiB7XG4gICAgICAgIGNvbnN0IG5ld1NoaXBEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgICAgICBuZXdTaGlwRGl2LmlubmVyVGV4dCA9IGAke3NoaXAudHlwZX0gKCR7c2hpcC5zaXplfSlgXG4gICAgICAgIGlmIChzaGlwID09PSBnYW1lLmdldFNoaXBCZWluZ1BsYWNlZCgpKSB7XG4gICAgICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiaGFyYm91clNoaXAgY3VycmVudFNoaXBcIlxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbmV3U2hpcERpdi5jbGFzc05hbWUgPSBcImhhcmJvdXJTaGlwXCJcbiAgICAgICAgfVxuICAgICAgICBQMUhhcmJvdXIuYXBwZW5kQ2hpbGQobmV3U2hpcERpdilcbiAgICB9KVxuICAgIFAyU2hpcHMuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaCgoc2hpcCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdTaGlwRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAgICAgbmV3U2hpcERpdi5pbm5lclRleHQgPSBgJHtzaGlwLnR5cGV9ICgke3NoaXAuc2l6ZX0pYFxuICAgICAgICBuZXdTaGlwRGl2LmNsYXNzTmFtZSA9IFwiaGFyYm91clNoaXBcIlxuICAgICAgICBQMkhhcmJvdXIuYXBwZW5kQ2hpbGQobmV3U2hpcERpdilcbiAgICB9KVxufVxuXG5mdW5jdGlvbiBzaGlwU2hhZG93KG93bmVyOiBzdHJpbmcsIGhvdmVyVGlsZTogVGlsZSkge1xuICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSBhcyBzaGlwUHJvcHNcbiAgICBjb25zdCBoaWdobGlnaHRBcmVhOiBIVE1MRWxlbWVudFtdID0gW11cbiAgICBpZiAoaG92ZXJUaWxlLm9jY3VwaWVkKSB7IHJldHVybiB9XG4gICAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IHNoaXBUb1BsYWNlLnNpemU7IGluZGV4KyspIHtcbiAgICAgICAgY29uc3QgdGlsZUlEID0gYCR7b3duZXJ9LSR7aG92ZXJUaWxlLnh9LSR7aG92ZXJUaWxlLnkgKyBpbmRleH1gXG4gICAgICAgIGNvbnN0IHRpbGVUb0hpZ2hsaWdodCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHRpbGVJRClcbiAgICAgICAgaWYgKHRpbGVUb0hpZ2hsaWdodCkgeyBoaWdobGlnaHRBcmVhLnB1c2godGlsZVRvSGlnaGxpZ2h0KSB9XG4gICAgICAgIGVsc2UgYnJlYWtcbiAgICB9XG4gICAgaWYgKGhpZ2hsaWdodEFyZWEubGVuZ3RoID09PSBzaGlwVG9QbGFjZS5zaXplKSB7XG4gICAgICAgIGhpZ2hsaWdodEFyZWEuZm9yRWFjaCgoaGlnaGxpZ2h0ZWRUaWxlKSA9PiB7XG4gICAgICAgICAgICBoaWdobGlnaHRlZFRpbGUuY2xhc3NOYW1lID0gXCJ0aWxlIHNoYWRvd1wiXG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVTaGlwU2hhZG93KG93bmVyOiBzdHJpbmcsIGhvdmVyVGlsZTogVGlsZSkge1xuICAgIGNvbnN0IHNoaXBUb1BsYWNlID0gZ2FtZS5nZXRTaGlwQmVpbmdQbGFjZWQoKSBhcyBzaGlwUHJvcHNcbiAgICBjb25zdCBoaWdobGlnaHRBcmVhOiBIVE1MRWxlbWVudFtdID0gW11cbiAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgc2hpcFRvUGxhY2Uuc2l6ZTsgaW5kZXgrKykge1xuICAgICAgICBjb25zdCB0aWxlSUQgPSBgJHtvd25lcn0tJHtob3ZlclRpbGUueH0tJHtob3ZlclRpbGUueSArIGluZGV4fWBcbiAgICAgICAgY29uc3QgdGlsZVRvSGlnaGxpZ2h0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGlsZUlEKVxuICAgICAgICBpZiAodGlsZVRvSGlnaGxpZ2h0KSB7IGhpZ2hsaWdodEFyZWEucHVzaCh0aWxlVG9IaWdobGlnaHQpIH1cbiAgICAgICAgZWxzZSBicmVha1xuICAgIH1cbiAgICBoaWdobGlnaHRBcmVhLmZvckVhY2goKGhpZ2hsaWdodGVkVGlsZSkgPT4ge1xuICAgICAgICByZWZyZXNoVGlsZShoaWdobGlnaHRlZFRpbGUpXG4gICAgfSlcbn0iLCJpbXBvcnQgKiBhcyBET00gZnJvbSBcIi4vY29udHJvbFwiXG5pbXBvcnQgeyBzZXR1cEdhbWUgfSBmcm9tIFwiLi9nYW1lXCJcblxuc2V0dXBHYW1lKClcbkRPTS5yZWZyZXNoQm9hcmRzKClcbkRPTS5yZWZyZXNoSGFyYm91cnMoKSJdfQ==