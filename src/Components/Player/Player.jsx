import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { MathUtils, TextureLoader } from "three";
import { GRID_SIZE, CELL } from "../../utils/constants";
import useKeyboardMovement from "../../Hooks/UseKeyboardMovement/UseKeyboardMovement";

// Import player textures
import playerCalm from "../../models/playerCalm.png";
import playerPanic from "../../models/PlayerNervous.png";
import playerZombie from "../../models/PlayerZombiefied.png";

export function Player({ pos, grid, setPlayerPos, setMoves, isGameOver, zombies }) {
  const meshRef = useRef();
  const firstFrame = useRef(true); // Track first frame

  // Load textures
  const calmTexture = useLoader(TextureLoader, playerCalm);
  const panicTexture = useLoader(TextureLoader, playerPanic);
  const zombieTexture = useLoader(TextureLoader, playerZombie);

  // Convert grid coords to world position
  const worldFromGrid = (x, y) => {
    const half = (GRID_SIZE * CELL) / 2;
    const wx = -half + x * CELL + CELL / 2;
    const wz = -half + y * CELL + CELL / 2;
    return [wx, 0, wz];
  };

  // Movement logic
  useKeyboardMovement(grid, pos, setPlayerPos, setMoves, isGameOver);

  // Detect if zombie is nearby (within 3 blocks)
  const isZombieNear = useMemo(() => {
    return zombies?.some(
      (z) => Math.abs(z.x - pos.x) <= 3 && Math.abs(z.y - pos.y) <= 3
    );
  }, [zombies, pos]);

  // Select player texture based on state
  const playerTexture = useMemo(() => {
    if (isGameOver) return zombieTexture; // touched by zombie
    if (isZombieNear) return panicTexture; // zombie within 3 blocks
    return calmTexture; // default calm face
  }, [isGameOver, isZombieNear, calmTexture, panicTexture, zombieTexture]);

  // Billboard effect: rotate only around Y axis, keep upright
  useFrame(() => {
    if (!meshRef.current) return;
    const [tx, , tz] = worldFromGrid(pos.x, pos.y);
    const targetY = 0.75;

    if (firstFrame.current) {
      // Set exact position on first frame to prevent glitch
      meshRef.current.position.set(tx, targetY, tz);
      firstFrame.current = false;
      return;
    }

    // Smoothly interpolate position after first frame
    meshRef.current.position.x = MathUtils.lerp(meshRef.current.position.x, tx, 0.15);
    meshRef.current.position.y = MathUtils.lerp(meshRef.current.position.y, targetY, 0.15);
    meshRef.current.position.z = MathUtils.lerp(meshRef.current.position.z, tz, 0.15);

    meshRef.current.rotation.set(180, 0, 0);
  });

  return (
    <mesh ref={meshRef} castShadow>
      <planeGeometry args={[1.5, 1.5]} />
      <meshStandardMaterial map={playerTexture} transparent side={2} />
    </mesh>
  );
}
