import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { GRID_SIZE, CELL, NUM_ZOMBIES, ZOMBIE_STEP_INTERVAL_MS, STEP_INTERVAL_MS, OBSTACLE_DENSITY, clamp } from "../../utils/constants";


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

function worldFromGrid(x, y) {
  const half = (GRID_SIZE * CELL) / 2;
  const wx = -half + x * CELL + CELL / 2;
  const wz = -half + y * CELL + CELL / 2;
  return [wx, 0.35, wz];
}

function Zombie({ pos }) {
  const [wx, wy, wz] = worldFromGrid(pos.x, pos.y);
  return (
    <mesh position={[wx, wy, wz]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  );
}

export function ZombiesController({ grid, zombiePositions, setZombiePositions, playerPos, zombieSpeed, isGameOver }) {
  const lastStepRef = useRef(performance.now());
  const loopRef = useRef(true);

  useEffect(() => {
    loopRef.current = !isGameOver;
  }, [isGameOver]);

  useFrame(() => {
    if (!loopRef.current) return;
    const now = performance.now();
    if (now - lastStepRef.current >= zombieSpeed) {
      lastStepRef.current = now;

      setZombiePositions((prev) =>
        prev.map((z) => {
          const { prev: p } = dijkstra(grid, [z.x, z.y], [playerPos.x, playerPos.y]);
          const path = reconstructPath(p, [z.x, z.y], [playerPos.x, playerPos.y]);
          if (path.length > 0) {
            const [nextX, nextY] = path[0];
            return { x: nextX, y: nextY };
          }
          return z;
        })
      );
    }
  });

  return (zombiePositions || []).map((z, i) => <Zombie key={i} pos={z} />);
}
