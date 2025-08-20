import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { MathUtils } from "three";
import "./App.css";

// ------------------ CONFIG ------------------ //
const GRID_SIZE = 10;
const CELL = 1;
const NUM_ZOMBIES = 1;
const STEP_INTERVAL_MS = 90; // Player movement throttle
const ZOMBIE_STEP_INTERVAL_MS = 200; // Zombie movement throttle
const OBSTACLE_DENSITY = 0.3;

// Utility: clamp within [0, GRID_SIZE-1]
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function keyToDir(code) {
  switch (code) {
    case "KeyW":
    case "ArrowUp":
      return { dx: 0, dy: -1 };
    case "KeyS":
    case "ArrowDown":
      return { dx: 0, dy: 1 };
    case "KeyA":
    case "ArrowLeft":
      return { dx: -1, dy: 0 };
    case "KeyD":
    case "ArrowRight":
      return { dx: 1, dy: 0 };
    default:
      return null;
  }
}

// ------------------ PATHFINDING (Dijkstra) ------------------ //
function neighborsOf(x, y, grid) {
  const neigh = [];
  const tryPush = (nx, ny) => {
    if (nx >= 0 && ny >= 0 && nx < GRID_SIZE && ny < GRID_SIZE && grid[ny][nx] === 0) {
      neigh.push([nx, ny]);
    }
  };
  tryPush(x + 1, y);
  tryPush(x - 1, y);
  tryPush(x, y + 1);
  tryPush(x, y - 1);
  return neigh;
}

function dijkstra(grid, start, goal) {
  const [sx, sy] = start;
  const [gx, gy] = goal;
  const dist = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(Infinity));
  const visited = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  const prev = new Map();

  const pq = [];
  const push = (x, y, d) => {
    pq.push([d, x, y]);
    pq.sort((a, b) => a[0] - b[0]);
  };

  dist[sy][sx] = 0;
  push(sx, sy, 0);

  while (pq.length) {
    const [d, x, y] = pq.shift();
    if (visited[y][x]) continue;
    visited[y][x] = true;
    if (x === gx && y === gy) break;

    for (const [nx, ny] of neighborsOf(x, y, grid)) {
      const nd = d + 1;
      if (nd < dist[ny][nx]) {
        dist[ny][nx] = nd;
        prev.set(`${nx},${ny}`, `${x},${y}`);
        push(nx, ny, nd);
      }
    }
  }
  return { dist, prev };
}

function reconstructPath(prev, start, goal) {
  const [sx, sy] = start;
  const [gx, gy] = goal;
  const path = [];
  let cur = `${gx},${gy}`;
  const startKey = `${sx},${sy}`;
  if (!prev.has(cur) && cur !== startKey) return [];
  while (cur !== startKey) {
    path.push(cur);
    cur = prev.get(cur);
    if (cur == null) return [];
  }
  path.reverse();
  return path.map((s) => s.split(",").map((v) => parseInt(v, 10)));
}

// ------------------ GRID / WORLD HELPERS ------------------ //
function worldFromGrid(x, y) {
  const half = (GRID_SIZE * CELL) / 2;
  const wx = -half + x * CELL + CELL / 2;
  const wz = -half + y * CELL + CELL / 2;
  return [wx, 0, wz];
}

// ------------------ SCENE OBJECTS ------------------ //
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[GRID_SIZE * CELL, GRID_SIZE * CELL]} />
      <meshStandardMaterial color="#2b2f33" />
    </mesh>
  );
}

function CellWalls({ grid }) {
  const walls = useMemo(() => {
    const w = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (grid[y][x] === 1) w.push([x, y]);
      }
    }
    return w;
  }, [grid]);

  return (
    <group>
      {walls.map(([x, y], i) => {
        const [wx, wy, wz] = worldFromGrid(x, y);
        return (
          <mesh key={i} position={[wx, 0.25, wz]} castShadow receiveShadow>
            <boxGeometry args={[CELL * 0.98, 0.5, CELL * 0.98]} />
            <meshStandardMaterial color="#3f4750" />
          </mesh>
        );
      })}
    </group>
  );
}

function Player({ pos }) {
  const meshRef = useRef();

  useFrame(() => {
    const [tx, , tz] = worldFromGrid(pos.x, pos.y);
    if (meshRef.current) {
      meshRef.current.position.x = MathUtils.lerp(meshRef.current.position.x, tx, 0.15);
      meshRef.current.position.z = MathUtils.lerp(meshRef.current.position.z, tz, 0.15);
    }
  });

  return (
    <mesh ref={meshRef} position={worldFromGrid(pos.x, pos.y)} castShadow>
      <sphereGeometry args={[0.35, 16, 16]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
  );
}

function Zombie({ pos }) {
  const [wx, wy, wz] = worldFromGrid(pos.x, pos.y);
  return (
    <mesh position={[wx, 0.35, wz]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  );
}

// ------------------ GAME CORE ------------------ //
function useKeyboardMovement(grid, playerPos, setPlayerPos, onMove) {

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
    const now = performance.now();
    if (now - lastMoveRef.current < STEP_INTERVAL_MS) {
      return;
    }
    lastMoveRef.current = now;

    let dir = null;
    if (pressedKeysRef.current.has("KeyW") || pressedKeysRef.current.has("ArrowUp")) {
      dir = { dx: 0, dy: -1 };
    } else if (pressedKeysRef.current.has("KeyS") || pressedKeysRef.current.has("ArrowDown")) {
      dir = { dx: 0, dy: 1 };
    } else if (pressedKeysRef.current.has("KeyA") || pressedKeysRef.current.has("ArrowLeft")) {
      dir = { dx: -1, dy: 0 };
    } else if (pressedKeysRef.current.has("KeyD") || pressedKeysRef.current.has("ArrowRight")) {
      dir = { dx: 1, dy: 0 };
    }

    if (dir) {
      const nx = clamp(playerPos.x + dir.dx, 0, GRID_SIZE - 1);
      const ny = clamp(playerPos.y + dir.dy, 0, GRID_SIZE - 1);
      if (grid[ny][nx] === 0) {
        setPlayerPos({ x: nx, y: ny });
        onMove((m) => m + 1);
      }
    }
  });

  return null;
}

function randomEmptyCell(grid) {
  while (true) {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    if (grid[y][x] === 0) return { x, y };
  }
}

function generateGrid(seed = 0) {
  let r = seed || Math.floor(Math.random() * 1000000);
  const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));

  for (let y = 1; y < GRID_SIZE - 1; y++) {
    for (let x = 1; x < GRID_SIZE - 1; x++) {
      if (rnd() < OBSTACLE_DENSITY) grid[y][x] = 1;
    }
  }
  return grid;
}

function ZombiesController({ grid, zombiePositions, setZombiePositions, playerPos, zombieSpeed }) {
  const lastStepRef = useRef(performance.now());
  const zombieRefs = useRef([]);

  useFrame(() => {
    const now = performance.now();
    if (now - lastStepRef.current >= zombieSpeed) {
      lastStepRef.current = now;

      setZombiePositions((prev) =>
        prev.map((z) => {
          const pathResult = dijkstra(grid, [z.x, z.y], [playerPos.x, playerPos.y]);
          const path = reconstructPath(pathResult.prev, [z.x, z.y], [playerPos.x, playerPos.y]);
          if (path.length > 0) {
            const [nextX, nextY] = path[0];
            return { x: nextX, y: nextY, stepStart: now };
          }
          return { ...z, stepStart: now };
        })
      );
    }
  });

  return (zombiePositions || []).map((z, i) => (
    <Zombie
      key={i}
      pos={z}
      stepStart={z.stepStart || lastStepRef.current}
      stepDuration={zombieSpeed}
    />
  ));
}

function HUD({ moves, gameOver, onReset }) {
  return (
    <div style={{ position: "absolute", top: 12, left: 12, padding: "8px 10px", background: "rgba(0,0,0,0.45)", color: "#fff", borderRadius: 8, fontFamily: "ui-sans-serif, system-ui, -apple-system" }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Zombie Survivor</div>
      <div>Moves: {moves}</div>
      <div>Controls: WASD / Arrows</div>
      {gameOver && (
        <div style={{ marginTop: 6 }}>
          <div style={{ color: "#f87171", fontWeight: 700 }}>Game Over!</div>
          <button onClick={onReset} style={{ marginTop: 6, padding: "6px 10px", borderRadius: 6, border: "1px solid #fff", background: "transparent", color: "#fff", cursor: "pointer" }}>Reset</button>
        </div>
      )}
    </div>
  );
}

// ------------------ GAME COMPONENT ------------------ //
// This component contains all the game's state and logic
function Game({ onGameOver, onResetGame, onMove, currentSpeed,moves  }) {
  const [grid, setGrid] = useState(() => generateGrid());
  
  const [playerPos, setPlayerPos] = useState(() => randomEmptyCell(grid));
  const [zombiePositions, setZombiePositions] = useState(() =>
    Array.from({ length: NUM_ZOMBIES }, () => {
      const cell = randomEmptyCell(grid);
      return { ...cell, stepStart: performance.now() };
    })
  );

  const [zombieSpeed, setZombieSpeed] = useState(ZOMBIE_STEP_INTERVAL_MS);

  useEffect(() => {
    if (moves > 0 && moves % 10 === 0) {
      setZombieSpeed(prevSpeed => Math.max(prevSpeed - 20, 40));
    }
  }, [moves]);

  useKeyboardMovement(grid, playerPos, setPlayerPos, onMove);


  useEffect(() => {
    for (const z of zombiePositions) {
      if (z.x === playerPos.x && z.y === playerPos.y) {
        onGameOver();
        break;
      }
    }
  }, [playerPos, zombiePositions, onGameOver]);

  return (
    <>
      <Floor />
      <Grid args={[GRID_SIZE * CELL, GRID_SIZE * CELL]} sectionColor="#1f2937" cellColor="#111827" fadeDistance={20} infiniteGrid={false} position={[0, 0.001, 0]} />
      <CellWalls grid={grid} />
      <Player pos={playerPos} />
      <ZombiesController
        grid={grid}
        playerPos={playerPos}
        zombiePositions={zombiePositions}
        setZombiePositions={setZombiePositions}
        zombieSpeed={zombieSpeed}
      />
    </>
  );
}

// ------------------ MAIN APP COMPONENT ------------------ //
export default function ZombieSurvivor() {
  //
  
  const [gameOver, setGameOver] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [moves, setMoves] = useState(0);
  const onGameOver = () => setGameOver(true);
  const onReset = () => {
    setGameOver(false);
    setMoves(0);
    setResetKey(prev => prev + 1); // Triggers a re-render of Game
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0f13", position: "relative" }}>
      <HUD moves={moves} gameOver={gameOver} onReset={onReset} />
      <Canvas shadows camera={{ position: [0, 20, 0], fov: 40, rotation: [-Math.PI / 2, 0, 0] }}>
        <ambientLight intensity={0.8} />
        <directionalLight castShadow position={[8, 14, 6]} intensity={0.7} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
        <group key={resetKey}>
          <Game onGameOver={onGameOver}  onMove={setMoves} moves={moves} />

        </group>
      </Canvas>
    </div>
  );
}