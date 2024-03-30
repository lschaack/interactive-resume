import { inRange } from 'lodash/fp';

class Tile {
  col: number;
  row: number;
  id: string;

  isOpen: boolean;
  isMine: boolean;
  isFlag: boolean;

  constructor(row: number, col: number) {
    this.col = col;
    this.row = row;
    this.id = `${row},${col}`;
    this.isOpen = false;
    this.isMine = false;
    this.isFlag = false;
  }

  getCell(): Cell {
    return [this.row, this.col];
  }
}

type Cell = [number, number];
type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

// to make it easier to work w/a grid layout, use row,col instead of x,y
const MOVES: Record<Direction, Cell> = {
  N:  [-1,  0],
  NE: [-1,  1],
  E:  [ 0,  1],
  SE: [ 1,  1],
  S:  [ 1,  0],
  SW: [ 1, -1],
  W:  [ 0, -1],
  NW: [-1, -1],
};

const addCells = ([rowA, colA]: Cell, [rowB, colB]: Cell): Cell => [rowA + rowB, colA + colB];
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
      (_, row) => Array.from(
        { length: width },
        (_, col) => new Tile(row, col)
      )
    );

    this.setMines();
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

  isValidCell([row, col]: Cell) {
    return inRange(0, this.height, row) && inRange(0, this.width, col);
  }

  getNeighbor(mine: Tile, direction: Direction) {
    const neighborCell = addCells(mine.getCell(), MOVES[direction]);

    if (this.isValidCell(neighborCell)) {
      const [row, col] = neighborCell;

      return this.board[row][col];
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
