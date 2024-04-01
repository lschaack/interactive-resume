"use client"

import Image from "next/image"
import { Children, Dispatch, FC, MouseEventHandler, ReactNode, SetStateAction, createContext, memo, useContext, useEffect, useReducer, useState } from "react"
import clsx from "clsx";

import { MinesweeperBoard, Tile } from "../minesweeper/engine";

// TODO: monospace font
type TileProps = {
  onClick: MouseEventHandler;
  onContextMenu: MouseEventHandler;
  children?: ReactNode;
  className?: string | false | undefined;
};
const ClosedTile: FC<TileProps & { children?: ReactNode }> = ({ onClick, onContextMenu, className, children }) => {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      tabIndex={0}
      className={clsx(
        className,
        'font-bold',
        'flex justify-center items-center',
        'bg-slate-400',
        'border-4 border-solid',
        'border-l-slate-200 border-t-slate-200',
        'border-r-slate-600 border-b-slate-600',
        '[&:not(.flag)]:active:border-2',
        '[&:not(.flag)]:active:border-l-slate-600 [&:not(.flag)]:active:border-t-slate-600',
        '[&:not(.flag)]:active:border-r-slate-400 [&:not(.flag)]:active:border-b-slate-400',
        // TODO: focus styles
        // 'outline-none focus:shadow-outline',
      )}
    >
      {children}
    </button>
  )
}
const OpenTile: FC<TileProps & { children?: ReactNode }> = ({ onClick, onContextMenu, className, children }) => {
  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      tabIndex={-1}
      className={clsx(
        className,
        'font-bold',
        'flex justify-center items-center',
        'bg-slate-400',
        'border-l-2 border-t-2 border-solid border-slate-600',
        // TODO: focus styles
        // 'outline-none focus:shadow-outline',
      )}
    >
      {children}
    </button>
  )
}

const MinesweeperTile: FC<{ tile: Tile; board: MinesweeperBoard }> = memo(
  function MinesweeperTile({ tile, board }) {
    const handleClick = () => board.open(tile);
    const handleContextMenu: MouseEventHandler = e => {
      e.preventDefault();
      board.flag(tile);
    }

    if (tile.isOpen) {
      if (tile.isMine) {
        // TODO: culprit mine
        const icon = tile.isFlag ? 'MineWrong' : 'Mine';

        return (
          <OpenTile
            onClick={handleClick}
            onContextMenu={handleContextMenu}
          >
            <Image
              src={`${icon}.svg`}
              height={24}
              width={24}
              alt="flag (open)"
            />
          </OpenTile>
        );
      } else {
        const numSurroundingMines = board.getNeighborMines(tile).length;
        // don't show anything for 0
        const contents = numSurroundingMines || null;

        // TODO: different colors for different numbers of mines
        return (
          <OpenTile
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className={!contents && 'pointer-events-none'}
          >
            {contents}
          </OpenTile>
        );
      }
    } else {
      return (
        <ClosedTile
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          className={tile.isFlag && 'flag'}
        >
          {tile.isFlag && (
            <Image
              src="Flag.svg"
              height={24}
              width={24}
              alt="flag (closed)"
            />
          )}
        </ClosedTile>
      );
    }
  },
  ({ tile: prevTile, board: prevBoard }, { tile: nextTile, board: nextBoard }) => {
    return (
      prevBoard === nextBoard
      && prevTile.isOpen === nextTile.isOpen
      && prevTile.isFlag === nextTile.isFlag
      // TODO: can I actually skip the mine check? I think this is handled by isOpen
      // it's not gonna suddenly become a mine while staying open...
      // && prevTile.isMine === nextTile.isMine
    );
  }
);

const INIT_WIDTH = 10;
const INIT_HEIGHT = 10;
const INIT_MINES = 10;
type MinesweeperContext = {
  width: number,
  setWidth: Dispatch<SetStateAction<number>>,
  height: number,
  setHeight: Dispatch<SetStateAction<number>>,
  mines: number,
  setMines: Dispatch<SetStateAction<number>>,
  board: MinesweeperBoard,
};
const MinesweeperState = createContext<MinesweeperContext>({
  width: INIT_WIDTH,
  setWidth: () => undefined,
  height: INIT_HEIGHT,
  setHeight: () => undefined,
  mines: INIT_MINES,
  setMines: () => undefined,
  board: new MinesweeperBoard(0, 0, 0),
});
const MinesweeperProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [width, setWidth] = useState(INIT_WIDTH);
  const [height, setHeight] = useState(INIT_HEIGHT);
  const [mines, setMines] = useState(INIT_MINES);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [board, setBoard] = useState(new MinesweeperBoard(width, height, mines, forceUpdate));

  useEffect(() => {
    setBoard(new MinesweeperBoard(width, height, mines, forceUpdate));
  }, [width, height, mines, forceUpdate]);

  return (
    <MinesweeperState.Provider value={{
      width,
      setWidth,
      height,
      setHeight,
      mines,
      setMines,
      board,
    }}>
      {children}
    </MinesweeperState.Provider>
  )
}

type MinesweeperBorderType = 'outer' | 'middle' | 'inner';
const MINESWEEPER_BORDER: Record<MinesweeperBorderType, string> = {
  outer: clsx(
    'border-4 border-solid',
    'border-l-slate-200 border-t-slate-200',
    'border-r-slate-600 border-b-slate-600',
  ),
  middle: 'border-4 border-solid border-slate-400',
  inner: clsx(
    'border-4 border-solid',
    'border-l-slate-600 border-t-slate-600',
    'border-r-slate-200 border-b-slate-200',
  )
}
const MinesweeperBorder: FC<{ children?: ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={clsx(
      className,
      MINESWEEPER_BORDER.outer,
      // use gap background to represent the middle/high lane between every outer/inner border
      'p-2 flex gap-2 bg-slate-400',
    )}>
      {Children.map(children, child => (
        <div className={MINESWEEPER_BORDER.inner}>
          {child}
        </div>
      ))}
    </div>
  )
}

const MinesweeperSurface: FC<{ children?: ReactNode }> = ({ children }) => {
  const { height, width, board } = useContext(MinesweeperState);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, 24px)`,
        gridTemplateRows: `repeat(${height}, 24px)`,
        pointerEvents: board.status === 'lost' ? 'none' : 'unset',
        boxShadow: board.status === 'won' ? '0 0 24px gold' : 'unset',
      }}
    >
      {children}
    </div>
  )
}

const MinesweeperMenu = () => {
  const {
    width,
    setWidth,
    height,
    setHeight,
    mines,
    setMines,
    board,
  } = useContext(MinesweeperState);

  return (
    <form onSubmit={e => e.preventDefault()}>
      <label>
        <input className="w-8" />
        something
      </label>
    </form>
  )
}

const MinesweeperGame = () => {
  const { board } = useContext(MinesweeperState);

  return (
    <MinesweeperBorder className="flex flex-col">
      <MinesweeperMenu />
      <MinesweeperSurface>
        {board.board.map(row => (
          row.map(tile => (
            <MinesweeperTile
              key={tile.key}
              tile={tile}
              board={board}
            />
          ))
        ))}
      </MinesweeperSurface>
    </MinesweeperBorder>
  );
}

// TODO: add keyboard interactivity to this including arrow key focus navigation
// TODO: organize now that this file is massive
// TODO: monospace fonts so that I can easily add the menu
export default function Minesweeper() {
  return (
    <MinesweeperProvider>
      <MinesweeperGame />
    </MinesweeperProvider>
  );
}
