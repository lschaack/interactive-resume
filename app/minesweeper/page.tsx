"use client"

import dynamic from "next/dynamic";

const Minesweeper = dynamic(() => import('../components/Minesweeper'), { ssr: false });

export default function MinesweeperPage() {
  return (
    <div className="w-fit text-black">
      <Minesweeper />
    </div>
  );
}
