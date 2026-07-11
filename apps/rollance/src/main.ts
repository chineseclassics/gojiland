import './styles.css';
import RAPIER from '@dimforge/rapier3d-compat';
import * as THREE from 'three';

type PortalId = 'meadow' | 'sky' | 'home' | 'slime' | 'bonus';
type BodyKind = 'solid' | 'breakable' | 'pushball' | 'coin' | 'goldpack' | 'key' | 'finish' | 'checkpoint';

interface BodyRecord {
  kind: BodyKind;
  mesh: THREE.Object3D;
  body: RAPIER.RigidBody;
  collider: RAPIER.Collider;
  active: boolean;
  value?: number;
}

interface PlayerScore {
  name: string;
  score: number;
  coins: number;
  level: number;
}

interface Profile {
  coins: number;
  xp: number;
  level: number;
  skins: string[];
  hints: number;
}

interface PortalTheme {
  name: string;
  lesson: string;
  sky: number;
  ground: number;
  bridge: number;
  accent: number;
}

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('Missing #app root');

const themes: Record<PortalId, PortalTheme> = {
  meadow: {
    name: 'Portal 1: 白色起點',
    lesson: '第一關先練習慢慢推球。輕推會前進，放手後球會自己慢下來。',
    sky: 0xdbe9ee,
    ground: 0xe4eee1,
    bridge: 0xf7f4e8,
    accent: 0x9bc9a5
  },
  sky: {
    name: '雲朵橋',
    lesson: '雲橋教你控制速度：窄路前先放慢，轉彎會更穩。',
    sky: 0x90cfff,
    ground: 0xc6eef6,
    bridge: 0xe9f3f7,
    accent: 0x5fb8ff
  },
  home: {
    name: '玩具房',
    lesson: '日常物品不能打碎。杯子、書本和鉛筆盒要學會避開。',
    sky: 0xf5d4a6,
    ground: 0xc7865a,
    bridge: 0xf3d28f,
    accent: 0xe55d42
  },
  slime: {
    name: '史萊姆秘密地',
    lesson: '黏黏的路面會改變球的速度。先試探，再前進。',
    sky: 0x96e6c8,
    ground: 0x55ba92,
    bridge: 0x8fe174,
    accent: 0x7bdb4f
  },
  bonus: {
    name: 'Super Bonus',
    lesson: '獎勵關沒有陷阱，專心沿著金幣路線前進。',
    sky: 0xffda7a,
    ground: 0xf5b85b,
    bridge: 0xffee9a,
    accent: 0xffb72d
  }
};

const appState = {
  portal: 'meadow' as PortalId,
  lives: 5,
  coins: 0,
  xp: 0,
  level: 1,
  keys: 0,
  hints: 0,
  checkpointZ: 0,
  checkpoint: new THREE.Vector3(0, 2.2, 0),
  playerCount: 1,
  activePlayer: 0,
  scores: [] as PlayerScore[],
  inBonus: false,
  started: false,
  finished: false
};

let returnFromBonus: { portal: PortalId; lives: number; checkpoint: THREE.Vector3; position: THREE.Vector3; coins: number } | null = null;

const STORAGE_KEY = 'gojiland_rollance_profile_v1';
const profile = loadProfile();
appState.coins = profile.coins;
appState.xp = profile.xp;
appState.level = profile.level;
appState.hints = profile.hints;

root.innerHTML = `
  <main class="shell">
    <canvas id="game-canvas" class="game-canvas"></canvas>
    <section class="hud" aria-label="Rollance game">
      <div class="topbar">
        <div class="brand">
          <div class="brand-mark">R</div>
          <div class="brand-title">
            <strong>Rollance</strong>
            <span id="portal-name">Portal 1: 白色起點</span>
          </div>
        </div>
        <div class="stats" aria-live="polite">
          <div class="stat"><span>Lives</span><strong id="lives">5</strong></div>
          <div class="stat"><span>Coins</span><strong id="coins">0</strong></div>
          <div class="stat"><span>Ball Lv.</span><strong id="level">1</strong></div>
          <div class="stat"><span>Keys</span><strong id="keys">0</strong></div>
        </div>
      </div>

      <div id="message" class="center-message"></div>

      <div class="bottom-panel">
        <section class="mode-panel" aria-label="Local players">
          <h2>本機輪流人數</h2>
          <div class="players" id="players"></div>
          <div class="turn-list" id="turn-list"></div>
        </section>

        <div id="control-pad" class="control-pad" aria-label="Touch control pad">
          <div id="stick" class="stick">•</div>
        </div>

        <section class="education-panel">
          <h2>Portal Note</h2>
          <p id="lesson"></p>
          <button id="hint-button" class="action-button" type="button">使用提示</button>
        </section>
      </div>
    </section>

    <section id="start-overlay" class="overlay">
      <div class="start-card">
        <h1>Rollance</h1>
        <p>一顆小球在低多邊形玩具橋上慢慢冒險。先從白色起點練習手感，再收集 Portal 卡包、金幣和形狀觀察提示。</p>
        <div class="feature-grid">
          <div class="feature">1-5 人本機輪流模式</div>
          <div class="feature">金色卡包進入 Super Bonus</div>
          <div class="feature">無廣告、無帳號、只存本機進度</div>
        </div>
        <button id="start-button" class="primary-button" type="button">開始滾動</button>
      </div>
    </section>

    <section id="chest-overlay" class="overlay hidden">
      <div class="chest-card">
        <h2>鑰匙寶箱</h2>
        <p>你拿到鑰匙了。三個寶箱都可以打開，獎勵固定，不靠抽運氣。</p>
        <div class="chest-grid">
          <button class="chest" data-chest="coins" type="button">100 金幣</button>
          <button class="chest" data-chest="skin" type="button">Goji Berry 皮膚</button>
          <button class="chest" data-chest="hint" type="button">提示道具 +1</button>
        </div>
      </div>
    </section>
  </main>
`;

const canvas = requiredElement<HTMLCanvasElement>('#game-canvas');
const livesElement = requiredElement<HTMLElement>('#lives');
const coinsElement = requiredElement<HTMLElement>('#coins');
const levelElement = requiredElement<HTMLElement>('#level');
const keysElement = requiredElement<HTMLElement>('#keys');
const portalNameElement = requiredElement<HTMLElement>('#portal-name');
const lessonElement = requiredElement<HTMLElement>('#lesson');
const messageElement = requiredElement<HTMLElement>('#message');
const controlPad = requiredElement<HTMLElement>('#control-pad');
const stick = requiredElement<HTMLElement>('#stick');
const playersElement = requiredElement<HTMLElement>('#players');
const turnListElement = requiredElement<HTMLElement>('#turn-list');
const startOverlay = requiredElement<HTMLElement>('#start-overlay');
const chestOverlay = requiredElement<HTMLElement>('#chest-overlay');
const startButton = requiredElement<HTMLButtonElement>('#start-button');
const hintButton = requiredElement<HTMLButtonElement>('#hint-button');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 220);
const sun = new THREE.DirectionalLight(0xfff4d6, 3.2);
sun.position.set(-8, 16, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
scene.add(sun);
scene.add(new THREE.HemisphereLight(0xb8eaff, 0x6fa35d, 2.1));

const loaderGroup = new THREE.Group();
scene.add(loaderGroup);

const obstacleRecords: BodyRecord[] = [];
const decorativeObjects: THREE.Object3D[] = [];
let world: RAPIER.World;
let ballBody: RAPIER.RigidBody;
let ballMesh: THREE.Mesh;
let groundMaterial: THREE.MeshStandardMaterial;
let animationId = 0;
let lastFrame = performance.now();
let inputVector = new THREE.Vector2(0, 0);
let pointerId: number | null = null;
let messageTimer = 0;
let respawnCooldown = 0;

const CONTROL_FORCE_X = 5.8;
const CONTROL_FORCE_Z = 8.2;
const MAX_BALL_SPEED = 5.8;
const IDLE_BRAKE = 0.88;
const FALL_Y = -14;

await (RAPIER.init as unknown as (options: Record<string, never>) => Promise<void>)({});
world = new RAPIER.World({ x: 0, y: -10.6, z: 0 });

setupUI();
createWorld('meadow');
resize();
window.addEventListener('resize', resize);
animationId = requestAnimationFrame(tick);

function requiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing ${selector}`);
  return element;
}

function setupUI(): void {
  for (let index = 1; index <= 5; index += 1) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(index);
    button.addEventListener('click', () => {
      appState.playerCount = index;
      resetScores();
      renderPlayers();
      showMessage(`${index} 人本機輪流模式`);
    });
    playersElement.append(button);
  }
  resetScores();
  renderPlayers();

  controlPad.addEventListener('pointerdown', (event) => {
    pointerId = event.pointerId;
    controlPad.setPointerCapture(event.pointerId);
    updateStick(event);
  });
  controlPad.addEventListener('pointermove', (event) => {
    if (pointerId === event.pointerId) updateStick(event);
  });
  controlPad.addEventListener('pointerup', clearStick);
  controlPad.addEventListener('pointercancel', clearStick);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') inputVector.x = -1;
    if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') inputVector.x = 1;
    if (event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') inputVector.y = 1;
    if (event.key === 'ArrowDown' || event.key.toLowerCase() === 's') inputVector.y = -1;
  });
  window.addEventListener('keyup', () => {
    inputVector.set(0, 0);
    updateStickVisual(0, 0);
  });

  startButton.addEventListener('click', () => {
    appState.started = true;
    startOverlay.classList.add('hidden');
    showMessage('輕輕推動小球。放手後它會自己慢下來。');
  });

  hintButton.addEventListener('click', () => {
    if (appState.hints <= 0) {
      showMessage('先從寶箱拿到提示道具。');
      return;
    }
    appState.hints -= 1;
    saveProfile();
    showMessage('提示：輕推，不要一直推到底；窄橋前先放手減速。');
  });

  chestOverlay.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>('[data-chest]');
    if (!button) return;
    openChest(button.dataset.chest ?? '');
    button.disabled = true;
    button.textContent = `${button.textContent} ✓`;
    if ([...chestOverlay.querySelectorAll<HTMLButtonElement>('.chest')].every((chest) => chest.disabled)) {
      window.setTimeout(() => chestOverlay.classList.add('hidden'), 600);
    }
  });
}

function createWorld(portal: PortalId): void {
  appState.portal = portal;
  const theme = themes[portal];
  scene.background = new THREE.Color(theme.sky);
  scene.fog = new THREE.Fog(theme.sky, 36, 118);
  groundMaterial = new THREE.MeshStandardMaterial({ color: theme.ground, roughness: 0.94 });

  for (const record of obstacleRecords) {
    world.removeRigidBody(record.body);
  }
  obstacleRecords.length = 0;
  loaderGroup.clear();
  decorativeObjects.length = 0;

  createBridge(theme);
  createBall();
  createDecorations(theme);
  updatePortalCopy();
  updateHud();
}

function createBridge(theme: PortalTheme): void {
  const baseY = 0;
  addPlatform(0, baseY, 0, 11, 0.45, 20, theme.bridge);
  addPlatform(0, baseY, -20, 9, 0.45, 18, theme.bridge);
  addPlatform(-1.2, baseY, -38, 7.2, 0.45, 16, theme.bridge);
  addPlatform(0.9, baseY + 0.2, -55, 6.4, 0.45, 16, theme.bridge);
  addPlatform(0, baseY + 0.6, -74, 8.6, 0.45, 20, theme.bridge);

  addRamp(0, 0.26, -64, 6.8, 0.36, 9, -0.09, theme.bridge);
  addLowPolyRails();

  if (appState.portal === 'bonus') {
    for (let index = 0; index < 28; index += 1) {
      addSpecial('coin', Math.sin(index * 0.72) * 2, 1.05, -4 - index * 1.75, 0xffcf33, 10);
    }
    addSpecial('finish', 0, 1.12, -62, 0x67db73);
    return;
  }

  addBreakableBlock(-2.4, 0.82, -12);
  addBreakableBlock(0.4, 0.82, -15);
  addBreakableBlock(2.6, 0.82, -18);
  addSolidObject(-2.7, 0.95, -28, 'book');
  addSolidObject(2.6, 0.86, -32, 'cup');
  addPushBall(0, 1.08, -44);
  addBreakableBlock(-1.5, 1.1, -51);
  addCoinTrail(-2.2, -5, 6);
  addCoinTrail(2.4, -27, 5);
  addCoinTrail(0, -59, 8);
  addSpecial('checkpoint', 0, 0.82, -35, 0x57c1ff);
  addSpecial('goldpack', 1.9, 1.05, -42, 0xffcf33);
  addSpecial('key', -1.8, 1.04, -68, 0xffd447);
  addSpecial('finish', 0, 1.12, -84, 0x67db73);
}

function addPlatform(x: number, y: number, z: number, sx: number, sy: number, sz: number, color: number): void {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz, 1, 1, 1),
    new THREE.MeshStandardMaterial({ color, roughness: 0.82 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  loaderGroup.add(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.cuboid(sx / 2, sy / 2, sz / 2), body);
  obstacleRecords.push({ kind: 'solid', mesh, body, collider, active: true });
}

function addRamp(x: number, y: number, z: number, sx: number, sy: number, sz: number, rotationX: number, color: number): void {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), new THREE.MeshStandardMaterial({ color, roughness: 0.82 }));
  mesh.position.set(x, y, z);
  mesh.rotation.x = rotationX;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  loaderGroup.add(mesh);
  const body = world.createRigidBody(
    RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z).setRotation(new THREE.Quaternion().setFromEuler(mesh.rotation))
  );
  const collider = world.createCollider(RAPIER.ColliderDesc.cuboid(sx / 2, sy / 2, sz / 2), body);
  obstacleRecords.push({ kind: 'solid', mesh, body, collider, active: true });
}

function addLowPolyRails(): void {
  const railMaterial = new THREE.MeshStandardMaterial({ color: 0x8b623f, roughness: 0.9 });
  for (const z of [-10, -28, -48, -72]) {
    for (const x of [-5.6, 5.6]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 1.3, 5), railMaterial);
      post.position.set(x, 0.82, z);
      post.castShadow = true;
      loaderGroup.add(post);
      decorativeObjects.push(post);
    }
  }
}

function addBreakableBlock(x: number, y: number, z: number): void {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.1, 1.1, 1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x8be05c, roughness: 0.75 }));
  mesh.position.set(x, y, z);
  mesh.rotation.set(0.08, 0.22, -0.06);
  mesh.castShadow = true;
  loaderGroup.add(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.cuboid(0.55, 0.55, 0.55).setSensor(true), body);
  obstacleRecords.push({ kind: 'breakable', mesh, body, collider, active: true, value: 15 });
}

function addSolidObject(x: number, y: number, z: number, shape: 'book' | 'cup'): void {
  const group = new THREE.Group();
  let colliderDesc: RAPIER.ColliderDesc;
  if (shape === 'book') {
    const cover = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.36, 2.2), new THREE.MeshStandardMaterial({ color: 0x4b8ac9, roughness: 0.8 }));
    group.add(cover);
    colliderDesc = RAPIER.ColliderDesc.cuboid(0.8, 0.18, 1.1);
  } else {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.42, 1.2, 7), new THREE.MeshStandardMaterial({ color: 0xf3f1dc, roughness: 0.86 }));
    group.add(cup);
    colliderDesc = RAPIER.ColliderDesc.cylinder(0.6, 0.55);
  }
  group.position.set(x, y, z);
  group.castShadow = true;
  loaderGroup.add(group);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(colliderDesc, body);
  obstacleRecords.push({ kind: 'solid', mesh: group, body, collider, active: true });
}

function addPushBall(x: number, y: number, z: number): void {
  const mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.78, 0), new THREE.MeshStandardMaterial({ color: 0xff8a47, roughness: 0.7 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  loaderGroup.add(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y, z).setLinearDamping(1.2).setAngularDamping(1.1));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(0.78).setDensity(3.2).setFriction(1.5).setRestitution(0.12), body);
  obstacleRecords.push({ kind: 'pushball', mesh, body, collider, active: true });
}

function addCoinTrail(x: number, startZ: number, count: number): void {
  for (let index = 0; index < count; index += 1) {
    addSpecial('coin', x + Math.sin(index * 0.75) * 0.7, 1.02, startZ - index * 2.1, 0xffc93f, 10);
  }
}

function addSpecial(kind: BodyKind, x: number, y: number, z: number, color: number, value = 0): void {
  const geometry = kind === 'coin'
    ? new THREE.CylinderGeometry(0.33, 0.33, 0.12, 8)
    : kind === 'key'
      ? new THREE.TorusKnotGeometry(0.28, 0.08, 30, 6)
      : new THREE.DodecahedronGeometry(kind === 'goldpack' ? 0.64 : 0.72, 0);
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, roughness: 0.58, metalness: kind === 'coin' || kind === 'key' ? 0.18 : 0 }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  loaderGroup.add(mesh);
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z));
  const collider = world.createCollider(RAPIER.ColliderDesc.ball(kind === 'coin' ? 0.42 : 0.75).setSensor(true), body);
  obstacleRecords.push({ kind, mesh, body, collider, active: true, value });
}

function createBall(): void {
  if (ballBody) world.removeRigidBody(ballBody);
  if (ballMesh) loaderGroup.remove(ballMesh);

  ballMesh = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.62, 1),
    new THREE.MeshStandardMaterial({ color: 0xf3544c, roughness: 0.6, metalness: 0.02 })
  );
  ballMesh.castShadow = true;
  loaderGroup.add(ballMesh);
  ballBody = world.createRigidBody(
    RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(appState.checkpoint.x, appState.checkpoint.y, appState.checkpoint.z)
      .setLinearDamping(1.45)
      .setAngularDamping(1.25)
  );
  world.createCollider(RAPIER.ColliderDesc.ball(0.62).setDensity(1.1).setFriction(1.8).setRestitution(0.08), ballBody);
}

function createDecorations(theme: PortalTheme): void {
  const ground = new THREE.Mesh(new THREE.CylinderGeometry(52, 62, 2.4, 9), groundMaterial);
  ground.position.set(0, -8.5, -36);
  ground.receiveShadow = true;
  loaderGroup.add(ground);
  decorativeObjects.push(ground);

  for (let index = 0; index < 18; index += 1) {
    const x = (Math.random() - 0.5) * 70;
    const z = -Math.random() * 86 + 8;
    const scale = 0.65 + Math.random() * 1.35;
    const tree = makeLowPolyTree(theme.accent, scale);
    tree.position.set(x, -5.8 + Math.random() * 0.2, z);
    if (Math.abs(x) < 7) tree.position.x += x < 0 ? -9 : 9;
    loaderGroup.add(tree);
    decorativeObjects.push(tree);
  }
}

function makeLowPolyTree(accent: number, scale: number): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.2, 5), new THREE.MeshStandardMaterial({ color: 0x8b5738, roughness: 0.92 }));
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: accent, roughness: 0.86 }));
  trunk.position.y = 0.5 * scale;
  crown.position.y = 1.35 * scale;
  group.add(trunk, crown);
  group.scale.setScalar(scale);
  group.rotation.y = Math.random() * Math.PI;
  group.traverse((object: THREE.Object3D) => {
    if ('castShadow' in object) object.castShadow = true;
  });
  return group;
}

function updateStick(event: PointerEvent): void {
  const rect = controlPad.getBoundingClientRect();
  const dx = event.clientX - rect.left - rect.width / 2;
  const dy = event.clientY - rect.top - rect.height / 2;
  const radius = rect.width * 0.42;
  const length = Math.hypot(dx, dy);
  const limited = Math.min(length, radius);
  const angle = Math.atan2(dy, dx);
  const x = Math.cos(angle) * limited;
  const y = Math.sin(angle) * limited;
  const raw = new THREE.Vector2(x / radius, -y / radius);
  const strength = raw.length();
  if (strength < 0.14) {
    inputVector.set(0, 0);
  } else {
    const easedStrength = Math.min(1, ((strength - 0.14) / 0.86) ** 1.45);
    inputVector.copy(raw.normalize().multiplyScalar(easedStrength));
  }
  updateStickVisual(x, y);
}

function clearStick(event: PointerEvent): void {
  if (pointerId !== event.pointerId) return;
  pointerId = null;
  inputVector.set(0, 0);
  updateStickVisual(0, 0);
}

function updateStickVisual(x: number, y: number): void {
  stick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function tick(now: number): void {
  const delta = Math.min((now - lastFrame) / 1000, 1 / 24);
  lastFrame = now;
  if (appState.started && !appState.finished) {
    updateGame(delta);
  }
  renderScene(delta);
  animationId = requestAnimationFrame(tick);
}

function updateGame(delta: number): void {
  if (respawnCooldown > 0) respawnCooldown -= delta;

  const force = {
    x: inputVector.x * CONTROL_FORCE_X,
    y: 0,
    z: -inputVector.y * CONTROL_FORCE_Z
  };
  ballBody.addForce(force, true);
  stabilizeBall();
  world.step();

  const position = ballBody.translation();
  appState.checkpointZ = Math.min(appState.checkpointZ, position.z);

  if (position.y < FALL_Y && respawnCooldown <= 0) {
    loseLife('掉下橋了，回到檢查點，慢慢再試一次。');
  }

  for (const record of obstacleRecords) {
    if (!record.active) continue;
    syncRecord(record);
    if (!isNearBall(record, position)) continue;
    handleOverlap(record);
  }

  if (messageTimer > 0) {
    messageTimer -= delta;
    if (messageTimer <= 0) messageElement.classList.remove('show');
  }
}

function renderScene(delta: number): void {
  const position = ballBody.translation();
  ballMesh.position.set(position.x, position.y, position.z);
  const rotation = ballBody.rotation();
  ballMesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);

  for (const record of obstacleRecords) {
    syncRecord(record);
    if (record.kind === 'coin' || record.kind === 'goldpack' || record.kind === 'key' || record.kind === 'finish') {
      record.mesh.rotation.y += delta * 2.4;
      record.mesh.position.y += Math.sin(performance.now() * 0.002 + record.mesh.position.z) * 0.0015;
    }
  }

  const target = new THREE.Vector3(position.x * 0.45, Math.max(position.y + 7.6, 7.4), position.z + 11.5);
  camera.position.lerp(target, 0.085);
  camera.lookAt(position.x * 0.55, position.y + 0.7, position.z - 7);
  renderer.render(scene, camera);
}

function syncRecord(record: BodyRecord): void {
  if (!record.active) return;
  const translation = record.body.translation();
  record.mesh.position.set(translation.x, translation.y, translation.z);
  const rotation = record.body.rotation();
  record.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
}

function isNearBall(record: BodyRecord, ballPosition: RAPIER.Vector): boolean {
  const objectPosition = record.body.translation();
  const dx = objectPosition.x - ballPosition.x;
  const dy = objectPosition.y - ballPosition.y;
  const dz = objectPosition.z - ballPosition.z;
  return dx * dx + dy * dy + dz * dz < 2.25;
}

function handleOverlap(record: BodyRecord): void {
  if (record.kind === 'breakable') {
    collectRecord(record);
    addCoins(record.value ?? 15, '撞碎綠色方塊 +15');
  }
  if (record.kind === 'coin') {
    collectRecord(record);
    addCoins(record.value ?? 10, '+10 金幣');
  }
  if (record.kind === 'goldpack') {
    collectRecord(record);
    enterBonus();
  }
  if (record.kind === 'key') {
    collectRecord(record);
    appState.keys += 1;
    updateHud();
    showMessage('拿到鑰匙！過關後可以打開三個寶箱。');
  }
  if (record.kind === 'checkpoint') {
    appState.checkpoint.set(record.mesh.position.x, 2.2, record.mesh.position.z + 1.5);
    showMessage('檢查點已記錄。');
    collectRecord(record);
  }
  if (record.kind === 'finish') {
    finishRun();
  }
}

function collectRecord(record: BodyRecord): void {
  record.active = false;
  record.mesh.visible = false;
  world.removeRigidBody(record.body);
}

function addCoins(amount: number, message: string): void {
  appState.coins += amount;
  appState.xp += Math.max(1, Math.round(amount / 2));
  const nextLevel = Math.floor(appState.xp / 150) + 1;
  if (nextLevel > appState.level) {
    appState.level = nextLevel;
    showMessage(`球升到 Lv. ${nextLevel}！`);
  } else {
    showMessage(message);
  }
  appState.scores[appState.activePlayer]!.score += amount;
  appState.scores[appState.activePlayer]!.coins += amount;
  appState.scores[appState.activePlayer]!.level = appState.level;
  saveProfile();
  updateHud();
  renderPlayers();
}

function enterBonus(): void {
  const position = ballBody.translation();
  returnFromBonus = {
    portal: 'meadow',
    lives: appState.lives,
    checkpoint: appState.checkpoint.clone(),
    position: new THREE.Vector3(position.x, position.y, position.z),
    coins: appState.coins
  };
  appState.inBonus = true;
  showMessage('金色卡包：Super Bonus 開始！');
  createWorld('bonus');
  appState.coins = returnFromBonus.coins;
  ballBody.setTranslation({ x: 0, y: 2.2, z: 0 }, true);
  ballBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
}

function finishRun(): void {
  if (appState.finished) return;
  if (appState.inBonus) {
    exitBonus();
    return;
  }
  appState.finished = true;
  appState.started = false;
  appState.inBonus = false;
  appState.scores[appState.activePlayer]!.score += appState.lives * 25;
  saveProfile();
  updateHud();
  renderPlayers();
  showMessage('完成關卡！');
  if (appState.keys > 0) {
    appState.keys -= 1;
    updateHud();
    for (const chest of chestOverlay.querySelectorAll<HTMLButtonElement>('.chest')) {
      chest.disabled = false;
      if (chest.dataset.chest === 'coins') chest.textContent = '100 金幣';
      if (chest.dataset.chest === 'skin') chest.textContent = 'Goji Berry 皮膚';
      if (chest.dataset.chest === 'hint') chest.textContent = '提示道具 +1';
    }
    chestOverlay.classList.remove('hidden');
  }
  window.setTimeout(nextTurnOrRestart, 1200);
}

function exitBonus(): void {
  const bonusCoins = appState.coins;
  const returnState = returnFromBonus;
  appState.inBonus = false;
  createWorld(returnState?.portal ?? 'meadow');
  appState.coins = bonusCoins;
  appState.lives = returnState?.lives ?? appState.lives;
  appState.checkpoint.copy(returnState?.checkpoint ?? new THREE.Vector3(0, 2.2, 0));
  const returnPosition = returnState?.position ?? appState.checkpoint;
  ballBody.setTranslation({ x: returnPosition.x, y: Math.max(2.2, returnPosition.y + 0.3), z: returnPosition.z - 3 }, true);
  ballBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
  returnFromBonus = null;
  saveProfile();
  updateHud();
  showMessage('Super Bonus 完成，回到原本關卡。');
}

function nextTurnOrRestart(): void {
  appState.activePlayer = (appState.activePlayer + 1) % appState.playerCount;
  appState.finished = false;
  appState.started = true;
  appState.lives = 5;
  appState.checkpoint.set(0, 2.2, 0);
  createWorld('meadow');
  showMessage(`輪到玩家 ${appState.activePlayer + 1}`);
}

function loseLife(message: string): void {
  appState.lives -= 1;
  if (appState.lives <= 0) {
    appState.lives = 5;
    if (appState.playerCount > 1) {
      appState.activePlayer = (appState.activePlayer + 1) % appState.playerCount;
      showMessage(`輪到玩家 ${appState.activePlayer + 1}`);
    } else {
      showMessage('回到檢查點，慢慢再試一次。');
    }
  } else {
    showMessage(message);
  }
  resetBallToCheckpoint();
  respawnCooldown = 1.1;
  updateHud();
  renderPlayers();
}

function resetBallToCheckpoint(): void {
  ballBody.setTranslation({ x: appState.checkpoint.x, y: appState.checkpoint.y, z: appState.checkpoint.z }, true);
  ballBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
  ballBody.setAngvel({ x: 0, y: 0, z: 0 }, true);
}

function stabilizeBall(): void {
  const velocity = ballBody.linvel();
  let nextX = velocity.x;
  let nextZ = velocity.z;

  if (inputVector.lengthSq() < 0.01) {
    nextX *= IDLE_BRAKE;
    nextZ *= IDLE_BRAKE;
  }

  const horizontalSpeed = Math.hypot(nextX, nextZ);
  if (horizontalSpeed > MAX_BALL_SPEED) {
    const scale = MAX_BALL_SPEED / horizontalSpeed;
    nextX *= scale;
    nextZ *= scale;
  }

  if (nextX !== velocity.x || nextZ !== velocity.z) {
    ballBody.setLinvel({ x: nextX, y: velocity.y, z: nextZ }, true);
  }
}

function openChest(kind: string): void {
  if (kind === 'coins') addCoins(100, '寶箱：100 金幣');
  if (kind === 'skin') {
    if (!profile.skins.includes('goji-berry')) profile.skins.push('goji-berry');
    ballMesh.material = new THREE.MeshStandardMaterial({ color: 0xc72e5b, roughness: 0.55 });
    showMessage('新皮膚：Goji Berry');
  }
  if (kind === 'hint') {
    appState.hints += 1;
    showMessage('提示道具 +1');
  }
  saveProfile();
}

function resetScores(): void {
  appState.scores = Array.from({ length: appState.playerCount }, (_, index) => ({
    name: `P${index + 1}`,
    score: 0,
    coins: 0,
    level: appState.level
  }));
  appState.activePlayer = 0;
}

function renderPlayers(): void {
  playersElement.querySelectorAll('button').forEach((button, index) => {
    button.classList.toggle('active', index + 1 === appState.playerCount);
  });
  turnListElement.innerHTML = appState.scores
    .map((score, index) => `
      <div class="turn-row ${index === appState.activePlayer ? 'active' : ''}">
        <span>${score.name}</span>
        <span>${score.score}</span>
      </div>
    `)
    .join('');
}

function updatePortalCopy(): void {
  const theme = themes[appState.portal];
  portalNameElement.textContent = theme.name;
  lessonElement.textContent = theme.lesson;
}

function updateHud(): void {
  livesElement.textContent = String(appState.lives);
  coinsElement.textContent = String(appState.coins);
  levelElement.textContent = String(appState.level);
  keysElement.textContent = String(appState.keys);
  updatePortalCopy();
}

function showMessage(text: string): void {
  messageElement.textContent = text;
  messageElement.classList.add('show');
  messageTimer = 2.4;
}

function loadProfile(): Profile {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Profile>;
    return {
      coins: Number(stored.coins) || 0,
      xp: Number(stored.xp) || 0,
      level: Math.max(1, Number(stored.level) || 1),
      skins: Array.isArray(stored.skins) ? stored.skins : [],
      hints: Number(stored.hints) || 0
    };
  } catch {
    return { coins: 0, xp: 0, level: 1, skins: [], hints: 0 };
  }
}

function saveProfile(): void {
  profile.coins = appState.coins;
  profile.xp = appState.xp;
  profile.level = appState.level;
  profile.hints = appState.hints;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function resize(): void {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener('beforeunload', () => {
  cancelAnimationFrame(animationId);
});
