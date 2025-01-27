import { GroupProps } from "@react-three/fiber";
import {
  CharacterAnimationName,
  CharacterPosition,
} from "./character-instancer";

export function Character(
  props: GroupProps & { animationName: CharacterAnimationName }
) {
  return (
    <group {...props}>
      <CharacterPosition animationName={props.animationName} />
    </group>
  );
}
