import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils } from "three";
import { GRID_SIZE, CELL, NUM_ZOMBIES, ZOMBIE_STEP_INTERVAL_MS, STEP_INTERVAL_MS, OBSTACLE_DENSITY, clamp } from "../../utils/constants";

import useKeyboardMovement from "../../Hooks/UseKeyboardMovement/UseKeyboardMovement";

export function Player({ pos, grid, setPlayerPos, setMoves, isGameOver }) {
  const meshRef = useRef();

  const worldFromGrid = (x, y) => {
    const half = (GRID_SIZE * CELL) / 2;
    const wx = -half + x * CELL + CELL / 2;
    const wz = -half + y * CELL + CELL / 2;
    return [wx, 0, wz];
  };

  useKeyboardMovement(grid, pos, setPlayerPos, setMoves, isGameOver);

  useFrame(() => {
    if (!meshRef.current) return;
    const [tx, , tz] = worldFromGrid(pos.x, pos.y);
    meshRef.current.position.x = MathUtils.lerp(meshRef.current.position.x, tx, 0.15);
    meshRef.current.position.z = MathUtils.lerp(meshRef.current.position.z, tz, 0.15);
  });

  return (
    <mesh ref={meshRef} position={worldFromGrid(pos.x, pos.y)} castShadow>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
  );
}
