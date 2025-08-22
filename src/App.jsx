import React, { useState, useCallback, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import HUD from "./Components/HUD/HUD";
import Game from "./Components/Game/Game";
import "./App.css";

// Import your audio files
import bgMusicFile from "./assets/audio/674590__porrumentzio__8-bit-badinerie-ringtone.wav";
import gameOverSoundFile from "./assets/audio/336004__rudmer_rotteveel__sharp-explosion-3-of-5.wav";

export default function App() {
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameKey, setGameKey] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);

  // Refs for audio elements
  const bgMusicRef = useRef(null);
  const gameOverRef = useRef(null);

  // Play background music when game starts
  useEffect(() => {
    if (isAgreed && !gameOver) {
      bgMusicRef.current.volume = 0.3;
      bgMusicRef.current.loop = true;
      bgMusicRef.current.play().catch(() => {});
    }
  }, [isAgreed, gameOver]);

  const onGameOver = useCallback(() => {
    setGameOver(true);
    setHighScore((prev) => (moves > prev ? moves : prev));

    // Stop background music and play game over sound
    if (bgMusicRef.current) bgMusicRef.current.pause();
    if (gameOverRef.current) {
      gameOverRef.current.currentTime = 0;
      gameOverRef.current.play();
    }
  }, [moves]);

  const onReset = useCallback(() => {
    setGameOver(false);
    setMoves(0);
    setGameKey((prev) => prev + 1);

    // Restart background music after reset
    if (bgMusicRef.current) {
      bgMusicRef.current.currentTime = 0;
      bgMusicRef.current.play().catch(() => {});
    }
  }, []);

  const handleAgree = () => {
    setIsAgreed(true);
  };

  return (
    <div style={{ width: "100%", height: "100vh", background: "#0b0f13", position: "relative" }}>
      
      {/* License Agreement Modal */}
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
                Welcome to this game! All code, art, text, music, and other content remain the property of the creator. 
                Copying, redistributing, or selling any part of this game without explicit permission is strictly prohibited.
              </p>
              <p>
                This game is a work in progress 🛠️. Your feedback – including suggestions, bug reports, or general thoughts – is greatly appreciated.
              </p>
              <p>
                By clicking <b>Agree</b>, you acknowledge and accept these terms. Unauthorized use, redistribution, or modification may result in legal action.
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
          <div key={gameKey} style={{ width: "100%", height: "calc(100% - 20px)" }}>
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

          {/* Audio Elements */}
          <audio ref={bgMusicRef} src={bgMusicFile} />
          <audio ref={gameOverRef} src={gameOverSoundFile} />
          <div
  style={{
    position: "absolute",
    bottom: 5,
    width: "100%",
    textAlign: "center",
    color: "#00ff00",
    fontFamily: "'Press Start 2P', cursive",
    fontSize: "10px",
    textShadow: "1px 1px #000",
  }}
>
  © 2025 Debayan Ray. All rights reserved. Made with{" "}
  <span
    style={{
      color: "red",
      display: "inline-block",
      animation: "pulse 1s infinite alternate",
    }}
  >
    ❤️
  </span>{" "}
  by{" "}
  <a
    href="https://www.linkedin.com/in/debayan-ray-8a8540201/"
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "#00ff00", textDecoration: "underline" }}
  >
    me
  </a>

 
  <style>{`
    @keyframes pulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.3); }
    }
  `}</style>
</div>


        </>
      )}
    </div>
  );
}
