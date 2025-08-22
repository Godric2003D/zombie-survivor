# 🧟‍♂️ Zombie Survivor

[![React](https://img.shields.io/badge/React-18-blue.svg?style=flat-square)](https://reactjs.org/) 
[![Three.js](https://img.shields.io/badge/Three.js-0.159.0-orange.svg?style=flat-square)](https://threejs.org/) 
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) 
[![Vercel](https://img.shields.io/badge/Deployment-Vercel-black.svg?style=flat-square)](https://vercel.com/) 


**Zombie Survivor** is a top-down 3D survival game developed with **React** and **React Three Fiber**. Navigate through a procedurally generated maze while evading a relentless zombie using pathfinding intelligence.

## 🌐 Play Online

Experience the game directly in your browser here:  
🔗 [zombie-survivor.vercel.app](https://zombie-survivor.vercel.app/)

## 🎮 Gameplay

- Survive as long as possible while navigating a dynamic maze.  
- Avoid zombies that actively chase you using **Dijkstra's Algorithm**.  
- The zombie calculates the shortest path to the player in real-time, creating a challenging survival experience.

## 🛠️ Tech Stack

- **Frontend:** React, React Three Fiber, Three.js  
- **3D Rendering:** @react-three/fiber, @react-three/drei  
- **Game Mechanics:** JavaScript, ES6 Modules  
- **Pathfinding:** Dijkstra's Algorithm (shortest-path chasing logic)  
- **Deployment:** Vercel  

## 🧠 Algorithm : Dijkstra

The zombie enemy intelligently calculates the shortest path to the player using **Dijkstra's Algorithm**:  

1. The maze is represented as a grid graph where each cell is a node.  
2. Each movement option (up, down, left, right) is an edge with equal weight.  
3. The algorithm computes the minimum distance from the zombie’s current position to the player's position.  
4. The zombie moves along the shortest path every game tick, ensuring it actively pursues the player.

---

Built with ❤️ by **Debayan Ray**  
