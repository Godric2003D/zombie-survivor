import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { GRID_SIZE, CELL, NUM_ZOMBIES, ZOMBIE_STEP_INTERVAL_MS, STEP_INTERVAL_MS, OBSTACLE_DENSITY, clamp } from "../../utils/constants";


export default function useKeyboardMovement(grid, playerPos, setPlayerPos, setMoves, isGameOver) {
  const lastMoveRef = useRef(0);
  const pressedKeysRef = useRef(new Set());

  useEffect(() => {
    const onKeyDown = (e) => pressedKeysRef.current.add(e.code);
    const onKeyUp = (e) => pressedKeysRef.current.delete(e.code);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useFrame(() => {
    if (isGameOver) return;
    const now = performance.now();
    if (now - lastMoveRef.current < 90) return;
    lastMoveRef.current = now;

    let dir = null;
    if (pressedKeysRef.current.has("KeyW") || pressedKeysRef.current.has("ArrowUp")) dir = { dx: 0, dy: -1 };
    else if (pressedKeysRef.current.has("KeyS") || pressedKeysRef.current.has("ArrowDown")) dir = { dx: 0, dy: 1 };
    else if (pressedKeysRef.current.has("KeyA") || pressedKeysRef.current.has("ArrowLeft")) dir = { dx: -1, dy: 0 };
    else if (pressedKeysRef.current.has("KeyD") || pressedKeysRef.current.has("ArrowRight")) dir = { dx: 1, dy: 0 };

    if (dir) {
      const nx = clamp(playerPos.x + dir.dx, 0, grid[0].length - 1);
      const ny = clamp(playerPos.y + dir.dy, 0, grid.length - 1);
      if (grid[ny][nx] === 0) {
        setPlayerPos({ x: nx, y: ny });
        setMoves((m) => m + 1);
      }
    }
  });
}
