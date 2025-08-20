import React, { useMemo } from "react";
import { GRID_SIZE, CELL, NUM_ZOMBIES, ZOMBIE_STEP_INTERVAL_MS, STEP_INTERVAL_MS, OBSTACLE_DENSITY, clamp } from "../../utils/constants";


export function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GRID_SIZE * CELL, GRID_SIZE * CELL]} />
      <meshStandardMaterial color="#2b2f33" />
    </mesh>
  );
}

export function CellWalls({ grid }) {
  const walls = useMemo(() => {
    const w = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x] === 1) w.push([x, y]);
      }
    }
    return w;
  }, [grid]);

  const worldFromGrid = (x, y) => {
    const half = (GRID_SIZE * CELL) / 2;
    const wx = -half + x * CELL + CELL / 2;
    const wz = -half + y * CELL + CELL / 2;
    return [wx, 0.25, wz];
  };

  return (
    <group>
      {walls.map(([x, y], i) => (
        <mesh key={i} position={worldFromGrid(x, y)} castShadow receiveShadow>
          <boxGeometry args={[CELL * 0.98, 0.5, CELL * 0.98]} />
          <meshStandardMaterial color="#3f4750" />
        </mesh>
      ))}
    </group>
  );
}
