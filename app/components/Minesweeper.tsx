"use client"

import Image from "next/image"
import { useState } from "react"
import { MinesweeperBoard } from "../minesweeper/engine";

export default function Minesweeper() {
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(30);
  const [mines, setMines] = useState(180);
  const [minesweeper, setMinesweeper] = useState(new MinesweeperBoard(width, height, mines));

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${width}, 24px)`,
      gridTemplateRows: `repeat(${height}, 24px)`,
    }}>
      {minesweeper.board.map(row => (
        row.map(tile => {
          const key = `${tile.id} ${tile.isFlag} ${tile.isOpen}`;
          const handleClick = () => {
            minesweeper.getNeighborMines(tile);
          }

          if (tile.isMine) {
            return (
              <Image
                key={key}
                src="Mine.svg"
                height={24}
                width={24}
                alt="mine"
                onClick={handleClick}
              />
            )
          } else if (tile.isFlag) {
            return (
              <Image
                key={key}
                src="Flag.svg"
                height={24}
                width={24}
                alt="mine"
                onClick={handleClick}
              />
            )
          } else {
            const numNeighborMines = minesweeper.getNeighborMines(tile).length;

            if (numNeighborMines) {
              return (
                <div
                  key={key}
                  className="w-6 h-6 text-center"
                  onClick={handleClick}
                >
                  {numNeighborMines}
                </div>
              );
            } else {
              return (
                <div
                  key={key}
                  className="w-6 h-6 text-center"
                  onClick={handleClick}
                />
              );
            }
          }
        })
      ))}
    </div>
  )
}
