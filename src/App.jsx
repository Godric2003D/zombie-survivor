import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import HUD from "./Components/HUD/HUD";
import Game from "./Components/Game/Game";
import "./App.css";

export default function App() {
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameKey, setGameKey] = useState(0); 
  const [isAgreed, setIsAgreed] = useState(false); // ✅ Track agreement

  const onGameOver = useCallback(() => {
    setGameOver(true);
    setHighScore((prev) => (moves > prev ? moves : prev));
  }, [moves]);

  const onReset = useCallback(() => {
    setGameOver(false);
    setMoves(0);
    setGameKey((prev) => prev + 1); 
    console.log(1, "Game reset");
  }, []);

  const handleAgree = () => {
    setIsAgreed(true);
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0f13", position: "relative" }}>
      
      {/* ✅ License Agreement Modal */}
      {!isAgreed && (
        <div style={{
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0, 0, 0, 0.8)",
  color: "#fff",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  flexDirection: "column"
}}>
  <div style={{
    background: "#1a1a1a",
    padding: "20px",
    borderRadius: "10px",
    width: "60%",
    maxHeight: "70%",
    overflowY: "auto",
    border: "1px solid #444"
  }}>
    <h2 style={{ textAlign: "center", marginBottom: "15px" }}>License Agreement</h2>
    <div style={{
      maxHeight: "300px",
      overflowY: "scroll",
      padding: "10px",
      background: "#0d0d0d",
      borderRadius: "8px",
      fontSize: "14px",
      lineHeight: "1.5"
    }}>
      <p>
        Yo! Welcome to this humble little game. First things first – by clicking <b>Agree</b>, you pinky promise 
        not to copy, redistribute, or sell this masterpiece (well, “work in progress” masterpiece 😅) without permission. 
        All rights stay with the creator (that’s me – Godric ✨). Unauthorized use = instant bad karma (and possibly legal trouble).
      </p>
      <p>
        Heads up – this game is still under construction 🛠️. Think of it like a cool beta test. I’m just a newbie in this dev world, 
        trying to make something fun for you all. Your feedback is literally gold – drop your thoughts, roast it, love it, 
        anything! 
      </p>
      <p>
        Play nice, don’t break stuff (please), and remember: if your device explodes, it’s not on me. 
        Enjoy responsibly, and let’s make this game epic together! By hitting Agree, you’re basically saying, 
        “Yeah, I’m cool with all this.” ❤️
      </p>
    </div>
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button
        onClick={handleAgree}
        style={{
          background: "#28a745",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        I Agree
      </button>
    </div>
  </div>
</div>


      )}

      
      {isAgreed && (
        <>
        
          <HUD moves={moves} highScore={highScore} gameOver={gameOver} onReset={onReset} />
          <div key={gameKey} style={{ width: "100%", height: "100%" }}>
            <Canvas
              key={gameKey}
              shadows
              style={{ width: "100%", height: "100%", display: "block" }}
              camera={{ position: [0, 20, 0], fov: 40, rotation: [-Math.PI / 2, 0, 0] }}
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
                key={gameKey}
                onGameOver={onGameOver}
                setMoves={setMoves}
                moves={moves}
                isGameOver={gameOver}
              />
              
            </Canvas>
          </div>
          
        </>
      )}
    </div>
  );
}
