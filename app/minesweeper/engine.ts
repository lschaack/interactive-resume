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

export class MinesweeperBoard {
  board: Tile[][];
  height: number;
  width: number;
  nMines: number;
  status: 'won' | 'lost' | 'playing';
  onChange?: () => void;

  constructor(height: number, width: number, nMines: number, onChange?: () => void) {
    this.height = height;
    this.width = width;
    this.nMines = nMines;
    this.status = 'playing';
    this.onChange = onChange;

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

  getNeighbor(tile: Tile, direction: Direction) {
    const neighborCell = addCells(tile.getCell(), MOVES[direction]);

    if (this.isValidCell(neighborCell)) {
      const [row, col] = neighborCell;

      return this.board[row][col];
    } else {
      return null;
    }
  }

  // TODO: memoize
  getNeighbors(tile: Tile) {
    return Object
      .keys(MOVES)
      .map(direction => this.getNeighbor(tile, direction as Direction))
      .filter(Boolean) as Tile[];
  }

  // TODO: memoize
  getNeighborMines(tile: Tile) {
    return this
      .getNeighbors(tile)
      .filter(mine => mine.isMine);
  }

  // TODO: memoize
  getNeighborFlags(tile: Tile) {
    return this
      .getNeighbors(tile)
      .filter(mine => mine.isFlag);
  }

  getAllFlags() {
    return this
      .board
      .flatMap(row => row.filter(tile => tile.isFlag));
  }

  getAllMines() {
    return this
      .board
      .flatMap(row => row.filter(tile => tile.isMine));
  }

  flag(tile: Tile) {
    tile.isFlag = !tile.isFlag;

    this.onChange?.();
  }

  doOpen(tile: Tile) {
    if (!tile.isFlag) {
      tile.isOpen = true;

      if (tile.isMine) this.lose();
    }
  }

  // Opens recursively if applicable, doOpen does the actual work
  // FIXME: rules for when a square is open-able are seemingly broken
  open(tile: Tile, visited = new Set<string>()) {
    if (!tile.isFlag) {
      this.doOpen(tile);
      visited.add(tile.id);
  
      const numNeighborMines = this.getNeighborMines(tile).length;
  
      if (numNeighborMines === 0 || numNeighborMines === this.getNeighborFlags(tile).length) {
        // Open all neighbors
        this
          .getNeighbors(tile)
          .forEach(neighbor => {
            if (!visited.has(neighbor.id) && !neighbor.isOpen) {
              // TODO: define boundary where this stops
              this.open(neighbor, visited);
            }
          })
      }
  
      if (this.status === 'lost') tile.isCulprit = true;
  
      this.onChange?.();
    }
  }

  // TODO: this will re-render twice since it gets called from doOpen...
  // not a big issue but is there any chance I would need to call lose()
  // from any other context?
  lose() {
    this.status = 'lost';
    this
      .getAllMines()
      .forEach(tile => {
        if (!tile.isOpen) this.doOpen(tile);
      });

    this.onChange?.();
  }

  // TODO: call win
  win() {
    this.status = 'won';

    this.onChange?.();
  }
}
