"use client"

import { Children, Dispatch, FC, MouseEventHandler, ReactNode, SetStateAction, createContext, memo, useContext, useEffect, useReducer, useState } from "react"
import Image from "next/image"
import clsx from "clsx";
import { clamp } from 'lodash/fp';

import { MinesweeperBoard, Tile } from "../minesweeper/engine";

type TileProps = {
  onClick: MouseEventHandler;
  onContextMenu: MouseEventHandler;
  children?: ReactNode;
  className?: string | false | undefined;
};
const ClosedTile: FC<TileProps & { children?: ReactNode }> = ({ onClick, onContextMenu, className, children }) => {
  const { setIsMouseDown } = useContext(MinesweeperState);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onContextMenu={onContextMenu}
      tabIndex={0}
      className={clsx(
        className,
        'font-bold',
        'flex justify-center items-center',
        'bg-slate-300',
        'border-4 border-solid',
        'border-l-slate-200 border-t-slate-200',
        'border-r-slate-500 border-b-slate-500',
        '[&:not(.flag)]:active:border-2',
        '[&:not(.flag)]:active:border-l-slate-500 [&:not(.flag)]:active:border-t-slate-500',
        '[&:not(.flag)]:active:border-r-slate-300 [&:not(.flag)]:active:border-b-slate-300',
        // TODO: focus styles
        // 'outline-none focus:shadow-outline',
      )}
    >
      {children}
    </button>
  )
}
const OpenTile: FC<TileProps & { children?: ReactNode }> = ({ onClick, onContextMenu, className, children }) => {
  const { setIsMouseDown } = useContext(MinesweeperState);

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
      onContextMenu={onContextMenu}
      tabIndex={-1}
      className={clsx(
        className,
        'font-bold',
        'flex justify-center items-center',
        'bg-slate-300',
        'border-l-2 border-t-2 border-solid border-slate-500',
        // TODO: focus styles
        // 'outline-none focus:shadow-outline',
      )}
    >
      {children}
    </button>
  )
}

const TILE_TEXT_COLOR = {
  1: 'text-blue-700',
  2: 'text-green-700',
  3: 'text-orange-700',
  4: 'text-purple-700',
  5: 'text-red-700',
  6: 'text-indigo-700',
  7: 'text-gray-800',
  8: 'text-black',
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

        return (
          <OpenTile
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            className={clsx(
              !contents && 'pointer-events-none',
              contents && TILE_TEXT_COLOR[contents as keyof typeof TILE_TEXT_COLOR]
            )}
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
  ({ tile: prevTile, board: prevBoard }, { tile: nextTile, board: nextBoard }) => (
    // TODO: can I actually skip the mine check? I think this is handled by isOpen
    // it's not gonna suddenly become a mine while staying open...
    prevBoard === nextBoard
    && prevTile.isOpen === nextTile.isOpen
    && prevTile.isFlag === nextTile.isFlag
  )
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
  isMouseDown: boolean,
  setIsMouseDown: Dispatch<SetStateAction<boolean>>,
  isPlaying: boolean,
  board: MinesweeperBoard,
};
const MinesweeperState = createContext<MinesweeperContext>({
  width: INIT_WIDTH,
  setWidth: () => undefined,
  height: INIT_HEIGHT,
  setHeight: () => undefined,
  mines: INIT_MINES,
  setMines: () => undefined,
  isMouseDown: false,
  setIsMouseDown: () => undefined,
  isPlaying: false,
  board: new MinesweeperBoard(0, 0, 0),
});
const MinesweeperProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [width, setWidth] = useState(INIT_WIDTH);
  const [height, setHeight] = useState(INIT_HEIGHT);
  const [mines, setMines] = useState(INIT_MINES);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [x, forceUpdate] = useReducer(x => x + 1, 0);
  const [board, setBoard] = useState(new MinesweeperBoard(width, height, mines, forceUpdate));

  useEffect(() => {
    setBoard(new MinesweeperBoard(width, height, mines, forceUpdate));
  }, [width, height, mines, forceUpdate]);

  const isPlaying = x > 0 && board.status !== 'won';

  return (
    <MinesweeperState.Provider value={{
      width,
      setWidth,
      height,
      setHeight,
      mines,
      setMines,
      isMouseDown,
      setIsMouseDown,
      isPlaying,
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
    'border-r-slate-500 border-b-slate-500',
  ),
  middle: 'border-4 border-solid border-slate-300',
  inner: clsx(
    'border-4 border-solid',
    'border-l-slate-500 border-t-slate-500',
    'border-r-slate-200 border-b-slate-200',
  )
}
const MinesweeperBorder: FC<{ children?: ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={clsx(
      className,
      MINESWEEPER_BORDER.outer,
      // use gap background to represent the middle/high lane between every outer/inner border
      'p-2 flex gap-2 bg-slate-300',
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

type AlarmClockifyProps = {
  value: number;
  length?: number;
}
const AlarmClockify: FC<AlarmClockifyProps> = ({ value, length = 3 }) => {
  const maxValue = Math.pow(10, length) - 1;
  const clampedValue = clamp(0, maxValue, value);
  const content = clampedValue.toString().padStart(length, '0');

  return (
    <p className="text-center flex text-red-500 font-black">
      {content.split('').map((character, index) => (
        <span
          key={`${character}-${index}`}
          className={clsx(
            'inline-block w-3 h-6 px-2',
            'bg-slate-800',
            'flex justify-center items-center',
          )}
        >
          {character}
        </span>
      ))}
    </p>
  )
}

const MineCounter = () => {
  const { board } = useContext(MinesweeperState);

  const numericContent = board.nMines - board.flags.size;

  return <AlarmClockify value={numericContent} />;
}

const Reaction = () => {
  const { isMouseDown, board } = useContext(MinesweeperState);

  if (board.status === 'won') return <p>😎</p>;
  else if (board.status === 'lost') return <p>😵</p>;
  else if (isMouseDown) return <p>😮</p>;
  else return <p>😄</p>;
}

const TimeTaken = () => {
  const { isPlaying } = useContext(MinesweeperState);
  const [startTime, setStartTime] = useState(0);
  const [secondsPassed, setSecondsPassed] = useState(0);

  useEffect(() => {
    if (isPlaying) {
      if (!startTime) setStartTime(Date.now());

      let timerRef: NodeJS.Timeout;
      const continuouslyUpdateSecondsPassed = () => {
        setSecondsPassed(Math.floor((Date.now() - startTime) / 1000));

        timerRef = setTimeout(continuouslyUpdateSecondsPassed, 1000);
      }

      continuouslyUpdateSecondsPassed();

      return () => clearTimeout(timerRef);
    }
  }, [isPlaying, startTime]);

  return (
    <AlarmClockify value={secondsPassed} />
  );
}

// TODO: monospace number input
const MinesweeperHeader = () => {
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
    <div className="flex justify-between">
      <MineCounter />
      <Reaction />
      <TimeTaken />
    </div>
  )
}

const MinesweeperGame = () => {
  const { board } = useContext(MinesweeperState);

  return (
    <MinesweeperBorder className="flex flex-col font-mono">
      <MinesweeperHeader />
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
export default function Minesweeper() {
  return (
    <MinesweeperProvider>
      <MinesweeperGame />
    </MinesweeperProvider>
  );
}
