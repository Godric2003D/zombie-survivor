import React from "react";

export default function HUD({ moves, highScore, gameOver, onReset }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        padding: "8px 10px",
        background: "rgba(0,0,0,0.45)",
        color: "#fff",
        borderRadius: 8,
        fontFamily: "ui-sans-serif, system-ui",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>Zombie Survivor</div>
      <div>Moves: {moves}</div>
      <div style={{ marginTop: 4 }}>High Score: {highScore}</div>
      <div>Controls: WASD / Arrows</div>
      {gameOver && (
        <div style={{ marginTop: 6 }}>
          <div style={{ color: "#f87171", fontWeight: 700 }}>Game Over!</div>
          <div style={{ color: "#f87171", fontWeight: 700 }}>Your score: {moves}</div>
          {moves >= highScore && (
            <div style={{ color: "#4ade80", fontWeight: 700 }}>New High Score!</div>
          )}
          <button
            onClick={onReset}
            style={{
              marginTop: 6,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #fff",
              background: "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
