import {
  CharacterAnimationName,
  CharacterPosition,
} from "./character-instancer";

type GroupProps = React.ComponentProps<"group">;

export function Character(
  props: GroupProps & { animationName: CharacterAnimationName }
) {
  return (
    <group {...props}>
      <CharacterPosition animationName={props.animationName} />
    </group>
  );
}
