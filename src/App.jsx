import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import HUD from "./Components/HUD/HUD";
import Game from "./Components/Game/Game";
import "./App.css"; 
export default function App() {
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  const onGameOver = () => {
    setGameOver(true);
    
    setHighScore((prev) => (moves > prev ? moves : prev));
  };

  const onReset = () => {
    setGameOver(false);
    setMoves(0);
    setResetKey((k) => k + 1); 
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0f13", position: "relative" }}>
  <HUD moves={moves} highScore={highScore} gameOver={gameOver} onReset={onReset} />

  <Canvas
    key={resetKey}
    shadows
    style={{ width: "100%", height: "100%", display: "block" }} 
    camera={{
      position: [0, 20, 0],
      fov: 40,
      rotation: [-Math.PI / 2, 0, 0],
    }}
  >
    <ambientLight intensity={0.8} />
    <directionalLight
      castShadow
      position={[8, 14, 6]}
      intensity={0.7}
      shadow-mapSize-width={1024}
      shadow-mapSize-height={1024}
    />
    <Game
      onGameOver={onGameOver}
      setMoves={setMoves}
      moves={moves}
      isGameOver={gameOver}
    />
  </Canvas>
</div>

  );
}
