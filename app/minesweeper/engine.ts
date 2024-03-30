import { inRange } from 'lodash/fp';

class Tile {
  x: number;
  y: number;
  id: string;

  isOpen: boolean;
  isMine: boolean;
  isFlag: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.id = `${x},${y}`;
    this.isOpen = false;
    this.isMine = false;
    this.isFlag = false;
  }

  getCell(): Cell {
    return [this.x, this.y];
  }
}

type Cell = [number, number];
type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

const MOVES: Record<Direction, Cell> = {
  N:  [ 0,  1],
  NE: [ 1,  1],
  E:  [ 1,  0],
  SE: [ 1, -1],
  S:  [ 0, -1],
  SW: [-1, -1],
  W:  [-1,  0],
  NW: [-1,  1],
};

const addCells = ([xA, yA]: Cell, [xB, yB]: Cell): Cell => [xA + xB, yA + yB];
const sum = (a: number, b: number) => a + b;

export class MinesweeperBoard {
  board: Tile[][];
  height: number;
  width: number;
  nMines: number;
  status: 'won' | 'lost' | 'playing';

  constructor(height: number, width: number, nMines: number) {
    this.height = height;
    this.width = width;
    this.nMines = nMines;
    this.status = 'playing';

    this.board = Array.from(
      { length: height },
      (_, y) => Array.from(
        { length: width },
        (_, x) => new Tile(x, y)
      )
    );

    this.setMines();
    this.setFlags();
  }

  // TODO: delete
  setFlags() {
    let nChosen = 0;

    while (nChosen < this.nMines) {
      // TODO: check that this gets every cell
      const row = Math.floor(Math.random() * this.height);
      const col = Math.floor(Math.random() * this.width);

      if (!this.board[row][col].isFlag) {
        this.board[row][col].isFlag = true;
        nChosen += 1;
      }
    }
  }

  setMines() {
    let nChosen = 0;

    while (nChosen < this.nMines) {
      // TODO: check that this gets every cell
      const row = Math.floor(Math.random() * this.height);
      const col = Math.floor(Math.random() * this.width);

      if (!this.board[row][col].isMine) {
        this.board[row][col].isMine = true;
        nChosen += 1;
      }
    }
  }

  isValidCell([x, y]: Cell) {
    return inRange(0, this.width, x) && inRange(0, this.height, y);
  }

  getNeighbor(mine: Tile, direction: Direction) {
    const neighborCell = addCells(mine.getCell(), MOVES[direction]);

    if (this.isValidCell(neighborCell)) {
      const [x, y] = neighborCell;

      return this.board[x][y];
    } else {
      return null;
    }
  }

  // TODO: memoize
  getNeighbors(mine: Tile) {
    return Object
      .keys(MOVES)
      .map(direction => this.getNeighbor(mine, direction as Direction))
      .filter(Boolean) as Tile[];
  }

  // TODO: memoize
  getNeighborMines(mine: Tile) {
    return this
      .getNeighbors(mine)
      .filter(mine => mine.isMine);
  }

  // TODO: memoize
  getNeighborFlags(mine: Tile) {
    return this
      .getNeighbors(mine)
      .filter(mine => mine.isFlag);
  }

  flag(mine: Tile) {
    mine.isFlag = !mine.isFlag;
  }

  doOpen(mine: Tile, visited: Set<string>) {
    if (!mine.isFlag) {
      mine.isOpen = true;

      if (mine.isMine) this.lose();
    }

    visited.add(mine.id);
  }

  // Routes to openNeighbors if applicable, doOpen does the actual work
  open(mine: Tile, visited = new Set<string>()) {
    this.doOpen(mine, visited);

    const numNeighborMines = this.getNeighborMines(mine).length;

    if (numNeighborMines === 0 || numNeighborMines === this.getNeighborFlags(mine).length) {
      // Open all neighbors
      this
        .getNeighbors(mine)
        .forEach(neighbor => {
          if (!visited.has(neighbor.id) && !neighbor.isOpen) {
            // TODO: define boundary where this stops
            this.open(neighbor, visited);
          }
        })
    }
  }

  lose() {
    this.status = 'lost';
  }

  win() {
    this.status = 'won';
  }
}
