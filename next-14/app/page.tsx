"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  CharacterAnimationName,
  CharacterInstanceConfig,
} from "../components/character/character-instancer";
import { Character } from "../components/character";

const getRandomAnimation = () => {
  const animations = [
    CharacterAnimationName.RunPistol,
    CharacterAnimationName.Dead,
    CharacterAnimationName.Hit,
    CharacterAnimationName.Idle,
  ];
  return animations[Math.floor(Math.random() * animations.length)];
};

export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [5, 5, 5] }}>
        <ambientLight intensity={2} />
        {/* Add the insanced mesh */}
        <CharacterInstanceConfig />

        {/* Add mutliple instances */}
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 10 }, (_, col) => (
            <Character
              animationName={getRandomAnimation()}
              key={`${row}-${col}`}
              position={[row * 2 - 9, 0, col * 2 - 9]}
            />
          ))
        )}
        <OrbitControls />
      </Canvas>
    </div>
  );
}
