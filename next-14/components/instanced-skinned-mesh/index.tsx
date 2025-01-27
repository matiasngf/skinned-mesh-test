import { GroupProps, useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useMemo, useRef } from "react";
import {
  AnimationClip,
  Group,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SkinnedMesh,
  Vector3,
} from "three";
import { create } from "zustand";
import { InstancedBatchedSkinnedMesh } from "./instanced-skinned-mesh";

interface InstancesProviderProps {
  mesh: SkinnedMesh | SkinnedMesh[];
  count: number;
  animations: AnimationClip[];
}

interface InstancedMeshStore {
  instancedMesh: InstancedBatchedSkinnedMesh | null;
}

export interface InstancePositionProps<T extends string> {
  animationId?: number;
  animationName?: string;
  timeSpeed?: number;
  initialTime?: number;
  geometryName?: T;
}

export const createInstancedSkinnedMesh = <T extends string>() => {
  /** Create a store to connect instances with positioning */
  const useInstancedMesh = create<InstancedMeshStore>(() => ({
    instancedMesh: null,
    geometryId: null,
  }));

  /** Create the instanced mesh that will be rendered */
  function InstancedMesh({ mesh, count, animations }: InstancesProviderProps) {
    // prevent re-render
    const refs = useRef({ mesh, animations });

    const instancedMesh = useMemo(() => {
      const { mesh, animations } = refs.current;
      let maxPos = 0;
      let maxIdx = 0;
      let material = new MeshStandardMaterial();

      if (Array.isArray(mesh)) {
        maxPos = mesh.reduce(
          (acc, m) => acc + m.geometry.attributes.position.count,
          0
        );
        maxIdx = mesh.reduce((acc, m) => acc + m.geometry.index.count, 0);
        for (const m of mesh) {
          if (m.material) {
            material = m.material as MeshStandardMaterial;
          }
        }
      } else {
        maxPos = mesh.geometry.attributes.position.count;
        maxIdx = mesh.geometry.index.count;
        material = mesh.material as MeshStandardMaterial;
      }

      const instancer = new InstancedBatchedSkinnedMesh({
        maxInstanceCount: count,
        maxVertexCount: maxPos,
        maxIndexCount: maxIdx,
        material,
      });

      instancer.frustumCulled = false;

      if (Array.isArray(mesh)) {
        mesh.forEach((m) => {
          instancer.addGeometry(m.geometry);
        });
      } else {
        instancer.addGeometry(mesh.geometry);
      }

      animations.forEach((animation) => {
        const skeleton = Array.isArray(mesh) ? mesh[0].skeleton : mesh.skeleton;
        instancer.addAnimation(skeleton, animation);
      });

      useInstancedMesh.setState({
        instancedMesh: instancer,
      });

      return instancer;
    }, [refs, count]);

    useFrame((_, delta) => {
      if (!instancedMesh) return;

      // play animations
      instancedMesh.update(delta);
    });

    return <primitive object={instancedMesh} />;
  }

  /** Create the component that will position the instances */
  const InstancePosition = forwardRef<
    Group,
    GroupProps & InstancePositionProps<T>
  >(function InstancePosition(
    {
      animationId,
      animationName,
      timeSpeed,
      initialTime,
      geometryName,
      ...props
    },
    ref
  ) {
    const instancedMesh = useInstancedMesh((state) => state.instancedMesh);

    const instanceId = useRef<number | null>(null);

    const { group, groupPosition, groupRotation, positionMatrix } = useMemo(
      () => ({
        group: new Group(),
        groupPosition: new Vector3(),
        groupRotation: new Quaternion(),
        positionMatrix: new Matrix4(),
      }),
      []
    );

    // attach instance to the mesh
    useEffect(() => {
      if (!instancedMesh) return;

      const geometryId = instancedMesh.getGeometryId(geometryName) || 0;

      let selectedAnimationId = 0;

      if (animationId !== undefined) {
        selectedAnimationId = animationId;
      } else if (animationName !== undefined) {
        selectedAnimationId = instancedMesh.clips.findIndex(
          (clip) => clip.name === animationName
        );
      }

      // Add instance to the instanced mesh
      instanceId.current = instancedMesh.createInstance(geometryId, {
        timeSpeed: timeSpeed ?? 1, // forward
        time: initialTime ?? 0, // start time
        animationId: selectedAnimationId,
      });

      return () => {
        instancedMesh.deleteInstance(instanceId.current);
        instanceId.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instancedMesh, geometryName]);

    // react to animation change
    useEffect(() => {
      if (!instancedMesh) return;
      if (instanceId.current === null) return;

      let selectedAnimationId = 0;

      if (animationId !== undefined) {
        selectedAnimationId = animationId;
      } else if (animationName !== undefined) {
        selectedAnimationId = instancedMesh.clips.findIndex(
          (clip) => clip.name === animationName
        );
      }

      instancedMesh.setInstanceData(instanceId.current, {
        time: initialTime ?? 0,
        animationId: selectedAnimationId,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instancedMesh, animationId, animationName]);

    // react to time speed change
    useEffect(() => {
      if (!instancedMesh) return;
      if (instanceId.current === null) return;

      instancedMesh.setInstanceData(instanceId.current, {
        timeSpeed: timeSpeed ?? 1,
      });
    }, [instancedMesh, timeSpeed]);

    useFrame(() => {
      // update instance position
      if (instanceId.current === null) return;
      if (!instancedMesh) return;
      group.getWorldQuaternion(groupRotation);
      positionMatrix.makeRotationFromQuaternion(groupRotation);
      // update position matrix using group position
      group.getWorldPosition(groupPosition);
      positionMatrix.setPosition(
        groupPosition.x,
        groupPosition.y,
        groupPosition.z
      );
      instancedMesh.setMatrixAt(instanceId.current, positionMatrix);
    });

    return <primitive object={group} ref={ref} {...props} />;
  });

  return { InstancedMesh, InstancePosition, useInstancedMesh };
};
