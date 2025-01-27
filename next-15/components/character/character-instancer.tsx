import { useGLTF } from "@react-three/drei";
import { createInstancedSkinnedMesh } from "../instanced-skinned-mesh";
import type * as THREE from "three";

const {
  InstancePosition: CharacterPosition,
  useInstancedMesh: useCharacterMesh,
  InstancedMesh: CharacterInstancedMesh,
} = createInstancedSkinnedMesh();

export enum CharacterAnimationName {
  RunPistol = "RunPistol",
  Dead = "Dead",
  Hit = "Hit",
  Idle = "Idle",
}

interface CharactersGLTF {
  nodes: {
    SM_Theo: THREE.SkinnedMesh;
  };
  animations: THREE.AnimationClip[];
}

export { CharacterPosition, useCharacterMesh };

export function CharacterInstanceConfig() {
  const { nodes, animations } = useGLTF(
    "https://assets.basehub.com/bca6c699/1c1acd8f77f614795ab909096d6c0f27/theoanimationa02.glb"
  ) as unknown as CharactersGLTF;

  return (
    <>
      <CharacterInstancedMesh
        mesh={nodes.SM_Theo}
        animations={animations}
        count={100}
      />
    </>
  );
}
