import React, { useState, useEffect } from "react";
import { Floor, CellWalls } from "../Grid/Grid";
import { Player } from "../Player/Player";
import { ZombiesController } from "../ZombieController/ZombieController";
import { GRID_SIZE, CELL, NUM_ZOMBIES, ZOMBIE_STEP_INTERVAL_MS, STEP_INTERVAL_MS, OBSTACLE_DENSITY, clamp } from "../../utils/constants";

function randomEmptyCell(grid) {
  while (true) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (grid[y][x] === 0) return { x, y };
  }
}

function generateGrid() {
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      if (Math.random() < 0.3) grid[y][x] = 1;
    }
  }
  return grid;
}

// Helper to initialize zombies with stepStart
function initialZombiePositions(grid) {
  const now = performance.now();
  return Array.from({ length: NUM_ZOMBIES }, () => {
    const cell = randomEmptyCell(grid);
    return { ...cell, stepStart: now };
  });
}

export default function Game({ onGameOver, setMoves, moves, isGameOver }) {
  const [grid, setGrid] = useState(generateGrid);
  const [playerPos, setPlayerPos] = useState(() => randomEmptyCell(grid));
  const [zombiePositions, setZombiePositions] = useState(() =>
    initialZombiePositions(grid)
  );
  const [zombieSpeed, setZombieSpeed] = useState(ZOMBIE_STEP_INTERVAL_MS);

  // Reset game state when isGameOver becomes false (on reset)
  useEffect(() => {
    if (!isGameOver) {
      const newGrid = generateGrid();
      setGrid(newGrid);
      setPlayerPos(randomEmptyCell(newGrid));
      setZombiePositions(initialZombiePositions(newGrid));
      setZombieSpeed(ZOMBIE_STEP_INTERVAL_MS);
    }
  }, [isGameOver]);

  useEffect(() => {
    if (moves > 0 && moves % 10 === 0) {
      setZombieSpeed((prev) => Math.max(prev - 20, 80));
    }
  }, [moves]);
  
  useEffect(() => {
    if (isGameOver) return;
    for (const z of zombiePositions) {
      if (z.x === playerPos.x && z.y === playerPos.y) {
        onGameOver();
        break;
      }
    }
  }, [playerPos, zombiePositions, onGameOver, isGameOver]);

  return (
    <>
      <Floor />
      <CellWalls grid={grid} />
      <Player
        pos={playerPos}
        grid={grid}
        setPlayerPos={setPlayerPos}
        setMoves={setMoves}
        isGameOver={isGameOver}
      />
      {!isGameOver && (
        <ZombiesController
          grid={grid}
          playerPos={playerPos}
          zombiePositions={zombiePositions}
          setZombiePositions={setZombiePositions}
          zombieSpeed={zombieSpeed}
          isGameOver={isGameOver}
        />
      )}
    </>
  );
}