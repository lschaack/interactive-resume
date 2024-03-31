"use client"

import Image from "next/image"
import { FC, ReactNode, memo, useReducer, useState } from "react"
import clsx from "clsx";

import { MinesweeperBoard, Tile } from "../minesweeper/engine";

type TileProps = {
  onClick: () => void;
  children?: ReactNode;
};
const ClosedTile: FC<TileProps & { children?: ReactNode }> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      tabIndex={0}
      className={clsx(
        'flex justify-center items-center',
        'bg-slate-400',
        'border-4 border-solid',
        'border-l-slate-200 border-t-slate-200',
        'border-r-slate-600 border-b-slate-600',
        'active:border-2',
        'active:border-l-slate-600 active:border-t-slate-600',
        'active:border-r-slate-400 active:border-b-slate-400',
        // TODO: focus styles
        // 'outline-none focus:shadow-outline',
      )}
    >
      {children}
    </button>
  )
}
const OpenTile: FC<TileProps & { children?: ReactNode }> = ({ onClick, children }) => {
  return (
    <button
      onClick={onClick}
      tabIndex={-1}
      className={clsx(
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

    if (tile.isOpen) {
      if (tile.isMine) {
        // TODO: culprit mine
        const icon = tile.isFlag ? 'MineWrong' : 'Mine';

        return (
          <OpenTile onClick={handleClick}>
            <Image
              src={`${icon}.svg`}
              height={24}
              width={24}
              alt="flag (closed)"
            />
          </OpenTile>
        );
      } else {
        const numSurroundingMines = board.getNeighborMines(tile).length;
        // don't show anything for 0
        const contents = numSurroundingMines || null;

        // TODO: different colors for different numbers of mines
        return (
          <OpenTile onClick={handleClick}>
            {contents}
          </OpenTile>
        );
      }
    } else {
      return (
        <ClosedTile onClick={handleClick}>
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
    // TODO: this can probably be sped up
    return (
      prevBoard === nextBoard
      && prevTile.isOpen === nextTile.isOpen
      && prevTile.isFlag === nextTile.isFlag
      && prevTile.isMine === nextTile.isMine
    );
  }
);

export default function Minesweeper() {
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(30);
  const [mines, setMines] = useState(180);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [board, setBoard] = useState(new MinesweeperBoard(width, height, mines, forceUpdate));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${width}, 24px)`,
      gridTemplateRows: `repeat(${height}, 24px)`,
    }}>
      {board.board.map(row => (
        row.map(tile => {
          const key = `${tile.id} ${tile.isFlag} ${tile.isOpen}`;

          return (
            <MinesweeperTile
              key={key}
              tile={tile}
              board={board}
            />
          );
        })
      ))}
    </div>
  );
}
