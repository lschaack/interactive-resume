import { sample } from 'lodash';
import { inRange } from 'lodash/fp';

const SKIP_FRAMES = 8;

export class Tile {
  col: number;
  row: number;
  id: string;

  isOpen: boolean;
  isMine: boolean;
  isFlag: boolean;
  isCulprit: boolean;
  isGlasses: boolean;

  constructor(row: number, col: number) {
    this.col = col;
    this.row = row;
    this.id = `${row},${col}`;
    this.isOpen = false;
    this.isMine = false;
    this.isFlag = false;
    this.isCulprit = false;
    this.isGlasses = false;
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

const MOVE_CELLS: Cell[] = Object.values(MOVES); // should be insert order for expected behavior

const addCells = ([rowA, colA]: Cell, [rowB, colB]: Cell): Cell => [rowA + rowB, colA + colB];
const areCellsEqual = ([rowA, colA]: Cell, [rowB, colB]: Cell): boolean => rowA === rowB && colA === colB;
const getApproxCellDistance = ([rowA, colA]: Cell, [rowB, colB]: Cell) => Math.abs(rowB - rowA + colB - colA);

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
  // for animations
  currentTile: Tile;
  currentFrame: number;
  currentMove = sample(MOVE_CELLS)!;
  snakeQueue: Tile[];
  snakeLength = 30;

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

    this.currentTile = this.getRandomTile();
    this.currentFrame = 0;
    this.snakeQueue = new Array(this.snakeLength);

    this.closed = new Set<Tile>(this.board.flatMap(row => row));

    this.setMines();
  }

  // TODO: this gets called a bizarre number of times on init...why?
  getRandomTile() {
    const row = Math.floor(Math.random() * this.height);
    const col = Math.floor(Math.random() * this.width);

    return this.board[row]?.[col];
  }

  getRandomMove() {
    const allMoves = Object.values(MOVES);

    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  chooseBestMove(options: Cell[]) {
    const validMoves = options
      .map(move => ({ move, destination: addCells(this.currentTile.cell, move) }))
      .filter(({ destination }) => this.isValidCell(destination))
      .filter(({ destination: [row, col] }) => !this.board[row][col].isFlag);

    if (!validMoves.length) return undefined;

    // prefer cells that aren't occupied
    const [preferred, other] = validMoves.reduce<[Cell[], Cell[]]>((acc, { move, destination }) => {
      // FIXME: speed this up w/Set
      const isDestinationOccupied = this.snakeQueue.some(tile => areCellsEqual(destination, tile.cell));

      if (isDestinationOccupied) acc[1].push(move);
      else acc[0].push(move);

      return acc;
    }, [[], []]);

    if (preferred.length) return sample(preferred);
    else return sample(other);
  }

  getSnakingTile(): Tile {
    // sort moves into those close to the current move (in the current compass direction or one away)
    // and those that are far from the current move, cause snakes turn slow
    const [preferredMoves, otherMoves] = MOVE_CELLS.reduce<[Cell[], Cell[]]>((acc, move) => {
      const distanceFromCurrentMove = getApproxCellDistance(move, this.currentMove);
      if (distanceFromCurrentMove < 2) {
        acc[0].push(move);
        // stupid way to increase probability of current direction
        if (distanceFromCurrentMove < 1) acc[0].push(move)
      } else {
        acc[1].push(move);
      }

      return acc;
    }, [[], []]);

    // choose nearest move to a valid cell that is not flagged,
    // preferring cells not already occupied by snakes
    const chosenMove = this.chooseBestMove(preferredMoves) || this.chooseBestMove(otherMoves)!;
    const [nextRow, nextCol] = addCells(this.currentTile.cell, chosenMove);
    const nextTile = this.board[nextRow][nextCol];

    this.currentMove = chosenMove;
    this.currentTile = nextTile;

    return nextTile;
  }

  setMines() {
    while (this.mines.size < this.nMines) {
      const chosenTile = this.getRandomTile();

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
    if (!tile.isOpen && this.status !== 'won') {
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

  doClose(tile: Tile) {
    if (!tile.isFlag) {
      tile.isOpen = false;
      this.closed.add(tile);
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
    if (this.status !== 'won') {
      console.log('winning')
      this.status = 'won';
  
      this.onChange?.();
  
      return this.startWinAnimation();
    }
  }

  doWinAnimation = () => {
    // TODO: a less terrible way of slowing down this animation
    if (this.currentFrame % SKIP_FRAMES === 0) {
      const tileToFlip = this.getSnakingTile();

      this.doClose(tileToFlip);

      // ########## head
      tileToFlip.isGlasses = true;
      if (this.snakeQueue.at(-1)) this.snakeQueue.at(-1)!.isGlasses = false;
      // ########## /head

      // TODO: need to refresh values' place in the queue when they're visited twice
      this.snakeQueue.push(tileToFlip);
      const unFlip = this.snakeQueue.shift();
      // TODO: make this not take ages
      const isUnflipStillInQueue = unFlip && this.snakeQueue.some(tile => tile.id === unFlip.id);
      if (unFlip && !isUnflipStillInQueue) this.doOpen(unFlip);

      this.onChange?.();
    }

    this.currentFrame += 1;

    requestAnimationFrame(this.doWinAnimation);
  }

  startWinAnimation() {
    requestAnimationFrame(this.doWinAnimation);
  }

  autoWin() {
    this.nFlaggedMines = 0;
    this.closed.clear();

    this.board.forEach(row => {
      row.forEach(tile => {
        if (tile.isMine) {
          tile.isFlag = true;
          tile.isOpen = false;

          this.nFlaggedMines += 1;
          this.closed.add(tile)
        } else {
          tile.isFlag = false;
          tile.isOpen = true;
        }
      })
    });

    this.checkWinCondition();
  }
}
