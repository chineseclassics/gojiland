import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

const FILES = [
  'tree_oak',
  'tree_default',
  'tree_fat',
  'tree_pineRoundA',
  'plant_bush',
  'plant_bushSmall',
  'plant_bushDetailed',
  'flower_redA',
  'flower_yellowA',
  'flower_purpleA',
  'rock_smallA',
  'rock_largeA',
  'grass',
  'grass_large',
  'mushroom_red',
  'mushroom_redGroup',
  'log',
  'stump_round',
  'books',
  'pottedPlant',
  'plantSmall1',
  'cardboardBoxClosed',
  'lampRoundTable',
  'mug'
] as const;

export type KenneyName = (typeof FILES)[number];

interface Template {
  object: THREE.Object3D;
  height: number;
}

const templates = new Map<string, Template>();
const shared = new Set<THREE.BufferGeometry | THREE.Material>();

export function isSharedKenney(resource: THREE.BufferGeometry | THREE.Material): boolean {
  return shared.has(resource);
}

export function hasKenney(name: KenneyName): boolean {
  return templates.has(name);
}

export async function loadKenney(baseUrl: string): Promise<void> {
  const loader = new GLTFLoader();
  const root = `${baseUrl}models/kenney/`;
  await Promise.all(
    FILES.map(async (name) => {
      try {
        const gltf = await loader.loadAsync(`${root}${name}.glb`);
        const object = gltf.scene;
        object.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.x -= center.x;
        object.position.z -= center.z;
        object.position.y -= box.min.y;
        object.updateMatrixWorld(true);
        const fitted = new THREE.Box3().setFromObject(object);
        object.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.castShadow = true;
          child.receiveShadow = true;
          shared.add(child.geometry);
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          for (const material of materials) shared.add(material);
        });
        templates.set(name, { object, height: Math.max(0.001, fitted.max.y - fitted.min.y) });
      } catch (error) {
        console.warn(`Kenney model missing: ${name}`, error);
      }
    })
  );
}

export function cloneKenney(name: KenneyName, height: number): THREE.Group | null {
  const template = templates.get(name);
  if (!template) return null;
  const group = new THREE.Group();
  const clone = template.object.clone(true);
  clone.scale.setScalar(height / template.height);
  group.add(clone);
  return group;
}
