import { inRange } from 'lodash/fp';

export class Tile {
  col: number;
  row: number;
  id: string;

  isOpen: boolean;
  isMine: boolean;
  isFlag: boolean;
  isCulprit: boolean;

  constructor(row: number, col: number) {
    this.col = col;
    this.row = row;
    this.id = `${row},${col}`;
    this.isOpen = false;
    this.isMine = false;
    this.isFlag = false;
    this.isCulprit = false;
  }

  get cell(): Cell {
    return [this.row, this.col];
  }

  get key() {
    return `${this.id};${this.isFlag};${this.isOpen}`;
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

export class MinesweeperBoard {
  board: Tile[][];
  neighbors: Tile[][][];
  neighborMines: number[][];
  height: number;
  width: number;
  size: number;
  nMines: number;
  status: 'won' | 'lost' | 'playing';
  onChange?: () => void;
  nFlaggedMines: number;

  mines: Set<Tile>;
  flags: Set<Tile>;
  closed: Set<Tile>;

  constructor(height: number, width: number, nMines: number, onChange?: () => void) {
    this.height = height;
    this.width = width;
    this.size = this.height * this.width;
    this.nMines = nMines;
    this.nFlaggedMines = 0;
    this.status = 'playing';
    this.onChange = onChange;

    this.mines = new Set<Tile>();
    this.flags = new Set<Tile>();

    this.board = Array.from(
      { length: height },
      (_, row) => Array.from(
        { length: width },
        (_, col) => new Tile(row, col)
      )
    );

    this.neighbors = this.board.map(row =>
      row.map(tile =>
        this._getNeighbors(tile)
      )
    );

    this.neighborMines = this.neighbors.map(row =>
      row.map(neighbors =>
        neighbors
          .filter(neighbor => neighbor.isMine)
          .length
      )
    )

    this.closed = new Set<Tile>(this.board.flatMap(row => row));

    this.setMines();
  }

  setMines() {
    while (this.mines.size < this.nMines) {
      // TODO: check that this gets every cell
      const row = Math.floor(Math.random() * this.height);
      const col = Math.floor(Math.random() * this.width);

      const chosenTile = this.board[row][col];

      if (!chosenTile.isMine) {
        chosenTile.isMine = true;

        this.mines.add(chosenTile);
      }
    }

    // set neighbor mines whenever setting mines
    this.neighborMines = this.neighbors.map(row =>
      row.map(neighbors =>
        neighbors
          .filter(neighbor => neighbor.isMine)
          .length
      )
    )
  }

  isValidCell([row, col]: Cell) {
    return inRange(0, this.height, row) && inRange(0, this.width, col);
  }

  getNeighbor(tile: Tile, direction: Direction) {
    const neighborCell = addCells(tile.cell, MOVES[direction]);

    if (this.isValidCell(neighborCell)) {
      const [row, col] = neighborCell;

      return this.board[row][col];
    } else {
      return null;
    }
  }

  _getNeighbors(tile: Tile) {
    return Object
      .keys(MOVES)
      .map(direction => this.getNeighbor(tile, direction as Direction))
      .filter(Boolean) as Tile[];
  }

  getNeighborFlags(tile: Tile) {
    return this.neighbors[tile.row][tile.col].filter(mine => mine.isFlag);
  }

  flag(tile: Tile) {
    if (!tile.isOpen) {
      tile.isFlag = !tile.isFlag;
  
      if (tile.isFlag) this.flags.add(tile);
      else this.flags.delete(tile);

      if (tile.isMine) {
        if (tile.isFlag) this.nFlaggedMines += 1;
        else this.nFlaggedMines -= 1;
      }
  
      this.checkWinCondition();
  
      this.onChange?.();
    }
  }

  doOpen(tile: Tile) {
    if (!tile.isFlag) {
      tile.isOpen = true;
      this.closed.delete(tile);

      if (tile.isMine && this.status !== 'lost') this.lose();
    }
  }

  // Opens recursively if applicable, doOpen does the actual work
  open(tile: Tile, visited = new Set<Tile>()) {
    if (!tile.isFlag) {
      this.doOpen(tile);
      visited.add(tile);
  
      const numNeighborMines = this.neighborMines[tile.row][tile.col];
  
      if (numNeighborMines === 0 || numNeighborMines === this.getNeighborFlags(tile).length) {
        // Open all neighbors
        this
          .neighbors[tile.row][tile.col]
          .forEach(neighbor => {
            if (!visited.has(neighbor) && !neighbor.isOpen) {
              this.open(neighbor, visited);
            }
          })
      }

      if (this.status === 'lost') {
        tile.isCulprit = true;
      } else {
        this.checkWinCondition();
      }

      this.onChange?.();
    }
  }

  checkWinCondition() {
    const isEveryMineFlagged = this.nFlaggedMines === this.nMines;
    const isEverythingElseOpen = this.closed.size === this.nMines;

    if (isEveryMineFlagged && isEverythingElseOpen) this.win();
  }

  lose() {
    this.status = 'lost';
    this.mines.forEach(tile => {
      if (!tile.isOpen) this.doOpen(tile);
    });

    this.onChange?.();
  }

  win() {
    this.status = 'won';

    this.onChange?.();
  }
}
